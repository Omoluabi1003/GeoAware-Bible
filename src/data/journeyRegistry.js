export const JOURNEY_SYNC_CHANNELS = Object.freeze({
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

function freezeJourney(journey) {
  const waypoints = [...journey.waypoints]
    .sort((a, b) => a.sequence - b.sequence)
    .map(freezeWaypoint);

  return Object.freeze({
    ...journey,
    scriptureRefs: Object.freeze([...(journey.scriptureRefs || [])]),
    futureSyncChannels: Object.freeze([...(journey.futureSyncChannels || Object.values(JOURNEY_SYNC_CHANNELS))]),
    waypoints: Object.freeze(waypoints)
  });
}

export const JourneyRegistry = Object.freeze({
  journey_to_bethlehem: freezeJourney({
    id: 'journey_to_bethlehem',
    title: 'Journey to Bethlehem',
    description: 'The ordered journey from Nazareth to Bethlehem in the nativity account.',
    scriptureRefs: ['Luke 2:1-7'],
    futureSyncChannels: Object.values(JOURNEY_SYNC_CHANNELS),
    waypoints: [
      {
        id: 'nazareth',
        latitude: 32.6996,
        longitude: 35.3035,
        title: 'Nazareth',
        scriptureRefs: ['Luke 2:1-5'],
        sequence: 1,
        historicalSummary: 'Joseph and Mary begin their journey.',
        estimatedTravelDuration: '4-7 days on foot',
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.nazareth',
          globeCameraCueId: 'camera.nazareth',
          beaconCueId: 'beacon.nazareth'
        }
      },
      {
        id: 'bethlehem',
        latitude: 31.7054,
        longitude: 35.2024,
        title: 'Bethlehem',
        scriptureRefs: ['Luke 2:6-7'],
        sequence: 2,
        historicalSummary: 'Jesus is born in Bethlehem.',
        estimatedTravelDuration: null,
        synchronization: {
          narrationCueId: 'journey_to_bethlehem.bethlehem',
          globeCameraCueId: 'camera.bethlehem',
          beaconCueId: 'beacon.bethlehem'
        }
      }
    ]
  }),
  paul_first_missionary_journey: freezeJourney({
    id: 'paul_first_missionary_journey',
    title: "Paul's First Missionary Journey",
    description: 'The Acts 13-14 route from Antioch through Cyprus and southern Galatia before returning to Antioch.',
    scriptureRefs: ['Acts 13:1-14:28'],
    futureSyncChannels: Object.values(JOURNEY_SYNC_CHANNELS),
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

export const journeyList = Object.freeze(Object.values(JourneyRegistry));

export function getJourney(journeyId) {
  return JourneyRegistry[journeyId] || null;
}
