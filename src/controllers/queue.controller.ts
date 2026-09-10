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
    const queues = await getMyQueueStatus(
      req.userId
    );

    if (!queues || queues.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No active bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      data: queues,
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