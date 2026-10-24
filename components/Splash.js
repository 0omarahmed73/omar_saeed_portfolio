'use client';

// Splash: an Eye-of-Horus-and-orrery emblem drawn in inline SVG, shown while the Atlas hero genuinely initialises.
// It is a real gate, not a timer: it leaves as soon as (a) the web fonts are ready and (b) the 3D hero has reported
// either 'webgl' (model built) or 'fallback' (flat figure took over) via the 'pantheon:hero' event from AtlasStage.
// The only measurable progress is the Atlas GLB download ('pantheon:progress'); when the browser cannot report a
// total size the bar stays indeterminate and no percentage is ever shown. A hard timeout, a Skip button and Escape
// make sure nobody can be trapped, and a CSS-only failsafe hides it even if JavaScript never runs.

import { useEffect, useRef, useState } from 'react';
import '@/app/splash.css';

const TIMEOUT_MS = 7000;
const LEAVE_MS = 720;
// The emblem takes about 2 s to draw. On a warm cache the hero is ready in well under a second, so without this the
// splash would flash away before the artwork is seen. It is a deliberate design minimum (skipped for reduced motion,
// Skip and Escape), and the real readiness checks below still decide when it is allowed to leave.
const MIN_MS = 3600;
let finished = false; // module scope: never replay within one page lifetime (StrictMode, remounts)

const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2, major = i % 9 === 0, mid = i % 3 === 0;
  const r1 = 104, r2 = major ? 93 : mid ? 97 : 100;
  return [120 + Math.cos(a) * r1, 120 + Math.sin(a) * r1, 120 + Math.cos(a) * r2, 120 + Math.sin(a) * r2, i];
});
const STARS = [[34, 58, 1.1], [58, 30, 1.5], [188, 34, 1.2], [210, 70, 1.6], [26, 150, 1.4], [214, 156, 1.1], [64, 214, 1.3], [176, 212, 1.6], [120, 16, 1.2], [18, 104, 1.0], [226, 118, 1.2], [102, 226, 1.0]];

export default function Splash() {
  const [phase, setPhase] = useState('on'); // 'on' | 'leaving' | 'gone'
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const statusRef = useRef(null);
  const srRef = useRef(null);
  const skipRef = useRef(null);

  useEffect(() => {
    if (finished) { setPhase('gone'); return; }
    const root = rootRef.current;
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fontsOk = false, heroOk = false, minOk = reduce, left = false, timeout = 0, leaveTimer = 0, minTimer = 0;

    // block background scrolling and background focus only while the splash is up
    html.classList.add('splash-lock');
    const blocked = Array.from(document.querySelectorAll('.site-shell > *')).filter((el) => el !== root && !el.hasAttribute('inert'));
    blocked.forEach((el) => el.setAttribute('inert', ''));
    const stop = (e) => e.stopPropagation(); // keeps Lenis (listening on window) from scrolling the page behind
    root.addEventListener('wheel', stop, { passive: true });
    root.addEventListener('touchmove', stop, { passive: true });
    const unlock = () => {
      html.classList.remove('splash-lock');
      blocked.forEach((el) => el.removeAttribute('inert'));
    };

    const setStatus = (text) => { if (statusRef.current && statusRef.current.textContent !== text) statusRef.current.textContent = text; };
    const setBar = (frac) => {
      const b = barRef.current; if (!b) return;
      b.parentElement.classList.remove('is-indet');
      b.style.transform = `scaleX(${Math.max(0, Math.min(1, frac)).toFixed(3)})`;
    };

    const leave = (reason) => {
      if (left) return;
      left = true;
      clearTimeout(timeout); clearTimeout(minTimer);
      if (reason === 'ready' && barRef.current) setBar(1);
      if (srRef.current) srRef.current.textContent = 'Portfolio ready';
      unlock(); // scrolling is restored the moment the exit starts, not after the fade
      setPhase('leaving');
      leaveTimer = setTimeout(() => { finished = true; setPhase('gone'); }, reduce ? 120 : LEAVE_MS);
    };
    const check = () => { if (fontsOk && heroOk && minOk) leave('ready'); };
    if (!reduce) minTimer = setTimeout(() => { minOk = true; check(); }, MIN_MS);

    const onHero = (e) => { const m = e.detail && e.detail.mode; if (m && m !== 'pending') { heroOk = true; check(); } };
    const onProgress = (e) => {
      const { loaded, total } = e.detail || {};
      setStatus('MAPPING CONSTELLATION');
      if (total > 0) setBar(loaded / total);
    };
    window.addEventListener('pantheon:hero', onHero);
    window.addEventListener('pantheon:progress', onProgress);
    const onKey = (e) => { if (e.key === 'Escape') leave('skip'); };
    window.addEventListener('keydown', onKey);

    // pick up anything that happened before this effect ran
    const prev = window.__pantheonHero;
    if (prev && prev.mode && prev.mode !== 'pending') heroOk = true;
    const pp = window.__pantheonProgress;
    if (pp && pp.total > 0 && !heroOk) onProgress({ detail: pp });

    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => { fontsOk = true; check(); }, () => { fontsOk = true; check(); });
    timeout = setTimeout(() => leave('timeout'), TIMEOUT_MS);
    check();

    return () => {
      clearTimeout(timeout); clearTimeout(leaveTimer); clearTimeout(minTimer);
      window.removeEventListener('pantheon:hero', onHero);
      window.removeEventListener('pantheon:progress', onProgress);
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('wheel', stop);
      root.removeEventListener('touchmove', stop);
      unlock();
    };
  }, []);

  if (phase === 'gone') return null;
  const skip = () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); };

  return (
    <div ref={rootRef} className={`splash ${phase === 'leaving' ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Loading the portfolio">
      <noscript><style>{'.splash{display:none!important}'}</style></noscript>
      <span className="sr-only" role="status" aria-live="polite" ref={srRef}>Loading the portfolio</span>
      <div className="splash-grid" aria-hidden="true" />
      <div className="splash-grain" aria-hidden="true" />
      <div className="splash-stage" aria-hidden="true">
        <p className="splash-title">DIGITAL PANTHEON</p>
        <svg className="splash-emblem" viewBox="0 0 240 240" focusable="false">
          <defs>
            <linearGradient id="sp-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E3CA92" /><stop offset=".55" stopColor="#B99A5B" /><stop offset="1" stopColor="#8A6D36" />
            </linearGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* alignment marks and axis */}
            <g className="sp-fade" style={{ '--d': '.15s' }} stroke="#B99A5B" strokeOpacity=".45" strokeWidth=".8">
              <path d="M120 4v10M120 226v10M4 120h10M226 120h10" />
              <path d="M120 22v196" strokeDasharray="1 5" strokeOpacity=".3" />
              <path d="M22 120h196" strokeDasharray="1 5" strokeOpacity=".3" />
            </g>
            {/* decan ticks */}
            <g stroke="url(#sp-gold)" strokeWidth=".9">
              {TICKS.map(([x1, y1, x2, y2, i]) => <line key={i} className="sp-fade" style={{ '--d': `${(0.55 + i * 0.012).toFixed(2)}s` }} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} />)}
            </g>
            {/* outer ring */}
            <circle className="sp-draw" style={{ '--d': '.25s', '--t': '1s' }} pathLength="1" cx="120" cy="120" r="104" stroke="url(#sp-gold)" strokeWidth="1.1" />
            {/* orbit rings: they turn slowly once drawn */}
            <g className="sp-orbit">
              <g transform="rotate(-24 120 120)">
                <ellipse className="sp-draw" style={{ '--d': '1s', '--t': '.9s' }} pathLength="1" cx="120" cy="120" rx="92" ry="34" stroke="#C9A961" strokeOpacity=".8" strokeWidth=".9" />
                <circle className="sp-fade" style={{ '--d': '1.7s' }} cx="212" cy="120" r="2.6" fill="#E3CA92" />
              </g>
              <g transform="rotate(38 120 120)">
                <ellipse className="sp-draw" style={{ '--d': '1.15s', '--t': '.9s' }} pathLength="1" cx="120" cy="120" rx="92" ry="34" stroke="#B99A5B" strokeOpacity=".5" strokeWidth=".7" />
                <circle className="sp-fade" style={{ '--d': '1.8s' }} cx="28" cy="120" r="1.9" fill="#B99A5B" />
              </g>
            </g>
            {/* Eye of Horus: lid, brow, iris, pupil, tear line, cheek line and the two spirals */}
            <path className="sp-draw" style={{ '--d': '.55s', '--t': '.9s' }} pathLength="1" d="M50 120 C72 92 168 92 190 120 C168 148 72 148 50 120 Z" stroke="url(#sp-gold)" strokeWidth="1.5" />
            <path className="sp-draw" style={{ '--d': '.9s', '--t': '.7s' }} pathLength="1" d="M58 100 C84 78 156 78 182 100" stroke="url(#sp-gold)" strokeWidth="1.1" />
            <circle className="sp-draw" style={{ '--d': '1.1s', '--t': '.5s' }} pathLength="1" cx="120" cy="120" r="17" stroke="url(#sp-gold)" strokeWidth="1.2" />
            <circle className="sp-draw" style={{ '--d': '1.25s', '--t': '.4s' }} pathLength="1" cx="120" cy="120" r="10.5" stroke="#E3CA92" strokeOpacity=".7" strokeWidth=".7" />
            <circle className="sp-fade" style={{ '--d': '1.45s' }} cx="120" cy="120" r="5" fill="#E3CA92" />
            <path className="sp-draw" style={{ '--d': '1.2s', '--t': '.7s' }} pathLength="1" d="M120 137 C120 156 112 168 100 176 C108 178 118 176 124 168" stroke="url(#sp-gold)" strokeWidth="1.2" />
            <path className="sp-draw" style={{ '--d': '1.45s', '--t': '.5s' }} pathLength="1" d="M100 176 C92 184 94 194 104 196 C112 196 116 190 112 186" stroke="url(#sp-gold)" strokeWidth="1.1" />
            <path className="sp-draw" style={{ '--d': '1.3s', '--t': '.6s' }} pathLength="1" d="M152 134 L186 150 L196 148 C202 150 202 158 196 160" stroke="url(#sp-gold)" strokeWidth="1.1" />
            {/* restrained cyan scan: a short light pulse travelling along the lid and the ring */}
            <path className="sp-scan" pathLength="1" d="M50 120 C72 92 168 92 190 120 C168 148 72 148 50 120 Z" stroke="#7FD3E6" strokeWidth="1.4" />
            <circle className="sp-scan sp-scan-2" pathLength="1" cx="120" cy="120" r="104" stroke="#7FD3E6" strokeWidth="1" />
            {/* small stars */}
            <g fill="#EFE9DA">
              {STARS.map(([x, y, r], i) => <circle key={i} className="sp-star" style={{ '--d': `${(1.3 + i * 0.09).toFixed(2)}s` }} cx={x} cy={y} r={r} />)}
            </g>
          </g>
        </svg>
        <p className="splash-status" ref={statusRef}>SYSTEM INITIALIZATION</p>
        <div className="splash-bar is-indet"><span ref={barRef} /></div>
      </div>
      <button type="button" ref={skipRef} className="splash-skip" onClick={skip}>Skip intro</button>
    </div>
  );
}
