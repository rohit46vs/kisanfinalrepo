"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const bookingCancellation_controller_1 = require("../controllers/bookingCancellation.controller");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
/*
 * =========================================================
 * Farmer bookings
 * =========================================================
 */
/*
 * Get all bookings belonging to the authenticated farmer.
 */
router.get("/me", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), booking_controller_1.getMyBookingController);
/*
 * Cancel a farmer booking.
 *
 * IMPORTANT:
 * This route must appear before "/:id".
 */
router.post("/:id/cancel", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), bookingCancellation_controller_1.cancelBookingController);
/*
 * Get one booking by ID.
 */
router.get("/:id", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), booking_controller_1.getBookingByIdController);
/*
 * Create a new booking.
 */
router.post("/", auth_1.requireAuth, (0, roles_1.requireRole)("farmer"), booking_controller_1.postBooking);
exports.default = router;
