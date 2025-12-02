// Unit conversion utilities for blood markers

// Common unit conversions
const conversions = {
  // Vitamin D
  'ng/mL_to_nmol/L': (value) => value * 2.496,
  'nmol/L_to_ng/mL': (value) => value / 2.496,
  
  // Glucose
  'mg/dL_to_mmol/L': (value) => value / 18.0182,
  'mmol/L_to_mg/dL': (value) => value * 18.0182,
  
  // Cholesterol (Total, LDL, HDL)
  'mg/dL_chol_to_mmol/L': (value) => value / 38.67,
  'mmol/L_to_mg/dL_chol': (value) => value * 38.67,
  
  // Triglycerides
  'mg/dL_trig_to_mmol/L': (value) => value / 88.57,
  'mmol/L_to_mg/dL_trig': (value) => value * 88.57,
  
  // Iron / Ferritin
  'µg/L_to_ng/mL': (value) => value,
  'ng/mL_to_µg/L': (value) => value,
  
  // Hemoglobin
  'g/L_to_g/dL': (value) => value / 10,
  'g/dL_to_g/L': (value) => value * 10,
  
  // Creatinine
  'mg/dL_to_µmol/L': (value) => value * 88.4,
  'µmol/L_to_mg/dL': (value) => value / 88.4,
  
  // Uric acid
  'mg/dL_uric_to_µmol/L': (value) => value * 59.48,
  'µmol/L_to_mg/dL_uric': (value) => value / 59.48,
  
  // Bilirubin
  'mg/dL_bili_to_µmol/L': (value) => value * 17.1,
  'µmol/L_to_mg/dL_bili': (value) => value / 17.1,
  
  // B12
  'pg/mL_to_pmol/L': (value) => value * 0.738,
  'pmol/L_to_pg/mL': (value) => value / 0.738,
  
  // Folate
  'ng/mL_folate_to_nmol/L': (value) => value * 2.266,
  'nmol/L_to_ng/mL_folate': (value) => value / 2.266,
  
  // Testosterone
  'ng/dL_to_nmol/L': (value) => value * 0.0347,
  'nmol/L_to_ng/dL': (value) => value / 0.0347,
  
  // Cortisol
  'µg/dL_to_nmol/L': (value) => value * 27.59,
  'nmol/L_to_µg/dL': (value) => value / 27.59,
  
  // TSH - usually same units (mIU/L = µIU/mL)
  'mIU/L_to_µIU/mL': (value) => value,
  'µIU/mL_to_mIU/L': (value) => value,
  
  // CRP
  'mg/L_to_mg/dL': (value) => value / 10,
  'mg/dL_to_mg/L': (value) => value * 10,
};

// Normalize unit strings for comparison
const normalizeUnit = (unit) => {
  if (!unit) return '';
  return unit
    .toLowerCase()
    .replace(/\s/g, '')
    .replace('μ', 'µ')
    .replace('micro', 'µ')
    .replace('nano', 'n')
    .replace('milli', 'm')
    .replace('liter', 'l')
    .replace('litre', 'l')
    .replace('deciliter', 'dl')
    .replace('decilitre', 'dl');
};

// Check if units are equivalent (same or trivially convertible)
const unitsEquivalent = (unit1, unit2) => {
  const n1 = normalizeUnit(unit1);
  const n2 = normalizeUnit(unit2);
  
  if (n1 === n2) return true;
  
  // Common equivalents
  const equivalents = [
    ['ng/ml', 'µg/l', 'ug/l'],
    ['miu/l', 'µiu/ml', 'uiu/ml'],
    ['pg/ml', 'ng/l'],
  ];
  
  for (const group of equivalents) {
    if (group.includes(n1) && group.includes(n2)) return true;
  }
  
  return false;
};

// Get conversion function based on marker name and units
export const getConversionFunction = (markerName, fromUnit, toUnit) => {
  const normalFrom = normalizeUnit(fromUnit);
  const normalTo = normalizeUnit(toUnit);
  
  if (unitsEquivalent(fromUnit, toUnit)) {
    return (value) => value;
  }
  
  const markerLower = markerName.toLowerCase();
  
  // Vitamin D
  if (markerLower.includes('vitamin d') || markerLower.includes('25-oh') || markerLower.includes('calcidiol')) {
    if (normalFrom.includes('ng') && normalTo.includes('nmol')) {
      return conversions['ng/mL_to_nmol/L'];
    }
    if (normalFrom.includes('nmol') && normalTo.includes('ng')) {
      return conversions['nmol/L_to_ng/mL'];
    }
  }
  
  // Glucose / Blood Sugar
  if (markerLower.includes('glucose') || markerLower.includes('blutzucker') || markerLower.includes('blood sugar')) {
    if (normalFrom.includes('mg') && normalTo.includes('mmol')) {
      return conversions['mg/dL_to_mmol/L'];
    }
    if (normalFrom.includes('mmol') && normalTo.includes('mg')) {
      return conversions['mmol/L_to_mg/dL'];
    }
  }
  
  // Cholesterol
  if (markerLower.includes('cholesterol') || markerLower.includes('cholesterin') || 
      markerLower.includes('ldl') || markerLower.includes('hdl')) {
    if (normalFrom.includes('mg') && normalTo.includes('mmol')) {
      return conversions['mg/dL_chol_to_mmol/L'];
    }
    if (normalFrom.includes('mmol') && normalTo.includes('mg')) {
      return conversions['mmol/L_to_mg/dL_chol'];
    }
  }
  
  // Triglycerides
  if (markerLower.includes('triglycerid')) {
    if (normalFrom.includes('mg') && normalTo.includes('mmol')) {
      return conversions['mg/dL_trig_to_mmol/L'];
    }
    if (normalFrom.includes('mmol') && normalTo.includes('mg')) {
      return conversions['mmol/L_to_mg/dL_trig'];
    }
  }
  
  // Hemoglobin
  if (markerLower.includes('hemoglobin') || markerLower.includes('hämoglobin') || markerLower === 'hgb' || markerLower === 'hb') {
    if (normalFrom.includes('g/l') && normalTo.includes('g/dl')) {
      return conversions['g/L_to_g/dL'];
    }
    if (normalFrom.includes('g/dl') && normalTo.includes('g/l')) {
      return conversions['g/dL_to_g/L'];
    }
  }
  
  // Creatinine
  if (markerLower.includes('creatinin') || markerLower.includes('kreatinin')) {
    if (normalFrom.includes('mg') && normalTo.includes('µmol')) {
      return conversions['mg/dL_to_µmol/L'];
    }
    if (normalFrom.includes('µmol') && normalTo.includes('mg')) {
      return conversions['µmol/L_to_mg/dL'];
    }
  }
  
  // B12
  if (markerLower.includes('b12') || markerLower.includes('cobalamin')) {
    if (normalFrom.includes('pg') && normalTo.includes('pmol')) {
      return conversions['pg/mL_to_pmol/L'];
    }
    if (normalFrom.includes('pmol') && normalTo.includes('pg')) {
      return conversions['pmol/L_to_pg/mL'];
    }
  }
  
  // Testosterone
  if (markerLower.includes('testosteron')) {
    if (normalFrom.includes('ng/dl') && normalTo.includes('nmol')) {
      return conversions['ng/dL_to_nmol/L'];
    }
    if (normalFrom.includes('nmol') && normalTo.includes('ng/dl')) {
      return conversions['nmol/L_to_ng/dL'];
    }
  }
  
  // No conversion found - return identity
  return (value) => value;
};

// Convert a marker value to the reference unit
export const convertToReferenceUnit = (value, markerName, fromUnit, referenceUnit) => {
  const converter = getConversionFunction(markerName, fromUnit, referenceUnit);
  const converted = converter(value);
  return Math.round(converted * 100) / 100; // Round to 2 decimal places
};

export default {
  getConversionFunction,
  convertToReferenceUnit,
  normalizeUnit,
  unitsEquivalent
};