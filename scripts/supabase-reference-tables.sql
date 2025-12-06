-- Phase 2: Reference Data Tables for CELLUIQ App
-- Run this SQL in your Supabase SQL Editor AFTER the main schema

-- Blood Markers Reference Table
CREATE TABLE IF NOT EXISTS public.blood_markers_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marker_name TEXT NOT NULL,
  short_name TEXT,
  category TEXT, -- 'vitamins', 'hormones', 'minerals', 'lipids', 'liver', 'kidney', etc.
  unit TEXT,
  
  -- Reference ranges
  optimal_min NUMERIC,
  optimal_max NUMERIC,
  normal_min NUMERIC,
  normal_max NUMERIC,
  
  -- Gender-specific values
  gender TEXT DEFAULT 'both', -- 'male', 'female', 'both'
  
  -- Recommendations (stored as JSON arrays of IDs)
  too_low_supplements JSONB, -- Array of supplement IDs
  too_high_supplements JSONB,
  too_low_foods JSONB, -- Array of food IDs
  too_high_foods JSONB,
  
  -- Additional info
  description TEXT,
  importance TEXT, -- 'critical', 'important', 'moderate'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Supplements Reference Table
CREATE TABLE IF NOT EXISTS public.supplements_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- 'vitamins', 'minerals', 'amino_acids', 'herbs', etc.
  dosage_recommendation TEXT,
  benefits TEXT,
  warnings TEXT,
  contraindications TEXT,
  price_range TEXT, -- 'low', 'medium', 'high'
  amazon_link TEXT,
  
  -- Nutritional info
  active_ingredients JSONB, -- e.g. {"vitamin_d": "1000 IU", "magnesium": "200mg"}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Foods Reference Table
CREATE TABLE IF NOT EXISTS public.foods_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- 'vegetables', 'fruits', 'protein', 'grains', 'dairy', 'nuts', etc.
  
  -- Nutritional content (per 100g)
  nutrients JSONB, -- e.g. {"vitamin_d": 100, "iron": 5, "protein": 20}
  calories NUMERIC,
  
  -- Additional info
  benefits TEXT,
  season TEXT, -- 'spring', 'summer', 'fall', 'winter', 'all'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blood_markers_category ON public.blood_markers_reference(category);
CREATE INDEX IF NOT EXISTS idx_blood_markers_gender ON public.blood_markers_reference(gender);
CREATE INDEX IF NOT EXISTS idx_supplements_category ON public.supplements_reference(category);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods_reference(category);

-- Enable RLS
ALTER TABLE public.blood_markers_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods_reference ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data (everyone can read, only admins can write)
CREATE POLICY "Reference data is publicly readable" ON public.blood_markers_reference
  FOR SELECT USING (true);

CREATE POLICY "Reference data is publicly readable" ON public.supplements_reference
  FOR SELECT USING (true);

CREATE POLICY "Reference data is publicly readable" ON public.foods_reference
  FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_blood_markers
  BEFORE UPDATE ON public.blood_markers_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_supplements
  BEFORE UPDATE ON public.supplements_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_foods
  BEFORE UPDATE ON public.foods_reference
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sample data (optional - remove if you have your own Excel data)
-- INSERT INTO public.blood_markers_reference (marker_name, short_name, category, unit, optimal_min, optimal_max, gender, description)
-- VALUES 
--   ('Vitamin D', 'Vit D', 'vitamins', 'ng/mL', 40, 60, 'both', 'Essential for bone health and immune function'),
--   ('Ferritin', 'Ferritin', 'minerals', 'ng/mL', 50, 150, 'both', 'Iron storage protein');
