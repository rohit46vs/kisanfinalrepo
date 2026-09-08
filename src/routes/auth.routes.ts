import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

router.get(
  "/me",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      user: {
        id: req.userId,
        email: req.userEmail,
      },
    });
  }
);

export default router;