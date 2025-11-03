import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash } from "./auth.js";
import { getBearerToken } from "./auth.js";
import { validateJWT } from "./auth.js";
import { config } from "../config.js";
import { updateEmailAndPassword } from "../db/queries/updateUserInfo.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { checkUser } from "../db/queries/checkUser.js";


export async function handlerUpdateInfo(req: Request, res: Response) {
  try {
    const token = getBearerToken(req);
    
    
    const userio = validateJWT(token, config.secret);

    if (typeof userio !== "string" || userio.length === 0) {
      return respondWithJSON(res, 401, { error: "invalid JWT subject" });
    }

    if (typeof req.body.email !== "string" || req.body.email.length === 0 || typeof req.body.password !== "string" || req.body.password.length === 0) {
      return respondWithJSON(res, 400, {
        error: `email and password is not string or is empty`,
      });
    }
    const newPassword = await hashPassword(req.body.password)


    const updatedUser = await updateEmailAndPassword(userio, req.body.email, newPassword )

    const { hashedPassword, ...publicUserInfo } = updatedUser 
    
    return respondWithJSON(res, 200, publicUserInfo)
    }
    catch (err){
        if (err instanceof UserNotAuthenticatedError) {
            return respondWithJSON(res, 401, {error: err.message});
        }
        return respondWithJSON(res, 500, { error: "internal error" });
    }

  }
   