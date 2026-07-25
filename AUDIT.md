# AUDIT COMPLET DU SITE AREPROG.FR

**Date : 25 juillet 2026** — Périmètre : 37 pages HTML, 17 CSS, 6 JS, 5 fonctions Netlify, 1 edge function, Firebase (Auth / Firestore / Storage), configuration Netlify (`_headers`, `_redirects`, `netlify.toml`), `sitemap.xml`, `robots.txt`.

---

## Note globale

| Domaine | État | Commentaire |
|---|---|---|
| Sécurité | 🔴 **Insuffisant** | Endpoints serverless sans authentification, règles Firebase invérifiables, token OLSX exposé |
| SEO | 🔴 **Dégradé** | URLs 404 dans le sitemap, ~60 liens internes morts, données locales fictives, contenu dupliqué |
| Cohérence commerciale | 🔴 **Contradictoire** | Le site vend à la fois « en atelier » et « à domicile » selon les pages |
| Performance | 🟠 **Moyen** | `gestion.html` 286 Ko, CSS dupliqué inline (~62 Ko), pas de `srcset` |
| Accessibilité | 🟠 **Moyen** | Formulaire de contact inutilisable au clavier, contrastes hors WCAG en thème clair |
| Bonnes pratiques présentes | 🟢 | Vraie auth Firebase, secrets en variables d'environnement, HSTS, `<picture>`/WebP, `lang="fr"`, alt partout |

---

# 1. SÉCURITÉ

## 🔴 Critique

### S1. `sms-send` : passerelle SMS ouverte à Internet, sans authentification
`netlify/function/sms-send/sms-send.js:73-152`

Le handler ne vérifie jamais l'identité de l'appelant : ni token Firebase, ni clé partagée, ni rate limiting. La liste `ALLOWED_ORIGINS` (ligne 13) ne sert qu'à écrire le header CORS de réponse (ligne 76) — elle ne rejette jamais une requête. CORS est une protection navigateur : un simple `curl` l'ignore totalement.

**Impact** : n'importe qui peut envoyer des SMS arbitraires vers n'importe quel numéro mondial, facturés sur le compte Twilio AREPROG et **expédiés depuis le numéro AREPROG** (`POST /.netlify/functions/sms-send`). Le type `manuel` (ligne 115) court-circuite même le kill-switch Firestore `config/sms`. Risques : vidage du solde Twilio, phishing par SMS au nom de l'entreprise, blacklist opérateur, responsabilité légale.

**Correctif** : exiger un `Authorization: Bearer <idToken>` Firebase vérifié via `admin.auth().verifyIdToken()` (le SDK admin est déjà chargé ligne 11), rejeter en 403 les origines hors liste, ajouter un compteur par IP.

### S2. `upload-devis` : écriture non authentifiée dans Firebase Storage, publique, avec path traversal
`netlify/function/upload-devis/upload-devis.js:16-55`

Quatre défauts cumulés :
- **Aucune authentification** (lignes 16-23) et `Access-Control-Allow-Origin: '*'` (lignes 47, 54).
- **Path traversal** (ligne 34) : `docId` et `filename` viennent du body sans validation — l'attaquant contrôle le chemin complet de l'objet écrit et peut **écraser un devis client légitime déjà partagé** (l'URL publique reste la même → falsification de facture).
- **`public: true`** (ligne 38) sans inspection du contenu (`pdfBase64` jamais vérifié, pas de signature `%PDF-`) : le bucket devient un hébergeur de fichiers anonyme et gratuit sous l'identité AREPROG (malware, phishing). Aucune limite de taille → facture GCS incontrôlée.
- **Fuite d'erreur** (ligne 55) : `e.message` brut expose nom du bucket, projet GCP, email du service account.

### S3. Règles de sécurité Firestore/Storage absentes du dépôt — probablement permissives
Aucun `firestore.rules`, `storage.rules` ni `firebase.json` dans le repo. **C'est le point le plus important de tout l'audit** : les règles Firebase sont la seule défense réelle des données (la config cliente `apiKey`/`projectId` est publique par conception, c'est normal).

Indice inquiétant : `codage-vag.js:341` fait `db.collection('vag_orders').add(order)` depuis une page **publique non authentifiée** — la règle sur `vag_orders` doit donc autoriser la création anonyme. Si le projet est resté en mode test (`allow read, write: if true` ou `if request.auth != null`), alors ces collections sont lisibles/inscriptibles par n'importe qui :

| Collection | Contenu | Référence |
|---|---|---|
| `docs` | Devis/factures : noms, adresses, véhicules, montants | `gestion.html:2337` |
| `clients` | Carnet clients : nom, adresse, tél, VIN, immatriculation | `gestion.html:2355` |
| `rdvs` | Rendez-vous, lieux, téléphones | `gestion.html:4247` |
| `sms_log` | Historique SMS : numéros + contenus | `gestion.html:5894` |
| `config/sms` | Kill-switch des notifications | `gestion.html:5854` |

**Impact** : violation RGPD caractérisée (données personnelles + véhicules identifiants) + chaînes d'attaque S4/S5/S6.

**Action immédiate** : vérifier les règles dans la console Firebase, les versionner dans le repo, restreindre tout sauf `vag_orders` (create-only, sans read) à l'UID admin.

### S4. Aucun contrôle de rôle après connexion : tout compte Firebase = administrateur
`gestion.html:2257-2264`

L'authentification elle-même est bien faite (vrai `signInWithEmailAndPassword`, ligne 2210, pas de mot de passe en dur). Mais la seule condition d'accès est `if (user) showApp()` — **aucune vérification d'UID, d'email ni de custom claim**. Si l'inscription email/mot de passe est activée dans la console Firebase (réglage par défaut du provider), n'importe qui crée un compte via l'API REST Identity Toolkit avec l'`apiKey` publique (`gestion.html:2280`) et obtient l'accès admin complet. `showApp()` n'est qu'un `display:block` (ligne 2185) — la barrière réelle reste les règles Firestore (S3).

**Action immédiate** : console Firebase → Authentication → désactiver l'inscription publique, et/ou filtrer sur l'UID admin exact (code + règles).

### S5. Token OLSX en clair dans une page publiquement accessible
`gestion.html:1578`

L'iframe OLSX embarque un token d'API en dur dans l'URL (`https://api.olsx.eu/iframe?token=165|nY954…`), avec l'email `arthur@areprog.fr`. `gestion.html` est `noindex` mais **servi sans authentification serveur** : n'importe qui ouvrant `/gestion` peut lire le source et récupérer ce token. Une fonction `olsx-token.js` existe déjà (`netlify/function/olsx-token.js`) — visiblement prévue pour ça mais non utilisée ici.

**Correctif** : révoquer/faire tourner le token chez OLSX, le servir via la fonction serverless (elle-même protégée par un idToken Firebase).

## 🟠 Important

### S6. XSS stocké dans le back-office : données Firestore injectées sans échappement
`gestion.html:3555-3568` (`buildTable`) et autres sinks

`d.num`, `d.cn` (nom client), `d.vm`/`d.vmo`, `d.van`, `d.statut` sont concaténés bruts dans `innerHTML`. La fonction `escHtml()` existe (`gestion.html:3949`) et est utilisée 68 fois ailleurs — l'échappement est **inconsistant**, pas absent. Autres sinks non échappés : `gestion.html:2412-2419` (injection d'attribut `value="..."`), `:5308`, `:4332+`, `:3595/3607`.

**Chaîne d'attaque** : si Firestore est publiquement inscriptible (S3), un document `clients` avec `cn: '<img src=x onerror=…>'` exécute du code **dans la session authentifiée de l'admin** à l'ouverture de `/gestion` : exfiltration du carnet clients, envoi de SMS depuis une origine légitime. La CSP n'aide pas : `script-src 'unsafe-inline'` est autorisé sur `/gestion` (`_headers:27-30`).

### S7. `claude-proxy` : proxy Anthropic ouvert, non authentifié… et jamais utilisé
`netlify/function/claude-proxy.js:5-65` + 2 doublons

Même schéma que S1 : le header CORS `https://areprog.fr` (lignes 11, 55, 62) n'est qu'un header de réponse, rien ne rejette les appels externes. Le body est relayé quasi tel quel (`model`, `max_tokens`, `messages` contrôlés par l'appelant) → **service Claude gratuit et anonyme financé par la clé `ANTHROPIC_API_KEY` d'AREPROG**.

Circonstance décisive : `claude-proxy` **n'est appelé nulle part** dans le site — c'est du code mort déployé, en 3 copies identiques :
- `/claude-proxy.js` (racine, **servi en statique** sur `https://areprog.fr/claude-proxy.js` à cause de `publish = "."`)
- `netlify/function/claude-proxy.js` (la fonction déployée)
- `netlify/function/claude-proxy` (résidu sans extension, servi en statique)

Idem `netlify/function/olsx-token` (doublon sans extension de `olsx-token.js`).

**Correctif le moins cher : supprimer les 3 copies** (et le doublon olsx-token sans extension).

### S8. Amplification SMS via la fonction planifiée `rdv-rappels`
`netlify/function/rdv-rappels/rdv-rappels.js:120`

L'usage de `schedule('*/5 * * * *')` est correct (pas d'invocation HTTP externe possible). Mais la fonction lit `rdvs` et envoie des SMS aux numéros trouvés, avec le `title` interpolé sans filtre dans le corps du message. Si `rdvs` est publiquement inscriptible (S3), un attaquant y injecte des RDV avec numéros arbitraires → **SMS de phishing envoyés automatiquement depuis le numéro AREPROG**, sans toucher un seul endpoint HTTP.

### S9. Absence de `.gitignore` sur un dépôt public
Aucun `.gitignore` à la racine (repo public, cf. `SETUP.md:4`). Rien n'empêche un `git add .` de committer un `.env`, un `serviceAccountKey.json` (procédure de téléchargement décrite dans `SETUP.md`) ou `node_modules/`. L'historique est actuellement propre (vérifié sur l'intégralité des révisions), mais un secret commité une fois y reste pour toujours.

## 🟡 Mineur (sécurité)

- **Fuite d'infos dans les erreurs** : `e.message` brut retourné au client dans `upload-devis.js:55`, `sms-send.js:150`, `claude-proxy.js:63`, `olsx-token.js:12` (noms de bucket, codes Twilio, variables d'env manquantes) — et réinjecté en `innerHTML` côté client (`gestion.html:5925, 5946, 5950`).
- **CSP** : `script-src 'unsafe-inline'` dans les 5 politiques (`_headers:16-36`) — neutralise la CSP ; `frame-ancestors`, `base-uri`, `form-action` absents ; `X-XSS-Protection: 1; mode=block` (`_headers:9`) obsolète et déconseillé (ironie : `head-seo-snippet.html:82` documente sa suppression, jamais appliquée) ; `https://identity.netlify.com` encore autorisé alors que Netlify Identity a été abandonné.
- **Self-XSS recherche** : `codage-vag.js:403` injecte `state.searchQuery` brut dans `innerHTML` — impact limité tant que la recherche n'est pas pré-remplie depuis l'URL.
- **`download`** : fichier `.htaccess` Apache complet renommé sans extension, inerte sur Netlify, **servi publiquement** sur `/download`. À supprimer.
- **`codage-vag-admin.html:157-160`** : config Firebase en placeholders (`VOTRE_API_KEY`) — page admin morte, routée publiquement (`_redirects:51`), sans `X-Robots-Tag`. À supprimer ou protéger.
- **`package.json:8`** déclare `twilio@^5.0.0` mais le lockfile ne le contient pas (un `npm ci` échouerait) — dépendance de toute façon inutile : les fonctions appellent l'API REST Twilio via `fetch`. Aucune CVE connue sur les 172 paquets du lockfile.
- **`publish = "."`** (`netlify.toml:2`) expose publiquement `CLAUDE.md`, `SETUP.md`, `DEPLOIEMENT.md`, `package-lock.json` (75 Ko), `head-seo-snippet.html`, `download`, `claude-proxy.js`, `netlify/**`. Le correctif structurel est un dossier de publication dédié, ou a minima des exclusions.

---

# 2. SEO & STRUCTURE

## 🔴 Critique

### SEO1. 3 URLs du sitemap aboutissent en 404
`sitemap.xml:27, 51, 57` déclarent `/reprogrammation-moteur-pau`, `-dax`, `-auxerre` (priorités 0.90–0.95). Les pages ont été supprimées (commit `0246206` du 21/06) mais le sitemap date du 17/06. `_redirects:35-37` les redirige en 301 vers `/reprogrammation-moteur`… **qui n'existe pas** (ni fichier ni règle) → chaîne 301 → 404. Erreurs de couverture Search Console + perte du jus de lien.

### SEO2. ~60 liens internes vers ces 3 pages fantômes, sur 27 fichiers
Le commit `7210c9d` a nettoyé `nav.js` uniquement ; les blocs « zones desservies » en dur dans chaque page n'ont pas été touchés. Exemples : `faq.html:877-878, 926-927`, `contact.html:374-380`, `simulateur.html:1013-1015`, `about.html:412-414`, `sitemap-visuel.html:441-486`, `index.html` (3), et 2 par page sur toutes les pages services. Budget de crawl gaspillé + signal qualité très négatif.

### SEO3. 5 entités `LocalBusiness` « AREPROG » avec 5 adresses différentes (NAP fictif)
Chaque page ville déclare son propre `LocalBusiness` nommé « AREPROG » avec `addressLocality`/`postalCode`/`geo` différents (Anglet 64600, Bayonne 64100, Biarritz 64200, Hendaye 64700, St-Jean-de-Luz 64500 — toutes ~ligne 31). Il n'existe qu'un seul établissement (Biarritz). Cinq adresses fictives = violation directe des règles Google local, aucune fiche validée, signal de manipulation.

**Correctif** : un seul `LocalBusiness` (Biarritz, avec `streetAddress` complet) ; sur les pages villes, `Service` + `areaServed`.

### SEO4. Pages villes Anglet/Bayonne/Biarritz dupliquées à 85–92 %
Similarité mesurée (ville neutralisée) : anglet↔bayonne **91,6 %**, bayonne↔biarritz 86,3 %, anglet↔biarritz 85 %. Même H1, même structure (5 h2 + 4 h3), volumes identiques (~1180 mots), même FAQ où seul le toponyme change → profil « doorway pages ». Hendaye et St-Jean-de-Luz ont été réécrites (24–33 % de similarité) — mais St-Jean-de-Luz ne fait que **530 mots** pour une priorité 0.90. À réécrire ou fusionner.

### SEO5. Contradiction « en atelier » vs « à domicile » sur tout le site
Le refactor "passage à l'atelier de Biarritz" (commit `0246206`, marqué *partiel*) est resté à moitié fait :

| Page | « à domicile » | « en atelier » |
|---|---|---|
| `index.html` | 0 | 15 |
| `reprogrammation-moteur-biarritz.html` | 0 | 8 |
| `reprogrammation-moteur-hendaye.html` | **13** | 1 |
| `reprogrammation-moteur-anglet.html` | **11** | 2 |
| `reprogrammation-moteur-bayonne.html` | **11** | 3 |
| `reprogrammation-moteur-saint-jean-de-luz.html` | **9** | 2 |
| `reprogrammation-boite-vitesse.html` | **4** | 0 |

Pire, le remplacement a produit des phrases absurdes : `index.html:235` « AREPROG intervient **directement chez nous** » (au lieu de *chez vous*), `about.html:229` idem, `chip-tuning-pays-basque.html:194` « chip tuning en atelier, directement sur votre lieu de stationnement », `index.html:527` « On se déplace… Pas d'attente en atelier » juste après « Venez dans notre atelier ». Les titres divergent aussi (`reprogrammation-moteur-anglet.html:12` : « à domicile Anglet »). Incohérence visible par les clients **et** par Google. **Trancher le positionnement et corriger les ~15 emplacements listés.**

### SEO6. `robots.txt` ne bloque pas les pages admin
`robots.txt:5-14` bloque `/admin` (simple 301 vers `/gestion.html` !) mais **pas** `/gestion`, `/gestion.html`, `/codage-vag-admin`, ni `/sitemap-visuel.html`, `/head-seo-snippet.html`, `/download`, `/netlify/`. Le `X-Robots-Tag` de `_headers` empêche l'indexation de `/gestion` mais pas le crawl ; `codage-vag-admin` n'a qu'une meta HTML.

## 🟠 Important

- **SEO7. Coordonnées GPS = Pau au lieu de Biarritz** : `index.html:50-54` et `ethanol-prix.html` déclarent `43.2951 / -0.3708` (Pau). L'atelier est à Biarritz (`43.4832 / -1.5586`). Résidu du positionnement pré-refactor.
- **SEO8. `LocalBusiness` d'accueil sans adresse** : `index.html:45-49` n'a ni `streetAddress`, ni `postalCode`, ni `addressLocality` → rich result rejeté par Google. Aucune adresse postale nulle part sur le site (NAP incomplet pour Google Business Profile).
- **SEO9. Avis auto-déclarés** : `index.html:57-63` : `aggregateRating` 5/5 avec `reviewCount: 12` mais seulement 3 avis balisés/visibles ; Google ignore les avis auto-hébergés depuis 2019 (risque d'action manuelle). Un avis (« Karim D. : faite en 1h30 sur mon parking ») contredit le discours atelier de la page.
- **SEO10. `og:image` en WebP sur 28 pages** : WhatsApp et X/Twitter ne rendent pas le WebP → aperçu vide sur le canal principal de l'entreprise. `og-image.jpg` existe et n'est utilisé que par 5 pages. `og:image:width/height` absents partout. Basculer les 28 pages sur le `.jpg`.
- **SEO11. Soft-404 illimités sous `/codage-vag/:brand/:model`** : pour un slug inconnu, `seo-meta.js:154-155` renvoie **200** avec le template générique (`canonical=/codage-vag`, `robots: index,follow`) — espace d'URLs infini en soft-404. Renvoyer 404 ou injecter `noindex`.
- **SEO12. JSON-LD des 109 pages VAG non réécrit** : l'edge function réécrit title/canonical/OG mais pas le bloc `#page-schema` (`codage-modele.html:22`) qui sert à toutes les pages le même `WebPage` pointant `/codage-vag`. Aucune Twitter Card sur ces 109 pages. `og:image` générique.
- **SEO13. Titres et descriptions hors norme** : 10 titres > 65 caractères (dont l'accueil, 84) ; 9 descriptions > 165 caractères (jusqu'à 206 sur `codage-vag.html`) ; entités doublement encodées (`&#8212;`, `&#233;`) dans les metas de `codage-vag.html:6-7`, `codage-options-vag.html:6-7`, `installation-options-vag.html`.
- **SEO14. `404.html` avec chemins relatifs** : `404.html:15` (`shared.css`) et ~l.82 (`nav.js`) — sur une 404 profonde (`/codage-vag/audi/xxx`), la page s'affiche sans CSS ni navigation. Passer en chemins absolus.
- **SEO15. Pages indexables absentes du sitemap** : `reprogrammation-boite-vitesse.html` (indexable, canonical propre — oubli net), `sitemap-visuel.html` (lié depuis le footer de toutes les pages via `nav.js:137`, indexable, sans canonical ni robots) ; 25 des 104 modèles VAG manquent (`vw/golf-5`, `audi/a4-b8`, `skoda/kodiaq-rs`…).
- **SEO16. `lastmod` obsolètes sur tout le sitemap** : 24 pages datées `2026-03-28` alors que le dernier commit de contenu est du 21/06 ; 2 blocs sans `lastmod` du tout (`sitemap.xml:381, 386`).
- **SEO17. `_redirects` : 5 règles vers des fichiers inexistants** (boutique supprimée) : lignes 54, 57, 58, 61, 62 (`boutique-vag.html`, `produit-vag.html`, `gestion-boutique.html`). Et `_headers:81-87` pose des `X-Robots-Tag` sur `/boutique.html` et `/produit.html` qui n'existent plus.
- **SEO18. Liens email morts** : `mentions-legales.html:77, 102` pointent vers `/cdn-cgi/l/email-protection#…` (résidu d'obfuscation Cloudflare, inexistant sur Netlify) → les emails des mentions légales sont inaccessibles (problème de conformité légale).

## 🟡 Mineur (SEO)

- Émojis en tête de 9 `<h1>` (`stage1.html` « ⚡ », `stage2.html` « 🔥 »…) — diluent le mot-clé et gênent les lecteurs d'écran.
- Hiérarchie plate : `faq.html` (99 Ko) et `tarifs.html` n'ont qu'un seul `<h2>` et zéro `<h3>` ; `contact.html` et `simulateur.html` : aucun `<h2>`.
- `llms.txt:27` bloque `/simulateur` alors qu'il est dans le sitemap et indexable (débloqué par commit `6de8fe5` — `llms.txt` n'a pas suivi).
- Divergences de libellés modèles entre `seo-meta.js` et `codage-vag-data.js` (« Golf 7.5 Facelift » vs « Golf 7.5 (facelift) », `A3 (8V)` vs `A3 8V`, etc.) — les 104 slugs correspondent parfaitement (✅ vérifié), mais la duplication manuelle des deux listes se dégradera au prochain ajout.
- `areaServed` de `index.html:35-41` cite encore Pau et Auxerre ; `sameAs: []` vide sur les 5 pages villes ; deux emails concurrents (`contact@` vs `arthur@areprog.fr`, 3 occurrences chacun).
- `CNAME` (résidu GitHub Pages — risque de conflit de domaine si GH Pages est réactivé un jour), `DEPLOIEMENT.md` (guide GitHub Pages entièrement obsolète), commentaire GitHub Pages dans `sitemap.xml:8`. À supprimer.
- `robots.txt:6-7` : directives mortes (`/areprog-devis` n'existe plus). Les 17 rewrites « clean URL » de `_redirects:10-27` sont redondants (Netlify le fait nativement) et incomplets (2 pages omises).
- Horaires incohérents : `head-seo-snippet.html:49` dit « Sa 09:00-17:00 » vs « Lundi–Samedi 08:00–19:00 » partout ailleurs. Téléphone : ✅ parfaitement cohérent (159 occurrences), sauf une donnée de démo `06 12 34 56 78` dans `gestion.html:4210`.

---

# 3. PERFORMANCE

## 🔴 Critique

### P1. `gestion.html` = 286 Ko, dont 219 Ko de code inline
- 170 Ko de JS inline (lignes 2178-5997) + 49 Ko de CSS inline (lignes 23-958) — re-téléchargés à chaque visite (HTML non cacheable), alors qu'en fichiers externes ils profiteraient du cache 24 h de `_headers`.
- 4 SDK Firebase compat chargés **dans le `<head>` sans `defer`** (lignes 17-20, ~350 Ko réseau bloquants).
- Google Fonts bloquant (ligne 22) sans `preconnect` vers `fonts.gstatic.com`.

**Correctif** : extraire `gestion.js` + `gestion.css`, passer Firebase en `defer` en fin de body.

### P2. Service worker `sw.js` : 4 bugs réels
- **`sw.js:74`** : `return caches.match('/gestion.html') || caches.match('/gestion')` — `caches.match()` retourne toujours une Promise (truthy), la 2ᵉ branche est du code mort ; si le cache est vide, on résout `undefined` → erreur en mode hors-ligne.
- **`sw.js:131-132`** : `icon: '/favicon512.png'` et `badge: '/favicon32x32.png'` — les fichiers réels ont des tirets (`favicon-512.png`) → notifications de rappel RDV sans icône (le handler push, lui, utilise les bons noms).
- **Cache-first images sans expiration ni check `response.ok`** (lignes 80-92) : une 404 transitoire est mémorisée définitivement ; `CACHE_NAME = 'areprog-v2'` figé manuellement → images périmées indéfiniment après remplacement.
- **Scope `/`** : le SW n'est enregistré que par `gestion.html:6000` mais contrôle **tout le site** dès qu'un admin a ouvert `/gestion` — le cache-first s'applique alors aux pages publiques.
- Bonus : `setTimeout` long dans le handler `message` (lignes 128-135) — le SW est tué après ~30 s, les rappels programmés au-delà ne partent jamais.

### P3. Bug fonctionnel : Firebase jamais initialisé sur `/codage-vag` → perte de prospects
`codage-vag.js:6` déclare `const firebaseConfig = {…}` mais la ligne 36 appelle `firebase.initializeApp(FIREBASE_CONFIG)` (autre nom, jamais défini) → `ReferenceError` avalée par le `try/catch` (ligne 40). Conséquence : `db` reste `null` et **l'enregistrement des demandes de devis (`vag_orders`, ligne 341) échoue systématiquement en silence**. Chaque demande de devis du configurateur VAG est perdue.

## 🟠 Important

- **P4. ~88 Ko de CSS orphelin ou dupliqué** : 3 CSS de pages supprimées (`reprogrammation-moteur-auxerre/dax/pau.css`, 26 Ko de code mort déployé) ; 6 CSS existants mais **dupliqués inline** au lieu d'être liés (`simulateur.css`, `ethanol-prix.css`, `faq.css`, `about.css`, `chip-tuning-pays-basque.css`, `guide-reprogrammation-moteur.css` — ~62 Ko re-téléchargés à chaque page vue au lieu d'être cachés).
- **P5. Le simulateur est cassé sur `/simulateur.html`** : la CSP autorisant `api.olsx.eu` ne couvre que l'URL `/simulateur` (`_headers`) ; l'accès direct avec extension `.html` tombe sur la CSP globale (`frame-src 'none'`) → iframe et scripts OLSX bloqués.
- **P6. FOUC + flash de thème sur les 33 pages** : nav et footer injectés par `nav.js` dans `DOMContentLoaded` (lignes 147-155) → apparition tardive + CLS ; le thème est appliqué au même moment (`nav.js:208-216`) → flash sombre→clair. Correctif : mini-script inline de thème dans le `<head>` + `defer` sur nav.js. Aucun `<noscript>` : sans JS, aucune navigation sur tout le site.
- **P7. `.reveal` : accueil invisible si le JS échoue** : `shared.css:509-512` met 28 blocs d'`index.html` en `opacity:0`, révélés par IntersectionObserver inline. Pas de fallback, pas de `prefers-reduced-motion` (0 occurrence dans tout le CSS).
- **P8. Pas de `srcset`/`sizes`** sur les 4 photos d'`index.html` (les seules images du site — bien servies en `<picture>`+WebP+lazy+dimensions ✅) : une 1200×800 de 104 Ko part telle quelle sur mobile 375 px (~70 % d'économie possible). Pas d'AVIF.
- **P9. Cache 1 an `immutable` sur les images sans fingerprint des noms** (`_headers:39-52`) + cache 24 h sur `/*.js` qui s'applique aussi à `/sw.js` (propagation d'un correctif SW : jusqu'à 24 h).
- **P10. `manifest.json` : les 3 icônes en 404** (`favicon32x32.png`, `favicon512.png`, `appletouchicon.png` — tous sans tirets, lignes 15, 20, 25) → PWA `/gestion` non installable (aucune icône 192px valide de toute façon). `scope: "/"` trop large.

## 🟡 Mineur (performance)

- ~37 Ko de `<head>` copié-collé sur 30 pages (bloc fonts/preload/favicon identique) — inévitable sans build step, mais un `<style>` de 105 octets dupliqué sur 12 pages services devrait rejoindre `services.css`.
- JSON-LD volumineux inline : `faq.html:33-58` = 7,3 Ko bloquant le parseur.
- `codage-vag-admin.html` charge `codage-vag-data.js` (79 Ko non minifié) + 3 SDK Firebase pour une page qui ne fonctionne pas.
- Grain SVG en `body::before` `position:fixed` z-index 9998 sur toutes les pages (`shared.css:75-84`) — coût de composition permanent sur mobile bas de gamme.
- Seul `index.html` utilise `preload` pour ses ressources critiques ; Google Fonts bloquant sur `gestion.html:22` et `codage-vag.html:49` (les 31 autres pages font bien `media=print onload` ✅).

---

# 4. ACCESSIBILITÉ

## 🔴 Critique

### A1. Les cases « prestations » du formulaire de contact sont inutilisables au clavier et invisibles aux lecteurs d'écran
`contact.html:214-279` + `contact.css:74` : les 8 prestations sont des `<div onclick>` sans `tabindex`, `role`, `aria-checked` ni `<label>`, avec l'`<input type=checkbox>` en `display:none` (donc hors tabulation) et jamais synchronisé par `toggleCheck()` (`contact.html:438`). C'est le cœur du formulaire de devis.

### A2. Pas de `<form>`, pas de restitution d'erreur accessible sur la page contact
Aucun élément `<form>` dans `contact.html` (pas de soumission Entrée, pas d'autofill fiable). Les erreurs de `sendWhatsApp()` (lignes 440-508) s'affichent sans `aria-live`/`aria-invalid`/`aria-describedby` et sans déplacement du focus — jamais annoncées par un lecteur d'écran.

## 🟠 Important

- **A3. Contrastes hors WCAG AA** (`shared.css:7-61`) : `--muted2` dark 2.87:1, et **tout le thème clair est non conforme** — `--blue` 2.87, `--green` 1.76, `--amber` 1.97, `--muted2` 2.33, blanc sur bouton bleu 3.12. Le thème clair est servi par défaut si `prefers-color-scheme: light`.
- **A4. Pas d'indicateur de focus global** : seuls 2 éléments ont un `:focus-visible` (`shared.css:206, 229`) ; `outline:none` sans remplacement dans `contact.css:64`, `codage-vag.css:222/274/587`, `faq.css:46`, `ethanol-prix.css:326`. Aucun lien d'évitement (« Aller au contenu ») sur les 37 pages.
- **A5. Dropdowns de navigation sans ARIA** (`nav.js:12, 35`) : pas d'`aria-expanded`/`aria-haspopup`, pas d'Escape, `href="#"` pour un rôle de bouton. (Le burger, lui, est correct ✅ ; les liens des menus fermés ne sont pas focusables ✅.)
- **A6. FAQ : ~100 réponses masquées en `max-height:0`** restent dans l'arbre d'accessibilité, liens internes focusables invisibles (`faq.html:224-228`) ; `aria-expanded` présent mais pas d'`aria-controls`/`id`/`role=region` ; `max-height:600px` tronque les réponses longues (`faq.html:644`). Même schéma sur ~10 autres pages ; `simulateur.html:1080-1089` n'a même pas `aria-expanded`.
- **A7. Widget WhatsApp** (`whatsapp-widget.js`) : bouton fermer visuellement vide (ligne 115), couleurs en dur ignorant le thème clair (lignes 27-58), et **superposition avec la barre d'appel mobile** (`z-index` 9000 vs 8000, `bottom` en conflit) sur les écrans < 600 px.

## 🟡 Mineur (accessibilité)

- `contact.html` : 1 `h1`, 0 `h2` — les étapes du formulaire sont des `<div>` au lieu de `<h2>`/`<fieldset><legend>`.
- `index.html:120` : tagline visible avec `aria-hidden="true"`.
- `codage-vag-admin.html:325` : bouton sans texte ni `aria-label`.
- `target="_blank"` sans `rel="noopener"` : `codage-vag.html:182` + ~20 occurrences dans `sitemap-visuel.html`.
- 3 breakpoints mobiles différents (nav 900 px, barre d'appel 768 px, widget WhatsApp 600 px). Viewport ✅ présent sur 37/37 pages.

---

# 5. QUALITÉ DE CODE & COHÉRENCE

- **Doublons de fichiers** : `claude-proxy.js` ×3, `olsx-token` ×2 (voir S7).
- **Fichiers orphelins** : `logo_img.jpg` (36 Ko, 0 référence), `logo-nav.png` (référencé uniquement par le pré-cache SW, jamais affiché), dossier `images/produits/` entier (5 SVG placeholders de la boutique jamais livrée), 3 CSS villes supprimées.
- **Code mort / résidus** : listener `click` vide (`whatsapp-widget.js:145-150`), commentaire GoTrue vers un fichier inexistant (`index.html:618`), bloc commentaire d'exemple en prod (`simulateur.html:810-818`), donnée de démo `thomas@email.fr` (`gestion.html:4210`), versions contradictoires « nav.js v3/v4 » (`nav.js:2` vs `:143`).
- **Logs en production** : 24 `console.*` dans `gestion.html`, et surtout `codage-vag.js:349` qui logge les données client des commandes.
- **`confirmation.html`** : nav-container sans `nav.js` (nav vide), redirigée 301 vers `/` mais toujours déployée.
- **Deux blocs `/*` dans `_headers`** (lignes 6-12 et 15-16) et 4 blocs CSP identiques dupliqués (`/gestion`, `/gestion.html`, `/devis`, `/pro`) — dérive garantie au premier refactor.
- **Ordre de scripts incohérent** : `codage-vag.html:253-254` charge `whatsapp-widget.js` avant `nav.js` (inverse des 32 autres pages).
- **Documentation obsolète** : `DEPLOIEMENT.md` (guide GitHub Pages listant des fichiers supprimés), `CLAUDE.md` mentionne `netlify/functions/` (pluriel) alors que le dossier est `netlify/function/` (la config `netlify.toml:5` est, elle, correcte ✅).

---

# 6. CE QUI EST BIEN FAIT ✅

- **Zéro secret d'infrastructure en dur** (hors token OLSX, S5) : toutes les fonctions utilisent `process.env`, historique Git propre (vérifié sur l'intégralité des révisions). Distinction clé publique/privée EmailJS parfaitement respectée.
- **Vraie authentification Firebase** dans `gestion.html` (pas de mot de passe en dur ni de logique contournable), gestion du rate-limit de connexion.
- **`seo-meta.js` non injectable** : slugs validés contre allowlists, aucune donnée utilisateur n'atteint l'injection HTML. Les 104 slugs edge/data correspondent parfaitement.
- **HSTS avec preload**, `nosniff`, `Referrer-Policy`, `Permissions-Policy` corrects.
- Les 4 photos d'`index.html` : `<picture>` + WebP + `loading="lazy"` + dimensions explicites + alt descriptifs — exemplaires.
- `lang="fr"` sur 36/36 pages, `alt` sur 100 % des images, titres uniques, canonicals cohérents sans `.html`, h1 unique sur 35/37 pages, viewport partout, `display=swap` partout.
- Le formulaire contact n'a aucun backend (lien wa.me) : surface d'attaque nulle côté données.

---

# 7. RÉSUMÉ — POINTS À CORRIGER PAR PRIORITÉ

## 🚨 À faire aujourd'hui (sécurité des données)

1. **Vérifier et durcir les règles Firestore/Storage** dans la console Firebase, les versionner dans le repo (S3) — conditionne la gravité de S4, S6, S8.
2. **Désactiver l'inscription publique Firebase Auth** ou filtrer sur l'UID admin (S4).
3. **Révoquer le token OLSX** exposé dans `gestion.html:1578` et le servir via la fonction dédiée (S5).
4. **Authentifier `sms-send`** (idToken Firebase + rejet des origines inconnues) (S1).
5. **Authentifier et valider `upload-devis`** (`docId`/`filename` en `/^[a-zA-Z0-9_-]+$/`, retirer `public:true`, vérifier `%PDF-`, limiter la taille) (S2).
6. **Supprimer les 3 copies de `claude-proxy`** + doublon `olsx-token` sans extension (S7).

## 🔴 Cette semaine (SEO + bugs fonctionnels)

7. **Corriger `FIREBASE_CONFIG` → `firebaseConfig`** dans `codage-vag.js:36` — les demandes de devis VAG sont actuellement toutes perdues (P3).
8. **Sitemap/redirects** : retirer pau/dax/auxerre du sitemap, pointer les 301 vers une page existante, purger les ~60 liens internes morts, nettoyer les 5 redirects boutique (SEO1, SEO2, SEO17).
9. **Trancher atelier vs domicile** et corriger les ~15 incohérences dont « directement chez nous » (SEO5).
10. **JSON-LD local** : un seul `LocalBusiness` (Biarritz, adresse complète), GPS corrigés (Pau→Biarritz), retirer les avis auto-déclarés, `Service`+`areaServed` sur les pages villes (SEO3, SEO7, SEO8, SEO9).
11. **Réécrire Anglet et Bayonne** (duplication 85-92 %) et étoffer Saint-Jean-de-Luz (SEO4).
12. **`robots.txt`** : bloquer `/gestion`, `/codage-vag-admin`, `/head-seo-snippet.html`, `/download`, `/netlify/` (SEO6).
13. **Corriger `sw.js`** (Promise ligne 74, noms d'icônes 131-132, check `response.ok`) et `manifest.json` (3 icônes 404) (P2, P10).
14. **Rendre le formulaire contact accessible** : `<form>`, `<label>`, checkboxes focusables, `aria-live` (A1, A2).
15. **`og:image` : basculer les 28 pages du `.webp` au `.jpg`** (aperçus WhatsApp vides) (SEO10).
16. **CSP `/simulateur.html`** manquante — simulateur cassé en accès direct (P5).
17. **Créer un `.gitignore`** (S9).

## 🟠 Ce mois-ci

18. Extraire le JS/CSS inline de `gestion.html` (286 Ko), `defer` sur les SDK Firebase (P1).
19. Soft-404 de l'edge function : renvoyer 404 pour les slugs VAG inconnus (SEO11) ; réécrire le JSON-LD des pages modèles (SEO12).
20. Thème clair : corriger les contrastes (`--blue`, `--green`, `--amber`, `--muted2`) (A3) ; `:focus-visible` global + skip-link (A4) ; ARIA des dropdowns (A5) et des FAQ (A6).
21. Supprimer le code mort : `download`, `CNAME`, `DEPLOIEMENT.md`, `head-seo-snippet.html`, `codage-vag-admin.html`, 3 CSS villes, `logo_img.jpg`, `images/produits/`, `confirmation.html` ; relier les 6 CSS dupliqués inline (P4).
22. Anti-flash de thème (script inline dans `<head>`) + `defer` sur nav.js (P6) ; fallback `.reveal` + `prefers-reduced-motion` (P7).
23. Chemins absolus dans `404.html` (SEO14) ; liens email des mentions légales (SEO18).
24. Raccourcir les 10 titres et 9 descriptions hors norme, décoder les entités HTML (SEO13) ; compléter le sitemap (2 pages + 25 modèles VAG, `lastmod`) (SEO15, SEO16).
25. `srcset` sur les 4 photos, fusionner les blocs `_headers`, `frame-ancestors`, retirer `X-XSS-Protection`, sortir `twilio` du `package.json`, superposition widget WhatsApp/barre d'appel, retirer les `console.log` de prod.

---

*Audit réalisé par analyse statique du code du dépôt `uziaq/Areprog` (branche `main`, commit `4a495fc`). Les points S3 et S4 nécessitent une vérification dans la console Firebase (hors du dépôt).*
