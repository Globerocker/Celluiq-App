# n8n → Supabase Setup Guide

## Overview
Use n8n to sync your Google Sheets (or Excel files) to Supabase automatically.

## Step 1: Create Tables in Supabase

1. Go to: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/editor
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy & paste the SQL from: `supabase-reference-tables-with-constraints.sql`
5. Click **Run**

✅ This creates 3 tables with **dropdown constraints** to prevent typos!

## Step 2: Category Dropdowns Explained

The tables now have **CHECK constraints** that only allow specific values:

### Blood Markers Categories:
- `vitamins`
- `minerals`
- `hormones`
- `lipids`
- `liver`
- `kidney`
- `thyroid`
- `blood_cells`
- `inflammation`
- `metabolic`
- `other`

### Supplements Categories:
- `vitamins`
- `minerals`
- `amino_acids`
- `herbs`
- `probiotics`
- `omega_3`
- `antioxidants`
- `adaptogens`
- `other`

### Foods Categories:
- `vegetables`
- `fruits`
- `protein`
- `grains`
- `dairy`
- `nuts`
- `seeds`
- `legumes`
- `fish`
- `meat`
- `oils`
- `herbs_spices`
- `other`

**Important**: If you try to insert a category that's not in the list, Supabase will reject it!

## Step 3: Setup n8n Workflow

### Option A: Google Sheets → Supabase

1. **Trigger**: Google Sheets (On Row Added/Updated)
2. **Action**: Supabase (Insert/Update Row)
3. **Mapping**: Map your columns to the database fields

### Option B: Manual Upload → Supabase

1. **Trigger**: Webhook or Manual
2. **Read File**: CSV/Excel Reader
3. **Loop**: For each row
4. **Action**: Supabase Insert

## Step 4: n8n Credentials

You'll need:
- **Supabase URL**: `https://evutidxtftmvvfmnnngk.supabase.co`
- **Supabase Service Key**: Get from Settings → API → service_role key

## Step 5: Example n8n Workflow (JSON)

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "insert",
        "tableId": "blood_markers_reference",
        "columns": {
          "marker_name": "={{ $json.marker_name }}",
          "category": "={{ $json.category }}",
          "unit": "={{ $json.unit }}"
        }
      },
      "name": "Supabase",
      "type": "n8n-nodes-base.supabase"
    }
  ]
}
```

## Adding New Categories

If you need to add a new category:

1. Go to Supabase SQL Editor
2. Run this SQL (example for blood_markers):

```sql
ALTER TABLE blood_markers_reference 
DROP CONSTRAINT IF EXISTS blood_markers_reference_category_check;

ALTER TABLE blood_markers_reference 
ADD CONSTRAINT blood_markers_reference_category_check 
CHECK (category IN (
  'vitamins', 'minerals', 'hormones', 'lipids', 
  'liver', 'kidney', 'thyroid', 'blood_cells', 
  'inflammation', 'metabolic', 'other',
  'YOUR_NEW_CATEGORY'  -- Add here
));
```

## Troubleshooting

### "violates check constraint" error
→ You're trying to use a category that's not allowed
→ Check the allowed values above or add it via SQL

### "duplicate key value" error
→ You're trying to insert a row with an ID that already exists
→ Use "upsert" instead of "insert" in n8n

### Data not appearing in app
→ Check RLS policies are set correctly
→ Make sure the table names match exactly

## Next Steps

1. ✅ Run the SQL to create tables
2. ⏳ Setup n8n workflow
3. ⏳ Test with a few rows
4. ⏳ Import all your data
5. ⏳ Verify in Supabase Table Editor
