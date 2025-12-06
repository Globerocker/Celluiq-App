#!/usr/bin/env python3
"""
Import Supplements and Foods from Excel to Supabase
"""

import pandas as pd
from supabase import create_client

SUPABASE_URL = "https://evutidxtftmvvfmnnngk.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dXRpZHh0ZnRtdnZmbW5ubmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNjE0MCwiZXhwIjoyMDgwNTgyMTQwfQ.-AYDWJisK7Iy_91q2N-1-nxFJjzGvw8dqRuECWL75vE"

supabase = create_client(SUPABASE_URL, SERVICE_KEY)

# Category mappings
supplement_category_map = {
    'Vitamin': 'vitamins',
    'Mineral': 'minerals',
    'Amino Acid': 'amino_acids',
    'Herb': 'herbs',
    'Probiotic': 'probiotics',
    'Omega-3': 'omega_3',
    'Antioxidant': 'antioxidants',
    'Adaptogen': 'adaptogens'
}

food_category_map = {
    'Fruit': 'fruits',
    'Vegetable': 'vegetables',
    'Protein': 'protein',
    'Grain': 'grains',
    'Dairy': 'dairy',
    'Nut': 'nuts',
    'Seed': 'seeds',
    'Legume': 'legumes',
    'Fish': 'fish',
    'Meat': 'meat',
    'Oil': 'oils',
    'Herb': 'herbs_spices',
    'Spice': 'herbs_spices'
}

print("🚀 Importing Supplements & Foods\n")

# Import Supplements
print("=" * 60)
print("SUPPLEMENTS")
print("=" * 60)

df_supp = pd.read_excel('Database/Supplement Database.xlsx')
supplements = []

for _, row in df_supp.iterrows():
    try:
        supp = {
            'name': str(row['Supplement Name']),
            'category': supplement_category_map.get(row['Category'], 'other'),
            'benefits': str(row['Primary Benefits']) if pd.notna(row['Primary Benefits']) else None,
            'dosage_recommendation': str(row['Dosage']) if pd.notna(row['Dosage']) else None,
            'gender': str(row['Gender']).lower() if pd.notna(row['Gender']) else 'both',
            'best_time': str(row['Best Time']) if pd.notna(row['Best Time']) else None,
            'combinations': str(row['Combinations']) if pd.notna(row['Combinations']) else None,
            'influenced_markers': str(row['Influenced Blood Markers']) if pd.notna(row['Influenced Blood Markers']) else None,
            'warnings': str(row['Warnings']) if pd.notna(row['Warnings']) else None,
            'studies': str(row['Studies']) if pd.notna(row['Studies']) else None
        }
        supplements.append(supp)
    except Exception as e:
        print(f"⚠️  Skipped: {e}")

# Insert supplements in batches
batch_size = 50
for i in range(0, len(supplements), batch_size):
    batch = supplements[i:i+batch_size]
    try:
        supabase.table('supplements_reference').insert(batch).execute()
        print(f"✅ Imported {len(batch)} supplements (batch {i//batch_size + 1})")
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"\n✅ Total: {len(supplements)} supplements imported\n")

# Import Foods
print("=" * 60)
print("FOODS")
print("=" * 60)

df_foods = pd.read_excel('Database/Foods Database.xlsx')
foods = []

for _, row in df_foods.iterrows():
    try:
        food = {
            'name': str(row['Food Name']),
            'category': food_category_map.get(row['Category'], 'other'),
            'benefits': str(row['Primary Benefits']) if pd.notna(row['Primary Benefits']) else None,
            'influenced_markers': str(row['Influenced Blood Markers']) if pd.notna(row['Influenced Blood Markers']) else None,
            'daily_dosage': str(row['Daily Dosage']) if pd.notna(row['Daily Dosage']) else None,
            'weekly_dosage': str(row['Weekly Dosage']) if pd.notna(row['Weekly Dosage']) else None,
            'unit': str(row['Unit']) if pd.notna(row['Unit']) else None,
            'gender': str(row['Gender']).lower() if pd.notna(row['Gender']) else 'both',
            'best_time': str(row['Best Time']) if pd.notna(row['Best Time']) else None,
            'combinations': str(row['Combinations']) if pd.notna(row['Combinations']) else None,
            'warnings': str(row['Warnings']) if pd.notna(row['Warnings']) else None,
            'studies': str(row['Studies']) if pd.notna(row['Studies']) else None
        }
        foods.append(food)
    except Exception as e:
        print(f"⚠️  Skipped: {e}")

# Insert foods in batches
for i in range(0, len(foods), batch_size):
    batch = foods[i:i+batch_size]
    try:
        supabase.table('foods_reference').insert(batch).execute()
        print(f"✅ Imported {len(batch)} foods (batch {i//batch_size + 1})")
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"\n✅ Total: {len(foods)} foods imported")
print(f"\n🎉 Import complete!")
print(f"\n📊 Summary:")
print(f"  - Blood Markers: 109")
print(f"  - Supplements: {len(supplements)}")
print(f"  - Foods: {len(foods)}")
