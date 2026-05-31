import { Router } from "express";
import { db, productsTable, ordersTable, orderItemsTable, usersTable, subscriptionsTable, plansTable, rateiosTable, rateioParticipantsTable, couponsTable, creditLedgerTable, downloadGrantsTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql, and, like, ilike } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/auth";

const router = Router();

function formatProduct(p: any) {
  return { id: p.id, name: p.name, artist: p.artist, genre: p.genre, coverUrl: p.coverUrl, price: parseFloat(p.price), promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null, bpm: p.bpm, tonality: p.tonality, duration: p.duration, quality: p.quality, status: p.status, isFeatured: p.isFeatured, creditsRequired: p.creditsRequired, availableForSubscription: p.availableForSubscription, totalSales: p.totalSales, createdAt: p.createdAt };
}

// GET /admin/dashboard
router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  const { period = "30d" } = req.query;

  const [totalRevenue] = await db.select({ sum: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(eq(ordersTable.status, "paid"));
  const [mrr] = await db.select({ count: sql<number>`count(*)::int` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [totalOrders] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [premiumUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "premium"));
  const [totalDownloads] = await db.select({ sum: sql<number>`coalesce(sum(download_count), 0)` }).from(downloadGrantsTable);
  const [avgOrder] = await db.select({ avg: sql<number>`coalesce(avg(total::numeric), 0)` }).from(ordersTable).where(eq(ordersTable.status, "paid"));
  const [openRateios] = await db.select({ count: sql<number>`count(*)::int` }).from(rateiosTable).where(eq(rateiosTable.status, "open"));
  const [completedRateios] = await db.select({ count: sql<number>`count(*)::int` }).from(rateiosTable).where(eq(rateiosTable.status, "completed"));
  const [cancelledRateios] = await db.select({ count: sql<number>`count(*)::int` }).from(rateiosTable).where(eq(rateiosTable.status, "cancelled"));

  const topProducts = await db.select().from(productsTable).orderBy(desc(productsTable.totalSales)).limit(5);
  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);

  const recentOrdersFormatted = await Promise.all(recentOrders.map(async (o) => {
    const [cnt] = await db.select({ count: sql<number>`count(*)::int` }).from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
    return { id: o.id, status: o.status, paymentMethod: o.paymentMethod, subtotal: parseFloat(o.subtotal), discount: parseFloat(o.discount), total: parseFloat(o.total), couponCode: o.couponCode, itemCount: cnt?.count || 0, createdAt: o.createdAt };
  }));

  res.json({
    totalRevenue: parseFloat(String(totalRevenue?.sum || 0)),
    revenueByChannel: { singlePurchase: parseFloat(String(totalRevenue?.sum || 0)) * 0.7, subscription: parseFloat(String(totalRevenue?.sum || 0)) * 0.2, bundle: parseFloat(String(totalRevenue?.sum || 0)) * 0.05, rateio: parseFloat(String(totalRevenue?.sum || 0)) * 0.05 },
    mrr: (mrr?.count || 0) * 9.9,
    churnRate: 0.05,
    averageOrderValue: parseFloat(String(avgOrder?.avg || 0)),
    totalOrders: totalOrders?.count || 0,
    totalUsers: totalUsers?.count || 0,
    premiumUsers: premiumUsers?.count || 0,
    totalDownloads: parseInt(String(totalDownloads?.sum || 0)),
    topProducts: topProducts.map(p => ({ id: p.id, name: p.name, artist: p.artist, sales: p.totalSales, revenue: p.totalSales * parseFloat(p.price) })),
    rateioStats: { open: openRateios?.count || 0, completed: completedRateios?.count || 0, cancelled: cancelledRateios?.count || 0 },
    recentOrders: recentOrdersFormatted,
  });
});

// GET /admin/products
router.get("/admin/products", requireAdmin, async (req, res) => {
  const { status, q, page = "1" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = 20;
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [];
  if (status) conditions.push(eq(productsTable.status, status as any));
  if (q) conditions.push(ilike(productsTable.name, `%${q}%`));

  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(conditions.length ? and(...conditions) : undefined);
  const products = await db.select().from(productsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(productsTable.createdAt)).limit(limitNum).offset(offset);

  res.json({ products: products.map(formatProduct), total: total?.count || 0, page: pageNum, limit: limitNum });
});

// POST /admin/products
router.post("/admin/products", requireAdmin, async (req, res) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    artist: body.artist,
    genre: body.genre,
    categoryId: body.categoryId || null,
    tonality: body.tonality || null,
    bpm: body.bpm || null,
    duration: body.duration || null,
    description: body.description || "",
    tracks: body.tracks || [],
    formats: body.formats || [],
    fileSizeMb: body.fileSizeMb ? String(body.fileSizeMb) : null,
    coverUrl: body.coverUrl || null,
    previewAudioUrl: body.previewAudioUrl || null,
    videoUrl: body.videoUrl || null,
    tags: body.tags || [],
    licenceSummary: body.licenceSummary || null,
    price: String(body.price),
    promoPrice: body.promoPrice ? String(body.promoPrice) : null,
    quality: body.quality || "standard",
    status: body.status || "draft",
    isFeatured: body.isFeatured || false,
    availableForSale: body.availableForSale !== false,
    availableForSubscription: body.availableForSubscription !== false,
    creditsRequired: body.creditsRequired || 1,
  }).returning();

  const cat = product.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1) : [];
  res.status(201).json({ ...formatProduct(product), description: product.description, tracks: product.tracks, formats: product.formats, fileSizeMb: product.fileSizeMb ? parseFloat(product.fileSizeMb) : null, previewAudioUrl: product.previewAudioUrl, videoUrl: product.videoUrl, tags: product.tags, licenceSummary: product.licenceSummary, category: cat[0] ? { ...cat[0], productCount: 0 } : null, averageRating: null, reviewCount: 0 });
});

// PUT /admin/products/:id
router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const body = req.body;
  const [product] = await db.update(productsTable).set({
    name: body.name, artist: body.artist, genre: body.genre, categoryId: body.categoryId || null,
    tonality: body.tonality || null, bpm: body.bpm || null, duration: body.duration || null,
    description: body.description || "", tracks: body.tracks || [], formats: body.formats || [],
    fileSizeMb: body.fileSizeMb ? String(body.fileSizeMb) : null, coverUrl: body.coverUrl || null,
    previewAudioUrl: body.previewAudioUrl || null, videoUrl: body.videoUrl || null, tags: body.tags || [],
    licenceSummary: body.licenceSummary || null, price: String(body.price),
    promoPrice: body.promoPrice ? String(body.promoPrice) : null, quality: body.quality || "standard",
    status: body.status || "draft", isFeatured: body.isFeatured || false,
    availableForSale: body.availableForSale !== false, availableForSubscription: body.availableForSubscription !== false,
    creditsRequired: body.creditsRequired || 1, updatedAt: new Date(),
  }).where(eq(productsTable.id, id)).returning();
  res.json({ ...formatProduct(product), description: product.description, tracks: product.tracks, formats: product.formats, fileSizeMb: product.fileSizeMb ? parseFloat(product.fileSizeMb) : null, previewAudioUrl: product.previewAudioUrl, videoUrl: product.videoUrl, tags: product.tags, licenceSummary: product.licenceSummary, category: null, averageRating: null, reviewCount: 0 });
});

// DELETE /admin/products/:id
router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  await db.update(productsTable).set({ status: "inactive" }).where(eq(productsTable.id, parseInt(req.params.id as string)));
  res.json({ message: "Product deactivated" });
});

// GET /admin/orders
router.get("/admin/orders", requireAdmin, async (req, res) => {
  const { status, q, page = "1" } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (status) conditions.push(eq(ordersTable.status, status as any));

  const orders = await db.select().from(ordersTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(ordersTable.createdAt)).limit(50);
  const result = await Promise.all(orders.map(async (o) => {
    const [cnt] = await db.select({ count: sql<number>`count(*)::int` }).from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
    return { id: o.id, status: o.status, paymentMethod: o.paymentMethod, subtotal: parseFloat(o.subtotal), discount: parseFloat(o.discount), total: parseFloat(o.total), couponCode: o.couponCode, itemCount: cnt?.count || 0, createdAt: o.createdAt };
  }));
  res.json(result);
});

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req, res) => {
  const { role, q, page = "1" } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (role) conditions.push(eq(usersTable.role, role as any));
  if (q) conditions.push(ilike(usersTable.name, `%${q}%`));

  const users = await db.select().from(usersTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(usersTable.createdAt)).limit(50);
  const result = await Promise.all(users.map(async (u) => {
    const [orders] = await db.select({ count: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(and(eq(ordersTable.userId, u.id), eq(ordersTable.status, "paid")));
    return { id: u.id, name: u.name, email: u.email, role: u.role, isBlocked: u.isBlocked, ordersCount: orders?.count || 0, totalSpent: parseFloat(String(orders?.sum || 0)), createdAt: u.createdAt };
  }));
  res.json(result);
});

// GET /admin/users/:id
router.get("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [orders] = await db.select({ count: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(and(eq(ordersTable.userId, id), eq(ordersTable.status, "paid")));
  const recentOrders = await db.select().from(ordersTable).where(eq(ordersTable.userId, id)).orderBy(desc(ordersTable.createdAt)).limit(5);
  const [sub] = await db.select().from(subscriptionsTable).leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id)).where(eq(subscriptionsTable.userId, id)).limit(1);

  const ledger = await db.select().from(creditLedgerTable).where(eq(creditLedgerTable.userId, id));
  const balance = ledger.reduce((sum, e) => e.type === "earned" || e.type === "refunded" || e.type === "adjusted" ? sum + e.amount : sum - Math.abs(e.amount), 0);

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked, ordersCount: orders?.count || 0, totalSpent: parseFloat(String(orders?.sum || 0)), createdAt: user.createdAt, notes: user.notes, creditBalance: Math.max(0, balance), subscription: sub ? { id: sub.subscriptions.id, planId: sub.subscriptions.planId, planName: sub.plans?.name || "", status: sub.subscriptions.status, currentPeriodStart: sub.subscriptions.currentPeriodStart, currentPeriodEnd: sub.subscriptions.currentPeriodEnd, cancelAtPeriodEnd: sub.subscriptions.cancelAtPeriodEnd, createdAt: sub.subscriptions.createdAt } : null, recentOrders: recentOrders.map(o => ({ id: o.id, status: o.status, paymentMethod: o.paymentMethod, subtotal: parseFloat(o.subtotal), discount: parseFloat(o.discount), total: parseFloat(o.total), couponCode: o.couponCode, itemCount: 0, createdAt: o.createdAt })) });
});

// PATCH /admin/users/:id
router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { role, isBlocked, notes } = req.body;
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
  if (notes !== undefined) updateData.notes = notes;
  updateData.updatedAt = new Date();

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  const [orders] = await db.select({ count: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(and(eq(ordersTable.userId, id), eq(ordersTable.status, "paid")));
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked, ordersCount: orders?.count || 0, totalSpent: parseFloat(String(orders?.sum || 0)), createdAt: user.createdAt });
});

// GET /admin/rateios
router.get("/admin/rateios", requireAdmin, async (req, res) => {
  const rateios = await db.select().from(rateiosTable).orderBy(desc(rateiosTable.createdAt));
  const result = await Promise.all(rateios.map(async (r) => {
    const [cnt] = await db.select({ count: sql<number>`count(*)::int` }).from(rateioParticipantsTable).where(eq(rateioParticipantsTable.rateioId, r.id));
    return { id: r.id, songName: r.songName, artist: r.artist, genre: r.genre, status: r.status, targetAmount: r.targetAmount ? parseFloat(r.targetAmount) : null, amountPerParticipant: r.amountPerParticipant ? parseFloat(r.amountPerParticipant) : null, minParticipants: r.minParticipants, currentParticipants: cnt?.count || 0, minPercentage: r.minPercentage ? parseFloat(r.minPercentage) : null, deadline: r.deadline, coverUrl: r.coverUrl, isParticipating: false, createdAt: r.createdAt };
  }));
  res.json(result);
});

// PATCH /admin/rateios/:id/status
router.patch("/admin/rateios/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { status, targetAmount, amountPerParticipant, minParticipants, minPercentage, deadline, cancelReason } = req.body;

  const updateData: any = { status, updatedAt: new Date() };
  if (targetAmount !== undefined) updateData.targetAmount = String(targetAmount);
  if (amountPerParticipant !== undefined) updateData.amountPerParticipant = String(amountPerParticipant);
  if (minParticipants !== undefined) updateData.minParticipants = minParticipants;
  if (minPercentage !== undefined) updateData.minPercentage = String(minPercentage);
  if (deadline !== undefined) updateData.deadline = new Date(deadline);
  if (cancelReason !== undefined) updateData.cancelReason = cancelReason;

  const [r] = await db.update(rateiosTable).set(updateData).where(eq(rateiosTable.id, id)).returning();
  const [cnt] = await db.select({ count: sql<number>`count(*)::int` }).from(rateioParticipantsTable).where(eq(rateioParticipantsTable.rateioId, id));
  res.json({ id: r.id, songName: r.songName, artist: r.artist, genre: r.genre, status: r.status, targetAmount: r.targetAmount ? parseFloat(r.targetAmount) : null, amountPerParticipant: r.amountPerParticipant ? parseFloat(r.amountPerParticipant) : null, minParticipants: r.minParticipants, currentParticipants: cnt?.count || 0, minPercentage: r.minPercentage ? parseFloat(r.minPercentage) : null, deadline: r.deadline, coverUrl: r.coverUrl, isParticipating: false, createdAt: r.createdAt });
});

// GET /admin/coupons
router.get("/admin/coupons", requireAdmin, async (req, res) => {
  const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(coupons.map(c => ({ ...c, value: parseFloat(c.value), minOrderValue: c.minOrderValue ? parseFloat(c.minOrderValue) : null })));
});

// POST /admin/coupons
router.post("/admin/coupons", requireAdmin, async (req, res) => {
  const { code, type, value, minOrderValue, maxUsesTotal, maxUsesPerUser, isActive, startsAt, expiresAt } = req.body;
  const [coupon] = await db.insert(couponsTable).values({
    code: code.toUpperCase(), type, value: String(value),
    minOrderValue: minOrderValue ? String(minOrderValue) : null,
    maxUsesTotal: maxUsesTotal || null, maxUsesPerUser: maxUsesPerUser || null,
    isActive: isActive !== false,
    startsAt: startsAt ? new Date(startsAt) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json({ ...coupon, value: parseFloat(coupon.value), minOrderValue: coupon.minOrderValue ? parseFloat(coupon.minOrderValue) : null });
});

// PATCH /admin/coupons/:id
router.patch("/admin/coupons/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { code, type, value, minOrderValue, maxUsesTotal, maxUsesPerUser, isActive, startsAt, expiresAt } = req.body;
  const [coupon] = await db.update(couponsTable).set({
    code: code?.toUpperCase(), type, value: value ? String(value) : undefined,
    minOrderValue: minOrderValue ? String(minOrderValue) : null,
    maxUsesTotal: maxUsesTotal || null, maxUsesPerUser: maxUsesPerUser || null,
    isActive, startsAt: startsAt ? new Date(startsAt) : null, expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).where(eq(couponsTable.id, id)).returning();
  res.json({ ...coupon, value: parseFloat(coupon.value), minOrderValue: coupon.minOrderValue ? parseFloat(coupon.minOrderValue) : null });
});

// POST /admin/credits/adjust
router.post("/admin/credits/adjust", requireAdmin, async (req, res) => {
  const { userId, amount, description } = req.body;
  await db.insert(creditLedgerTable).values({ userId, type: "adjusted", amount, description });
  res.json({ message: "Créditos ajustados com sucesso" });
});

// POST /admin/downloads/:grantId/reissue
router.post("/admin/downloads/:grantId/reissue", requireAdmin, async (req, res) => {
  const grantId = parseInt(req.params.grantId as string);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  res.json({ url: `/api/downloads/file/admin-${grantId}-${Date.now()}`, expiresAt });
});

export default router;
