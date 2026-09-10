import { createUserSupabaseClient } from "../config/supabaseUser";

export async function createBooking(
  accessToken: string,
  slotId: string,
  commodityId: string,
  estimatedQuantityQtl: number
) {
  const supabase =
    createUserSupabaseClient(accessToken);

  const { data, error } = await supabase.rpc(
    "book_slot_v2",
    {
      p_slot_id: slotId,
      p_commodity_id: commodityId,
      p_estimated_quantity_qtl:
        estimatedQuantityQtl,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyBooking(
  accessToken: string
) {
  const supabase =
    createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      token_number,
      status,
      booked_at,
      commodity_id,
      estimated_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
      commodity:commodities (
        id,
        name
      ),
      slot:slots (
        id,
        slot_date,
        start_time,
        end_time,
        centre:procurement_centres (
          id,
          centre_code,
          name,
          address,
          district,
          state,
          pincode
        )
      )
      `
    )
    .in("status", [
      "booked",
      "waiting",
      "called",
      "arrived",
      "inspected",
      "accepted",
      "payment",
    ])
    .order("booked_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getBookingById(
  accessToken: string,
  bookingId: string
) {
  const supabase =
    createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      token_number,
      status,
      booked_at,
      commodity_id,
      estimated_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
      commodity:commodities (
        id,
        name
      ),
      slot:slots (
        id,
        slot_date,
        start_time,
        end_time,
        centre:procurement_centres (
          id,
          centre_code,
          name,
          address,
          district,
          state,
          pincode
        )
      )
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}