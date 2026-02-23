# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
yarn dev          # Dev server on port 10000
yarn build        # Static export build (outputs to /out)
yarn lint         # ESLint
yarn deploy       # Push to main, triggers GitHub Pages deploy via Actions
```

The app is served at `/space-balance` base path (configured in `next.config.mjs`). When running the dev server locally, navigate to `http://localhost:10000/space-balance`.

## Architecture

Single-page Next.js 16 app with React 19, statically exported to GitHub Pages at https://euge.github.io/space-balance/.

**Core component**: `components/interactive-pie-chart.tsx` — a client-side SVG pie chart with 4 adjustable segments (body, touch, mental, people spaces). Uses custom polar math helpers for arc rendering and label positioning. Small slices (<15%) rotate labels along the radial direction. Slider adjustments redistribute values proportionally using the largest remainder method.

**UI framework**: shadcn/ui (New York style) with Radix UI primitives in `components/ui/`. Configured via `components.json`.

**Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`. Theme uses OKLch color space via CSS custom properties defined in `app/globals.css` (light and dark modes). Fonts: Geist + Geist Mono.

**State**: Local React state only — no external state management, no API calls, no database.

**Path aliases**: `@/*` maps to the project root.

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`: installs deps with `npm ci`, builds, and deploys the `out/` directory to GitHub Pages. The static export and `/space-balance` base path are configured in `next.config.mjs`.

## UI Verification

When working on UI changes, use the Playwright MCP tools to visually verify the result. Navigate to the relevant page, take screenshots, and confirm the UI renders correctly. This is especially valuable for layout, styling, and interaction changes where code review alone is insufficient.
