# The Digital Pantheon — Atlas Edition

Design prototype for a redesign of the portfolio of **Omar A. Saeed** (Odoo developer and frontend engineer, https://www.omarasaeed.dev/).

This folder is an **isolated static prototype**. It is not part of the Next.js app. Nothing in `app/`, `components/`, `lib/` or any production config was changed.

## Concept

Classical mythology reinterpreted through modern engineering. Atlas carries a celestial sphere, a metaphor for software that carries the weight of a business.

- **Direction:** B, "Atlas Orrery". An ivory editorial hero turns, as you scroll, into a deep-navy night sky where each featured project is a star on the sphere.
- **Palette:** Papyrus `#F3EFE5`, Obsidian `#101725`, Relic Gold `#B9975B`. Plum `#56345F` and Patina `#6B8F88` are defined but not used yet.
- **Type:** Cormorant (serif display) and Instrument Sans (body), both from Google Fonts.
- **Hero copy (kept as written):** "Software that carries the weight of a business." / "I'm Omar A. Saeed, an Odoo developer and frontend engineer. I build the systems companies run on, and make them feel considered."
- **Logo:** circular "A" monogram (`logo-b.svg`, lockup in `logo.svg`).

## Preview

Open `index.html` in a browser. It needs internet only for the Google Fonts. Optionally run `python3 -m http.server` in this folder.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole prototype: styles, markup and script in one file |
| `logo.svg` | Full lockup: monogram and "Omar A. Saeed" (text is live, not outlined) |
| `logo-b.svg` | Chosen mark: sphere monogram |
| `logo-mark.svg`, `logo-c.svg` | Rejected alternatives, kept for reference |
| `README.md` | This file |
| `atlas-3d.html` | **Experiment.** Procedural 3D Atlas (metaball marble figure and gold armillary sphere). Self-contained, about 950 KB with Three.js inlined. Open it through a local server: `python3 -m http.server`, then `/atlas-3d.html` (the preview pane refused it as a plain file) |
| `atlas3d/atlas.js`, `atlas3d/build.py` | Source of the experiment and the script that inlines Three.js from `node_modules` to produce `atlas-3d.html` |
| `private-notes/LINKS-AUDIT.md` (local only, git-ignored) | Links and deployment audit, with a table of questions for Omar |
| `private-notes/PROJECT-NOTES.md` (local only, git-ignored) | Draft engineering notes per featured project, with verified facts separated from claims to confirm |
| `private-notes/ATLAS-ASSET-RESEARCH.md` (local only, git-ignored) | Atlas asset candidates and licence status (nothing downloaded) |
| `logo-compare.html` | Untracked helper that compares the logo options. Safe to delete |

## What is finished

- **Hero:** ivory page, three-line headline, CTAs, gold celestial sphere resting in Atlas's raised hands.
- **Atlas figure:** redrawn as a vector marble figure, with bent elbows, raised forearms, a bearded bowed face, and a gold rim light. It is still a placeholder (see below).
- **Sphere:** thin gold parallels and meridians, an ecliptic ring, and sparse constellation points. It moves from the hands to the centre of the night scene.
- **Ivory-to-night transition:** driven by scroll position. The hero fades first, then Atlas, then the background turns to navy, then the project panel fades in. There is no scroll hijacking, just a shorter sticky section (340vh desktop, 400vh mobile).
- **Featured projects:** four night-sky panels (MOC, Etatwir, Plementus, Joviality). Each shows category, title, client, description, tags and a live link where the data has one. A rail on the side jumps between them.
- **Plain project list ("Selected work, in plain sight."):** all 11 projects with category filters (All, ERP, Website, Dashboard, AI, Real Estate, Upgrade) and live links. It works without the animation.
- **Accessibility and behaviour:**
  - A "Skip to all projects" link appears on keyboard focus.
  - Hidden project panels and the rail cannot be tabbed to.
  - With `prefers-reduced-motion`, the pin and project panels are switched off.
- **Responsive:** checked at 1440px, 900px (tablet) and phone width. No horizontal overflow was seen. The mobile night panel has a dark gradient backing for readability.
- **Content accuracy:** project text is a read-only copy of `lib/data.js`. All draft and invented "engineering" lines were removed.
- **Console:** no errors when the page loads.

## What is not finished

- **Atlas is a flat SVG placeholder,** not a premium sculptural figure. The sphere sits between his hands more than being cradled.
- **The sphere is a 2D canvas,** not the production Three.js network in `components/Network.js`. Reusing that code is a migration task.
- **Reduced-motion mode was written but never run,** because the browser tooling I used could not emulate it.
- **Real touch-device scroll feel is untested.** I only inspected static screenshots and resized frames.
- **The scroll transition was judged from screenshots at several positions,** not from watching it play. How it feels while scrolling is for you to judge.
- **The logo text is live,** so it falls back to Georgia where Cormorant is not loaded. Convert the text to outlines before production use.
- **Not yet designed:** the Capabilities, Experience, Contact and footer sections, the ⌘K command palette, the theme and accent-colour options, and the intro. The brief asked for a short, elegant, skippable intro, and none has been built.
- **Plum and Patina** are in the palette but unused.
- **Fonts load from Google Fonts,** so they should be self-hosted for production.

## Atlas, zero-budget path

No purchases or paid work. The prototype keeps the SVG Atlas in `index.html` as the fallback and adds a free procedural 3D experiment in `atlas-3d.html`: a smooth marble figure made with Three.js MarchingCubes metaballs, a gold armillary sphere with constellation links, a pointer-driven turn, an idle sway that stops with reduced motion, and rendering that pauses off-screen. **It is not wired into the hero yet.**

Assessment from screenshots: the gold sphere looks premium. The figure reads as smooth clay, not carved marble. Next steps if you continue it: sharper anatomy (shoulders, jaw, hands), a stronger shadow side, a bump map for stone grain, and a lazy-loaded integration with the SVG as fallback.

## What we need

1. **An Atlas asset.** One of:
   - A properly licensed marble Atlas 3D model (glTF/GLB, ideally under about 2 MB and Draco-compressed) plus its licence text.
   - A commissioned or illustrated transparent PNG, WebP or SVG of Atlas with raised hands, about 1600x1760, hands open at the top centre.
   Then swap the `<svg>` inside `#atlas`. The sphere is placed from the hands at roughly 4.5% below the top of the figure box (`hy` in `draw()`), so adjust that ratio for the new asset. **No model licences have been verified.**
2. **Link decisions.** The repo and the deployed site agree on all live links (see `private-notes/LINKS-AUDIT.md` (local only, git-ignored); an earlier note here saying they disagreed was wrong). Open questions: public links for private client systems, the canonical portfolio URL, and the details in `private-notes/LINKS-AUDIT.md` (local only, git-ignored).
3. **Real engineering detail per project.** See `private-notes/PROJECT-NOTES.md` (local only, git-ignored). The data has only short descriptions. It has no per-project role, responsibilities, outcomes or metrics. Featured panels cannot tell a deeper engineering story until these exist. Nothing has been invented.
4. **A decision on the Arabic or RTL version.** I did not check whether the production site supports it.
5. **A decision on the remaining sections** (see "Not yet designed" above) and on whether to build the intro.
6. **A real-device scroll test** on a phone and a tablet.

## Known data note

`allProjects` in `index.html` is a copy of `projects` in `lib/data.js` (11 projects with categories, tags and links). If production data changes, update the copy.

## Suggested next phases

1. Source or commission the Atlas asset, then replace the placeholder.
2. Design the remaining sections in the same visual system.
3. Decide on the intro and build it, skippable.
4. Add real engineering detail to the project data.
5. Plan the migration into the Next.js app, reusing `components/Network.js` and the existing GSAP and Lenis setup. Do not upgrade the framework or add dependencies without a clear reason.
6. Run accessibility and performance checks on a real build.

## Git state

Prototype work is committed locally on `main` and **nothing has been pushed**, by your instruction. Do not push until you say the work is finished.
