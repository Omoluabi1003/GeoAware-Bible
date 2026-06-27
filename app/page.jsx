'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveGeoContext } from '../src/data/geoContext.js';
import { languageProfiles } from '../src/data/languageProfiles.js';
import { getTranslation } from '../src/data/translations.js';
import ProjectEarthRenderer from '../src/renderers/project-earth/ProjectEarthRenderer.jsx';
import { rotationForGeoCoordinate } from '../src/renderers/project-earth/geoCoordinateEngine.js';
import { GeoLayerProvider } from '../src/context/GeoLayerContext.jsx';
import { createGeoGuideResolver } from '../src/data/geoGuideResolver.js';
import { resolveGeoNarrativeStudioPrompt, GEONARRATIVE_STUDIO_STATUS } from '../src/data/geoNarrativeStudio.js';
import { GEOGUIDE_ACTION_TYPES, GEOGUIDE_INTENTS } from '../src/data/geoGuideIntentModel.js';
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

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - ((-2 * progress + 2) ** 3) / 2;
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
  const eased = easeInOutCubic(progress);
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
  const [readingMode, setReadingMode] = useState('read_near_me');
  const [arrivalStep, setArrivalStep] = useState('ready');
  const [detectedCoordinates, setDetectedCoordinates] = useState(null);
  const [detectedLocality, setDetectedLocality] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationRequestKey, setLocationRequestKey] = useState(0);
  const [hasLocationPermissionResponse, setHasLocationPermissionResponse] = useState(false);
  const [geoGuideCommand, setGeoGuideCommand] = useState('');
  const [isGeoGuideExpanded, setIsGeoGuideExpanded] = useState(false);
  const [geoGuideResponse, setGeoGuideResponse] = useState('');
  const geoGuideInputRef = useRef(null);
  const activeDetectedCoordinates = mode === 'geo' ? detectedCoordinates : null;
  const activeDetectedLocality = mode === 'geo' ? detectedLocality : null;
  const GeoContext = useMemo(() => resolveGeoContext({
    countryCode,
    coordinates: activeDetectedCoordinates,
    locality: activeDetectedLocality,
    stayInEnglish: mode === 'fixed',
    browserLanguages: typeof navigator === 'undefined' ? [] : navigator.languages
  }), [countryCode, activeDetectedCoordinates, activeDetectedLocality, mode]);
  const geoGuide = useMemo(() => createGeoGuideResolver({
    countryCode: GeoContext.countryCode,
    coordinates: activeDetectedCoordinates,
    locality: activeDetectedLocality,
    stayInEnglish: mode === 'fixed',
    browserLanguages: typeof navigator === 'undefined' ? [] : navigator.languages
  }), [GeoContext.countryCode, activeDetectedCoordinates, activeDetectedLocality, mode]);
  const profile = languageProfiles[GeoContext.countryCode] || languageProfiles.US;
  const walkWaypoint = walkTheWord.activeWaypoint;
  const walkWaypointCoordinates = readingMode === 'walk_the_word' ? walkWaypoint?.coordinates || null : null;
  const walkJourneyRoute = useMemo(() => (readingMode === 'walk_the_word' && walkTheWord.isActive ? {
    waypoints: walkTheWord.routeWaypoints,
    activeWaypointId: walkWaypoint?.id || null,
    nextWaypointId: walkTheWord.nextWaypoint?.id || null
  } : null), [readingMode, walkTheWord.isActive, walkTheWord.routeWaypoints, walkWaypoint?.id, walkTheWord.nextWaypoint?.id]);
  const targetEarthCamera = useMemo(() => resolveEarthCamera(profile, walkWaypointCoordinates || activeDetectedCoordinates), [profile, activeDetectedCoordinates, walkWaypointCoordinates]);
  const animationFrameRef = useRef(null);
  const cameraRef = useRef(targetEarthCamera);
  const [earthCamera, setEarthCamera] = useState(targetEarthCamera);
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false);
  const [scriptureTransition, setScriptureTransition] = useState({ key: '', reference: '', text: '', className: '', summary: '' });
  const [isScriptureVisible, setIsScriptureVisible] = useState(true);
  const scriptureTransitionTimerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const activeTranslation = useMemo(() => (
    getTranslation(GeoContext.effectiveTranslationId)
  ), [GeoContext.effectiveTranslationId]);
  const countries = Object.entries(languageProfiles);
  const openGeoGuide = () => setIsGeoGuideExpanded(true);
  const closeGeoGuide = () => {
    setIsGeoGuideExpanded(false);
    setGeoGuideCommand('');
    setGeoGuideResponse('');
  };
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
  const walkWaypointSummary = walkWaypoint?.historicalSummary || '';
  const displayedText = activeTranslation.text;
  const scriptureClassName = walkTheWord.isActive && walkWaypoint ? 'waypointDescription' : '';
  const scriptureKey = `${readingMode}:${walkWaypoint?.id || GeoContext.countryCode}:${displayedReference}:${displayedText}`;
  const selectedReadingModeLabel = readingMode === 'read_near_me' ? 'Read Near Me' : readingMode === 'walk_the_word' ? 'Walk the Word' : 'Explore the World';


  useEffect(() => {
    const nextScripture = {
      key: scriptureKey,
      reference: displayedReference,
      text: displayedText,
      className: scriptureClassName,
      summary: walkWaypointSummary,
    };

    if (!scriptureTransition.key || reducedMotion) {
      setScriptureTransition(nextScripture);
      setIsScriptureVisible(true);
      return undefined;
    }

    if (scriptureTransition.key === scriptureKey) return undefined;

    setIsScriptureVisible(false);
    if (scriptureTransitionTimerRef.current) window.clearTimeout(scriptureTransitionTimerRef.current);
    scriptureTransitionTimerRef.current = window.setTimeout(() => {
      setScriptureTransition(nextScripture);
      setIsScriptureVisible(true);
    }, 180);

    return () => {
      if (scriptureTransitionTimerRef.current) window.clearTimeout(scriptureTransitionTimerRef.current);
    };
  }, [displayedReference, displayedText, reducedMotion, scriptureClassName, scriptureKey, scriptureTransition.key, walkWaypointSummary]);


  useEffect(() => {
    if (!isGeoGuideExpanded) return;
    geoGuideInputRef.current?.focus();
  }, [isGeoGuideExpanded]);

  const selectReadingMode = (nextMode) => {
    setReadingMode(nextMode);
    if (nextMode === 'read_near_me') {
      requestLocationFollow();
    }
  };


  const parseGeoGuideCommand = (commandText) => {
    const normalizedCommand = commandText.trim().toLowerCase().replace(/[?.!]+$/g, '');
    if (!normalizedCommand) return null;

    if (/^(read\s+near\s+me|near\s+me|update\s+location)$/.test(normalizedCommand)) {
      return { type: GEOGUIDE_INTENTS.readNearMe, slots: {}, source: 'typed_command', rawText: commandText };
    }

    if (/^explore\s+(?:the\s+)?world$/.test(normalizedCommand)) {
      return { type: GEOGUIDE_INTENTS.explorePlace, slots: { place: 'world' }, source: 'typed_command', rawText: commandText };
    }

    const walkMatch = normalizedCommand.match(/^(?:walk|go)\s+to\s+(.+)$/);
    if (walkMatch) {
      const destination = walkMatch[1].trim();
      if (destination === 'bethlehem') {
        return { type: GEOGUIDE_INTENTS.walkGeoNarrative, slots: { geoNarrativeId: 'journey_to_bethlehem' }, source: 'typed_command', rawText: commandText };
      }
      return { type: GEOGUIDE_INTENTS.explorePlace, slots: { place: destination }, source: 'typed_command', rawText: commandText };
    }

    if (/^(show|open|start)\s+paul(?:'s)?\s+(?:journey|first\s+missionary\s+journey)$/.test(normalizedCommand)) {
      return { type: GEOGUIDE_INTENTS.walkGeoNarrative, slots: { geoNarrativeId: 'paul_first_missionary_journey' }, source: 'typed_command', rawText: commandText };
    }

    const explicitStudioMatch = normalizedCommand.match(/^(?:build|create)\s+(?:a\s+)?(?:journey|geonarrative)\s+(?:for|of|through|about)\s+(.+)$/);
    if (explicitStudioMatch) {
      return { type: GEOGUIDE_INTENTS.walkGeoNarrative, slots: { studioPrompt: explicitStudioMatch[1].trim() }, source: 'typed_command', rawText: commandText };
    }

    const studioResult = resolveGeoNarrativeStudioPrompt(normalizedCommand);
    if (studioResult.status === GEONARRATIVE_STUDIO_STATUS.supported) {
      return { type: GEOGUIDE_INTENTS.walkGeoNarrative, slots: { studioPrompt: normalizedCommand }, source: 'typed_command', rawText: commandText };
    }

    const languageMatch = normalizedCommand.match(/^(?:change|switch)\s+(?:to\s+)?(.+)$/);
    if (languageMatch) {
      return { type: GEOGUIDE_INTENTS.changeLanguage, slots: { language: languageMatch[1].trim() }, source: 'typed_command', rawText: commandText };
    }

    return null;
  };

  const applyGeoGuideAction = (guideResult) => {
    switch (guideResult.action?.type) {
      case GEOGUIDE_ACTION_TYPES.readNearMe:
        setReadingMode('read_near_me');
        requestLocationFollow();
        return 'Opening Read Near Me.';
      case GEOGUIDE_ACTION_TYPES.walkGeoNarrative: {
        const nextJourneyId = guideResult.action?.payload?.geoNarrativeId;
        if (nextJourneyId) walkTheWord.selectJourney(nextJourneyId);
        setReadingMode('walk_the_word');
        walkTheWord.start();
        return guideResult.message || 'I can build that journey from curated Scripture geography.';
      }
      case GEOGUIDE_ACTION_TYPES.explorePlace:
        setReadingMode(guideResult.action?.payload?.readingMode || 'explore_world');
        return guideResult.action?.payload?.placeType === 'world_placeholder' ? 'Opening Explore the World.' : 'Opening this place.';
      case GEOGUIDE_ACTION_TYPES.changeLanguage: {
        const languageCode = guideResult.action?.payload?.languageCode;
        if (languageCode === 'en') {
          setCountryCode('US');
          setMode('fixed');
          setDetectedCoordinates(null);
          setDetectedLocality(null);
          setLocationError('');
          return 'Switched to English.';
        }
        return 'Language found; place profile unchanged.';
      }
      default:
        return 'Try “read near me” or “walk to Bethlehem.”';
    }
  };

  const submitGeoGuideCommand = (event) => {
    event.preventDefault();
    if (!isGeoGuideExpanded) {
      openGeoGuide();
      return;
    }
    const intent = parseGeoGuideCommand(geoGuideCommand);
    if (!intent) {
      setGeoGuideResponse('Try “read near me” or “walk to Bethlehem.”');
      return;
    }

    const guideResult = geoGuide.resolve(intent);
    if (guideResult.action?.type === GEOGUIDE_ACTION_TYPES.fallback) {
      setGeoGuideResponse(guideResult.message || 'I can guide places and languages already bundled here.');
      return;
    }

    setGeoGuideResponse(applyGeoGuideAction(guideResult));
    setGeoGuideCommand('');
    setIsGeoGuideExpanded(false);
  };

  const renderPrimaryAction = () => {
    if (readingMode === 'read_near_me') {
      return <button type="button" onClick={requestLocationFollow}>Update Location</button>;
    }

    if (readingMode === 'explore_world') {
      return <button type="button" disabled aria-disabled="true">Coming soon</button>;
    }

    if (walkTheWord.isActive && walkTheWord.engine.canMoveNext && walkTheWord.isAutoWalking) {
      return <button type="button" onClick={walkTheWord.pauseAutoWalk}>Pause</button>;
    }

    if (walkTheWord.isActive) {
      return <button type="button" onClick={walkTheWord.engine.canMoveNext ? walkTheWord.startAutoWalk : walkTheWord.continue}>{walkTheWord.engine.canMoveNext ? 'Auto Walk' : 'Finish'}</button>;
    }

    return <button type="button" onClick={walkTheWord.start}>Begin</button>;
  };

  return (
    <main className="pageShell">
      <section className="topNav">
        <div className="brand"><span className="brandMark">✦</span> GeoAware Bible</div>
      </section>

      <section className="heroGrid">
        <div className="heroCopy">
          <h1>God's Word. Wherever you are.</h1>
          <div className="modeSwitch" aria-label="Scripture generation mode">
            <button type="button" className={mode === 'geo' ? 'active' : ''} onClick={requestLocationFollow}>Near me</button>
            <button type="button" className={mode === 'fixed' ? 'active' : ''} onClick={() => { setMode('fixed'); setLocationError(''); }}>Generative</button>
          </div>
          <form className={`geoGuideCommand ${isGeoGuideExpanded ? 'isExpanded' : ''}`} onSubmit={submitGeoGuideCommand} aria-label="GeoGuide typed command">
            {!isGeoGuideExpanded ? (
              <button type="button" className="geoGuideTrigger" onClick={openGeoGuide} aria-expanded="false" aria-controls="geoGuideCommandControls">
                Where shall we go today?
              </button>
            ) : (
              <div id="geoGuideCommandControls" className="geoGuideExpandedPanel">
                <label htmlFor="geoGuideCommandInput">Where shall we go today?</label>
                <div className="geoGuideInputRow">
                  <input
                    ref={geoGuideInputRef}
                    id="geoGuideCommandInput"
                    type="text"
                    value={geoGuideCommand}
                    onChange={(event) => setGeoGuideCommand(event.target.value)}
                    placeholder=""
                    autoComplete="off"
                  />
                  <button type="submit" aria-label="Follow GeoGuide command">Guide</button>
                  <button type="button" className="geoGuideCancel" onClick={closeGeoGuide} aria-label="Close GeoGuide">×</button>
                </div>
              </div>
            )}
            {geoGuideResponse ? <p aria-live="polite">{geoGuideResponse}</p> : null}
          </form>

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

        <div className="walkGlobeOverlay" aria-label="Current pilgrimage">
          <p className="walkKicker">{selectedReadingModeLabel}</p>
          {readingMode === 'walk_the_word' ? (
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
          ) : null}
          <div className="walkTextStack" aria-live="polite" aria-atomic="true">
            <strong>{readingMode === 'explore_world' ? 'A world atlas of Scripture' : locationLabel}</strong>
            <span>{displayedReference}</span>
          </div>
        </div>
      </section>
      <section className="readingModes" aria-label="Reading modes">
        <button type="button" className={readingMode === 'read_near_me' ? 'active' : ''} onClick={() => selectReadingMode('read_near_me')}>
          <span>Read Near Me</span>
          <small>{locationError || buildLocationLabel(profile, activeDetectedLocality)}</small>
        </button>
        <button type="button" className={readingMode === 'walk_the_word' ? 'active' : ''} onClick={() => selectReadingMode('walk_the_word')}>
          <span>Walk the Word</span>
          <small>{walkTheWord.journey?.title || 'GeoNarrative pilgrimage'}</small>
        </button>
        <button type="button" className={readingMode === 'explore_world' ? 'active' : ''} onClick={() => selectReadingMode('explore_world')}>
          <span>Explore the World</span>
          <small>Quiet atlas coming soon</small>
        </button>
      </section>

      <section className={`pilgrimageControls${readingMode === 'read_near_me' ? ' readNearMeControls' : ''}`} aria-label="Primary action">
        <div>
          <p>{readingMode === 'walk_the_word' ? walkTheWord.journey?.title : selectedReadingModeLabel}</p>
          <strong>{readingMode === 'walk_the_word' && walkWaypoint ? walkWaypoint.title : displayedReference}</strong>
        </div>
        {renderPrimaryAction()}
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

      <section className={`scriptureFlow ${isScriptureVisible ? 'isVisible' : 'isDissolving'}`} aria-label="Current Scripture" aria-live="polite" aria-atomic="true">
        <p className="scriptureReference">{scriptureTransition.reference}</p>
        <p className={`scriptureText ${scriptureTransition.className}`}>{scriptureTransition.text}</p>
        {scriptureTransition.summary ? (
          <details className="placeDisclosure">
            <summary>About this place</summary>
            <p>{scriptureTransition.summary}</p>
          </details>
        ) : null}
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
