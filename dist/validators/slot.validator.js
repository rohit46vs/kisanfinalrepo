"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSlotSchema = exports.createSlotSchema = void 0;
const zod_1 = require("zod");
const timeSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:MM format");
const slotFields = {
    slot_date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format"),
    start_time: timeSchema,
    end_time: timeSchema,
    capacity: zod_1.z
        .number()
        .int()
        .positive()
        .max(10000),
    estimated_capacity_qtl: zod_1.z
        .number()
        .positive()
        .max(1000000)
        .optional(),
    dynamic_capacity_enabled: zod_1.z
        .boolean()
        .default(true),
    is_active: zod_1.z
        .boolean()
        .default(true),
};
exports.createSlotSchema = zod_1.z
    .object({
    centre_id: zod_1.z.string().uuid(),
    ...slotFields,
})
    .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
});
exports.updateSlotSchema = zod_1.z
    .object({
    ...slotFields,
})
    .partial()
    .refine((data) => {
    if (data.start_time !== undefined &&
        data.end_time !== undefined) {
        return data.end_time > data.start_time;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["end_time"],
});
