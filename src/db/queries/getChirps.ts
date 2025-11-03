import { db } from "../index.js";
import { chirps, NewChirp, users } from "../schema.js";
import { asc, eq, desc } from "drizzle-orm";

export async function getChirps() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.created_at));
    return result;   
}


export async function getChirpsDesc() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(desc(chirps.created_at));
    return result;   
}

export async function getChirpsAuthor(authorId: string) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.user_id, authorId))
        .orderBy(asc(chirps.created_at));
    return result;   
}