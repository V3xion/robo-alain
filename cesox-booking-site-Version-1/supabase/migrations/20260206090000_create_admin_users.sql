-- Create admin users table for admin panel authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin users (edge functions use service role)
CREATE POLICY "Service role can manage admin users"
ON public.admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed default admin credentials
INSERT INTO public.admin_users (username, password_hash)
VALUES ('cesox', 'ce770a65b48839593fc29c913d4b7458fa0e89c3e5ffbb46eb6e53f24d896198')
ON CONFLICT (username) DO NOTHING;
