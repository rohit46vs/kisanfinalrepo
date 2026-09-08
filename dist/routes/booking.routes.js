"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), booking_controller_1.postBooking);
exports.default = router;
