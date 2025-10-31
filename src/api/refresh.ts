import { getBearerToken, makeJWT } from "./auth.js";
import { findRefreshToken } from "../db/queries/checkRefreshToken.js";
import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { config } from "../config.js";
import { UserNotAuthenticatedError } from "./errors.js";


export async function checkRefresh(req: Request, res: Response) {
    try {
    const refreshToken = getBearerToken(req)
    const row = await findRefreshToken(refreshToken)

    if (!row || row.revoked_at || row.expires_at <= new Date()) {
        return respondWithJSON(res, 401, {error: "invalid token"});
    } 
    const token = makeJWT(row.user_id,config.secret )
    return respondWithJSON(res, 200, { token });
    }
    catch (err){
        if (err instanceof UserNotAuthenticatedError) {
            return respondWithJSON(res, 401, {error: err.message});
        }
        return respondWithJSON(res, 500, { error: "internal error" });
    }
}