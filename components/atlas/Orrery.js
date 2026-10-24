'use client';

import { useEffect, useRef } from 'react';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const vec = (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
const GOLD = '185,151,91';

// Gold armillary sphere drawn on a 2D canvas. It starts cradled in Atlas's hands, then moves to the
// centre of the night sky and turns to face the active featured project.
// `stateRef.current` = { p: scroll progress 0..1, active: featured index }, written by AtlasStage.
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

    // seeded constellation so the sphere looks the same on every load
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const nv = Array.from({ length: 38 }, () => vec(Math.asin(2 * rnd() - 1), rnd() * Math.PI * 2));
    const edges = [];
    for (let i = 0; i < nv.length; i++) for (let j = i + 1; j < nv.length; j++) {
      if (Math.hypot(nv[i][0] - nv[j][0], nv[i][1] - nv[j][1], nv[i][2] - nv[j][2]) < .62) edges.push([i, j]);
    }

    let rot = 0, tilt = .35, targetRot = 0;
    const project = (v, cx, cy, R) => {
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const x = v[0] * cr + v[2] * sr, z = -v[0] * sr + v[2] * cr, y = v[1];
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      return [cx + x * R, cy - (y * ct - z * st) * R, y * st + z * ct];
    };

    const draw = (t) => {
      const { p, active } = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      const mobile = window.innerWidth <= 900;
      const night = smooth(.1, .26, p);
      const m = Math.min(W, H);
      const Rn = m * (mobile ? .26 : .27) * 1.1, Rh = m * .2;
      const h = 1 - smooth(.06, .26, p); // 1 = in Atlas's hands, 0 = centred orrery
      const R = Rh + (Rn - Rh) * (1 - h);
      const atlas = atlasRef.current;
      const hx = atlas ? atlas.offsetLeft + atlas.offsetWidth / 2 : W * .7;
      const hy = atlas ? atlas.offsetTop + atlas.offsetHeight * .045 : H * .6;
      const cxH = hx, cyH = hy - Rh * .88;
      const cxN = W * (mobile ? .5 : .65), cyN = H * (mobile ? .33 : .46);
      const cx = cxH + (cxN - cxH) * (1 - h), cy = cyH + (cyN - cyH) * (1 - h);
      const lineA = .4 - night * .12;
      ctx.lineWidth = 1;
      for (let k = -1; k <= 1; k++) { // parallels
        ctx.beginPath();
        for (let s = 0; s <= 64; s++) { const q = project(vec(k * .62, s / 64 * Math.PI * 2), cx, cy, R); s ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.strokeStyle = `rgba(${GOLD},${lineA * .55})`; ctx.stroke();
      }
      for (let k = 0; k < 4; k++) { // meridians
        ctx.beginPath();
        for (let s = 0; s <= 64; s++) { const q = project(vec(s / 64 * Math.PI * 2, k / 4 * Math.PI), cx, cy, R); s ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.strokeStyle = `rgba(${GOLD},${lineA * .4})`; ctx.stroke();
      }
      const ringK = W < 1100 ? 1 : 1.28; // ecliptic ring
      ctx.beginPath();
      for (let s = 0; s <= 96; s++) { const a = s / 96 * Math.PI * 2; const q = project([Math.cos(a) * ringK, Math.sin(a) * .18, Math.sin(a) * ringK * .55], cx, cy, R); s ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.strokeStyle = `rgba(${GOLD},${.5 + night * .2})`; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineWidth = 1;
      const ca = .1 + night * .2, ink = night > .5 ? '239,233,218' : '86,52,95';
      for (const [i, j] of edges) {
        const a = project(nv[i], cx, cy, R), b = project(nv[j], cx, cy, R);
        if (a[2] < 0 && b[2] < 0) continue;
        ctx.strokeStyle = `rgba(${ink},${ca * .5})`; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (const v of nv) { const q = project(v, cx, cy, R); if (q[2] < 0) continue; ctx.fillStyle = `rgba(${ink},${ca + .1})`; ctx.beginPath(); ctx.arc(q[0], q[1], 1.4, 0, 7); ctx.fill(); }
      featured.forEach((f, i) => { // featured project stars
        const q = project(vec(f.lat, f.lon), cx, cy, R); const on = i === active && night > .4;
        ctx.globalAlpha = (q[2] > -.1 ? 1 : .25) * (.35 + .65 * night);
        ctx.fillStyle = `rgb(${GOLD})`; ctx.beginPath(); ctx.arc(q[0], q[1], on ? 6 : 3.5, 0, 7); ctx.fill();
        if (on) { ctx.strokeStyle = `rgba(${GOLD},.8)`; ctx.beginPath(); ctx.arc(q[0], q[1], 14 + (reduce ? 0 : Math.sin(t / 400) * 2), 0, 7); ctx.stroke(); }
        ctx.globalAlpha = 1;
      });
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const { p, active } = stateRef.current;
      const f = featured[p < .3 ? 0 : active] || { lat: 0, lon: 0 };
      targetRot = -f.lon;
      if (p < .3 && !reduce) targetRot = -(t / 9000) % (Math.PI * 2) - p * 2; // gentle drift in the hero
      tilt += ((p >= .3 ? f.lat * .6 + .1 : .35) - tilt) * (reduce ? 1 : .06);
      const d = ((targetRot - rot + Math.PI * 3) % (Math.PI * 2)) - Math.PI; // shortest turn
      rot += reduce ? d : d * .05;
      draw(t);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [stateRef, atlasRef, featured]);

  return <canvas ref={canvasRef} className="at-canvas" aria-hidden="true" />;
}
