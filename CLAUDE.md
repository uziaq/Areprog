# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AREPROG is a French-language SaaS platform for automotive diagnostics and chip-tuning/reprogramming services (electronic diagnostics, Stage 1/2, E85 conversion, EGR/FAP/AdBlue deactivation) targeting Pays Basque and surrounding regions.

The site is organized into two separate service "universes", each with its own hub page:
- **Diagnostic** (`diagnostic.html`, `/diagnostic`) — multi-brand electronic diagnostics (fault codes, electrical faults, pre-purchase inspection, antipollution), plus a VAG-specialist sub-page (`diagnostic-vag.html`, `/diagnostic-vag`) built around the official ODIS tool.
- **Reprogrammation** (`reprogrammation.html`, `/reprogrammation`) — Stage 1/2, E85 conversion, EGR/FAP/AdBlue deactivation, gearbox (TCU) reprogramming, consumption optimization.

`index.html` remains the main SEO-loaded homepage and funnels visitors into these two hubs via a two-card split (`.universe-grid`/`.universe-card` in `home.css`).

**All work happens in the Biarritz workshop (atelier) — AREPROG no longer works at the customer's home, and the old Yonne zone is gone.** Never reintroduce "à domicile" / "on se déplace" wording or per-city landing pages; the five former city pages (`/reprogrammation-moteur-{bayonne,biarritz,anglet,saint-jean-de-luz,hendaye}`) were deleted and 301 to `/`.

The EGR/FAP/AdBlue pages carry a `.legal-notice` block (styled in `services.css`): removing an antipollution device on a road vehicle is illegal in France (art. L318-3 Code de la route — which also covers advertising it), so those pages must never contain tips about passing the contrôle technique.

**Blog** (`/blog`): `blog/index.html` + one `blog/<slug>.html` per article, each needing an explicit rewrite in `_redirects` (`/blog/<slug> /blog/<slug>.html 200`) and a `sitemap.xml` entry. Article pages reuse `guide-reprogrammation-moteur.css` plus `blog.css`, and — because they live one directory deep — reference every asset with an **absolute** path (`/shared.css?v=…`, `/nav.js?v=…`).

## Architecture

**No build step.** This is a static site deployed via Netlify with its root as the publish directory (`publish = "."`). Pushing to GitHub triggers automatic Netlify deployment.

```
netlify.toml        → build config (publish=".", functions dir)
*.html              → one file per page/route (no SPA, ~40 pages)
nav.js              → shared navigation (Diagnostic ▾ / Reprogrammation ▾ dropdowns), footer, WhatsApp widget (injected on all pages)
shared.css          → design system (CSS custom properties, light theme, utility classes)
gestion.html        → admin back-office markup; its styles live in gestion.css and its logic in gestion.js (one classic script, global scope — inline onclick handlers rely on that)
blog/               → blog hub + articles
netlify/function/   → Netlify serverless functions (Node.js/CommonJS)
```

### Netlify Functions

Functions with their own subdirectory:
- `netlify/function/rdv-rappels/` — scheduled every 5 min: email appointment reminders via Resend
- `netlify/function/rdv-booking/` — public online booking (GET returns free/busy slots for a date, POST creates a `rdvs` doc with `statut: 'a_confirmer'`); honeypot + rate-limited (see `_lib/rate-limit.js`)
- `netlify/function/upload-vehicule/` — photo/document/video upload for the vehicle stock module, for per-vehicle client records, and for generic files attached directly to a client record (Firebase Storage, `vehicules/<id>/{photos,documents,videos}/…` or, when the request body sets `entity: 'client'`, `clients/<id>/documents/…`); videos capped at 4 MB (base64 JSON body must stay under Netlify's ~6 MB function payload limit), photos/PDFs at 8 MB server-side — but the browser only sends PDFs up to 4 MB and shrinks document images to 2400 px JPEG first (`prepareDocUpload` in `gestion.js`), since a bigger file would blow the same ~6 MB body limit
- `netlify/function/lead-capture/` — records contact form / simulateur / déblocage-calculateur leads to Firestore `leads`, auto-builds a draft quote (`devisDraft`) by matching requested prestations against the price catalogue (`config/catalogue`), and notifies via Resend; honeypot + rate-limited. For `source: 'deblocage'` (form on `/deblocage-calculateur`, ECU unlock with Magic Motorsport Korhex + Flex) it also stores `ecu = {ref, numero, mode: 'postal'|'atelier'}` and a `dossier` number (`DEB-AAMMJJ-XXXX`), requires an e-mail, and sends the client a "prise en charge" mail (shipping address from `ADRESSE_ENVOI_CALCULATEUR`, packaging instructions); `clientNotified` records whether it went out
- `netlify/function/send-email/` — authenticated (Firebase idToken) proxy to the Resend API; used by `gestion.html` for RDV reminders, unpaid-invoice alerts, sending devis/factures to clients (PDF + up to 7 optional photo attachments, fully editable subject/message and toggleable content blocks from the send modal), and Google-review requests (keeps the Resend API key server-side). Attachments capped at 4 MB each and 5 MB combined (base64 JSON body must stay under Netlify's ~6 MB function payload limit).
- `netlify/function/emails-envoyes/` — authenticated (Firebase idToken), backs the "📤 Envoyés" tab of `gestion.html` (sent-email history, shown directly without picking a client). GET lists sent emails: each call first copies recent emails from Resend's `GET /emails` list API (everything sent via Resend: gestion, rdv-rappels, lead-capture) into the Firestore `emailsEnvoyes` collection — the durable archive, since Resend only keeps logs for a limited time — paging back until a page has nothing new (max 8 pages, spaced for Resend's ~2 req/s limit). `GET ?id=<resendId>` returns one email's HTML (cached into Firestore on first view). `send-email` also writes each successful send (HTML, attachment names) to `emailsEnvoyes` directly.
- `netlify/function/perf-check/` — internal tool backing `/perf`: proxies Google PageSpeed Insights, `path` param restricted to a hardcoded allowlist of the site's own public routes (never an arbitrary URL, to avoid an open-proxy scanning vector)
- `netlify/function/devis-ia/` — authenticated (Firebase idToken): turns a free-text message pasted in `gestion.html`'s devis form into devis line items via Claude (Anthropic API). Official AREPROG catalogue prestations are returned at their exact price; anything else (mechanical parts, labour) gets an `aValider: true` estimate the admin must check before sending — the function has no live supplier-pricing access. Rate-limited via `_lib/rate-limit.js`.
- `netlify/function/mcp/` — MCP server (Streamable HTTP, stateless JSON, no SSE) exposing the whole back-office to Claude as a custom connector at `https://areprog.fr/mcp` (~40 tools): RDVs (list/create/edit/delete, free slots, workshop opening days/hours/closures in `config/rdvDispo`), clients (search/get/create/edit/delete, add vehicle), devis/factures/ordres (list/get/create/edit/duplicate/delete, devis→facture, status, payments incl. delete/pointé, payment journal, sending), leads (list, mark handled, turn into a devis), Parc auto (`vehicules`: list/create/edit/delete, expenses, margin), catalogue edits, stats, alerts, global search, codage options (reads `codages-data.js` in a `vm` sandbox — shipped to the function via `included_files` in `netlify.toml`), sent-email history and free-form client emails (`preparer_email_client`/`envoyer_email_client`, same confirm-then-send lock, pending mails in server-only collection `mcpEnvois`). An émise facture (sent, paid or not `créé`) can't be deleted, only cancelled, to keep numbering continuous. Writes go straight to the same Firestore collections as `gestion.js` (same field names, same `genNum` numbering, `fireISO` computed in Europe/Paris), so they show up live via `onSnapshot`. Carries its own minimal stateless OAuth 2.1 server (discovery under `/.well-known/oauth-*`, dynamic registration, `/mcp/authorize` login page checking the gestion Firebase email/password, `/mcp/token` with mandatory PKCE S256); codes/tokens are HMAC-signed with `MCP_OAUTH_SECRET` (rotating it revokes every grant) and redirect URIs are restricted to Claude's callback (`claude.ai`/`claude.com` `/api/mcp/auth_callback`) and loopback. The login POST answers with a meta-refresh page rather than a 302, because the site-wide CSP `form-action 'self'` would block a post-submit redirect to claude.ai. Routes are rewritten in `_redirects` (`/mcp`, `/mcp/*`, `/.well-known/oauth-*`). **Sending a devis/facture to a client always needs the owner's explicit yes in the conversation**: `preparer_envoi_document` sends nothing — it stores `doc.envoiPropose = {to, sujet, message, par, at, h}` and returns the full recap plus an HMAC confirmation code bound to a SHA-256 of everything that goes out (`envoiHash`: doc content + recipient/subject/message); `envoyer_document` (annotated `destructiveHint`, requires the code and the user's literal answer in `accordUtilisateur`) refuses if anything changed since the recap or if it was already sent, then sends via Resend with a server-side PDF (`netlify/function/mcp/pdf.js`, pdf-lib: header/legal/footer from the document template, lines, totals, EGR/FAP/AdBlue usage notice, CGV page — no per-service sheets, unlike gestion's browser PDF), archives to `emailsEnvoyes` and sets `lastEmailAt`/`statut: 'envoyé'`. The template only lives in each browser's `localStorage`, so gestion copies it to Firestore `config/template` (`pushTemplateToFirebase` on save/reset, `syncTemplateToFirebase` at startup — creates it if missing and keeps `cgvDefault` = `CGV_DEFAULT` current); `pdf.js` keeps its own copy of `DECHARGE_TEXTE`. The owner can also send it themselves: gestion shows a "📧 Envoi à valider" button in the Liste and handles the `/gestion?envoi=<docId>` deep link (`ouvrirEnvoiPropose`, regular send modal prefilled, official browser PDF; `confirmSendEmail` clears `envoiPropose`). `modifier_document` refuses cancelled docs and factures already sent/paid, and clears any pending `envoiPropose`.
- `netlify/function/_lib/rate-limit.js` — shared Firestore-backed per-IP rate limiter (`rateLimits` collection), not a standalone function; required by `lead-capture`, `rdv-booking`, `devis-ia` and `mcp` (login attempts)

Functions at the root of `netlify/function/`:
- `olsx-token.js` — token endpoint

All functions use `exports.handler` (CommonJS) and include CORS headers for `https://areprog.fr`.

### Firebase

Firebase config is hardcoded in `gestion.html` (public, gated by Firebase security rules) for the admin app's own Auth/Firestore access. Server-side admin access uses `FIREBASE_SERVICE_ACCOUNT` env var in Netlify functions. Collections: `rdvs`, `config`, `docs`, `clients`, `vehicules`, `emailsEnvoyes` (server-side only).

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
          "diagnostic.css", "home.css", "rdv.css", "reprogrammation.css",
          "services.css", "tarifs.css", "whatsapp-widget.js", "about.css", "faq.css",
          "simulateur.css", "guide-reprogrammation-moteur.css", "blog.css", "deblocage-calculateur.css",
          "gestion.css", "gestion.js", "codages-data.js"]
for path in glob.glob("*.html") + glob.glob("blog/*.html"):
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

Because the repo root is the publish directory, internal files (`/netlify/*`, `*.md`, `package*.json`, `netlify.toml`) are forced to 404 at the top of `_redirects` (`404!`). Add any new internal file there too.

## Required Environment Variables (Netlify Dashboard)

| Variable | Used by |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | rdv-rappels, upload-vehicule, lead-capture, send-email, emails-envoyes, mcp |
| `RESEND_API_KEY` | rdv-rappels, lead-capture, send-email, emails-envoyes, mcp |
| `RESEND_FROM` | rdv-rappels, lead-capture, send-email (optional — all three now default to the same hardcoded `AREPROG <contact@areprog.fr>` sender, kept in sync manually since each function hardcodes its own copy) |
| `ANTHROPIC_API_KEY` | devis-ia |
| `ADRESSE_ENVOI_CALCULATEUR` | lead-capture — postal address where clients ship their ECU for unlocking (owner's personal address, so kept out of the public repo); lines separated by `\n` or `|`. Missing → the client mail says the address will follow |
| `MCP_OAUTH_SECRET` | mcp — random string ≥ 32 chars signing OAuth codes/tokens; change it to revoke all Claude connector access |
| `MCP_ALLOWED_EMAILS` | mcp (optional) — comma-separated Firebase Auth emails allowed to connect Claude; defaults to any gestion account |
| `PAGESPEED_API_KEY` | perf-check — **required in practice**: verified live (2026-08-11) that Google's keyless PageSpeed Insights quota is 0/day (always returns HTTP 429), not just "more limited" as the API docs imply. Free key, 25,000 requests/day: https://developers.google.com/speed/docs/insights/v5/get-started |

## Key Patterns

- All pages share the same nav/footer by calling `nav.js` which injects HTML dynamically via `document.write` equivalents or DOM insertion.
- Page-specific JS is either inline `<script>` in the HTML file or a dedicated `.js` file loaded at the bottom of `<body>`.
- Schema.org JSON-LD, Open Graph, and Twitter Card meta tags are included in every page `<head>` for SEO.
- The `gestion.html` admin page manages appointments (RDVs) and requires Firebase Authentication. Its code is in `gestion.js`/`gestion.css`; `sw.js` caches them network-first for offline use — bump `CACHE_NAME` when changing the SW strategy.
- The "Parc auto" tab in `gestion.html` tracks vehicle buy/resell: each vehicle carries its expenses, photos and documents inline, mirrored in `localStorage.ar_vehicules` and the Firestore `vehicules` collection (same offline-first + `onSnapshot` pattern as `docs`/`clients`/`rdvs`). Cost price = purchase price + expenses; margin = sale price − cost price.
- Each vehicle inside a client's `vehs[]` array (carnet clients, add/edit client modal) can also carry its own `notes` (free text), `photos` and `videos` (uploaded via the same `upload-vehicule` function, keyed by a per-vehicle `id` generated client-side, e.g. `cv<timestamp>`). Shown read-only in the client history modal (`showClientHistory`).
- A client record itself (not tied to any specific vehicle) can also carry `documents[]` — arbitrary files (ID, carte grise, signed quote, invoice, contract, other), uploaded from the add/edit client modal via `upload-vehicule` with `entity: 'client'` (stored under `clients/<id>/documents/…`, PDF ≤ 4 MB or image, reduced client-side by `prepareDocUpload`). The storage id is generated once when the modal opens (`acDraftId`) and reused as the client's real `id` on save, so files uploaded before the first save stay attached to the right client. Shown read-only in the client history modal.
- An RDV can link several documents: `rdv.docIds[]` (legacy single `docId` still read, and written as the first id for compatibility). The agenda side panel lists each RDV's linked devis/factures with amounts, a "＋ Devis" button (new devis prefilled from the RDV, auto-linked on save via `_rdvActuel`), and the day's total revenue (`caDesRdvs`: each doc counted once, cancelled docs and ordres excluded, a devis already converted to a facture counted only through the facture — `devisToFacture` links the new facture to the devis's RDVs). Calendar cells show the day total.
- AREPROG is a SASU subject to VAT: every new devis/facture/ordre carries 20 % TVA (`TVA_RATE` in `gestion.js` and in `netlify/function/mcp/mcp.js`), with no 0 % / "non assujetti" option anymore. Editing an existing document keeps the `tvaRate` it was issued with; duplicating one switches it to 20 %.
- Payments received on a facture are recorded in `doc.paiements[] = {id, date, montant, mode, ref, note, pointe}` (the business bank account is at Legal Place, so each card/transfer/cash payment must be traceable back to its facture). Entered from the "💳 Paiement" button in the Liste table or "💳 Paiements" in the doc form (modal edits the stored doc directly and syncs `currentPaiements` if that doc is open in the form). A received `doc.acompte` counts as a payment (`docReglements`/`docEncaisse`/`docResteDu`); the facture switches to `payé` automatically once fully covered. The Liste tab's "💳 Encaissements" chip shows a payment journal (period filter, amount/ref search, "pointé" checkbox for bank reconciliation, CSV export); global search also matches payment amounts and references; the printed facture lists the payments received.
- Devis and factures (not ordres de réparation) get a one-page annex appended by `buildAnnexeHTML()` in `gestion.html` (called from `renderDocHTML`, so preview, print and emailed PDF all include it), so the client gets 2 pages in total: compact per-service sheets (2-column grid, "Réalisé / Inclus / Garantie" lines) built from `PRESTA_FICHES` (default sheets matched by keyword on the line label — a catalogue item's optional `realise`/`inclus`/`garantie` arrays override them for an exact label match), then dense 3-column "Conditions générales de vente et de réparation" (`CGV_DEFAULT`, editable/overridable as `tpl.cgv` in Modèle de document; toggles `showAnnexe`/`showCgv`). EGR/FAP/AdBlue lines add a road-use disclaimer showing either the client's recorded consent (`doc.accordUsage = {ok, mode, date}`) or a signature line. A `pdf-newpage` block starts a new page both in print CSS and in `generatePdfBase64`, which shrinks a section overflowing a page by ≤ 25 % to fit one page and otherwise cuts pages between blocks/table rows rather than mid-line.
