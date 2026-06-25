'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Globe2, Languages, MapPin, Plane } from 'lucide-react';
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

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3;
}

function resolveEarthCamera(profile) {
  const coordinates = profile.coordinates || languageProfiles.US.coordinates;
  return {
    coordinates,
    rotation: rotationForGeoCoordinate(coordinates)
  };
}

function interpolateCamera(from, to, progress) {
  const eased = easeOutCubic(progress);
  const lerp = (start, end) => start + (end - start) * eased;

  return {
    coordinates: {
      latitude: lerp(from.coordinates.latitude, to.coordinates.latitude),
      longitude: lerp(from.coordinates.longitude, to.coordinates.longitude)
    },
    rotation: {
      x: lerp(from.rotation.x, to.rotation.x),
      y: lerp(from.rotation.y, to.rotation.y)
    }
  };
}

export default function Home() {
  const [countryCode, setCountryCode] = useState('US');
  const [mode, setMode] = useState('geo');
  const [arrivalStep, setArrivalStep] = useState('ready');
  const profile = languageProfiles[countryCode] || languageProfiles.US;
  const targetEarthCamera = useMemo(() => resolveEarthCamera(profile), [profile]);
  const animationFrameRef = useRef(null);
  const cameraRef = useRef(targetEarthCamera);
  const [earthCamera, setEarthCamera] = useState(targetEarthCamera);
  const activeTranslation = useMemo(() => (
    mode === 'fixed' ? getTranslation('web') : getTranslation(profile.translationId)
  ), [mode, profile.translationId]);
  const alternateLanguages = useMemo(() => (
    [...new Set(profile.alternates || [])]
      .filter((language) => language !== profile.primaryLanguage)
      .slice(0, 2)
  ), [profile.alternates, profile.primaryLanguage]);
  const countries = Object.entries(languageProfiles);
  const locationLabel = [profile.city, profile.state].filter(Boolean).join(', ') || profile.country || 'Location available';
  const arrivalMessage = arrivalStep === 'finding'
    ? `Finding ${profile.country}...`
    : arrivalStep === 'recognized'
      ? `${profile.flag} ${locationLabel} recognized`
      : arrivalStep === 'preparing'
        ? `Preparing Scripture for ${profile.city}, ${profile.country}`
        : `Scripture ready in ${mode === 'fixed' ? 'English' : profile.primaryLanguage}`;

  useEffect(() => {
    setArrivalStep('finding');
    const timers = [
      setTimeout(() => setArrivalStep('recognized'), ARRIVAL_TIMING.recognized),
      setTimeout(() => setArrivalStep('preparing'), ARRIVAL_TIMING.preparing),
      setTimeout(() => setArrivalStep('ready'), ARRIVAL_TIMING.ready)
    ];

    return () => timers.forEach(clearTimeout);
  }, [countryCode]);

  useEffect(() => {
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);

    const startedAt = performance.now();
    const startCamera = cameraRef.current;

    const animateFocus = (now) => {
      const progress = Math.min(1, (now - startedAt) / ARRIVAL_TIMING.ready);
      const nextCamera = interpolateCamera(startCamera, targetEarthCamera, progress);
      cameraRef.current = nextCamera;
      setEarthCamera(nextCamera);

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateFocus);
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(animateFocus);

    return () => {
      if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetEarthCamera]);

  return (
    <main className="pageShell">
      <section className="topNav">
        <div className="brand"><span className="brandMark">✦</span> GeoAware Bible</div>
      </section>

      <section className="heroGrid">
        <div className="heroCopy">
          <h1>God's Word. Wherever you are.</h1>
          <div className="modeSwitch" aria-label="Geo mode selector">
            <button className={mode === 'geo' ? 'active' : ''} onClick={() => setMode('geo')}><MapPin size={16} /> Follow My Location</button>
            <button className={mode === 'fixed' ? 'active' : ''} onClick={() => setMode('fixed')}><BookOpen size={16} /> Stay In English</button>
          </div>
        </div>

        <ProjectEarthRenderer
          coordinates={earthCamera.coordinates}
          rotation={earthCamera.rotation}
          signalLabel={`${profile.country} signal`}
        />

        <div className={`locationCard ${arrivalStep !== 'ready' ? 'arriving' : ''}`}>
          <h2><span aria-hidden="true">{profile.flag}</span> {locationLabel}</h2>
          <small aria-live="polite" aria-atomic="true">{arrivalStep === 'ready' ? 'Scripture ready' : arrivalMessage}</small>
        </div>
      </section>

      <section className="countryRail" aria-label="Country quick switcher">
        {countries.map(([code, item]) => (
          <button key={code} className={countryCode === code ? 'selected' : ''} onClick={() => setCountryCode(code)} aria-label={`${item.country}, ${item.primaryLanguage}`}>
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
            <span className="metadataBadge">Open-License Scripture Engine</span>
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
            <p>{profile.prayer}</p>
          </div>
        </aside>
      </section>

      <section className="whyPanel glassPanel">
        <div className="featureIcon"><Globe2 /></div>
        <div>
          <p className="eyebrow">Why GeoAware Bible</p>
          <h3>Scripture follows place.</h3>
          <p>The Living Earth quietly connects location, language, and open-license Scripture while keeping the technology invisible.</p>
        </div>
      </section>
    </main>
  );
}
