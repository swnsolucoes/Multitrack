import { Router } from "express";
import { db, wishlistTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

// GET /wishlist
router.get("/wishlist", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const items = await db.select().from(wishlistTable)
    .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .where(eq(wishlistTable.userId, userId));
  res.json(items.map(row => ({ id: row.wishlist.id, product: row.products ? formatProduct(row.products) : null, addedAt: row.wishlist.addedAt })));
});

// POST /wishlist/:productId
router.post("/wishlist/:productId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const productId = parseInt(req.params.productId as string);

  const existing = await db.select().from(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  if (!existing.length) {
    await db.insert(wishlistTable).values({ userId, productId });
  }
  const [item] = await db.select().from(wishlistTable)
    .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId))).limit(1);
  res.status(201).json({ id: item.wishlist.id, product: item.products ? formatProduct(item.products) : null, addedAt: item.wishlist.addedAt });
});

// DELETE /wishlist/:productId
router.delete("/wishlist/:productId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, parseInt(req.params.productId as string))));
  res.json({ message: "Removed from wishlist" });
});

function formatProduct(p: any) {
  return { id: p.id, name: p.name, artist: p.artist, genre: p.genre, coverUrl: p.coverUrl, price: parseFloat(p.price), promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null, bpm: p.bpm, tonality: p.tonality, duration: p.duration, quality: p.quality, status: p.status, isFeatured: p.isFeatured, creditsRequired: p.creditsRequired, availableForSubscription: p.availableForSubscription, totalSales: p.totalSales, createdAt: p.createdAt };
}

export default router;
