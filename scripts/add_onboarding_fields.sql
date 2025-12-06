-- Add missing columns for Onboarding flow
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS weight NUMERIC;

-- Optional: Add comment
COMMENT ON COLUMN public.profiles.age IS 'User age in years';
COMMENT ON COLUMN public.profiles.height IS 'User height in cm';
COMMENT ON COLUMN public.profiles.weight IS 'User weight in kg';
