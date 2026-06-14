import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable, usersTable } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";
import rateLimit from "express-rate-limit";

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});

const UserSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
});

const router = Router();

router.post("/signup", authLimit, async (req, res) => {
  try {
    const result = UserSchema.safeParse(req.body);
    if (result.error) {
      res.status(400).json({
        ok: false,
        errors: z.treeifyError(result.error).properties,
      });
      return;
    }

    const { email, password } = result.data;

    const existing = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (existing) {
      res.status(409).json({ ok: false, error: "Email already in use" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        password_hash,
      })
      .returning({ id: usersTable.id });

    res.status(201).json({ ok: true, data: { userId: newUser.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

router.post("/login", authLimit, async (req, res) => {
  try {
    const result = UserSchema.safeParse(req.body);

    if (result.error) {
      res.status(400).json({
        ok: false,
        errors: z.treeifyError(result.error).properties,
      });
      return;
    }

    const { email, password } = result.data;

    const existing = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (!existing) {
      res.status(401).json({ ok: false, error: "Unable to login" });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      existing.password_hash,
    );

    if (!passwordMatches) {
      res.status(401).json({ ok: false, error: "Unable to login" });
      return;
    }

    const sessionId = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db
      .insert(sessionsTable)
      .values({ id: sessionId, user_id: existing.id, expires_at })
      .returning({ id: sessionsTable.id });

    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expires_at,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  const sessionId = req.cookies.session_id;

  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

  res.clearCookie("session_id");

  res.status(200).json({ ok: true });
});

export default router;
