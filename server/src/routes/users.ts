import { Router } from "express";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";

const router = Router();

router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable);

  res.json({
    ok: true,
    users,
    count: users.length,
  });
});

export default router;
