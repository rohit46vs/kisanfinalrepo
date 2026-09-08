"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/me", auth_1.requireAuth, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.userId,
            email: req.userEmail,
        },
    });
});
exports.default = router;
