"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentSchema = void 0;
const zod_1 = require("zod");
exports.processPaymentSchema = zod_1.z.object({
    payment_method: zod_1.z
        .string()
        .trim()
        .min(2, "Payment method is required")
        .max(50, "Payment method is too long"),
    payment_reference: zod_1.z
        .string()
        .trim()
        .min(3, "Payment reference is required")
        .max(100, "Payment reference is too long")
        .regex(/^[A-Za-z0-9._:/-]+$/, "Payment reference contains invalid characters"),
});
