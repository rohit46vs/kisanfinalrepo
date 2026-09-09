import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { getAdminQueueController } from "../controllers/adminQueue.controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole(
    "procurement_officer",
    "super_admin"
  ),
  getAdminQueueController
);

export default router;