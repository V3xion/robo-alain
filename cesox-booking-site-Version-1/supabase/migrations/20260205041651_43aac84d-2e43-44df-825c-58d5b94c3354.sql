-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for managing admin access
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles: only admins can view/manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop the insecure admin_settings table
DROP TABLE IF EXISTS public.admin_settings;

-- Remove old permissive policies on bookings
DROP POLICY IF EXISTS "Anyone can view bookings for now" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings for now" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings for now" ON public.bookings;

-- Keep insert policy for customers to create bookings (this is intentional)
-- The "Anyone can create bookings" policy remains

-- Create new secure policies for bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remove old permissive policies on barbers
DROP POLICY IF EXISTS "Anyone can manage barbers for now" ON public.barbers;

-- Create secure policies for barbers
CREATE POLICY "Admins can manage barbers"
ON public.barbers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remove old permissive policies on services
DROP POLICY IF EXISTS "Anyone can manage services for now" ON public.services;

-- Create secure policies for services
CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));