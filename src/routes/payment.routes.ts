import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

import {
  getPaymentsController,
  processPaymentController,
} from "../controllers/payment.controller";

const router = Router();

const adminRoles = [
  "procurement_officer",
  "super_admin",
] as const;

router.get(
  "/",
  requireAuth,
  requireRole(...adminRoles),
  getPaymentsController
);

router.post(
  "/:transactionId/process",
  requireAuth,
  requireRole(...adminRoles),
  processPaymentController
);

export default router;