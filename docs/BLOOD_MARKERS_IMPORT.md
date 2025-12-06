# Blood Markers Import Guide

## What I Found

Your CSV contains **112 blood markers** with incredibly detailed information:
- Categories: Hormones, Vitamins, Minerals, Lipids, Thyroid, Liver, Kidney, etc.
- Clinical & CELLUIQ ranges
- Symptoms for low/high values
- Supplement recommendations (with dosage, form, mechanism)
- Food recommendations
- Medications
- Lifestyle tips
- Warnings
- Studies/links

## Import Options

### Option 1: Python Script (Recommended)

I created `import_blood_markers.py` that will:
1. Parse your CSV
2. Convert to Supabase format
3. Import all 112 markers automatically

**Setup:**
```bash
# Install dependencies
pip install supabase-py

# Get your Service Role Key from:
# https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/settings/api

# Edit import_blood_markers.py and add your key

# Run the import
python3 import_blood_markers.py
```

### Option 2: Manual via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/editor
2. Select `blood_markers_reference` table
3. Click "Insert" → "Import data from CSV"
4. Upload your CSV
5. Map columns (I'll help with this)

### Option 3: n8n Workflow

Since you mentioned using n8n, I can create a workflow for you.

## Data Structure Notes

### Categories Mapped:
- Adrenal → hormones
- Amino Acids → metabolic
- Antioxidants → vitamins
- Bone Metabolism → metabolic
- Growth Factors → hormones
- Gut Health → inflammation
- Hematology → blood_cells
- Hormones → hormones
- Inflammation → inflammation
- Iron Metabolism → minerals
- Kidney Function → kidney
- Lipids → lipids
- Liver Function → liver
- Metabolic → metabolic
- Methylation → metabolic
- Minerals → minerals
- Thyroid → thyroid
- Vitamins → vitamins

### Supplements & Foods Format

The CSV has detailed supplement info that I'm storing as JSON:
```json
{
  "name": "Zinc",
  "dosage": "30-50 mg/day",
  "form": "Zinc picolinate",
  "mechanism": "Boosts LH and testicular function"
}
```

## Next Steps

1. **Run the SQL schema** if you haven't:
   - `supabase-reference-tables-with-constraints.sql`

2. **Choose import method** (I recommend Python script)

3. **Do you also have:**
   - Supplements database?
   - Foods database?
   - Women's blood markers?

Let me know which import method you prefer!
