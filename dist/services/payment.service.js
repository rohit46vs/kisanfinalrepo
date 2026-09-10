"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProcurementPayment = processProcurementPayment;
const supabase_1 = require("../config/supabase");
async function processProcurementPayment(transactionId, performedBy, paymentMethod, paymentReference) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc("process_procurement_payment", {
        p_transaction_id: transactionId,
        p_performed_by: performedBy,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference,
    });
    if (error) {
        const message = error.message || "";
        if (message.includes("TRANSACTION_NOT_FOUND")) {
            throw new Error("TRANSACTION_NOT_FOUND");
        }
        if (message.includes("INVALID_PAYMENT_METHOD")) {
            throw new Error("INVALID_PAYMENT_METHOD");
        }
        if (message.includes("INVALID_PAYMENT_REFERENCE")) {
            throw new Error("INVALID_PAYMENT_REFERENCE");
        }
        if (message.includes("INVALID_PAYMENT_AMOUNT")) {
            throw new Error("INVALID_PAYMENT_AMOUNT");
        }
        if (message.includes("PAYMENT_ALREADY_COMPLETED")) {
            throw new Error("PAYMENT_ALREADY_COMPLETED");
        }
        throw error;
    }
    return data;
}
