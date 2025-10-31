import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/deleteUsers.js";

export async function handlerReset(_: Request, res: Response, next: NextFunction) {
  if (config.api.platform !== "dev") {
    res.statusCode = 401
    next(res)

  }
  deleteUsers()
  res.end();
}
 
