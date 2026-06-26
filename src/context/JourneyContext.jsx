'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { createJourneyEngine } from '../data/journeyEngine.js';
import { JourneyRegistry, journeyList } from '../data/journeyRegistry.js';

export const JourneyContext = createContext(Object.freeze({
  registry: JourneyRegistry,
  journeys: journeyList,
  engine: createJourneyEngine(),
  selectedJourneyId: journeyList[0]?.id || null,
  waypointIndex: 0,
  selectJourney: () => {},
  goToWaypoint: () => {},
  goToNext: () => {},
  goToPrevious: () => {}
}));

export function JourneyProvider({ initialJourneyId = journeyList[0]?.id, initialWaypointIndex = 0, children }) {
  const [selectedJourneyId, setSelectedJourneyId] = useState(initialJourneyId);
  const [waypointIndex, setWaypointIndex] = useState(initialWaypointIndex);
  const engine = useMemo(() => createJourneyEngine({
    journeyId: selectedJourneyId,
    waypointIndex
  }), [selectedJourneyId, waypointIndex]);

  const value = useMemo(() => Object.freeze({
    registry: JourneyRegistry,
    journeys: journeyList,
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
