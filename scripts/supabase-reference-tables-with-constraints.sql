-- Enhanced Reference Tables with Category Constraints (Dropdowns)
-- This version uses CHECK constraints to enforce specific category values
-- Run this INSTEAD of supabase-reference-tables.sql

-- Blood Markers Reference Table with Category Dropdown
CREATE TABLE IF NOT EXISTS public.blood_markers_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marker_name TEXT NOT NULL,
  short_name TEXT,
  
  -- Category with dropdown constraint
  category TEXT CHECK (category IN (
    'vitamins',
    'minerals',
    'hormones',
    'lipids',
    'liver',
    'kidney',
    'thyroid',
    'blood_cells',
    'inflammation',
    'metabolic',
    'other'
  )),
  
  unit TEXT,
  
  -- Reference ranges
  optimal_min NUMERIC,
  optimal_max NUMERIC,
  normal_min NUMERIC,
  normal_max NUMERIC,
  
  -- Gender dropdown
  gender TEXT DEFAULT 'both' CHECK (gender IN ('male', 'female', 'both')),
  
  -- Recommendations (stored as JSON arrays of IDs)
  too_low_supplements JSONB,
  too_high_supplements JSONB,
  too_low_foods JSONB,
  too_high_foods JSONB,
  
  -- Additional info
  description TEXT,
  importance TEXT CHECK (importance IN ('critical', 'important', 'moderate', 'low')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Supplements Reference Table with Category Dropdown
CREATE TABLE IF NOT EXISTS public.supplements_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  
  -- Category with dropdown constraint
  category TEXT CHECK (category IN (
    'vitamins',
    'minerals',
    'amino_acids',
    'herbs',
    'probiotics',
    'omega_3',
    'antioxidants',
    'adaptogens',
    'other'
  )),
  
  dosage_recommendation TEXT,
  benefits TEXT,
  warnings TEXT,
  contraindications TEXT,
  
  -- Price range dropdown
  price_range TEXT CHECK (price_range IN ('low', 'medium', 'high')),
  
  amazon_link TEXT,
  
  -- Nutritional info
  active_ingredients JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Foods Reference Table with Category Dropdown
CREATE TABLE IF NOT EXISTS public.foods_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  
  -- Category with dropdown constraint
  category TEXT CHECK (category IN (
    'vegetables',
    'fruits',
    'protein',
    'grains',
    'dairy',
    'nuts',
    'seeds',
    'legumes',
    'fish',
    'meat',
    'oils',
    'herbs_spices',
    'other'
  )),
  
  -- Nutritional content (per 100g)
  nutrients JSONB,
  calories NUMERIC,
  
  -- Additional info
  benefits TEXT,
  
  -- Season dropdown
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all')),
  
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

-- Public read access for reference data
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

-- ===== HELPER: View all allowed categories =====

-- View to see all allowed values for dropdowns
CREATE OR REPLACE VIEW category_options AS
SELECT 'blood_markers' as table_name, 'category' as field_name, 
       unnest(ARRAY['vitamins', 'minerals', 'hormones', 'lipids', 'liver', 'kidney', 'thyroid', 'blood_cells', 'inflammation', 'metabolic', 'other']) as allowed_value
UNION ALL
SELECT 'supplements' as table_name, 'category' as field_name,
       unnest(ARRAY['vitamins', 'minerals', 'amino_acids', 'herbs', 'probiotics', 'omega_3', 'antioxidants', 'adaptogens', 'other']) as allowed_value
UNION ALL
SELECT 'foods' as table_name, 'category' as field_name,
       unnest(ARRAY['vegetables', 'fruits', 'protein', 'grains', 'dairy', 'nuts', 'seeds', 'legumes', 'fish', 'meat', 'oils', 'herbs_spices', 'other']) as allowed_value;

-- Query to see all options:
-- SELECT * FROM category_options WHERE table_name = 'blood_markers';
