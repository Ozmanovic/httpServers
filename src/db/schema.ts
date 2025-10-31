import { ChildProcessByStdio } from "child_process";
import { pgTable, timestamp, varchar, uuid, text, } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashedPassword: varchar("hashed_password").notNull().default("unset")
});

export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;


export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text().notNull(),
  user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}), 
})


export const refreshTokens = pgTable("refresh_tokens", {
  token: text("token").primaryKey().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}), 
  expires_at: timestamp("expires_at").notNull(),
  revoked_at: timestamp("revoked_at")
})
