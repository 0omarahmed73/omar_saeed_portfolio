// Procedural Atlas-inspired sculpture: a smooth metaball figure (Three.js MarchingCubes)
// holding a gold armillary sphere. No external assets. Static geometry, built once.
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('atlas-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
camera.position.set(0, 0.35, 9);
camera.lookAt(0, 0.7, 0);

// --- marble material: subtle veining via a generated canvas texture ---
function marbleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#d6ccb4'; g.fillRect(0, 0, 512, 512);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    g.beginPath(); let x = rnd() * 512, y = rnd() * 512; g.moveTo(x, y);
    for (let k = 0; k < 14; k++) { x += (rnd() - .45) * 70; y += (rnd() - .5) * 70; g.lineTo(x, y); }
    g.strokeStyle = `rgba(120,112,98,${.05 + rnd() * .08})`; g.lineWidth = .6 + rnd() * 1.4; g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const marble = new THREE.MeshPhysicalMaterial({
  map: marbleTexture(), roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.45, envMapIntensity: 0.18,
});

// --- the figure ---
const RES = 96, SUB = 12, ISO = 80;
const mc = new MarchingCubes(RES, marble, true, false, 300000);
mc.isolation = ISO;
mc.reset();
const ball = (x, y, z, r) => mc.addBall(x, y, z, r * r * (ISO + SUB), SUB);
const both = (x, y, z, r) => { ball(x, y, z, r); if (Math.abs(x - .5) > 1e-4) ball(1 - x, y, z, r); };
// torso, waist, hips (cut off below by the clipping plane)
[[.5,.40,.5,.125],[.43,.42,.5,.09],[.57,.42,.5,.09],[.5,.30,.5,.095],[.5,.20,.5,.10],[.5,.12,.5,.10]].forEach(b=>ball(...b));
// shoulders, deltoids and trapezius slope
both(.36,.505,.5,.075); both(.305,.495,.5,.065); both(.43,.535,.5,.058);
// neck, bowed head, chin and brow
ball(.5,.595,.5,.034); ball(.5,.715,.55,.064); ball(.5,.685,.585,.04); ball(.5,.74,.58,.036);
// raised arms: elbows out, forearms up, open hands
[[.30,.49,.5,.064],[.25,.46,.5,.062],[.205,.455,.5,.056],[.19,.52,.5,.05],[.20,.59,.5,.046],[.22,.66,.5,.042],[.26,.73,.5,.042],[.31,.775,.5,.05],[.355,.795,.5,.046]].forEach(([x,y,z,r])=>both(x,y,z,r));
mc.update();
// recentre: cube 0..1 -> world
const S = 3.2;
mc.scale.set(S, S, S); mc.position.set(0, -0.02 * S, 0);
// MarchingCubes geometry spans [-1,1]; scale the half-size
mc.scale.multiplyScalar(0.5);
const figure = new THREE.Group(); figure.add(mc); scene.add(figure);

// fade the lower body into the page via a gradient plane is done in CSS; clip below base here
renderer.localClippingEnabled = true;
marble.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.68)];

// --- gold armillary sphere ---
const gold = new THREE.MeshStandardMaterial({ color: 0xb9975b, metalness: 1, roughness: 0.28 });
const sphere = new THREE.Group();
const R = 0.92;
const ring = (rx, ry, rz, r = R, t = 0.012) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 12, 160), gold); m.rotation.set(rx, ry, rz); sphere.add(m); };
ring(0, 0, 0); ring(Math.PI / 2, 0, 0); ring(0, Math.PI / 2, 0);              // meridians + equator
ring(Math.PI / 2, 0, 0, R * 0.86, 0.008);                                       // parallel
const ecl = new THREE.Mesh(new THREE.TorusGeometry(R * 1.12, 0.014, 12, 200), gold); ecl.rotation.set(Math.PI / 2.3, 0.2, 0.35); sphere.add(ecl);
// faint constellation points + links on the surface
const pts = []; let sd = 5; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 26; i++) { const u = rr() * 2 - 1, a = rr() * Math.PI * 2, s = Math.sqrt(1 - u * u); pts.push(new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a)).multiplyScalar(R)); }
const star = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ color: 0xb9975b, size: 0.05, sizeAttenuation: true }));
sphere.add(star);
const seg = []; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (pts[i].distanceTo(pts[j]) < 0.62) seg.push(pts[i], pts[j]);
sphere.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: 0xb9975b, transparent: true, opacity: 0.45 })));
sphere.position.set(0, 1.62, 0.1);
scene.add(sphere);

// --- light ---
const key = new THREE.DirectionalLight(0xfff1d6, 4.2); key.position.set(-5, 4, 3.5); scene.add(key);
const rim = new THREE.DirectionalLight(0xb9975b, 1.4); rim.position.set(5, 2, -3); scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.08));

// --- layout / loop ---
function size() {
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', size); size();
let mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
let visible = true; new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
function frame(t) {
  requestAnimationFrame(frame); if (!visible) return;
  const sway = reduce ? 0 : Math.sin(t / 3200) * 0.08;
  figure.rotation.y += ((mx * .5 + sway) - figure.rotation.y) * 0.05;
  figure.rotation.x += ((my * .15) - figure.rotation.x) * 0.05;
  sphere.rotation.y = reduce ? 0.4 : t / 9000;
  sphere.position.y = 1.62 + (reduce ? 0 : Math.sin(t / 2600) * 0.03);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
document.documentElement.dataset.atlas = 'ready';
