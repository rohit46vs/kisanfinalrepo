"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCentres = listCentres;
exports.getCentreById = getCentreById;
exports.createCentre = createCentre;
exports.updateCentre = updateCentre;
const supabase_1 = require("../config/supabase");
async function listCentres(includeInactive = false) {
    let query = supabase_1.supabaseAdmin
        .from("procurement_centres")
        .select("*")
        .order("name", { ascending: true });
    if (!includeInactive) {
        query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (error) {
        throw new Error("Failed to fetch procurement centres");
    }
    return data;
}
async function getCentreById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("procurement_centres")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw new Error("Failed to fetch procurement centre");
    }
    return data;
}
async function createCentre(centre) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("procurement_centres")
        .insert(centre)
        .select("*")
        .single();
    if (error) {
        if (error.code === "23505") {
            throw new Error("CENTRE_CODE_EXISTS");
        }
        throw new Error("Failed to create procurement centre");
    }
    return data;
}
async function updateCentre(id, updates) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("procurement_centres")
        .update(updates)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        if (error.code === "23505") {
            throw new Error("CENTRE_CODE_EXISTS");
        }
        throw new Error("Failed to update procurement centre");
    }
    return data;
}
