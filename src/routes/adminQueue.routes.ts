import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

import {
  getAdminQueueController,
  markBookingWaitingController,
  callFarmerController,
  markBookingGateEnteredController,
  startWeighingController,
  completeWeighingController,
  completeQualityInspectionController,
  completeBaggingController,
} from "../controllers/adminQueue.controller";

const router = Router();

const adminRoles = [
  "procurement_officer",
  "super_admin",
] as const;

router.get(
  "/",
  requireAuth,
  requireRole(...adminRoles),
  getAdminQueueController
);

router.post(
  "/:id/waiting",
  requireAuth,
  requireRole(...adminRoles),
  markBookingWaitingController
);

router.post(
  "/:id/call",
  requireAuth,
  requireRole(...adminRoles),
  callFarmerController
);

router.post(
  "/:id/gate-entry",
  requireAuth,
  requireRole(...adminRoles),
  markBookingGateEnteredController
);

router.post(
  "/:id/start-weighing",
  requireAuth,
  requireRole(...adminRoles),
  startWeighingController
);

router.post(
  "/:id/complete-weighing",
  requireAuth,
  requireRole(...adminRoles),
  completeWeighingController
);

router.post(
  "/:id/complete-quality",
  requireAuth,
  requireRole(...adminRoles),
  completeQualityInspectionController
);

router.post(
  "/:id/complete-bagging",
  requireAuth,
  requireRole(...adminRoles),
  completeBaggingController
);

export default router;