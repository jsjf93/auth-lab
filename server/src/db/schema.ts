import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
  created_at: int({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires_at: int({ mode: "timestamp_ms" }).notNull(),
  created_at: int({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});
