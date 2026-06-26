import { getGeoContext, inferCountryCodeFromCoordinates, resolveGeoContext } from './geoContext.js';
import { getScriptureLanguage } from './scriptureLanguageRegistry.js';

const DEFAULT_LOCATION = Object.freeze({
  latitude: null,
  longitude: null,
  country: 'your country',
  region: 'your region',
  locality: 'your location'
});

const GIS_LAYER_SCHEMA_VERSION = 'geoscripture.gis-layer.v1';
const CACHE_VERSION = 'geoscripture-context-v1';
const memoryCache = new Map();

const REGION_PRAYER_MAP = Object.freeze({
  'North America': 'North America Prayer Region',
  'West Africa': 'West Africa Prayer Region',
  'Central Africa': 'Central Africa Prayer Region',
  'South America': 'South America Prayer Region',
  'East Africa': 'East Africa Prayer Region',
  'Western Europe': 'Western Europe Prayer Region',
  'East Asia': 'East Asia Prayer Region'
});

const COUNTRY_INTELLIGENCE = Object.freeze({
  US: {
    culturalProfile: 'Pluralistic North American context with strong Protestant, Catholic, Orthodox, immigrant, and diaspora Christian communities.',
    christianTraditions: ['Protestant', 'Catholic', 'Orthodox', 'Evangelical', 'Pentecostal', 'Historic Black Church'],
    biblicalConnections: ['Diaspora mission and multilingual witness', 'Hospitality to neighbors and nations', 'Public Scripture engagement in a plural society'],
    pilgrimageSeeds: ['Historic church networks', 'Bible translation and mission archives'],
    churchHistorySeeds: ['Great Awakenings', 'Civil rights church witness', 'Global missions movement']
  },
  NG: {
    culturalProfile: 'West African multilingual context with large Christian and Muslim communities and strong regional church networks.',
    christianTraditions: ['Anglican', 'Catholic', 'Pentecostal', 'Evangelical', 'African Initiated Churches'],
    biblicalConnections: ['Scripture in multilingual households', 'Perseverance, prayer, and reconciliation', 'West African mission and discipleship networks'],
    pilgrimageSeeds: ['Regional cathedrals and revival grounds', 'Bible translation centers'],
    churchHistorySeeds: ['Nigerian Anglican history', 'Pentecostal renewal', 'African indigenous church movements']
  },
  CG: {
    culturalProfile: 'Central African Francophone and Lingala-speaking setting with Catholic, Protestant, and revival church presence.',
    christianTraditions: ['Catholic', 'Protestant', 'Evangelical', 'Revival Churches'],
    biblicalConnections: ['Congo River corridor as a cultural geography anchor', 'Scripture, healing, and peacebuilding', 'Francophone African church witness'],
    pilgrimageSeeds: ['Brazzaville church heritage', 'Congo River Christian communities'],
    churchHistorySeeds: ['Central African mission history', 'Francophone church formation']
  },
  CD: {
    culturalProfile: 'Large Central African multilingual context where Lingala, French, Swahili, Kikongo, and Tshiluba communities shape Scripture access.',
    christianTraditions: ['Catholic', 'Protestant', 'Kimbanguist', 'Pentecostal', 'Evangelical'],
    biblicalConnections: ['Peace, lament, and hope in Scripture', 'River and city networks for witness', 'Multilingual discipleship across Central Africa'],
    pilgrimageSeeds: ['Kinshasa church networks', 'Central African mission routes'],
    churchHistorySeeds: ['Kimbanguist movement', 'Catholic and Protestant mission history']
  },
  BR: {
    culturalProfile: 'Portuguese-speaking South American context with Catholic heritage and major Evangelical and Pentecostal growth.',
    christianTraditions: ['Catholic', 'Pentecostal', 'Evangelical', 'Mainline Protestant'],
    biblicalConnections: ['Amazon, coastal, and urban communities as mission geographies', 'Creation care and neighbor-love', 'Portuguese Scripture access'],
    pilgrimageSeeds: ['Historic churches of Salvador and Rio de Janeiro', 'Amazon mission corridors'],
    churchHistorySeeds: ['Portuguese colonial church history', 'Latin American Pentecostal growth']
  },
  KE: {
    culturalProfile: 'East African Swahili and English context with Anglican, Catholic, Pentecostal, Evangelical, and African Instituted Church communities.',
    christianTraditions: ['Anglican', 'Catholic', 'Pentecostal', 'Evangelical', 'African Instituted Churches'],
    biblicalConnections: ['East African trade routes and multilingual Scripture', 'Shepherding, creation, and community themes', 'Regional discipleship networks'],
    pilgrimageSeeds: ['Nairobi church networks', 'East African mission stations'],
    churchHistorySeeds: ['East African Revival', 'Swahili Scripture history']
  },
  FR: {
    culturalProfile: 'Western European Francophone context with Catholic heritage, Protestant minority traditions, Orthodox diaspora, and secular public life.',
    christianTraditions: ['Catholic', 'Reformed Protestant', 'Lutheran', 'Orthodox', 'Evangelical'],
    biblicalConnections: ['Reformation and Bible translation memory', 'Pilgrimage, monastery, and cathedral geographies', 'Christian witness in secular Europe'],
    pilgrimageSeeds: ['Chartres Cathedral', 'Lourdes', 'Taizé', 'Huguenot memory sites'],
    churchHistorySeeds: ['Gallican church history', 'Huguenot history', 'Monastic renewal']
  },
  JP: {
    culturalProfile: 'East Asian Japanese-speaking context where Christians are a small minority with Catholic, Protestant, Orthodox, and Evangelical communities.',
    christianTraditions: ['Catholic', 'Protestant', 'Orthodox', 'Evangelical'],
    biblicalConnections: ['Faithful witness as a minority community', 'Hidden Christian memory', 'Scripture engagement through Japanese language and culture'],
    pilgrimageSeeds: ['Nagasaki Hidden Christian sites', 'Tokyo church networks'],
    churchHistorySeeds: ['Hidden Christians of Japan', 'Meiji-era Protestant missions', 'Japanese Orthodox history']
  }
});

function present(value, fallback = '') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function formatCoordinate(value, positiveSuffix, negativeSuffix) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${Math.abs(value).toFixed(2)}° ${suffix}`;
}

function formatPlace({ locality, region, country }) {
  return [locality, region, country].filter(Boolean).join(', ') || DEFAULT_LOCATION.locality;
}

function describeHemisphere(latitude, longitude) {
  const northSouth = typeof latitude === 'number' ? (latitude >= 0 ? 'northern' : 'southern') : null;
  const eastWest = typeof longitude === 'number' ? (longitude >= 0 ? 'eastern' : 'western') : null;
  return [northSouth, eastWest].filter(Boolean).join(' and ');
}

function describeDate(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput || Date.now());
  if (Number.isNaN(date.getTime())) return 'today';

  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function normalizeScripture(scripture = {}) {
  return {
    reference: present(scripture.reference, 'the current passage'),
    text: present(scripture.text, ''),
    book: scripture.book?.name || scripture.book || null,
    testament: scripture.book?.testament || scripture.testament || null,
    language: scripture.language || null
  };
}

function freezeArray(values = []) {
  return Object.freeze([...values]);
}

function cacheStorage() {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

function readPersistentCache(key) {
  const storage = cacheStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePersistentCache(key, value) {
  const storage = cacheStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Local cache is opportunistic; engine output still returns without persistence.
  }
}

function cacheKey(input, geoContext) {
  const coordinates = input.coordinates || { latitude: input.latitude, longitude: input.longitude };
  return [
    CACHE_VERSION,
    geoContext.countryCode,
    geoContext.stateOrProvince || geoContext.region,
    geoContext.city,
    coordinates?.latitude?.toFixed?.(3) || 'lat',
    coordinates?.longitude?.toFixed?.(3) || 'lon',
    input.stayInEnglish ? 'en' : 'auto'
  ].join(':');
}

function buildGisLayerDescriptor({ id, label, category, geometryType = 'FeatureCollection', status = 'reserved', properties = {} }) {
  return Object.freeze({
    schemaVersion: GIS_LAYER_SCHEMA_VERSION,
    id,
    label,
    category,
    status,
    geometryType,
    properties: Object.freeze({ ...properties })
  });
}

function buildFutureLayers(countryCode, intelligence) {
  return freezeArray([
    buildGisLayerDescriptor({ id: 'biblical-places', label: 'Biblical places', category: 'pilgrimage', properties: { countryCode, seedSites: intelligence.pilgrimageSeeds } }),
    buildGisLayerDescriptor({ id: 'apostle-paul-journeys', label: 'Apostle Paul journeys', category: 'route', properties: { routeFamily: 'pauline', enabledForOverlay: true } }),
    buildGisLayerDescriptor({ id: 'church-history-sites', label: 'Church history sites', category: 'history', properties: { countryCode, seedTopics: intelligence.churchHistorySeeds } })
  ]);
}

function buildEngineOutput(input, geoContext) {
  const countryCode = geoContext.countryCode || inferCountryCodeFromCoordinates(input.coordinates) || 'US';
  const baseContext = getGeoContext(countryCode);
  const intelligence = COUNTRY_INTELLIGENCE[countryCode] || COUNTRY_INTELLIGENCE.US;
  const recommendedLanguages = (geoContext.languageRecommendations || [])
    .map((language) => getScriptureLanguage(language.languageCode))
    .map((language) => Object.freeze({
      languageCode: language.languageCode,
      englishName: language.englishName,
      nativeName: language.nativeName,
      direction: language.direction,
      defaultTranslationId: language.defaultTranslationId,
      licenseStatus: language.licenseStatus
    }));

  return Object.freeze({
    country: geoContext.country || baseContext.country,
    countryCode,
    region: geoContext.stateOrProvince || geoContext.region || baseContext.region,
    culturalProfile: intelligence.culturalProfile,
    recommendedLanguages: freezeArray(recommendedLanguages),
    englishFallback: true,
    geoPrayerRegion: REGION_PRAYER_MAP[baseContext.region] || `${baseContext.region} Prayer Region`,
    christianTraditions: freezeArray(intelligence.christianTraditions),
    biblicalConnections: freezeArray(intelligence.biblicalConnections.map((connection) => Object.freeze({
      title: connection,
      countryCode,
      confidence: 'contextual',
      source: 'GeoScripture country intelligence foundation'
    }))),
    futurePilgrimageLayers: buildFutureLayers(countryCode, intelligence),
    futureChristianRadioFeeds: freezeArray([{ countryCode, region: baseContext.region, status: 'reserved', feedType: 'christian-radio-directory' }]),
    futureChurchHistory: freezeArray(intelligence.churchHistorySeeds.map((topic) => Object.freeze({ countryCode, topic, status: 'seed' }))),
    gisSchema: Object.freeze({
      version: GIS_LAYER_SCHEMA_VERSION,
      geometry: 'GeoJSON FeatureCollection',
      requiredProperties: freezeArray(['id', 'name', 'category', 'countryCode', 'biblicalRelevance', 'confidence'])
    })
  });
}

export class GeoScriptureEngine {
  buildContext(input = {}) {
    const coordinates = input.coordinates || { latitude: input.latitude, longitude: input.longitude };
    const geoContext = input.geoContext || resolveGeoContext({
      countryCode: input.countryCode,
      coordinates,
      locality: input.localityObject,
      stayInEnglish: input.stayInEnglish,
      browserLanguages: input.browserLanguages
    });
    const key = cacheKey(input, geoContext);

    if (memoryCache.has(key)) return memoryCache.get(key);
    const cached = readPersistentCache(key);
    if (cached) {
      memoryCache.set(key, Object.freeze(cached));
      return memoryCache.get(key);
    }

    const latitude = present(input.latitude, input.coordinates?.latitude ?? geoContext.coordinates?.latitude ?? DEFAULT_LOCATION.latitude);
    const longitude = present(input.longitude, input.coordinates?.longitude ?? geoContext.coordinates?.longitude ?? DEFAULT_LOCATION.longitude);
    const country = present(input.country, geoContext.country || DEFAULT_LOCATION.country);
    const region = present(input.region, geoContext.stateOrProvince || geoContext.region || DEFAULT_LOCATION.region);
    const locality = present(input.locality, geoContext.city || DEFAULT_LOCATION.locality);
    const language = present(input.language, geoContext.effectiveLanguage || 'the local language');
    const scripture = normalizeScripture(input.currentScripture);
    const place = formatPlace({ locality, region, country });
    const coordinateText = [
      formatCoordinate(latitude, 'N', 'S'),
      formatCoordinate(longitude, 'E', 'W')
    ].filter(Boolean).join(', ');
    const hemisphere = describeHemisphere(latitude, longitude);
    const dateText = describeDate(input.date);
    const engineOutput = buildEngineOutput(input, geoContext);

    const context = Object.freeze({
      ...engineOutput,
      GeoReflection: `${scripture.reference} meets ${place} with a simple reminder: Scripture speaks to real people in real places, not abstract coordinates. On ${dateText}, this place can receive the passage as an invitation to remember God's love for the world and for neighbors nearby.`,
      GeoInsight: coordinateText
        ? `${place} is located near ${coordinateText}${hemisphere ? ` in the ${hemisphere} hemisphere` : ''}. GeoAware Bible uses that geography to frame the passage with locality, language, and country context while avoiding unsupported claims about biblical events here.`
        : `${place} is treated as a meaningful setting for reading Scripture. GeoAware Bible frames the passage with locality, language, and country context while avoiding unsupported claims about biblical events here.`,
      PrayerPrompt: `Pray for ${place}: that ${scripture.reference} would encourage love of God, love of neighbor, and faithful attention to the community where you are.`,
      BiblicalConnection: `${scripture.reference}${scripture.testament ? ` from the ${scripture.testament}` : ''} is connected to ${place} through biblical themes of place, witness, neighbor-love, and the worldwide scope of God's care.`,
      metadata: Object.freeze({
        place,
        country,
        region,
        locality,
        language,
        latitude,
        longitude,
        date: dateText,
        scriptureReference: scripture.reference,
        scriptureLanguage: scripture.language,
        cacheKey: key,
        source: 'GeoScripture Context Engine'
      })
    });

    memoryCache.set(key, context);
    writePersistentCache(key, context);
    return context;
  }

  clearCache() {
    memoryCache.clear();
  }
}

export const geoScriptureEngine = Object.freeze(new GeoScriptureEngine());

export function buildGeoScriptureContext(input) {
  return geoScriptureEngine.buildContext(input);
}
