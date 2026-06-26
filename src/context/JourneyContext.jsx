'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { createGeoNarrativeEngine } from '../data/journeyEngine.js';
import { GeoNarrativeRegistry, geoNarrativeList, getGeoNarrative } from '../data/journeyRegistry.js';

const DEFAULT_GEONARRATIVE_ID = 'journey_to_bethlehem';

function resolveRegisteredJourneyId(journeyId) {
  return getGeoNarrative(journeyId)?.id || DEFAULT_GEONARRATIVE_ID;
}

export const JourneyContext = createContext(Object.freeze({
  registry: GeoNarrativeRegistry,
  journeys: geoNarrativeList,
  engine: createGeoNarrativeEngine(),
  selectedJourneyId: geoNarrativeList[0]?.id || null,
  waypointIndex: 0,
  selectJourney: () => {},
  goToWaypoint: () => {},
  goToNext: () => {},
  goToPrevious: () => {}
}));

export function JourneyProvider({ initialJourneyId = DEFAULT_GEONARRATIVE_ID, initialWaypointIndex = 0, children }) {
  const [selectedJourneyId, setSelectedJourneyId] = useState(() => resolveRegisteredJourneyId(initialJourneyId));
  const [waypointIndex, setWaypointIndex] = useState(initialWaypointIndex);
  const engine = useMemo(() => createGeoNarrativeEngine({
    journeyId: selectedJourneyId,
    waypointIndex
  }), [selectedJourneyId, waypointIndex]);

  const value = useMemo(() => Object.freeze({
    registry: GeoNarrativeRegistry,
    journeys: geoNarrativeList,
    engine,
    selectedJourneyId: engine.journeyId,
    waypointIndex: engine.waypointIndex,
    selectJourney: (journeyId) => {
      setSelectedJourneyId(resolveRegisteredJourneyId(journeyId));
      setWaypointIndex(0);
    },
    goToWaypoint: (nextWaypointIndex) => setWaypointIndex(nextWaypointIndex),
    goToNext: () => setWaypointIndex((currentIndex) => currentIndex + 1),
    goToPrevious: () => setWaypointIndex((currentIndex) => currentIndex - 1)
  }), [engine]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  return useContext(JourneyContext);
}
