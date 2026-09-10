"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postBooking = postBooking;
exports.getMyBookingController = getMyBookingController;
exports.getBookingByIdController = getBookingByIdController;
const booking_validator_1 = require("../validators/booking.validator");
const booking_service_1 = require("../services/booking.service");
async function postBooking(req, res) {
    if (!req.accessToken) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    const parsed = booking_validator_1.createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid booking data",
            details: parsed.error.flatten().fieldErrors,
        });
    }
    try {
        const booking = await (0, booking_service_1.createBooking)(req.accessToken, parsed.data.slot_id, parsed.data.commodity_id, parsed.data.estimated_quantity_qtl);
        return res.status(201).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        const code = typeof error === "object" &&
            error !== null &&
            "code" in error
            ? String(error.code)
            : undefined;
        const message = typeof error === "object" &&
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
        if (message.includes("COMMODITY_NOT_FOUND") ||
            message.includes("INVALID_COMMODITY")) {
            return res.status(400).json({
                success: false,
                error: "Please select a valid crop type",
            });
        }
        if (message.includes("FARMER_ACCESS_REQUIRED") ||
            code === "42501") {
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
async function getMyBookingController(req, res) {
    if (!req.accessToken) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    try {
        const booking = await (0, booking_service_1.getMyBooking)(req.accessToken);
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        console.error("Get my booking error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to load booking",
        });
    }
}
async function getBookingByIdController(req, res) {
    if (!req.accessToken) {
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
        const booking = await (0, booking_service_1.getBookingById)(req.accessToken, bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        console.error("Get booking by ID error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to load booking",
        });
    }
}
