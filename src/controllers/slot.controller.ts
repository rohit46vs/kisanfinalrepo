import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

import {
  createSlotSchema,
  updateSlotSchema,
} from "../validators/slot.validator";

import {
  createSlot,
  getSlotById,
  listSlots,
  updateSlot,
} from "../services/slot.service";

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function getSlots(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const centreId =
      typeof req.query.centreId === "string"
        ? req.query.centreId
        : undefined;

    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    const includeInactive =
      req.query.includeInactive === "true";

    if (centreId && !isValidUuid(centreId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid centre ID",
      });
    }

    if (
      date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid date",
      });
    }

    const slots = await listSlots(
      centreId,
      date,
      includeInactive
    );

    return res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Get slots error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch slots",
    });
  }
}

export async function getSlot(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

  if (
    typeof id !== "string" ||
    !isValidUuid(id)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid slot ID",
    });
  }

  try {
    const slot = await getSlotById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: "Slot not found",
      });
    }

    return res.json({
      success: true,
      data: slot,
    });
  } catch (error) {
    console.error("Get slot error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch slot",
    });
  }
}

export async function postSlot(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = createSlotSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid slot data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const slot = await createSlot(parsed.data);

    return res.status(201).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SLOT_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        error: "A slot already exists for this time window",
      });
    }

    console.error("Create slot error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create slot",
    });
  }
}

export async function patchSlot(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

  if (
    typeof id !== "string" ||
    !isValidUuid(id)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid slot ID",
    });
  }

  const parsed = updateSlotSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid slot data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({
      success: false,
      error: "No update fields provided",
    });
  }

  try {
    const slot = await updateSlot(
      id,
      parsed.data
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: "Slot not found",
      });
    }

    return res.json({
      success: true,
      data: slot,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SLOT_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        error: "A slot already exists for this time window",
      });
    }

    console.error("Update slot error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update slot",
    });
  }
}