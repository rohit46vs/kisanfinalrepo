-- ============================================================
-- KisanQueue Secure Booking
-- Migration: 003_secure_booking
-- ============================================================

BEGIN;

-- ============================================================
-- 1. SECURE ATOMIC BOOKING FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.book_slot_v2(
  p_slot_id uuid,
  p_estimated_quantity_qtl numeric DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_slot public.slots%ROWTYPE;
  v_booking public.bookings%ROWTYPE;
  v_next_token integer;
  v_existing_booking uuid;
  v_qr_token text;
  v_gate_pass text;
BEGIN

  -- ----------------------------------------------------------
  -- 1. Authentication
  -- ----------------------------------------------------------

  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'
      USING ERRCODE = '28000';
  END IF;


  -- ----------------------------------------------------------
  -- 2. Verify farmer profile
  -- ----------------------------------------------------------

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_user_id
      AND role = 'farmer'
  ) THEN
    RAISE EXCEPTION 'FARMER_ACCESS_REQUIRED'
      USING ERRCODE = '42501';
  END IF;


  -- ----------------------------------------------------------
  -- 3. Validate estimated quantity
  -- ----------------------------------------------------------

  IF p_estimated_quantity_qtl IS NOT NULL
     AND p_estimated_quantity_qtl <= 0 THEN

    RAISE EXCEPTION 'INVALID_ESTIMATED_QUANTITY'
      USING ERRCODE = '22023';

  END IF;


  -- ----------------------------------------------------------
  -- 4. Lock the slot row
  --
  -- FOR UPDATE prevents two simultaneous booking requests
  -- from consuming the same remaining capacity.
  -- ----------------------------------------------------------

  SELECT *
  INTO v_slot
  FROM public.slots
  WHERE id = p_slot_id
  FOR UPDATE;


  IF NOT FOUND THEN
    RAISE EXCEPTION 'SLOT_NOT_FOUND'
      USING ERRCODE = 'P0002';
  END IF;


  -- ----------------------------------------------------------
  -- 5. Validate slot availability
  -- ----------------------------------------------------------

  IF NOT v_slot.is_active THEN
    RAISE EXCEPTION 'SLOT_CLOSED'
      USING ERRCODE = 'P0001';
  END IF;


  IF v_slot.slot_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'SLOT_DATE_PASSED'
      USING ERRCODE = 'P0001';
  END IF;


  -- ----------------------------------------------------------
  -- 6. Prevent duplicate booking
  -- ----------------------------------------------------------

  SELECT id
  INTO v_existing_booking
  FROM public.bookings
  WHERE farmer_id = v_user_id
    AND slot_id = p_slot_id
  LIMIT 1;

  IF v_existing_booking IS NOT NULL THEN
    RAISE EXCEPTION 'DUPLICATE_BOOKING'
      USING ERRCODE = '23505';
  END IF;


  -- ----------------------------------------------------------
  -- 7. Capacity check
  -- ----------------------------------------------------------

  IF v_slot.booked_count >= v_slot.capacity THEN
    RAISE EXCEPTION 'SLOT_FULL'
      USING ERRCODE = 'P0001';
  END IF;


  -- ----------------------------------------------------------
  -- 8. Generate next token while slot is locked
  -- ----------------------------------------------------------

  SELECT COALESCE(MAX(token_number), 0) + 1
  INTO v_next_token
  FROM public.bookings
  WHERE slot_id = p_slot_id;


  -- ----------------------------------------------------------
  -- 9. Generate booking identifiers
  -- ----------------------------------------------------------

  v_qr_token :=
    encode(gen_random_bytes(24), 'hex');

  v_gate_pass :=
    'KQ-' ||
    to_char(CURRENT_DATE, 'YYYYMMDD') ||
    '-' ||
    lpad(v_next_token::text, 4, '0');


  -- ----------------------------------------------------------
  -- 10. Insert booking
  -- ----------------------------------------------------------

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
    v_next_token,
    'booked',
    p_estimated_quantity_qtl,
    v_qr_token,
    v_gate_pass,
    v_next_token,
    'booking'
  )
  RETURNING *
  INTO v_booking;


  -- ----------------------------------------------------------
  -- 11. Update booked count
  -- ----------------------------------------------------------

  UPDATE public.slots
  SET
    booked_count = booked_count + 1,
    status = CASE
      WHEN booked_count + 1 >= capacity
        THEN 'full'
      WHEN booked_count + 1 >=
           CEIL(capacity * 0.8)
        THEN 'limited'
      ELSE 'open'
    END,
    updated_at = now()
  WHERE id = p_slot_id;


  -- ----------------------------------------------------------
  -- 12. Create queue event
  -- ----------------------------------------------------------

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
      'token_number', v_next_token,
      'gate_pass_number', v_gate_pass
    )
  );


  -- ----------------------------------------------------------
  -- 13. Return booking
  -- ----------------------------------------------------------

  RETURN v_booking;

END;
$$;


-- ============================================================
-- 2. CONTROL FUNCTION EXECUTION
-- ============================================================

REVOKE ALL
ON FUNCTION public.book_slot_v2(uuid, numeric)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.book_slot_v2(uuid, numeric)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.book_slot_v2(uuid, numeric)
TO authenticated;


-- ============================================================
-- 3. SECURITY COMMENT
-- ============================================================

COMMENT ON FUNCTION public.book_slot_v2(uuid, numeric)
IS 'Atomically creates a farmer slot booking, assigns a token, updates slot capacity, and records the initial queue event.';


COMMIT;