'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Network from '@/components/Network';
import { D, skills } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const ids = ['overview', 'projects', 'skills', 'experience', 'contact'];

function Magnetic({ children, className = '', strength = 0.22 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength, duration: .45, ease: 'power3.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.35)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [strength]);
  return <span ref={ref} className={className}>{children}</span>;
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => gsap.fromTo(ref.current, { y: 70, opacity: 0, clipPath: 'inset(0 0 18% 0)' }, {
      y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1, delay, ease: 'power4.out',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true }
    }), ref);
    return () => ctx.revert();
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

export default function Page() {
  const root = useRef(null);
  const cursor = useRef(null);
  const t = D.en;

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: !reduceMotion,
      syncTouch: !reduceMotion,
      touchMultiplier: 1.15,
      anchors: true,
    });

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Keep hash navigation smooth even when a browser jumps directly to an anchor.
    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.15, immediate: false });
      window.history.replaceState(null, '', href);
    };

    document.addEventListener('click', handleAnchorClick);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.nav-reveal', { y: -20, opacity: 0, duration: .7, stagger: .05 })
        .from('.hero-line', { yPercent: 120, opacity: 0, duration: 1.1, stagger: .12 }, '-=.2')
        .from('.hero-copy', { y: 25, opacity: 0, duration: .8 }, '-=.5')
        .from('.hero-actions', { y: 20, opacity: 0, duration: .6 }, '-=.45');

      if (!reduceMotion) {
        gsap.utils.toArray('.project-card').forEach((card, i) => {
          gsap.from(card, { y: 80, opacity: 0, rotateX: 8, duration: 1, delay: i * .08, ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
        });

        gsap.utils.toArray('.parallax').forEach(el => gsap.to(el, {
          yPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        }));

        gsap.utils.toArray('.count').forEach(el => {
          const o = { n: 0 };
          gsap.to(o, { n: +el.dataset.v, duration: 1.4, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            onUpdate: () => { el.textContent = Math.round(o.n); } });
        });
      }
    }, root);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  useEffect(() => {
    const dot = cursor.current;
    if (!dot || window.matchMedia('(pointer: coarse)').matches) return;
    const move = (e) => gsap.to(dot, { x: e.clientX, y: e.clientY, duration: .18, ease: 'power2.out' });
    const over = () => dot.classList.add('cursor-active');
    const out = () => dot.classList.remove('cursor-active');
    window.addEventListener('pointermove', move);
    const bind = () => document.querySelectorAll('a,button,.magnetic').forEach(el => {
      el.addEventListener('pointerenter', over); el.addEventListener('pointerleave', out);
    });
    bind();
    return () => {
      window.removeEventListener('pointermove', move);
      document.querySelectorAll('a,button,.magnetic').forEach(el => {
        el.removeEventListener('pointerenter', over); el.removeEventListener('pointerleave', out);
      });
    };
  }, []);

  return (
    <div ref={root} className="site-shell">
      <div ref={cursor} className="cursor-dot" aria-hidden="true" />
      <aside className="desktop-nav">
        <a href="#overview" className="nav-reveal brand">O<span>.</span></a>
        <div className="nav-rule" />
        <nav>{ids.map((id, i) => <a key={id} href={'#' + id} className="nav-reveal">{String(i + 1).padStart(2, '0')} <span>{t.nav[i]}</span></a>)}</nav>
        <div className="nav-bottom"><span className="vertical-label">AVAILABLE FOR SELECT PROJECTS</span></div>
      </aside>

      <header className="mobile-nav">
        <a href="#overview" className="brand">O<span>.</span></a>
        <span className="mobile-status">AVAILABLE FOR SELECT PROJECTS</span>
      </header>

      <section id="overview" className="hero section-pad">
        <Network />
        <div className="hero-grid">
          <div className="hero-index">01 / 05</div>
          <div className="hero-content">
            <p className="eyebrow hero-copy">{t.eyebrow}</p>
            <h1>{t.h1.map((s, i) => <span key={i} className="hero-line-wrap"><span className="hero-line">{s}</span></span>)}</h1>
            <p className="hero-copy hero-description">{t.sub}</p>
            <div className="hero-actions">
              <a href="#projects" className="button button-solid magnetic"><Magnetic>{t.cta[0]} <span>↘</span></Magnetic></a>
              <a href="/cv.pdf" download className="button button-ghost magnetic"><Magnetic>{t.cta[1]} <span>↓</span></Magnetic></a>
            </div>
          </div>
          <div className="hero-side parallax"><span>ODOO</span><span>FRONTEND</span><span>PRODUCT</span></div>
        </div>
        <div className="scroll-cue"><span /> {t.scroll}</div>
      </section>

      <section className="stats">
        {t.stats.map(([v, s]) => <div key={s} className="stat"><strong><span className="count" data-v={v}>{v}</span><sup>+</sup></strong><span>{s}</span></div>)}
      </section>

      <main>
        <section id="projects" className="section section-pad">
          <Reveal><div className="section-heading"><span className="section-number">02</span><div><p className="eyebrow">{t.workLabel}</p><h2>{t.hp}</h2></div><p className="heading-note">{t.workNote}</p></div></Reveal>
          <div className="project-grid">
            {t.projects.map(([n, s, b, tags, accent], i) => (
              <article key={n} className={`project-card project-${i}`}>
                <div className="project-visual">
                  <div className="browser"><i/><i/><i/></div>
                  <div className="visual-ui">
                    <span className="visual-title">{accent}</span>
                    <div className="visual-bars"><b/><b/><b/><b/></div>
                    <div className="visual-panel"><em/><em/><em/></div>
                  </div>
                  <span className="project-number">0{i + 1}</span>
                </div>
                <div className="project-info">
                  <div><p className="project-type">{s}</p><h3>{n}</h3></div>
                  <p>{b}</p>
                  <ul>{tags.map(x => <li key={x}>{x}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section section-pad skills-section">
          <Reveal><div className="section-heading"><span className="section-number">03</span><div><p className="eyebrow">{t.stackLabel}</p><h2>{t.hs}</h2></div></div></Reveal>
          <div className="skills-layout">
            <div className="skill-statement parallax">{t.skillStatement}</div>
            <div className="skills-list">{Object.entries(skills).map(([k, v]) => <div className="skill-group" key={k}><h3>{t.groups[k]}</h3><div>{v.map(x => <span key={x}>{x}</span>)}</div></div>)}</div>
          </div>
        </section>

        <section id="experience" className="section section-pad">
          <Reveal><div className="section-heading"><span className="section-number">04</span><div><p className="eyebrow">{t.expLabel}</p><h2>{t.hx}</h2></div></div></Reveal>
          <div className="timeline">
            {t.tl.map(([w, a, b], i) => <Reveal key={a} delay={i * .06}><div className="timeline-item"><span className="timeline-year">{w}</span><div className="timeline-line"><i/></div><div><h3>{a}</h3><p>{b}</p></div></div></Reveal>)}
          </div>
        </section>

        <section id="contact" className="contact section-pad">
          <div className="contact-orb parallax" />
          <Reveal><p className="eyebrow">{t.contactLabel}</p><h2>{t.ch}</h2><p className="contact-copy">{t.cs}</p>
            <a className="contact-email magnetic" href="mailto:0omarahmed73@gmail.com"><Magnetic>0omarahmed73@gmail.com <span>↗</span></Magnetic></a>
            <div className="socials">{[['WhatsApp','https://wa.me/201553583288'],['LinkedIn','https://linkedin.com/in/0omarahmed73'],['GitHub','https://github.com/0omarahmed73']].map(([n,u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n} ↗</a>)}</div>
          </Reveal>
          <footer><span>© {new Date().getFullYear()} Omar Ahmed Saeed</span><span>CAIRO / EGYPT</span><span>BUILDING DIGITAL SYSTEMS</span></footer>
        </section>
      </main>
    </div>
  );
}
