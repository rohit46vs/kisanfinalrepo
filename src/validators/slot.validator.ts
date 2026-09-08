import { z } from "zod";

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must use HH:MM format"
  );

const slotFields = {
  slot_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must use YYYY-MM-DD format"
    ),

  start_time: timeSchema,

  end_time: timeSchema,

  capacity: z
    .number()
    .int()
    .positive()
    .max(10000),

  estimated_capacity_qtl: z
    .number()
    .positive()
    .max(1000000)
    .optional(),

  dynamic_capacity_enabled: z
    .boolean()
    .default(true),

  is_active: z
    .boolean()
    .default(true),
};

export const createSlotSchema = z
  .object({
    centre_id: z.string().uuid(),

    ...slotFields,
  })
  .refine(
    (data) => data.end_time > data.start_time,
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export const updateSlotSchema = z
  .object({
    ...slotFields,
  })
  .partial()
  .refine(
    (data) => {
      if (
        data.start_time !== undefined &&
        data.end_time !== undefined
      ) {
        return data.end_time > data.start_time;
      }

      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );