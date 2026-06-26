'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { createGeoNarrativeEngine } from '../data/journeyEngine.js';
import { GeoNarrativeRegistry, geoNarrativeList } from '../data/journeyRegistry.js';

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

export function JourneyProvider({ initialJourneyId = geoNarrativeList[0]?.id, initialWaypointIndex = 0, children }) {
  const [selectedJourneyId, setSelectedJourneyId] = useState(initialJourneyId);
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
      setSelectedJourneyId(journeyId);
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
