const DEFAULT_LOCATION = Object.freeze({
  latitude: null,
  longitude: null,
  country: 'your country',
  region: 'your region',
  locality: 'your location'
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

export class GeoScriptureEngine {
  buildContext(input = {}) {
    const latitude = present(input.latitude, input.coordinates?.latitude ?? DEFAULT_LOCATION.latitude);
    const longitude = present(input.longitude, input.coordinates?.longitude ?? DEFAULT_LOCATION.longitude);
    const country = present(input.country, DEFAULT_LOCATION.country);
    const region = present(input.region, DEFAULT_LOCATION.region);
    const locality = present(input.locality, DEFAULT_LOCATION.locality);
    const language = present(input.language, 'the local language');
    const scripture = normalizeScripture(input.currentScripture);
    const place = formatPlace({ locality, region, country });
    const coordinateText = [
      formatCoordinate(latitude, 'N', 'S'),
      formatCoordinate(longitude, 'E', 'W')
    ].filter(Boolean).join(', ');
    const hemisphere = describeHemisphere(latitude, longitude);
    const dateText = describeDate(input.date);

    return Object.freeze({
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
        scriptureLanguage: scripture.language
      })
    });
  }
}

export const geoScriptureEngine = Object.freeze(new GeoScriptureEngine());

export function buildGeoScriptureContext(input) {
  return geoScriptureEngine.buildContext(input);
}
