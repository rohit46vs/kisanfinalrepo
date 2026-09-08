import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { createBookingSchema } from "../validators/booking.validator";
import { createBooking } from "../services/booking.service";

export async function postBooking(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.accessToken) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const parsed = createBookingSchema.safeParse(
    req.body
  );

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid booking data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const booking = await createBooking(
      req.accessToken,
      parsed.data.slot_id,
      parsed.data.estimated_quantity_qtl
    );

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(error.code)
        : undefined;

    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error
        ? String(error.message)
        : "";

    if (message.includes("DUPLICATE_BOOKING")) {
      return res.status(409).json({
        success: false,
        error: "You already have a booking for this slot",
      });
    }

    if (message.includes("SLOT_FULL")) {
      return res.status(409).json({
        success: false,
        error: "This slot is full",
      });
    }

    if (message.includes("SLOT_CLOSED")) {
      return res.status(409).json({
        success: false,
        error: "This slot is currently closed",
      });
    }

    if (message.includes("SLOT_DATE_PASSED")) {
      return res.status(409).json({
        success: false,
        error: "This slot date has already passed",
      });
    }

    if (
      message.includes("FARMER_ACCESS_REQUIRED") ||
      code === "42501"
    ) {
      return res.status(403).json({
        success: false,
        error: "Farmer access required",
      });
    }

    if (message.includes("AUTHENTICATION_REQUIRED")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create booking",
    });
  }
}