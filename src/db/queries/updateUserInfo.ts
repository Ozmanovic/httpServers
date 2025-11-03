import { users } from "../schema.js";
import { db } from "../index.js";

import { eq } from "drizzle-orm";


export async function updateEmailAndPassword(user: string, newEmail: string, newPassword: string) {
  const result = await db
    .update(users)
    .set({
      email: newEmail,
      hashedPassword: newPassword,
    })
    .where(eq(users.id, user))
    .returning(); 
  return result[0]; 
}