import { createUserSupabaseClient } from "../config/supabaseUser";

export async function cancelBooking(
  accessToken: string,
  bookingId: string
) {
  const supabase =
    createUserSupabaseClient(accessToken);

  const { data, error } = await supabase.rpc(
    "cancel_my_booking",
    {
      p_booking_id: bookingId,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}