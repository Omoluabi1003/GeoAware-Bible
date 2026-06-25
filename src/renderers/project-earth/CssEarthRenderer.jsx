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
  activeLocationLabel = ''
}) {
  const beacon = projectGeoCoordinate(coordinates, 50, 50, rotation);
  const beaconStyle = { '--beacon-x': `${beacon.percent.x}%`, '--beacon-y': `${beacon.percent.y}%`, opacity: beacon.visible ? 1 : 0.18 };
  const labelStyle = { '--beacon-x': `${beacon.percent.x}%`, '--beacon-y': `${beacon.percent.y}%` };
  return (
    <div className="earth" aria-live="off" data-earth-renderer="css-fallback">
      <GlobeMaterials />
      <Atmosphere />
      <Clouds />
      <Lighting />
      <GridLines />
      <div className="beacon" style={beaconStyle} aria-label={signalLabel}>
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
