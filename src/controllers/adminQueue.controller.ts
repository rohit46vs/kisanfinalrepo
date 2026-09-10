import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

import {
  getAdminQueue,
  markBookingWaiting,
  callFarmer,
  markBookingGateEntered,
  startWeighing,
} from "../services/adminQueue.service";

function getBookingId(
  req: AuthenticatedRequest
) {
  return Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
}

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

export async function markBookingWaitingController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const bookingId = getBookingId(req);

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      error: "Booking ID is required",
    });
  }

  try {
    const booking =
      await markBookingWaiting(
        bookingId,
        req.userId
      );

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_BOOKED"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "Only a booked farmer can be moved to waiting",
      });
    }

    console.error(
      "Mark booking waiting error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Unable to move booking to waiting",
    });
  }
}

export async function callFarmerController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const bookingId = getBookingId(req);

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      error: "Booking ID is required",
    });
  }

  try {
    const booking = await callFarmer(
      bookingId,
      req.userId
    );

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_WAITING"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "Only a waiting farmer can be called",
      });
    }

    console.error(
      "Call farmer error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to call farmer",
    });
  }
}

export async function markBookingGateEnteredController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const bookingId = getBookingId(req);

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      error: "Booking ID is required",
    });
  }

  try {
    const booking =
      await markBookingGateEntered(
        bookingId,
        req.userId
      );

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_CALLED"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "Only a called farmer can enter the gate",
      });
    }

    console.error(
      "Gate entry error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to record gate entry",
    });
  }
}

export async function startWeighingController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const bookingId = getBookingId(req);

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      error: "Booking ID is required",
    });
  }

  try {
    const booking = await startWeighing(
      bookingId,
      req.userId
    );

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "BOOKING_NOT_AT_GATE"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "Only a farmer at the gate can start weighing",
      });
    }

    console.error(
      "Start weighing error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to start weighing",
    });
  }
}