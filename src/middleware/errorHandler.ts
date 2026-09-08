import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(
  _req: Request,
  res: Response
) {
  res.status(404).json({
    success: false,
    error: "Resource not found",
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled API error:", error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
