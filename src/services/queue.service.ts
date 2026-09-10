import { supabaseAdmin } from "../config/supabase";

const ACTIVE_QUEUE_STATUSES = [
  "booked",
  "waiting",
  "called",
  "arrived",
  "inspected",
  "accepted",
  "payment",
];

export async function getMyQueueStatus(
  userId: string
) {
  const {
    data: bookings,
    error: bookingError,
  } = await supabaseAdmin
    .from("bookings")
    .select(
      `
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
      `
    )
    .eq("farmer_id", userId)
    .in("status", ACTIVE_QUEUE_STATUSES)
    .order("booked_at", {
      ascending: false,
    });

  if (bookingError) {
    throw bookingError;
  }

  if (!bookings || bookings.length === 0) {
    return [];
  }

  const queues = await Promise.all(
    bookings.map(async (booking) => {
      let peopleAhead = 0;

      if (booking.queue_position !== null) {
        const {
          count,
          error: countError,
        } = await supabaseAdmin
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("slot_id", booking.slot_id)
          .in("status", ACTIVE_QUEUE_STATUSES)
          .lt(
            "queue_position",
            booking.queue_position
          );

        if (countError) {
          throw countError;
        }

        peopleAhead = count ?? 0;
      }

      return {
        booking_id: booking.id,
        token_number: booking.token_number,
        status: booking.status,
        queue_position:
          booking.queue_position,
        people_ahead: peopleAhead,
        current_stage:
          booking.current_stage,
        estimated_quantity_qtl:
          booking.estimated_quantity_qtl,
        booked_at: booking.booked_at,
        gate_pass_number:
          booking.gate_pass_number,
        slot: booking.slot,
      };
    })
  );

  return queues;
}