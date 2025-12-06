// Google Apps Script für Google Sheets → Supabase Sync
// 
// INSTALLATION:
// 1. Öffne dein Google Sheet
// 2. Gehe zu Extensions → Apps Script
// 3. Kopiere diesen Code
// 4. Ersetze SUPABASE_URL und SUPABASE_SERVICE_KEY
// 5. Speichern und Trigger einrichten

// ===== KONFIGURATION =====
const SUPABASE_URL = 'https://evutidxtftmvvfmnnngk.supabase.co';
const SUPABASE_SERVICE_KEY = 'DEIN_SERVICE_ROLE_KEY_HIER'; // Nicht der Anon Key!

// Tabellen-Mapping: Sheet Name → Supabase Tabelle
const TABLE_MAPPING = {
  'Blood Markers': 'blood_markers_reference',
  'Supplements': 'supplements_reference',
  'Foods': 'foods_reference'
};

// Spalten-Mapping für jede Tabelle
const COLUMN_MAPPING = {
  'Blood Markers': {
    'Marker Name': 'marker_name',
    'Short Name': 'short_name',
    'Category': 'category',
    'Unit': 'unit',
    'Optimal Min': 'optimal_min',
    'Optimal Max': 'optimal_max',
    'Normal Min': 'normal_min',
    'Normal Max': 'normal_max',
    'Gender': 'gender',
    'Description': 'description'
  },
  'Supplements': {
    'Name': 'name',
    'Category': 'category',
    'Dosage': 'dosage_recommendation',
    'Benefits': 'benefits',
    'Warnings': 'warnings',
    'Price Range': 'price_range'
  },
  'Foods': {
    'Name': 'name',
    'Category': 'category',
    'Calories': 'calories',
    'Benefits': 'benefits',
    'Season': 'season'
  }
};

// ===== HAUPTFUNKTIONEN =====

/**
 * Wird automatisch bei jeder Änderung im Sheet ausgeführt
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();
  
  // Prüfe ob das Sheet synchronisiert werden soll
  if (!TABLE_MAPPING[sheetName]) {
    Logger.log('Sheet "' + sheetName + '" wird nicht synchronisiert');
    return;
  }
  
  const range = e.range;
  const row = range.getRow();
  
  // Ignoriere Header-Zeile
  if (row === 1) return;
  
  Logger.log('Änderung erkannt in ' + sheetName + ', Zeile ' + row);
  syncRow(sheet, row, sheetName);
}

/**
 * Manuelle Komplett-Synchronisation aller Daten
 * Kann über Extensions → Apps Script → Run ausgeführt werden
 */
function syncAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(TABLE_MAPPING).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('Sheet "' + sheetName + '" nicht gefunden');
      return;
    }
    
    Logger.log('Synchronisiere ' + sheetName + '...');
    syncSheet(sheet, sheetName);
  });
  
  SpreadsheetApp.getUi().alert('Synchronisation abgeschlossen!');
}

/**
 * Synchronisiert eine einzelne Zeile
 */
function syncRow(sheet, rowNumber, sheetName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const record = mapRowToRecord(headers, rowData, sheetName);
  
  if (!record) {
    Logger.log('Zeile ' + rowNumber + ' ist leer, überspringe');
    return;
  }
  
  upsertToSupabase(TABLE_MAPPING[sheetName], record);
}

/**
 * Synchronisiert ein komplettes Sheet
 */
function syncSheet(sheet, sheetName) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const tableName = TABLE_MAPPING[sheetName];
  
  // Lösche alle existierenden Einträge (optional)
  // deleteAllFromSupabase(tableName);
  
  // Synchronisiere alle Zeilen (außer Header)
  for (let i = 1; i < data.length; i++) {
    const record = mapRowToRecord(headers, data[i], sheetName);
    if (record) {
      upsertToSupabase(tableName, record);
    }
  }
}

/**
 * Mappt eine Sheet-Zeile zu einem Datenbank-Record
 */
function mapRowToRecord(headers, rowData, sheetName) {
  const mapping = COLUMN_MAPPING[sheetName];
  const record = {};
  
  let hasData = false;
  
  headers.forEach((header, index) => {
    const dbColumn = mapping[header];
    if (dbColumn && rowData[index] !== '') {
      record[dbColumn] = rowData[index];
      hasData = true;
    }
  });
  
  return hasData ? record : null;
}

/**
 * Fügt einen Record in Supabase ein oder aktualisiert ihn
 */
function upsertToSupabase(tableName, record) {
  const url = SUPABASE_URL + '/rest/v1/' + tableName;
  
  const options = {
    method: 'post',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    payload: JSON.stringify(record),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode === 201 || responseCode === 200) {
    Logger.log('✓ Erfolgreich synchronisiert: ' + JSON.stringify(record));
  } else {
    Logger.log('✗ Fehler beim Synchronisieren: ' + response.getContentText());
  }
}

/**
 * Löscht alle Einträge aus einer Tabelle (Vorsicht!)
 */
function deleteAllFromSupabase(tableName) {
  const url = SUPABASE_URL + '/rest/v1/' + tableName + '?select=*';
  
  const options = {
    method: 'delete',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
    },
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, options);
  Logger.log('Alle Einträge aus ' + tableName + ' gelöscht');
}

// ===== SETUP-FUNKTIONEN =====

/**
 * Erstellt automatische Trigger für onEdit
 * Einmalig ausführen nach Installation
 */
function setupTriggers() {
  // Lösche alte Trigger
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Erstelle neuen onEdit Trigger
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  
  Logger.log('Trigger eingerichtet!');
}

/**
 * Erstellt ein Menü in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Supabase Sync')
    .addItem('Alle Daten synchronisieren', 'syncAllData')
    .addItem('Trigger einrichten', 'setupTriggers')
    .addToUi();
}
