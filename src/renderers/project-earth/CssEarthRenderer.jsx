import { Atmosphere } from './layers/Atmosphere.jsx';
import { Clouds } from './layers/Clouds.jsx';
import { GlobeMaterials } from './layers/GlobeMaterials.jsx';
import { GridLines } from './layers/GridLines.jsx';
import { Lighting } from './layers/Lighting.jsx';

export function CssEarthRenderer({ signalLabel = 'Earth signal' }) {
  return (
    <div className="earth" aria-live="off" data-earth-renderer="css-fallback">
      <GlobeMaterials />
      <Atmosphere />
      <Clouds />
      <Lighting />
      <GridLines />
      <div className="beacon" aria-label={signalLabel}>
        <span aria-hidden="true" />
      </div>
    </div>
  );
}
