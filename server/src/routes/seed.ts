import { Router } from "express";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";

const router = Router();

router.get("/seed", async (_req, res) => {
  const user: typeof usersTable.$inferInsert = {
    email: "test@test.test",
    password_hash: "12345678910",
  };

  await db.insert(usersTable).values(user);

  res.json({
    ok: true,
    message: `Added ${JSON.stringify(user)} to the db`,
  });
});

export default router;
