import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth";
import { supabaseAdmin } from "../config/supabase";

export type AppRole =
  | "farmer"
  | "procurement_officer"
  | "super_admin";

export function requireRole(...allowedRoles: AppRole[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", req.userId)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          error: "User profile not available",
        });
      }

      if (!allowedRoles.includes(profile.role as AppRole)) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
        });
      }

      req.userRole = profile.role as AppRole;

      return next();
    } catch (error) {
      console.error("Role authorization error:", error);

      return res.status(403).json({
        success: false,
        error: "Authorization failed",
      });
    }
  };
}