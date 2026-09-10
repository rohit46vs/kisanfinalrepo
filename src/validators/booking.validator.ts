import { z } from "zod";

const quantitySchema = z
  .number()
  .positive("Estimated quantity must be greater than 0")
  .max(1000, "Estimated quantity is too large");

export const createBookingSchema = z.object({
  slot_id: z.string().uuid("Invalid slot ID"),

  commodity_id: z
    .string()
    .uuid("Invalid crop type"),

  estimated_quantity_qtl: quantitySchema,
});

export const updateBookingSchema = z.object({
  status: z
    .enum([
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
    ])
    .optional(),

  commodity_id: z
    .string()
    .uuid("Invalid crop type")
    .optional(),

  estimated_quantity_qtl: quantitySchema.optional(),
});