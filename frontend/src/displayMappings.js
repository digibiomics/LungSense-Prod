/**
 * Display mappings for converting codes to human-readable names
 * This only affects frontend display, backend APIs remain unchanged
 */

// Static mappings based on backend enums
export const ETHNICITY_NAMES = {
  'AFR': 'African',
  'ASN': 'Asian', 
  'CAU': 'Caucasian',
  'HIS': 'Hispanic',
  'MDE': 'Middle Eastern',
  'MIX': 'Mixed',
  'UND': 'Undisclosed'
};

export const SEX_NAMES = {
  'F': 'Female',
  'M': 'Male', 
  'O': 'Other'
};

export const RESPIRATORY_NAMES = {
  'COPD': 'Chronic Obstructive Pulmonary Disease',
  'ASTHMA': 'Asthma',
  'TB': 'Tuberculosis',
  'CF': 'Cystic Fibrosis',
  'SMOKER': 'Smoking History',
  'WORK_EXPOSURE': 'Occupational Exposure',
  'NONE': 'No History'
};

// Country mappings
const COUNTRY_NAMES = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'IN': 'India',
  'DE': 'Germany'
};

/**
 * Convert ethnicity code to display name
 */
export const getEthnicityName = (code) => {
  return ETHNICITY_NAMES[code] || code;
};

/**
 * Convert sex code to display name
 */
export const getSexName = (code) => {
  return SEX_NAMES[code] || code;
};

/**
 * Convert respiratory history JSON to display names
 */
export const getRespiratoryHistoryNames = (historyJson) => {
  if (!historyJson) return 'Not provided';
  
  try {
    const conditions = JSON.parse(historyJson);
    if (Array.isArray(conditions)) {
      return conditions
        .map(code => RESPIRATORY_NAMES[code] || code)
        .join(', ');
    }
    return historyJson;
  } catch {
    return historyJson;
  }
};

/**
 * Convert country code to display name
 */
export const getCountryName = (code) => {
  if (!code) return 'Not provided';
  return COUNTRY_NAMES[code] || code;
};

/**
 * Convert province code to display name
 */
export const getProvinceName = (code) => {
  if (!code) return 'Not provided';
  
  // Simple province name extraction from code
  const provinceMap = {
    'US-CA': 'California',
    'US-NY': 'New York', 
    'US-TX': 'Texas',
    'US-FL': 'Florida',
    'IN-MH': 'Maharashtra',
    'IN-DL': 'Delhi',
    'IN-KA': 'Karnataka',
    'IN-TN': 'Tamil Nadu',
    'CA-ON': 'Ontario',
    'CA-BC': 'British Columbia',
    'GB-ENG': 'England',
    'GB-SCT': 'Scotland'
  };
  
  return provinceMap[code] || code;
};