-- CELLUIQ Blood Markers Reference Table
-- Copy this entire SQL and run it in Supabase SQL Editor
-- https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/sql/new

CREATE TABLE IF NOT EXISTS public.blood_markers_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marker_name TEXT NOT NULL,
  short_name TEXT,
  category TEXT CHECK (category IN (
    'vitamins', 'minerals', 'hormones', 'lipids', 'liver', 
    'kidney', 'thyroid', 'blood_cells', 'inflammation', 'metabolic', 'other'
  )),
  unit TEXT,
  optimal_min NUMERIC,
  optimal_max NUMERIC,
  normal_min NUMERIC,
  normal_max NUMERIC,
  gender TEXT DEFAULT 'both' CHECK (gender IN ('male', 'female', 'both')),
  too_low_supplements JSONB,
  too_high_supplements JSONB,
  too_low_foods JSONB,
  too_high_foods JSONB,
  description TEXT,
  importance TEXT CHECK (importance IN ('critical', 'important', 'moderate', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blood_markers_reference ENABLE ROW LEVEL SECURITY;

-- Public read policy
DROP POLICY IF EXISTS "Public read blood markers" ON public.blood_markers_reference;
CREATE POLICY "Public read blood markers" ON public.blood_markers_reference
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blood_markers_category ON public.blood_markers_reference(category);
CREATE INDEX IF NOT EXISTS idx_blood_markers_gender ON public.blood_markers_reference(gender);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_blood_markers
  BEFORE UPDATE ON public.blood_markers_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
