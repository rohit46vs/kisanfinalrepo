"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlots = getSlots;
exports.getSlot = getSlot;
exports.postSlot = postSlot;
exports.patchSlot = patchSlot;
const slot_validator_1 = require("../validators/slot.validator");
const slot_service_1 = require("../services/slot.service");
function isValidUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function getSlots(req, res) {
    try {
        const centreId = typeof req.query.centreId === "string"
            ? req.query.centreId
            : undefined;
        const date = typeof req.query.date === "string"
            ? req.query.date
            : undefined;
        const includeInactive = req.query.includeInactive === "true";
        if (centreId && !isValidUuid(centreId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid centre ID",
            });
        }
        if (date &&
            !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                error: "Invalid date",
            });
        }
        const slots = await (0, slot_service_1.listSlots)(centreId, date, includeInactive);
        return res.json({
            success: true,
            data: slots,
        });
    }
    catch (error) {
        console.error("Get slots error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to fetch slots",
        });
    }
}
async function getSlot(req, res) {
    const { id } = req.params;
    if (typeof id !== "string" ||
        !isValidUuid(id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid slot ID",
        });
    }
    try {
        const slot = await (0, slot_service_1.getSlotById)(id);
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
    }
    catch (error) {
        console.error("Get slot error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to fetch slot",
        });
    }
}
async function postSlot(req, res) {
    const parsed = slot_validator_1.createSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid slot data",
            details: parsed.error.flatten().fieldErrors,
        });
    }
    try {
        const slot = await (0, slot_service_1.createSlot)(parsed.data);
        return res.status(201).json({
            success: true,
            data: slot,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SLOT_EXISTS") {
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
async function patchSlot(req, res) {
    const { id } = req.params;
    if (typeof id !== "string" ||
        !isValidUuid(id)) {
        return res.status(400).json({
            success: false,
            error: "Invalid slot ID",
        });
    }
    const parsed = slot_validator_1.updateSlotSchema.safeParse(req.body);
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
        const slot = await (0, slot_service_1.updateSlot)(id, parsed.data);
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
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "SLOT_EXISTS") {
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
