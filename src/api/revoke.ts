import { getBearerToken, makeJWT } from "./auth.js";
import { revokeRefreshToken } from "../db/queries/revoke.js";
import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { config } from "../config.js";
import { UserNotAuthenticatedError } from "./errors.js";


export async function revokeRefresh(req: Request, res: Response) {
    try {
    const refreshToken = getBearerToken(req)
    await revokeRefreshToken(refreshToken)
    res.status(204).end();
    }
    catch (err){
        if (err instanceof UserNotAuthenticatedError) {
            return respondWithJSON(res, 401, {error: err.message});
        }
        return respondWithJSON(res, 500, { error: "internal error" });
    }
}