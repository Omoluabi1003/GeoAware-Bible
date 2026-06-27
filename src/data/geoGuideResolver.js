import { defaultGeoContext, getGeoContextModel, resolveGeoContext, supportedGeoContextCountries } from './geoContext.js';
import { geoNarrativeList, getGeoNarrative } from './geoNarrativeRegistry.js';
import { getScriptureLanguage, ScriptureLanguageRegistry } from './scriptureLanguageRegistry.js';
import { GEONARRATIVE_STUDIO_STATUS, resolveGeoNarrativeStudioPrompt } from './geoNarrativeStudio.js';
import {
  GEOGUIDE_ACTION_TYPES,
  GEOGUIDE_BIBLICAL_GEOGRAPHY_POLICY,
  GEOGUIDE_INTENTS,
  GEOGUIDE_STATUS,
  isSupportedGeoGuideIntent,
  normalizeGeoGuideIntent
} from './geoGuideIntentModel.js';

const FALLBACK_MESSAGES = Object.freeze({
  unknown: 'GeoGuide does not recognize that intent yet.',
  unsupported: 'GeoGuide cannot safely resolve that request from the bundled geography and language registries.',
  placeNotFound: 'GeoGuide could not match that place to a verified bundled GeoContext or GeoNarrative waypoint.',
  narrativeNotFound: 'GeoGuide could not match that GeoNarrative to a bundled route.',
  languageNotFound: 'GeoGuide could not match that language to the bundled language registry.'
});

function response({ status = GEOGUIDE_STATUS.ready, actionType, message, payload = {} }) {
  return Object.freeze({
    status,
    action: Object.freeze({
      type: actionType,
      payload: Object.freeze(payload)
    }),
    message,
    policy: GEOGUIDE_BIBLICAL_GEOGRAPHY_POLICY
  });
}

function fallback(message, status = GEOGUIDE_STATUS.unsupported) {
  return response({
    status,
    actionType: GEOGUIDE_ACTION_TYPES.fallback,
    message
  });
}

function normalizeSearchText(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function findCountryByPlace(place) {
  const normalizedPlace = normalizeSearchText(place);
  if (!normalizedPlace) return null;

  return supportedGeoContextCountries
    .map((countryCode) => getGeoContextModel(countryCode))
    .find((context) => [context.isoCode, context.country, context.displayName, context.city, context.state, context.region]
      .filter(Boolean)
      .some((candidate) => normalizeSearchText(candidate) === normalizedPlace)) || null;
}

function findWaypointByPlace(place) {
  const normalizedPlace = normalizeSearchText(place);
  if (!normalizedPlace) return null;

  for (const narrative of geoNarrativeList) {
    const waypoint = narrative.waypoints.find((item) => [item.id, item.title]
      .filter(Boolean)
      .some((candidate) => normalizeSearchText(candidate) === normalizedPlace));
    if (waypoint) return { narrative, waypoint };
  }

  return null;
}

function findLanguage(languageCodeOrName) {
  const normalizedLanguage = normalizeSearchText(languageCodeOrName);
  if (!normalizedLanguage) return null;

  return Object.values(ScriptureLanguageRegistry)
    .find((language) => [language.languageCode, language.englishName, language.nativeName]
      .filter(Boolean)
      .some((candidate) => normalizeSearchText(candidate) === normalizedLanguage)) || null;
}

function resolveReadNearMe(intent, environment) {
  const geoContext = resolveGeoContext({
    countryCode: intent.slots.countryCode || environment.countryCode,
    coordinates: intent.slots.coordinates || environment.coordinates,
    locality: intent.slots.locality || environment.locality,
    stayInEnglish: intent.slots.stayInEnglish ?? environment.stayInEnglish,
    browserLanguages: intent.slots.browserLanguages || environment.browserLanguages
  });

  return response({
    actionType: GEOGUIDE_ACTION_TYPES.readNearMe,
    message: `Read Scripture using the verified GeoContext for ${geoContext.country}.`,
    payload: { geoContext, readingMode: 'read_near_me' }
  });
}

function resolveWalkGeoNarrative(intent) {
  const studioPrompt = intent.slots.studioPrompt || intent.slots.prompt;
  const studioResult = studioPrompt ? resolveGeoNarrativeStudioPrompt(studioPrompt) : null;
  if (studioResult && studioResult.status !== GEONARRATIVE_STUDIO_STATUS.supported) return fallback(studioResult.message, GEOGUIDE_STATUS.unsupported);

  const narrativeId = studioResult?.geoNarrativeId || intent.slots.geoNarrativeId || intent.slots.journeyId || intent.slots.id;
  const narrative = studioResult?.geoNarrative || getGeoNarrative(narrativeId) || geoNarrativeList.find((item) => normalizeSearchText(item.title) === normalizeSearchText(intent.slots.title));
  if (!narrative) return fallback(FALLBACK_MESSAGES.narrativeNotFound, GEOGUIDE_STATUS.notFound);

  return response({
    actionType: GEOGUIDE_ACTION_TYPES.walkGeoNarrative,
    message: studioResult?.message || `Open the bundled GeoNarrative: ${narrative.title}.`,
    payload: { geoNarrativeId: narrative.id, readingMode: 'walk_the_word', geoNarrative: narrative }
  });
}

function resolveExplorePlace(intent) {
  const place = intent.slots.place || intent.slots.name || intent.slots.countryCode;
  if (['world', 'the world', 'explore world'].includes(normalizeSearchText(place))) {
    return response({
      actionType: GEOGUIDE_ACTION_TYPES.explorePlace,
      message: 'Open the Explore the World placeholder mode.',
      payload: { placeType: 'world_placeholder', readingMode: 'explore_world' }
    });
  }

  const countryContext = findCountryByPlace(place);
  if (countryContext) {
    return response({
      actionType: GEOGUIDE_ACTION_TYPES.explorePlace,
      message: `Explore the verified GeoContext for ${countryContext.country}.`,
      payload: { placeType: 'geo_context', geoContext: countryContext, readingMode: 'explore_world' }
    });
  }

  const waypointMatch = findWaypointByPlace(place);
  if (waypointMatch) {
    return response({
      actionType: GEOGUIDE_ACTION_TYPES.explorePlace,
      message: `Explore the bundled waypoint ${waypointMatch.waypoint.title}.`,
      payload: { placeType: 'geonarrative_waypoint', geoNarrativeId: waypointMatch.narrative.id, waypoint: waypointMatch.waypoint, readingMode: 'explore_world' }
    });
  }

  return fallback(FALLBACK_MESSAGES.placeNotFound, GEOGUIDE_STATUS.notFound);
}

function resolveChangeLanguage(intent) {
  const language = findLanguage(intent.slots.languageCode || intent.slots.language || intent.slots.name);
  if (!language) return fallback(FALLBACK_MESSAGES.languageNotFound, GEOGUIDE_STATUS.notFound);

  return response({
    actionType: GEOGUIDE_ACTION_TYPES.changeLanguage,
    message: `Switch to the bundled language profile for ${language.englishName}.`,
    payload: { languageCode: language.languageCode, language }
  });
}

function resolveExplainLocation(intent, environment) {
  const place = intent.slots.place || intent.slots.name;
  const waypointMatch = findWaypointByPlace(place);
  if (waypointMatch) {
    return response({
      actionType: GEOGUIDE_ACTION_TYPES.explainLocation,
      message: waypointMatch.waypoint.historicalSummary || waypointMatch.narrative.summary,
      payload: { source: 'geonarrative_waypoint', geoNarrativeId: waypointMatch.narrative.id, waypoint: waypointMatch.waypoint }
    });
  }

  const countryContext = findCountryByPlace(place) || getGeoContextModel(intent.slots.countryCode || environment.countryCode || defaultGeoContext.isoCode);
  return response({
    actionType: GEOGUIDE_ACTION_TYPES.explainLocation,
    message: countryContext.countryHighlight || countryContext.summary || `GeoGuide has a bundled GeoContext for ${countryContext.country}.`,
    payload: { source: 'geo_context', geoContext: countryContext }
  });
}

export function resolveGeoGuideIntent(rawIntent, environment = {}) {
  const intent = normalizeGeoGuideIntent(rawIntent);
  if (!isSupportedGeoGuideIntent(intent.type)) return fallback(FALLBACK_MESSAGES.unknown, GEOGUIDE_STATUS.unsupported);

  switch (intent.type) {
    case GEOGUIDE_INTENTS.readNearMe:
      return resolveReadNearMe(intent, environment);
    case GEOGUIDE_INTENTS.walkGeoNarrative:
      return resolveWalkGeoNarrative(intent);
    case GEOGUIDE_INTENTS.explorePlace:
      return resolveExplorePlace(intent);
    case GEOGUIDE_INTENTS.changeLanguage:
      return resolveChangeLanguage(intent);
    case GEOGUIDE_INTENTS.explainLocation:
      return resolveExplainLocation(intent, environment);
    default:
      return fallback(FALLBACK_MESSAGES.unsupported, GEOGUIDE_STATUS.unsupported);
  }
}

export function createGeoGuideResolver(environment = {}) {
  return Object.freeze({
    supportedIntents: Object.freeze(Object.values(GEOGUIDE_INTENTS)),
    policy: GEOGUIDE_BIBLICAL_GEOGRAPHY_POLICY,
    resolve: (rawIntent) => resolveGeoGuideIntent(rawIntent, environment)
  });
}
