import { Router, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { HealthCheckResponse } from "@workspace/api-zod";

const router = Router();

async function handleHealth(_req: Request, res: Response): Promise<void> {
  let database = "ok";
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch {
    database = "error";
  }

  const data = HealthCheckResponse.parse({
    ok: database === "ok",
    database,
    env: process.env.NODE_ENV ?? "production",
  });

  res.status(database === "ok" ? 200 : 503).json(data);
}

router.get("/healthz", handleHealth);
router.get("/health", handleHealth);

export default router;
