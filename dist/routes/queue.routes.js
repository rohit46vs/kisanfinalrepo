"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const queue_controller_1 = require("../controllers/queue.controller");
const router = (0, express_1.Router)();
router.get("/my-status", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), queue_controller_1.getMyQueueController);
exports.default = router;
