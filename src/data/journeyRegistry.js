export const GEONARRATIVE_SYNC_CHANNELS = Object.freeze({
  narration: 'narration',
  globeCamera: 'globeCamera',
  beacon: 'beacon'
});

function freezeWaypoint(waypoint) {
  return Object.freeze({
    ...waypoint,
    coordinates: Object.freeze({
      latitude: waypoint.latitude,
      longitude: waypoint.longitude
    }),
    scriptureRefs: Object.freeze([...(waypoint.scriptureRefs || [])]),
    synchronization: Object.freeze({
      narrationCueId: waypoint.synchronization?.narrationCueId || null,
      globeCameraCueId: waypoint.synchronization?.globeCameraCueId || null,
      beaconCueId: waypoint.synchronization?.beaconCueId || null
    })
  });
}

function freezeGeoNarrative(geoNarrative) {
  const waypoints = [...(geoNarrative.waypoints || [])]
    .sort((a, b) => a.sequence - b.sequence)
    .map(freezeWaypoint);

  return Object.freeze({
    ...geoNarrative,
    summary: geoNarrative.summary || geoNarrative.description || '',
    description: geoNarrative.description || geoNarrative.summary || '',
    scriptureRefs: Object.freeze([...(geoNarrative.scriptureRefs || [])]),
    routeMetadata: Object.freeze({ ...(geoNarrative.routeMetadata || {}) }),
    narration: Object.freeze({ status: 'placeholder', audioReady: false, ...(geoNarrative.narration || {}) }),
    languageHooks: Object.freeze({ ...(geoNarrative.languageHooks || {}) }),
    completionState: Object.freeze({
      status: geoNarrative.completionState?.status || 'not_started',
      completedWaypointIds: Object.freeze([...(geoNarrative.completionState?.completedWaypointIds || [])])
    }),
    futureSyncChannels: Object.freeze([...(geoNarrative.futureSyncChannels || Object.values(GEONARRATIVE_SYNC_CHANNELS))]),
    waypoints: Object.freeze(waypoints)
  });
}

export const GeoNarrativeRegistry = Object.freeze({
  journey_to_bethlehem: freezeGeoNarrative({
    id: 'journey_to_bethlehem',
    title: 'Journey to Bethlehem',
    summary: 'A historically cautious route from Nazareth toward Bethlehem, with intermediate stops shown as approximate travel context rather than certain biblical event locations.',
    scriptureRefs: ['Luke 2:1-7'],
    routeMetadata: { routeType: 'overland', certainty: 'approximate_contextual_route', activeByDefault: true },
    narration: { status: 'placeholder', cuePrefix: 'journey_to_bethlehem', audioReady: false },
    languageHooks: { titleKey: 'geonarrative.journey_to_bethlehem.title', summaryKey: 'geonarrative.journey_to_bethlehem.summary' },
    completionState: { status: 'available', completedWaypointIds: [] },
    futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS),
    waypoints: [
      {
        id: 'nazareth',
        latitude: 32.6996,
        longitude: 35.3035,
        title: 'Nazareth',
        scriptureRefs: ['Luke 2:1-5'],
        sequence: 1,
        waypointRole: 'primary_scripture_event',
        historicalSummary: 'Joseph and Mary begin in Nazareth, the named departure setting in Luke’s nativity account.',
        estimatedTravelDuration: 'Approximate multi-day journey south',
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.nazareth',
          globeCameraCueId: 'camera.nazareth',
          beaconCueId: 'beacon.nazareth'
        }
      },
      {
        id: 'jezreel_valley_corridor',
        latitude: 32.5667,
        longitude: 35.2350,
        title: 'Jezreel Valley corridor',
        waypointRole: 'route_context',
        scriptureRefs: ['Route context'],
        sequence: 2,
        historicalSummary: 'Approximate travel context: a southbound route could pass from Galilee toward the Jezreel Valley, trading hill-country paths for broader valley corridors before continuing toward Judea.',
        estimatedTravelDuration: 'Terrain corridor between Galilee and central highlands',
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.jezreel_valley_context',
          globeCameraCueId: 'camera.jezreel_valley',
          beaconCueId: 'beacon.jezreel_valley_context'
        }
      },
      {
        id: 'samaria_judea_approach',
        latitude: 32.0750,
        longitude: 35.2400,
        title: 'Samaria/Judea approach',
        waypointRole: 'route_context',
        scriptureRefs: ['Route context'],
        sequence: 3,
        historicalSummary: 'Approximate travel context: the middle leg is shown cautiously as a central highlands approach, where distance, elevation changes, and village-to-village travel would shape the pilgrimage pace.',
        estimatedTravelDuration: 'Several days of overland walking context',
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.samaria_judea_context',
          globeCameraCueId: 'camera.samaria_judea',
          beaconCueId: 'beacon.samaria_judea_context'
        }
      },
      {
        id: 'jerusalem_vicinity',
        latitude: 31.7683,
        longitude: 35.2137,
        title: 'Jerusalem vicinity',
        waypointRole: 'route_context',
        scriptureRefs: ['Route context'],
        sequence: 4,
        historicalSummary: 'Approximate travel context: nearing Jerusalem places the route close to Judea’s hill country before the final short descent and approach southward to Bethlehem.',
        estimatedTravelDuration: 'Final regional approach before Bethlehem',
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.jerusalem_vicinity_context',
          globeCameraCueId: 'camera.jerusalem_vicinity',
          beaconCueId: 'beacon.jerusalem_vicinity_context'
        }
      },
      {
        id: 'bethlehem',
        latitude: 31.7054,
        longitude: 35.2024,
        title: 'Bethlehem',
        scriptureRefs: ['Luke 2:6-7'],
        sequence: 5,
        waypointRole: 'primary_scripture_event',
        historicalSummary: 'Bethlehem is the named destination where Luke records Jesus’ birth after the journey.',
        estimatedTravelDuration: null,
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.bethlehem',
          globeCameraCueId: 'camera.bethlehem',
          beaconCueId: 'beacon.bethlehem'
        }
      }
    ]
  }),
  paul_first_missionary_journey: freezeGeoNarrative({
    id: 'paul_first_missionary_journey',
    title: "Paul's First Missionary Journey",
    summary: 'The Acts 13-14 route from Antioch through Cyprus and southern Galatia before returning to Antioch.',
    scriptureRefs: ['Acts 13:1-14:28'],
    routeMetadata: { routeType: 'mixed_land_sea', certainty: 'scripture_attested_ordered_route', activeByDefault: false },
    narration: { status: 'placeholder', cuePrefix: 'paul_first', audioReady: false },
    languageHooks: { titleKey: 'geonarrative.paul_first_missionary_journey.title', summaryKey: 'geonarrative.paul_first_missionary_journey.summary' },
    completionState: { status: 'registered_inactive', completedWaypointIds: [] },
    futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS),
    waypoints: [
      { id: 'antioch_syria_departure', latitude: 36.2021, longitude: 36.1613, title: 'Antioch', scriptureRefs: ['Acts 13:1-3'], sequence: 1, historicalSummary: 'The church at Antioch sends Barnabas and Saul after prayer and fasting.', estimatedTravelDuration: '1 day to Seleucia', synchronization: { narrationCueId: 'paul_first.antioch_departure', globeCameraCueId: 'camera.antioch_syria', beaconCueId: 'beacon.antioch_syria' } },
      { id: 'seleucia_pieria', latitude: 36.1241, longitude: 35.9227, title: 'Seleucia', scriptureRefs: ['Acts 13:4'], sequence: 2, historicalSummary: 'Seleucia Pieria was Antioch’s Mediterranean port, where the mission sailed toward Cyprus.', estimatedTravelDuration: 'Sea crossing to Salamis', synchronization: { narrationCueId: 'paul_first.seleucia', globeCameraCueId: 'camera.seleucia', beaconCueId: 'beacon.seleucia' } },
      { id: 'salamis_cyprus', latitude: 35.1846, longitude: 33.9016, title: 'Salamis', scriptureRefs: ['Acts 13:5'], sequence: 3, historicalSummary: 'In Salamis they proclaim the word of God in the synagogues of the Jews.', estimatedTravelDuration: 'Island crossing toward Paphos', synchronization: { narrationCueId: 'paul_first.salamis', globeCameraCueId: 'camera.salamis', beaconCueId: 'beacon.salamis' } },
      { id: 'paphos_cyprus', latitude: 34.7720, longitude: 32.4297, title: 'Paphos', scriptureRefs: ['Acts 13:6-12'], sequence: 4, historicalSummary: 'At Paphos, Paul encounters Elymas and Sergius Paulus during the Cyprus mission.', estimatedTravelDuration: 'Sea crossing to Perga', synchronization: { narrationCueId: 'paul_first.paphos', globeCameraCueId: 'camera.paphos', beaconCueId: 'beacon.paphos' } },
      { id: 'perga_pamphylia', latitude: 36.9587, longitude: 30.8539, title: 'Perga', scriptureRefs: ['Acts 13:13'], sequence: 5, historicalSummary: 'Perga in Pamphylia marks the mainland landing where John Mark departs for Jerusalem.', estimatedTravelDuration: 'Mountain route to Pisidian Antioch', synchronization: { narrationCueId: 'paul_first.perga', globeCameraCueId: 'camera.perga', beaconCueId: 'beacon.perga' } },
      { id: 'pisidian_antioch', latitude: 38.3056, longitude: 31.1894, title: 'Pisidian Antioch', scriptureRefs: ['Acts 13:14-52'], sequence: 6, historicalSummary: 'Paul preaches in the synagogue, and the message spreads through the region amid opposition.', estimatedTravelDuration: 'Several days toward Iconium', synchronization: { narrationCueId: 'paul_first.pisidian_antioch', globeCameraCueId: 'camera.pisidian_antioch', beaconCueId: 'beacon.pisidian_antioch' } },
      { id: 'iconium', latitude: 37.8746, longitude: 32.4932, title: 'Iconium', scriptureRefs: ['Acts 14:1-7'], sequence: 7, historicalSummary: 'In Iconium, many believe, but division and threats drive the missionaries onward.', estimatedTravelDuration: '1-2 days toward Lystra', synchronization: { narrationCueId: 'paul_first.iconium', globeCameraCueId: 'camera.iconium', beaconCueId: 'beacon.iconium' } },
      { id: 'lystra', latitude: 37.5826, longitude: 32.4536, title: 'Lystra', scriptureRefs: ['Acts 14:8-20'], sequence: 8, historicalSummary: 'At Lystra Paul heals a man, resists pagan worship, and later suffers stoning.', estimatedTravelDuration: '1 day toward Derbe', synchronization: { narrationCueId: 'paul_first.lystra', globeCameraCueId: 'camera.lystra', beaconCueId: 'beacon.lystra' } },
      { id: 'derbe', latitude: 37.3500, longitude: 33.2667, title: 'Derbe', scriptureRefs: ['Acts 14:20-21'], sequence: 9, historicalSummary: 'Derbe is the eastern preaching waypoint before the disciples retrace the route to strengthen churches.', estimatedTravelDuration: 'Return route through prior cities', synchronization: { narrationCueId: 'paul_first.derbe', globeCameraCueId: 'camera.derbe', beaconCueId: 'beacon.derbe' } },
      { id: 'antioch_syria_return', latitude: 36.2021, longitude: 36.1613, title: 'Antioch', scriptureRefs: ['Acts 14:26-28'], sequence: 10, historicalSummary: 'Back at Antioch, Paul and Barnabas report what God had done among the Gentiles.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'paul_first.antioch_return', globeCameraCueId: 'camera.antioch_syria', beaconCueId: 'beacon.antioch_syria_return' } }
    ]
  })
});

export const geoNarrativeList = Object.freeze(Object.values(GeoNarrativeRegistry));

export function getGeoNarrative(geoNarrativeId) {
  return GeoNarrativeRegistry[geoNarrativeId] || null;
}

export const JourneyRegistry = GeoNarrativeRegistry;
export const journeyList = geoNarrativeList;
export const JOURNEY_SYNC_CHANNELS = GEONARRATIVE_SYNC_CHANNELS;

export function getJourney(journeyId) {
  return getGeoNarrative(journeyId);
}
