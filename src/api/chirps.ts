import type { Request, Response } from "express";
import { createChirp } from "../db/queries/createChirp.js";
import { getChirps, getChirpsAuthor } from "../db/queries/getChirps.js";
import { getChirp } from "../db/queries/getChirp.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { chirps } from "src/db/schema.js";

export async function handlerCreateChirps(req: Request, res: Response) {
  try {
    const token = getBearerToken(req);

    const userio = validateJWT(token, config.secret);

    if (typeof userio !== "string" || userio.length === 0) {
      return respondWithJSON(res, 401, { error: "invalid JWT subject" });
    }

    if (typeof req.body.body !== "string") {
      return respondWithJSON(res, 400, {
        error: `Body is not string or is empty`,
      });
    }

    const maxChirpLength = 140;
    const trimmed = req.body.body.trim();
    if (trimmed.length === 0 || trimmed.length > maxChirpLength) {
      return respondWithJSON(res, 400, {
        error: `Chirp must be 1–${maxChirpLength} chars`,
      });
    }

    const badWords = ["kerfuffle", "sharbert", "fornax"];
    const cleaned = trimmed
      .split(" ")
      .map((w: string) => (badWords.includes(w.toLowerCase()) ? "****" : w))
      .join(" ");

    const row = await createChirp({ body: cleaned, user_id: userio });

    const newChirp = {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      body: row.body,
      userId: row.user_id,
    };

    res.set("Content-Type", "application/json");
    return respondWithJSON(res, 201, newChirp);
  } catch (err) {
    if (err instanceof UserNotAuthenticatedError) {
      console.error("Login error:", err);
      return respondWithJSON(res, 401, { error: "JWT error" });
    }
    return respondWithJSON(res, 500, { error: "internal error" });
  }
}

export async function handlerGetChirps(req: Request, res: Response) {
  try {
    let authorId = "";
    let sort = "";

    const authorIdQuery = req.query.authorId;
    const sortQuery = req.query.sort;

    if (typeof authorIdQuery === "string") {
      authorId = authorIdQuery;
    }

    if (typeof sortQuery === "string") {
      sort = sortQuery.toLowerCase();
    }

    let chirps;

    if (authorId.length === 0) {
      chirps = await getChirps();
    } else {
      chirps = await getChirpsAuthor(authorId);
    }

    if (sort === "desc") {
      chirps = [...chirps].reverse();
    }

    return respondWithJSON(res, 200, chirps);
  } catch (err) {
    console.error("Error fetching chirps:", err);
    return respondWithJSON(res, 500, { error: "Internal error" });
  }
}

export async function handlerGetChirp(req: Request, res: Response) {
  try {
    const id = req.params.chirpID;
    if (typeof id !== "string" || id.length === 0) {
      return respondWithJSON(res, 400, { error: "id required" });
    }

    const chirp = await getChirp(id);
    if (!chirp) return respondWithJSON(res, 404, { error: "not found" });
    return respondWithJSON(res, 200, chirp);
  } catch (err) {
    return respondWithJSON(res, 500, { error: "Internal error " });
  }
}
