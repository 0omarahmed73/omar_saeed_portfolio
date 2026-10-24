# Digital Pantheon — Atlas Edition (prototype)

Isolated static prototype. Not part of the Next.js app; nothing in `app/`, `components/` or `lib/` was changed.

Preview: open `index.html` in a browser (needs internet only for Google Fonts). Optional: `python3 -m http.server` in this folder.

## Content
- `allProjects` in `index.html` is a read-only copy of `projects` in `lib/data.js` (11 projects, categories, tags, live links). Re-sync if production data changes.
- Featured night-sky projects: MOC, Etatwir, Plementus, Joviality. Panel text is the production description only; no invented scope, metrics or technologies.
- Needs your confirmation (do not guess): the repo's `lib/data.js` has live URLs for Etatwir, Egyptwood, Oddny, United Elevators and Indoqat. The deployed omarasaeed.dev showed "Live site" on different entries (MOC, Joviality, NOB, Oddny, United Elevators), so the repo and the deployed site disagree. Confirm which links are correct.
- Not in the data at all: per-project role/responsibility detail, outcomes or metrics, and any deeper engineering write-up. Add these before the featured panels can carry real case studies.

## Atlas (placeholder)
The figure is an inline SVG, not a production asset. To replace it you need ONE of:
1. A properly licensed marble Atlas model (glTF/GLB, under ~2 MB, Draco-compressed) plus its licence text, or
2. A commissioned/illustrated transparent PNG/WebP/SVG of Atlas with raised hands (about 1600x1760, hands open at top-centre).
Then swap the `<svg>` inside `#atlas`. The sphere is positioned from the hands at roughly 4.5% below the top of the figure box (`hy` in `draw()`); adjust that ratio for the new asset.
No model licences have been verified.

## Known limits
- Sphere is a 2D canvas, not the production Three.js network (`components/Network.js`); reuse it when migrating.
- Fonts load from Google Fonts.
- Scroll feel on a real touch device is untested.
