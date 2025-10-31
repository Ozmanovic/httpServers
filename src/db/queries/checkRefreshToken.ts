import { db } from "../index.js";
import {refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";


export async function findRefreshToken(token: string) {
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return row; // or undefined
}