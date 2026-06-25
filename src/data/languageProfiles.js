export const languageProfiles = {
  US: {
    country: 'United States',
    primaryLanguage: 'English',
    languageCode: 'en',
    translationId: 'web',
    welcome: 'Welcome to the United States. Scripture is ready in English.'
  },
  NG: {
    country: 'Nigeria',
    primaryLanguage: 'English',
    languageCode: 'en',
    translationId: 'web',
    alternates: ['Yoruba', 'Hausa', 'Igbo', 'Pidgin English'],
    welcome: 'Welcome to Nigeria. Scripture is ready in English, with major Nigerian language pathways prepared.'
  },
  BR: {
    country: 'Brazil',
    primaryLanguage: 'Portuguese',
    languageCode: 'pt',
    translationId: 'sample-pt',
    welcome: 'Bem-vindo ao Brasil. Scripture is recommended in Portuguese.'
  },
  KE: {
    country: 'Kenya',
    primaryLanguage: 'Swahili',
    languageCode: 'sw',
    translationId: 'sample-sw',
    alternates: ['English'],
    welcome: 'Welcome to Kenya. Scripture is recommended in Swahili.'
  },
  FR: {
    country: 'France',
    primaryLanguage: 'French',
    languageCode: 'fr',
    translationId: 'sample-fr',
    welcome: 'Bienvenue en France. Scripture is recommended in French.'
  }
};

export const defaultProfile = languageProfiles.US;

export function getProfileByCountryCode(countryCode) {
  if (!countryCode) return defaultProfile;
  return languageProfiles[countryCode.toUpperCase()] || defaultProfile;
}
