const ChristianRadioRegistry = Object.freeze({
  US: Object.freeze([
    Object.freeze({ id: 'us-k-love', name: 'K-LOVE', countryCode: 'US', country: 'United States', city: 'Rocklin', languageCodes: Object.freeze(['en']), streamUrl: 'https://www.klove.com/', description: 'Contemporary Christian worship and encouragement from a national U.S. network.' })
  ]),
  NG: Object.freeze([
    Object.freeze({ id: 'ng-praiseworld-radio', name: 'Praiseworld Radio', countryCode: 'NG', country: 'Nigeria', city: 'Lagos', languageCodes: Object.freeze(['en']), streamUrl: 'https://www.praiseworldradio.com/', description: 'Gospel music and faith programming rooted in Nigeria.' })
  ]),
  CG: Object.freeze([
    Object.freeze({ id: 'cg-radio-brazzaville-foi', name: 'Radio Brazzaville Foi', countryCode: 'CG', country: 'Republic of the Congo', city: 'Brazzaville', languageCodes: Object.freeze(['fr', 'ln']), streamUrl: null, description: 'Starter placeholder for French and Lingala worship discovery in Brazzaville.' })
  ]),
  CD: Object.freeze([
    Object.freeze({ id: 'cd-radio-elonga', name: 'Radio Elonga', countryCode: 'CD', country: 'Democratic Republic of the Congo', city: 'Kinshasa', languageCodes: Object.freeze(['ln', 'fr']), streamUrl: null, description: 'Starter placeholder for Congolese worship discovery near Kinshasa.' })
  ]),
  BR: Object.freeze([
    Object.freeze({ id: 'br-feliz-fm', name: 'Feliz FM', countryCode: 'BR', country: 'Brazil', city: 'São Paulo', languageCodes: Object.freeze(['pt']), streamUrl: 'https://www.felizfm.com.br/', description: 'Brazilian Christian music and devotional programming in Portuguese.' })
  ]),
  KE: Object.freeze([
    Object.freeze({ id: 'ke-hope-fm', name: 'Hope FM', countryCode: 'KE', country: 'Kenya', city: 'Nairobi', languageCodes: Object.freeze(['en', 'sw']), streamUrl: 'https://www.hopefm.org/', description: 'Christian radio from Nairobi with worship and teaching for Kenya.' })
  ]),
  FR: Object.freeze([
    Object.freeze({ id: 'fr-radio-esperance', name: 'Radio Espérance', countryCode: 'FR', country: 'France', city: 'Saint-Étienne', languageCodes: Object.freeze(['fr']), streamUrl: 'https://radio-esperance.fr/', description: 'French Christian prayer, worship, and teaching.' })
  ]),
  JP: Object.freeze([
    Object.freeze({ id: 'jp-friendship-radio', name: 'Friendship Radio', countryCode: 'JP', country: 'Japan', city: 'Tokyo', languageCodes: Object.freeze(['ja']), streamUrl: null, description: 'Starter placeholder for Japanese Christian worship discovery.' })
  ]),
  IL: Object.freeze([
    Object.freeze({ id: 'il-voice-of-hope', name: 'Voice of Hope', countryCode: 'IL', country: 'Israel', city: 'Jerusalem', languageCodes: Object.freeze(['he', 'en', 'ar']), streamUrl: 'https://voiceofhope.com/', description: 'Faith-focused programming connected with the Holy Land region.' })
  ]),
  GR: Object.freeze([
    Object.freeze({ id: 'gr-christianity-radio', name: 'Christianity Radio', countryCode: 'GR', country: 'Greece', city: 'Athens', languageCodes: Object.freeze(['el']), streamUrl: null, description: 'Starter placeholder for Greek worship and Christian teaching discovery.' })
  ]),
  TR: Object.freeze([
    Object.freeze({ id: 'tr-radyo-shemma', name: 'Radyo Shema', countryCode: 'TR', country: 'Türkiye', city: 'Ankara', languageCodes: Object.freeze(['tr']), streamUrl: 'https://radyosema.com.tr/', description: 'Turkish Christian radio with worship and biblical teaching.' })
  ])
});

export function getChristianRadioStations(countryCode) {
  return ChristianRadioRegistry[countryCode?.toUpperCase?.()] || Object.freeze([]);
}

export function resolveChristianRadioSuggestion(geoContext = {}) {
  const stations = getChristianRadioStations(geoContext.countryCode || geoContext.isoCode);
  const station = stations[0] || null;
  if (!station) return null;

  return Object.freeze({
    id: station.id,
    type: 'quiet_worship_radio',
    label: `Quiet worship near ${geoContext.country || station.country}`,
    stationName: station.name,
    countryCode: station.countryCode,
    country: station.country,
    city: station.city,
    languageCodes: station.languageCodes,
    href: station.streamUrl,
    description: station.description,
    playerReady: false
  });
}

export { ChristianRadioRegistry };
