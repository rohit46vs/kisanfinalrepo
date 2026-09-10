"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = cancelBooking;
const supabaseUser_1 = require("../config/supabaseUser");
async function cancelBooking(accessToken, bookingId) {
    const supabase = (0, supabaseUser_1.createUserSupabaseClient)(accessToken);
    const { data, error } = await supabase.rpc("cancel_my_booking", {
        p_booking_id: bookingId,
    });
    if (error) {
        throw error;
    }
    return data;
}
