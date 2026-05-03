import { Router } from "express";
import { db, rateiosTable, rateioParticipantsTable, rateioCommentsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../lib/auth";

const router = Router();

function formatRateio(r: any, participantCount: number, isParticipating = false) {
  return {
    id: r.id,
    songName: r.songName,
    artist: r.artist,
    genre: r.genre,
    status: r.status,
    targetAmount: r.targetAmount ? parseFloat(r.targetAmount) : null,
    amountPerParticipant: r.amountPerParticipant ? parseFloat(r.amountPerParticipant) : null,
    minParticipants: r.minParticipants,
    currentParticipants: participantCount,
    minPercentage: r.minPercentage ? parseFloat(r.minPercentage) : null,
    deadline: r.deadline,
    coverUrl: r.coverUrl,
    isParticipating,
    createdAt: r.createdAt,
  };
}

// GET /rateios
router.get("/rateios", optionalAuth, async (req, res) => {
  const user = (req as any).user;
  const { status, genre } = req.query as any;

  const conditions: any[] = [];
  if (status) conditions.push(eq(rateiosTable.status, status as any));
  if (genre) conditions.push(eq(rateiosTable.genre, genre));

  const rateios = conditions.length
    ? await db.select().from(rateiosTable).where(and(...conditions))
    : await db.select().from(rateiosTable);

  const result = await Promise.all(rateios.map(async (r) => {
    const [cnt] = await db.select({ count: sql<number>`count(*)::int` }).from(rateioParticipantsTable).where(eq(rateioParticipantsTable.rateioId, r.id));
    let isParticipating = false;
    if (user) {
      const [part] = await db.select().from(rateioParticipantsTable).where(and(eq(rateioParticipantsTable.rateioId, r.id), eq(rateioParticipantsTable.userId, user.id))).limit(1);
      isParticipating = !!part;
    }
    return formatRateio(r, cnt?.count || 0, isParticipating);
  }));
  res.json(result);
});

// POST /rateios
router.post("/rateios", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { songName, artist, reference, justification, genre } = req.body;
  if (!songName || !artist) { res.status(400).json({ error: "songName and artist required" }); return; }

  const [r] = await db.insert(rateiosTable).values({ songName, artist, reference, justification, genre, suggestedByUserId: userId, status: "suggested" }).returning();
  res.status(201).json(formatRateio(r, 0, false));
});

// GET /rateios/:id
router.get("/rateios/:id", optionalAuth, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);
  const [r] = await db.select().from(rateiosTable).where(eq(rateiosTable.id, id)).limit(1);
  if (!r) { res.status(404).json({ error: "Rateio not found" }); return; }

  const participants = await db.select().from(rateioParticipantsTable)
    .leftJoin(usersTable, eq(rateioParticipantsTable.userId, usersTable.id))
    .where(eq(rateioParticipantsTable.rateioId, id));

  const comments = await db.select().from(rateioCommentsTable)
    .leftJoin(usersTable, eq(rateioCommentsTable.userId, usersTable.id))
    .where(eq(rateioCommentsTable.rateioId, id))
    .orderBy(rateioCommentsTable.createdAt);

  let product = null;
  if (r.productId) {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, r.productId)).limit(1);
    if (p) product = { id: p.id, name: p.name, artist: p.artist, genre: p.genre, coverUrl: p.coverUrl, price: parseFloat(p.price), promoPrice: null, bpm: p.bpm, tonality: p.tonality, duration: p.duration, quality: p.quality, status: p.status, isFeatured: p.isFeatured, creditsRequired: p.creditsRequired, availableForSubscription: p.availableForSubscription, totalSales: p.totalSales, createdAt: p.createdAt };
  }

  let isParticipating = false;
  if (user) {
    const [part] = await db.select().from(rateioParticipantsTable).where(and(eq(rateioParticipantsTable.rateioId, id), eq(rateioParticipantsTable.userId, user.id))).limit(1);
    isParticipating = !!part;
  }

  res.json({
    ...formatRateio(r, participants.length, isParticipating),
    justification: r.justification,
    participants: participants.map(row => ({ id: row.rateio_participants.id, userId: row.rateio_participants.userId, userName: row.users?.name || "", paymentStatus: row.rateio_participants.paymentStatus, joinedAt: row.rateio_participants.joinedAt })),
    comments: comments.map(row => ({ id: row.rateio_comments.id, userId: row.rateio_comments.userId, userName: row.users?.name || "", isAdmin: row.rateio_comments.isAdmin, content: row.rateio_comments.content, createdAt: row.rateio_comments.createdAt })),
    product,
  });
});

// POST /rateios/:id/join
router.post("/rateios/:id/join", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const rateioId = parseInt(req.params.id);

  const [r] = await db.select().from(rateiosTable).where(eq(rateiosTable.id, rateioId)).limit(1);
  if (!r || r.status !== "open") { res.status(400).json({ error: "Rateio não está aberto para participação" }); return; }

  const [existing] = await db.select().from(rateioParticipantsTable)
    .where(and(eq(rateioParticipantsTable.rateioId, rateioId), eq(rateioParticipantsTable.userId, userId))).limit(1);
  if (existing) { res.json({ ...existing, userName: "" }); return; }

  const [participant] = await db.insert(rateioParticipantsTable).values({ rateioId, userId, paymentStatus: "pending" }).returning();
  res.json({ ...participant, userName: (req as any).user.name });
});

// GET /rateios/:id/comments
router.get("/rateios/:id/comments", async (req, res) => {
  const id = parseInt(req.params.id);
  const comments = await db.select().from(rateioCommentsTable)
    .leftJoin(usersTable, eq(rateioCommentsTable.userId, usersTable.id))
    .where(eq(rateioCommentsTable.rateioId, id)).orderBy(rateioCommentsTable.createdAt);
  res.json(comments.map(row => ({ id: row.rateio_comments.id, userId: row.rateio_comments.userId, userName: row.users?.name || "", isAdmin: row.rateio_comments.isAdmin, content: row.rateio_comments.content, createdAt: row.rateio_comments.createdAt })));
});

// POST /rateios/:id/comments
router.post("/rateios/:id/comments", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const rateioId = parseInt(req.params.id);
  const { content } = req.body;
  if (!content) { res.status(400).json({ error: "content required" }); return; }

  const user = (req as any).user;
  const [comment] = await db.insert(rateioCommentsTable).values({ rateioId, userId, content, isAdmin: user.role === "admin" }).returning();
  res.status(201).json({ ...comment, userName: user.name });
});

export default router;
