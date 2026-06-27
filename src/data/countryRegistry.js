const registry = {
  US: {
    isoCode: 'US', country: 'United States', region: 'North America', continent: 'North America', flag: '🇺🇸', city: 'Orlando', state: 'Florida', primaryLanguageCode: 'en', supportedLanguageCodes: ['en', 'es'], translationId: 'web', alternates: ['Spanish', 'Haitian Creole'], coordinates: { latitude: 37.0902, longitude: -95.7129 }, countryHighlight: { latitude: 39.5, longitude: -98.35, radiusLatitude: 14, radiusLongitude: 28, tilt: -7 }, timezone: 'America/New_York', hemisphere: { latitudinal: 'Northern', longitudinal: 'Western' }, bounds: { minLatitude: 24.3, maxLatitude: 49.5, minLongitude: -125, maxLongitude: -66.8 }, prayer: 'May peace, wisdom, and renewal rest upon every home and city in this land.'
  },
  NG: {
    isoCode: 'NG', country: 'Nigeria', region: 'West Africa', continent: 'Africa', flag: '🇳🇬', city: 'Lagos', state: 'Lagos', primaryLanguageCode: 'en', supportedLanguageCodes: ['en', 'yo', 'ig', 'ha'], translationId: 'web', alternates: ['Yoruba', 'Igbo', 'Hausa'], coordinates: { latitude: 9.082, longitude: 8.6753 }, countryHighlight: { latitude: 9.6, longitude: 8.1, radiusLatitude: 5.4, radiusLongitude: 4.8, tilt: -6 }, timezone: 'Africa/Lagos', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 4.2, maxLatitude: 13.9, minLongitude: 2.6, maxLongitude: 14.7 }, prayer: 'May God bless Nigeria with courage, healing, justice, and light for every generation.'
  },
  CG: {
    isoCode: 'CG', country: 'Republic of the Congo', region: 'Central Africa', continent: 'Africa', flag: '🇨🇬', city: 'Brazzaville', primaryLanguageCode: 'ln', supportedLanguageCodes: ['ln', 'fr'], translationId: 'web', alternates: ['French'], coordinates: { latitude: -0.228, longitude: 15.8277 }, countryHighlight: { latitude: -0.7, longitude: 15.4, radiusLatitude: 3.9, radiusLongitude: 3.2, tilt: -5 }, timezone: 'Africa/Brazzaville', hemisphere: { latitudinal: 'Equatorial', longitudinal: 'Eastern' }, bounds: { minLatitude: -5.1, maxLatitude: 3.8, minLongitude: 11.1, maxLongitude: 18.7 }, prayer: 'May peace, mercy, and courage rest across the Republic of the Congo.'
  },
  CD: {
    isoCode: 'CD', country: 'Democratic Republic of the Congo', region: 'Central Africa', continent: 'Africa', flag: '🇨🇩', city: 'Kinshasa', primaryLanguageCode: 'ln', supportedLanguageCodes: ['ln', 'fr'], translationId: 'web', alternates: ['French', 'English'], coordinates: { latitude: -4.0383, longitude: 21.7587 }, countryHighlight: { latitude: -2.9, longitude: 23.7, radiusLatitude: 10.5, radiusLongitude: 8.8, tilt: -8 }, timezone: 'Africa/Kinshasa', hemisphere: { latitudinal: 'Equatorial', longitudinal: 'Eastern' }, bounds: { minLatitude: -13.5, maxLatitude: 5.4, minLongitude: 12.1, maxLongitude: 31.4 }, prayer: 'May hope, healing, and peace rise across the Democratic Republic of the Congo with steadfast love.'
  },
  BR: {
    isoCode: 'BR', country: 'Brazil', region: 'South America', continent: 'South America', flag: '🇧🇷', city: 'Brasília', state: 'Federal District', primaryLanguageCode: 'pt', supportedLanguageCodes: ['pt', 'en'], translationId: 'sample-pt', alternates: ['English'], coordinates: { latitude: -14.235, longitude: -51.9253 }, countryHighlight: { latitude: -10.8, longitude: -53.2, radiusLatitude: 18, radiusLongitude: 19, tilt: -12 }, timezone: 'America/Sao_Paulo', hemisphere: { latitudinal: 'Southern', longitudinal: 'Western' }, bounds: { minLatitude: -33.8, maxLatitude: 5.4, minLongitude: -74, maxLongitude: -34.7 }, prayer: 'May joy, mercy, and hope flow across Brazil like rivers of grace.'
  },
  KE: {
    isoCode: 'KE', country: 'Kenya', region: 'East Africa', continent: 'Africa', flag: '🇰🇪', city: 'Nairobi', state: 'Nairobi County', primaryLanguageCode: 'sw', supportedLanguageCodes: ['sw', 'en'], translationId: 'sample-sw', alternates: ['English'], coordinates: { latitude: -0.0236, longitude: 37.9062 }, countryHighlight: { latitude: 0.4, longitude: 37.9, radiusLatitude: 4.2, radiusLongitude: 3.8, tilt: -9 }, timezone: 'Africa/Nairobi', hemisphere: { latitudinal: 'Equatorial', longitudinal: 'Eastern' }, bounds: { minLatitude: -4.8, maxLatitude: 5.3, minLongitude: 33.9, maxLongitude: 41.9 }, prayer: 'May the people of Kenya walk in peace, strength, and divine direction.'
  },
  FR: {
    isoCode: 'FR', country: 'France', region: 'Western Europe', continent: 'Europe', flag: '🇫🇷', city: 'Paris', primaryLanguageCode: 'fr', supportedLanguageCodes: ['fr', 'en'], translationId: 'sample-fr', alternates: ['English'], coordinates: { latitude: 46.2276, longitude: 2.2137 }, countryHighlight: { latitude: 46.4, longitude: 2.2, radiusLatitude: 5.8, radiusLongitude: 5.2, tilt: 7 }, timezone: 'Europe/Paris', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 41.3, maxLatitude: 51.2, minLongitude: -5.2, maxLongitude: 9.7 }, prayer: 'May faith, compassion, and truth shine across France with renewed clarity.'
  },
  JP: {
    isoCode: 'JP', country: 'Japan', region: 'East Asia', continent: 'Asia', flag: '🇯🇵', city: 'Tokyo', primaryLanguageCode: 'ja', supportedLanguageCodes: ['ja', 'en'], translationId: 'sample-ja', alternates: ['English'], coordinates: { latitude: 36.2048, longitude: 138.2529 }, countryHighlight: { latitude: 37.5, longitude: 137.7, radiusLatitude: 7.4, radiusLongitude: 3.3, tilt: 24 }, timezone: 'Asia/Tokyo', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 24, maxLatitude: 46, minLongitude: 122, maxLongitude: 146 }, prayer: 'May quiet strength, peace, and the light of truth rest upon Japan.'
  },
  IL: {
    isoCode: 'IL', country: 'Israel', region: 'Middle East', continent: 'Asia', flag: '🇮🇱', city: 'Jerusalem', primaryLanguageCode: 'he', supportedLanguageCodes: ['he', 'en', 'ar'], translationId: 'web', alternates: ['English', 'Arabic'], coordinates: { latitude: 31.0461, longitude: 34.8516 }, countryHighlight: { latitude: 31.4, longitude: 35, radiusLatitude: 2.4, radiusLongitude: 1.2, tilt: 10 }, timezone: 'Asia/Jerusalem', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 29.4, maxLatitude: 33.4, minLongitude: 34.2, maxLongitude: 35.9 }, prayer: 'May peace, mercy, and reconciliation be near to every household in Israel.'
  },
  GR: {
    isoCode: 'GR', country: 'Greece', region: 'Southern Europe', continent: 'Europe', flag: '🇬🇷', city: 'Athens', primaryLanguageCode: 'el', supportedLanguageCodes: ['el', 'en'], translationId: 'web', alternates: ['English'], coordinates: { latitude: 39.0742, longitude: 21.8243 }, countryHighlight: { latitude: 39.1, longitude: 22, radiusLatitude: 4.4, radiusLongitude: 3.6, tilt: 14 }, timezone: 'Europe/Athens', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 34.7, maxLatitude: 41.8, minLongitude: 19.3, maxLongitude: 29.7 }, prayer: 'May grace and enduring hope shine across Greece and its islands.'
  },
  TR: {
    isoCode: 'TR', country: 'Türkiye', region: 'Anatolia', continent: 'Asia', flag: '🇹🇷', city: 'Ankara', primaryLanguageCode: 'tr', supportedLanguageCodes: ['tr', 'en'], translationId: 'web', alternates: ['English'], coordinates: { latitude: 38.9637, longitude: 35.2433 }, countryHighlight: { latitude: 39, longitude: 35.2, radiusLatitude: 4.9, radiusLongitude: 8.4, tilt: 9 }, timezone: 'Europe/Istanbul', hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' }, bounds: { minLatitude: 35.8, maxLatitude: 42.1, minLongitude: 25.6, maxLongitude: 44.8 }, prayer: 'May kindness, courage, and the light of Christ bring renewal across Türkiye.'
  }
};

export const CountryRegistry = Object.freeze(registry);
export const countries = Object.freeze(Object.values(registry));
export const defaultCountryCode = 'US';
export const defaultCountry = CountryRegistry[defaultCountryCode];

export function getCountry(countryCode) {
  if (!countryCode) return defaultCountry;
  return CountryRegistry[countryCode.toUpperCase()] || defaultCountry;
}
