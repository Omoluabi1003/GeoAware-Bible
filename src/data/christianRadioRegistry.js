const RADIO_SOURCE_STATUSES = Object.freeze({
  verified: 'verified',
  informational: 'informational',
  unavailable: 'unavailable'
});

const DIRECT_AUDIO_URL_PATTERN = /\.(aac|m3u8|mp3|ogg|opus|pls|wav)(\?.*)?$/i;

function freezeStation(station) {
  return Object.freeze({
    ...station,
    languageCodes: Object.freeze([...(station.languageCodes || [])]),
    websiteUrl: station.websiteUrl || null,
    streamUrl: station.verifiedStreamUrl || null,
    stream: Object.freeze({
      status: station.verifiedStreamUrl ? RADIO_SOURCE_STATUSES.verified : RADIO_SOURCE_STATUSES.unavailable,
      url: station.verifiedStreamUrl || null,
      format: station.streamFormat || null,
      verifiedAt: station.streamVerifiedAt || null
    }),
    playback: Object.freeze({
      playable: Boolean(station.verifiedStreamUrl),
      requiresInAppPlayback: true,
      openExternalWebsite: false
    }),
    waveAtlas: Object.freeze({
      source: 'waveatlas-compatible-adapter',
      stationId: station.waveAtlasStationId || station.id,
      syncStatus: station.verifiedStreamUrl ? RADIO_SOURCE_STATUSES.verified : RADIO_SOURCE_STATUSES.informational,
      importReady: true
    })
  });
}

function isVerifiedDirectAudioEndpoint(url) {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol) && DIRECT_AUDIO_URL_PATTERN.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}

function toWaveAtlasStation(station) {
  const verifiedStreamUrl = isVerifiedDirectAudioEndpoint(station.streamUrl) ? station.streamUrl : null;
  return freezeStation({ ...station, verifiedStreamUrl });
}

const WaveAtlasChristianWorshipStations = Object.freeze({
  US: Object.freeze([
    toWaveAtlasStation({ id: 'us-k-love', name: 'K-LOVE', countryCode: 'US', country: 'United States', city: 'Rocklin', languageCodes: ['en'], websiteUrl: 'https://www.klove.com/', description: 'Contemporary Christian worship and encouragement from a national U.S. network.' })
  ]),
  NG: Object.freeze([
    toWaveAtlasStation({ id: 'ng-praiseworld-radio', name: 'Praiseworld Radio', countryCode: 'NG', country: 'Nigeria', city: 'Lagos', languageCodes: ['en'], websiteUrl: 'https://www.praiseworldradio.com/', description: 'Gospel music and faith programming rooted in Nigeria.' })
  ]),
  CG: Object.freeze([
    toWaveAtlasStation({ id: 'cg-radio-brazzaville-foi', name: 'Radio Brazzaville Foi', countryCode: 'CG', country: 'Republic of the Congo', city: 'Brazzaville', languageCodes: ['fr', 'ln'], websiteUrl: null, description: 'Starter placeholder for French and Lingala worship discovery in Brazzaville.' })
  ]),
  CD: Object.freeze([
    toWaveAtlasStation({ id: 'cd-radio-elonga', name: 'Radio Elonga', countryCode: 'CD', country: 'Democratic Republic of the Congo', city: 'Kinshasa', languageCodes: ['ln', 'fr'], websiteUrl: null, description: 'Starter placeholder for Congolese worship discovery near Kinshasa.' })
  ]),
  BR: Object.freeze([
    toWaveAtlasStation({ id: 'br-feliz-fm', name: 'Feliz FM', countryCode: 'BR', country: 'Brazil', city: 'São Paulo', languageCodes: ['pt'], websiteUrl: 'https://www.felizfm.com.br/', description: 'Brazilian Christian music and devotional programming in Portuguese.' })
  ]),
  KE: Object.freeze([
    toWaveAtlasStation({ id: 'ke-hope-fm', name: 'Hope FM', countryCode: 'KE', country: 'Kenya', city: 'Nairobi', languageCodes: ['en', 'sw'], websiteUrl: 'https://www.hopefm.org/', description: 'Christian radio from Nairobi with worship and teaching for Kenya.' })
  ]),
  FR: Object.freeze([
    toWaveAtlasStation({ id: 'fr-radio-esperance', name: 'Radio Espérance', countryCode: 'FR', country: 'France', city: 'Saint-Étienne', languageCodes: ['fr'], websiteUrl: 'https://radio-esperance.fr/', description: 'French Christian prayer, worship, and teaching.' })
  ]),
  JP: Object.freeze([
    toWaveAtlasStation({ id: 'jp-friendship-radio', name: 'Friendship Radio', countryCode: 'JP', country: 'Japan', city: 'Tokyo', languageCodes: ['ja'], websiteUrl: null, description: 'Starter placeholder for Japanese Christian worship discovery.' })
  ]),
  IL: Object.freeze([
    toWaveAtlasStation({ id: 'il-voice-of-hope', name: 'Voice of Hope', countryCode: 'IL', country: 'Israel', city: 'Jerusalem', languageCodes: ['he', 'en', 'ar'], websiteUrl: 'https://voiceofhope.com/', description: 'Faith-focused programming connected with the Holy Land region.' })
  ]),
  GR: Object.freeze([
    toWaveAtlasStation({ id: 'gr-christianity-radio', name: 'Christianity Radio', countryCode: 'GR', country: 'Greece', city: 'Athens', languageCodes: ['el'], websiteUrl: null, description: 'Starter placeholder for Greek worship and Christian teaching discovery.' })
  ]),
  TR: Object.freeze([
    toWaveAtlasStation({ id: 'tr-radyo-shemma', name: 'Radyo Shema', countryCode: 'TR', country: 'Türkiye', city: 'Ankara', languageCodes: ['tr'], websiteUrl: 'https://radyosema.com.tr/', description: 'Turkish Christian radio with worship and biblical teaching.' })
  ])
});

export function getChristianRadioStations(countryCode) {
  return WaveAtlasChristianWorshipStations[countryCode?.toUpperCase?.()] || Object.freeze([]);
}

export function resolveChristianRadioSuggestion(geoContext = {}) {
  const stations = getChristianRadioStations(geoContext.countryCode || geoContext.isoCode);
  const station = stations[0] || null;
  if (!station) return null;

  const isPlayable = station.playback.playable && Boolean(station.stream.url);

  return Object.freeze({
    id: station.id,
    type: 'quiet_worship_radio',
    label: `Quiet worship near ${geoContext.country || station.country}`,
    stationName: station.name,
    countryCode: station.countryCode,
    country: station.country,
    city: station.city,
    languageCodes: station.languageCodes,
    websiteUrl: station.websiteUrl,
    href: null,
    streamUrl: isPlayable ? station.stream.url : null,
    stream: station.stream,
    description: station.description,
    sourceStatus: station.waveAtlas.syncStatus,
    isPlayable,
    playerReady: false,
    waveAtlas: station.waveAtlas
  });
}

export { RADIO_SOURCE_STATUSES, WaveAtlasChristianWorshipStations as ChristianRadioRegistry, isVerifiedDirectAudioEndpoint };
