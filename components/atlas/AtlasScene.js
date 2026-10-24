'use client';

// Real-time 3D for the Atlas hero: the statue and its armillary are one group with one transform, so the
// instrument can never drift out of the hands. Authored in CSS pixels (1 world unit = 1 CSS px at the focal
// plane) so the sculpture lines up with the DOM copy around it.
//
// The statue is a genuine displaced mesh: the alpha channel of the licensed bronze render is blurred into a
// depth field, and the render's own luminance becomes the bump detail, so the figure has real thickness and
// catches a real moving light. If a CC BY mesh is dropped into /atlas/atlas.glb it is loaded instead.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };

const BRASS = 0xc9a86c;
const PIVOT = 140; // the group turns about a point this far behind the statue, like a sculpture on a turntable, so the turn reads as depth
const R_HERO = 100; // armillary radius in the hero, CSS px (matches the DOM arm's reach)

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// separable box blur, radius r, over a Float32Array field
function blur(field, w, h, r) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -r; x <= r; x++) sum += field[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / (2 * r + 1);
      const add = field[y * w + Math.min(w - 1, x + r + 1)];
      const sub = field[y * w + Math.max(0, x - r)];
      sum += add - sub;
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / (2 * r + 1);
      const add = tmp[Math.min(h - 1, y + r + 1) * w + x];
      const sub = tmp[Math.max(0, y - r) * w + x];
      sum += add - sub;
    }
  }
  return out;
}

export default function AtlasScene({ stateRef, atlasRef, featured, pointerRef, onMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      if (!renderer.getContext()) throw new Error('no webgl');
    } catch (err) {
      if (onMode) onMode('fallback');
      return;
    }
    // the canvas fades in once the model is ready, so the hero copy is never held back by the 3D load
    canvas.style.opacity = '0'; canvas.style.transition = 'opacity .9s ease';
    const onLost = (e) => { e.preventDefault(); if (onMode) onMode('fallback'); };
    canvas.addEventListener('webglcontextlost', onLost);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 1, 8000);
    camera.position.set(0, 0, 1200);
    camera.lookAt(0, 0, 0);

    // museum lighting: warm key from the upper left, cool fill from the right, cold rim behind
    const key = new THREE.DirectionalLight(0xfaedd0, 2.5);
    key.position.set(-1.1, 1.3, 1.5);
    const fill = new THREE.DirectionalLight(0xb4cde8, 0.95);
    fill.position.set(1.4, -0.3, 0.9);
    const rim = new THREE.DirectionalLight(0xdcebfa, 1.0);
    rim.position.set(0.5, 0.7, -1.4);
    scene.add(key, fill, rim, new THREE.HemisphereLight(0xc4d8ec, 0x1a2430, 0.75));

    // a small painted sky, PMREM-filtered, so the brass reflects the morning blue instead of black
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const ec = envCanvas.getContext('2d');
    const sky = ec.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, '#8fb0c8');
    sky.addColorStop(0.42, '#6d93b1');
    sky.addColorStop(0.58, '#cfd8dc');
    sky.addColorStop(1, '#1a2230');
    ec.fillStyle = sky; ec.fillRect(0, 0, 512, 256);
    const glow = ec.createRadialGradient(150, 70, 10, 150, 70, 190);
    glow.addColorStop(0, 'rgba(255,240,205,.95)');
    glow.addColorStop(1, 'rgba(255,240,205,0)');
    ec.fillStyle = glow; ec.fillRect(0, 0, 512, 256);
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(envTex).texture;
    envTex.dispose();
    pmrem.dispose();

    // one group holds the statue and the instrument: a single transform rotates both
    const sculpt = new THREE.Group();
    const statue = new THREE.Group();
    let statueMesh = null; // the relief fallback, if used
    const instrument = new THREE.Group();
    sculpt.add(statue, instrument);
    sculpt.position.z = PIVOT;
    const rig = new THREE.Group(); // the one transform: the pointer turns this, and statue and instrument turn with it
    rig.add(sculpt);
    scene.add(rig);

    // ---- the world: a solid cast-bronze ball that Atlas carries. No rings, no continents; a faintly engraved
    // graticule and a mottled patina give the surface enough detail that its turning reads, and the featured
    // projects sit on it as small gold studs. The ball and its studs share one group, so they always turn together.
    const makeBronze = () => {
      const W = 1024, H = 512;
      const col = document.createElement('canvas'); col.width = W; col.height = H;
      const bmp = document.createElement('canvas'); bmp.width = W; bmp.height = H;
      const c = col.getContext('2d'), b = bmp.getContext('2d');
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#a9763f'); g.addColorStop(0.5, '#bf8f55'); g.addColorStop(1, '#8c5d31');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      b.fillStyle = '#808080'; b.fillRect(0, 0, W, H);
      let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let k = 0; k < 1100; k++) { // mottled patina: darker bronze and a few muted verdigris touches
        const x = r() * W, y = r() * H, rad = 6 + r() * 38, verd = r() > 0.9;
        const gr = c.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, verd ? 'rgba(88,120,100,.1)' : 'rgba(62,38,16,' + (0.05 + r() * 0.1).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        const gb = b.createRadialGradient(x, y, 0, x, y, rad);
        const v = r() > 0.5 ? 255 : 0;
        gb.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',.1)'); gb.addColorStop(1, 'rgba(0,0,0,0)');
        b.fillStyle = gb; b.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      // faint engraved graticule: every 30 degrees, a slightly stronger equator
      c.strokeStyle = 'rgba(48,28,10,.34)'; b.strokeStyle = 'rgba(0,0,0,.55)';
      for (let k = 0; k < 12; k++) { const x = (k / 12) * W; [c, b].forEach(q => { q.lineWidth = 2; q.beginPath(); q.moveTo(x, 0); q.lineTo(x, H); q.stroke(); }); }
      for (let k = 1; k < 6; k++) { const y = (k / 6) * H; [c, b].forEach(q => { q.lineWidth = k === 3 ? 3.5 : 2; q.beginPath(); q.moveTo(0, y); q.lineTo(W, y); q.stroke(); }); }
      const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
      const bump = new THREE.CanvasTexture(bmp);
      return { map, bump };
    };
    const { map: ballMap, bump: ballBump } = makeBronze();
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballMap, bumpMap: ballBump, bumpScale: 1.6, color: 0xffffff,
      metalness: 0.72, roughness: 0.4, envMapIntensity: 1.25,
    });
    const ballGeo = new THREE.SphereGeometry(R_HERO, 96, 64);
    const globe = new THREE.Group(); // spins as one: ball + studs
    // the ball sits a little behind the hands, so the palms cradle its underside
    globe.position.z = -R_HERO * 0.6;
    instrument.add(globe);
    globe.add(new THREE.Mesh(ballGeo, ballMat));
    const geos = [ballGeo], mats = [ballMat];

    // featured project studs, seated on the surface
    const markerGeo = new THREE.SphereGeometry(2.8, 14, 12);
    const markers = featured.map((f) => {
      const m = new THREE.Mesh(markerGeo, new THREE.MeshStandardMaterial({
        color: 0xe8cf96, emissive: 0xd9bd7f, emissiveIntensity: 0, metalness: 0.7, roughness: 0.35,
      }));
      const lat = f.lat, lon = f.lon; // lib/data.js stores these in radians
      m.position.set(Math.cos(lat) * Math.sin(lon) * R_HERO, Math.sin(lat) * R_HERO, Math.cos(lat) * Math.cos(lon) * R_HERO);
      m.userData.base = 2.8;
      globe.add(m);
      return m;
    });

    // ---- the statue: a displaced mesh cut from the licensed bronze render
    let statueMat = null;
    const loadStatue = async () => {
      const src = '/atlas/atlas-bronze-1000.webp';
      const img = await loadImage(src);
      const w = img.naturalWidth, h = img.naturalHeight;

      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, w, h).data;

      const alpha = new Float32Array(w * h);
      const luma = new Float32Array(w * h);
      let lo = 1, hi = 0;
      for (let i = 0; i < w * h; i++) {
        const o = i * 4;
        alpha[i] = px[o + 3] / 255;
        const l = (px[o] * 0.3 + px[o + 1] * 0.59 + px[o + 2] * 0.11) / 255;
        luma[i] = l;
        if (alpha[i] > 0.5) { if (l < lo) lo = l; if (l > hi) hi = l; }
      }
      const span = Math.max(0.001, hi - lo);
      const dome = blur(alpha, w, h, Math.round(w * 0.022));
      for (let i = 0; i < w * h; i++) dome[i] = smooth(0.1, 0.72, dome[i]);

      // height map: the dome for the volume, the render's own shading for the sculptural detail
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = w; bumpCanvas.height = h;
      const bctx = bumpCanvas.getContext('2d');
      const bimg = bctx.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const detail = clamp((luma[i] - lo) / span);
        const v = Math.round(clamp(dome[i] * 0.68 + detail * 0.32) * 255);
        const o = i * 4;
        bimg.data[o] = bimg.data[o + 1] = bimg.data[o + 2] = v;
        bimg.data[o + 3] = 255;
      }
      bctx.putImageData(bimg, 0, 0);
      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      bumpTex.wrapS = bumpTex.wrapT = THREE.ClampToEdgeWrapping;

      const map = new THREE.Texture(img);
      map.colorSpace = THREE.SRGBColorSpace;
      map.needsUpdate = true;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      // the plane matches the rendered figure's box so the cutout lands exactly where the DOM image was
      const fig = atlasRef.current;
      const fw = fig ? fig.offsetWidth : 505;
      const fh = fig ? fig.offsetHeight : 556;
      const geo = new THREE.PlaneGeometry(fw, fh, 190, 210);
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      const depth = fw * 0.085;
      for (let i = 0; i < pos.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        const sx = Math.min(w - 1, Math.max(0, Math.round(u * (w - 1))));
        const sy = Math.min(h - 1, Math.max(0, Math.round((1 - v) * (h - 1))));
        pos.setZ(i, dome[sy * w + sx] * depth);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      statueMat = new THREE.MeshStandardMaterial({
        map, bumpMap: bumpTex, bumpScale: 2.1, transparent: false, alphaTest: 0.5,
        roughness: 0.72, metalness: 0.16, envMapIntensity: 0.5, side: THREE.DoubleSide,
      });
      statueMesh = new THREE.Mesh(geo, statueMat);
      statueMesh.position.z = -10;
      statue.add(statueMesh);
      statue.visible = true;
      canvas.style.opacity = '1';
      if (onMode) onMode('webgl');
      requestRender();
    };
    // Reduced motion draws on demand (model ready, resize) instead of looping; normal motion runs its own loop.
    let requestRender = () => {};
    let disposed = false;

    // ---- the real model: "Atlas holding the Earth" by Wabbaboy (CC BY 4.0), a genuine mesh with PBR textures.
    // It is Z-up with the statue and the globe as two separate meshes. The globe is lifted out and handed to the
    // instrument group (so it can detach and turn in the night sky); the statue stays in the hero group. If the
    // file is missing or fails, the displaced-relief statue above is used instead.
    const glb = { on: false, mesh: null, root: null, fw: 0, fh: 0, sphereLocal: new THREE.Vector2(), hs: 1, mats: [] };
    const loadGlb = async () => {
      const gltf = await new GLTFLoader().loadAsync('/atlas/atlas.glb', (e) => {
        // real byte progress of the model download, for the splash (only when the browser knows the total)
        if (e.lengthComputable && e.total > 0) {
          window.__pantheonProgress = { loaded: e.loaded, total: e.total };
          window.dispatchEvent(new CustomEvent('pantheon:progress', { detail: window.__pantheonProgress }));
        }
      });
      const meshes = [];
      gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
      if (meshes.length < 2) throw new Error('unexpected model layout');
      gltf.scene.updateMatrixWorld(true);
      // bake each mesh's node transforms so sizes and centres are in the model's own (Y-up) world space
      const baked = new Map();
      meshes.forEach((m) => { const g = m.geometry.clone().applyMatrix4(m.matrixWorld); g.computeBoundingSphere(); baked.set(m, g); });
      // the globe is the near-spherical, higher mesh; the statue is the other
      const globeMesh = meshes.reduce((a, b) => (baked.get(a).boundingSphere.center.y > baked.get(b).boundingSphere.center.y ? a : b));
      const statueM = meshes.find((m) => m !== globeMesh);
      const gc = baked.get(globeMesh).boundingSphere.center.clone();
      const gr = baked.get(globeMesh).boundingSphere.radius;
      glb.globeCenter = gc; glb.globeRadius = gr;
      globeMesh.parent.remove(globeMesh);
      // re-seat the globe on its own centre at the hero radius, so it spins in place and the studs sit on it
      const gg = baked.get(globeMesh).clone();
      gg.translate(-gc.x, -gc.y, -gc.z);
      gg.scale(R_HERO / gr, R_HERO / gr, R_HERO / gr);
      const gm = new THREE.Mesh(gg, globeMesh.material);
      globe.children.slice().forEach((c) => { if (c.geometry === ballGeo) globe.remove(c); });
      globe.add(gm);
      glb.globeMesh = gm;
      // the statue
      // lift the bronze toward a warm, sunlit gold-bronze (not dark brown, not grey steel) so it sits against the blue
      statueM.material.envMapIntensity = 0.95;
      statueM.material.color.setRGB(1.28, 1.14, 0.98);
      globeMesh.material.envMapIntensity = 0.95;
      globeMesh.material.color.setRGB(1.3, 1.16, 1.0);
      const root = new THREE.Group();
      const model = gltf.scene;
      root.add(model);
      root.rotation.y = -0.35; // a little off-axis so the statue reads in three-quarter view
      statue.add(root);
      glb.root = root; glb.model = model; glb.statueM = statueM;
      const sg = baked.get(statueM); sg.computeBoundingBox();
      glb.bbox = sg.boundingBox.clone(); // the statue alone, in the same baked space as the globe
      // the scene's own node transforms are already baked into those numbers, so the model must not apply them twice
      statueM.geometry = sg; statueM.matrix.identity(); statueM.matrixAutoUpdate = false; statueM.parent.matrixAutoUpdate = true;
      model.traverse((o) => { if (o !== statueM) { o.matrix.identity(); o.matrixAutoUpdate = false; } });
      glb.on = true;
      glb.mats = [statueM.material, globeMesh.material];
      if (statueMesh) { statue.remove(statueMesh); statueMesh.geometry.dispose(); statueMesh = null; }
      canvas.style.opacity = '1';
      if (onMode) onMode('webgl');
      requestRender();
    };
    loadGlb().catch((err) => { console.warn('atlas.glb not used, falling back to the relief statue:', err && err.message); loadStatue().catch(() => { if (onMode) onMode('fallback'); }); });

    // ---- stars
    const starCount = 70;
    const starPos = new Float32Array(starCount * 3);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < starCount; i++) {
      const u = 2 * rnd() - 1, th = rnd() * TAU, r = Math.sqrt(1 - u * u);
      starPos[i * 3] = Math.cos(th) * r * 1400;
      starPos[i * 3 + 1] = Math.sin(th) * r * 1400;
      starPos[i * 3 + 2] = u * 1400 - 400;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xf0e9dc, size: 3.4, sizeAttenuation: false, transparent: true, opacity: 0.35, depthWrite: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- layout
    let W = 0, H = 0;
    const layout = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.fov = (2 * Math.atan((H / 2) / 1200) * 180) / Math.PI;
      camera.updateProjectionMatrix();
      requestRender();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);

    // world position of a DOM box centre (CSS px -> world units, y up)
    const worldOf = (cssX, cssY) => ({ x: cssX - W / 2, y: -(cssY - H / 2) });

    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    let auto = 0, sa = 0, lastT = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const { p, active } = stateRef.current;
      const night = smooth(.1, .26, p);
      const ptr = pointerRef ? pointerRef.current : { x: 0, y: 0 };

      // where the statue stands, and where the instrument rests in the palms
      const fig = atlasRef.current;
      const fw = fig ? fig.offsetWidth : 505, fh = fig ? fig.offsetHeight : 556;
      const figLeft = fig ? fig.offsetLeft : W * 0.7, figTop = fig ? fig.offsetTop : H * 0.6;
      const statueC = worldOf(figLeft + fw * .5, figTop + fh * .52);
      const hs = Math.min(1, fw / 505); // the instrument keeps its proportion to the statue at every width
      const palmCss = figTop + fh * .245;
      const sphereCss = { x: figLeft + fw * .563, y: palmCss - R_HERO * hs * .86 };
      const sphereC = worldOf(sphereCss.x, sphereCss.y);

      // fit the real model to the figure box: statue height = the box, feet on the box bottom, centred horizontally;
      // the globe's hero position is wherever the model keeps it (measured, so it can never drift from the hands)
      if (glb.on) {
        if (glb.fw !== fw || glb.fh !== fh) {
          glb.fw = fw; glb.fh = fh;
          // fit statue + globe together to the figure box (88% of its height), centred on the box
          const bb = glb.bbox, topY = Math.max(bb.max.y, glb.globeCenter.y + glb.globeRadius), botY = bb.min.y;
          const k = (fh * 0.88) / (topY - botY);
          glb.root.scale.setScalar(k);
          const mid = new THREE.Vector3((bb.min.x + bb.max.x) / 2, (topY + botY) / 2, (bb.min.z + bb.max.z) / 2).multiplyScalar(k).applyEuler(glb.root.rotation);
          glb.root.position.copy(mid).negate();
          glb.root.position.y += fh * 0.02;
          // the globe sat at (0, gc) in model space (Z-up); in the rotated, scaled root that is:
          glb.root.updateMatrix();
          const gcw = glb.globeCenter.clone().applyMatrix4(glb.root.matrix);
          glb.sphereLocal.set(gcw.x, gcw.y);
          glb.hs = (glb.globeRadius * k) / R_HERO;
        }
      }

      // one transform for the whole group: the mouse turns statue and instrument together
      const yaw = ptr.x * 0.122, pitch = ptr.y * -0.061; // 7deg / 3.5deg maximum
      rig.rotation.y += (yaw - rig.rotation.y) * (reduce ? 1 : .12);
      rig.rotation.x += (pitch - rig.rotation.x) * (reduce ? 1 : .12);

      // the sculpture stands in the hero, then hands the instrument over to the night sky
      const nightCentre = worldOf(W * (W <= 900 ? .5 : .65), H * (W <= 900 ? .33 : .46));
      rig.position.set(
        statueC.x + (nightCentre.x - statueC.x) * night,
        statueC.y + (nightCentre.y - statueC.y) * night,
        -PIVOT
      );
      globe.position.z = glb.on ? 0 : -R_HERO * 0.6;
      const hx = glb.on ? glb.sphereLocal.x : sphereC.x - statueC.x, hy = glb.on ? glb.sphereLocal.y : sphereC.y - statueC.y;
      instrument.position.set(hx * (1 - night), hy * (1 - night), 0);
      const m = Math.min(W, H);
      const nightR = (m * (W <= 900 ? .25 : .26) * 1.1) / R_HERO;
      const hsx = glb.on ? glb.hs : hs;
      const s = hsx + (nightR - hsx) * night;
      instrument.scale.setScalar(s);

      if (glb.on) {
        const op = 1 - smooth(.08, .22, p);
        glb.statueM.material.transparent = op < .999;
        glb.statueM.material.opacity = op;
        glb.statueM.material.depthWrite = op > .5;
        statue.visible = op > .01;
      }
      // the statue fades as the sky turns; the instrument takes over
      if (statueMesh && statueMat) {
        const op = 1 - smooth(.08, .22, p);
        statueMat.opacity = op;
        statueMat.transparent = op < .999;
        statueMat.depthWrite = op > .5;
        statue.visible = op > .01;
      }

      // the world is always turning: a slow steady drift, plus a turn tied to scroll through the featured projects
      // (about a revolution and a quarter across the sequence), so the separated project studs travel round the ball
      const dt = Math.min(50, t - lastT); lastT = t;
      if (!reduce) auto += dt * 0.00011;                    // ~0.11 rad/s
      const scrollAngle = clamp((p - .3) / .7) * TAU * 1.25;
      sa += (scrollAngle - sa) * (reduce ? 1 : .1);
      globe.rotation.y = -(sa + auto);
      globe.rotation.x = -0.3 + night * 0.08;

      // markers brighten with the night and the active one glows
      markers.forEach((m2, i) => {
        const on = i === active && night > .3;
        m2.material.emissiveIntensity = on ? 1.0 : night * .4;
        const s2 = on ? 3.4 : 2.5 + night * .3;
        m2.scale.setScalar(s2 / m2.userData.base);
        m2.material.opacity = .25 + night * .75;
        m2.material.transparent = true;
      });

      starMat.opacity = .18 + night * .3;
      stars.rotation.y = -(sa + auto) * .4;
      stars.position.x = nightCentre.x;
      stars.position.y = nightCentre.y;

      renderer.render(scene, camera);
    };

    if (reduce) {
      // no continuous loop: draw one still frame now and again whenever the model finishes loading or the size changes
      let queued = 0;
      requestRender = () => {
        if (queued) return;
        queued = requestAnimationFrame((t) => { queued = 0; if (disposed) return; stateRef.current.p = 0; frame(t); cancelAnimationFrame(raf); raf = 0; });
      };
      requestRender();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      disposed = true; requestRender = () => {};
      canvas.removeEventListener('webglcontextlost', onLost);
      ro.disconnect();
      io.disconnect();
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
      markerGeo.dispose();
      ballMap.dispose(); ballBump.dispose();
      starGeo.dispose(); starMat.dispose();
      if (statueMat) { statueMat.map?.dispose(); statueMat.bumpMap?.dispose(); statueMat.dispose(); }
      if (statueMesh) statueMesh.geometry.dispose();
      glb.mats.forEach((m) => { ['map', 'normalMap', 'metalnessMap', 'roughnessMap'].forEach((k) => m[k] && m[k].dispose()); m.dispose(); });
      renderer.dispose();
    };
  }, [featured]);

  return <canvas ref={canvasRef} className="at-canvas" aria-hidden="true" />;
}
