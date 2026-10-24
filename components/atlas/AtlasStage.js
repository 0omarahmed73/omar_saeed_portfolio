'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AtlasFigure from './AtlasFigure';
import { D, atlas } from '@/lib/data';
import '@/app/atlas.css';

gsap.registerPlugin(ScrollTrigger);

// The sphere is split out so the first paint is the hero copy and Atlas; until it loads, a static gold ring shows.
const Orrery = dynamic(() => import('./Orrery'), {
  ssr: false,
  loading: () => <span className="at-orrery-fallback" aria-hidden="true" />,
});

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const PAPYRUS = [243, 239, 229], OBSIDIAN = [16, 23, 37];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export default function AtlasStage() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const cueRef = useRef(null);
  const atlasRef = useRef(null);
  const panelRef = useRef(null);
  const railRef = useRef(null);
  const stateRef = useRef({ p: 0, active: 0 });
  const [active, setActive] = useState(0);

  // Featured projects come from lib/data.js, so the panel always matches the project list.
  const featured = useMemo(() => atlas.featured.map((f, i) => {
    const row = D.en.projects.find(p => p[0] === f.name);
    return { ...f, n: ROMAN[i], title: row[0], client: row[1], text: row[2], tags: row[3], category: row[5], url: row[6], src: row[7] };
  }), []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = stageRef.current, hero = heroRef.current, cue = cueRef.current, figure = atlasRef.current;
    const panel = panelRef.current, rail = railRef.current;
    let lastActive = 0;

    const apply = (p) => {
      if (reduce) p = 0; // reduced motion: static hero, no pinned sequence
      stateRef.current.p = p;
      const night = smooth(.1, .26, p);
      stage.style.background = `rgb(${mix(PAPYRUS, OBSIDIAN, night)})`;
      stage.style.color = night > .5 ? '#efe9da' : '#1a1f2c';
      const out = smooth(.03, .14, p);
      hero.style.opacity = 1 - out;
      hero.style.transform = window.innerWidth <= 900 ? `translateY(${-out * 40}px)` : `translateY(calc(-50% - ${out * 40}px))`;
      hero.style.pointerEvents = out > .7 ? 'none' : 'auto';
      hero.style.visibility = out >= 1 ? 'hidden' : 'visible';
      cue.style.opacity = 1 - smooth(0, .06, p);
      figure.style.opacity = 1 - smooth(.08, .22, p);
      figure.style.transform = `translateY(${smooth(.1, .3, p) * 18}vh) scale(${1 + smooth(0, .3, p) * .06})`;
      const show = smooth(.22, .3, p) * (1 - smooth(.97, 1, p));
      const vis = show > .05 ? 'visible' : 'hidden';
      panel.style.opacity = show; rail.style.opacity = show;
      panel.style.visibility = vis; rail.style.visibility = vis;
      panel.style.pointerEvents = rail.style.pointerEvents = show > .5 ? 'auto' : 'none';
      const idx = Math.min(featured.length - 1, Math.floor(clamp((p - .3) / .7) * featured.length));
      stateRef.current.active = idx;
      if (idx !== lastActive) { lastActive = idx; setActive(idx); }
    };

    apply(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: trackRef.current, start: 'top top', end: 'bottom bottom',
        onUpdate: self => apply(self.progress), onRefresh: self => apply(self.progress),
      });
    }, trackRef);
    return () => ctx.revert();
  }, [featured]);

  // Position of each featured project along the pinned track, as a fraction of the scrollable distance.
  const stop = (i) => .3 + .7 * (i + .5) / featured.length;

  const f = featured[active];
  return (
    <section id="overview" ref={trackRef} className="at-track at-scope" aria-label="Introduction and featured work">
      <div ref={stageRef} className="at-stage">
        <a className="at-skip" href="#projects">Skip to all projects</a>
        <Orrery stateRef={stateRef} atlasRef={atlasRef} featured={featured} />

        <div ref={atlasRef} className="at-atlas"><AtlasFigure /></div>

        <div ref={heroRef} className="at-hero">
          <h1>{atlas.headline[0]}<br className="at-br" /> <em>{atlas.headline[1]}</em> {atlas.headline[2]}<br className="at-br" /> {atlas.headline[3]}</h1>
          <p>{atlas.sub}</p>
          <div className="at-cta">
            <a className="at-btn" href="#projects">{atlas.cta[0]}</a>
            <a className="at-btn at-ghost" href="/cv.pdf" download>{atlas.cta[1]}</a>
          </div>
        </div>
        <div ref={cueRef} className="at-cue"><i />{atlas.cue}</div>

        <article ref={panelRef} className="at-panel" aria-live="polite" aria-label="Featured project">
          <div className="at-idx"><span>{f.n}</span><i /><span>{f.category}</span></div>
          <h2>{f.title}</h2>
          <div className="at-client">{f.client}</div>
          <p className="at-role">{f.text}</p>
          <div className="at-tags">{f.tags.map(t => <span key={t}>{t}</span>)}</div>
          <div className="at-links">
            {f.url && <a className="at-live" href={f.url} target="_blank" rel="noopener noreferrer">Visit live site</a>}
            {f.src && <a className="at-live" href={f.src} target="_blank" rel="noopener noreferrer">Source code</a>}
          </div>
        </article>
        <nav ref={railRef} className="at-rail" aria-label="Featured projects">
          {featured.map((p, i) => (
            <a key={p.name} href={`#featured-${i}`} className={i === active ? 'on' : ''} aria-current={i === active ? 'true' : undefined}>
              <span>{p.title.split(' ')[0]}</span><i />
            </a>
          ))}
        </nav>
      </div>
      {featured.map((p, i) => <span key={p.name} id={`featured-${i}`} className="at-mark" style={{ top: `calc((100% - 100vh) * ${stop(i)})` }} aria-hidden="true" />)}
    </section>
  );
}
