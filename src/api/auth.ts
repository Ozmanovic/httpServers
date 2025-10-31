import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json";
import type { Request, Response } from "express";
import crypto from "crypto"

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error("Failed to hash password due to an internal Argon2 error.");
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const isMatch = await argon2.verify(hash, password);
    return isMatch;
  } catch (err) {
    throw new Error("Failed to verify hash due to an internal Argon2 error.");
  }
}
export type Payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  secret: string
): string {
  const currentTime = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat: currentTime,
    exp: currentTime + 3600,
  };

  const createToken = jwt.sign(payload, secret);
  return createToken;
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret);
    if (typeof decoded === "string") {
      throw new UserNotAuthenticatedError("Invalid token payload");
    }
    const sub = decoded.sub;
    if (!sub) {
      throw new UserNotAuthenticatedError("Missing subject");
    }
    return sub;
  } catch {
    throw new UserNotAuthenticatedError("Invalid or expired token");
  }
}

export function getBearerToken(req: Request): string {
  const authorization = req.get("Authorization");

  if (!authorization) {
    throw new UserNotAuthenticatedError("Authorization header is missing");
  }

  
  if (!authorization.startsWith("Bearer ")) {
    throw new UserNotAuthenticatedError(
      "Authorization header must start with 'Bearer '"
    );
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new UserNotAuthenticatedError("Bearer token is missing or empty");
  }

  return token;
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex")
  
}


