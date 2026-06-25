export const languageProfiles = {
  US: {
    country: 'United States',
    region: 'North America',
    city: 'Orlando',
    state: 'Florida',
    primaryLanguage: 'English',
    languageCode: 'en',
    translationId: 'web',
    alternates: ['Spanish', 'Haitian Creole'],
    coordinates: { latitude: 37.0902, longitude: -95.7129 },
    countryHighlight: { latitude: 39.5, longitude: -98.35, radiusLatitude: 14, radiusLongitude: 28, tilt: -7 },
    flag: '🇺🇸',
    prayer: 'May peace, wisdom, and renewal rest upon every home and city in this land.'
  },
  NG: {
    country: 'Nigeria',
    region: 'West Africa',
    city: 'Lagos',
    state: 'Lagos',
    primaryLanguage: 'English',
    languageCode: 'en',
    translationId: 'web',
    alternates: ['Yoruba', 'Hausa', 'Igbo', 'Pidgin English'],
    coordinates: { latitude: 9.082, longitude: 8.6753 },
    countryHighlight: { latitude: 9.6, longitude: 8.1, radiusLatitude: 5.4, radiusLongitude: 4.8, tilt: -6 },
    flag: '🇳🇬',
    prayer: 'May God bless Nigeria with courage, healing, justice, and light for every generation.'
  },
  BR: {
    country: 'Brazil',
    region: 'South America',
    city: 'Brasília',
    state: 'Federal District',
    primaryLanguage: 'Portuguese',
    languageCode: 'pt',
    translationId: 'sample-pt',
    alternates: ['English'],
    coordinates: { latitude: -14.235, longitude: -51.9253 },
    countryHighlight: { latitude: -10.8, longitude: -53.2, radiusLatitude: 18, radiusLongitude: 19, tilt: -12 },
    flag: '🇧🇷',
    prayer: 'May joy, mercy, and hope flow across Brazil like rivers of grace.'
  },
  KE: {
    country: 'Kenya',
    region: 'East Africa',
    city: 'Nairobi',
    state: 'Nairobi County',
    primaryLanguage: 'Swahili',
    languageCode: 'sw',
    translationId: 'sample-sw',
    alternates: ['English'],
    coordinates: { latitude: -0.0236, longitude: 37.9062 },
    countryHighlight: { latitude: 0.4, longitude: 37.9, radiusLatitude: 4.2, radiusLongitude: 3.8, tilt: -9 },
    flag: '🇰🇪',
    prayer: 'May the people of Kenya walk in peace, strength, and divine direction.'
  },
  FR: {
    country: 'France',
    region: 'Western Europe',
    city: 'Paris',
    primaryLanguage: 'French',
    languageCode: 'fr',
    translationId: 'sample-fr',
    alternates: ['English'],
    coordinates: { latitude: 46.2276, longitude: 2.2137 },
    countryHighlight: { latitude: 46.4, longitude: 2.2, radiusLatitude: 5.8, radiusLongitude: 5.2, tilt: 7 },
    flag: '🇫🇷',
    prayer: 'May faith, compassion, and truth shine across France with renewed clarity.'
  },
  JP: {
    country: 'Japan',
    region: 'East Asia',
    city: 'Tokyo',
    primaryLanguage: 'Japanese',
    languageCode: 'ja',
    translationId: 'sample-ja',
    alternates: ['English'],
    coordinates: { latitude: 36.2048, longitude: 138.2529 },
    countryHighlight: { latitude: 37.5, longitude: 137.7, radiusLatitude: 7.4, radiusLongitude: 3.3, tilt: 24 },
    flag: '🇯🇵',
    prayer: 'May quiet strength, peace, and the light of truth rest upon Japan.'
  }
};

export const defaultProfile = languageProfiles.US;

export function getProfileByCountryCode(countryCode) {
  if (!countryCode) return defaultProfile;
  return languageProfiles[countryCode.toUpperCase()] || defaultProfile;
}
