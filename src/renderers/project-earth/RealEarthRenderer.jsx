'use client';

import { useEffect, useRef } from 'react';

const TWO_PI = Math.PI * 2;
const LANDMASSES = [
  [[-168, 72], [-135, 68], [-108, 55], [-96, 38], [-82, 25], [-100, 16], [-118, 30], [-132, 50]],
  [[-82, 12], [-70, 7], [-54, -8], [-48, -24], [-61, -55], [-74, -36], [-78, -14]],
  [[-18, 36], [10, 34], [32, 22], [42, 6], [30, -32], [16, -35], [2, -18], [-10, 7]],
  [[-10, 72], [24, 70], [42, 58], [30, 44], [4, 48], [-14, 58]],
  [[34, 60], [72, 70], [122, 56], [150, 46], [142, 18], [106, 6], [82, 22], [54, 18], [42, 36]],
  [[112, -12], [154, -18], [150, -38], [124, -44], [112, -28]],
  [[-180, -66], [-90, -72], [0, -68], [90, -72], [180, -66], [180, -90], [-180, -90]]
];

function hasWebGL() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function project([lon, lat], radius, center, turnY, turnX) {
  const lambda = ((lon + turnY) * Math.PI) / 180;
  const phi = ((lat + turnX) * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.sin(lambda);
  const y = -radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.cos(lambda);

  if (z < -radius * 0.18) return null;

  return [center + x, center + y];
}

function drawLandmass(ctx, points, radius, center, rotation) {
  const projected = points.map((point) => project(point, radius, center, rotation.y, rotation.x));
  const visible = projected.filter(Boolean);

  if (visible.length < 2) return;

  ctx.beginPath();
  visible.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
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
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TWO_PI);
  ctx.clip();

  const ocean = ctx.createRadialGradient(size * 0.34, size * 0.24, size * 0.04, center, center, radius);
  ocean.addColorStop(0, '#4fb3cf');
  ocean.addColorStop(0.36, '#075f83');
  ocean.addColorStop(0.72, '#062d58');
  ocean.addColorStop(1, '#010817');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = 'rgba(218,241,255,.28)';
  ctx.lineWidth = Math.max(0.8, size * 0.0015);
  for (let i = -60; i <= 60; i += 30) {
    ctx.beginPath();
    const y = center - radius * Math.sin((i * Math.PI) / 180);
    const h = Math.max(1, radius * Math.cos((i * Math.PI) / 180));
    ctx.ellipse(center, y, h, h * 0.12, 0, 0, TWO_PI);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#5d7f48';
  ctx.strokeStyle = 'rgba(235, 220, 170, .26)';
  ctx.lineWidth = Math.max(1, size * 0.002);
  LANDMASSES.forEach((landmass) => drawLandmass(ctx, landmass, radius, center, rotation));

  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#f7fbff';
  LANDMASSES.forEach((landmass) => drawLandmass(ctx, landmass.map(([lon, lat]) => [lon + 2, lat + 1]), radius, center, rotation));
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
