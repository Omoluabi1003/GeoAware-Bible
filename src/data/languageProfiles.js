import { CountryRegistry, defaultCountry, getCountry } from './countryRegistry.js';
import { getScriptureLanguage } from './scriptureLanguageRegistry.js';

function toLegacyProfile(country) {
  const primaryLanguage = getScriptureLanguage(country.primaryLanguageCode);
  return Object.freeze({
    ...country,
    countryCode: country.isoCode,
    primaryLanguage: primaryLanguage.englishName,
    languageCode: country.primaryLanguageCode
  });
}

export const languageProfiles = Object.freeze(Object.fromEntries(
  Object.entries(CountryRegistry).map(([code, country]) => [code, toLegacyProfile(country)])
));

export const defaultProfile = toLegacyProfile(defaultCountry);

export function getProfileByCountryCode(countryCode) {
  return toLegacyProfile(getCountry(countryCode));
}
