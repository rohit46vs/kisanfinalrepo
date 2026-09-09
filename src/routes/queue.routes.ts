import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { getMyQueueController } from "../controllers/queue.controller";

const router = Router();

router.get(
  "/my-status",
  requireAuth,
  requireRole("farmer"),
  getMyQueueController
);

export default router;