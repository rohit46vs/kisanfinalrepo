"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCentreSchema = exports.createCentreSchema = void 0;
const zod_1 = require("zod");
const optionalCoordinate = zod_1.z
    .number()
    .finite()
    .optional();
exports.createCentreSchema = zod_1.z.object({
    centre_code: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(30),
    name: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(150),
    state: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(100),
    district: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(100),
    address: zod_1.z
        .string()
        .trim()
        .min(5)
        .max(500),
    pincode: zod_1.z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Pincode must contain 6 digits")
        .optional(),
    latitude: optionalCoordinate
        .refine((value) => value === undefined || value >= -90, "Invalid latitude")
        .refine((value) => value === undefined || value <= 90, "Invalid latitude"),
    longitude: optionalCoordinate
        .refine((value) => value === undefined || value >= -180, "Invalid longitude")
        .refine((value) => value === undefined || value <= 180, "Invalid longitude"),
    daily_capacity: zod_1.z
        .number()
        .int()
        .positive()
        .max(100000)
        .default(100),
    weighbridge_count: zod_1.z
        .number()
        .int()
        .positive()
        .max(100)
        .default(1),
    max_hourly_capacity_qtl: zod_1.z
        .number()
        .positive()
        .max(1000000)
        .optional(),
    opening_time: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Opening time must use HH:MM")
        .default("09:00"),
    closing_time: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Closing time must use HH:MM")
        .default("17:00"),
    queue_buffer_limit: zod_1.z
        .number()
        .int()
        .nonnegative()
        .max(10000)
        .default(10),
    is_active: zod_1.z
        .boolean()
        .default(true),
});
exports.updateCentreSchema = exports.createCentreSchema.partial();
