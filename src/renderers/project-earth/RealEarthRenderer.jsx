'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NATURAL_EARTH_LAND_RINGS } from './data/naturalEarthLand.js';
import { clamp, projectGeoCoordinate } from './geoCoordinateEngine.js';

const TWO_PI = Math.PI * 2;
const HORIZON_EPSILON = -0.015;
const EARTH_ROTATION_DEGREES_PER_SECOND = 0.25;
const CLOUD_DRIFT_DEGREES_PER_SECOND = 0.012;
const LIGHT_DRIFT_PERIOD_MS = 1200000;
const DRAG_DEGREES_PER_PIXEL = 0.18;
const INERTIA_DECAY_PER_FRAME = 0.94;
const MIN_INERTIA_DEGREES_PER_FRAME = 0.006;
const AUTO_RESUME_DELAY_MS = 2200;
const AUTO_RESUME_RAMP_MS = 7000;
const MIN_PITCH_DEGREES = -62;
const MAX_PITCH_DEGREES = 62;

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

function projectPoint([lon, lat], radius, center, rotation) {
  const lambda = ((lon + rotation.y) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const pitch = (clamp(rotation.x, MIN_PITCH_DEGREES, MAX_PITCH_DEGREES) * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const x = radius * cosPhi * Math.sin(lambda);
  const y = -radius * Math.sin(phi);
  const z = radius * cosPhi * Math.cos(lambda);

  return {
    x: center + x,
    y: center + y * Math.cos(pitch) - z * Math.sin(pitch),
    z: y * Math.sin(pitch) + z * Math.cos(pitch)
  };
}

function clipSegmentToHorizon(previous, current, horizonZ) {
  const previousVisible = previous.z >= horizonZ;
  const currentVisible = current.z >= horizonZ;

  if (previousVisible && currentVisible) return [current];
  if (!previousVisible && !currentVisible) return [];

  const t = (horizonZ - previous.z) / (current.z - previous.z);
  const intersection = {
    x: previous.x + (current.x - previous.x) * t,
    y: previous.y + (current.y - previous.y) * t,
    z: horizonZ
  };

  return previousVisible ? [intersection] : [intersection, current];
}

function getVisibleRingSegments(ring, radius, center, rotation) {
  const points = ring.map((coordinate) => projectPoint(coordinate, radius, center, rotation));
  const horizonZ = radius * HORIZON_EPSILON;
  const segments = [];
  let segment = [];

  points.forEach((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const clippedPoints = clipSegmentToHorizon(previous, point, horizonZ);

    clippedPoints.forEach((clippedPoint) => {
      const entersFromHidden = previous.z < horizonZ && clippedPoint.z === horizonZ;
      if (entersFromHidden && segment.length > 0) {
        segments.push(segment);
        segment = [];
      }
      segment.push(clippedPoint);
    });
  });

  if (segment.length > 0) segments.push(segment);
  return segments.filter((visibleSegment) => visibleSegment.length >= 2);
}

function drawProjectedPath(ctx, points, { close = false } = {}) {
  ctx.beginPath();
  points.forEach(({ x, y }, index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (close) ctx.closePath();
}

function drawRing(ctx, ring, radius, center, rotation, { fill = true, stroke = true } = {}) {
  const projectedPoints = ring.map((coordinate) => projectPoint(coordinate, radius, center, rotation));
  const horizonZ = radius * HORIZON_EPSILON;
  const isFullyVisible = projectedPoints.every((point) => point.z >= horizonZ);

  if (fill && isFullyVisible && projectedPoints.length >= 3) {
    drawProjectedPath(ctx, projectedPoints, { close: true });
    ctx.fill();
    if (stroke) ctx.stroke();
    return;
  }

  if (fill && !stroke) return;

  const segments = getVisibleRingSegments(ring, radius, center, rotation);
  segments.forEach((segment) => {
    if (segment.length < 2) return;
    drawProjectedPath(ctx, segment);
    ctx.stroke();
  });
}

function createLatitudeRing(latitude) {
  return Array.from({ length: 145 }, (_, index) => [-180 + index * 2.5, latitude]);
}

function createLongitudeRing(longitude) {
  return Array.from({ length: 73 }, (_, index) => [longitude, -90 + index * 2.5]);
}

function drawEarth(canvas, coordinates, rotation, motion = { earthTurn: 0, cloudTurn: 0, lightPhase: 0 }) {
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
  [-60, -30, 0, 30, 60].forEach((latitude) => {
    drawRing(ctx, createLatitudeRing(latitude), radius, center, rotation, { fill: false, stroke: true });
  });
  [-120, -60, 0, 60, 120, 180].forEach((longitude) => {
    drawRing(ctx, createLongitudeRing(longitude), radius, center, rotation, { fill: false, stroke: true });
  });

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

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = 'rgba(255, 255, 255, .42)';
  ctx.lineWidth = Math.max(5, size * 0.012);
  ctx.filter = `blur(${Math.max(2, size * 0.006)}px)`;
  mesh.rings.forEach((ring) =>
    drawRing(
      ctx,
      ring.map(([lon, lat]) => [lon + motion.cloudTurn, lat + Math.sin((lon + motion.cloudTurn) * Math.PI / 180) * 1.2]),
      radius * 1.006,
      center,
      rotation,
      { fill: false, stroke: true }
    )
  );
  ctx.restore();

  const lightX = size * (0.24 + Math.sin(motion.lightPhase) * 0.035);
  const lightY = size * (0.18 + Math.cos(motion.lightPhase) * 0.02);
  const shadeX = size * (0.72 + Math.sin(motion.lightPhase + Math.PI) * 0.025);
  const shadeY = size * (0.68 + Math.cos(motion.lightPhase + Math.PI) * 0.018);
  const shade = ctx.createRadialGradient(lightX, lightY, size * 0.08, shadeX, shadeY, radius * 1.04);
  shade.addColorStop(0, 'rgba(255, 244, 214, .16)');
  shade.addColorStop(0.48, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, .72)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, size, size);

  const beacon = projectGeoCoordinate(coordinates, radius, center, rotation);
  if (beacon.visible) {
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#f7d77a';
    ctx.beginPath();
    ctx.arc(beacon.x, beacon.y, Math.max(6, size * 0.018), 0, TWO_PI);
    ctx.fill();
  }
  ctx.restore();
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reducedMotion;
}

export function RealEarthRenderer({
  coordinates,
  rotation,
  signalLabel = 'Earth signal',
  activeLocationLabel = '',
  onUnavailable,
  isTransitioning = false
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const interactionRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    rotationOffset: { x: 0, y: 0, z: 0 },
    yawVelocity: 0,
    pitchVelocity: 0,
    isDragging: false,
    releasedAt: 0,
    autoTurn: 0,
    lastFrameAt: 0
  });
  const reducedMotion = useReducedMotion();
  const [projectedBeacon, setProjectedBeacon] = useState({ x: 50, y: 50, visible: true });
  const baseRotation = useMemo(
    () => ({
      x: clamp(rotation.x, MIN_PITCH_DEGREES, MAX_PITCH_DEGREES),
      y: rotation.y
    }),
    [rotation.x, rotation.y]
  );

  useEffect(() => {
    if (!hasWebGL()) {
      onUnavailable?.();
    }
  }, [onUnavailable]);

  useEffect(() => {
    const globe = containerRef.current;
    if (!globe) return undefined;

    const handlePointerDown = (event) => {
      if (!event.isPrimary) return;

      const interaction = interactionRef.current;
      interaction.pointerId = event.pointerId;
      interaction.startX = event.clientX;
      interaction.startY = event.clientY;
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;
      interaction.lastTime = performance.now();
      interaction.yawVelocity = 0;
      interaction.pitchVelocity = 0;
      interaction.isDragging = true;
      globe.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      const interaction = interactionRef.current;
      if (!interaction.isDragging || interaction.pointerId !== event.pointerId) return;

      event.preventDefault();
      const now = performance.now();
      const dx = event.clientX - interaction.lastX;
      const dy = event.clientY - interaction.lastY;
      const dt = Math.max(16, now - interaction.lastTime);
      const yawTurn = dx * DRAG_DEGREES_PER_PIXEL;
      const pitchTurn = -dy * DRAG_DEGREES_PER_PIXEL;
      const nextPitchOffset = clamp(
        interaction.rotationOffset.x + pitchTurn,
        MIN_PITCH_DEGREES - baseRotation.x,
        MAX_PITCH_DEGREES - baseRotation.x
      );
      const appliedPitchTurn = nextPitchOffset - interaction.rotationOffset.x;
      interaction.rotationOffset.y += yawTurn;
      interaction.rotationOffset.x = nextPitchOffset;
      interaction.yawVelocity = (yawTurn / dt) * 16.67;
      interaction.pitchVelocity = (appliedPitchTurn / dt) * 16.67;
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;
      interaction.lastTime = now;
      interaction.releasedAt = now;
    };

    const endPointerDrag = (event) => {
      const interaction = interactionRef.current;
      if (interaction.pointerId !== event.pointerId) return;

      interaction.isDragging = false;
      interaction.pointerId = null;
      interaction.releasedAt = performance.now();
      globe.releasePointerCapture?.(event.pointerId);
    };

    globe.addEventListener('pointerdown', handlePointerDown);
    globe.addEventListener('pointermove', handlePointerMove);
    globe.addEventListener('pointerup', endPointerDrag);
    globe.addEventListener('pointercancel', endPointerDrag);

    return () => {
      globe.removeEventListener('pointerdown', handlePointerDown);
      globe.removeEventListener('pointermove', handlePointerMove);
      globe.removeEventListener('pointerup', endPointerDrag);
      globe.removeEventListener('pointercancel', endPointerDrag);
    };
  }, [baseRotation.x]);

  useEffect(() => {
    const interaction = interactionRef.current;
    if (isTransitioning) {
      interaction.rotationOffset = { x: 0, y: 0, z: 0 };
      interaction.autoTurn = 0;
      interaction.yawVelocity = 0;
      interaction.pitchVelocity = 0;
      return;
    }

    interaction.releasedAt = performance.now();
  }, [isTransitioning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const startedAt = performance.now();
    const stillMotion = { earthTurn: 0, cloudTurn: 0, lightPhase: 0 };

    const getInteractionRotation = (earthTurn = 0) => ({
      x: clamp(baseRotation.x + interactionRef.current.rotationOffset.x, MIN_PITCH_DEGREES, MAX_PITCH_DEGREES),
      y: baseRotation.y + earthTurn + interactionRef.current.rotationOffset.y
    });
    const updateBeacon = (nextRotation) => {
      const rect = canvas.getBoundingClientRect();
      const size = Math.max(1, Math.round(rect.width));
      const beacon = projectGeoCoordinate(coordinates, size * 0.49, size / 2, nextRotation);
      setProjectedBeacon({ x: beacon.percent.x, y: beacon.percent.y, visible: beacon.visible });
    };
    const renderStill = () => {
      const nextRotation = getInteractionRotation();
      drawEarth(canvas, coordinates, nextRotation, stillMotion);
      updateBeacon(nextRotation);
    };
    const renderFrame = (now) => {
      const interaction = interactionRef.current;
      const timeSinceRelease = now - interaction.releasedAt;
      const resumeProgress = interaction.releasedAt === 0
        ? 1
        : Math.min(1, Math.max(0, (timeSinceRelease - AUTO_RESUME_DELAY_MS) / AUTO_RESUME_RAMP_MS));
      const autoMultiplier = interaction.isDragging || isTransitioning ? 0 : resumeProgress;

      const frameSeconds = interaction.lastFrameAt === 0 ? 0 : (now - interaction.lastFrameAt) / 1000;
      interaction.lastFrameAt = now;

      if (!interaction.isDragging && !reducedMotion) {
        if (Math.abs(interaction.yawVelocity) > MIN_INERTIA_DEGREES_PER_FRAME) {
          interaction.rotationOffset.y += interaction.yawVelocity;
          interaction.yawVelocity *= INERTIA_DECAY_PER_FRAME;
        }

        if (Math.abs(interaction.pitchVelocity) > MIN_INERTIA_DEGREES_PER_FRAME) {
          const nextPitchOffset = clamp(
            interaction.rotationOffset.x + interaction.pitchVelocity,
            MIN_PITCH_DEGREES - baseRotation.x,
            MAX_PITCH_DEGREES - baseRotation.x
          );
          interaction.pitchVelocity = (nextPitchOffset - interaction.rotationOffset.x) * INERTIA_DECAY_PER_FRAME;
          interaction.rotationOffset.x = nextPitchOffset;
        }
      }

      if (!reducedMotion) {
        interaction.autoTurn += frameSeconds * EARTH_ROTATION_DEGREES_PER_SECOND * autoMultiplier;
      }

      const earthTurn = reducedMotion ? 0 : interaction.autoTurn;
      const elapsedSeconds = (now - startedAt) / 1000;
      const cloudTurn = reducedMotion ? 0 : elapsedSeconds * CLOUD_DRIFT_DEGREES_PER_SECOND;
      const lightPhase = reducedMotion ? 0 : ((now - startedAt) / LIGHT_DRIFT_PERIOD_MS) * TWO_PI;

      const nextRotation = getInteractionRotation(earthTurn);
      drawEarth(canvas, coordinates, nextRotation, { earthTurn, cloudTurn, lightPhase });
      updateBeacon(nextRotation);
      animationRef.current = window.requestAnimationFrame(renderFrame);
    };

    animationRef.current = window.requestAnimationFrame(reducedMotion ? function renderReducedFrame() {
      renderStill();
      animationRef.current = window.requestAnimationFrame(renderReducedFrame);
    } : renderFrame);

    const resizeObserver = new ResizeObserver(renderStill);
    resizeObserver.observe(canvas);
    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [coordinates, baseRotation, reducedMotion, isTransitioning]);

  const beaconStyle = { '--beacon-x': `${projectedBeacon.x}%`, '--beacon-y': `${projectedBeacon.y}%`, opacity: projectedBeacon.visible ? 1 : 0.18 };
  const labelStyle = { '--beacon-x': `${projectedBeacon.x}%`, '--beacon-y': `${projectedBeacon.y}%` };

  return (
    <div ref={containerRef} className="earth realEarth" aria-live="off" data-earth-renderer="canvas-real">
      <canvas ref={canvasRef} className="realEarthCanvas" aria-hidden="true" />
      <div className="realEarthAtmosphere" aria-hidden="true" />
      <div className="beacon" style={beaconStyle} aria-label={signalLabel}>
        <span aria-hidden="true" />
      </div>
      {activeLocationLabel ? (
        <div className="activeLocationLabel" style={labelStyle} aria-hidden={!projectedBeacon.visible} data-visible={projectedBeacon.visible}>
          {activeLocationLabel}
        </div>
      ) : null}
    </div>
  );
}
