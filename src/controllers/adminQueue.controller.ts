import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { getAdminQueue } from "../services/adminQueue.service";

export async function getAdminQueueController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const centreId =
      typeof req.query.centre_id === "string"
        ? req.query.centre_id
        : undefined;

    const slotId =
      typeof req.query.slot_id === "string"
        ? req.query.slot_id
        : undefined;

    const queue = await getAdminQueue(
      centreId,
      slotId
    );

    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error(
      "Get admin queue error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to load queue",
    });
  }
}