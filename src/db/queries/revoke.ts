import { db } from "../index.js";
import {refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";


export async function revokeRefreshToken(token: string) {
  const result = await db
    .update(refreshTokens)
    .set({
      revoked_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(refreshTokens.token, token))
    .returning(); 
  return result[0]; 
}