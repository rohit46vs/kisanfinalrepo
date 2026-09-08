import { createUserSupabaseClient } from "../config/supabaseUser";

export async function createBooking(
  accessToken: string,
  slotId: string,
  estimatedQuantityQtl?: number
) {
  const supabase = createUserSupabaseClient(
    accessToken
  );

  const { data, error } = await supabase.rpc(
    "book_slot_v2",
    {
      p_slot_id: slotId,
      p_estimated_quantity_qtl:
        estimatedQuantityQtl ?? null,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}