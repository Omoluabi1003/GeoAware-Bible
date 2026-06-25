import { defaultProfile, languageProfiles } from './languageProfiles.js';

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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
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
    futureMetadata: {
      biblicalHistory: null,
      archaeology: null,
      culturalContext: null
    }
  }
};

const geoContextCache = new Map();

function normalizeCountryCode(countryCode) {
  return countryCode?.toUpperCase?.() || defaultProfile.countryCode || 'US';
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

export function getGeoContextModel(countryCode) {
  return countryContextModels[normalizeCountryCode(countryCode)] || countryContextModels.US;
}

export const supportedGeoContextCountries = Object.freeze(Object.keys(countryContextModels));
export const geoContextModels = Object.freeze(countryContextModels);
export const defaultGeoContext = getGeoContext('US');
