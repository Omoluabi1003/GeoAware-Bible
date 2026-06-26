import { projectGeoCoordinate } from './geoCoordinateEngine.js';
import { Atmosphere } from './layers/Atmosphere.jsx';
import { Clouds } from './layers/Clouds.jsx';
import { GlobeMaterials } from './layers/GlobeMaterials.jsx';
import { GridLines } from './layers/GridLines.jsx';
import { Lighting } from './layers/Lighting.jsx';


function RouteOverlay({ journeyRoute, rotation }) {
  const waypoints = journeyRoute?.waypoints || [];
  if (waypoints.length < 2) return null;

  const projectedWaypoints = waypoints.map((waypoint) => ({
    waypoint,
    projected: projectGeoCoordinate(waypoint.coordinates || waypoint, 50, 50, rotation)
  }));
  const activeWaypointIndex = Math.max(0, projectedWaypoints.findIndex(({ waypoint }) => waypoint.id === journeyRoute.activeWaypointId));
  const routeSegments = projectedWaypoints.slice(1).map(({ projected }, index) => {
    const previous = projectedWaypoints[index].projected.percent;
    const current = projected.percent;
    const controlX = (previous.x + current.x) / 2;
    const controlY = Math.min(previous.y, current.y) - 7;
    const state = index < activeWaypointIndex ? 'completed' : index === activeWaypointIndex ? 'active' : 'upcoming';

    return {
      id: `${projectedWaypoints[index].waypoint.id}-${projectedWaypoints[index + 1].waypoint.id}`,
      pathData: `M ${previous.x} ${previous.y} Q ${controlX} ${controlY} ${current.x} ${current.y}`,
      state
    };
  });

  return (
    <svg className="journeyRouteOverlay" viewBox="0 0 100 100" aria-hidden="true">
      {routeSegments.map((segment) => (
        <path key={segment.id} className="journeyRoutePath" data-state={segment.state} d={segment.pathData} />
      ))}
      {projectedWaypoints.map(({ waypoint, projected }) => {
        const state = waypoint.id === journeyRoute.activeWaypointId ? 'active' : waypoint.id === journeyRoute.nextWaypointId ? 'next' : 'idle';
        return <circle key={waypoint.id} className="journeyWaypointMarker" data-state={state} cx={projected.percent.x} cy={projected.percent.y} r={state === 'active' ? 1.95 : state === 'next' ? 1.6 : 1.35} opacity={projected.visible ? 1 : 0.22} />;
      })}
    </svg>
  );
}

export function CssEarthRenderer({
  coordinates = { latitude: 0, longitude: 0 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal',
  activeLocationLabel = '',
  activeCountryHighlight = null,
  isTransitioning = false,
  journeyRoute = null
}) {
  const beacon = projectGeoCoordinate(coordinates, 50, 50, rotation);
  const activeCountry = activeCountryHighlight
    ? projectGeoCoordinate(
      { latitude: activeCountryHighlight.latitude, longitude: activeCountryHighlight.longitude },
      50,
      50,
      rotation
    )
    : null;
  const beaconStyle = { '--beacon-x': `${beacon.percent.x}%`, '--beacon-y': `${beacon.percent.y}%`, opacity: beacon.visible ? 1 : 0.18 };
  const labelStyle = { '--beacon-x': `${beacon.percent.x}%`, '--beacon-y': `${beacon.percent.y}%` };
  const activeCountryStyle = activeCountry
    ? {
      '--active-country-x': `${activeCountry.percent.x}%`,
      '--active-country-y': `${activeCountry.percent.y}%`,
      '--active-country-width': `${Math.max(7, (activeCountryHighlight.radiusLongitude || 4) * 0.62)}%`,
      '--active-country-height': `${Math.max(5, (activeCountryHighlight.radiusLatitude || 4) * 0.62)}%`,
      '--active-country-tilt': `${activeCountryHighlight.tilt || 0}deg`,
      opacity: activeCountry.visible ? 0.62 : 0
    }
    : null;
  return (
    <div className="earth" aria-live="off" data-earth-renderer="css-fallback">
      <GlobeMaterials />
      {activeCountryStyle ? <div className="activeCountryHighlight" style={activeCountryStyle} aria-hidden="true" /> : null}
      <Atmosphere />
      <Clouds />
      <Lighting />
      <GridLines />
      <RouteOverlay journeyRoute={journeyRoute} rotation={rotation} />
      <div className="beacon" style={beaconStyle} aria-label={signalLabel} data-ready={!isTransitioning}>
        <span aria-hidden="true" />
      </div>
      {activeLocationLabel ? (
        <div className="activeLocationLabel" style={labelStyle} aria-hidden={!beacon.visible} data-visible={beacon.visible}>
          {activeLocationLabel}
        </div>
      ) : null}
    </div>
  );
}
