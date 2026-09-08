import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incomingId = req.header("x-request-id");

  const id =
    incomingId && incomingId.length <= 100
      ? incomingId
      : randomUUID();

  res.setHeader("x-request-id", id);

  next();
}