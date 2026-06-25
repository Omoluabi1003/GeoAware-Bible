const MIN_PITCH_DEGREES = -62;
const MAX_PITCH_DEGREES = 62;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeGeoCoordinate(coordinate, fallback = { latitude: 0, longitude: 0 }) {
  const latitude = Number(coordinate?.latitude ?? coordinate?.lat ?? fallback.latitude);
  const longitude = Number(coordinate?.longitude ?? coordinate?.lon ?? fallback.longitude);

  return {
    latitude: clamp(Number.isFinite(latitude) ? latitude : fallback.latitude, -90, 90),
    longitude: Number.isFinite(longitude) ? ((((longitude + 180) % 360) + 360) % 360) - 180 : fallback.longitude
  };
}

export function rotationForGeoCoordinate(coordinate) {
  const { latitude, longitude } = normalizeGeoCoordinate(coordinate);

  return {
    x: clamp(latitude * 0.72, MIN_PITCH_DEGREES, MAX_PITCH_DEGREES),
    y: -longitude
  };
}

export function projectGeoCoordinate(coordinate, radius, center, rotation = { x: 0, y: 0 }) {
  const { latitude, longitude } = normalizeGeoCoordinate(coordinate);
  const lambda = ((longitude + rotation.y) * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  const pitch = (clamp(rotation.x, MIN_PITCH_DEGREES, MAX_PITCH_DEGREES) * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sphereX = radius * cosPhi * Math.sin(lambda);
  const sphereY = -radius * Math.sin(phi);
  const sphereZ = radius * cosPhi * Math.cos(lambda);
  const x = center + sphereX;
  const y = center + sphereY * Math.cos(pitch) - sphereZ * Math.sin(pitch);
  const z = sphereY * Math.sin(pitch) + sphereZ * Math.cos(pitch);

  return {
    x,
    y,
    z,
    visible: z >= radius * -0.015,
    percent: {
      x: (x / (center * 2)) * 100,
      y: (y / (center * 2)) * 100
    }
  };
}
