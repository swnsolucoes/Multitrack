import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, cartCouponsTable, productsTable, downloadGrantsTable, couponsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatOrder(o: any, itemCount = 0) {
  return {
    id: o.id,
    status: o.status,
    paymentMethod: o.paymentMethod,
    subtotal: parseFloat(o.subtotal),
    discount: parseFloat(o.discount),
    total: parseFloat(o.total),
    couponCode: o.couponCode,
    itemCount,
    createdAt: o.createdAt,
  };
}

// GET /orders
router.get("/orders", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));

  const result = await Promise.all(orders.map(async (o) => {
    const [cnt] = await db.select({ count: sql<number>`count(*)::int` })
      .from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
    return formatOrder(o, cnt?.count || 0);
  }));
  res.json(result);
});

// POST /orders
router.post("/orders", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { paymentMethod, couponCode } = req.body;
  if (!paymentMethod) { res.status(400).json({ error: "paymentMethod required" }); return; }

  const cartItems = await db.select().from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (!cartItems.length) { res.status(400).json({ error: "Cart is empty" }); return; }

  const subtotal = cartItems.reduce((s, i) => s + parseFloat(i.cart_items.price), 0);
  let discount = 0;
  let appliedCoupon = couponCode;

  const [cartCoupon] = await db.select().from(cartCouponsTable).where(eq(cartCouponsTable.userId, userId)).limit(1);
  const couponCodeToUse = appliedCoupon || cartCoupon?.couponCode;

  if (couponCodeToUse) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCodeToUse)).limit(1);
    if (coupon && coupon.isActive) {
      if (coupon.type === "percentage") discount = subtotal * (parseFloat(coupon.value) / 100);
      else discount = Math.min(parseFloat(coupon.value), subtotal);
    }
  }

  const total = subtotal - discount;
  const pixCode = paymentMethod === "pix" ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2)}520400005303986540${total.toFixed(2)}5802BR5913MultiTrack Hub6009Sao Paulo62070503***63041234` : null;

  const [order] = await db.insert(ordersTable).values({
    userId,
    status: "paid",
    paymentMethod,
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2),
    couponCode: couponCodeToUse || null,
    pixCode,
  }).returning();

  const items = await Promise.all(cartItems.map(async (ci) => {
    const [item] = await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: ci.cart_items.productId,
      price: ci.cart_items.price,
    }).returning();

    await db.insert(downloadGrantsTable).values({
      userId,
      productId: ci.cart_items.productId,
      orderItemId: item.id,
      source: "purchase",
    });

    if (ci.products) {
      await db.update(productsTable)
        .set({ totalSales: sql`${productsTable.totalSales} + 1` })
        .where(eq(productsTable.id, ci.cart_items.productId));
    }
    return item;
  }));

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  await db.delete(cartCouponsTable).where(eq(cartCouponsTable.userId, userId));

  res.status(201).json(formatOrder(order, items.length));
});

// GET /orders/:id
router.get("/orders/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, parseInt(req.params.id)), eq(ordersTable.userId, userId))).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const items = await db.select().from(orderItemsTable)
    .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .leftJoin(downloadGrantsTable, eq(downloadGrantsTable.orderItemId, orderItemsTable.id))
    .where(eq(orderItemsTable.orderId, order.id));

  const formattedItems = items.map(row => ({
    id: row.order_items.id,
    product: row.products ? { id: row.products.id, name: row.products.name, artist: row.products.artist, genre: row.products.genre, coverUrl: row.products.coverUrl, price: parseFloat(row.products.price), promoPrice: null, bpm: row.products.bpm, tonality: row.products.tonality, duration: row.products.duration, quality: row.products.quality, status: row.products.status, isFeatured: row.products.isFeatured, creditsRequired: row.products.creditsRequired, availableForSubscription: row.products.availableForSubscription, totalSales: row.products.totalSales, createdAt: row.products.createdAt } : null,
    price: parseFloat(row.order_items.price),
    downloadGrant: row.download_grants ? { id: row.download_grants.id, productId: row.download_grants.productId, productName: row.products?.name || "", productArtist: row.products?.artist || "", coverUrl: row.products?.coverUrl || null, source: row.download_grants.source, downloadCount: row.download_grants.downloadCount, lastDownloadAt: row.download_grants.lastDownloadAt, createdAt: row.download_grants.createdAt } : null,
  }));

  res.json({ ...formatOrder(order, formattedItems.length), items: formattedItems, user: { id: userId, name: "", email: "", role: "buyer", isBlocked: false, ordersCount: 0, totalSpent: 0, createdAt: order.createdAt } });
});

// POST /orders/:id/pay
router.post("/orders/:id/pay", requireAuth, async (req, res) => {
  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, parseInt(req.params.id)), eq(ordersTable.userId, (req as any).user.id))).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, order.id));
  res.json({ orderId: order.id, status: "paid", pixCode: order.pixCode, pixQrCode: null, checkoutUrl: null });
});

export default router;
