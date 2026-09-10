"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const adminQueue_controller_1 = require("../controllers/adminQueue.controller");
const router = (0, express_1.Router)();
const adminRoles = [
    "procurement_officer",
    "super_admin",
];
router.get("/", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.getAdminQueueController);
router.post("/:id/waiting", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.markBookingWaitingController);
router.post("/:id/call", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.callFarmerController);
router.post("/verify-qr", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.verifyQrAndEnterGateController);
router.post("/:id/gate-entry", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.markBookingGateEnteredController);
router.post("/:id/start-weighing", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.startWeighingController);
router.post("/:id/complete-weighing", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.completeWeighingController);
router.post("/:id/complete-quality", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.completeQualityInspectionController);
router.post("/:id/complete-bagging", auth_1.requireAuth, (0, roles_1.requireRole)(...adminRoles), adminQueue_controller_1.completeBaggingController);
exports.default = router;
