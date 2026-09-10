"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingController = cancelBookingController;
const bookingCancellation_service_1 = require("../services/bookingCancellation.service");
async function cancelBookingController(req, res) {
    if (!req.accessToken) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    const bookingIdParam = req.params.id;
    if (!bookingIdParam ||
        Array.isArray(bookingIdParam)) {
        return res.status(400).json({
            success: false,
            error: "Invalid booking ID",
        });
    }
    const bookingId = bookingIdParam;
    try {
        const result = await (0, bookingCancellation_service_1.cancelBooking)(req.accessToken, bookingId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Unable to cancel booking";
        console.error("Cancel booking error:", error);
        if (message === "Booking not found") {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }
        if (message ===
            "This booking can no longer be cancelled") {
            return res.status(409).json({
                success: false,
                error: "This booking can no longer be cancelled.",
            });
        }
        if (message === "Authentication required") {
            return res.status(401).json({
                success: false,
                error: "Authentication required",
            });
        }
        return res.status(500).json({
            success: false,
            error: "Unable to cancel booking",
        });
    }
}
