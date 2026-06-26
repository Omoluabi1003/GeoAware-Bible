'use client';

import { EarthRenderer } from './EarthRenderer.jsx';

/**
 * Project Earth renderer foundation.
 *
 * This component intentionally owns only rendering primitives. App features pass
 * camera/coordinate intent through props and never reach into atmospheric, lighting,
 * cloud, or shading layers directly. The interface is shaped for later extraction
 * into GeoAware OS and reuse by WaveAtlas without carrying Scripture, translation,
 * routing, or Geo business logic with it.
 */
export default function ProjectEarthRenderer({
  coordinates = { latitude: 0, longitude: 0 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal',
  activeLocationLabel = '',
  activeCountryHighlight = null,
  isTransitioning = false,
  journeyRoute = null,
  className = ''
}) {
  const rendererStyle = {
    '--geo-latitude': coordinates.latitude,
    '--geo-longitude': coordinates.longitude,
    '--earth-turn-x': `${rotation.x}deg`,
    '--earth-turn-y': `${rotation.y}deg`
  };

  return (
    <div className={`projectEarthRenderer ${className}`.trim()} style={rendererStyle} data-renderer="project-earth">
      <div className="earthStage" aria-label="Interactive world preview">
        <div className="orbit orbitOne" aria-hidden="true" />
        <div className="orbit orbitTwo" aria-hidden="true" />
        <div className="earthWrapper">
          <EarthRenderer coordinates={coordinates} rotation={rotation} signalLabel={signalLabel} activeLocationLabel={activeLocationLabel} activeCountryHighlight={activeCountryHighlight} isTransitioning={isTransitioning} journeyRoute={journeyRoute} />
        </div>
      </div>
    </div>
  );
}
