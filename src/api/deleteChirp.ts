import type { Request, Response } from "express";
import { createChirp } from "../db/queries/createChirp.js";
import { getChirps } from "../db/queries/getChirps.js";
import { getChirp } from "../db/queries/getChirp.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { chirps } from "../db/schema.js";
import { deleteChirp } from "../db/queries/deleteChirp.js";

export async function handlerDeleteChirp(req: Request, res: Response) {
  try {
    let token: string
    
    try {
      token = getBearerToken(req);
    } catch (err) {
      if (err instanceof UserNotAuthenticatedError) {
        return respondWithJSON(res, 401, { error: err.message });
      }
      throw err; 
    }

    let userio: any;
    try {
      userio = validateJWT(token, config.secret);
    } catch {
      return respondWithJSON(res, 401, { error: "invalid or expired token" });
    }

    const subject = typeof userio === "object" ? userio.sub : userio;
    if (typeof subject !== "string" || !subject) {
      return respondWithJSON(res, 401, { error: "invalid JWT subject" });
    }

    const id = req.params.chirpID;
    if (typeof id !== "string" || !id) {
      return respondWithJSON(res, 400, { error: "id required" });
    }

    const chirp = await getChirp(id);
    if (!chirp) return respondWithJSON(res, 404, { error: "not found" });

    if (chirp.user_id !== subject) {
      return respondWithJSON(res, 403, { error: "User not authorized" });
    }

    await deleteChirp(id);
    return res.status(204).end();

  } catch (err) {
    console.error("Unexpected error deleting chirp:", err);
    return respondWithJSON(res, 500, { error: "Internal error" });
  }
}