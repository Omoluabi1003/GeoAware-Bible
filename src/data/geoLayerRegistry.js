import { scriptureLanguages } from './scriptureLanguageRegistry.js';

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
  description: 'Coordinate-ready route placeholders for biblical journeys; coordinates can be filled from vetted GIS sources later.',
  toggleReady: true,
  routes: Object.freeze([
    freezeRoute({
      id: 'paul-first-missionary-journey',
      layerType: GEO_LAYER_TYPES.biblicalJourney,
      title: "Paul's First Missionary Journey",
      description: 'Route placeholder for Antioch, Cyprus, Pisidian Antioch, Iconium, Lystra, Derbe, and return legs.',
      scriptureRefs: ['Acts 13:1-14:28'],
      languageCodes: ['el', 'tr'],
      sourceStatus: SOURCE_STATUS.placeholder,
      waypoints: [
        { id: 'antioch-syria', title: 'Antioch in Syria', description: 'Commissioning and return-report waypoint.', lat: null, lon: null, coordinates: { latitude: null, longitude: null }, scriptureRefs: ['Acts 13:1-3', 'Acts 14:26-28'], languageCodes: ['el', 'tr'], sourceStatus: SOURCE_STATUS.placeholder },
        { id: 'cyprus', title: 'Cyprus', description: 'Island ministry waypoint including Salamis and Paphos.', lat: null, lon: null, coordinates: { latitude: null, longitude: null }, scriptureRefs: ['Acts 13:4-12'], languageCodes: ['el'], sourceStatus: SOURCE_STATUS.placeholder },
        { id: 'derbe', title: 'Derbe', description: 'Interior Asia Minor waypoint before the return route.', lat: null, lon: null, coordinates: { latitude: null, longitude: null }, scriptureRefs: ['Acts 14:20-21'], languageCodes: ['tr'], sourceStatus: SOURCE_STATUS.placeholder }
      ]
    }),
    freezeRoute({
      id: 'paul-second-missionary-journey',
      layerType: GEO_LAYER_TYPES.biblicalJourney,
      title: "Paul's Second Missionary Journey",
      description: 'Route placeholder from Antioch through Asia Minor, Macedonia, Athens, Corinth, and return.',
      scriptureRefs: ['Acts 15:36-18:22'],
      languageCodes: ['el', 'tr'],
      sourceStatus: SOURCE_STATUS.placeholder,
      waypoints: []
    }),
    freezeRoute({
      id: 'paul-third-missionary-journey',
      layerType: GEO_LAYER_TYPES.biblicalJourney,
      title: "Paul's Third Missionary Journey",
      description: 'Route placeholder for Galatia/Phrygia, Ephesus, Macedonia, Greece, Troas, Miletus, Tyre, and Jerusalem.',
      scriptureRefs: ['Acts 18:23-21:17'],
      languageCodes: ['el', 'tr', 'he'],
      sourceStatus: SOURCE_STATUS.placeholder,
      waypoints: []
    }),
    freezeRoute({
      id: 'joseph-mary-bethlehem',
      layerType: GEO_LAYER_TYPES.biblicalJourney,
      title: 'Joseph and Mary Journey to Bethlehem',
      description: 'Route placeholder from Nazareth to Bethlehem for future pilgrimage-safe GIS enrichment.',
      scriptureRefs: ['Luke 2:1-7'],
      languageCodes: ['he', 'ar'],
      sourceStatus: SOURCE_STATUS.placeholder,
      waypoints: [
        { id: 'nazareth', title: 'Nazareth', description: 'Origin waypoint named in Luke 2.', lat: null, lon: null, coordinates: { latitude: null, longitude: null }, scriptureRefs: ['Luke 2:4'], languageCodes: ['he', 'ar'], sourceStatus: SOURCE_STATUS.placeholder },
        { id: 'bethlehem', title: 'Bethlehem', description: 'Destination waypoint named in Luke 2.', lat: null, lon: null, coordinates: { latitude: null, longitude: null }, scriptureRefs: ['Luke 2:4-7'], languageCodes: ['he', 'ar'], sourceStatus: SOURCE_STATUS.placeholder }
      ]
    })
  ])
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
