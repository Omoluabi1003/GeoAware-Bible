'use client';

import { useMemo, useState } from 'react';
import { Globe2, MapPin, Languages, ShieldCheck } from 'lucide-react';
import { languageProfiles } from '../src/data/languageProfiles.js';
import { getTranslation } from '../src/data/translations.js';

export default function Home() {
  const [countryCode, setCountryCode] = useState('US');
  const profile = languageProfiles[countryCode] || languageProfiles.US;
  const translation = useMemo(() => getTranslation(profile.translationId), [profile]);

  return (
    <main className="shell">
      <section className="hero">
        <div className="badge"><Globe2 size={16} /> GeoAware Bible MVP</div>
        <h1>God's Word, in the language of the land beneath your feet.</h1>
        <p>
          GeoAware Bible recommends Scripture language by location, supports manual override,
          and prepares the foundation for open-license Bible translation packs.
        </p>
        <div className="heroActions">
          <a href="#reader" className="primaryAction">Open Reader</a>
          <a href="#architecture" className="secondaryAction">View Engine</a>
        </div>
      </section>

      <section id="reader" className="panel readerPanel">
        <div>
          <p className="eyebrow"><MapPin size={15} /> Location Profile</p>
          <h2>{profile.country}</h2>
          <p>{profile.welcome}</p>
        </div>

        <label className="selectorLabel" htmlFor="country">Simulate landing location</label>
        <select id="country" value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
          {Object.entries(languageProfiles).map(([code, item]) => (
            <option key={code} value={code}>{item.country}</option>
          ))}
        </select>

        <div className="translationCard">
          <p className="eyebrow"><Languages size={15} /> Recommended Translation</p>
          <h3>{translation.name}</h3>
          <p className="meta">Language: {translation.language} | License: {translation.license}</p>
          <h4>{translation.reference}</h4>
          <p className="verse">{translation.text}</p>
        </div>
      </section>

      <section id="architecture" className="grid">
        <Feature title="Geo Language Engine" icon={<MapPin />} text="Maps country and region profiles to dominant local languages and translation recommendations." />
        <Feature title="Open Translation Registry" icon={<ShieldCheck />} text="Keeps translation metadata, license notes, and Scripture sources separated from the reading interface." />
        <Feature title="Manual Override" icon={<Languages />} text="Allows users to choose their preferred Scripture language regardless of current location." />
      </section>
    </main>
  );
}

function Feature({ title, text, icon }) {
  return (
    <article className="featureCard">
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
