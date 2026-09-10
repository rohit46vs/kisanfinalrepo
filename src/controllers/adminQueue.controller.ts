import type { Request, Response } from "express";

import {
  getAdminQueue,
  markBookingWaiting,
  callFarmer,
  markBookingGateEntered,
  startWeighing,
  completeWeighing,
  completeQualityInspection,
  completeBagging,
} from "../services/adminQueue.service";

import type { AuthenticatedRequest } from "../middleware/auth";

function getBookingId(
  req: Request
): string {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    throw new Error(
      "BOOKING_ID_REQUIRED"
    );
  }

  return id;
}

function getPerformedBy(
  req: AuthenticatedRequest
): string {
  if (!req.userId) {
    throw new Error(
      "AUTHENTICATION_REQUIRED"
    );
  }

  return req.userId;
}

export async function getAdminQueueController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const centreId =
      typeof req.query.centre_id ===
      "string"
        ? req.query.centre_id
        : undefined;

    const slotId =
      typeof req.query.slot_id ===
      "string"
        ? req.query.slot_id
        : undefined;

    const data =
      await getAdminQueue(
        centreId,
        slotId
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Admin queue error:",
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
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const data =
      await markBookingWaiting(
        bookingId,
        performedBy
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Mark waiting error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to move booking to waiting";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : message ===
            "BOOKING_NOT_BOOKED"
          ? 409
          : 500;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_BOOKED"
            ? "Booking is no longer in booked status"
            : "Unable to move booking to waiting",
    });
  }
}

export async function callFarmerController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const data =
      await callFarmer(
        bookingId,
        performedBy
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Call farmer error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to call farmer";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : message ===
            "BOOKING_NOT_WAITING"
          ? 409
          : 500;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_WAITING"
            ? "Booking is not currently waiting"
            : "Unable to call farmer",
    });
  }
}

export async function markBookingGateEnteredController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const data =
      await markBookingGateEntered(
        bookingId,
        performedBy
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Gate entry error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to record gate entry";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : message ===
            "BOOKING_NOT_CALLED"
          ? 409
          : 500;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_CALLED"
            ? "Booking must be called before gate entry"
            : "Unable to record gate entry",
    });
  }
}

export async function startWeighingController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const data =
      await startWeighing(
        bookingId,
        performedBy
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Start weighing error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to start weighing";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : message ===
            "BOOKING_NOT_AT_GATE"
          ? 409
          : 500;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_AT_GATE"
            ? "Booking must be at the gate before weighing"
            : "Unable to start weighing",
    });
  }
}

export async function completeWeighingController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const quantity =
      Number(
        req.body?.actual_quantity_qtl
      );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Actual quantity must be greater than 0 QTL",
      });
    }

    if (quantity > 1000) {
      return res.status(400).json({
        success: false,
        error:
          "Actual quantity cannot exceed 1000 QTL",
      });
    }

    const data =
      await completeWeighing(
        bookingId,
        performedBy,
        quantity
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Complete weighing error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete weighing";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : 409;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_WEIGHING"
            ? "Booking is not currently at the weighbridge"
            : message ===
                "INVALID_QUANTITY"
              ? "Invalid quantity"
              : message ===
                  "QUANTITY_TOO_LARGE"
                ? "Quantity cannot exceed 1000 QTL"
                : "Unable to complete weighing",
    });
  }
}

export async function completeQualityInspectionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const grade =
      typeof req.body?.grade ===
      "string"
        ? req.body.grade
        : "";

    const remarks =
      typeof req.body?.remarks ===
      "string"
        ? req.body.remarks
        : null;

    const accepted =
      req.body?.accepted;

    if (
      !["A", "B", "C"].includes(
        grade.toUpperCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Quality grade must be A, B, or C",
      });
    }

    if (
      typeof accepted !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Quality decision is required",
      });
    }

    const data =
      await completeQualityInspection(
        bookingId,
        performedBy,
        grade,
        remarks,
        accepted
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Quality inspection error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete quality inspection";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : 409;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_AT_QUALITY"
            ? "Booking is not currently at quality inspection"
            : message ===
                "INVALID_GRADE"
              ? "Invalid quality grade"
              : message ===
                  "INVALID_DECISION"
                ? "Invalid quality decision"
                : "Unable to complete quality inspection",
    });
  }
}

export async function completeBaggingController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId =
      getBookingId(req);

    const performedBy =
      getPerformedBy(req);

    const data =
      await completeBagging(
        bookingId,
        performedBy
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Complete bagging error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete bagging";

    const status =
      message ===
      "BOOKING_NOT_FOUND"
        ? 404
        : 409;

    return res.status(status).json({
      success: false,
      error:
        message ===
        "BOOKING_NOT_FOUND"
          ? "Booking not found"
          : message ===
              "BOOKING_NOT_AT_BAGGING"
            ? "Booking is not currently at bagging"
            : message ===
                "BOOKING_CENTRE_NOT_FOUND"
              ? "Procurement centre could not be resolved"
              : message ===
                  "QUANTITY_NOT_AVAILABLE"
                ? "Actual quantity is required before bagging"
                : "Unable to complete bagging",
    });
  }
}