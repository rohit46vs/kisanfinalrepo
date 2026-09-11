"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
const adminRoles = [
    "procurement_officer",
    "super_admin",
];
router.get("/", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), payment_controller_1.getPaymentsController);
router.post("/:transactionId/process", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), payment_controller_1.processPaymentController);
exports.default = router;
