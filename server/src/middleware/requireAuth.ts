import { db } from "../db/index.js";
import { NextFunction, Request, Response } from "express";
import { sessionsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = req.cookies.session_id;

  if (!sessionId) {
    res.status(401).json({ ok: false, error: "Not authorised" });
    return;
  }

  const session = db
    .select({
      userId: sessionsTable.user_id,
      expiresAt: sessionsTable.expires_at,
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .get();

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ ok: false, error: "Not authorised" });
    return;
  }

  res.locals["userId"] = session.userId;

  next();
}
