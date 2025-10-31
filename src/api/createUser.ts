import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash } from "./auth.js";

// ts
export async function createUserHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || email.length === 0) {
      return respondWithJSON(res, 400, { error: "email required" });
    }

    if (typeof password !== "string" || password.length === 0) {
      return respondWithJSON(res, 400, { error: "password required" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await createUser({ email, hashedPassword });

  
    return respondWithJSON(res, 201, {
      id: newUser.id,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      email: newUser.email,
    });
  } catch (err: any) {
    console.error("Login error:", err);  
    return respondWithJSON(res, 500, { error: "internal error" });
  }
}
