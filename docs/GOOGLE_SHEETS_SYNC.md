# Google Sheets → Supabase Live-Sync

## Übersicht

Mit diesem Setup werden Änderungen in deinen Google Sheets automatisch in Echtzeit zu Supabase synchronisiert.

## Setup-Anleitung

### Schritt 1: Service Role Key holen

1. Gehe zu: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/settings/api
2. Kopiere den **service_role** Key (NICHT den anon key!)
3. ⚠️ **WICHTIG**: Dieser Key ist sehr mächtig, teile ihn niemals öffentlich!

### Schritt 2: Google Sheets vorbereiten

1. Öffne dein Google Sheet mit den Daten
2. Benenne die Tabs genau so:
   - `Blood Markers` (für Blut-Marker)
   - `Supplements` (für Supplements)
   - `Foods` (für Nahrungsmittel)

3. **Header-Zeilen** (Zeile 1) müssen exakt so heißen:

#### Blood Markers Tab:
```
Marker Name | Short Name | Category | Unit | Optimal Min | Optimal Max | Normal Min | Normal Max | Gender | Description
```

#### Supplements Tab:
```
Name | Category | Dosage | Benefits | Warnings | Price Range
```

#### Foods Tab:
```
Name | Category | Calories | Benefits | Season
```

### Schritt 3: Apps Script installieren

1. In deinem Google Sheet: **Extensions → Apps Script**
2. Lösche den vorhandenen Code
3. Kopiere den Code aus `google-sheets-sync.gs`
4. Ersetze in Zeile 12: `SUPABASE_SERVICE_KEY` mit deinem Service Role Key
5. **Speichern** (Ctrl/Cmd + S)

### Schritt 4: Trigger einrichten

1. Im Apps Script Editor: Klicke auf **Run** → `setupTriggers`
2. Beim ersten Mal: Erlaube die Berechtigungen
3. Warte auf "Execution completed"

### Schritt 5: Erste Synchronisation

1. Zurück zu deinem Google Sheet
2. Oben erscheint ein neues Menü: **🔄 Supabase Sync**
3. Klicke auf **Alle Daten synchronisieren**
4. Warte auf die Bestätigung

## Wie es funktioniert

### Automatische Sync
- ✅ Jede Änderung in einer Zelle wird sofort zu Supabase gesendet
- ✅ Neue Zeilen werden automatisch hinzugefügt
- ✅ Geänderte Zeilen werden aktualisiert

### Manuelle Sync
- Über das Menü **🔄 Supabase Sync → Alle Daten synchronisieren**
- Nützlich nach größeren Änderungen

## Logs & Debugging

1. Im Apps Script Editor: **View → Logs** (oder Ctrl/Cmd + Enter)
2. Hier siehst du alle Sync-Aktivitäten und eventuelle Fehler

## Wichtige Hinweise

⚠️ **Service Role Key Sicherheit**:
- Speichere den Key NIEMALS in einem öffentlichen Repository
- Teile den Key mit niemandem
- Der Key hat volle Datenbank-Rechte!

💡 **Best Practices**:
- Teste zuerst mit wenigen Zeilen
- Mache ein Backup deiner Daten
- Prüfe die Logs nach der ersten Sync

## Troubleshooting

### "Unauthorized" Fehler
→ Service Role Key ist falsch oder fehlt

### "Table not found" Fehler
→ SQL Schema noch nicht ausgeführt (siehe `supabase-reference-tables.sql`)

### Keine Synchronisation
→ Trigger nicht eingerichtet (siehe Schritt 4)

### Doppelte Einträge
→ Lösche die Tabelle in Supabase und sync erneut

## Alternative: Zapier/Make.com

Falls Google Apps Script zu kompliziert ist:
- **Zapier**: Google Sheets → Supabase Integration
- **Make.com**: Ähnlich wie Zapier, oft günstiger
- **n8n**: Open-Source Alternative (selbst hosten)

Beide haben fertige Integrationen, kosten aber monatlich.
