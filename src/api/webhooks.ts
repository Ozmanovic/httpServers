import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, getAPIKey } from "./auth.js";
import { getBearerToken } from "./auth.js";
import { validateJWT } from "./auth.js";
import { config } from "../config.js";
import { updateEmailAndPassword } from "../db/queries/updateUserInfo.js";
import { UserNotAuthenticatedError, NotFoundError } from "./errors.js";
import { checkUser } from "../db/queries/checkUser.js";
import { upgradeUser } from "../db/queries/upgradeUser.js";

export async function handlerUpdateChirpyRed(req: Request, res: Response) {
  try {
    const hasAPI = getAPIKey(req);

    if (!hasAPI) {
      res.status(401).end();
      return;
    }

    if (hasAPI !== config.api.polka) {
      res.status(401).end();
      return;
    }

    if (req.body.event !== "user.upgraded") {
      res.status(204).end();
      return;
    }
    if (
      !req.body.data ||
      typeof req.body.data.userId !== "string" ||
      req.body.data.userId.length === 0
    ) {
      return respondWithJSON(res, 400, {
        error:
          "body.data not found OR body.data.userId is empty or not a string",
      });
    }

    try {
      await upgradeUser(req.body.data.userId);

      res.status(204).end();
    } catch (err) {
      if (err instanceof NotFoundError) {
        return respondWithJSON(res, 404, { error: err.message });
      }
      return respondWithJSON(res, 500, { error: "internal error" });
    }
  } catch (err) {
    if (err instanceof UserNotAuthenticatedError) {
        return respondWithJSON(res, 401, { error: "User NotAuthenticated error" });
    }
    return respondWithJSON(res, 500, { error: "internal error" });
  }
}
