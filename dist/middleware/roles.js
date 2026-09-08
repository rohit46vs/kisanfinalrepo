"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const supabase_1 = require("../config/supabase");
function requireRole(...allowedRoles) {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: "Authentication required",
                });
            }
            const { data: profile, error } = await supabase_1.supabaseAdmin
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
            if (!allowedRoles.includes(profile.role)) {
                return res.status(403).json({
                    success: false,
                    error: "Insufficient permissions",
                });
            }
            req.userRole = profile.role;
            return next();
        }
        catch (error) {
            console.error("Role authorization error:", error);
            return res.status(403).json({
                success: false,
                error: "Authorization failed",
            });
        }
    };
}
