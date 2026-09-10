"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminQueue = getAdminQueue;
exports.markBookingWaiting = markBookingWaiting;
exports.callFarmer = callFarmer;
exports.markBookingGateEntered = markBookingGateEntered;
const supabase_1 = require("../config/supabase");
const ACTIVE_STATUSES = [
    "booked",
    "waiting",
    "called",
    "arrived",
    "inspected",
    "accepted",
    "payment",
];
async function getAdminQueue(centreId, slotId) {
    let query = supabase_1.supabaseAdmin
        .from("bookings")
        .select(`
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
      `)
        .in("status", ACTIVE_STATUSES)
        .order("queue_position", {
        ascending: true,
        nullsFirst: false,
    });
    if (centreId) {
        query = query.eq("slot.centre_id", centreId);
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
async function markBookingWaiting(bookingId, performedBy) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc("mark_booking_waiting", {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
    });
    if (error) {
        throw error;
    }
    return data;
}
async function callFarmer(bookingId, performedBy) {
    const { data: booking, error: bookingError, } = await supabase_1.supabaseAdmin
        .from("bookings")
        .select(`
      id,
      centre_id,
      status,
      current_stage,
      queue_position
      `)
        .eq("id", bookingId)
        .maybeSingle();
    if (bookingError) {
        throw bookingError;
    }
    if (!booking) {
        const error = new Error("BOOKING_NOT_FOUND");
        throw error;
    }
    if (booking.status !== "waiting") {
        const error = new Error("BOOKING_NOT_WAITING");
        throw error;
    }
    const { data: updatedBooking, error: updateError, } = await supabase_1.supabaseAdmin
        .from("bookings")
        .update({
        status: "called",
    })
        .eq("id", bookingId)
        .eq("status", "waiting")
        .select(`
      id,
      token_number,
      status,
      queue_position,
      current_stage,
      gate_pass_number
      `)
        .single();
    if (updateError) {
        throw updateError;
    }
    const { error: eventError } = await supabase_1.supabaseAdmin
        .from("queue_events")
        .insert({
        booking_id: booking.id,
        centre_id: booking.centre_id,
        event_type: "called",
        from_stage: booking.current_stage,
        to_stage: booking.current_stage,
        performed_by: performedBy,
        metadata: {
            previous_status: booking.status,
            new_status: "called",
            queue_position: booking.queue_position,
        },
    });
    if (eventError) {
        throw eventError;
    }
    return updatedBooking;
}
async function markBookingGateEntered(bookingId, performedBy) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc("mark_booking_gate_entered", {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
    });
    if (error) {
        if (error.message.includes("BOOKING_NOT_FOUND")) {
            throw new Error("BOOKING_NOT_FOUND");
        }
        if (error.message.includes("BOOKING_NOT_CALLED")) {
            throw new Error("BOOKING_NOT_CALLED");
        }
        throw error;
    }
    return data;
}
