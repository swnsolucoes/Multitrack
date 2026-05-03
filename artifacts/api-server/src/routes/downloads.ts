import { Router } from "express";
import { db, downloadGrantsTable, downloadLogsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import * as crypto from "crypto";

const router = Router();

// GET /downloads
router.get("/downloads", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const grants = await db.select().from(downloadGrantsTable)
    .leftJoin(productsTable, eq(downloadGrantsTable.productId, productsTable.id))
    .where(eq(downloadGrantsTable.userId, userId));

  res.json(grants.map(row => ({
    id: row.download_grants.id,
    productId: row.download_grants.productId,
    productName: row.products?.name || "",
    productArtist: row.products?.artist || "",
    coverUrl: row.products?.coverUrl || null,
    source: row.download_grants.source,
    downloadCount: row.download_grants.downloadCount,
    lastDownloadAt: row.download_grants.lastDownloadAt,
    createdAt: row.download_grants.createdAt,
  })));
});

// POST /downloads/:grantId/link
router.post("/downloads/:grantId/link", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const grantId = parseInt(req.params.grantId);

  const [grant] = await db.select().from(downloadGrantsTable)
    .where(and(eq(downloadGrantsTable.id, grantId), eq(downloadGrantsTable.userId, userId))).limit(1);

  if (!grant) { res.status(403).json({ error: "Download not authorized" }); return; }

  await db.update(downloadGrantsTable)
    .set({ downloadCount: grant.downloadCount + 1, lastDownloadAt: new Date() })
    .where(eq(downloadGrantsTable.id, grantId));

  await db.insert(downloadLogsTable).values({
    grantId,
    userId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  res.json({
    url: `/api/downloads/file/${token}`,
    expiresAt,
  });
});

export default router;
