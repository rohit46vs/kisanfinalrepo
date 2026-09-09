"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyQueueStatus = getMyQueueStatus;
const supabase_1 = require("../config/supabase");
async function getMyQueueStatus(userId) {
    // First find the farmer's active booking.
    const { data: booking, error: bookingError } = await supabase_1.supabaseAdmin
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
            address,
            district,
            state
          )
        )
        `)
        .eq("farmer_id", userId)
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
    if (bookingError) {
        throw bookingError;
    }
    if (!booking) {
        return null;
    }
    // Count active bookings ahead of this farmer
    // in the same slot.
    let peopleAhead = 0;
    if (booking.queue_position !== null) {
        const { count, error: countError } = await supabase_1.supabaseAdmin
            .from("bookings")
            .select("id", {
            count: "exact",
            head: true,
        })
            .eq("slot_id", booking.slot_id)
            .in("status", [
            "booked",
            "waiting",
            "called",
            "arrived",
            "inspected",
            "accepted",
            "payment",
        ])
            .lt("queue_position", booking.queue_position);
        if (countError) {
            throw countError;
        }
        peopleAhead = count ?? 0;
    }
    return {
        booking_id: booking.id,
        token_number: booking.token_number,
        status: booking.status,
        queue_position: booking.queue_position,
        people_ahead: peopleAhead,
        current_stage: booking.current_stage,
        estimated_quantity_qtl: booking.estimated_quantity_qtl,
        booked_at: booking.booked_at,
        gate_pass_number: booking.gate_pass_number,
        slot: booking.slot,
    };
}
