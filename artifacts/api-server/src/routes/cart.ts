import { Router } from "express";
import { db, cartItemsTable, cartCouponsTable, productsTable, couponsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

async function buildCart(userId: number) {
  const items = await db.select().from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const [couponRow] = await db.select().from(cartCouponsTable).where(eq(cartCouponsTable.userId, userId)).limit(1);

  const cartItems = items.map(row => ({
    id: row.cart_items.id,
    product: formatProduct(row.products!),
    price: parseFloat(row.cart_items.price),
  }));

  const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
  let discount = 0;
  let couponCode: string | null = null;

  if (couponRow) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponRow.couponCode)).limit(1);
    if (coupon && coupon.isActive) {
      couponCode = coupon.code;
      if (coupon.type === "percentage") {
        discount = subtotal * (parseFloat(coupon.value) / 100);
      } else {
        discount = Math.min(parseFloat(coupon.value), subtotal);
      }
    }
  }

  return { items: cartItems, subtotal, discount, total: subtotal - discount, couponCode, couponDiscount: discount };
}

function formatProduct(p: any) {
  if (!p) return null;
  return { id: p.id, name: p.name, artist: p.artist, genre: p.genre, coverUrl: p.coverUrl, price: parseFloat(p.price), promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null, bpm: p.bpm, tonality: p.tonality, duration: p.duration, quality: p.quality, status: p.status, isFeatured: p.isFeatured, creditsRequired: p.creditsRequired, availableForSubscription: p.availableForSubscription, totalSales: p.totalSales, createdAt: p.createdAt };
}

// GET /cart
router.get("/cart", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  res.json(await buildCart(userId));
});

// POST /cart/items
router.post("/cart/items", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { productId } = req.body;
  if (!productId) { res.status(400).json({ error: "productId required" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product || !product.availableForSale) { res.status(404).json({ error: "Product not available" }); return; }

  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  if (!existing.length) {
    await db.insert(cartItemsTable).values({ userId, productId, price: product.price });
  }

  res.json(await buildCart(userId));
});

// DELETE /cart/items/:itemId
router.delete("/cart/items/:itemId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, parseInt(req.params.itemId as string)), eq(cartItemsTable.userId, userId)));
  res.json(await buildCart(userId));
});

// POST /cart/coupon
router.post("/cart/coupon", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { code } = req.body;
  if (!code) { res.status(400).json({ error: "code required" }); return; }

  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code.toUpperCase())).limit(1);
  if (!coupon || !coupon.isActive) { res.status(400).json({ error: "Cupom inválido ou expirado" }); return; }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.status(400).json({ error: "Cupom expirado" }); return; }

  await db.delete(cartCouponsTable).where(eq(cartCouponsTable.userId, userId));
  await db.insert(cartCouponsTable).values({ userId, couponCode: coupon.code });

  res.json(await buildCart(userId));
});

// POST /cart/coupon/remove
router.post("/cart/coupon/remove", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(cartCouponsTable).where(eq(cartCouponsTable.userId, userId));
  res.json(await buildCart(userId));
});

export default router;
