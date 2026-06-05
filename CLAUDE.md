# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Marketing and applications website for Yale Helix (deployed at **yalehelix.org**, see `CNAME`). Built with Next.js 14, it serves a static BootstrapMade HTML template as the homepage and adds React-based application forms backed by two different submission systems (Supabase and Google Forms).

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint (next lint)
```

There is no test runner. Files under `scripts/` are standalone Node utilities run directly (e.g. `node scripts/compress-images.js`, `node scripts/test-supabase.js`); they are dev/ops tools, not part of the build.

## Architecture

### Homepage = raw HTML template
The landing page is **not** authored in JSX. `src/app/page.tsx` reads `src/app/components/index.html` (via `getHtmlFileContent()` in `src/lib/readHtmlFile.js`) at request time and injects it with `dangerouslySetInnerHTML`. This is a BootstrapMade template whose vendor JS (Bootstrap, AOS, Swiper, GLightbox, Isotope, PureCounter, `main.js`) is loaded globally from `public/assets/vendor/` via `<Script>` tags in `src/app/layout.tsx`. **To change homepage content/markup, edit `src/app/components/index.html`, not React.**

Because the template relies on GSAP/scroll animations initialized on full page load, `src/app/components/NavigationTracker.tsx` forces a full `window.location.reload()` when the user navigates back to `/` from an application page, so the animations re-initialize.

### Mixed App Router + Pages Router
Routes live in `src/app/` (App Router) but `src/pages/_app.tsx` and `src/pages/_document.tsx` also exist. New pages and API routes should go under `src/app/`.

### Two separate form backends
There are three application flows, split across two backends — know which one you're touching:

1. **Student applications** (`/apply`) → **Supabase**. Submits JSON to `src/app/api/apply-student/submit-student-supabase/route.ts` (inserts into the `applications` table) and uploads files separately to `.../upload-student-supabase/route.ts` (Supabase Storage bucket `student-files` + `application_files` table). The DB schema lives as TypeScript interfaces in `src/lib/supabase.ts`. The `longform_choice` enum (`portfolio_link | portfolio_pdf | graphical_abstract | slide_deck`) drives conditional validation in both the form and the API; keep the form options, the enum, and `mapLongFormChoice`/`validateLongFormConsistency` in sync.

2. **Interest form** (`/interest-form`) and **startup applications** (`/apply-startups`) → **Google Forms**. These API routes (`src/app/api/submit-interest/route.ts`, `src/app/api/apply-startup/.../route.ts`) build `URLSearchParams` mapped to hardcoded Google Forms `entry.<id>` field IDs and POST to a Google Form. If a form field is added/removed, the corresponding `entry.<id>` mapping must be updated.

Each flow has a sibling `success/` page (e.g. `src/app/apply-startups/success/`).

### Supabase client
`src/lib/supabase.ts` creates a single server-side client using the **service role key** — it must only be imported from API routes / server code, never client components. It throws on import if env vars are missing.

## Environment

`.env.local` (gitignored) provides:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server-side client (`src/lib/supabase.ts`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public/anon values

## Conventions

- **Path alias:** `@/*` → `src/*` (see `tsconfig.json`). API routes use `@/lib/supabase`.
- **Styling:** per-page CSS modules (`page.module.css`) for the React form pages; global Bootstrap-template CSS in `public/assets/css/` and `src/styles/`. Tailwind is configured but barely used.
- **Formatting:** Prettier with `printWidth: 125`, `tabWidth: 2` (`.prettierrc`).
- **Caching:** `next.config.mjs` sets long-lived/immutable `Cache-Control` for `/assets/img/team/` and `/assets/img/masonry-portfolio/`, and `no-cache` for `/assets/css|js/` — relevant when debugging stale assets or adding new image directories.
- File uploads are capped at 4MB and validated by extension per role in the upload route.
