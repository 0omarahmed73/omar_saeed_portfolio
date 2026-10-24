export const skills={
 Odoo:['Custom modules','OWL 2','XML / QWeb','Client actions','ORM','Website','Odoo.sh'],
 Frontend:['JavaScript','React.js','Vue.js','HTML','CSS','SASS','Tailwind','Bootstrap'],
 Backend:['Python','Controllers','REST APIs','Node.js','PostgreSQL','MySQL'],
 Tools:['Git','GitHub','Vite','Figma']
};

export const D={
 en:{
  dir:'ltr',nav:['Overview','Projects','Skills','Experience','Contact'],
  eyebrow:'Odoo Developer / Frontend Engineer',
  h1:['Interfaces that','feel like products.'],
  sub:"I'm Omar A. Saeed — a frontend-focused Odoo developer at Plementus. I build polished digital experiences that make complex business workflows feel simple.",
  cta:['Explore work','Download CV'],scroll:'Scroll to explore',
  stats:[[2,'years building with Odoo'],[14,'projects & systems'],[2,'professional certifications']],
  workLabel:'Selected work',workNote:'From ERP systems and AI attendance to real-estate tools, dashboards and complete websites.',hp:'Selected work',
  stackLabel:'Capabilities',hs:'My stack',
  skillStatement:'I care about the last 10% — the motion, spacing, feedback and tiny details that make software feel intentional.',
  expLabel:'Career path',hx:'Experience',
  projects:[
   ['MOC Internal Management System','Saudi Ministry of Culture','Contributed to a full internal operations system covering maintenance and hospitality, including Figma-based kitchen and kiosk interfaces, a POS-style Odoo app, mobile APIs and real-time Firebase notifications.',['OWL','REST APIs','Firebase','Webview'],'MOC','ERP'],
   ['Etatwir E-learning Platform','Odoo / E-learning','Developed a full e-learning platform with separate experiences for individuals, instructors and companies, including dashboards, enrollment, content delivery and progress tracking.',['Odoo Website','Dashboards','Multi-role'],'ETATWIR','Website','https://www.etatwir.com/'],
   ['Plementus Website & Team Dashboard','Odoo / Company Platform','Developed the company website from scratch and built an internal team dashboard with task stages, performance charts, role-based views and live frontend/backend integration.',['Odoo','Charts','Role-based views'],'PLEMENTUS','Dashboard'],
   ['Joviality','AI / Attendance System','Built the Face ID attendance module for an Odoo deployment, using on-device face recognition (face-api.js) to bring automated identity checks into an operational attendance workflow.',['Face ID','face-api.js','Odoo','Attendance'],'JOVIALITY','AI'],
   ['Egyptwood','Odoo / Inventory & Website','Contributed to the website and implemented inventory and stock-related features within the business workflow.',['Odoo','Inventory','Stock'],'EGYPTWOOD','ERP','https://www.egyptwood.com/'],
   ['Marseilia','Real Estate / Odoo','Created a real-estate masterplan experience and developed phone-notes widgets to support property workflows and everyday team interactions.',['Masterplan','Leaflet','Widgets'],'MARSEILIA','Real Estate'],
   ['MRC','Odoo 18 Upgrade','Upgraded the login portal to Odoo 18, adapting the authentication experience to the newer Odoo version.',['Odoo 18','Portal','Authentication'],'MRC','Upgrade'],
   ['NOB','Employee Dashboard','Created a complete employee dashboard to bring employee information and workflows into a focused, usable interface.',['Odoo','Dashboard','Employee UX'],'NOB','Dashboard'],
   ['Oddny','Website / Odoo','Created the entire website, from the overall interface and layouts through responsive frontend implementation and Odoo integration.',['Odoo Website','Frontend','Responsive UI'],'ODDNY','Website','https://www.oddny.co/'],
   ['United Elevators','Website / Odoo','Created the entire website with a custom frontend experience, responsive layouts and Odoo-powered content and business integration.',['Odoo Website','Frontend','Responsive UI'],'UNITED ELEVATORS','Website','https://www.unitedelevators.net/'],
   ['Indoqat','Corporate Website','Developed the company website, creating the frontend experience and responsive pages for the company’s online presence.',['Website','Frontend','Responsive UI'],'INDOQAT','Website','https://www.indoqat.com/'],
   ['Sarmad','Arabic editorial magazine','An Arabic, right-to-left editorial magazine about ancient myths and civilizations. My work: the identity, the layout system, the Arabic admin theme, search and the Heroku deployment. Built with AI coding assistants under my direction.',['Next.js','Payload CMS','PostgreSQL','Cloudflare R2','Arabic RTL'],'SARMAD','Website','https://sarmadstories.cc/'],
   ['TAIF','Open-source desktop and Android app','A free, local-first, open-source (GPL-3.0) app for trimming, cutting, compressing and converting audio, video and image files, with on-device vocal separation, in English, Arabic and Portuguese. I designed the visual identity and brand. Runs on desktop and Android (tested on a physical Android phone). Built with AI coding assistants under my direction.',['Tauri','React','TypeScript','Rust','Kotlin'],'TAIF','Open Source','https://taif-chi.vercel.app/','https://github.com/0omarahmed73/TaifVisual'],
   ['UNS (أُنس)','Android app','An Arabic, right-to-left Flutter app for Android with daily azkar, a digital tasbeeh, prayer times, a daily verse and hadith, and local reminders. Source available on GitHub.',['Flutter','Dart','Arabic RTL'],'UNS','Mobile','','https://github.com/0omarahmed73/UNSAzkar']
  ],
  tl:[
   ['Sep 2024 — now','Odoo Developer · Plementus','Custom modules, OWL interfaces, websites and backend integrations.'],
   ['2025','Odoo Functional Certification · FTCO','Odoo workflows, modules and business customization.'],
   ['2024','Node.js Diploma · Route','Express, REST APIs, JWT, MySQL and MongoDB.'],
   ['Education','B.Sc. Communication & Computer Engineering','Shoubra Faculty of Engineering, Benha University. GPA 3.71, Excellent with Honors.']
  ],
  contactLabel:'05 / Let’s talk',ch:'Have a complex Odoo idea?',cs:'Tell me what you are building. Email or WhatsApp works best.',
  groups:{Odoo:'Odoo',Frontend:'Frontend',Backend:'Backend & data',Tools:'Tools'}
 }
};

// Atlas hero, featured scroll experience and project filters (Phase 1 of the redesign).
export const atlas = {
  headline: ['Software that', 'carries', 'the weight', 'of a business.'],
  sub: "I'm Omar A. Saeed, an Odoo developer and frontend engineer. I build the systems companies run on, and make them feel considered.",
  cta: ['Selected work', 'Download CV'],
  cue: 'Scroll. The sky turns to night.',
  // Featured projects shown on the night-sky sphere; lat/lon place each star on the globe (radians).
  featured: [
    { name: 'MOC Internal Management System', lat: .45, lon: -.6 },
    { name: 'Etatwir E-learning Platform', lat: -.3, lon: .5 },
    { name: 'Plementus Website & Team Dashboard', lat: .15, lon: 1.7 },
    { name: 'Joviality', lat: -.55, lon: -2.2 }
  ],
  categories: ['All', 'ERP', 'Website', 'Dashboard', 'AI', 'Real Estate', 'Upgrade', 'Open Source', 'Mobile'],
  listTitle: 'Selected work, in plain sight.',
  listNote: 'Every project, readable without the animation.'
};

// Attribution for the Atlas render (CC BY 4.0 requires creator, source link, licence link and a note of changes).
export const ATLAS_SOURCE = 'https://sketchfab.com/3d-models/atlas-holding-the-earth-32002a1de62b4b3face6dd55043b6cf6';
// The still image used only if the 3D model cannot load comes from a second CC BY 4.0 model.
export const ATLAS_FALLBACK_SOURCE = 'https://sketchfab.com/3d-models/atlas-62db2034e9a64301a961ad8dfc08cc93';
export const ATLAS_LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
