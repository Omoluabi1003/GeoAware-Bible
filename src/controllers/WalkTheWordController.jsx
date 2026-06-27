'use client';

import { useEffect, useMemo, useState } from 'react';
import { createGeoNarrativeEngine } from '../data/journeyEngine.js';
import { getGeoNarrative, geoNarrativeList } from '../data/geoNarrativeRegistry.js';

export const WALK_THE_WORD_JOURNEY_ID = 'journey_to_bethlehem';
const AUTO_WALK_WAYPOINT_PAUSE_MS = 2600;
const SESSION_SELECTED_GEONARRATIVE_KEY = 'geoaware.selectedGeoNarrativeId';

export function resolveRegisteredJourneyId(nextJourneyId) {
  return getGeoNarrative(nextJourneyId)?.id || WALK_THE_WORD_JOURNEY_ID;
}

function isRegisteredGeoNarrativeId(nextJourneyId) {
  return Boolean(getGeoNarrative(nextJourneyId));
}

function readStoredJourneyId(fallbackJourneyId) {
  if (typeof window === 'undefined') return resolveRegisteredJourneyId(fallbackJourneyId);
  return resolveRegisteredJourneyId(window.sessionStorage.getItem(SESSION_SELECTED_GEONARRATIVE_KEY) || fallbackJourneyId);
}

function storeSelectedJourneyId(nextJourneyId) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(SESSION_SELECTED_GEONARRATIVE_KEY, nextJourneyId);
}

export function useWalkTheWordController({ journeyId = WALK_THE_WORD_JOURNEY_ID } = {}) {
  const [selectedJourneyId, setSelectedJourneyId] = useState(() => readStoredJourneyId(journeyId));
  const [isActive, setIsActive] = useState(false);
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const engine = useMemo(() => createGeoNarrativeEngine({ journeyId: selectedJourneyId, waypointIndex }), [selectedJourneyId, waypointIndex]);
  const selectedGeoNarrative = engine.journey;
  const activeWaypoint = isActive ? engine.currentWaypoint : null;
  const nextWaypoint = isActive ? engine.nextWaypoint : null;
  const routeWaypoints = isActive ? selectedGeoNarrative?.waypoints || Object.freeze([]) : Object.freeze([]);

  useEffect(() => {
    if (!isActive || !isAutoWalking) return undefined;

    if (!engine.canMoveNext) {
      setIsAutoWalking(false);
      return undefined;
    }

    const autoWalkTimer = window.setTimeout(() => {
      setWaypointIndex((currentIndex) => currentIndex + 1);
    }, AUTO_WALK_WAYPOINT_PAUSE_MS);

    return () => window.clearTimeout(autoWalkTimer);
  }, [engine.canMoveNext, engine.waypointIndex, isActive, isAutoWalking]);

  return useMemo(() => Object.freeze({
    isActive,
    journey: selectedGeoNarrative,
    journeyId: engine.journeyId,
    availableJourneys: geoNarrativeList,
    engine,
    activeWaypoint,
    nextWaypoint,
    routeWaypoints,
    isAutoWalking,
    selectJourney: (nextJourneyId) => {
      if (!isRegisteredGeoNarrativeId(nextJourneyId)) return;
      const resolvedJourneyId = resolveRegisteredJourneyId(nextJourneyId);
      setSelectedJourneyId(resolvedJourneyId);
      storeSelectedJourneyId(resolvedJourneyId);
      setWaypointIndex(0);
      setIsAutoWalking(false);
    },
    voiceNarration: Object.freeze({
      enabled: false,
      ready: false,
      cueId: activeWaypoint?.synchronization?.narrationCueId || null
    }),
    start: () => {
      setWaypointIndex(0);
      setIsActive(true);
      setIsAutoWalking(false);
    },
    continue: () => {
      if (engine.canMoveNext) {
        setWaypointIndex((currentIndex) => currentIndex + 1);
        return;
      }
      setIsAutoWalking(false);
      setIsActive(false);
      setWaypointIndex(0);
    },
    startAutoWalk: () => {
      if (!isActive || !engine.canMoveNext) return;
      setIsAutoWalking(true);
    },
    pauseAutoWalk: () => {
      setIsAutoWalking(false);
    },
    stop: () => {
      setIsAutoWalking(false);
      setIsActive(false);
      setWaypointIndex(0);
    }
  }), [activeWaypoint, engine, isActive, isAutoWalking, nextWaypoint, routeWaypoints, selectedGeoNarrative]);
}

export default function WalkTheWordController({ children, journeyId = WALK_THE_WORD_JOURNEY_ID }) {
  const controller = useWalkTheWordController({ journeyId });
  return children(controller);
}
