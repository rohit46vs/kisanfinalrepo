"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSlots = listSlots;
exports.getSlotById = getSlotById;
exports.createSlot = createSlot;
exports.updateSlot = updateSlot;
const supabase_1 = require("../config/supabase");
async function listSlots(centreId, date, includeInactive = false) {
    let query = supabase_1.supabaseAdmin
        .from("slots")
        .select("*")
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
    if (centreId) {
        query = query.eq("centre_id", centreId);
    }
    if (date) {
        query = query.eq("slot_date", date);
    }
    if (!includeInactive) {
        query = query.eq("is_active", true);
    }
    const { data: slots, error } = await query;
    if (error) {
        throw new Error("Failed to fetch slots");
    }
    if (!slots || slots.length === 0) {
        return [];
    }
    const slotIds = slots.map((slot) => slot.id);
    const { data: bookings, error: bookingError } = await supabase_1.supabaseAdmin
        .from("bookings")
        .select("slot_id, status")
        .in("slot_id", slotIds);
    if (bookingError) {
        throw new Error("Failed to calculate slot availability");
    }
    const bookingCounts = new Map();
    for (const booking of bookings ?? []) {
        const activeStatuses = [
            "booked",
            "waiting",
            "called",
            "arrived",
            "inspected",
        ];
        if (!activeStatuses.includes(booking.status)) {
            continue;
        }
        bookingCounts.set(booking.slot_id, (bookingCounts.get(booking.slot_id) ?? 0) + 1);
    }
    return slots.map((slot) => {
        const activeBookings = bookingCounts.get(slot.id) ?? 0;
        const databaseBookedCount = Number(slot.booked_count ?? 0);
        const bookedCount = Math.max(databaseBookedCount, activeBookings);
        const remainingCapacity = Math.max(Number(slot.capacity) - bookedCount, 0);
        let calculatedStatus = slot.status;
        if (!slot.is_active) {
            calculatedStatus = "closed";
        }
        else if (remainingCapacity === 0) {
            calculatedStatus = "full";
        }
        else if (remainingCapacity <=
            Math.max(1, Math.ceil(Number(slot.capacity) * 0.2))) {
            calculatedStatus = "limited";
        }
        else {
            calculatedStatus = "open";
        }
        return {
            ...slot,
            booked_count: bookedCount,
            remaining_capacity: remainingCapacity,
            availability_percentage: Number(slot.capacity) > 0
                ? Math.round((remainingCapacity /
                    Number(slot.capacity)) *
                    100)
                : 0,
            calculated_status: calculatedStatus,
        };
    });
}
async function getSlotById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("slots")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw new Error("Failed to fetch slot");
    }
    return data;
}
async function createSlot(slot) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("slots")
        .insert(slot)
        .select("*")
        .single();
    if (error) {
        if (error.code === "23505") {
            throw new Error("SLOT_EXISTS");
        }
        throw new Error("Failed to create slot");
    }
    return data;
}
async function updateSlot(id, updates) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("slots")
        .update(updates)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        if (error.code === "23505") {
            throw new Error("SLOT_EXISTS");
        }
        throw new Error("Failed to update slot");
    }
    return data;
}
