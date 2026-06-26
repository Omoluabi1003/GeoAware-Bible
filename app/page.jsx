'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Globe2, Languages, MapPin, Plane } from 'lucide-react';
import { getGeoContext } from '../src/data/geoContext.js';
import { buildGeoScriptureContext } from '../src/data/geoscriptureEngine.js';
import { languageProfiles } from '../src/data/languageProfiles.js';
import { getTranslation } from '../src/data/translations.js';
import ProjectEarthRenderer from '../src/renderers/project-earth/ProjectEarthRenderer.jsx';
import { rotationForGeoCoordinate } from '../src/renderers/project-earth/geoCoordinateEngine.js';

const journeyStats = [
  ['Countries', '6'],
  ['Languages', '11'],
  ['Mode', 'Geo']
];

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

export default function Home() {
  const [countryCode, setCountryCode] = useState('US');
  const [mode, setMode] = useState('geo');
  const [arrivalStep, setArrivalStep] = useState('ready');
  const [detectedCoordinates, setDetectedCoordinates] = useState(null);
  const [detectedLocality, setDetectedLocality] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationRequestKey, setLocationRequestKey] = useState(0);
  const profile = languageProfiles[countryCode] || languageProfiles.US;
  const GeoContext = useMemo(() => getGeoContext(countryCode), [countryCode]);
  const activeDetectedCoordinates = mode === 'geo' ? detectedCoordinates : null;
  const activeDetectedLocality = mode === 'geo' ? detectedLocality : null;
  const targetEarthCamera = useMemo(() => resolveEarthCamera(profile, activeDetectedCoordinates), [profile, activeDetectedCoordinates]);
  const animationFrameRef = useRef(null);
  const cameraRef = useRef(targetEarthCamera);
  const [earthCamera, setEarthCamera] = useState(targetEarthCamera);
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false);
  const reducedMotion = useReducedMotion();
  const activeTranslation = useMemo(() => (
    mode === 'fixed' ? getTranslation('web') : getTranslation(profile.translationId)
  ), [mode, profile.translationId]);
  const geoScripture = useMemo(() => buildGeoScriptureContext({
    latitude: activeDetectedCoordinates?.latitude ?? profile.coordinates?.latitude,
    longitude: activeDetectedCoordinates?.longitude ?? profile.coordinates?.longitude,
    country: activeDetectedLocality?.country || GeoContext.country,
    region: activeDetectedLocality?.region || GeoContext.region,
    locality: activeDetectedLocality?.city || profile.city,
    language: activeTranslation.language,
    date: new Date(),
    currentScripture: activeTranslation
  }), [activeDetectedCoordinates, activeDetectedLocality, activeTranslation, GeoContext, profile]);
  const alternateLanguages = useMemo(() => (
    [...new Set(profile.alternates || [])]
      .filter((language) => language !== profile.primaryLanguage)
      .slice(0, 2)
  ), [profile.alternates, profile.primaryLanguage]);
  const countries = Object.entries(languageProfiles);
  const locationLabel = buildLocationLabel(profile, activeDetectedLocality);
  const arrivalMessage = arrivalStep === 'finding'
    ? `Finding ${profile.country}...`
    : arrivalStep === 'recognized'
      ? `${profile.flag} ${locationLabel} recognized`
      : arrivalStep === 'preparing'
        ? `Preparing Scripture for ${locationLabel}`
        : `Scripture ready in ${mode === 'fixed' ? 'English' : profile.primaryLanguage}`;

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
    if (mode !== 'geo') return undefined;

    const controller = new AbortController();
    let isActive = true;

    setLocationError('');

    getPreciseBrowserLocation()
      .then(async (coordinates) => {
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
        setLocationError(error?.code === 1 ? 'Location permission denied; using country profile fallback.' : 'Precise location unavailable; using country profile fallback.');
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [mode, locationRequestKey]);

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

  return (
    <main className="pageShell">
      <section className="topNav">
        <div className="brand"><span className="brandMark">✦</span> GeoAware Bible</div>
      </section>

      <section className="heroGrid">
        <div className="heroCopy">
          <h1>God's Word. Wherever you are.</h1>
          <div className="modeSwitch" aria-label="Geo mode selector">
            <button className={mode === 'geo' ? 'active' : ''} onClick={() => { setMode('geo'); setLocationRequestKey((key) => key + 1); }}><MapPin size={16} /> Follow My Location</button>
            <button className={mode === 'fixed' ? 'active' : ''} onClick={() => setMode('fixed')}><BookOpen size={16} /> Stay In English</button>
          </div>
        </div>

        <ProjectEarthRenderer
          coordinates={earthCamera.coordinates}
          rotation={earthCamera.rotation}
          signalLabel={`${activeDetectedLocality?.country || GeoContext.country} signal`}
          activeLocationLabel={locationLabel}
          activeCountryHighlight={profile.countryHighlight}
          isTransitioning={isCameraTransitioning}
        />

        <div className={`locationCard ${arrivalStep !== 'ready' ? 'arriving' : ''}`}>
          <h2><span aria-hidden="true">{profile.flag}</span> {locationLabel}</h2>
          <small aria-live="polite" aria-atomic="true">{locationError || (arrivalStep === 'ready' ? 'Scripture ready' : arrivalMessage)}</small>
        </div>
      </section>

      <section className="countryRail" aria-label="Country quick switcher">
        {countries.map(([code, item]) => (
          <button key={code} className={countryCode === code ? 'selected' : ''} onClick={() => { setCountryCode(code); setDetectedCoordinates(null); setDetectedLocality(null); setLocationError(''); }} aria-label={`${item.country}, ${item.primaryLanguage}`}>
            <span aria-hidden="true">{item.flag}</span>
            <strong>{item.languageCode?.toUpperCase() || (item.primaryLanguage?.slice(0, 2) || '').toUpperCase()}</strong>
            <small>{item.primaryLanguage}</small>
          </button>
        ))}
      </section>

      <section className="contentGrid">
        <article className={`readerPanel glassPanel ${arrivalStep !== 'ready' ? 'arriving' : ''}`}>
          <div className="panelHeader">
            <p className="eyebrow"><Languages size={15} /> Scripture Reader</p>
            <span>{activeTranslation.language}</span>
          </div>
          <div className="verseBox">
            <small>{activeTranslation.reference}</small>
            <p>{activeTranslation.text}</p>
          </div>
          <div className="readerMeta">
            <strong>{activeTranslation.name}</strong>
            <span>{activeTranslation.license}</span>
            <span>{activeTranslation.licenseSource}</span>
            <span className="metadataBadge">Open-License Scripture Engine</span>
            <span className="metadataBadge">GeoScripture Engine</span>
          </div>
          <div className="languageChips" aria-label="Available local languages">
            <span>{profile.primaryLanguage}</span>
            {alternateLanguages.map((language) => <span key={language}>{language}</span>)}
          </div>
        </article>

        <aside className="passport glassPanel">
          <p className="eyebrow"><Plane size={15} /> Scripture Passport</p>
          <h2>My Scripture Journey</h2>
          <div className="statGrid">
            {journeyStats.map(([label, value]) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
          <div className="prayerCard">
            <small>GeoPrayer</small>
            <p>{geoScripture.PrayerPrompt}</p>
          </div>
        </aside>
      </section>

      <section className="whyPanel glassPanel">
        <div className="featureIcon"><Globe2 /></div>
        <div>
          <p className="eyebrow">Why GeoAware Bible</p>
          <h3>Scripture follows place.</h3>
          <p>{geoScripture.GeoInsight}</p>
        </div>
      </section>
    </main>
  );
}
