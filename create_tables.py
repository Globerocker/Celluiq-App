#!/usr/bin/env python3
"""
Create Supabase tables directly via REST API
"""

import requests

SUPABASE_URL = "https://evutidxtftmvvfmnnngk.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dXRpZHh0ZnRtdnZmbW5ubmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNjE0MCwiZXhwIjoyMDgwNTgyMTQwfQ.-AYDWJisK7Iy_91q2N-1-nxFJjzGvw8dqRuECWL75vE"

sql = """
-- Blood Markers Reference Table
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

-- Index
CREATE INDEX IF NOT EXISTS idx_blood_markers_category ON public.blood_markers_reference(category);
CREATE INDEX IF NOT EXISTS idx_blood_markers_gender ON public.blood_markers_reference(gender);
"""

print("🚀 Creating tables in Supabase...\n")

# Execute SQL via Supabase REST API
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Try direct SQL execution
print("Attempting to create table via SQL Editor...")
print("\n⚠️  The Python API doesn't support direct SQL execution.")
print("Please run this SQL manually in Supabase SQL Editor:\n")
print("=" * 60)
print(sql)
print("=" * 60)
print("\nGo to: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/sql/new")
print("Copy the SQL above and click 'Run'")
