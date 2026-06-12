import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";

const CreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const result = CreateUserSchema.safeParse(req.body);
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

router.post("/api/login", async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
