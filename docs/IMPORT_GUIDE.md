# Excel zu Supabase Import - Anleitung

## Schritt 1: Excel zu CSV konvertieren

### In Excel/Numbers:
1. Öffne deine Excel-Datei
2. Gehe zu **Datei → Speichern unter**
3. Wähle Format: **CSV (Komma-getrennt)**
4. Speichere 3 separate CSV-Dateien:
   - `blood_markers.csv`
   - `supplements.csv`
   - `foods.csv`

## Schritt 2: CSV in Supabase importieren

### Für jede Tabelle:

1. Gehe zu deinem Supabase Dashboard: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk
2. Klicke auf **Table Editor** in der linken Sidebar
3. Wähle die entsprechende Tabelle:
   - `blood_markers_reference`
   - `supplements_reference`
   - `foods_reference`
4. Klicke auf **Insert → Import data from CSV**
5. Wähle deine CSV-Datei
6. Mappe die Spalten (Excel-Spalten → Datenbank-Spalten)
7. Klicke auf **Import**

## Spalten-Mapping

### Blood Markers CSV → blood_markers_reference
```
Excel Spalte          → Datenbank Spalte
--------------------- → ---------------------
Marker Name           → marker_name
Short Name            → short_name
Category              → category
Unit                  → unit
Optimal Min           → optimal_min
Optimal Max           → optimal_max
Normal Min            → normal_min
Normal Max            → normal_max
Gender                → gender
Description           → description
```

### Supplements CSV → supplements_reference
```
Excel Spalte          → Datenbank Spalte
--------------------- → ---------------------
Name                  → name
Category              → category
Dosage                → dosage_recommendation
Benefits              → benefits
Warnings              → warnings
Price Range           → price_range
```

### Foods CSV → foods_reference
```
Excel Spalte          → Datenbank Spalte
--------------------- → ---------------------
Name                  → name
Category              → category
Calories              → calories
Benefits              → benefits
Season                → season
```

## Alternative: Programmatischer Import

Falls du viele Daten hast (>1000 Zeilen), kann ich dir ein Node.js Script schreiben, das die Excel-Dateien direkt importiert.

Dafür bräuchte ich:
1. Die Excel-Dateien hochgeladen
2. Bestätigung, dass du Node.js installiert hast

## Nächste Schritte

1. ✅ SQL Schema ausführen: `supabase-reference-tables.sql`
2. ⏳ Excel → CSV konvertieren
3. ⏳ CSV in Supabase importieren
4. ⏳ Onboarding erweitern
5. ⏳ Visualisierung implementieren
