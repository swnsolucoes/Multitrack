import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, and, like, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { optionalAuth } from "../lib/auth";

const router = Router();

// GET /categories
router.get("/categories", async (req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
  const result = await Promise.all(cats.map(async (c) => {
    const [count] = await db.select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(and(eq(productsTable.categoryId, c.id), eq(productsTable.status, "active")));
    return { ...c, productCount: count?.count || 0 };
  }));
  res.json(result);
});

// GET /products
router.get("/products", optionalAuth, async (req, res) => {
  const { q, categoryId, genre, minBpm, maxBpm, minPrice, maxPrice, sort, page = "1", limit = "20" } = req.query as Record<string, string>;

  const conditions = [eq(productsTable.status, "active" as any)];

  if (q) conditions.push(like(productsTable.name, `%${q}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId)));
  if (genre) conditions.push(eq(productsTable.genre, genre));
  if (minBpm) conditions.push(gte(productsTable.bpm, parseInt(minBpm)));
  if (maxBpm) conditions.push(lte(productsTable.bpm, parseInt(maxBpm)));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  const orderBy = sort === "price_asc" ? asc(productsTable.price)
    : sort === "price_desc" ? desc(productsTable.price)
    : sort === "popular" ? desc(productsTable.totalSales)
    : sort === "name_asc" ? asc(productsTable.name)
    : desc(productsTable.createdAt);

  const [countRow] = await db.select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(and(...conditions));

  const products = await db.select().from(productsTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  res.json({ products: products.map(formatProduct), total: countRow?.count || 0, page: pageNum, limit: limitNum });
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.isFeatured, true))
    .limit(8);
  res.json(products.map(formatProduct));
});

// GET /products/bestsellers
router.get("/products/bestsellers", async (req, res) => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active" as any))
    .orderBy(desc(productsTable.totalSales))
    .limit(8);
  res.json(products.map(formatProduct));
});

// GET /products/:id
router.get("/products/:id", optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  let category = null;
  if (product.categoryId) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
    if (cat) category = { ...cat, productCount: 0 };
  }

  res.json({ ...formatProduct(product), description: product.description, tracks: product.tracks, formats: product.formats, fileSizeMb: product.fileSizeMb ? parseFloat(product.fileSizeMb) : null, previewAudioUrl: product.previewAudioUrl, videoUrl: product.videoUrl, tags: product.tags, licenceSummary: product.licenceSummary, category, averageRating: null, reviewCount: 0 });
});

// GET /products/:id/related
router.get("/products/:id/related", async (req, res) => {
  const id = parseInt(req.params.id);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) { res.json([]); return; }

  const related = await db.select().from(productsTable)
    .where(and(eq(productsTable.genre, product.genre), eq(productsTable.status, "active" as any)))
    .limit(6);
  res.json(related.filter(p => p.id !== id).map(formatProduct));
});

function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    artist: p.artist,
    genre: p.genre,
    coverUrl: p.coverUrl,
    price: parseFloat(p.price),
    promoPrice: p.promoPrice ? parseFloat(p.promoPrice) : null,
    bpm: p.bpm,
    tonality: p.tonality,
    duration: p.duration,
    quality: p.quality,
    status: p.status,
    isFeatured: p.isFeatured,
    creditsRequired: p.creditsRequired,
    availableForSubscription: p.availableForSubscription,
    totalSales: p.totalSales,
    createdAt: p.createdAt,
  };
}

export default router;
