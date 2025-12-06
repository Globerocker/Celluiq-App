-- Supabase Schema for CELLUIQ App
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Onboarding data
  onboarding_completed BOOLEAN DEFAULT FALSE,
  gender TEXT,
  goal TEXT,
  age_range TEXT,
  postal_code TEXT,
  health_conditions TEXT,
  activity_level TEXT,
  sleep_quality TEXT,
  diet TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blood Work table
CREATE TABLE IF NOT EXISTS public.blood_work (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  analysis_json JSONB, -- Stores the analysis result
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Health Data table (for Apple Health / Google Fit integration)
CREATE TABLE IF NOT EXISTS public.health_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL, -- e.g., 'steps', 'heart_rate', 'sleep'
  value NUMERIC NOT NULL,
  unit TEXT, -- e.g., 'count', 'bpm', 'hours'
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT, -- 'apple_health', 'google_fit', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Blood Work policies
CREATE POLICY "Users can view own blood work" ON public.blood_work
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own blood work" ON public.blood_work
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blood work" ON public.blood_work
  FOR UPDATE USING (auth.uid() = user_id);

-- Health Data policies
CREATE POLICY "Users can view own health data" ON public.health_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" ON public.health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket for blood work files
INSERT INTO storage.buckets (id, name, public)
VALUES ('blood-work', 'blood-work', false)
ON CONFLICT DO NOTHING;

-- Storage policies for blood work bucket
CREATE POLICY "Users can upload their own blood work files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blood-work' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own blood work files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'blood-work' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
