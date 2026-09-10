import { supabaseAdmin } from "../config/supabase";

const ACTIVE_STATUSES = [
  "booked",
  "waiting",
  "called",
  "arrived",
  "inspected",
  "accepted",
  "payment",
];

export type GateQrPayload = {
  type: "KISANQUEUE_BOOKING";
  version: 1;
  booking_id: string;
  token: string;
  token_number: number;
};

export async function getAdminQueue(
  centreId?: string,
  slotId?: string
) {
  let query = supabaseAdmin
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
      actual_quantity_qtl,
      booked_at,
      arrived_at,
      gate_pass_number,
      slot:slots (
        id,
        centre_id,
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
      `
    )
    .in("status", ACTIVE_STATUSES)
    .order("queue_position", {
      ascending: true,
      nullsFirst: false,
    });

  if (centreId) {
    query = query.eq(
      "slot.centre_id",
      centreId
    );
  }

  if (slotId) {
    query = query.eq(
      "slot_id",
      slotId
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function markBookingWaiting(
  bookingId: string,
  performedBy: string
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "mark_booking_waiting",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_BOOKED"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_BOOKED"
      );
    }

    throw error;
  }

  return data;
}

export async function callFarmer(
  bookingId: string,
  performedBy: string
) {
  const {
    data: booking,
    error: bookingError,
  } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      slot_id,
      status,
      current_stage,
      queue_position
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    throw bookingError;
  }

  if (!booking) {
    throw new Error(
      "BOOKING_NOT_FOUND"
    );
  }

  if (booking.status !== "waiting") {
    throw new Error(
      "BOOKING_NOT_WAITING"
    );
  }

  const {
    data: slot,
    error: slotError,
  } = await supabaseAdmin
    .from("slots")
    .select("centre_id")
    .eq("id", booking.slot_id)
    .single();

  if (slotError) {
    throw slotError;
  }

  const {
    data: updatedBooking,
    error: updateError,
  } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "called",
    })
    .eq("id", bookingId)
    .eq("status", "waiting")
    .select(
      `
      id,
      token_number,
      status,
      queue_position,
      current_stage,
      gate_pass_number
      `
    )
    .single();

  if (updateError) {
    throw updateError;
  }

  const {
    error: eventError,
  } = await supabaseAdmin
    .from("queue_events")
    .insert({
      booking_id: booking.id,
      centre_id: slot.centre_id,
      event_type: "called",
      from_stage: booking.current_stage,
      to_stage: booking.current_stage,
      performed_by: performedBy,
      metadata: {
        previous_status:
          booking.status,
        new_status: "called",
        queue_position:
          booking.queue_position,
      },
    });

  if (eventError) {
    throw eventError;
  }

  return updatedBooking;
}

export async function markBookingGateEntered(
  bookingId: string,
  performedBy: string
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "mark_booking_gate_entered",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_CALLED"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_CALLED"
      );
    }

    throw error;
  }

  return data;
}

export async function verifyAndEnterGateByQr(
  payload: GateQrPayload,
  performedBy: string
) {
  const {
    data: booking,
    error: bookingError,
  } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      token_number,
      status,
      current_stage,
      queue_position,
      estimated_quantity_qtl,
      actual_quantity_qtl,
      booked_at,
      arrived_at,
      gate_pass_number,
      qr_token,
      slot_id,
      slot:slots (
        id,
        centre_id,
        slot_date,
        start_time,
        end_time,
        centre:procurement_centres (
          id,
          centre_code,
          name,
          district,
          state,
          pincode,
          is_active
        )
      ),
      commodity:commodities (
        id,
        name,
        code
      )
      `
    )
    .eq("id", payload.booking_id)
    .maybeSingle();

  if (bookingError) {
    throw bookingError;
  }

  if (!booking) {
    throw new Error(
      "BOOKING_NOT_FOUND"
    );
  }

  if (!booking.qr_token) {
    throw new Error(
      "QR_NOT_CONFIGURED"
    );
  }

  if (booking.qr_token !== payload.token) {
    throw new Error(
      "QR_TOKEN_MISMATCH"
    );
  }

  if (
    booking.token_number !==
    payload.token_number
  ) {
    throw new Error(
      "TOKEN_NUMBER_MISMATCH"
    );
  }

  if (booking.status === "cancelled") {
    throw new Error(
      "BOOKING_CANCELLED"
    );
  }

  if (
    booking.status === "arrived" ||
    booking.arrived_at
  ) {
    throw new Error(
      "ALREADY_ENTERED"
    );
  }

  if (booking.status !== "called") {
    throw new Error(
      "BOOKING_NOT_CALLED"
    );
  }

  const slot = Array.isArray(booking.slot)
    ? booking.slot[0]
    : booking.slot;

  if (!slot) {
    throw new Error(
      "BOOKING_SLOT_NOT_FOUND"
    );
  }

  const centre = Array.isArray(
    slot.centre
  )
    ? slot.centre[0]
    : slot.centre;

  if (!centre) {
    throw new Error(
      "BOOKING_CENTRE_NOT_FOUND"
    );
  }

  if (!centre.is_active) {
    throw new Error(
      "CENTRE_INACTIVE"
    );
  }

  const gateEntry =
    await markBookingGateEntered(
      payload.booking_id,
      performedBy
    );

  return {
    booking: {
      id: booking.id,
      token_number:
        booking.token_number,
      status: booking.status,
      current_stage:
        booking.current_stage,
      queue_position:
        booking.queue_position,
      estimated_quantity_qtl:
        booking.estimated_quantity_qtl,
      actual_quantity_qtl:
        booking.actual_quantity_qtl,
      booked_at:
        booking.booked_at,
      arrived_at:
        booking.arrived_at,
      gate_pass_number:
        booking.gate_pass_number,
      slot: {
        id: slot.id,
        centre_id:
          slot.centre_id,
        slot_date:
          slot.slot_date,
        start_time:
          slot.start_time,
        end_time:
          slot.end_time,
        centre: {
          id: centre.id,
          centre_code:
            centre.centre_code,
          name: centre.name,
          district:
            centre.district,
          state: centre.state,
          pincode:
            centre.pincode,
        },
      },
      commodity:
        Array.isArray(
          booking.commodity
        )
          ? booking.commodity[0] ??
            null
          : booking.commodity,
    },
    gate_entry: gateEntry,
  };
}

export async function startWeighing(
  bookingId: string,
  performedBy: string
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "start_weighing",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_AT_GATE"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_AT_GATE"
      );
    }

    throw error;
  }

  return data;
}

export async function completeWeighing(
  bookingId: string,
  performedBy: string,
  actualQuantityQtl: number
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "complete_weighing",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
        p_actual_quantity_qtl:
          actualQuantityQtl,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_WEIGHING"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_WEIGHING"
      );
    }

    if (
      error.message.includes(
        "INVALID_QUANTITY"
      )
    ) {
      throw new Error(
        "INVALID_QUANTITY"
      );
    }

    if (
      error.message.includes(
        "QUANTITY_TOO_LARGE"
      )
    ) {
      throw new Error(
        "QUANTITY_TOO_LARGE"
      );
    }

    throw error;
  }

  return data;
}

export async function completeQualityInspection(
  bookingId: string,
  performedBy: string,
  grade: string,
  remarks: string | null,
  accepted: boolean
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "complete_quality_inspection",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
        p_grade: grade,
        p_remarks: remarks,
        p_accepted: accepted,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_AT_QUALITY"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_AT_QUALITY"
      );
    }

    if (
      error.message.includes(
        "INVALID_GRADE"
      )
    ) {
      throw new Error(
        "INVALID_GRADE"
      );
    }

    if (
      error.message.includes(
        "INVALID_DECISION"
      )
    ) {
      throw new Error(
        "INVALID_DECISION"
      );
    }

    throw error;
  }

  return data;
}

export async function completeBagging(
  bookingId: string,
  performedBy: string
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "complete_bagging",
      {
        p_booking_id: bookingId,
        p_performed_by: performedBy,
      }
    );

  if (error) {
    if (
      error.message.includes(
        "BOOKING_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "BOOKING_NOT_AT_BAGGING"
      )
    ) {
      throw new Error(
        "BOOKING_NOT_AT_BAGGING"
      );
    }

    if (
      error.message.includes(
        "BOOKING_CENTRE_NOT_FOUND"
      )
    ) {
      throw new Error(
        "BOOKING_CENTRE_NOT_FOUND"
      );
    }

    if (
      error.message.includes(
        "QUANTITY_NOT_AVAILABLE"
      )
    ) {
      throw new Error(
        "QUANTITY_NOT_AVAILABLE"
      );
    }

    throw error;
  }

  return data;
}