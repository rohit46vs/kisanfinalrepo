import { supabaseAdmin } from "../config/supabase";

const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "credited",
  "failed",
] as const;

export async function getProcurementPayments(
  status?: string
) {
  let query = supabaseAdmin
    .from("procurement_transactions")
    .select(
      `
      id,
      booking_id,
      farmer_id,
      centre_id,
      crop_name,
      quantity_kg,
      rate_per_kg,
      gross_amount,
      deductions,
      net_amount,
      status,
      authorized_by,
      authorized_at,
      created_at,
      updated_at,
      receipt_number,
      j_form_number,
      payment_status,
      payment_reference,
      payment_initiated_at,
      payment_completed_at,
      farmer:profiles!procurement_transactions_farmer_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      centre:procurement_centres!procurement_transactions_centre_id_fkey (
        id,
        centre_code,
        name,
        district,
        state
      ),
      booking:bookings!procurement_transactions_booking_id_fkey (
        id,
        token_number,
        status,
        queue_position,
        current_stage,
        estimated_quantity_qtl,
        actual_quantity_qtl
      )
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(200);

  if (
    status &&
    PAYMENT_STATUSES.includes(
      status as (typeof PAYMENT_STATUSES)[number]
    )
  ) {
    query = query.eq("payment_status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function processProcurementPayment(
  transactionId: string,
  performedBy: string,
  paymentMethod: string,
  paymentReference: string
) {
  const { data, error } = await supabaseAdmin.rpc(
    "process_procurement_payment",
    {
      p_transaction_id: transactionId,
      p_performed_by: performedBy,
      p_payment_method: paymentMethod,
      p_payment_reference: paymentReference,
    }
  );

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