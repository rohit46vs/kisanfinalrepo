import { z } from "zod";

const bookingFields = {
  slot_id: z.string().uuid("Invalid slot ID"),
  estimated_quantity_qtl: z
    .number()
    .positive("Estimated quantity must be greater than 0")
    .max(1000, "Estimated quantity is too large")
    .optional(),
};

export const createBookingSchema = z.object(bookingFields);

export const updateBookingSchema = z.object({
  status: z.enum([
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

  estimated_quantity_qtl: z
    .number()
    .positive("Estimated quantity must be greater than 0")
    .max(1000, "Estimated quantity is too large")
    .optional(),
});