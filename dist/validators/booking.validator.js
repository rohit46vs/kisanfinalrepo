"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
const bookingFields = {
    slot_id: zod_1.z.string().uuid("Invalid slot ID"),
    estimated_quantity_qtl: zod_1.z
        .number()
        .positive("Estimated quantity must be greater than 0")
        .max(1000, "Estimated quantity is too large")
        .optional(),
};
exports.createBookingSchema = zod_1.z.object(bookingFields);
exports.updateBookingSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "booked",
        "waiting",
        "called",
        "arrived",
        "inspected",
        "accepted",
        "rejected",
        "payment",
        "completed",
        "skipped",
    ]).optional(),
    estimated_quantity_qtl: zod_1.z
        .number()
        .positive("Estimated quantity must be greater than 0")
        .max(1000, "Estimated quantity is too large")
        .optional(),
});
