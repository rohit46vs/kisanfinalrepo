CREATE OR REPLACE FUNCTION public.book_slot_v2(
  p_slot_id uuid,
  p_estimated_quantity_qtl numeric DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id uuid;
  v_profile_role public.app_role;
  v_slot public.slots;
  v_booking public.bookings;
  v_token_number integer;
  v_qr_token text;
  v_gate_pass text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATION_REQUIRED';
  END IF;

  SELECT role
  INTO v_profile_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_profile_role IS DISTINCT FROM 'farmer'::public.app_role THEN
    RAISE EXCEPTION 'FARMER_ACCESS_REQUIRED';
  END IF;

  IF p_estimated_quantity_qtl IS NOT NULL
     AND (
       p_estimated_quantity_qtl <= 0
       OR p_estimated_quantity_qtl > 1000
     ) THEN
    RAISE EXCEPTION 'INVALID_ESTIMATED_QUANTITY';
  END IF;

  SELECT *
  INTO v_slot
  FROM public.slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SLOT_NOT_FOUND';
  END IF;

  IF NOT v_slot.is_active THEN
    RAISE EXCEPTION 'SLOT_CLOSED';
  END IF;

  IF v_slot.slot_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'SLOT_DATE_PASSED';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE farmer_id = v_user_id
      AND slot_id = p_slot_id
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_BOOKING';
  END IF;

  IF v_slot.booked_count >= v_slot.capacity THEN
    RAISE EXCEPTION 'SLOT_FULL';
  END IF;

  SELECT COALESCE(MAX(token_number), 0) + 1
  INTO v_token_number
  FROM public.bookings
  WHERE slot_id = p_slot_id;

  v_qr_token := encode(
    extensions.gen_random_bytes(24),
    'hex'
  );

  v_gate_pass :=
    'KQ-' ||
    to_char(v_slot.slot_date, 'YYYYMMDD') ||
    '-' ||
    lpad(v_token_number::text, 4, '0');

  INSERT INTO public.bookings (
    farmer_id,
    slot_id,
    token_number,
    status,
    estimated_quantity_qtl,
    qr_token,
    gate_pass_number,
    queue_position,
    current_stage
  )
  VALUES (
    v_user_id,
    p_slot_id,
    v_token_number,
    'booked',
    p_estimated_quantity_qtl,
    v_qr_token,
    v_gate_pass,
    v_token_number,
    'booking'
  )
  RETURNING *
  INTO v_booking;

  UPDATE public.slots
  SET
    booked_count = booked_count + 1,
    updated_at = now()
  WHERE id = p_slot_id;

  INSERT INTO public.queue_events (
    booking_id,
    centre_id,
    event_type,
    from_stage,
    to_stage,
    performed_by,
    metadata
  )
  VALUES (
    v_booking.id,
    v_slot.centre_id,
    'token_issued',
    NULL,
    'booking',
    v_user_id,
    jsonb_build_object(
      'token_number', v_token_number,
      'gate_pass_number', v_gate_pass
    )
  );

  RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.book_slot_v2(uuid, numeric)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.book_slot_v2(uuid, numeric)
TO authenticated;