import { getJourney, journeyList } from './journeyRegistry.js';

function clampWaypointIndex(index, waypointCount) {
  if (waypointCount <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), waypointCount - 1);
}

function buildSyncState(journey, waypoint) {
  return Object.freeze({
    channels: journey?.futureSyncChannels || Object.freeze([]),
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

export function createJourneyEngine({ journeyId = journeyList[0]?.id, waypointIndex = 0 } = {}) {
  const journey = getJourney(journeyId) || journeyList[0] || null;
  const waypoints = journey?.waypoints || Object.freeze([]);
  const currentIndex = clampWaypointIndex(waypointIndex, waypoints.length);
  const currentWaypoint = waypoints[currentIndex] || null;
  const previousWaypoint = currentIndex > 0 ? waypoints[currentIndex - 1] : null;
  const nextWaypoint = currentIndex < waypoints.length - 1 ? waypoints[currentIndex + 1] : null;
  const completedSegments = waypoints.length <= 1 ? waypoints.length : currentIndex;
  const totalSegments = Math.max(waypoints.length - 1, 1);
  const progress = waypoints.length === 0 ? 0 : completedSegments / totalSegments;
  const completionPercentage = Math.round(progress * 100);

  return Object.freeze({
    journey,
    journeyId: journey?.id || null,
    waypointIndex: currentIndex,
    waypointCount: waypoints.length,
    currentWaypoint,
    previousWaypoint,
    nextWaypoint,
    progress,
    completionPercentage,
    sync: buildSyncState(journey, currentWaypoint),
    canMovePrevious: Boolean(previousWaypoint),
    canMoveNext: Boolean(nextWaypoint),
    selectJourney: (nextJourneyId) => createJourneyEngine({ journeyId: nextJourneyId, waypointIndex: 0 }),
    goToWaypoint: (nextWaypointIndex) => createJourneyEngine({ journeyId: journey?.id, waypointIndex: nextWaypointIndex }),
    goToNext: () => createJourneyEngine({ journeyId: journey?.id, waypointIndex: currentIndex + 1 }),
    goToPrevious: () => createJourneyEngine({ journeyId: journey?.id, waypointIndex: currentIndex - 1 })
  });
}

export const defaultJourneyEngine = createJourneyEngine();
