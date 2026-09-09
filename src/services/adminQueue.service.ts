import { supabaseAdmin } from "../config/supabase";

const ACTIVE_STATUSES = [
  "booked",
  "waiting",
  "called",
  "arrived",
  "inspected",
  "accepted",
  "payment",
];

export async function getAdminQueue(
  centreId?: string,
  slotId?: string
) {
  let query = supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      farmer_id,
      slot_id,
      token_number,
      status,
      queue_position,
      current_stage,
      estimated_quantity_qtl,
      booked_at,
      arrived_at,
      gate_pass_number,
      slot:slots (
        id,
        slot_date,
        start_time,
        end_time,
        centre:procurement_centres (
          id,
          centre_code,
          name,
          district,
          state
        )
      )
      `
    )
    .in("status", ACTIVE_STATUSES)
    .order("queue_position", {
      ascending: true,
      nullsFirst: false,
    });

  if (centreId) {
    query = query.eq(
      "slot.centre_id",
      centreId
    );
  }

  if (slotId) {
    query = query.eq("slot_id", slotId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}