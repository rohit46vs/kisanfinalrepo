import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth";

import {
  requireRole,
} from "../middleware/roles";

import {
  getSlots,
  getSlot,
  postSlot,
  patchSlot,
} from "../controllers/slot.controller";

const router = Router();

router.get(
  "/",
  getSlots
);

router.get(
  "/:id",
  getSlot
);

router.post(
  "/",
  requireAuth,
  requireRole(
    "procurement_officer",
    "super_admin"
  ),
  postSlot
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(
    "procurement_officer",
    "super_admin"
  ),
  patchSlot
);

export default router;