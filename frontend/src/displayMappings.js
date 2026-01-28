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

// Cache for country names to avoid repeated API calls
const locationCache = new Map();

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
 * Get country name from ISO code using REST Countries API
 */
export const getCountryName = async (code) => {
  if (!code) return 'Not provided';
  
  // Check cache first
  const cacheKey = `country_${code}`;
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const countryName = data[0]?.name?.common || code;
    
    // Cache the result
    locationCache.set(cacheKey, countryName);
    return countryName;
  } catch (error) {
    console.warn(`Failed to fetch country name for ${code}:`, error);
    return code; // Fallback to code if API fails
  }
};

/**
 * Get province/state name (simplified mapping for common ones)
 */
export const getProvinceName = (code) => {
  if (!code) return 'Not provided';
  
  // Basic mapping for Australian states (extend as needed)
  const provinceNames = {
    'AU-01': 'Australian Capital Territory',
    'AU-02': 'New South Wales',
    'AU-03': 'Northern Territory', 
    'AU-04': 'Queensland',
    'AU-05': 'South Australia',
    'AU-06': 'Tasmania',
    'AU-07': 'Victoria',
    'AU-08': 'Western Australia',
  };
  
  return provinceNames[code] || code;
};