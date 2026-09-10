"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminQueueController = getAdminQueueController;
exports.markBookingWaitingController = markBookingWaitingController;
exports.callFarmerController = callFarmerController;
exports.markBookingGateEnteredController = markBookingGateEnteredController;
const adminQueue_service_1 = require("../services/adminQueue.service");
async function getAdminQueueController(req, res) {
    try {
        const centreId = typeof req.query.centre_id === "string"
            ? req.query.centre_id
            : undefined;
        const slotId = typeof req.query.slot_id === "string"
            ? req.query.slot_id
            : undefined;
        const queue = await (0, adminQueue_service_1.getAdminQueue)(centreId, slotId);
        return res.status(200).json({
            success: true,
            data: queue,
        });
    }
    catch (error) {
        console.error("Get admin queue error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to load queue",
        });
    }
}
async function markBookingWaitingController(req, res) {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    const bookingId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
    if (!bookingId) {
        return res.status(400).json({
            success: false,
            error: "Booking ID is required",
        });
    }
    try {
        const booking = await (0, adminQueue_service_1.markBookingWaiting)(bookingId, req.userId);
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_BOOKED") {
            return res.status(409).json({
                success: false,
                error: "Only a booked farmer can be moved to waiting",
            });
        }
        console.error("Mark booking waiting error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to move booking to waiting",
        });
    }
}
async function callFarmerController(req, res) {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    const bookingId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
    if (!bookingId) {
        return res.status(400).json({
            success: false,
            error: "Booking ID is required",
        });
    }
    try {
        const booking = await (0, adminQueue_service_1.callFarmer)(bookingId, req.userId);
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_WAITING") {
            return res.status(409).json({
                success: false,
                error: "Only a waiting farmer can be called",
            });
        }
        console.error("Call farmer error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to call farmer",
        });
    }
}
async function markBookingGateEnteredController(req, res) {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    const bookingId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
    if (!bookingId) {
        return res.status(400).json({
            success: false,
            error: "Booking ID is required",
        });
    }
    try {
        const booking = await (0, adminQueue_service_1.markBookingGateEntered)(bookingId, req.userId);
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }
        if (error instanceof Error &&
            error.message ===
                "BOOKING_NOT_CALLED") {
            return res.status(409).json({
                success: false,
                error: "Only a called farmer can enter the gate",
            });
        }
        console.error("Gate entry error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to record gate entry",
        });
    }
}
