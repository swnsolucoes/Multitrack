import { Router } from "express";
import { db, plansTable, subscriptionsTable, creditLedgerTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatPlan(p: any) {
  return { id: p.id, name: p.name, description: p.description, price: parseFloat(p.price), creditsPerMonth: p.creditsPerMonth, maxAccumulatedCredits: p.maxAccumulatedCredits, features: p.features, isActive: p.isActive };
}

function formatSubscription(s: any, planName: string) {
  return { id: s.id, planId: s.planId, planName, status: s.status, currentPeriodStart: s.currentPeriodStart, currentPeriodEnd: s.currentPeriodEnd, cancelAtPeriodEnd: s.cancelAtPeriodEnd, createdAt: s.createdAt };
}

// GET /subscriptions/plans
router.get("/subscriptions/plans", async (req, res) => {
  const plans = await db.select().from(plansTable).where(eq(plansTable.isActive, true));
  res.json(plans.map(formatPlan));
});

// GET /subscriptions/me
router.get("/subscriptions/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [sub] = await db.select().from(subscriptionsTable)
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.userId, userId)).limit(1);

  if (!sub) { res.status(404).json({ error: "No active subscription" }); return; }
  res.json(formatSubscription(sub.subscriptions, sub.plans?.name || ""));
});

// POST /subscriptions/me
router.post("/subscriptions/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { planId } = req.body;

  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const [sub] = await db.insert(subscriptionsTable).values({
    userId,
    planId,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    cancelAtPeriodEnd: false,
  }).returning();

  await db.update(usersTable).set({ role: "premium" }).where(eq(usersTable.id, userId));

  await db.insert(creditLedgerTable).values({
    userId,
    type: "earned",
    amount: plan.creditsPerMonth,
    description: `Créditos do plano ${plan.name}`,
  });

  res.status(201).json(formatSubscription(sub, plan.name));
});

// DELETE /subscriptions/me
router.delete("/subscriptions/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await db.update(subscriptionsTable).set({ cancelAtPeriodEnd: true }).where(eq(subscriptionsTable.userId, userId));
  res.json({ message: "Assinatura cancelada ao final do período" });
});

export default router;
