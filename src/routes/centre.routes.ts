import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth";

import {
  requireRole,
} from "../middleware/roles";

import {
  getCentres,
  getCentre,
  patchCentre,
  postCentre,
} from "../controllers/centre.controller";

const router = Router();

router.get(
  "/",
  getCentres
);

router.get(
  "/:id",
  getCentre
);

router.post(
  "/",
  requireAuth,
  requireRole(
    "procurement_officer",
    "super_admin"
  ),
  postCentre
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(
    "procurement_officer",
    "super_admin"
  ),
  patchCentre
);

export default router;