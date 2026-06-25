'use client';

import { useEffect, useRef } from 'react';
import { NATURAL_EARTH_LAND_RINGS } from './data/naturalEarthLand.js';

const TWO_PI = Math.PI * 2;
const HORIZON_EPSILON = -0.08;

export function getEarthMesh() {
  return {
    source: 'Natural Earth 1:110m public-domain land polygons',
    rings: NATURAL_EARTH_LAND_RINGS
  };
}

function hasWebGL() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function projectCoordinate([lon, lat], radius, center, rotation) {
  const lambda = ((lon + rotation.y) * Math.PI) / 180;
  const phi = ((lat + rotation.x) * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const x = radius * cosPhi * Math.sin(lambda);
  const y = -radius * Math.sin(phi);
  const z = radius * cosPhi * Math.cos(lambda);

  if (z < radius * HORIZON_EPSILON) return null;

  return [center + x, center + y];
}

function drawRing(ctx, ring, radius, center, rotation, { fill = true, stroke = true } = {}) {
  let active = false;
  let drawnPoints = 0;

  ctx.beginPath();

  ring.forEach((coordinate) => {
    const projected = projectCoordinate(coordinate, radius, center, rotation);

    if (!projected) {
      active = false;
      return;
    }

    const [x, y] = projected;
    if (!active) {
      ctx.moveTo(x, y);
      active = true;
    } else {
      ctx.lineTo(x, y);
    }
    drawnPoints += 1;
  });

  if (drawnPoints < 3) return;

  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawEarth(canvas, focus, rotation) {
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(1, Math.round(rect.width));
  const scale = window.devicePixelRatio || 1;
  canvas.width = size * scale;
  canvas.height = size * scale;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * 0.49;
  const mesh = getEarthMesh();

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TWO_PI);
  ctx.clip();

  const ocean = ctx.createRadialGradient(size * 0.32, size * 0.2, size * 0.03, center, center, radius);
  ocean.addColorStop(0, '#6bc4d8');
  ocean.addColorStop(0.2, '#1d86a8');
  ocean.addColorStop(0.48, '#075174');
  ocean.addColorStop(0.76, '#062d58');
  ocean.addColorStop(1, '#010817');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#bdeeff';
  ctx.lineWidth = Math.max(2, size * 0.006);
  mesh.rings.forEach((ring) => drawRing(ctx, ring, radius * 1.002, center, rotation, { fill: false, stroke: true }));
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = 'rgba(218,241,255,.24)';
  ctx.lineWidth = Math.max(0.8, size * 0.0015);
  for (let i = -60; i <= 60; i += 30) {
    ctx.beginPath();
    const y = center - radius * Math.sin((i * Math.PI) / 180);
    const h = Math.max(1, radius * Math.cos((i * Math.PI) / 180));
    ctx.ellipse(center, y, h, h * 0.12, 0, 0, TWO_PI);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const land = ctx.createLinearGradient(size * 0.24, size * 0.1, size * 0.76, size * 0.9);
  land.addColorStop(0, '#7f8d59');
  land.addColorStop(0.42, '#617b4a');
  land.addColorStop(0.72, '#9b8055');
  land.addColorStop(1, '#4f6d45');
  ctx.fillStyle = land;
  ctx.strokeStyle = 'rgba(239, 226, 185, .38)';
  ctx.lineWidth = Math.max(0.75, size * 0.0016);
  mesh.rings.forEach((ring) => drawRing(ctx, ring, radius, center, rotation));

  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = 'rgba(255, 230, 176, .55)';
  mesh.rings.forEach((ring) => drawRing(ctx, ring.map(([lon, lat]) => [lon - 0.8, lat + 0.4]), radius, center, rotation, { stroke: false }));
  ctx.globalCompositeOperation = 'source-over';

  const shade = ctx.createRadialGradient(size * 0.24, size * 0.18, size * 0.08, size * 0.72, size * 0.68, radius * 1.04);
  shade.addColorStop(0, 'rgba(255, 244, 214, .16)');
  shade.addColorStop(0.48, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, .72)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, size, size);

  const beaconX = (focus.x / 100) * size;
  const beaconY = (focus.y / 100) * size;
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#f7d77a';
  ctx.beginPath();
  ctx.arc(beaconX, beaconY, Math.max(6, size * 0.018), 0, TWO_PI);
  ctx.fill();
  ctx.restore();
}

export function RealEarthRenderer({ focus, rotation, signalLabel = 'Earth signal', onUnavailable }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL()) {
      onUnavailable?.();
    }
  }, [onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const render = () => drawEarth(canvas, focus, rotation);
    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [focus, rotation]);

  return (
    <div className="earth realEarth" aria-live="off" data-earth-renderer="canvas-real">
      <canvas ref={canvasRef} className="realEarthCanvas" aria-hidden="true" />
      <div className="realEarthAtmosphere" aria-hidden="true" />
      <div className="beacon" aria-label={signalLabel}>
        <span aria-hidden="true" />
      </div>
    </div>
  );
}
