import { defaultScriptureLanguageCode, getAvailableTranslation, scriptureLanguages } from './scriptureLanguageRegistry.js';

function normalize(value) {
  return value?.toString?.().toLowerCase?.() || '';
}

function browserLanguageCodes(input = {}) {
  const languages = input.browserLanguages || [];
  return languages.map((language) => normalize(language).split('-')[0]).filter(Boolean);
}

export function resolveScriptureLanguages(geoContext = {}, options = {}) {
  const countryCode = geoContext.countryCode || geoContext.isoCode;
  const region = normalize(geoContext.region || geoContext.regionalGrouping);
  const browserCodes = browserLanguageCodes(options);

  const ranked = scriptureLanguages
    .map((language) => {
      const countryMatch = language.countryCodes.includes(countryCode);
      const regionMatch = language.regionTags.some((tag) => region.includes(normalize(tag).replaceAll('-', ' ')) || normalize(tag).includes(region));
      const browserMatch = browserCodes.includes(language.languageCode);
      const availableTranslation = getAvailableTranslation(language);
      const score = (countryMatch ? 1000 : 0)
        + (regionMatch ? 240 : 0)
        + (browserMatch ? 180 : 0)
        + (availableTranslation ? 80 : 0)
        + (language.fallbackPriority || 0);

      return Object.freeze({
        ...language,
        score,
        isDetectedCountryMatch: countryMatch,
        isDetectedRegionMatch: regionMatch,
        isBrowserLanguageMatch: browserMatch,
        isAvailable: Boolean(availableTranslation),
        resolvedTranslationId: availableTranslation?.id || language.defaultTranslationId || null,
        availabilityLabel: availableTranslation ? 'Available' : 'Awaiting verified open-license Scripture text'
      });
    })
    .filter((language) => language.isDetectedCountryMatch || language.isDetectedRegionMatch || language.isBrowserLanguageMatch || language.languageCode === defaultScriptureLanguageCode)
    .sort((a, b) => b.score - a.score || a.englishName.localeCompare(b.englishName));

  const highestAvailable = ranked.find((language) => language.isAvailable) || ranked.find((language) => language.languageCode === defaultScriptureLanguageCode);
  const english = ranked.find((language) => language.languageCode === defaultScriptureLanguageCode) || scriptureLanguages.find((language) => language.languageCode === defaultScriptureLanguageCode);
  const selectedLanguage = options.stayInEnglish ? english : highestAvailable;

  return Object.freeze({
    recommendations: Object.freeze(ranked),
    selectedLanguage: Object.freeze(selectedLanguage),
    selectedTranslationId: selectedLanguage?.resolvedTranslationId || 'web',
    isEnglishOverride: Boolean(options.stayInEnglish)
  });
}
