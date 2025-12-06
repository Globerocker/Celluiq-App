#!/usr/bin/env python3
"""
CELLUIQ Database Setup Script
Creates tables and imports blood markers data to Supabase
"""

from supabase import create_client
import csv
import json

# Configuration
SUPABASE_URL = "https://evutidxtftmvvfmnnngk.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dXRpZHh0ZnRtdnZmbW5ubmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNjE0MCwiZXhwIjoyMDgwNTgyMTQwfQ.-AYDWJisK7Iy_91q2N-1-nxFJjzGvw8dqRuECWL75vE"


def setup_database():
    """Create tables and import data"""
    
    print("🚀 CELLUIQ Database Setup\n")
    
    if SERVICE_KEY == "YOUR_SERVICE_ROLE_KEY":
        print("❌ Please set your SERVICE_KEY in this file first!")
        print("Get it from: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/settings/api")
        return
    
    supabase = create_client(SUPABASE_URL, SERVICE_KEY)
    
    print("✅ Connected to Supabase\n")
    
    # Step 1: Create reference tables
    print("📋 Step 1: Creating reference tables...")
    create_reference_tables(supabase)
    
    # Step 2: Import blood markers
    print("\n📊 Step 2: Importing blood markers...")
    import_blood_markers(supabase)
    
    print("\n🎉 Setup complete!")

def create_reference_tables(supabase):
    """Create blood_markers_reference table"""
    
    sql = """
    CREATE TABLE IF NOT EXISTS blood_markers_reference (
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE blood_markers_reference ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public read" ON blood_markers_reference FOR SELECT USING (true);
    """
    
    try:
        supabase.postgrest.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Tables created")
    except Exception as e:
        print(f"⚠️  Tables might already exist: {e}")

def import_blood_markers(supabase):
    """Import blood markers from CSV"""
    
    csv_file = "Database/Bloodmaker Database - Men (1).csv"
    
    category_map = {
        'Adrenal': 'hormones', 'Amino Acids': 'metabolic',
        'Antioxidants': 'vitamins', 'Bone Metabolism': 'metabolic',
        'Growth Factors': 'hormones', 'Gut Health': 'inflammation',
        'Hematology': 'blood_cells', 'Hormones': 'hormones',
        'Inflammation': 'inflammation', 'Iron Metabolism': 'minerals',
        'Kidney Function': 'kidney', 'Lipids': 'lipids',
        'Liver Function': 'liver', 'Metabolic': 'metabolic',
        'Methylation': 'metabolic', 'Minerals': 'minerals',
        'Thyroid': 'thyroid', 'Vitamins': 'vitamins'
    }
    
    markers = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            try:
                # Parse ranges
                celluiq = row['CELLUIQ Range'].replace('<', '').replace('>', '').split('-')
                clinical = row['Clinical Range'].replace('<', '').replace('>', '').split('-')
                
                marker = {
                    'marker_name': row['Marker'],
                    'short_name': row['Short'],
                    'category': category_map.get(row['Category'], 'other'),
                    'unit': row['Units'],
                    'optimal_min': float(celluiq[0]) if len(celluiq) > 0 and celluiq[0] else None,
                    'optimal_max': float(celluiq[1]) if len(celluiq) > 1 and celluiq[1] else None,
                    'normal_min': float(clinical[0]) if len(clinical) > 0 and clinical[0] else None,
                    'normal_max': float(clinical[1]) if len(clinical) > 1 and clinical[1] else None,
                    'gender': row['gender'],
                    'description': f"Low: {row['If Low (Symptoms)']} | High: {row['If High (Symptoms)']}",
                    'importance': 'important'
                }
                
                markers.append(marker)
                
            except Exception as e:
                print(f"⚠️  Skipped {row.get('Marker', 'unknown')}: {e}")
    
    # Insert in batches
    batch_size = 50
    for i in range(0, len(markers), batch_size):
        batch = markers[i:i+batch_size]
        try:
            supabase.table('blood_markers_reference').insert(batch).execute()
            print(f"✅ Imported {len(batch)} markers (batch {i//batch_size + 1})")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n✅ Total: {len(markers)} markers imported")

if __name__ == "__main__":
    setup_database()
