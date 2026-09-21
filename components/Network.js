'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Network() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, .1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const count = coarse ? 42 : 72;
    const points = Array.from({ length: count }, () => new THREE.Vector3(
      (Math.random() - .5) * 7.5,
      (Math.random() - .5) * 5.2,
      (Math.random() - .5) * 3.5
    ));

    const pointGeo = new THREE.BufferGeometry().setFromPoints(points);
    const pointMat = new THREE.PointsMaterial({ color: 0xb8ff3d, size: .045, transparent: true, opacity: .8 });
    group.add(new THREE.Points(pointGeo, pointMat));

    const segments = [];
    points.forEach((a, i) => points.slice(i + 1).forEach(b => {
      if (a.distanceTo(b) < 1.75) segments.push(a, b);
    }));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(segments);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: .14 });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    const glow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.3, 3),
      new THREE.MeshBasicMaterial({ color: 0xb8ff3d, wireframe: true, transparent: true, opacity: .035 })
    );
    group.add(glow);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const move = e => { target.x = (e.clientX / innerWidth - .5) * .7; target.y = (e.clientY / innerHeight - .5) * .45; };
    const resize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', resize);

    let frame;
    const tick = time => {
      mouse.x += (target.x - mouse.x) * .025;
      mouse.y += (target.y - mouse.y) * .025;
      if (!reduced) {
        group.rotation.y = time * .00008 + mouse.x * .15;
        group.rotation.x = mouse.y * .12;
        glow.rotation.z = time * .00012;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
      pointGeo.dispose(); lineGeo.dispose(); pointMat.dispose(); lineMat.dispose();
      glow.geometry.dispose(); glow.material.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} aria-hidden className="absolute inset-0 opacity-90" />;
}
