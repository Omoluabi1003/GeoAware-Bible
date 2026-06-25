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
    flag: '🇯🇵',
    prayer: 'May quiet strength, peace, and the light of truth rest upon Japan.'
  }
};

export const defaultProfile = languageProfiles.US;

export function getProfileByCountryCode(countryCode) {
  if (!countryCode) return defaultProfile;
  return languageProfiles[countryCode.toUpperCase()] || defaultProfile;
}
