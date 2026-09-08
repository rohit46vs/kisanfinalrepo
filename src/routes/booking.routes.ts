import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { postBooking } from "../controllers/booking.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("farmer"),
  postBooking
);

export default router;