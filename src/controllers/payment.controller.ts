import { Request, Response } from "express";
import { ZodError } from "zod";
import { processPaymentSchema } from "../validators/payment.validator";
import {
  processProcurementPayment,
} from "../services/payment.service";

function getTransactionId(req: Request): string | null {
  const value = req.params.transactionId;

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function getPerformedBy(req: Request): string | null {
  const user = (req as Request & {
    user?: {
      id?: string;
    };
  }).user;

  if (!user?.id) {
    return null;
  }

  return user.id;
}

export async function processPaymentController(
  req: Request,
  res: Response
) {
  try {
    const transactionId = getTransactionId(req);
    const performedBy = getPerformedBy(req);

    if (!transactionId) {
      return res.status(400).json({
        error: "Invalid transaction ID",
      });
    }

    if (!performedBy) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const input = processPaymentSchema.parse(req.body);

    const result = await processProcurementPayment(
      transactionId,
      performedBy,
      input.payment_method,
      input.payment_reference
    );

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid payment details",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSACTION_NOT_FOUND":
          return res.status(404).json({
            error: "Procurement transaction not found",
          });

        case "INVALID_PAYMENT_METHOD":
          return res.status(400).json({
            error: "Invalid payment method",
          });

        case "INVALID_PAYMENT_REFERENCE":
          return res.status(400).json({
            error: "Invalid payment reference",
          });

        case "INVALID_PAYMENT_AMOUNT":
          return res.status(400).json({
            error: "Invalid payment amount",
          });

        case "PAYMENT_ALREADY_COMPLETED":
          return res.status(409).json({
            error: "Payment has already been completed",
          });

        default:
          console.error(
            "Payment processing error:",
            error
          );

          return res.status(500).json({
            error: "Unable to process payment",
          });
      }
    }

    console.error(
      "Unknown payment processing error:",
      error
    );

    return res.status(500).json({
      error: "Unable to process payment",
    });
  }
}