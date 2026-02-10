-- Add description and duration fields to services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS duration TEXT;

-- Backfill existing services with default descriptions/durations
UPDATE public.services
SET description = COALESCE(description, 'Premium grooming tailored for you.'),
    duration = COALESCE(duration, 'Ask for timing details');
