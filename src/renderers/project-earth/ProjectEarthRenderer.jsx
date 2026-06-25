'use client';

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
          <div className="earth" aria-live="off">
            <div className="atmosphere" aria-hidden="true" />
            <div className="cloudBand" aria-hidden="true" />
            <div className="terminator" aria-hidden="true" />
            <div className="earthShade" aria-hidden="true" />
            <div className="latitude latOne" aria-hidden="true" />
            <div className="latitude latTwo" aria-hidden="true" />
            <div className="latitude latThree" aria-hidden="true" />
            <div className="longitude lonOne" aria-hidden="true" />
            <div className="longitude lonTwo" aria-hidden="true" />
            <div className="beacon" aria-label={signalLabel}>
              <span aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
