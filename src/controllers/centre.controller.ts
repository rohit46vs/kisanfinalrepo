import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

import {
  createCentreSchema,
  updateCentreSchema,
} from "../validators/centre.validator";

import {
  createCentre,
  getCentreById,
  listCentres,
  updateCentre,
} from "../services/centre.service";

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function getCentres(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const includeInactive =
      req.query.includeInactive === "true";

    const centres = await listCentres(includeInactive);

    return res.json({
      success: true,
      data: centres,
    });
  } catch (error) {
    console.error("Get centres error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch procurement centres",
    });
  }
}

export async function getCentre(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

if (typeof id !== "string" || !isValidUuid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid centre ID",
    });
  }

  try {
    const centre = await getCentreById(id);

    if (!centre) {
      return res.status(404).json({
        success: false,
        error: "Procurement centre not found",
      });
    }

    return res.json({
      success: true,
      data: centre,
    });
  } catch (error) {
    console.error("Get centre error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to fetch procurement centre",
    });
  }
}

export async function postCentre(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = createCentreSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid centre data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const centre = await createCentre(parsed.data);

    return res.status(201).json({
      success: true,
      data: centre,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CENTRE_CODE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        error: "Centre code already exists",
      });
    }

    console.error("Create centre error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create procurement centre",
    });
  }
}

export async function patchCentre(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

if (typeof id !== "string" || !isValidUuid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid centre ID",
    });
  }

  const parsed = updateCentreSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid centre data",
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
    const centre = await updateCentre(
      id,
      parsed.data
    );

    if (!centre) {
      return res.status(404).json({
        success: false,
        error: "Procurement centre not found",
      });
    }

    return res.json({
      success: true,
      data: centre,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CENTRE_CODE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        error: "Centre code already exists",
      });
    }

    console.error("Update centre error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update procurement centre",
    });
  }
}