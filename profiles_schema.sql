-- Run this in your Supabase SQL Editor to fix the "missing column" errors
-- It is now "Idempotent" meaning you can run it multiple times without error!

-- 1. Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age text,
ADD COLUMN IF NOT EXISTS height text,
ADD COLUMN IF NOT EXISTS weight text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2. Create the blood_work table if it doesn't exist
CREATE TABLE IF NOT EXISTS blood_work (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_path text,
  analysis_json jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS (Security)
ALTER TABLE blood_work ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop first to avoid "already exists" error)
DROP POLICY IF EXISTS "Users can view own blood work" ON blood_work;
CREATE POLICY "Users can view own blood work" ON blood_work
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own blood work" ON blood_work;
CREATE POLICY "Users can insert own blood work" ON blood_work
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create Storage Bucket 'blood-work'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blood-work', 'blood-work', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Drop first)
DROP POLICY IF EXISTS "Give users access to own folder 1u1r5z_0" ON storage.objects;
CREATE POLICY "Give users access to own folder 1u1r5z_0" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'blood-work' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Give users access to own folder 1u1r5z_1" ON storage.objects;
CREATE POLICY "Give users access to own folder 1u1r5z_1" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'blood-work' AND auth.uid()::text = (storage.foldername(name))[1]);
