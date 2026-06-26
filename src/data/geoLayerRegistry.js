import { scriptureLanguages } from './scriptureLanguageRegistry.js';
import { journeyList } from './journeyRegistry.js';

export const GEO_LAYER_TYPES = Object.freeze({
  scripture: 'scripture',
  language: 'language',
  biblicalJourney: 'biblicalJourney',
  christianRadio: 'christianRadio',
  pilgrimage: 'pilgrimage',
  prayer: 'prayer',
  archaeology: 'archaeology'
});

export const SOURCE_STATUS = Object.freeze({
  verified: 'verified',
  unavailable: 'unavailable',
  placeholder: 'placeholder',
  derivedFromRegistry: 'derivedFromRegistry'
});

function freezeRecord(record) {
  return Object.freeze({
    ...record,
    coordinates: Object.freeze({ ...record.coordinates }),
    scriptureRefs: Object.freeze([...(record.scriptureRefs || [])]),
    languageCodes: Object.freeze([...(record.languageCodes || [])])
  });
}

function freezeRoute(route) {
  return Object.freeze({
    ...route,
    scriptureRefs: Object.freeze([...(route.scriptureRefs || [])]),
    languageCodes: Object.freeze([...(route.languageCodes || [])]),
    waypoints: Object.freeze(route.waypoints.map(freezeRecord))
  });
}

const scriptureLayer = Object.freeze({
  id: 'scripture-localization',
  type: GEO_LAYER_TYPES.scripture,
  title: 'Scripture Localization',
  description: 'Current Scripture reading and translation availability by place.',
  toggleReady: true,
  records: Object.freeze([])
});

const scriptureLanguageLayer = Object.freeze({
  id: 'scripture-languages',
  type: GEO_LAYER_TYPES.language,
  title: 'Scripture Languages',
  description: 'Language records derived from the existing Scripture language registry without adding unverified translations.',
  toggleReady: true,
  records: Object.freeze(scriptureLanguages.map((language) => freezeRecord({
    id: `scripture-language-${language.languageCode}`,
    layerType: GEO_LAYER_TYPES.language,
    lat: null,
    lon: null,
    coordinates: { latitude: null, longitude: null },
    title: `${language.englishName} Scripture Language`,
    description: `${language.nativeName} (${language.englishName}) recommendation metadata from the existing registry.`,
    scriptureRefs: [],
    languageCodes: [language.languageCode],
    sourceStatus: SOURCE_STATUS.derivedFromRegistry,
    translationStatus: language.licenseStatus,
    defaultTranslationId: language.defaultTranslationId,
    availableTranslationIds: language.availableTranslations
      .filter((translation) => translation.status === 'available')
      .map((translation) => translation.id)
  })))
});

const biblicalJourneyLayer = Object.freeze({
  id: 'biblical-journeys',
  type: GEO_LAYER_TYPES.biblicalJourney,
  title: 'Biblical Journeys',
  description: 'GIS-ready ordered biblical journeys from the JourneyRegistry.',
  toggleReady: true,
  routes: Object.freeze(journeyList.map((journey) => freezeRoute({
    id: journey.id,
    layerType: GEO_LAYER_TYPES.biblicalJourney,
    title: journey.title,
    description: journey.description,
    scriptureRefs: journey.scriptureRefs,
    languageCodes: [],
    sourceStatus: SOURCE_STATUS.derivedFromRegistry,
    futureSyncChannels: journey.futureSyncChannels,
    waypoints: journey.waypoints.map((waypoint) => ({
      id: waypoint.id,
      title: waypoint.title,
      description: waypoint.historicalSummary,
      historicalSummary: waypoint.historicalSummary,
      sequence: waypoint.sequence,
      estimatedTravelDuration: waypoint.estimatedTravelDuration,
      lat: waypoint.latitude,
      lon: waypoint.longitude,
      latitude: waypoint.latitude,
      longitude: waypoint.longitude,
      coordinates: waypoint.coordinates,
      scriptureRefs: waypoint.scriptureRefs,
      languageCodes: [],
      sourceStatus: SOURCE_STATUS.derivedFromRegistry,
      synchronization: waypoint.synchronization
    }))
  })))
});

const christianRadioLayer = Object.freeze({
  id: 'christian-radio',
  type: GEO_LAYER_TYPES.christianRadio,
  title: 'Christian Radio',
  description: 'WaveAtlas-compatible Christian radio data model. No stream URLs are bundled until verified.',
  toggleReady: true,
  records: Object.freeze([
    freezeRecord({
      id: 'christian-radio-unavailable-template',
      layerType: GEO_LAYER_TYPES.christianRadio,
      lat: null,
      lon: null,
      coordinates: { latitude: null, longitude: null },
      title: 'Christian radio stream unavailable',
      description: 'Placeholder-safe record showing the model without fabricating a station or stream.',
      scriptureRefs: [],
      languageCodes: [],
      sourceStatus: SOURCE_STATUS.unavailable,
      stream: Object.freeze({ status: 'unavailable', url: null, format: null, verifiedAt: null }),
      waveAtlas: Object.freeze({ stationId: null, band: null, frequency: null, callsign: null, countryCode: null })
    })
  ])
});

function emptyLayer(id, type, title, description) {
  return Object.freeze({ id, type, title, description, toggleReady: true, records: Object.freeze([]) });
}

export const GeoLayerRegistry = Object.freeze({
  [GEO_LAYER_TYPES.scripture]: scriptureLayer,
  [GEO_LAYER_TYPES.language]: scriptureLanguageLayer,
  [GEO_LAYER_TYPES.biblicalJourney]: biblicalJourneyLayer,
  [GEO_LAYER_TYPES.christianRadio]: christianRadioLayer,
  [GEO_LAYER_TYPES.pilgrimage]: emptyLayer('pilgrimage', GEO_LAYER_TYPES.pilgrimage, 'Pilgrimage Intelligence', 'Future pilgrimage-safe intelligence layer.'),
  [GEO_LAYER_TYPES.prayer]: emptyLayer('prayer', GEO_LAYER_TYPES.prayer, 'Prayer', 'Future prayer geography layer.'),
  [GEO_LAYER_TYPES.archaeology]: emptyLayer('archaeology', GEO_LAYER_TYPES.archaeology, 'Archaeology', 'Future archaeology layer requiring vetted sources.')
});

export const geoLayerList = Object.freeze(Object.values(GeoLayerRegistry));

export function getGeoLayer(type) {
  return GeoLayerRegistry[type] || null;
}

export function buildActiveGeoLayers(activeTypes = Object.values(GEO_LAYER_TYPES)) {
  return Object.freeze(activeTypes.map(getGeoLayer).filter(Boolean));
}
