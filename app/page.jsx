'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Compass, Globe2, Languages, MapPin, Plane, ShieldCheck, Sparkles } from 'lucide-react';
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
  const profile = languageProfiles[countryCode] || languageProfiles.US;
  const translation = useMemo(() => getTranslation(profile.translationId), [profile]);
  const countries = Object.entries(languageProfiles);
  const locationLabel = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.country || 'Location available';

  return (
    <main className="pageShell">
      <section className="topNav">
        <div className="brand"><span className="brandMark">✦</span> GeoAware Bible</div>
        <div className="navPill">Open-License Scripture Engine</div>
      </section>

      <section className="heroGrid">
        <div className="heroCopy">
          <div className="badge"><Sparkles size={16} /> Living Earth Scripture Experience</div>
          <h1>God's Word. Wherever you are.</h1>
          <p className="lede">
            GeoAware Bible turns the world into the interface. Land in a place, discover the language of the people, and open Scripture with local context, dignity, and clarity.
          </p>
          <div className="modeSwitch" aria-label="Geo mode selector">
            <button className={mode === 'geo' ? 'active' : ''} onClick={() => setMode('geo')}><MapPin size={16} /> Follow My Location</button>
            <button className={mode === 'fixed' ? 'active' : ''} onClick={() => setMode('fixed')}><BookOpen size={16} /> Stay In English</button>
          </div>
          <div className="statusStrip">
            <span>Location confirmed</span>
            <strong aria-live="polite" aria-atomic="true">{profile.flag} {locationLabel}</strong>
            <span>Preparing Scripture in {mode === 'fixed' ? 'English' : profile.primaryLanguage}</span>
          </div>
        </div>

        <div className="earthStage" aria-label="Interactive world preview">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="earth">
            <div className="atmosphere" />
            <div className="cloudBand" />
            <div className="terminator" />
            <div className="earthShade" />
            <div className="latitude latOne" />
            <div className="latitude latTwo" />
            <div className="latitude latThree" />
            <div className="longitude lonOne" />
            <div className="longitude lonTwo" />
            <div className="land landOne" />
            <div className="land landTwo" />
            <div className="land landThree" />
            <div className="beacon" style={{ left: `${profile.coordinates.x}%`, top: `${profile.coordinates.y}%` }} aria-label={`${profile.country} signal`}>
              <span />
            </div>
          </div>
          <div className="locationCard">
            <p>{profile.region}</p>
            <h2>{profile.flag} {profile.country}</h2>
            <small>{profile.country} · {profile.primaryLanguage} recommended</small>
          </div>
        </div>
      </section>

      <section className="countryRail" aria-label="Country quick switcher">
        {countries.map(([code, item]) => (
          <button key={code} className={countryCode === code ? 'selected' : ''} onClick={() => setCountryCode(code)}>
            <span>{item.flag}</span>
            <strong>{item.country}</strong>
            <small><span>{item.country}</span><em>·</em><span>{item.primaryLanguage}</span></small>
          </button>
        ))}
      </section>

      <section className="contentGrid">
        <article className="readerPanel glassPanel">
          <div className="panelHeader">
            <p className="eyebrow"><Languages size={15} /> Recommended Translation</p>
            <span>{translation.license}</span>
          </div>
          <h2>{translation.name}</h2>
          <p className="meta">Language: {mode === 'fixed' ? 'English' : translation.language}</p>
          <div className="verseBox">
            <small>{translation.reference}</small>
            <p>{mode === 'fixed' ? getTranslation('web').text : translation.text}</p>
          </div>
          <div className="languageChips">
            <span>{profile.primaryLanguage}</span>
            {(profile.alternates || []).map((language) => <span key={language}>{language}</span>)}
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

      <section className="featureGrid">
        <Feature title="Living Earth Interface" icon={<Globe2 />} text="The world becomes the navigation layer for Scripture, language, and cultural context." />
        <Feature title="Geo Language Engine" icon={<Compass />} text="Country profiles recommend local Scripture languages while preserving manual user control." />
        <Feature title="License-Safe Registry" icon={<ShieldCheck />} text="Translation metadata stays separate, protecting the product from accidental copyrighted text usage." />
      </section>
    </main>
  );
}

function Feature({ title, text, icon }) {
  return (
    <article className="featureCard glassPanel">
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
