import { checkUser } from "../db/queries/checkUser.js";
import { UserNotAuthenticatedError } from "../api/errors.js";
import { respondWithJSON } from "./json.js";
import type { Request, Response } from "express";
import { makeJWT, makeRefreshToken } from "./auth.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { insertRefreshToken } from "../db/queries/insertRefreshToken.js";

export async function checkLogin(req: Request, res: Response) {
  try {
    let { email, password, } = req.body ?? {};

    if (typeof email !== "string" || email.length === 0) {
      return respondWithJSON(res, 400, { error: "email required" });
    }

    if (typeof password !== "string" || password.length === 0) {
      return respondWithJSON(res, 400, { error: "password required" });
    }

    // Authenticate user
    const user = await checkUser(email, password);

    // Sign JWT
    const token = makeJWT(user.id, config.secret);

    const refreshToken = makeRefreshToken();

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  
    await insertRefreshToken({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    return respondWithJSON(res, 200, {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      token,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof UserNotAuthenticatedError) {
      return respondWithJSON(res, 401, {
        error: "Incorrect email or password",
      });
    }
    console.error("Login handler error:", err);
    return respondWithJSON(res, 500, { error: "internal error" });
  }
}
