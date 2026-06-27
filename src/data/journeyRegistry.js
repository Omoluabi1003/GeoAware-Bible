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

  life_of_david: freezeGeoNarrative({
    id: 'life_of_david',
    title: 'Life of David',
    summary: 'A curated sequence of named biblical locations in David’s story, limited to Scripture-attested places and cautious summaries.',
    scriptureRefs: ['1 Samuel 16:1-13', '1 Samuel 17:1-54', '2 Samuel 5:1-10'],
    routeMetadata: { routeType: 'thematic_sequence', certainty: 'scripture_attested_places_not_reconstructed_route', activeByDefault: false, studioTemplate: true },
    narration: { status: 'placeholder', cuePrefix: 'life_of_david', audioReady: false },
    languageHooks: { titleKey: 'geonarrative.life_of_david.title', summaryKey: 'geonarrative.life_of_david.summary' },
    completionState: { status: 'available', completedWaypointIds: [] },
    futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS),
    waypoints: [
      { id: 'bethlehem_david', latitude: 31.7054, longitude: 35.2024, title: 'Bethlehem', scriptureRefs: ['1 Samuel 16:1-13'], sequence: 1, historicalSummary: 'Samuel anoints David in Bethlehem in the house of Jesse.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'life_of_david.bethlehem', globeCameraCueId: 'camera.bethlehem', beaconCueId: 'beacon.bethlehem_david' } },
      { id: 'elah_valley', latitude: 31.7000, longitude: 34.9667, title: 'Valley of Elah', scriptureRefs: ['1 Samuel 17:1-54'], sequence: 2, historicalSummary: 'David confronts Goliath where Israel and Philistine forces are described in the Valley of Elah setting.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'life_of_david.elah', globeCameraCueId: 'camera.elah_valley', beaconCueId: 'beacon.elah_valley' } },
      { id: 'hebron_david', latitude: 31.5326, longitude: 35.0998, title: 'Hebron', scriptureRefs: ['2 Samuel 2:1-4', '2 Samuel 5:1-5'], sequence: 3, historicalSummary: 'David is anointed king over Judah in Hebron and later over all Israel.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'life_of_david.hebron', globeCameraCueId: 'camera.hebron', beaconCueId: 'beacon.hebron_david' } },
      { id: 'jerusalem_david', latitude: 31.7683, longitude: 35.2137, title: 'Jerusalem', scriptureRefs: ['2 Samuel 5:6-10'], sequence: 4, historicalSummary: 'David takes Jerusalem and establishes it as the city of David.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'life_of_david.jerusalem', globeCameraCueId: 'camera.jerusalem', beaconCueId: 'beacon.jerusalem_david' } }
    ]
  }),
  miracles_of_jesus: freezeGeoNarrative({
    id: 'miracles_of_jesus', title: 'Miracles of Jesus', summary: 'A curated thematic sequence of miracle accounts tied only to named Gospel locations.', scriptureRefs: ['John 2:1-11', 'Mark 1:21-34', 'John 11:1-44'], routeMetadata: { routeType: 'thematic_sequence', certainty: 'scripture_attested_places_not_reconstructed_route', activeByDefault: false, studioTemplate: true }, narration: { status: 'placeholder', cuePrefix: 'miracles_of_jesus', audioReady: false }, languageHooks: {}, completionState: { status: 'available', completedWaypointIds: [] }, futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS), waypoints: [
      { id: 'cana', latitude: 32.7469, longitude: 35.3387, title: 'Cana', scriptureRefs: ['John 2:1-11'], sequence: 1, historicalSummary: 'John places Jesus’ first sign at a wedding in Cana of Galilee.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'miracles.cana', globeCameraCueId: 'camera.cana', beaconCueId: 'beacon.cana' } },
      { id: 'capernaum', latitude: 32.8803, longitude: 35.5733, title: 'Capernaum', scriptureRefs: ['Mark 1:21-34'], sequence: 2, historicalSummary: 'The Gospels associate Capernaum with healings and deliverance in Jesus’ Galilean ministry.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'miracles.capernaum', globeCameraCueId: 'camera.capernaum', beaconCueId: 'beacon.capernaum' } },
      { id: 'bethany_lazarus', latitude: 31.7713, longitude: 35.2615, title: 'Bethany', scriptureRefs: ['John 11:1-44'], sequence: 3, historicalSummary: 'John identifies Bethany as the village of Mary, Martha, and Lazarus.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'miracles.bethany', globeCameraCueId: 'camera.bethany', beaconCueId: 'beacon.bethany_lazarus' } }
    ] }),
  road_to_golgotha: freezeGeoNarrative({ id: 'road_to_golgotha', title: 'Road to Golgotha', summary: 'A restrained Passion sequence within Jerusalem, ending at Golgotha without reconstructing an exact street route.', scriptureRefs: ['John 19:13-17', 'Luke 23:26-33'], routeMetadata: { routeType: 'local_thematic_sequence', certainty: 'named_places_exact_path_not_reconstructed', activeByDefault: false, studioTemplate: true }, narration: { status: 'placeholder', cuePrefix: 'road_to_golgotha', audioReady: false }, languageHooks: {}, completionState: { status: 'available', completedWaypointIds: [] }, futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS), waypoints: [
      { id: 'jerusalem_praetorium_context', latitude: 31.7767, longitude: 35.2345, title: 'Jerusalem judgment setting', scriptureRefs: ['John 19:13-16'], sequence: 1, historicalSummary: 'John locates the judgment scene in Jerusalem at the place called The Stone Pavement; this waypoint is broad Jerusalem context.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'golgotha.jerusalem', globeCameraCueId: 'camera.jerusalem', beaconCueId: 'beacon.jerusalem_judgment' } },
      { id: 'golgotha', latitude: 31.7784, longitude: 35.2296, title: 'Golgotha', scriptureRefs: ['John 19:17', 'Luke 23:33'], sequence: 2, historicalSummary: 'The Gospels name Golgotha, the Place of a Skull, as the crucifixion site.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'golgotha.site', globeCameraCueId: 'camera.golgotha', beaconCueId: 'beacon.golgotha' } }
    ] }),
  exodus: freezeGeoNarrative({ id: 'exodus', title: 'Exodus', summary: 'A curated Exodus overview using major named regions and stops while avoiding speculative route reconstruction.', scriptureRefs: ['Exodus 12:37', 'Exodus 13:20', 'Exodus 19:1-2'], routeMetadata: { routeType: 'thematic_sequence', certainty: 'scripture_attested_regions_exact_route_not_reconstructed', activeByDefault: false, studioTemplate: true }, narration: { status: 'placeholder', cuePrefix: 'exodus', audioReady: false }, languageHooks: {}, completionState: { status: 'available', completedWaypointIds: [] }, futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS), waypoints: [
      { id: 'rameses', latitude: 30.7900, longitude: 31.8300, title: 'Rameses', scriptureRefs: ['Exodus 12:37'], sequence: 1, historicalSummary: 'Exodus names Rameses as the departure point toward Succoth.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'exodus.rameses', globeCameraCueId: 'camera.rameses', beaconCueId: 'beacon.rameses' } },
      { id: 'succoth', latitude: 30.5833, longitude: 32.2667, title: 'Succoth', scriptureRefs: ['Exodus 12:37', 'Exodus 13:20'], sequence: 2, historicalSummary: 'Succoth is named as an early stop in the Exodus account.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'exodus.succoth', globeCameraCueId: 'camera.succoth', beaconCueId: 'beacon.succoth' } },
      { id: 'sinai_region', latitude: 28.5392, longitude: 33.9754, title: 'Sinai region', scriptureRefs: ['Exodus 19:1-2'], sequence: 3, historicalSummary: 'Exodus places Israel in the wilderness of Sinai before the mountain; this waypoint is regional context.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'exodus.sinai', globeCameraCueId: 'camera.sinai', beaconCueId: 'beacon.sinai_region' } }
    ] }),
  road_to_emmaus: freezeGeoNarrative({ id: 'road_to_emmaus', title: 'Road to Emmaus', summary: 'A curated post-resurrection walk from Jerusalem toward Emmaus, with Emmaus shown cautiously because site identification is debated.', scriptureRefs: ['Luke 24:13-35'], routeMetadata: { routeType: 'overland', certainty: 'emmaus_identification_debated', activeByDefault: false, studioTemplate: true }, narration: { status: 'placeholder', cuePrefix: 'road_to_emmaus', audioReady: false }, languageHooks: {}, completionState: { status: 'available', completedWaypointIds: [] }, futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS), waypoints: [
      { id: 'jerusalem_emmaus', latitude: 31.7683, longitude: 35.2137, title: 'Jerusalem', scriptureRefs: ['Luke 24:13-18'], sequence: 1, historicalSummary: 'Luke begins the Emmaus account with disciples leaving Jerusalem.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'emmaus.jerusalem', globeCameraCueId: 'camera.jerusalem', beaconCueId: 'beacon.jerusalem_emmaus' } },
      { id: 'emmaus_context', latitude: 31.8390, longitude: 35.0270, title: 'Emmaus area', scriptureRefs: ['Luke 24:13-35'], sequence: 2, historicalSummary: 'Luke names Emmaus, about seven miles from Jerusalem; the precise identification is treated cautiously here.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'emmaus.area', globeCameraCueId: 'camera.emmaus', beaconCueId: 'beacon.emmaus_context' } }
    ] }),
  seven_churches: freezeGeoNarrative({ id: 'seven_churches', title: 'Seven Churches of Revelation', summary: 'The seven churches named in Revelation 2–3 in textual order.', scriptureRefs: ['Revelation 1:11', 'Revelation 2:1-3:22'], routeMetadata: { routeType: 'scripture_ordered_sequence', certainty: 'scripture_attested_named_cities', activeByDefault: false, studioTemplate: true }, narration: { status: 'placeholder', cuePrefix: 'seven_churches', audioReady: false }, languageHooks: {}, completionState: { status: 'available', completedWaypointIds: [] }, futureSyncChannels: Object.values(GEONARRATIVE_SYNC_CHANNELS), waypoints: [
      { id: 'ephesus', latitude: 37.9390, longitude: 27.3410, title: 'Ephesus', scriptureRefs: ['Revelation 2:1-7'], sequence: 1, historicalSummary: 'Ephesus is the first church addressed in Revelation 2.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.ephesus', globeCameraCueId: 'camera.ephesus', beaconCueId: 'beacon.ephesus' } },
      { id: 'smyrna', latitude: 38.4189, longitude: 27.1287, title: 'Smyrna', scriptureRefs: ['Revelation 2:8-11'], sequence: 2, historicalSummary: 'Smyrna is addressed as a suffering church called to faithfulness.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.smyrna', globeCameraCueId: 'camera.smyrna', beaconCueId: 'beacon.smyrna' } },
      { id: 'pergamum', latitude: 39.1207, longitude: 27.1805, title: 'Pergamum', scriptureRefs: ['Revelation 2:12-17'], sequence: 3, historicalSummary: 'Pergamum is the third church addressed in Revelation.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.pergamum', globeCameraCueId: 'camera.pergamum', beaconCueId: 'beacon.pergamum' } },
      { id: 'thyatira', latitude: 38.9186, longitude: 27.8375, title: 'Thyatira', scriptureRefs: ['Revelation 2:18-29'], sequence: 4, historicalSummary: 'Thyatira receives the fourth message among the seven churches.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.thyatira', globeCameraCueId: 'camera.thyatira', beaconCueId: 'beacon.thyatira' } },
      { id: 'sardis', latitude: 38.4881, longitude: 28.0403, title: 'Sardis', scriptureRefs: ['Revelation 3:1-6'], sequence: 5, historicalSummary: 'Sardis is called to wakefulness in Revelation 3.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.sardis', globeCameraCueId: 'camera.sardis', beaconCueId: 'beacon.sardis' } },
      { id: 'philadelphia', latitude: 38.3570, longitude: 28.5177, title: 'Philadelphia', scriptureRefs: ['Revelation 3:7-13'], sequence: 6, historicalSummary: 'Philadelphia receives words of encouragement and endurance.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.philadelphia', globeCameraCueId: 'camera.philadelphia', beaconCueId: 'beacon.philadelphia' } },
      { id: 'laodicea', latitude: 37.8368, longitude: 29.1076, title: 'Laodicea', scriptureRefs: ['Revelation 3:14-22'], sequence: 7, historicalSummary: 'Laodicea is the seventh church addressed in Revelation.', estimatedTravelDuration: null, synchronization: { narrationCueId: 'seven.laodicea', globeCameraCueId: 'camera.laodicea', beaconCueId: 'beacon.laodicea' } }
    ] }),
  paul_first_missionary_journey: freezeGeoNarrative({
    id: 'paul_first_missionary_journey',
    title: "Paul's First Missionary Journey",
    summary: 'The Acts 13-14 route from Antioch through Cyprus and southern Galatia before returning to Antioch.',
    scriptureRefs: ['Acts 13:1-14:28'],
    routeMetadata: { routeType: 'mixed_land_sea', certainty: 'scripture_attested_ordered_route', activeByDefault: false },
    narration: { status: 'placeholder', cuePrefix: 'paul_first', audioReady: false },
    languageHooks: { titleKey: 'geonarrative.paul_first_missionary_journey.title', summaryKey: 'geonarrative.paul_first_missionary_journey.summary' },
    completionState: { status: 'available', completedWaypointIds: [] },
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
