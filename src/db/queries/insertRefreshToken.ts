import { db } from "../index.js";
import {refreshTokens } from "../schema.js";

type NewRefreshToken = {
  token: string;
  user_id: string;
  expires_at: Date;
};

export async function insertRefreshToken(row: NewRefreshToken) {
  const [result] = await db.insert(refreshTokens).values(row).returning();
  return result;
}