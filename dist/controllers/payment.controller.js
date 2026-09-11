"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsController = getPaymentsController;
exports.processPaymentController = processPaymentController;
const zod_1 = require("zod");
const payment_validator_1 = require("../validators/payment.validator");
const payment_service_1 = require("../services/payment.service");
function getTransactionId(req) {
    const value = req.params.transactionId;
    if (typeof value !== "string" ||
        value.trim() === "") {
        return null;
    }
    return value.trim();
}
function getPerformedBy(req) {
    if (!req.userId) {
        return null;
    }
    return req.userId;
}
async function getPaymentsController(req, res) {
    try {
        const rawStatus = typeof req.query.status === "string"
            ? req.query.status
                .trim()
                .toLowerCase()
            : undefined;
        const allowedStatuses = [
            "pending",
            "processing",
            "credited",
            "failed",
        ];
        const status = rawStatus &&
            allowedStatuses.includes(rawStatus)
            ? rawStatus
            : undefined;
        const data = await (0, payment_service_1.getProcurementPayments)(status);
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("Get procurement payments error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to load procurement payments",
        });
    }
}
async function processPaymentController(req, res) {
    try {
        const transactionId = getTransactionId(req);
        const performedBy = getPerformedBy(req);
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: "Invalid transaction ID",
            });
        }
        if (!performedBy) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        }
        const input = payment_validator_1.processPaymentSchema.parse(req.body);
        const result = await (0, payment_service_1.processProcurementPayment)(transactionId, performedBy, input.payment_method, input.payment_reference);
        return res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            data: result,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
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
                        success: false,
                        error: "Procurement transaction not found",
                    });
                case "INVALID_PAYMENT_METHOD":
                    return res.status(400).json({
                        success: false,
                        error: "Invalid payment method",
                    });
                case "INVALID_PAYMENT_REFERENCE":
                    return res.status(400).json({
                        success: false,
                        error: "Invalid payment reference",
                    });
                case "INVALID_PAYMENT_AMOUNT":
                    return res.status(400).json({
                        success: false,
                        error: "Invalid payment amount",
                    });
                case "PAYMENT_ALREADY_COMPLETED":
                    return res.status(409).json({
                        success: false,
                        error: "Payment has already been completed",
                    });
                default:
                    console.error("Payment processing error:", error);
                    return res.status(500).json({
                        success: false,
                        error: "Unable to process payment",
                    });
            }
        }
        console.error("Unknown payment processing error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to process payment",
        });
    }
}
