import { db } from "../index.js";
import { chirps, NewChirp, users } from "../schema.js";
import { asc } from "drizzle-orm";

export async function getChirps() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.created_at));
    return result;   
}