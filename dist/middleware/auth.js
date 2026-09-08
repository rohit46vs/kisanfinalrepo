"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabase_1 = require("../config/supabase");
async function requireAuth(req, res, next) {
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
        const { data: { user }, error, } = await supabase_1.supabaseAdmin.auth.getUser(token);
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
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            success: false,
            error: "Authentication failed",
        });
    }
}
