"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCentres = getCentres;
exports.getCentre = getCentre;
exports.postCentre = postCentre;
exports.patchCentre = patchCentre;
const centre_validator_1 = require("../validators/centre.validator");
const centre_service_1 = require("../services/centre.service");
function isValidUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function getCentres(req, res) {
    try {
        const includeInactive = req.query.includeInactive === "true";
        const centres = await (0, centre_service_1.listCentres)(includeInactive);
        return res.json({
            success: true,
            data: centres,
        });
    }
    catch (error) {
        console.error("Get centres error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to fetch procurement centres",
        });
    }
}
async function getCentre(req, res) {
    const { id } = req.params;
    if (typeof id !== "string" || !isValidUuid(id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid centre ID",
        });
    }
    try {
        const centre = await (0, centre_service_1.getCentreById)(id);
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
    }
    catch (error) {
        console.error("Get centre error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to fetch procurement centre",
        });
    }
}
async function postCentre(req, res) {
    const parsed = centre_validator_1.createCentreSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid centre data",
            details: parsed.error.flatten().fieldErrors,
        });
    }
    try {
        const centre = await (0, centre_service_1.createCentre)(parsed.data);
        return res.status(201).json({
            success: true,
            data: centre,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "CENTRE_CODE_EXISTS") {
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
async function patchCentre(req, res) {
    const { id } = req.params;
    if (typeof id !== "string" || !isValidUuid(id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid centre ID",
        });
    }
    const parsed = centre_validator_1.updateCentreSchema.safeParse(req.body);
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
        const centre = await (0, centre_service_1.updateCentre)(id, parsed.data);
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
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "CENTRE_CODE_EXISTS") {
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
