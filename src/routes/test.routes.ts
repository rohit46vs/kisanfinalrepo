import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../middleware/auth";
import {
  requireRole,
} from "../middleware/roles";

const router = Router();

router.get(
  "/farmer",
  requireAuth,
  requireRole("farmer"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Farmer access granted",
      userId: req.userId,
      role: req.userRole,
    });
  }
);

router.get(
  "/staff",
  requireAuth,
  requireRole("procurement_officer", "super_admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Staff access granted",
      userId: req.userId,
      role: req.userRole,
    });
  }
);

export default router;