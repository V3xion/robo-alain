-- Add CHECK constraints for input validation on bookings table

-- Validate phone format (UAE format: 05XXXXXXXX)
ALTER TABLE public.bookings ADD CONSTRAINT valid_phone 
  CHECK (customer_phone ~ '^05[0-9]{8}$');

-- Validate customer name length (1-100 characters)
ALTER TABLE public.bookings ADD CONSTRAINT valid_name_length 
  CHECK (length(customer_name) > 0 AND length(customer_name) <= 100);

-- Validate status values (only allowed statuses)
ALTER TABLE public.bookings ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- Add length constraints to other TEXT fields
ALTER TABLE public.bookings ADD CONSTRAINT valid_service_name_length 
  CHECK (length(service_name) > 0 AND length(service_name) <= 200);

ALTER TABLE public.bookings ADD CONSTRAINT valid_barber_name_length 
  CHECK (length(barber_name) > 0 AND length(barber_name) <= 100);

ALTER TABLE public.bookings ADD CONSTRAINT valid_service_price_length 
  CHECK (length(service_price) > 0 AND length(service_price) <= 50);

ALTER TABLE public.bookings ADD CONSTRAINT valid_booking_date_length 
  CHECK (length(booking_date) > 0 AND length(booking_date) <= 50);

ALTER TABLE public.bookings ADD CONSTRAINT valid_booking_time_length 
  CHECK (length(booking_time) > 0 AND length(booking_time) <= 20);

-- Create a unique index to prevent duplicate bookings (same phone, date, time)
-- This provides basic rate limiting at DB level
CREATE UNIQUE INDEX unique_booking_slot 
  ON public.bookings(customer_phone, booking_date, booking_time)
  WHERE status NOT IN ('cancelled');

-- Create rate limiting table for tracking booking attempts
CREATE TABLE public.booking_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  ip_address TEXT,
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limits_phone ON public.booking_rate_limits(phone_number, window_start);

-- Enable RLS on rate limits table
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (edge function uses service role)
CREATE POLICY "Service role only" ON public.booking_rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon/authenticated to insert rate limit records (for edge function tracking)
CREATE POLICY "Anyone can insert rate limits" ON public.booking_rate_limits
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_booking_rate_limit(
  p_phone TEXT,
  p_ip TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_max_attempts INTEGER := 5;  -- Max 5 bookings per hour
  v_window_duration INTERVAL := INTERVAL '1 hour';
BEGIN
  -- Get current attempt count within window
  SELECT attempt_count, window_start 
  INTO v_count, v_window_start
  FROM booking_rate_limits 
  WHERE phone_number = p_phone 
    AND window_start > now() - v_window_duration
  ORDER BY window_start DESC
  LIMIT 1;
  
  -- If no record or window expired, create new window
  IF v_count IS NULL OR v_window_start < now() - v_window_duration THEN
    INSERT INTO booking_rate_limits (phone_number, ip_address, attempt_count, window_start)
    VALUES (p_phone, p_ip, 1, now());
    RETURN TRUE;
  END IF;
  
  -- Check if limit exceeded
  IF v_count >= v_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE booking_rate_limits 
  SET attempt_count = attempt_count + 1
  WHERE phone_number = p_phone 
    AND window_start = v_window_start;
  
  RETURN TRUE;
END;
$$;