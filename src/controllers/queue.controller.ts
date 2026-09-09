import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { getMyQueueStatus } from "../services/queue.service";

export async function getMyQueueController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  try {
    const queue = await getMyQueueStatus(
      req.userId
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        error: "No active booking found",
      });
    }

    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error(
      "Get my queue error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to load queue status",
    });
  }
}