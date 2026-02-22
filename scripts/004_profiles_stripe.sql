-- Add Stripe and scan tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scan_count_month INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scan_reset_date TIMESTAMPTZ DEFAULT NOW();
