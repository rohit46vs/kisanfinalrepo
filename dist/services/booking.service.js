"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getMyBooking = getMyBooking;
exports.getBookingById = getBookingById;
const supabaseUser_1 = require("../config/supabaseUser");
async function createBooking(accessToken, slotId, commodityId, estimatedQuantityQtl) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase.rpc("book_slot_v2", {
        p_slot_id: slotId,
        p_commodity_id: commodityId,
        p_estimated_quantity_qtl: estimatedQuantityQtl,
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
      farmer_id,
      slot_id,
      token_number,
      status,
      booked_at,
      arrived_at,
      completed_at,
      updated_at,
      commodity_id,
      estimated_quantity_qtl,
      actual_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
      commodity:commodities (
        id,
        name,
        code,
        category,
        storage_requirement
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
      `)
        .order("booked_at", {
        ascending: false,
    });
    if (error) {
        throw error;
    }
    return data ?? [];
}
async function getBookingById(accessToken, bookingId) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase
        .from("bookings")
        .select(`
      id,
      farmer_id,
      slot_id,
      token_number,
      status,
      booked_at,
      arrived_at,
      completed_at,
      updated_at,
      commodity_id,
      estimated_quantity_qtl,
      actual_quantity_qtl,
      qr_token,
      gate_pass_number,
      queue_position,
      current_stage,
      commodity:commodities (
        id,
        name,
        code,
        category,
        storage_requirement
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
      `)
        .eq("id", bookingId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
