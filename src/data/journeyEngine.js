import { getGeoNarrative, geoNarrativeList } from './journeyRegistry.js';

function clampWaypointIndex(index, waypointCount) {
  if (waypointCount <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), waypointCount - 1);
}

function buildSyncState(geoNarrative, waypoint) {
  return Object.freeze({
    channels: geoNarrative?.futureSyncChannels || Object.freeze([]),
    narration: Object.freeze({
      ready: true,
      cueId: waypoint?.synchronization?.narrationCueId || null
    }),
    globeCamera: Object.freeze({
      ready: true,
      cueId: waypoint?.synchronization?.globeCameraCueId || null,
      coordinates: waypoint ? Object.freeze({ latitude: waypoint.latitude, longitude: waypoint.longitude }) : null
    }),
    beacon: Object.freeze({
      ready: true,
      cueId: waypoint?.synchronization?.beaconCueId || null
    })
  });
}

export function createGeoNarrativeEngine({ geoNarrativeId = geoNarrativeList[0]?.id, journeyId = geoNarrativeId, waypointIndex = 0 } = {}) {
  const geoNarrative = getGeoNarrative(journeyId) || geoNarrativeList[0] || null;
  const waypoints = geoNarrative?.waypoints || Object.freeze([]);
  const currentIndex = clampWaypointIndex(waypointIndex, waypoints.length);
  const currentWaypoint = waypoints[currentIndex] || null;
  const previousWaypoint = currentIndex > 0 ? waypoints[currentIndex - 1] : null;
  const nextWaypoint = currentIndex < waypoints.length - 1 ? waypoints[currentIndex + 1] : null;
  const completedSegments = waypoints.length <= 1 ? waypoints.length : currentIndex;
  const totalSegments = Math.max(waypoints.length - 1, 1);
  const progress = waypoints.length === 0 ? 0 : completedSegments / totalSegments;
  const completionPercentage = Math.round(progress * 100);

  return Object.freeze({
    geoNarrative,
    geoNarrativeId: geoNarrative?.id || null,
    journey: geoNarrative,
    journeyId: geoNarrative?.id || null,
    waypointIndex: currentIndex,
    waypointCount: waypoints.length,
    currentWaypoint,
    previousWaypoint,
    nextWaypoint,
    progress,
    completionPercentage,
    sync: buildSyncState(geoNarrative, currentWaypoint),
    canMovePrevious: Boolean(previousWaypoint),
    canMoveNext: Boolean(nextWaypoint),
    selectJourney: (nextJourneyId) => createGeoNarrativeEngine({ journeyId: nextJourneyId, waypointIndex: 0 }),
    goToWaypoint: (nextWaypointIndex) => createGeoNarrativeEngine({ journeyId: geoNarrative?.id, waypointIndex: nextWaypointIndex }),
    goToNext: () => createGeoNarrativeEngine({ journeyId: geoNarrative?.id, waypointIndex: currentIndex + 1 }),
    goToPrevious: () => createGeoNarrativeEngine({ journeyId: geoNarrative?.id, waypointIndex: currentIndex - 1 })
  });
}

export function createJourneyEngine(options) {
  return createGeoNarrativeEngine(options);
}

export const defaultGeoNarrativeEngine = createGeoNarrativeEngine();
export const defaultJourneyEngine = defaultGeoNarrativeEngine;
