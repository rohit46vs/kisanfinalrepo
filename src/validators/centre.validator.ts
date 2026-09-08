import { z } from "zod";

const optionalCoordinate = z
  .number()
  .finite()
  .optional();

export const createCentreSchema = z.object({
  centre_code: z
    .string()
    .trim()
    .min(2)
    .max(30),

  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  state: z
    .string()
    .trim()
    .min(2)
    .max(100),

  district: z
    .string()
    .trim()
    .min(2)
    .max(100),

  address: z
    .string()
    .trim()
    .min(5)
    .max(500),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must contain 6 digits")
    .optional(),

  latitude: optionalCoordinate
    .refine(
      (value) => value === undefined || value >= -90,
      "Invalid latitude"
    )
    .refine(
      (value) => value === undefined || value <= 90,
      "Invalid latitude"
    ),

  longitude: optionalCoordinate
    .refine(
      (value) => value === undefined || value >= -180,
      "Invalid longitude"
    )
    .refine(
      (value) => value === undefined || value <= 180,
      "Invalid longitude"
    ),

  daily_capacity: z
    .number()
    .int()
    .positive()
    .max(100000)
    .default(100),

  weighbridge_count: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(1),

  max_hourly_capacity_qtl: z
    .number()
    .positive()
    .max(1000000)
    .optional(),

  opening_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Opening time must use HH:MM"
    )
    .default("09:00"),

  closing_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Closing time must use HH:MM"
    )
    .default("17:00"),

  queue_buffer_limit: z
    .number()
    .int()
    .nonnegative()
    .max(10000)
    .default(10),

  is_active: z
    .boolean()
    .default(true),
});

export const updateCentreSchema =
  createCentreSchema.partial();