'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveGeoContext } from '../src/data/geoContext.js';
import { languageProfiles } from '../src/data/languageProfiles.js';
import { getTranslation } from '../src/data/translations.js';
import ProjectEarthRenderer from '../src/renderers/project-earth/ProjectEarthRenderer.jsx';
import { rotationForGeoCoordinate } from '../src/renderers/project-earth/geoCoordinateEngine.js';
import { GeoLayerProvider } from '../src/context/GeoLayerContext.jsx';
import WalkTheWordController from '../src/controllers/WalkTheWordController.jsx';

const ARRIVAL_TIMING = {
  recognized: 220,
  preparing: 460,
  ready: 760
};

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 0
};

const LOCATION_PERMISSION_RESPONSE_KEY = 'geoaware.locationPermissionResponded';

function hasStoredLocationPermissionResponse() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(LOCATION_PERMISSION_RESPONSE_KEY) === 'true';
}

function storeLocationPermissionResponse() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCATION_PERMISSION_RESPONSE_KEY, 'true');
}

async function getGeolocationPermissionState() {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'unknown';
  }
}

function getPreciseBrowserLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new Error('Browser geolocation is unavailable.'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      (error) => reject(error),
      GEOLOCATION_OPTIONS
    );
  });
}

function formatDetectedLocality(address = {}) {
  const city = address.city || address.town || address.village || address.hamlet || address.municipality || address.county;
  const region = address.state || address.region || address.province || address.state_district;
  const country = address.country;

  return {
    city,
    region,
    country,
    countryCode: address.country_code?.toUpperCase?.()
  };
}

async function reverseGeocodeCoordinates(coordinates, signal) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(coordinates.latitude),
    lon: String(coordinates.longitude),
    addressdetails: '1',
    zoom: '14'
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding failed.');
  }

  const result = await response.json();
  const locality = formatDetectedLocality(result.address);
  if (!locality.city && !locality.region && !locality.country) {
    throw new Error('Reverse geocoding returned no locality.');
  }

  return locality;
}

function buildLocationLabel(profile, detectedLocality) {
  if (detectedLocality) {
    const preciseLabel = [detectedLocality.city, detectedLocality.region].filter(Boolean).join(', ');
    return preciseLabel || detectedLocality.country || profile.country || 'Location available';
  }

  return [profile.city, profile.state].filter(Boolean).join(', ') || profile.country || 'Location available';
}

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3;
}

function resolveEarthCamera(profile, detectedCoordinates = null) {
  const coordinates = detectedCoordinates || profile.coordinates || languageProfiles.US.coordinates;
  return {
    coordinates,
    rotation: rotationForGeoCoordinate(coordinates)
  };
}

function shortestRotationDelta(fromDegrees, toDegrees) {
  return ((((toDegrees - fromDegrees) + 180) % 360) + 360) % 360 - 180;
}

function interpolateCamera(from, to, progress) {
  const eased = easeOutCubic(progress);
  const lerp = (start, end) => start + (end - start) * eased;
  const yawDelta = shortestRotationDelta(from.rotation.y, to.rotation.y);

  return {
    coordinates: to.coordinates,
    rotation: {
      x: lerp(from.rotation.x, to.rotation.x),
      y: from.rotation.y + yawDelta * eased
    }
  };
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

function HomeContent({ walkTheWord }) {
  const [countryCode, setCountryCode] = useState('US');
  const [mode, setMode] = useState('geo');
  const [arrivalStep, setArrivalStep] = useState('ready');
  const [detectedCoordinates, setDetectedCoordinates] = useState(null);
  const [detectedLocality, setDetectedLocality] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationRequestKey, setLocationRequestKey] = useState(0);
  const [hasLocationPermissionResponse, setHasLocationPermissionResponse] = useState(false);
  const activeDetectedCoordinates = mode === 'geo' ? detectedCoordinates : null;
  const activeDetectedLocality = mode === 'geo' ? detectedLocality : null;
  const GeoContext = useMemo(() => resolveGeoContext({
    countryCode,
    coordinates: activeDetectedCoordinates,
    locality: activeDetectedLocality,
    stayInEnglish: mode === 'fixed',
    browserLanguages: typeof navigator === 'undefined' ? [] : navigator.languages
  }), [countryCode, activeDetectedCoordinates, activeDetectedLocality, mode]);
  const profile = languageProfiles[GeoContext.countryCode] || languageProfiles.US;
  const walkWaypoint = walkTheWord.activeWaypoint;
  const walkWaypointCoordinates = walkWaypoint?.coordinates || null;
  const walkJourneyRoute = useMemo(() => (walkTheWord.isActive ? {
    waypoints: walkTheWord.routeWaypoints,
    activeWaypointId: walkWaypoint?.id || null,
    nextWaypointId: walkTheWord.nextWaypoint?.id || null
  } : null), [walkTheWord.isActive, walkTheWord.routeWaypoints, walkWaypoint?.id, walkTheWord.nextWaypoint?.id]);
  const targetEarthCamera = useMemo(() => resolveEarthCamera(profile, walkWaypointCoordinates || activeDetectedCoordinates), [profile, activeDetectedCoordinates, walkWaypointCoordinates]);
  const animationFrameRef = useRef(null);
  const cameraRef = useRef(targetEarthCamera);
  const [earthCamera, setEarthCamera] = useState(targetEarthCamera);
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false);
  const reducedMotion = useReducedMotion();
  const activeTranslation = useMemo(() => (
    getTranslation(GeoContext.effectiveTranslationId)
  ), [GeoContext.effectiveTranslationId]);
  const countries = Object.entries(languageProfiles);
  const locationLabel = walkWaypoint?.title || buildLocationLabel(profile, activeDetectedLocality);
  const arrivalMessage = arrivalStep === 'finding'
    ? `Finding ${profile.country}...`
    : arrivalStep === 'recognized'
      ? `${profile.flag} ${locationLabel} recognized`
      : arrivalStep === 'preparing'
        ? `Preparing Scripture for ${locationLabel}`
        : `Scripture ready in ${GeoContext.effectiveLanguage}`;

  useEffect(() => {
    setArrivalStep('finding');
    const timers = [
      setTimeout(() => setArrivalStep('recognized'), ARRIVAL_TIMING.recognized),
      setTimeout(() => setArrivalStep('preparing'), ARRIVAL_TIMING.preparing),
      setTimeout(() => setArrivalStep('ready'), ARRIVAL_TIMING.ready)
    ];

    return () => timers.forEach(clearTimeout);
  }, [countryCode, locationLabel]);


  useEffect(() => {
    setHasLocationPermissionResponse(hasStoredLocationPermissionResponse());
  }, []);

  useEffect(() => {
    if (mode !== 'geo' || locationRequestKey === 0) return undefined;

    const controller = new AbortController();
    let isActive = true;

    setLocationError('');

    getGeolocationPermissionState()
      .then((permissionState) => {
        if (!isActive) return Promise.reject(new DOMException('Location request aborted.', 'AbortError'));

        if (permissionState === 'denied') {
          storeLocationPermissionResponse();
          setHasLocationPermissionResponse(true);
          setDetectedCoordinates(null);
          setDetectedLocality(null);
          setLocationError('Location permission is blocked. Enable location in your browser settings, then choose Read Near Me again.');
          return Promise.reject(new DOMException('Location permission denied.', 'AbortError'));
        }

        return getPreciseBrowserLocation();
      })
      .then(async (coordinates) => {
        storeLocationPermissionResponse();
        setHasLocationPermissionResponse(true);
        if (!isActive) return;
        setDetectedCoordinates(coordinates);

        const locality = await reverseGeocodeCoordinates(coordinates, controller.signal);
        if (!isActive) return;

        setDetectedLocality(locality);
        if (locality.countryCode && languageProfiles[locality.countryCode]) {
          setCountryCode(locality.countryCode);
        }
      })
      .catch((error) => {
        if (!isActive || error?.name === 'AbortError') return;
        setDetectedCoordinates(null);
        setDetectedLocality(null);
        storeLocationPermissionResponse();
        setHasLocationPermissionResponse(true);
        setLocationError(error?.code === 1 ? 'Location permission denied. Enable location in your browser settings, then choose Read Near Me again.' : 'Precise location unavailable; using country profile fallback.');
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [mode, locationRequestKey]);

  const requestLocationFollow = () => {
    setMode('geo');
    setLocationError(hasLocationPermissionResponse ? 'Checking location permission...' : 'Requesting location permission...');
    setLocationRequestKey((key) => key + 1);
  };

  useEffect(() => {
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);

    const startedAt = performance.now();
    const startCamera = cameraRef.current;

    if (reducedMotion) {
      cameraRef.current = targetEarthCamera;
      setEarthCamera(targetEarthCamera);
      setIsCameraTransitioning(false);
      return undefined;
    }

    setIsCameraTransitioning(true);

    const animateFocus = (now) => {
      const progress = Math.min(1, (now - startedAt) / ARRIVAL_TIMING.ready);
      const nextCamera = interpolateCamera(startCamera, targetEarthCamera, progress);
      cameraRef.current = nextCamera;
      setEarthCamera(nextCamera);

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateFocus);
      } else {
        cameraRef.current = targetEarthCamera;
        setEarthCamera(targetEarthCamera);
        setIsCameraTransitioning(false);
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(animateFocus);

    return () => {
      if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetEarthCamera, reducedMotion]);

  const walkWaypointReferenceLabel = walkWaypoint?.waypointRole === 'route_context' ? 'Approximate route context' : walkWaypoint?.scriptureRefs[0];
  const displayedReference = walkTheWord.isActive && walkWaypoint ? walkWaypointReferenceLabel : activeTranslation.reference;
  const displayedText = walkTheWord.isActive && walkWaypoint ? walkWaypoint.historicalSummary : activeTranslation.text;

  return (
    <main className="pageShell">
      <section className="topNav">
        <div className="brand"><span className="brandMark">✦</span> GeoAware Bible</div>
      </section>

      <section className="heroGrid">
        <div className="heroCopy">
          <h1>God's Word. Wherever you are.</h1>
        </div>

        <ProjectEarthRenderer
          coordinates={earthCamera.coordinates}
          rotation={earthCamera.rotation}
          signalLabel={`${GeoContext.country} Scripture setting`}
          activeLocationLabel={locationLabel}
          activeCountryHighlight={profile.countryHighlight}
          isTransitioning={isCameraTransitioning}
          journeyRoute={walkJourneyRoute}
        />

        <div className={`walkGlobeOverlay ${walkTheWord.isAutoWalking ? 'autoWalking' : ''}`} aria-label="Walk the Word">
          <p className="walkKicker">Walk the Word</p>
          <label className="geoNarrativeSelector">
            <span className="srOnly">Current GeoNarrative</span>
            <select
              value={walkTheWord.journeyId}
              onChange={(event) => walkTheWord.selectJourney(event.target.value)}
              aria-label="Current GeoNarrative"
              disabled={walkTheWord.isAutoWalking}
            >
              {walkTheWord.availableJourneys.map((journey) => (
                <option key={journey.id} value={journey.id}>{journey.title}</option>
              ))}
            </select>
          </label>
          <div className="walkTextStack" aria-live="polite" aria-atomic="true">
            <strong>{locationLabel}</strong>
            <span>{displayedReference}</span>
          </div>
          {walkTheWord.isActive && walkWaypoint ? (
            <p className="walkSubtleStatus">{walkWaypoint.historicalSummary}</p>
          ) : (
            <p className="walkSubtleStatus">{locationError || (arrivalStep === 'ready' ? `Scripture ready in ${GeoContext.effectiveLanguage}` : arrivalMessage)}</p>
          )}
          {walkTheWord.isActive && walkTheWord.engine.canMoveNext && walkTheWord.isAutoWalking ? (
            <button type="button" onClick={walkTheWord.pauseAutoWalk}>Pause</button>
          ) : walkTheWord.isActive ? (
            <button type="button" onClick={walkTheWord.engine.canMoveNext ? walkTheWord.startAutoWalk : walkTheWord.continue}>{walkTheWord.engine.canMoveNext ? 'Auto Walk' : 'Finish'}</button>
          ) : (
            <button type="button" onClick={walkTheWord.start}>Begin</button>
          )}
        </div>
      </section>

      <section className={`countryRail ${walkTheWord.isAutoWalking ? 'isHidden' : ''}`} aria-label="Choose a Scripture language by place">
        {countries.map(([code, item]) => (
          <button key={code} className={countryCode === code ? 'selected' : ''} onClick={() => { setCountryCode(code); setDetectedCoordinates(null); setDetectedLocality(null); setLocationError(''); }} aria-label={`${item.country}, ${item.primaryLanguage}`}>
            <span aria-hidden="true">{item.flag}</span>
            <strong>{item.languageCode?.toUpperCase() || (item.primaryLanguage?.slice(0, 2) || '').toUpperCase()}</strong>
            <small>{item.primaryLanguage}</small>
          </button>
        ))}
      </section>

      <section className="scriptureFlow" aria-label="Current Scripture">
        <p className="scriptureReference">{displayedReference}</p>
        <p className="scriptureText">{displayedText}</p>
        <p className="scriptureFinePrint">{activeTranslation.name} · {activeTranslation.language}</p>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <GeoLayerProvider>
      <WalkTheWordController>
        {(walkTheWord) => <HomeContent walkTheWord={walkTheWord} />}
      </WalkTheWordController>
    </GeoLayerProvider>
  );
}
