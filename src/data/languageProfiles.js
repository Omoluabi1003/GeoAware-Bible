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
    coordinates: { x: 31, y: 42 },
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
    coordinates: { x: 52, y: 50 },
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
    coordinates: { x: 39, y: 66 },
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
    coordinates: { x: 59, y: 56 },
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
    coordinates: { x: 48, y: 35 },
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
    coordinates: { x: 79, y: 43 },
    flag: '🇯🇵',
    prayer: 'May quiet strength, peace, and the light of truth rest upon Japan.'
  }
};

export const defaultProfile = languageProfiles.US;

export function getProfileByCountryCode(countryCode) {
  if (!countryCode) return defaultProfile;
  return languageProfiles[countryCode.toUpperCase()] || defaultProfile;
}
