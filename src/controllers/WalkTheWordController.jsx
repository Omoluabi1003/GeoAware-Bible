'use client';

import { useMemo, useState } from 'react';
import { createJourneyEngine } from '../data/journeyEngine.js';

export const WALK_THE_WORD_JOURNEY_ID = 'journey_to_bethlehem';

export function useWalkTheWordController({ journeyId = WALK_THE_WORD_JOURNEY_ID } = {}) {
  const [isActive, setIsActive] = useState(false);
  const [waypointIndex, setWaypointIndex] = useState(0);
  const engine = useMemo(() => createJourneyEngine({ journeyId, waypointIndex }), [journeyId, waypointIndex]);
  const activeWaypoint = isActive ? engine.currentWaypoint : null;

  return useMemo(() => Object.freeze({
    isActive,
    journey: engine.journey,
    journeyId: engine.journeyId,
    engine,
    activeWaypoint,
    voiceNarration: Object.freeze({
      enabled: false,
      ready: false,
      cueId: activeWaypoint?.synchronization?.narrationCueId || null
    }),
    start: () => {
      setWaypointIndex(0);
      setIsActive(true);
    },
    continue: () => {
      if (engine.canMoveNext) {
        setWaypointIndex((currentIndex) => currentIndex + 1);
        return;
      }
      setIsActive(false);
      setWaypointIndex(0);
    },
    stop: () => {
      setIsActive(false);
      setWaypointIndex(0);
    }
  }), [activeWaypoint, engine, isActive]);
}

export default function WalkTheWordController({ children, journeyId = WALK_THE_WORD_JOURNEY_ID }) {
  const controller = useWalkTheWordController({ journeyId });
  return children(controller);
}
