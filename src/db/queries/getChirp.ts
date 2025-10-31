import { db } from "../index.js";
import { chirps } from "../schema.js";
import { eq } from "drizzle-orm";
import { NewChirp } from "../schema.js";

export async function getChirp(id: string): Promise<NewChirp | null> {
  const [row] = await db.select().from(chirps).where(eq(chirps.id, id));
  return row ?? null;
}