'use client';

import { EarthRenderer } from './EarthRenderer.jsx';

/**
 * Project Earth renderer foundation.
 *
 * This component intentionally owns only rendering primitives. App features pass
 * camera/focus intent through props and never reach into atmospheric, lighting,
 * cloud, or shading layers directly. The interface is shaped for later extraction
 * into GeoAware OS and reuse by WaveAtlas without carrying Scripture, translation,
 * routing, or Geo business logic with it.
 */
export default function ProjectEarthRenderer({
  focus = { x: 50, y: 50 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal',
  className = ''
}) {
  const rendererStyle = {
    '--focus-x': `${focus.x}%`,
    '--focus-y': `${focus.y}%`,
    '--earth-turn-x': `${rotation.x}deg`,
    '--earth-turn-y': `${rotation.y}deg`
  };

  return (
    <div className={`projectEarthRenderer ${className}`.trim()} style={rendererStyle} data-renderer="project-earth">
      <div className="earthStage" aria-label="Interactive world preview">
        <div className="orbit orbitOne" aria-hidden="true" />
        <div className="orbit orbitTwo" aria-hidden="true" />
        <div className="earthWrapper">
          <EarthRenderer signalLabel={signalLabel} />
        </div>
      </div>
    </div>
  );
}
