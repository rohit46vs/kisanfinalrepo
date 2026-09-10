import { z } from "zod";

export const processPaymentSchema = z.object({
  payment_method: z
    .string()
    .trim()
    .min(2, "Payment method is required")
    .max(50, "Payment method is too long"),

  payment_reference: z
    .string()
    .trim()
    .min(3, "Payment reference is required")
    .max(100, "Payment reference is too long")
    .regex(
      /^[A-Za-z0-9._:/-]+$/,
      "Payment reference contains invalid characters"
    ),
});

export type ProcessPaymentInput = z.infer<
  typeof processPaymentSchema
>;