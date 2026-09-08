import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string | undefined;
  userRole?: string | undefined;
  accessToken?: string | undefined;
}
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired authentication",
      });
    }

    req.userId = user.id;
req.userEmail = user.email;
req.accessToken = token;

    return next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
}