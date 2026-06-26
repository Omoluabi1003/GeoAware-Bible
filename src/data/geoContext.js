import { defaultProfile, getProfileByCountryCode, languageProfiles } from './languageProfiles.js';

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

const countryContextModels = {
  US: {
    isoCode: 'US',
    country: 'United States',
    continent: 'North America',
    primaryLanguage: 'English',
    languageCode: 'en',
    timezone: 'America/New_York',
    hemisphere: { latitudinal: 'Northern', longitudinal: 'Western' },
    regionalGrouping: 'North America',
    bounds: { minLatitude: 24.3, maxLatitude: 49.5, minLongitude: -125, maxLongitude: -66.8 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  },
  NG: {
    isoCode: 'NG',
    country: 'Nigeria',
    continent: 'Africa',
    primaryLanguage: 'English',
    languageCode: 'en',
    timezone: 'Africa/Lagos',
    hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' },
    regionalGrouping: 'West Africa',
    bounds: { minLatitude: 4.2, maxLatitude: 13.9, minLongitude: 2.6, maxLongitude: 14.7 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  },
  BR: {
    isoCode: 'BR',
    country: 'Brazil',
    continent: 'South America',
    primaryLanguage: 'Portuguese',
    languageCode: 'pt',
    timezone: 'America/Sao_Paulo',
    hemisphere: { latitudinal: 'Southern', longitudinal: 'Western' },
    regionalGrouping: 'South America',
    bounds: { minLatitude: -33.8, maxLatitude: 5.4, minLongitude: -74, maxLongitude: -34.7 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  },
  KE: {
    isoCode: 'KE',
    country: 'Kenya',
    continent: 'Africa',
    primaryLanguage: 'Swahili',
    languageCode: 'sw',
    timezone: 'Africa/Nairobi',
    hemisphere: { latitudinal: 'Equatorial', longitudinal: 'Eastern' },
    regionalGrouping: 'East Africa',
    bounds: { minLatitude: -4.8, maxLatitude: 5.3, minLongitude: 33.9, maxLongitude: 41.9 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  },
  FR: {
    isoCode: 'FR',
    country: 'France',
    continent: 'Europe',
    primaryLanguage: 'French',
    languageCode: 'fr',
    timezone: 'Europe/Paris',
    hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' },
    regionalGrouping: 'Western Europe',
    bounds: { minLatitude: 41.3, maxLatitude: 51.2, minLongitude: -5.2, maxLongitude: 9.7 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  },
  JP: {
    isoCode: 'JP',
    country: 'Japan',
    continent: 'Asia',
    primaryLanguage: 'Japanese',
    languageCode: 'ja',
    timezone: 'Asia/Tokyo',
    hemisphere: { latitudinal: 'Northern', longitudinal: 'Eastern' },
    regionalGrouping: 'East Asia',
    bounds: { minLatitude: 24, maxLatitude: 46, minLongitude: 122, maxLongitude: 146 },
    futureMetadata: FUTURE_CONTEXT_HOOKS
  }
};

const geoContextCache = new Map();

function normalizeCountryCode(countryCode) {
  return countryCode?.toUpperCase?.() || defaultProfile.countryCode || 'US';
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
  const match = Object.entries(countryContextModels).find(([, model]) => coordinatesInBounds(coordinates, model.bounds));
  return match?.[0] || null;
}

function buildGeoContext(countryCode) {
  const normalizedCode = normalizeCountryCode(countryCode);
  const profile = languageProfiles[normalizedCode] || defaultProfile;
  const model = countryContextModels[normalizedCode] || countryContextModels.US;

  return Object.freeze({
    ...model,
    displayName: profile.country,
    coordinates: Object.freeze({ ...profile.coordinates }),
    region: model.regionalGrouping,
    contextMetadata: Object.freeze({ ...model.futureMetadata })
  });
}

export function getGeoContext(countryCode) {
  const normalizedCode = normalizeCountryCode(countryCode);
  const cacheKey = countryContextModels[normalizedCode] ? normalizedCode : 'US';

  if (!geoContextCache.has(cacheKey)) {
    geoContextCache.set(cacheKey, buildGeoContext(cacheKey));
  }

  return geoContextCache.get(cacheKey);
}

export function resolveGeoContext(input = {}) {
  const inferredCode = input.locality?.countryCode
    || inferCountryCodeFromCoordinates(input.coordinates)
    || input.countryCode
    || 'US';
  const profile = getProfileByCountryCode(inferredCode);
  const model = getGeoContext(inferredCode);
  const city = input.locality?.city || profile.city;
  const region = input.locality?.region || profile.state || model.region;
  const country = input.locality?.country || profile.country || model.country;
  const recommendedTranslationId = profile.translationId || defaultProfile.translationId;
  const effectiveTranslationId = input.stayInEnglish ? 'web' : recommendedTranslationId;
  const recommendedLanguage = profile.primaryLanguage || model.primaryLanguage;
  const effectiveLanguage = input.stayInEnglish ? 'English' : recommendedLanguage;
  const languageRegionLabel = profile.languageCode === 'en' ? ` (${model.isoCode})` : '';

  return Object.freeze({
    ...model,
    countryCode: model.isoCode,
    city,
    stateOrProvince: region,
    country,
    preferredLanguage: recommendedLanguage,
    preferredLanguageCode: profile.languageCode || model.languageCode,
    recommendedTranslationId,
    effectiveTranslationId,
    effectiveLanguage,
    isEnglishOverride: Boolean(input.stayInEnglish),
    coordinates: Object.freeze(input.coordinates || profile.coordinates || model.coordinates),
    source: input.locality?.countryCode ? 'reverse-geocode' : input.coordinates ? 'coordinates' : 'profile',
    summary: `Detected: ${[city, region].filter(Boolean).join(', ') || country} • ${recommendedLanguage}${languageRegionLabel} recommended`,
    futureContextHooks: model.contextMetadata
  });
}

export function getGeoContextModel(countryCode) {
  return countryContextModels[normalizeCountryCode(countryCode)] || countryContextModels.US;
}

export const supportedGeoContextCountries = Object.freeze(Object.keys(countryContextModels));
export const geoContextModels = Object.freeze(countryContextModels);
export const defaultGeoContext = getGeoContext('US');
