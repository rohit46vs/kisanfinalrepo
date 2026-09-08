import { supabaseAdmin } from "../config/supabase";

export async function listCentres(includeInactive = false) {
  let query = supabaseAdmin
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

export async function getCentreById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("procurement_centres")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch procurement centre");
  }

  return data;
}

export async function createCentre(
  centre: Record<string, unknown>
) {
  const { data, error } = await supabaseAdmin
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

export async function updateCentre(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabaseAdmin
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