import { users } from "../schema.js";
import { db } from "../index.js";

import { eq } from "drizzle-orm";
import { NotFoundError } from "../../api/errors.js";


export async function upgradeUser(user: string) {
  
  const result = await db
    .update(users)
    .set({
      isChirpyRed: true  
    })
    .where(eq(users.id, user))
    .returning(); 
  if (result.length === 0) {
    throw new NotFoundError("User Not Found")
  }  
  return result[0]; 

}