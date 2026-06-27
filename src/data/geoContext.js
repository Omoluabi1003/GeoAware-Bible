import { CountryRegistry, defaultCountry, getCountry } from './countryRegistry.js';
import { getScriptureLanguage } from './scriptureLanguageRegistry.js';
import { resolveScriptureLanguages } from './autoLanguageResolver.js';
import { getChristianRadioStations, resolveChristianRadioSuggestion } from './christianRadioRegistry.js';

const FUTURE_CONTEXT_HOOKS = Object.freeze({
  localHistoricalContext: null,
  biblicalGeographyRelevance: null,
  nearbyChurches: null,
  nearbyArchaeologicalSites: null,
  nearbyChristianMuseums: null,
  nearbySeminaries: null,
  nearbyBibleStudyGroups: null,
  nearbyChristianRadioStations: null,
  nearbyChristianEvents: null,
  nearbyMissionaryOrganizations: null
});

const geoContextCache = new Map();

function normalizeCountryCode(countryCode) {
  return countryCode?.toUpperCase?.() || defaultCountry.isoCode;
}

function coordinatesInBounds(coordinates, bounds) {
  if (!coordinates || !bounds) return false;
  const { latitude, longitude } = coordinates;
  return typeof latitude === 'number'
    && typeof longitude === 'number'
    && latitude >= bounds.minLatitude
    && latitude <= bounds.maxLatitude
    && longitude >= bounds.minLongitude
    && longitude <= bounds.maxLongitude;
}

export function inferCountryCodeFromCoordinates(coordinates) {
  const match = Object.entries(CountryRegistry).find(([, country]) => coordinatesInBounds(coordinates, country.bounds));
  return match?.[0] || null;
}

function buildGeoContext(countryCode) {
  const country = getCountry(normalizeCountryCode(countryCode));
  const primaryLanguage = getScriptureLanguage(country.primaryLanguageCode);

  return Object.freeze({
    isoCode: country.isoCode,
    country: country.country,
    displayName: country.country,
    continent: country.continent,
    primaryLanguage: primaryLanguage.englishName,
    languageCode: country.primaryLanguageCode,
    supportedLanguageCodes: Object.freeze([...country.supportedLanguageCodes]),
    timezone: country.timezone,
    hemisphere: country.hemisphere,
    regionalGrouping: country.region,
    region: country.region,
    bounds: country.bounds,
    flag: country.flag,
    city: country.city,
    state: country.state,
    translationId: country.translationId,
    alternates: country.alternates,
    prayer: country.prayer,
    countryHighlight: country.countryHighlight,
    coordinates: Object.freeze({ ...country.coordinates }),
    contextMetadata: Object.freeze({
      ...FUTURE_CONTEXT_HOOKS,
      nearbyChristianRadioStations: getChristianRadioStations(country.isoCode)
    })
  });
}

export function getGeoContext(countryCode) {
  const normalizedCode = normalizeCountryCode(countryCode);
  const cacheKey = CountryRegistry[normalizedCode] ? normalizedCode : defaultCountry.isoCode;

  if (!geoContextCache.has(cacheKey)) {
    geoContextCache.set(cacheKey, buildGeoContext(cacheKey));
  }

  return geoContextCache.get(cacheKey);
}

export function resolveGeoContext(input = {}) {
  const inferredCode = input.locality?.countryCode
    || inferCountryCodeFromCoordinates(input.coordinates)
    || input.countryCode
    || defaultCountry.isoCode;
  const countryRecord = getCountry(inferredCode);
  const model = getGeoContext(inferredCode);
  const city = input.locality?.city || countryRecord.city;
  const region = input.locality?.region || countryRecord.state || model.region;
  const country = input.locality?.country || countryRecord.country || model.country;
  const languageResolution = resolveScriptureLanguages({ ...model, countryCode: model.isoCode }, {
    stayInEnglish: input.stayInEnglish,
    browserLanguages: input.browserLanguages
  });
  const recommendedLanguage = languageResolution.recommendations[0]?.englishName || model.primaryLanguage;
  const recommendedTranslationId = languageResolution.recommendations[0]?.resolvedTranslationId || countryRecord.translationId || defaultCountry.translationId;
  const effectiveTranslationId = languageResolution.selectedTranslationId;
  const effectiveLanguage = languageResolution.selectedLanguage?.englishName || (input.stayInEnglish ? 'English' : recommendedLanguage);
  const worshipSuggestion = resolveChristianRadioSuggestion({ ...model, countryCode: model.isoCode, country });
  const languageRegionLabel = languageResolution.recommendations[0]?.languageCode === 'en' ? ` (${model.isoCode})` : '';

  return Object.freeze({
    ...model,
    countryCode: model.isoCode,
    city,
    stateOrProvince: region,
    country,
    preferredLanguage: recommendedLanguage,
    preferredLanguageCode: model.languageCode,
    recommendedTranslationId,
    effectiveTranslationId,
    effectiveLanguage,
    isEnglishOverride: languageResolution.isEnglishOverride,
    languageRecommendations: languageResolution.recommendations,
    selectedScriptureLanguage: languageResolution.selectedLanguage,
    coordinates: Object.freeze(input.coordinates || countryRecord.coordinates || model.coordinates),
    source: input.locality?.countryCode ? 'reverse-geocode' : input.coordinates ? 'coordinates' : 'profile',
    summary: `Detected: ${[city, region].filter(Boolean).join(', ') || country} • ${recommendedLanguage}${languageRegionLabel} recommended`,
    worshipSuggestion,
    worshipSuggestions: Object.freeze(worshipSuggestion ? [worshipSuggestion] : []),
    futureContextHooks: model.contextMetadata
  });
}

export function getGeoContextModel(countryCode) {
  return getGeoContext(countryCode);
}

export const supportedGeoContextCountries = Object.freeze(Object.keys(CountryRegistry));
export const geoContextModels = Object.freeze(CountryRegistry);
export const defaultGeoContext = getGeoContext(defaultCountry.isoCode);
