"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getMyBooking = getMyBooking;
exports.getBookingById = getBookingById;
const supabaseUser_1 = require("../config/supabaseUser");
async function createBooking(accessToken, slotId, estimatedQuantityQtl) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase.rpc("book_slot_v2", {
        p_slot_id: slotId,
        p_estimated_quantity_qtl: estimatedQuantityQtl ?? null,
    });
    if (error) {
        throw error;
    }
    return data;
}
async function getMyBooking(accessToken) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase
        .from("bookings")
        .select(`
      id,
      token_number,
      status,
      booked_at,
      estimated_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
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
      `)
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
async function getBookingById(accessToken, bookingId) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase
        .from("bookings")
        .select(`
      id,
      token_number,
      status,
      booked_at,
      estimated_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
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
      `)
        .eq("id", bookingId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
