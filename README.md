# Punto P

Simple animated landing page for the Punto P pizzeria. Built with Vite, TypeScript and GSAP.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # type-checks, then outputs the site to dist/
npm run preview    # serves dist/ locally
```

## Deploy on Vercel (free tier)

1. Push this folder to a GitHub repo and import it at vercel.com/new.
2. Vercel detects Vite automatically. Confirm the settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy. Every push to the main branch redeploys.

## Editing

- Logo: `index.html` (the SVG paths come from `logos/sgv/logo_black.svg`). Parts are tagged `.letter`, `.disc` and `.swirl`.
- Colors: `src/style.css` (`--red`, and the `data-theme` blocks).
- Animation: `src/main.ts` (intro, idle motion and the color swap).
