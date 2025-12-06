#!/usr/bin/env python3
"""
Blood Markers CSV to Supabase Importer
Converts the detailed blood markers CSV to Supabase format
"""

import csv
import json
from supabase import create_client, Client

# Supabase Configuration
# Supabase Configuration
SUPABASE_URL = "https://evutidxtftmvvfmnnngk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dXRpZHh0ZnRtdnZmbW5ubmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNjE0MCwiZXhwIjoyMDgwNTgyMTQwfQ.-AYDWJisK7Iy_91q2N-1-nxFJjzGvw8dqRuECWL75vE"  # Service Role Key

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_csv_row(row):
    """Convert CSV row to database format"""
    
    # Extract supplements for low values
    supplements_low = []
    if row['Supplement (Low)']:
        supplements_low.append({
            'name': row['Supplement (Low)'],
            'dosage': row['Dosage (Low)'],
            'form': row['Preferred Form (Low)'],
            'mechanism': row['Mechanism (Low)']
        })
    
    # Extract supplements for high values
    supplements_high = []
    if row['Supplement (High)']:
        supplements_high.append({
            'name': row['Supplement (High)'],
            'dosage': row['Dosage (High)'],
            'form': row['Preferred Form (High)'],
            'mechanism': row['Mechanism (High)']
        })
    
    # Extract foods
    foods_low = [f.strip() for f in row['Food (Low)'].split(',') if f.strip()]
    foods_high = [f.strip() for f in row['Food (High)'].split(',') if f.strip()]
    
    # Parse clinical range
    clinical_range = row['Clinical Range'].replace('<', '').replace('>', '')
    clinical_parts = clinical_range.split('-')
    
    # Parse CELLUIQ range
    celluiq_range = row['CELLUIQ Range'].replace('<', '').replace('>', '')
    celluiq_parts = celluiq_range.split('-')
    
    # Map category to our allowed values
    category_mapping = {
        'Adrenal': 'hormones',
        'Amino Acids': 'metabolic',
        'Antioxidants': 'vitamins',
        'Bone Metabolism': 'metabolic',
        'Growth Factors': 'hormones',
        'Gut Health': 'inflammation',
        'Hematology': 'blood_cells',
        'Hormones': 'hormones',
        'Inflammation': 'inflammation',
        'Iron Metabolism': 'minerals',
        'Kidney Function': 'kidney',
        'Lipids': 'lipids',
        'Liver Function': 'liver',
        'Metabolic': 'metabolic',
        'Methylation': 'metabolic',
        'Minerals': 'minerals',
        'Thyroid': 'thyroid',
        'Vitamins': 'vitamins'
    }
    
    return {
        'marker_name': row['Marker'],
        'short_name': row['Short'],
        'category': category_mapping.get(row['Category'], 'other'),
        'unit': row['Units'],
        'optimal_min': float(celluiq_parts[0]) if len(celluiq_parts) > 0 and celluiq_parts[0] else None,
        'optimal_max': float(celluiq_parts[1]) if len(celluiq_parts) > 1 and celluiq_parts[1] else None,
        'normal_min': float(clinical_parts[0]) if len(clinical_parts) > 0 and clinical_parts[0] else None,
        'normal_max': float(clinical_parts[1]) if len(clinical_parts) > 1 and clinical_parts[1] else None,
        'gender': row['gender'],
        'too_low_supplements': json.dumps(supplements_low) if supplements_low else None,
        'too_high_supplements': json.dumps(supplements_high) if supplements_high else None,
        'too_low_foods': json.dumps(foods_low) if foods_low else None,
        'too_high_foods': json.dumps(foods_high) if foods_high else None,
        'description': f"Low: {row['If Low (Symptoms)']} | High: {row['If High (Symptoms)']}",
        'importance': 'important'  # Default, can be customized
    }

def import_blood_markers(csv_file_path):
    """Import blood markers from CSV to Supabase"""
    
    print(f"Reading CSV from: {csv_file_path}")
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        markers = []
        
        for row in reader:
            try:
                marker = parse_csv_row(row)
                markers.append(marker)
                print(f"✓ Parsed: {marker['marker_name']}")
            except Exception as e:
                print(f"✗ Error parsing row: {row.get('Marker', 'Unknown')}: {e}")
        
        print(f"\nTotal markers parsed: {len(markers)}")
        
        # Insert into Supabase in batches
        batch_size = 50
        for i in range(0, len(markers), batch_size):
            batch = markers[i:i+batch_size]
            try:
                response = supabase.table('blood_markers_reference').insert(batch).execute()
                print(f"✓ Inserted batch {i//batch_size + 1} ({len(batch)} markers)")
            except Exception as e:
                print(f"✗ Error inserting batch: {e}")
        
        print(f"\n🎉 Import complete! {len(markers)} markers imported.")

if __name__ == "__main__":
    csv_file = "Database/Bloodmaker Database - Men (1).csv"
    import_blood_markers(csv_file)
