-- CELLUIQ Supplements & Foods Tables
-- Run this in Supabase SQL Editor after blood_markers_reference

-- Supplements Reference Table
CREATE TABLE IF NOT EXISTS public.supplements_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN (
    'vitamins', 'minerals', 'amino_acids', 'herbs', 
    'probiotics', 'omega_3', 'antioxidants', 'adaptogens', 'other'
  )),
  benefits TEXT,
  dosage_recommendation TEXT,
  gender TEXT DEFAULT 'both' CHECK (gender IN ('male', 'female', 'both')),
  best_time TEXT,
  combinations TEXT,
  influenced_markers TEXT,
  warnings TEXT,
  studies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods Reference Table
CREATE TABLE IF NOT EXISTS public.foods_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN (
    'vegetables', 'fruits', 'protein', 'grains', 'dairy', 
    'nuts', 'seeds', 'legumes', 'fish', 'meat', 'oils', 'herbs_spices', 'other'
  )),
  benefits TEXT,
  influenced_markers TEXT,
  daily_dosage TEXT,
  weekly_dosage TEXT,
  unit TEXT,
  gender TEXT DEFAULT 'both' CHECK (gender IN ('male', 'female', 'both')),
  best_time TEXT,
  combinations TEXT,
  warnings TEXT,
  studies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.supplements_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods_reference ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read supplements" ON public.supplements_reference
  FOR SELECT USING (true);

CREATE POLICY "Public read foods" ON public.foods_reference
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_supplements_category ON public.supplements_reference(category);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods_reference(category);

-- Triggers
CREATE TRIGGER set_updated_at_supplements
  BEFORE UPDATE ON public.supplements_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_foods
  BEFORE UPDATE ON public.foods_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
