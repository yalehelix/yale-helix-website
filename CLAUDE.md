# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Marketing and applications website for Yale Helix, an undergraduate-run healthcare/biotech startup incubator (deployed at **yalehelix.org**, see `CNAME`). Next.js 14 App Router, TypeScript, Tailwind CSS, with `motion` (Motion for React) for animation.

## Commands

```bash
yarn dev      # Dev server at http://localhost:3000
yarn build    # Production build
yarn start    # Serve the production build
yarn lint     # ESLint (next lint)
npx tsc --noEmit   # Type-check only (does NOT touch .next/)
```

- **Package manager is Yarn** (`yarn.lock` is the source of truth; a stale `package-lock.json` also exists — don't use npm).
- **There are no tests.** Files under `scripts/` are standalone Node utilities (e.g. `node scripts/compress-images.js`), not part of the build.
- **Do not run `yarn build` while a `yarn dev` server is running** — both write to `.next/` and corrupt each other (the dev server then 404s its CSS/JS and renders unstyled). Use `npx tsc --noEmit` to verify while dev is up; only run a full build with dev stopped. Recovery: stop dev, `rm -rf .next && yarn dev`.

## Architecture

### Homepage = composed React sections
`src/app/page.tsx` composes section components from `src/app/components/sections/` (`Nav`, `Hero`, `Features`, `WhatWeDo`, `Stats`, `Timeline`, `Portfolio`, `Team`, `People` (AdvisoryBoard + Fellows), `Sponsors`, `Footer`). All editable homepage copy/data lives in **`src/lib/content.ts`** — change content there, not inside components.

### Design system (Tailwind tokens)
Colors, fonts, and radii are defined as tokens in `tailwind.config.ts`; components use those, never raw hex. Conventions enforced across the site:
- **Refined-dark base**: off-black `bg` (#0a0a0a, never pure `#000`), off-white `text` (#f4f5f6, never pure `#fff`), single accent `accent` (#4268ff), deep `yale` (#00356b). Error is `error`.
- **Light bands**: `WhatWeDo` + `Stats` render as one rounded light panel over the dark page using `light`/`light-surface`/`ink`/`ink-muted`/`light-line` tokens (a subtle blue radial gradient keeps them off pure-white). This is an intentional dark↔light alternation.
- **Fonts** via `next/font/google` in `src/app/layout.tsx`: `Space Grotesk` (display, `font-display`) + `Outfit` (body, `font-body`). Avoid Inter.
- Global base styles, smooth scroll, and a `prefers-reduced-motion` reset live in `src/app/globals.css`. Root font-size is bumped (17px, 18px ≥1280px).

### Motion
Animations use `motion/react` (`useScroll`, `whileInView`, `useReducedMotion`, count-up via `animate`). Anything animated must degrade under reduced motion. WebGL/3D is **not** used (a react-three-fiber helix was prototyped and removed).

### Forms
React form pages styled with Tailwind via shared class strings in `src/app/components/ui.ts`; the reusable drag-drop uploader is `src/app/components/FileUpload.tsx`. Three flows:
- **Startup application** (`/apply-startups`) → submits to **Google Forms** in a hidden iframe (hardcoded `entry.<id>` field map in `submitFormToGoogle`), then uploads the pitch deck to `/api/apply-startup/upload-startup`. The form is config-driven (`SECTIONS` array of `Field`s; supports text/url/email/textarea/select/checkboxes/radio). **When you add a form field, also map its `entry.<id>` in `submitFormToGoogle`, or its data is collected but not submitted.** (The Mentorship and Students sections currently lack entry IDs — see the NOTE in that file.)
- **Interest form** (`/interest-form`) → POSTs to `/api/submit-interest` (which forwards to Google Forms), with a client-side Google Forms fallback.
- **Student application** (`/apply`) is currently a closed-state page; `/students` is an announcement. The `/api/apply-student/*` routes (Supabase insert + Storage upload) and the `src/lib/supabase.ts` server client remain for when student applications reopen.

### Supabase
`src/lib/supabase.ts` creates one **server-side** client using the service-role key — import it only from API routes, never client components. It throws on import if env vars are missing.

## Environment

`.env.local` (gitignored): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server client), and `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Conventions

- **Path alias:** `@/*` → `src/*` (`tsconfig.json`).
- **Copy hygiene** (the site was built to these): one locked accent, sentence case, real typographic quotes, no em-dashes (`—`) in JSX text; escape apostrophes in literal JSX text (`&apos;`) or avoid contractions to keep `react/no-unescaped-entities` happy.
- **Prettier:** `printWidth: 125`, `tabWidth: 2` (`.prettierrc`).
- `next.config.mjs` sets CORS for `/api/*` and immutable caching for `/assets/img/team` and `/assets/img/masonry-portfolio`.
