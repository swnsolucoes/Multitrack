import { Router } from "express";
import { db, creditLedgerTable, downloadGrantsTable, productsTable, plansTable, subscriptionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

async function getBalance(userId: number) {
  const ledger = await db.select().from(creditLedgerTable).where(eq(creditLedgerTable.userId, userId));
  const balance = ledger.reduce((sum, e) => {
    if (e.type === "earned" || e.type === "refunded" || e.type === "adjusted") return sum + e.amount;
    if (e.type === "used" || e.type === "expired") return sum - Math.abs(e.amount);
    return sum;
  }, 0);
  return Math.max(0, balance);
}

// GET /credits
router.get("/credits", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [sub] = await db.select().from(subscriptionsTable)
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.userId, userId)).limit(1);

  const maxBalance = sub?.plans?.maxAccumulatedCredits || 6;
  const balance = await getBalance(userId);
  const ledger = await db.select().from(creditLedgerTable)
    .where(eq(creditLedgerTable.userId, userId))
    .orderBy(sql`created_at desc`).limit(50);

  res.json({ balance, maxBalance, ledger: ledger.map(e => ({ id: e.id, type: e.type, amount: e.amount, description: e.description, createdAt: e.createdAt })) });
});

// POST /credits/use
router.post("/credits/use", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { productId } = req.body;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product || !product.availableForSubscription) { res.status(400).json({ error: "Produto não disponível para créditos" }); return; }

  const balance = await getBalance(userId);
  if (balance < product.creditsRequired) { res.status(400).json({ error: "Créditos insuficientes" }); return; }

  await db.insert(creditLedgerTable).values({
    userId,
    type: "used",
    amount: product.creditsRequired,
    description: `Crédito usado em: ${product.name}`,
  });

  const [grant] = await db.insert(downloadGrantsTable).values({
    userId,
    productId,
    source: "credit",
  }).returning();

  res.json({ id: grant.id, productId: grant.productId, productName: product.name, productArtist: product.artist, coverUrl: product.coverUrl, source: grant.source, downloadCount: grant.downloadCount, lastDownloadAt: grant.lastDownloadAt, createdAt: grant.createdAt });
});

export default router;
