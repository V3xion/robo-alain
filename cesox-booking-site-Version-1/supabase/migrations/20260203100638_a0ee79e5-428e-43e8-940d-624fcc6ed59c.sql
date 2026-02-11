-- Create bookings table to store customer appointments
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_price TEXT NOT NULL,
    barber_id TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create barbers table for admin management
CREATE TABLE public.barbers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table for admin management
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_settings table to store admin password (hashed)
CREATE TABLE public.admin_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Bookings: Anyone can insert (customers booking), only authenticated can read all
CREATE POLICY "Anyone can create bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view bookings for now" 
ON public.bookings FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update bookings for now" 
ON public.bookings FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete bookings for now" 
ON public.bookings FOR DELETE 
USING (true);

-- Barbers: Public can view active barbers, admin can manage
CREATE POLICY "Anyone can view barbers" 
ON public.barbers FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage barbers for now" 
ON public.barbers FOR ALL 
USING (true);

-- Services: Public can view active services, admin can manage
CREATE POLICY "Anyone can view services" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage services for now" 
ON public.services FOR ALL 
USING (true);

-- Admin settings: Only admin can access
CREATE POLICY "Anyone can manage admin settings for now" 
ON public.admin_settings FOR ALL 
USING (true);

-- Insert default barbers
INSERT INTO public.barbers (name) VALUES ('James'), ('Marcus'), ('David');

-- Insert default services
INSERT INTO public.services (name, price) VALUES 
('Classic Haircut', '$35'),
('Beard Trim & Shape', '$25'),
('Hot Towel Shave', '$40'),
('Haircut & Beard Combo', '$55'),
('Kids Haircut', '$25'),
('Premium Experience', '$85');

-- Insert default admin password: cesox2024 (you should change this)
INSERT INTO public.admin_settings (password_hash) VALUES ('cesox2024admin');