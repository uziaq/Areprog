# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AREPROG is a French-language SaaS platform for automotive diagnostics and chip-tuning/reprogramming services (electronic diagnostics, Stage 1/2, E85 conversion, EGR/FAP/AdBlue deactivation) targeting Pays Basque and surrounding regions.

The site is organized into two separate service "universes", each with its own hub page:
- **Diagnostic** (`diagnostic.html`, `/diagnostic`) — multi-brand electronic diagnostics (fault codes, electrical faults, pre-purchase inspection, antipollution), plus a VAG-specialist sub-page (`diagnostic-vag.html`, `/diagnostic-vag`) built around the official ODIS tool.
- **Reprogrammation** (`reprogrammation.html`, `/reprogrammation`) — Stage 1/2, E85 conversion, EGR/FAP/AdBlue deactivation, gearbox (TCU) reprogramming, consumption optimization.

`index.html` remains the main SEO-loaded homepage and funnels visitors into these two hubs via a two-card split (`.universe-grid`/`.universe-card` in `home.css`).

## Architecture

**No build step.** This is a static site deployed via Netlify with its root as the publish directory (`publish = "."`). Pushing to GitHub triggers automatic Netlify deployment.

```
netlify.toml        → build config (publish=".", functions dir)
*.html              → one file per page/route (no SPA, ~40 pages)
nav.js              → shared navigation (Diagnostic ▾ / Reprogrammation ▾ dropdowns), footer, WhatsApp widget (injected on all pages)
shared.css          → design system (CSS custom properties, light theme, utility classes)
netlify/function/   → Netlify serverless functions (Node.js/CommonJS)
```

### Netlify Functions

Functions with their own subdirectory:
- `netlify/function/rdv-rappels/` — scheduled every 5 min: email appointment reminders via Resend
- `netlify/function/rdv-booking/` — public online booking (GET returns free/busy slots for a date, POST creates a `rdvs` doc with `statut: 'a_confirmer'`); honeypot + rate-limited (see `_lib/rate-limit.js`)
- `netlify/function/upload-vehicule/` — photo/document upload for the vehicle stock module (Firebase Storage, `vehicules/<id>/…`)
- `netlify/function/lead-capture/` — records contact form / simulateur leads to Firestore `leads`, auto-builds a draft quote (`devisDraft`) by matching requested prestations against the price catalogue (`config/catalogue`), and notifies via Resend; honeypot + rate-limited
- `netlify/function/send-email/` — authenticated (Firebase idToken) proxy to the Resend API; used by `gestion.html` for RDV reminders, unpaid-invoice alerts, sending devis/factures to clients with the PDF as an attachment, and Google-review requests (keeps the Resend API key server-side)
- `netlify/function/perf-check/` — internal tool backing `/perf`: proxies Google PageSpeed Insights, `path` param restricted to a hardcoded allowlist of the site's own public routes (never an arbitrary URL, to avoid an open-proxy scanning vector)
- `netlify/function/_lib/rate-limit.js` — shared Firestore-backed per-IP rate limiter (`rateLimits` collection), not a standalone function; required by `lead-capture` and `rdv-booking`

Functions at the root of `netlify/function/`:
- `claude-proxy.js` — proxies requests to Anthropic API (CORS workaround)
- `olsx-token.js` — token endpoint

All functions use `exports.handler` (CommonJS) and include CORS headers for `https://areprog.fr`.

### Firebase

Firebase config is hardcoded in `gestion.html` (public, gated by Firebase security rules) for the admin app's own Auth/Firestore access. Server-side admin access uses `FIREBASE_SERVICE_ACCOUNT` env var in Netlify functions. Collections: `rdvs`, `config`, `docs`, `clients`, `vehicules`.

## CSS Conventions

`shared.css` defines the design system. Light theme only (no dark mode, no toggle).

Key custom properties:
```css
--bg: #f4f5f7        /* light background */
--surface: #ffffff
--blue: #0d5baf
--green: #0b7a52
--text: #1a1c1f
--nav-h: 64px
--radius: 3px / --radius-lg: 8px
```

Fonts: `Barlow Condensed` (headings, nav) and `Barlow` (body) via Google Fonts.

### Cache-busting local CSS/JS

`_headers` forces `Cache-Control: public, max-age=86400` (24h) on every `.css`/`.js`, and there's no build step to hash filenames. Every local stylesheet/script reference across all pages carries a `?v=YYYYMMDD` query string (e.g. `shared.css?v=20260812`) for exactly this reason: **whenever you edit `shared.css`, `nav.js`, or any page-specific `.css`/`.js` (including `<link rel="preload">` hints), bump the `?v=` on every reference to that file to today's date** — otherwise visitors with a warm cache keep the stale version for up to 24h and your change appears "not deployed" even though it is. A quick way to bump everything at once:
```bash
python3 - <<'EOF'
import re, glob
VERSION = "YYYYMMDD"  # today
ASSETS = ["shared.css", "nav.js", "contact.css", "diagnostic-bmw.css", "diagnostic-vag.css",
          "diagnostic.css", "home.css", "rdv.css", "reprogrammation.css", "seo-local.css",
          "services.css", "tarifs.css", "whatsapp-widget.js"]
for path in glob.glob("*.html"):
    content = original = open(path, encoding="utf-8").read()
    for asset in ASSETS:
        content = re.sub(r'(href|src)="(/?)' + re.escape(asset) + r'(\?v=\d+)?"',
                          lambda m: f'{m.group(1)}="{m.group(2)}{asset}?v={VERSION}"', content)
    if content != original:
        open(path, "w", encoding="utf-8").write(content)
EOF
```

## Routing & URLs

Netlify serves clean URLs (no `.html` extension). GitHub Pages would require `.html` suffixes — avoid deploying there. The `_redirects` and `_headers` files handle Netlify-specific HTTP rules.

## Required Environment Variables (Netlify Dashboard)

| Variable | Used by |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | rdv-rappels, upload-vehicule, lead-capture, send-email |
| `RESEND_API_KEY` | rdv-rappels, lead-capture, send-email |
| `RESEND_FROM` | rdv-rappels, lead-capture, send-email (optional — all three now default to the same hardcoded `AREPROG <contact@areprog.fr>` sender, kept in sync manually since each function hardcodes its own copy) |
| `ANTHROPIC_API_KEY` | claude-proxy |
| `PAGESPEED_API_KEY` | perf-check — **required in practice**: verified live (2026-08-11) that Google's keyless PageSpeed Insights quota is 0/day (always returns HTTP 429), not just "more limited" as the API docs imply. Free key, 25,000 requests/day: https://developers.google.com/speed/docs/insights/v5/get-started |

## Key Patterns

- All pages share the same nav/footer by calling `nav.js` which injects HTML dynamically via `document.write` equivalents or DOM insertion.
- Page-specific JS is either inline `<script>` in the HTML file or a dedicated `.js` file loaded at the bottom of `<body>`.
- Schema.org JSON-LD, Open Graph, and Twitter Card meta tags are included in every page `<head>` for SEO.
- The `gestion.html` admin page manages appointments (RDVs) and requires Firebase Authentication.
- The "Parc auto" tab in `gestion.html` tracks vehicle buy/resell: each vehicle carries its expenses, photos and documents inline, mirrored in `localStorage.ar_vehicules` and the Firestore `vehicules` collection (same offline-first + `onSnapshot` pattern as `docs`/`clients`/`rdvs`). Cost price = purchase price + expenses; margin = sale price − cost price.
