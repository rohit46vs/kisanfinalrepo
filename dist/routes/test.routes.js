"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
router.get("/farmer", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), (req, res) => {
    res.json({
        success: true,
        message: "Farmer access granted",
        userId: req.userId,
        role: req.userRole,
    });
});
router.get("/staff", auth_1.requireAuth, (0, roles_1.requireRole)("procurement_officer", "super_admin"), (req, res) => {
    res.json({
        success: true,
        message: "Staff access granted",
        userId: req.userId,
        role: req.userRole,
    });
});
exports.default = router;
