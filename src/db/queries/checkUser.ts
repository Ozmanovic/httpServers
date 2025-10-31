import { db } from "../index.js";
import { users } from "../schema.js";
import { hashPassword, checkPasswordHash } from "../../api/auth.js";
import { eq } from "drizzle-orm";
import { UserNotAuthenticatedError } from "../../api/errors.js";

export async function checkUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const isValid = await checkPasswordHash(password, user.hashedPassword);
  if (!isValid) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  };
}
