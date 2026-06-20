# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AREPROG is a French-language SaaS platform for automotive chip-tuning and reprogramming services (Stage 1/2, E85 conversion, EGR/FAP/AdBlue deactivation, VAG coding) targeting Pays Basque and surrounding regions.

## Architecture

**No build step.** This is a static site deployed via Netlify with its root as the publish directory (`publish = "."`). Pushing to GitHub triggers automatic Netlify deployment.

```
netlify.toml        → build config (publish=".", functions dir, edge function routes)
*.html              → one file per page/route (no SPA, ~50 pages)
nav.js              → shared navigation, footer, WhatsApp widget, dark/light theme toggle (injected on all pages)
shared.css          → design system (CSS custom properties, dark-first theme, utility classes)
codage-vag.js       → VAG coding wizard app (IIFE module: VCApp)
codage-vag-data.js  → VAG database: brands, 100+ models, 50+ options with compatibility matrix
netlify/function/   → Netlify serverless functions (Node.js/CommonJS)
netlify/edge-functions/seo-meta.js → SSR meta tag injection for /codage-vag/* routes
```

### Netlify Functions

Functions with their own subdirectory (have `package.json`):
- `netlify/function/rdv-rappels/` — scheduled every 5 min: email + SMS appointment reminders via EmailJS + Twilio
- `netlify/function/sms-send/` — Twilio SMS endpoint
- `netlify/function/upload-devis/` — PDF upload to Firebase Storage

Functions at the root of `netlify/function/`:
- `claude-proxy.js` — proxies requests to Anthropic API (CORS workaround)
- `olsx-token.js` — token endpoint

All functions use `exports.handler` (CommonJS) and include CORS headers for `https://areprog.fr`.

### Edge Function

`netlify/edge-functions/seo-meta.js` handles `/codage-vag/*` routes. It injects dynamic `<title>`, `<meta>`, and JSON-LD tags server-side based on the brand/model slug in the URL — required for SEO since the codage-vag page is otherwise a client-side wizard.

### VAG Coding Wizard (`codage-vag.js`)

Structured as an IIFE (`VCApp = (() => { ... })()`). State managed in a single `state` object. Three-step wizard: brand → model/year → options cart. VAG data (brands, models, options, platform compatibility) lives entirely in `codage-vag-data.js` and is exposed as `window.VAG`.

### Firebase

Firebase config is hardcoded in `codage-vag.js` (public, gated by Firebase security rules). Server-side admin access uses `FIREBASE_SERVICE_ACCOUNT` env var in Netlify functions. Collections: `rdvs`, `config`, `sms_log`.

## CSS Conventions

`shared.css` defines the design system. Dark mode is the default; light mode is toggled via `[data-theme="light"]` on `<html>`.

Key custom properties:
```css
--bg: #0d0e10        /* dark background */
--surface: #17181b
--blue: #2196F3
--green: #34D399
--text: #eceef1
--nav-h: 64px
--radius: 3px / --radius-lg: 8px
```

Fonts: `Barlow Condensed` (headings, nav) and `Barlow` (body) via Google Fonts.

## Routing & URLs

Netlify serves clean URLs (no `.html` extension). GitHub Pages would require `.html` suffixes — avoid deploying there. The `_redirects` and `_headers` files handle Netlify-specific HTTP rules.

## Required Environment Variables (Netlify Dashboard)

| Variable | Used by |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | rdv-rappels, upload-devis |
| `EMAILJS_PRIVATE_KEY` | rdv-rappels |
| `TWILIO_ACCOUNT_SID` | rdv-rappels, sms-send |
| `TWILIO_AUTH_TOKEN` | rdv-rappels, sms-send |
| `TWILIO_FROM_NUMBER` | rdv-rappels, sms-send |
| `ANTHROPIC_API_KEY` | claude-proxy |

## Key Patterns

- All pages share the same nav/footer by calling `nav.js` which injects HTML dynamically via `document.write` equivalents or DOM insertion.
- Page-specific JS is either inline `<script>` in the HTML file or a dedicated `.js` file loaded at the bottom of `<body>`.
- Schema.org JSON-LD, Open Graph, and Twitter Card meta tags are included in every page `<head>` for SEO.
- The `gestion.html` admin page manages appointments (RDVs) and requires Firebase Authentication.
- SMS configuration (phone number, message templates) is stored in Firestore at `config/sms` rather than hardcoded.
