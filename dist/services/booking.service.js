"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
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
