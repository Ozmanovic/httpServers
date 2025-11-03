import { users, chirps } from "../schema.js";
import { db } from "../index.js";

import { eq } from "drizzle-orm";


export async function deleteChirp(chirpID: string) {
  await db.delete(chirps).where(eq(chirps.id, chirpID));
}