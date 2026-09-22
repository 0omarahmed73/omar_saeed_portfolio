'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Network from '@/components/Network';
import { D, skills } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const ids = ['overview', 'projects', 'skills', 'experience', 'contact'];
const COLOR_STORAGE_KEY = 'omar-portfolio-primary';
const THEME_STORAGE_KEY = 'omar-portfolio-theme';
const DEFAULT_COLOR = '#b8ff3d';
const DEFAULT_THEME = 'dark';

const COLOR_PALETTE = [
  { name: 'Acid', value: '#b8ff3d' },
  { name: 'Electric Blue', value: '#5ee7ff' },
  { name: 'Violet', value: '#9b7cff' },
  { name: 'Coral', value: '#ff6b6b' },
  { name: 'Amber', value: '#ffc857' },
  { name: 'Mint', value: '#5ff2b3' },
];

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

function ColorPalette({ color, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  return (
    <div ref={ref} className={`color-picker ${open ? 'is-open' : ''}`}>
      <button type="button" className="color-picker-trigger magnetic" aria-label="Change primary color" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        <span className="color-picker-dot" style={{ backgroundColor: color }} />
        <span className="color-picker-label">COLOR</span>
      </button>
      {open && <div className="color-palette" role="group" aria-label="Primary color palette">
        {COLOR_PALETTE.map(item => <button type="button" key={item.value} className={`color-swatch ${color.toLowerCase() === item.value.toLowerCase() ? 'is-selected' : ''}`} style={{ '--swatch': item.value }} aria-label={`Use ${item.name}`} aria-pressed={color.toLowerCase() === item.value.toLowerCase()} onClick={() => { onChange(item.value); setOpen(false); }} />)}
        <label className="custom-color" title="Choose any color">
          <input type="color" value={color} aria-label="Choose a custom primary color" onChange={event => onChange(event.target.value)} />
          <span className="custom-color-swatch" style={{ backgroundColor: color }} />
          <span className="custom-color-plus">+</span>
        </label>
      </div>}
    </div>
  );
}

function ThemeToggle({ theme, onChange }) {
  const light = theme === 'light';
  return <button type="button" className="theme-toggle magnetic" aria-label={`Switch to ${light ? 'dark' : 'light'} theme`} onClick={() => onChange(light ? 'dark' : 'light')}>
    <span className="theme-icon" aria-hidden="true">{light ? '☾' : '☼'}</span>
    <span className="theme-label">{light ? 'LIGHT' : 'DARK'}</span>
  </button>;
}

function InteractiveStack() {
  const groups = Object.entries(skills);
  const [active, setActive] = useState('Odoo');
  const current = skills[active];
  return <div className="stack-interactive">
    <div className="stack-orbit" aria-label="Interactive technology stack">
      <div className="stack-core"><span>OMAR</span><strong>{active}</strong><small>{current.length} skills</small></div>
      {groups.map(([name], i) => <button key={name} type="button" className={`stack-node stack-node-${i} ${active === name ? 'is-active' : ''}`} onClick={() => setActive(name)} onMouseEnter={() => setActive(name)}>{name}</button>)}
    </div>
    <div className="stack-details" aria-live="polite">
      {current.map(skill => <span key={skill}>{skill}</span>)}
    </div>
  </div>;
}

function CommandPalette({ open, onClose, onTheme, onColor }) {
  const inputRef = useRef(null);
  const commands = [
    ['Projects', '#projects'], ['Skills', '#skills'], ['Experience', '#experience'], ['Contact', '#contact'],
  ];
  useEffect(() => { if (open) requestAnimationFrame(() => inputRef.current?.focus()); }, [open]);
  useEffect(() => {
    const key = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); onClose(); } };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  if (!open) return null;
  return <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Portfolio command palette" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="command-palette">
      <div className="command-search"><span>⌘K</span><input ref={inputRef} placeholder="Search portfolio..." aria-label="Search portfolio" /></div>
      <div className="command-list">
        {commands.map(([label, href], i) => <a key={href} href={href} onClick={onClose}><b>{String(i + 1).padStart(2, '0')}</b>{label}<span>↗</span></a>)}
        <button type="button" onClick={() => { onTheme(); onClose(); }}><b>05</b>Toggle theme<span>◐</span></button>
        <button type="button" onClick={() => { onColor('#b8ff3d'); onClose(); }}><b>06</b>Reset accent color<span>●</span></button>
      </div>
      <div className="command-footer"><span>ESC to close</span><span>Navigate with mouse or keyboard</span></div>
    </div>
  </div>;
}

export default function Page() {
  const root = useRef(null);
  const cursor = useRef(null);
  const progress = useRef(null);
  const progressLabel = useRef(null);
  const t = D.en;
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All');
  const filterAnimated = useRef(false);

  useEffect(() => {
    if (projectFilter === 'All' && !filterAnimated.current) return;
    filterAnimated.current = true;
    const cards = gsap.utils.toArray('.project-card');
    const visible = cards.filter(card => !card.classList.contains('is-filtered'));
    if (!visible.length) return;

    // Filtering changes the DOM layout. The original scroll-triggered reveal can
    // leave newly promoted cards at opacity: 0, so reset the card state and
    // play a dedicated entrance animation after React has painted the new layout.
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger?.classList?.contains('project-card')) trigger.kill();
    });
    gsap.killTweensOf(cards);
    gsap.set(cards, { clearProps: 'opacity,transform' });

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      gsap.fromTo(visible,
        { y: 36, opacity: 0, rotateX: 4 },
        { y: 0, opacity: 1, rotateX: 0, duration: .65, stagger: .07, ease: 'power3.out', overwrite: 'auto' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [projectFilter]);

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    const savedColor = window.localStorage.getItem(COLOR_STORAGE_KEY);
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedColor && /^#[0-9a-f]{6}$/i.test(savedColor)) setPrimaryColor(savedColor);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    if (hydrated) window.localStorage.setItem(COLOR_STORAGE_KEY, primaryColor);
  }, [primaryColor, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (hydrated) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    const key = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(v => !v); } if (event.key === 'Escape') setCommandOpen(false); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heroGrid = document.querySelector('.hero-grid');
    if (reduceMotion && heroGrid) { heroGrid.style.visibility = 'visible'; heroGrid.style.opacity = '1'; heroGrid.style.clipPath = 'none'; }

    const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduceMotion, syncTouch: !reduceMotion, touchMultiplier: 1.15, anchors: true });
    const raf = time => lenis.raf(time * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);

    const updateProgress = ({ scroll }) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, scroll / max)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${ratio})`;
      const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
      let current = sections[0]?.id || 'overview';
      sections.forEach(section => { if (scroll >= section.offsetTop - window.innerHeight * .35) current = section.id; });
      if (progressLabel.current) progressLabel.current.textContent = current.toUpperCase();
    };
    lenis.on('scroll', updateProgress);

    const handleAnchorClick = event => {
      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault(); lenis.scrollTo(target, { offset: 0, duration: 1.15 }); window.history.replaceState(null, '', href);
    };
    document.addEventListener('click', handleAnchorClick, true);

    const ctx = gsap.context(() => {
      if (heroGrid) gsap.set(heroGrid, { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)' });
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.nav-reveal', { y: -20, opacity: 0, duration: .7, stagger: .05 })
        .to('.hero-grid', { clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power4.inOut' }, '-=.15')
        .from('.hero-line', { yPercent: 120, opacity: 0, duration: 1.1, stagger: .12 }, '-=.55')
        .from('.hero-copy', { y: 25, opacity: 0, duration: .8 }, '-=.55')
        .from('.hero-actions', { y: 20, opacity: 0, duration: .6 }, '-=.45');

      if (!reduceMotion) {
        gsap.utils.toArray('.project-card').forEach((card, i) => gsap.from(card, { y: 80, opacity: 0, rotateX: 8, duration: 1, delay: i * .08, ease: 'power4.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } }));
        gsap.utils.toArray('.parallax').forEach(el => gsap.to(el, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
        gsap.utils.toArray('.count').forEach(el => { const o = { n: 0 }; gsap.to(o, { n: +el.dataset.v, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = Math.round(o.n); } }); });
      }
    }, root);

    return () => { document.removeEventListener('click', handleAnchorClick, true); lenis.off('scroll', updateProgress); ctx.revert(); lenis.destroy(); gsap.ticker.remove(raf); };
  }, []);

  useEffect(() => {
    const dot = cursor.current;
    if (!dot || window.matchMedia('(pointer: coarse)').matches) return;
    const move = e => gsap.to(dot, { x: e.clientX, y: e.clientY, duration: .18, ease: 'power2.out' });
    const over = () => dot.classList.add('cursor-active'); const out = () => dot.classList.remove('cursor-active');
    window.addEventListener('pointermove', move);
    const bind = () => document.querySelectorAll('a,button,.magnetic').forEach(el => { el.addEventListener('pointerenter', over); el.addEventListener('pointerleave', out); });
    bind();
    return () => { window.removeEventListener('pointermove', move); document.querySelectorAll('a,button,.magnetic').forEach(el => { el.removeEventListener('pointerenter', over); el.removeEventListener('pointerleave', out); }); };
  }, []);

  useEffect(() => {
    const cards = [...document.querySelectorAll('.project-card')];
    if (!cards.length || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cleanups = cards.map((card, index) => {
      const visual = card.querySelector('.project-visual');
      const ui = card.querySelector('.visual-ui');
      const filter = document.querySelector(`#distort-${index} feDisplacementMap`);
      const turbulence = document.querySelector(`#distort-${index} feTurbulence`);
      const move = e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5; const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(ui, { rotateY: x * 7, rotateX: -y * 6, x: x * 12, y: y * 10, duration: .45, ease: 'power3.out' });
        if (filter) gsap.to(filter, { attr: { scale: 10 + Math.abs(x + y) * 8 }, duration: .3 });
        if (turbulence) turbulence.setAttribute('baseFrequency', `${0.012 + Math.abs(x) * .015} ${0.018 + Math.abs(y) * .02}`);
      };
      const enter = () => { card.classList.add('is-distorting'); visual.style.filter = `url(#distort-${index})`; if (filter) gsap.to(filter, { attr: { scale: 12 }, duration: .35 }); };
      const leave = () => { card.classList.remove('is-distorting'); visual.style.filter = 'none'; gsap.to(ui, { rotateY: -7, rotateX: 7, x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.5)' }); if (filter) gsap.to(filter, { attr: { scale: 0 }, duration: .55 }); };
      card.addEventListener('pointermove', move); card.addEventListener('pointerenter', enter); card.addEventListener('pointerleave', leave);
      return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave); };
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  const toggleTheme = () => setTheme(v => v === 'light' ? 'dark' : 'light');

  return <div ref={root} className="site-shell">
    <svg className="project-filters" aria-hidden="true"><defs>{t.projects.map((_, i) => <filter key={i} id={`distort-${i}`} x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="2" seed={i + 4} /><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" /></filter>)}</defs></svg>
    <div className="scroll-progress"><span ref={progress} /><b ref={progressLabel}>OVERVIEW</b></div>
    <div ref={cursor} className="cursor-dot" aria-hidden="true" />
    <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onTheme={toggleTheme} onColor={setPrimaryColor} />

    <aside className="desktop-nav">
      <a href="#overview" className="nav-reveal brand">O<span>.</span></a><div className="nav-rule" />
      <nav>{ids.map((id, i) => <a key={id} href={'#' + id} className="nav-reveal">{String(i + 1).padStart(2, '0')} <span>{t.nav[i]}</span></a>)}</nav>
      <div className="nav-bottom"><ColorPalette color={primaryColor} onChange={setPrimaryColor} /><ThemeToggle theme={theme} onChange={setTheme} /><span className="vertical-label">AVAILABLE FOR SELECT PROJECTS</span></div>
    </aside>

    <header className="mobile-nav"><a href="#overview" className="brand">O<span>.</span></a><div className="mobile-nav-tools"><ThemeToggle theme={theme} onChange={setTheme} /><ColorPalette color={primaryColor} onChange={setPrimaryColor} /><span className="mobile-status">AVAILABLE FOR SELECT PROJECTS</span></div></header>

    <section id="overview" className="hero section-pad"><Network primaryColor={primaryColor} /><div className="hero-grid">
      <div className="hero-index">01 / 05</div><div className="hero-content"><p className="eyebrow hero-copy">{t.eyebrow}</p><h1 className="hero-animated">{t.h1.map((s,i)=><span key={i} className="hero-line-wrap"><span className="hero-line">{s}</span></span>)}</h1><p className="hero-copy hero-description">{t.sub}</p><div className="hero-actions"><a href="#projects" className="button button-solid magnetic"><Magnetic>{t.cta[0]} <span>↘</span></Magnetic></a><a href="/cv.pdf" download className="button button-ghost magnetic"><Magnetic>{t.cta[1]} <span>↓</span></Magnetic></a></div></div><div className="hero-side parallax"><span>ODOO</span><span>FRONTEND</span><span>PRODUCT</span></div>
    </div><div className="scroll-cue"><span /> {t.scroll}</div></section>

    <section className="stats">{t.stats.map(([v,s])=><div key={s} className="stat"><strong><span className="count" data-v={v}>{v}</span><sup>+</sup></strong><span>{s}</span></div>)}</section>

    <main>
      <section id="projects" className="section section-pad"><Reveal><div className="section-heading"><span className="section-number">02</span><div><p className="eyebrow">{t.workLabel}</p><h2>{t.hp}</h2></div><p className="heading-note">{t.workNote}</p></div></Reveal>
        <div className="project-toolbar" role="tablist" aria-label="Filter projects">{['All','ERP','Website','Dashboard','AI','Real Estate','Upgrade'].map(filter => <button key={filter} type="button" role="tab" aria-selected={projectFilter === filter} className={projectFilter === filter ? 'is-active' : ''} onClick={() => setProjectFilter(filter)}>{filter}</button>)}</div>
        <div className="project-grid">{t.projects.map(([n,s,b,tags,accent,category,url],i)=>{ const visible = projectFilter === 'All' || category === projectFilter; return <article key={n} className={`project-card project-${i} ${visible ? '' : 'is-filtered'}`} aria-hidden={!visible}><div className="project-visual"><div className="browser"><i/><i/><i/></div>{url && <a className="project-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${n} website in a new tab`} title="Open live website"><span aria-hidden="true">↗</span><small>LIVE SITE</small></a>}<div className="visual-ui"><span className="visual-title">{accent}</span><div className="visual-bars"><b/><b/><b/><b/></div><div className="visual-panel"><em/><em/><em/></div><span className="visual-live">INTERACTIVE PREVIEW</span></div><span className="project-number">{String(i + 1).padStart(2, '0')}</span><span className="distort-label">MOVE TO DISTORT</span></div><div className="project-info"><div><p className="project-type">{s}</p><h3>{n}</h3></div><p>{b}</p><ul>{tags.map(x=><li key={x}>{x}</li>)}</ul><span className="project-category">{category}</span></div></article>})}</div>
      </section>

      <section id="skills" className="section section-pad skills-section"><Reveal><div className="section-heading"><span className="section-number">03</span><div><p className="eyebrow">{t.stackLabel}</p><h2>{t.hs}</h2></div><p className="heading-note">Click a discipline to explore the tools behind my systems.</p></div></Reveal><div className="skills-layout"><div className="skill-statement parallax">{t.skillStatement}</div><InteractiveStack /></div></section>

      <section id="experience" className="section section-pad"><Reveal><div className="section-heading"><span className="section-number">04</span><div><p className="eyebrow">{t.expLabel}</p><h2>{t.hx}</h2></div></div></Reveal><div className="timeline">{t.tl.map(([w,a,b],i)=><Reveal key={a} delay={i*.06}><div className="timeline-item"><span className="timeline-year">{w}</span><div className="timeline-line"><i/></div><div><h3>{a}</h3><p>{b}</p></div></div></Reveal>)}</div></section>

      <section id="contact" className="contact section-pad"><div className="contact-orb parallax" /><Reveal><p className="eyebrow">{t.contactLabel}</p><h2>{t.ch}</h2><p className="contact-copy">{t.cs}</p><a className="contact-email magnetic" href="mailto:0omarahmed73@gmail.com"><Magnetic>0omarahmed73@gmail.com <span>↗</span></Magnetic></a><div className="socials"><a href="https://wa.me/201553583288" target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="https://linkedin.com/in/0omarahmed73" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/0omarahmed73" target="_blank" rel="noreferrer">GitHub ↗</a></div></Reveal><footer><span>© {new Date().getFullYear()} Omar Ahmed Saeed</span><span>CAIRO / EGYPT</span><span>⌘K COMMANDS</span></footer></section>
    </main>
  </div>;
}
