'use client';

import { useEffect, useRef } from 'react';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const vec = (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
const TAU = Math.PI * 2;
const EPS = 23.5 * Math.PI / 180; // obliquity of the ecliptic

// Delicate antique armillary sphere on a 2D canvas: thin open rings in aged gold, depth suggested only
// by per-arc alpha (dim far side, brighter near side, lit crown). No fills, no globe, no boss.
// The sphere rests in Atlas's palms — the anchor below is measured from the render itself (fingertips
// at ~6% of figure height, palm mass centred ~15% down, ~69% across) — then rises to the night sky and
// turns to face the active featured project. Atlas paints over the canvas, so the hands always stay
// in front of the rings and no ring ever crosses the statue.
export default function Orrery({ stateRef, atlasRef, featured }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, raf = 0, visible = true;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(size); ro.observe(canvas); size();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);

    // deterministic star scatter
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const stars = Array.from({ length: 8 }, () => vec(Math.asin(2 * rnd() - 1), rnd() * TAU));

    let rot = 0, tilt = .35, targetRot = 0;
    const project = (v, cx, cy, R) => {
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const x = v[0] * cr + v[2] * sr, z = -v[0] * sr + v[2] * cr, y = v[1];
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      return [cx + x * R, cy - (y * ct - z * st) * R, y * st + z * ct];
    };

    const sample = (fn, cx, cy, R, n = 120) => {
      const out = [];
      for (let s = 0; s <= n; s++) out.push(project(fn(s / n * TAU), cx, cy, R));
      return out;
    };
    const trace = (pts, cond) => {
      // stroke each contiguous run where cond(z) holds, as one sub-path
      ctx.beginPath();
      let pen = false;
      for (const q of pts) {
        if (cond(q[2])) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
        else pen = false;
      }
      ctx.stroke();
    };

    const draw = (t) => {
      const { p, active } = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      const mobile = window.innerWidth <= 900;
      const night = smooth(.1, .26, p);
      const GOLD = [216 - 31 * night, 186 - 35 * night, 124 - 33 * night].map(Math.round);
      const g = (a) => `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${Math.min(1, Math.max(0, a))})`;
      const LIT = [232 - 20 * night, 206 - 24 * night, 150 - 26 * night].map(Math.round);
      const lit = (a) => `rgba(${LIT[0]},${LIT[1]},${LIT[2]},${Math.min(1, Math.max(0, a))})`;

      const m = Math.min(W, H);
      const atlas = atlasRef.current;
      // radius is a fraction of the figure, not of the canvas, so the sphere keeps the same
      // proportion to Atlas at every breakpoint
      const fw = atlas ? atlas.offsetWidth : m * .6;
      const Rh = fw * .198;
      const Rn = m * (mobile ? .25 : .26) * 1.1;
      const h = 1 - smooth(.06, .26, p); // 1 = in Atlas's hands, 0 = centred orrery
      const R = Rh + (Rn - Rh) * (1 - h);
      // hand anchor measured from the render: palms sit at 56% across and 24.5% down the figure
      const fx = atlas ? atlas.offsetLeft + atlas.offsetWidth * .563 : W * .7;
      const palm = atlas ? atlas.offsetTop + atlas.offsetHeight * .245 : H * .6;
      // lower rim dips just into the palms so the hands visibly cradle it
      const cxH = fx, cyH = palm - Rh * .86;
      const cxN = W * (mobile ? .5 : .65), cyN = H * (mobile ? .33 : .46);
      const cx = cxH + (cxN - cxH) * (1 - h), cy = cyH + (cyN - cyH) * (1 - h);

      const ink = '240,233,220';
      const starA = .2 + night * .12;
      const base = .68 - night * .12;

      // one thin ring in three depth passes: dim far side, brighter near side, lit crown
      const ring = (fn, k = 1, lw = 1) => {
        const pts = sample(fn, cx, cy, R);
        ctx.lineWidth = lw;
        ctx.strokeStyle = g(base * .38 * k);
        trace(pts, () => true);
        ctx.strokeStyle = g(base * k);
        trace(pts, (z) => z > 0);
        ctx.strokeStyle = lit(base * 1.05 * k);
        trace(pts, (z) => z > .55);
      };

      // far-side stars
      for (const v of stars) {
        const q = project(v, cx, cy, R);
        if (q[2] >= 0) continue;
        ctx.fillStyle = `rgba(${ink},${starA * .35})`;
        ctx.beginPath(); ctx.arc(q[0], q[1], .9, 0, TAU); ctx.fill();
      }

      ring((a) => vec(a, Math.PI / 2), .8);          // back colure
      ring((a) => vec(a, 0), .95);                   // front colure
      ring((a) => vec(0, a), 1);                     // equator
      ring((a) => tilted(a, EPS), 1.15, 1.2);        // ecliptic, the hero ring

      // twelve tiny graduation ticks on the near half of the ecliptic
      ctx.lineWidth = .8;
      for (let k = 0; k < 12; k++) {
        const a = k / 12 * TAU;
        const q = project(tilted(a, EPS), cx, cy, R);
        if (q[2] < .15) continue;
        const r2 = project(tilted(a + .02, EPS), cx, cy, R);
        const dx = r2[0] - q[0], dy = r2[1] - q[1];
        const len = Math.hypot(dx, dy) || 1;
        ctx.strokeStyle = g(.42);
        ctx.beginPath();
        ctx.moveTo(q[0], q[1]);
        ctx.lineTo(q[0] - dy / len * 3, q[1] + dx / len * 3);
        ctx.stroke();
      }

      // fixed outer hoop in the view plane, broken where the polar axis passes
      const gap = .1, rr = R * 1.04;
      ctx.lineWidth = 1; ctx.strokeStyle = g(base * .85);
      ctx.beginPath(); ctx.arc(cx, cy, rr, -Math.PI / 2 + gap, Math.PI / 2 - gap); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI / 2 + gap, Math.PI * 1.5 - gap); ctx.stroke();

      // polar axis hairline with tiny finials
      const s0 = project([0, -1.02, 0], cx, cy, R), s1 = project([0, 1.02, 0], cx, cy, R);
      ctx.strokeStyle = g(.42); ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke();
      ctx.fillStyle = g(.7);
      for (const s of [s0, s1]) { ctx.beginPath(); ctx.arc(s[0], s[1], 1.5, 0, TAU); ctx.fill(); }

      // near stars
      for (const v of stars) {
        const q = project(v, cx, cy, R);
        if (q[2] < 0) continue;
        ctx.fillStyle = `rgba(${ink},${starA})`;
        ctx.beginPath(); ctx.arc(q[0], q[1], 1, 0, TAU); ctx.fill();
      }

      // featured project markers: tiny gold points set into the sphere
      featured.forEach((f, i) => {
        const q = project(vec(f.lat, f.lon), cx, cy, R);
        const on = i === active && night > .4;
        ctx.globalAlpha = (q[2] > -.1 ? 1 : .25) * (.3 + .7 * night);
        ctx.fillStyle = `rgb(${GOLD[0]},${GOLD[1]},${GOLD[2]})`;
        ctx.beginPath(); ctx.arc(q[0], q[1], on ? 3.4 : 2, 0, TAU); ctx.fill();
        if (on) {
          ctx.strokeStyle = g(.6); ctx.lineWidth = .9;
          ctx.beginPath(); ctx.arc(q[0], q[1], 7 + (reduce ? 0 : Math.sin(t / 400) * 1.2), 0, TAU); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const { p, active } = stateRef.current;
      const f = featured[p < .3 ? 0 : active] || { lat: 0, lon: 0 };
      targetRot = -f.lon;
      if (p < .3 && !reduce) targetRot = -(t / 9000) % TAU - p * 2;
      tilt += ((p >= .3 ? f.lat * .6 + .1 : .35) - tilt) * (reduce ? 1 : .06);
      const d = ((targetRot - rot + Math.PI * 3) % TAU) - Math.PI;
      rot += reduce ? d : d * .05;
      draw(t);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [stateRef, atlasRef, featured]);

  return <canvas ref={canvasRef} className="at-canvas" aria-hidden="true" />;
}

function tilted(a, tiltRad, r = 1) {
  return [Math.cos(a) * r, Math.sin(a) * Math.sin(tiltRad) * r, Math.sin(a) * Math.cos(tiltRad) * r];
}
