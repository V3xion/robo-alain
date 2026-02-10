-- Remove remaining permissive INSERT policy and replace with one that still allows public bookings
-- The INSERT policy with true is intentional for public booking creation, but we should verify no other issues

-- Check and remove any remaining permissive DELETE/UPDATE policies
DROP POLICY IF EXISTS "Anyone can delete bookings for now" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings for now" ON public.bookings;