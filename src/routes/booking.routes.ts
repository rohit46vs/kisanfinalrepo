import { Router } from "express";

import {
  getBookingByIdController,
  getMyBookingController,
  postBooking,
} from "../controllers/booking.controller";

import { cancelBookingController } from "../controllers/bookingCancellation.controller";

import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

/*
 * =========================================================
 * Farmer bookings
 * =========================================================
 */

/*
 * Get all bookings belonging to the authenticated farmer.
 */
router.get(
  "/me",
  requireAuth,
  requireRole("farmer"),
  getMyBookingController
);


/*
 * Cancel a farmer booking.
 *
 * IMPORTANT:
 * This route must appear before "/:id".
 */
router.post(
  "/:id/cancel",
  requireAuth,
  requireRole("farmer"),
  cancelBookingController
);


/*
 * Get one booking by ID.
 */
router.get(
  "/:id",
  requireAuth,
  requireRole("farmer"),
  getBookingByIdController
);


/*
 * Create a new booking.
 */
router.post(
  "/",
  requireAuth,
  requireRole("farmer"),
  postBooking
);

export default router;