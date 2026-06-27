export const GEOGUIDE_INTENTS = Object.freeze({
  readNearMe: 'read_near_me',
  walkGeoNarrative: 'walk_geonarrative',
  explorePlace: 'explore_place',
  changeLanguage: 'change_language',
  explainLocation: 'explain_location'
});

export const GEOGUIDE_ACTION_TYPES = Object.freeze({
  readNearMe: 'READ_NEAR_ME',
  walkGeoNarrative: 'WALK_GEONARRATIVE',
  explorePlace: 'EXPLORE_PLACE',
  changeLanguage: 'CHANGE_LANGUAGE',
  explainLocation: 'EXPLAIN_LOCATION',
  fallback: 'FALLBACK'
});

export const GEOGUIDE_STATUS = Object.freeze({
  ready: 'ready',
  unsupported: 'unsupported',
  notFound: 'not_found',
  needsClarification: 'needs_clarification'
});

export const GEOGUIDE_BIBLICAL_GEOGRAPHY_POLICY = Object.freeze({
  source: 'bundled_registry_only',
  rule: 'GeoGuide only resolves places, routes, and language choices already present in GeoAware registries; it must not invent biblical locations, route certainty, or Scripture geography.'
});

export function normalizeGeoGuideIntent(rawIntent = {}) {
  const type = typeof rawIntent.type === 'string' ? rawIntent.type.trim().toLowerCase() : '';
  const slots = rawIntent.slots && typeof rawIntent.slots === 'object' ? rawIntent.slots : {};

  return Object.freeze({
    type,
    slots: Object.freeze({ ...slots }),
    source: rawIntent.source || 'programmatic',
    confidence: typeof rawIntent.confidence === 'number' ? rawIntent.confidence : null,
    rawText: rawIntent.rawText || null
  });
}

export function isSupportedGeoGuideIntent(type) {
  return Object.values(GEOGUIDE_INTENTS).includes(type);
}
