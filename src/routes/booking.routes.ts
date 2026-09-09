import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import {
  postBooking,
  getMyBookingController,
  getBookingByIdController,
} from "../controllers/booking.controller";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requireRole("farmer"),
  getMyBookingController
);

router.get(
  "/:id",
  requireAuth,
  requireRole("farmer"),
  getBookingByIdController
);

router.post(
  "/",
  requireAuth,
  requireRole("farmer"),
  postBooking
);

export default router;