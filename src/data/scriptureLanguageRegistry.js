import { scriptureTranslations } from './scripture.js';

const unavailableLicense = Object.freeze({
  status: 'unavailable',
  name: 'Unavailable in bundled open-license catalog',
  source: 'Add verified public-domain or open-license Scripture metadata before showing text'
});

function translation(id, status = 'available') {
  const catalogItem = scriptureTranslations[id];
  return Object.freeze({
    id,
    status: catalogItem ? status : 'unavailable',
    name: catalogItem?.name || 'Translation not bundled',
    abbreviation: catalogItem?.abbreviation || id.toUpperCase(),
    license: catalogItem?.license || unavailableLicense
  });
}

const registry = {
  en: {
    languageCode: 'en', nativeName: 'English', englishName: 'English', regionTags: ['global', 'north-america', 'west-africa'], countryCodes: ['US', 'NG'], direction: 'ltr', fallbackPriority: 100,
    availableTranslations: [translation('web')], defaultTranslationId: 'web', licenseStatus: 'available'
  },
  fr: {
    languageCode: 'fr', nativeName: 'Français', englishName: 'French', regionTags: ['western-europe', 'central-africa'], countryCodes: ['FR', 'CD', 'CG'], direction: 'ltr', fallbackPriority: 90,
    availableTranslations: [translation('sample-fr', 'unavailable')], defaultTranslationId: 'sample-fr', licenseStatus: 'metadata-only'
  },
  ja: {
    languageCode: 'ja', nativeName: '日本語', englishName: 'Japanese', regionTags: ['east-asia'], countryCodes: ['JP'], direction: 'ltr', fallbackPriority: 85,
    availableTranslations: [translation('sample-ja', 'unavailable')], defaultTranslationId: 'sample-ja', licenseStatus: 'metadata-only'
  },
  ln: {
    languageCode: 'ln', nativeName: 'Lingála', englishName: 'Lingala', regionTags: ['central-africa'], countryCodes: ['CD', 'CG'], direction: 'ltr', fallbackPriority: 96,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  yo: {
    languageCode: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba', regionTags: ['west-africa'], countryCodes: ['NG'], direction: 'ltr', fallbackPriority: 84,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  ha: {
    languageCode: 'ha', nativeName: 'Hausa', englishName: 'Hausa', regionTags: ['west-africa'], countryCodes: ['NG'], direction: 'ltr', fallbackPriority: 82,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  ig: {
    languageCode: 'ig', nativeName: 'Igbo', englishName: 'Igbo', regionTags: ['west-africa'], countryCodes: ['NG'], direction: 'ltr', fallbackPriority: 80,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  es: {
    languageCode: 'es', nativeName: 'Español', englishName: 'Spanish', regionTags: ['latin-america', 'europe', 'global'], countryCodes: ['ES', 'US'], direction: 'ltr', fallbackPriority: 70,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  pt: {
    languageCode: 'pt', nativeName: 'Português', englishName: 'Portuguese', regionTags: ['south-america', 'lusophone-africa'], countryCodes: ['BR'], direction: 'ltr', fallbackPriority: 78,
    availableTranslations: [translation('sample-pt', 'unavailable')], defaultTranslationId: 'sample-pt', licenseStatus: 'metadata-only'
  },
  ar: {
    languageCode: 'ar', nativeName: 'العربية', englishName: 'Arabic', regionTags: ['middle-east', 'north-africa'], countryCodes: [], direction: 'rtl', fallbackPriority: 76,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  sw: {
    languageCode: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', regionTags: ['east-africa'], countryCodes: ['KE'], direction: 'ltr', fallbackPriority: 86,
    availableTranslations: [translation('sample-sw', 'unavailable')], defaultTranslationId: 'sample-sw', licenseStatus: 'metadata-only'
  },
  he: {
    languageCode: 'he', nativeName: 'עברית', englishName: 'Hebrew', regionTags: ['middle-east'], countryCodes: ['IL'], direction: 'rtl', fallbackPriority: 88,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  el: {
    languageCode: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', regionTags: ['southern-europe'], countryCodes: ['GR'], direction: 'ltr', fallbackPriority: 83,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  },
  tr: {
    languageCode: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', regionTags: ['anatolia'], countryCodes: ['TR'], direction: 'ltr', fallbackPriority: 81,
    availableTranslations: [], defaultTranslationId: null, licenseStatus: 'unavailable'
  }
};

export const ScriptureLanguageRegistry = Object.freeze(registry);
export const scriptureLanguages = Object.freeze(Object.values(registry));
export const defaultScriptureLanguageCode = 'en';

export function getScriptureLanguage(languageCode) {
  return ScriptureLanguageRegistry[languageCode] || ScriptureLanguageRegistry[defaultScriptureLanguageCode];
}

export function getAvailableTranslation(language) {
  return language.availableTranslations.find((item) => item.status === 'available') || null;
}

export function hasAvailableScripture(language) {
  return Boolean(getAvailableTranslation(language));
}
