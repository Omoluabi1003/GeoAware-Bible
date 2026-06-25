import { projectGeoCoordinate } from './geoCoordinateEngine.js';
import { Atmosphere } from './layers/Atmosphere.jsx';
import { Clouds } from './layers/Clouds.jsx';
import { GlobeMaterials } from './layers/GlobeMaterials.jsx';
import { GridLines } from './layers/GridLines.jsx';
import { Lighting } from './layers/Lighting.jsx';

export function CssEarthRenderer({
  coordinates = { latitude: 0, longitude: 0 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal',
  activeLocationLabel = '',
  activeCountryHighlight = null,
  isTransitioning = false
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
