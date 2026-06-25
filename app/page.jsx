'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Globe2, Languages, MapPin, Plane } from 'lucide-react';
import { languageProfiles } from '../src/data/languageProfiles.js';
import { getTranslation } from '../src/data/translations.js';

const journeyStats = [
  ['Countries', '6'],
  ['Languages', '11'],
  ['Mode', 'Geo']
];

export default function Home() {
  const [countryCode, setCountryCode] = useState('US');
  const [mode, setMode] = useState('geo');
  const [arrivalStep, setArrivalStep] = useState('ready');
  const profile = languageProfiles[countryCode] || languageProfiles.US;
  const activeTranslation = useMemo(() => (
    mode === 'fixed' ? getTranslation('web') : getTranslation(profile.translationId)
  ), [mode, profile.translationId]);
  const alternateLanguages = useMemo(() => (
    [...new Set(profile.alternates || [])]
      .filter((language) => language !== profile.primaryLanguage)
      .slice(0, 2)
  ), [profile.alternates, profile.primaryLanguage]);
  const countries = Object.entries(languageProfiles);
  const locationLabel = [profile.city, profile.state || profile.region].filter(Boolean).join(', ') || profile.country || 'Location available';
  const earthPosition = {
    '--focus-x': `${profile.coordinates.x}%`,
    '--focus-y': `${profile.coordinates.y}%`,
    '--earth-turn-x': `${(50 - profile.coordinates.y) * 0.16}deg`,
    '--earth-turn-y': `${(profile.coordinates.x - 50) * 0.2}deg`
  };
  const arrivalMessage = arrivalStep === 'finding'
    ? 'Finding your place...'
    : arrivalStep === 'recognized'
      ? 'Earth recognized'
      : arrivalStep === 'preparing'
        ? `Preparing Scripture for ${profile.city}, ${profile.country}`
        : `Scripture ready in ${mode === 'fixed' ? 'English' : profile.primaryLanguage}`;

  useEffect(() => {
    setArrivalStep('finding');
    const timers = [
      setTimeout(() => setArrivalStep('recognized'), 260),
      setTimeout(() => setArrivalStep('preparing'), 520),
      setTimeout(() => setArrivalStep('ready'), 840)
    ];

    return () => timers.forEach(clearTimeout);
  }, [countryCode]);

  return (
    <main className="pageShell" style={earthPosition}>
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

        <div className="earthStage" aria-label="Interactive world preview">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="earthWrapper">
            <div className="earth" aria-live="off">
              <div className="atmosphere" />
              <div className="cloudBand" />
              <div className="terminator" />
              <div className="earthShade" />
              <div className="latitude latOne" />
              <div className="latitude latTwo" />
              <div className="latitude latThree" />
              <div className="longitude lonOne" />
              <div className="longitude lonTwo" />
              <div className="beacon" aria-label={`${profile.country} signal`}>
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className={`locationCard ${arrivalStep !== 'ready' ? 'arriving' : ''}`}>
          <h2><span aria-hidden="true">{profile.flag}</span> {locationLabel}</h2>
          <small aria-live="polite" aria-atomic="true">{arrivalStep === 'ready' ? 'Scripture ready' : arrivalMessage}</small>
        </div>
      </section>

      <section className="countryRail" aria-label="Country quick switcher">
        {countries.map(([code, item]) => (
          <button key={code} className={countryCode === code ? 'selected' : ''} onClick={() => setCountryCode(code)}>
            <span aria-hidden="true">{item.flag}</span>
            <strong>{item.languageCode?.toUpperCase() || item.primaryLanguage.slice(0, 2).toUpperCase()}</strong>
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
