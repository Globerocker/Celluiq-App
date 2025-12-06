#!/usr/bin/env python3
"""
Analyze Excel files for Supplements and Foods
"""

import pandas as pd

print("📊 Analyzing Excel Files\n")

# Analyze Supplements
print("=" * 60)
print("SUPPLEMENTS DATABASE")
print("=" * 60)

try:
    df_supplements = pd.read_excel('Database/Supplement Database.xlsx')
    print(f"\n✅ Loaded: {len(df_supplements)} rows")
    print(f"\nColumns: {list(df_supplements.columns)}")
    print(f"\nFirst 3 rows:")
    print(df_supplements.head(3).to_string())
except Exception as e:
    print(f"❌ Error: {e}")

print("\n\n")

# Analyze Foods
print("=" * 60)
print("FOODS DATABASE")
print("=" * 60)

try:
    df_foods = pd.read_excel('Database/Foods Database.xlsx')
    print(f"\n✅ Loaded: {len(df_foods)} rows")
    print(f"\nColumns: {list(df_foods.columns)}")
    print(f"\nFirst 3 rows:")
    print(df_foods.head(3).to_string())
except Exception as e:
    print(f"❌ Error: {e}")
