import { Router } from "express";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/users", requireAuth, async (_req, res) => {
  const users = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable);

  res.json({
    ok: true,
    users,
    count: users.length,
  });
});

export default router;
