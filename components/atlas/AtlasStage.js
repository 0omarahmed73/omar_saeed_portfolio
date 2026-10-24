'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AtlasFigure from './AtlasFigure';
import { D, atlas, ATLAS_SOURCE, ATLAS_LICENSE } from '@/lib/data';
import '@/app/atlas.css';

gsap.registerPlugin(ScrollTrigger);

// The sphere is split out so the first paint is the hero copy and Atlas; until it loads, a static gold ring shows.
const Orrery = dynamic(() => import('./Orrery'), {
  ssr: false,
  loading: () => <span className="at-orrery-fallback" aria-hidden="true" />,
});

// Real 3D hero: the statue and its armillary are one Three.js group with one transform.
const AtlasScene = dynamic(() => import('./AtlasScene'), {
  ssr: false,
  loading: () => <span className="at-orrery-fallback" aria-hidden="true" />,
});

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
// decan-style ticks along the night-sky arch
const ARCH_DOTS = [[42, 236, 2], [118, 183, 1.3], [204, 142, 2], [299, 113, 1.3], [398, 96, 2], [500, 90, 1.3], [602, 96, 2], [701, 113, 1.3], [796, 142, 2], [882, 183, 1.3], [958, 236, 2]];
// the hero starts as a medium morning blue (#547F9F) and deepens to the site's night navy (#101722) as you scroll
const DUSK = [84, 127, 159], NIGHT = [16, 23, 34];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export default function AtlasStage() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const cueRef = useRef(null);
  const atlasRef = useRef(null);
  const panelRef = useRef(null);
  const railRef = useRef(null);
  const layers = { glow: useRef(null), grain: useRef(null), arc: useRef(null), grid: useRef(null), niche: useRef(null), credit: useRef(null) };
  const stateRef = useRef({ p: 0, active: 0 });
  const [active, setActive] = useState(0);
  // 'pending' -> the 3D scene is loading; 'webgl' -> real 3D; 'fallback' -> the flat canvas armillary
  const [mode, setMode] = useState('pending');
  const modeRef = useRef('pending');
  // if the 3D scene never reports back (chunk or model failure), show the flat figure after a grace period
  useEffect(() => {
    const t = setTimeout(() => { if (modeRef.current === 'pending') onMode('fallback'); }, 9000);
    return () => clearTimeout(t);
  }, []);
  const onMode = (m) => {
    modeRef.current = m;
    // tell the splash screen the hero has finished initialising ('webgl' or 'fallback')
    window.__pantheonHero = { mode: m };
    window.dispatchEvent(new CustomEvent('pantheon:hero', { detail: { mode: m } }));
    setMode(m);
    const fig = atlasRef.current;
    if (!fig) return;
    if (m === 'webgl' || m === 'pending') { fig.style.opacity = '0'; fig.style.transform = 'none'; }
    else { fig.style.opacity = '1'; fig.style.transform = ''; }
  };

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
      stage.style.background = `rgb(${mix(DUSK, NIGHT, night)})`;
      const out = smooth(.03, .14, p);
      hero.style.opacity = 1 - out;
      hero.style.transform = window.innerWidth <= 900 ? `translateY(${-out * 40}px)` : `translateY(calc(-50% - ${out * 40}px))`;
      hero.style.pointerEvents = out > .7 ? 'none' : 'auto';
      hero.style.visibility = out >= 1 ? 'hidden' : 'visible';
      cue.style.opacity = 1 - smooth(0, .06, p);
      layers.glow.current.style.opacity = 1 - smooth(.06, .24, p);
      layers.niche.current.style.opacity = 1 - smooth(.08, .22, p);
      layers.credit.current.style.opacity = 1 - smooth(.02, .1, p);
      layers.arc.current.style.opacity = night; layers.grid.current.style.opacity = night;
      layers.grain.current.style.opacity = (1 - night * .6).toFixed(2);
      if (modeRef.current === 'webgl' || modeRef.current === 'pending') {
        // the 3D scene owns the statue's fade and the instrument's flight
        figure.style.opacity = '0';
        figure.style.transform = 'none';
      } else {
        figure.style.opacity = 1 - smooth(.08, .22, p);
        figure.style.transform = `translateY(${smooth(.1, .3, p) * 18}vh) scale(${1 + smooth(0, .3, p) * .06})`;
      }
      const show = smooth(.22, .3, p) * (1 - smooth(.995, 1, p)); // the last project stays readable while the stage scrolls away
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

  // Mouse-follow: the statue and its armillary turn as one group. Pointer values live in refs and are
  // written straight to the DOM, so a mouse move never triggers a React re-render. Touch pointers and
  // prefers-reduced-motion are excluded, and the effect fades out once the sky turns to night.
  const pointerRef = useRef({ x: 0, y: 0 });
  const sculptRef = useRef(null);
  useEffect(() => {
    const stage = stageRef.current, sculpt = sculptRef.current;
    if (!stage || !sculpt) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let raf = 0, running = false, wroteCss = false;

    // pivot the turn on the statue's own axis so it reads as a sculpture on a turntable
    const setOrigin = () => {
      const s = stage.getBoundingClientRect();
      const a = atlasRef.current && atlasRef.current.getBoundingClientRect();
      if (!a) return;
      sculpt.style.transformOrigin = `${Math.round(a.left - s.left + a.width * .5)}px ${Math.round(a.top - s.top + a.height * .52)}px`;
    };
    setOrigin();
    const ro = new ResizeObserver(setOrigin);
    ro.observe(stage);

    const tick = () => {
      cur.x += (target.x - cur.x) * .07;
      cur.y += (target.y - cur.y) * .07;
      const fade = 1 - smooth(.05, .18, stateRef.current.p);
      const yaw = cur.x * 7 * fade, pitch = cur.y * -3.5 * fade;
      // in 3D the scene rotates its own group; the flat fallback uses the shared CSS transform
      pointerRef.current.x = cur.x * fade;
      pointerRef.current.y = cur.y * fade;
      if (modeRef.current === 'webgl') {
        if (wroteCss) { sculpt.style.transform = 'none'; wroteCss = false; }
      } else {
        sculpt.style.transform = `rotateY(${yaw.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg)`;
        wroteCss = true;
      }
      if (Math.abs(target.x - cur.x) > .0015 || Math.abs(target.y - cur.y) > .0015) raf = requestAnimationFrame(tick);
      else { running = false; raf = 0; }
    };
    const wake = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const s = stage.getBoundingClientRect();
      target.x = clamp(((e.clientX - s.left) / s.width) * 2 - 1, -1, 1);
      target.y = clamp(((e.clientY - s.top) / s.height) * 2 - 1, -1, 1);
      wake();
    };
    const onLeave = () => { target.x = 0; target.y = 0; wake(); };
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Position of each featured project along the pinned track, as a fraction of the scrollable distance.
  const stop = (i) => .3 + .7 * (i + .5) / featured.length;

  const f = featured[active];
  return (
    <section id="overview" ref={trackRef} className="at-track at-scope" aria-label="Introduction and featured work">
      <div ref={stageRef} className="at-stage">
        <a className="at-skip" href="#projects">Skip to all projects</a>
        <div ref={layers.glow} className="at-glow" aria-hidden="true" />
        <div ref={layers.grain} className="at-grain" aria-hidden="true" />
        <div ref={layers.arc} className="at-skyarc" aria-hidden="true">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M-20 300 C200 20 800 20 1020 300" fill="none" stroke="#B9975B" strokeOpacity=".26" strokeWidth="1" vectorEffect="non-scaling-stroke" />{ARCH_DOTS.map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#B9975B" fillOpacity=".75" />)}</svg>
        </div>
        <div ref={layers.grid} className="at-grid" aria-hidden="true" />

        <div ref={layers.niche} className="at-niche" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" strokeLinecap="round"><path d="M5 100 L12 26 M95 100 L88 26" stroke="#F0E9DC" strokeOpacity=".24" strokeWidth="1" vectorEffect="non-scaling-stroke" /><path d="M9 26 C28 13 72 13 91 26" stroke="#DCC187" strokeOpacity=".6" strokeWidth="1" vectorEffect="non-scaling-stroke" /></g></svg>
        </div>

        {/* statue and armillary share one rotation group — they can never separate */}
        <div className="at-sculpt">
          <div ref={sculptRef} className="at-sculpt-in">
            {mode === 'fallback'
              ? <Orrery stateRef={stateRef} atlasRef={atlasRef} featured={featured} />
              : <AtlasScene stateRef={stateRef} atlasRef={atlasRef} featured={featured} pointerRef={pointerRef} onMode={onMode} />}
            <div ref={atlasRef} className="at-atlas"><AtlasFigure /></div>
          </div>
        </div>

        <div ref={heroRef} className="at-hero">
          <h1>{atlas.headline[0]}<br className="at-br" /> <em>{atlas.headline[1]}</em> {atlas.headline[2]}<br className="at-br" /> {atlas.headline[3]}</h1>
          <p>{atlas.sub}</p>
          <div className="at-cta">
            <a className="at-btn" href="#projects">{atlas.cta[0]}</a>
            <a className="at-btn at-ghost" href="/cv.pdf" download>{atlas.cta[1]}</a>
          </div>
        </div>
        <div ref={cueRef} className="at-cue"><i />{atlas.cue}</div>
        <p ref={layers.credit} className="at-credit">3D model: <a href={ATLAS_SOURCE} target="_blank" rel="noopener noreferrer">&ldquo;Atlas holding the Earth&rdquo; by Wabbaboy</a>, <a href={ATLAS_LICENSE} target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</p>

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
