// Netlify Function — serveur MCP (Model Context Protocol) pour le back-office
// À ajouter dans Claude comme « connecteur personnalisé » : URL https://areprog.fr/mcp
//
// Donne à Claude un accès direct aux données de gestion.html (mêmes
// collections Firestore, via le SDK admin) : rendez-vous, devis/factures,
// clients, demandes de contact, catalogue. Tout ce qui est écrit ici
// apparaît en temps réel dans gestion.html (onSnapshot sur docs/clients/rdvs).
//
// Routes (toutes réécrites vers cette fonction dans _redirects) :
//   POST /mcp                                     → JSON-RPC MCP (Streamable HTTP, réponses JSON sans SSE)
//   GET  /.well-known/oauth-protected-resource    → métadonnées RFC 9728
//   GET  /.well-known/oauth-authorization-server  → métadonnées RFC 8414
//   POST /mcp/register                            → enregistrement dynamique de client (RFC 7591)
//   GET  /mcp/authorize                           → page de connexion (identifiants Firebase de gestion.html)
//   POST /mcp/authorize                           → vérifie les identifiants, renvoie le code vers Claude
//   POST /mcp/token                               → échange code (PKCE S256 obligatoire) / refresh token
//
// Authentification : OAuth 2.1 minimal et sans état. Codes et jetons sont
// signés en HMAC avec MCP_OAUTH_SECRET — changer ce secret révoque d'un coup
// tous les accès déjà accordés. Seules les URL de retour de Claude (claude.ai,
// claude.com) et les boucles locales (Claude Code / Claude Desktop) sont
// acceptées, pour qu'un tiers ne puisse pas détourner le code vers son site.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase           (requis)
//   MCP_OAUTH_SECRET         : chaîne aléatoire ≥ 32 caractères            (requis)
//   MCP_ALLOWED_EMAILS       : e-mails autorisés, séparés par des virgules (optionnel —
//                              par défaut tout compte Firebase Auth de gestion.html)
//   RESEND_API_KEY           : clé API Resend (requise pour envoyer_document)
//   RESEND_FROM              : adresse d'expédition vérifiée (optionnel)
//
// Envoi des devis/factures : jamais sans accord. preparer_envoi_document
// renvoie le récapitulatif complet et un code de confirmation lié au contenu
// exact (document + destinataire + objet + message) ; envoyer_document exige
// ce code et refuse si quoi que ce soit a changé depuis. L'outil d'envoi est
// marqué destructif pour que Claude demande la validation dans son interface.

const crypto = require('crypto');
const admin = require('firebase-admin');
const { checkRateLimit } = require('../_lib/rate-limit');
const { buildDocPdf } = require('./pdf');

const BASE = 'https://areprog.fr';
const RESOURCE = BASE + '/mcp';
// Clé web publique Firebase (la même que dans gestion.js) — sert uniquement à
// vérifier e-mail + mot de passe via l'API Identity Toolkit.
const FIREBASE_WEB_API_KEY = 'AIzaSyCAPjBtmwrcNUUg9Nlkn_2ltUa_P_90yV4';

const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const ACCESS_TTL = 60 * 60;            // 1 h
const REFRESH_TTL = 30 * 24 * 60 * 60; // 30 jours
const CODE_TTL = 5 * 60;               // 5 min

const RESEND_FROM = 'AREPROG <contact@areprog.fr>';
const REPLY_TO = 'arthur@areprog.fr'; // = NOTIF_EMAIL de gestion.js
const GOOGLE_REVIEW_URL = 'https://g.page/r/CQNOwHcSQhflEBM/review'; // = gestion.js
const ENVOI_TTL = 60 * 60; // validité du code de confirmation : 1 h
// Repli si gestion.html n'a pas encore recopié son modèle dans config/template.
const TPL_FALLBACK = {
  nom: 'AREPROG', activite: 'Reprogrammation moteur en atelier',
  tel: '06 67 92 46 30', email: 'contact@areprog.fr', web: 'areprog.fr', adresse: 'Atelier : Biarritz (64)',
  legal: 'AREPROG SASU au capital de 500 € · Siège : 47 rue Vivienne 75002 Paris · RCS Paris 130 785 355 · SIRET 130 785 355 00012 · TVA intracom. FR01 130 785 355',
  footer: 'AREPROG — Reprogrammation moteur en atelier · Biarritz · Pays Basque (64) · Landes (40)\n06 67 92 46 30 · areprog.fr · Garantie 2 ans sur chaque prestation · 100% réversible',
  color: '#1E90FF', showVeh: true, showFooter: true, showLegal: true, showCgv: true, cgv: '', validite: 30,
};
const DOC_TYPES = ['devis', 'facture', 'ordre'];
const DOC_PREFIX = { devis: 'DEV', facture: 'FAC', ordre: 'ODR' };
const DOC_STATUTS = ['créé', 'envoyé', 'accepté', 'payé', 'annulé'];
const RDV_TYPES = ['rdv', 'relance', 'impaye', 'perso'];
const DEFAULT_DISPO = {
  jours: [1, 2, 3, 4, 5, 6],
  heures: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
  fermetures: [],
};

function initFirebase() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT non configurée');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
function db() { return admin.firestore(); }

// ════════════════════════════════════════════════════════════
//  HTTP utilitaires
// ════════════════════════════════════════════════════════════
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Mcp-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Session-Id',
};

function json(status, body, extra) {
  return {
    statusCode: status,
    headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, CORS, extra || {}),
    body: JSON.stringify(body),
  };
}

function html(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
      'X-Robots-Tag': 'noindex, nofollow',
    },
    body,
  };
}

function rawBody(event) {
  if (!event.body) return '';
  return event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
}

function parseForm(event) {
  const ct = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
  const raw = rawBody(event);
  if (ct.includes('application/json')) {
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

// Chemin d'origine de la requête (avant réécriture _redirects).
function requestPath(event) {
  try { if (event.rawUrl) return new URL(event.rawUrl).pathname; } catch (e) { /* ignore */ }
  return event.path || '';
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ════════════════════════════════════════════════════════════
//  Jetons signés (HMAC-SHA256)
// ════════════════════════════════════════════════════════════
function secret() {
  const s = process.env.MCP_OAUTH_SECRET || '';
  if (s.length < 32) throw new Error('MCP_OAUTH_SECRET absente ou trop courte (32 caractères minimum)');
  return s;
}
function b64url(buf) { return Buffer.from(buf).toString('base64url'); }

function sign(payload, ttl) {
  const body = b64url(JSON.stringify(Object.assign({}, payload, { exp: Math.floor(Date.now() / 1000) + ttl })));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
  return body + '.' + sig;
}

function verify(token, typ) {
  if (typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let p;
  try { p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!p || p.typ !== typ || !p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
  return p;
}

// ════════════════════════════════════════════════════════════
//  OAuth
// ════════════════════════════════════════════════════════════
function redirectUriAllowed(uri) {
  let u;
  try { u = new URL(uri); } catch (e) { return false; }
  if (u.protocol === 'https:' && ['claude.ai', 'claude.com'].includes(u.hostname)) return u.pathname === '/api/mcp/auth_callback';
  if (u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname)) return true;
  return false;
}

function emailAllowed(email) {
  const list = (process.env.MCP_ALLOWED_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !list.length || list.includes(String(email || '').toLowerCase());
}

function protectedResourceMetadata() {
  return json(200, {
    resource: RESOURCE,
    authorization_servers: [BASE],
    bearer_methods_supported: ['header'],
    resource_name: 'AREPROG — gestion',
  });
}

function authServerMetadata() {
  return json(200, {
    issuer: BASE,
    authorization_endpoint: BASE + '/mcp/authorize',
    token_endpoint: BASE + '/mcp/token',
    registration_endpoint: BASE + '/mcp/register',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: ['gestion'],
  });
}

// Enregistrement dynamique sans état : on vérifie seulement les URL de
// retour ; elles sont revérifiées à chaque /authorize.
function register(event) {
  const body = parseForm(event);
  const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
  if (!uris.length || !uris.every(redirectUriAllowed)) {
    return json(400, { error: 'invalid_redirect_uri', error_description: 'URL de retour non autorisée' });
  }
  return json(201, {
    client_id: 'mcp-' + crypto.randomBytes(12).toString('hex'),
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: body.client_name || 'Claude',
    redirect_uris: uris,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });
}

function loginPage(params, erreur) {
  const hidden = ['client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method', 'scope']
    .map((k) => `<input type="hidden" name="${k}" value="${escHtml(params[k] || '')}">`).join('');
  return html(erreur ? 401 : 200, `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Connexion AREPROG</title>
<style>
body{margin:0;background:#f4f5f7;font-family:system-ui,sans-serif;color:#1a1c1f;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
form{background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:28px;width:100%;max-width:360px}
h1{font-size:20px;margin:0 0 6px}p{font-size:14px;color:#555;margin:0 0 18px}
label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}
input[type=email],input[type=password]{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccd;border-radius:3px;font-size:15px}
button{margin-top:20px;width:100%;padding:11px;border:0;border-radius:3px;background:#0d5baf;color:#fff;font-size:15px;font-weight:600;cursor:pointer}
.err{background:#fdecea;color:#a12;padding:8px 10px;border-radius:3px;font-size:13px;margin-bottom:8px}
</style></head><body>
<form method="post" action="/mcp/authorize">
<h1>AREPROG — accès Claude</h1>
<p>Connectez-vous avec vos identifiants de gestion pour autoriser Claude à gérer vos devis, rendez-vous et clients.</p>
${erreur ? `<div class="err">${escHtml(erreur)}</div>` : ''}
${hidden}
<label for="email">E-mail</label><input id="email" name="email" type="email" required autocomplete="username">
<label for="password">Mot de passe</label><input id="password" name="password" type="password" required autocomplete="current-password">
<button type="submit">Autoriser Claude</button>
</form></body></html>`);
}

function checkAuthorizeParams(p) {
  if (!p.client_id) return 'client_id manquant';
  if (!p.redirect_uri || !redirectUriAllowed(p.redirect_uri)) return 'URL de retour non autorisée';
  if (!p.code_challenge || p.code_challenge_method !== 'S256') return 'PKCE (S256) obligatoire';
  return null;
}

async function firebaseSignIn(email, password) {
  const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FIREBASE_WEB_API_KEY, {
    method: 'POST',
    // La clé web peut être restreinte par référent HTTP dans la console Google Cloud.
    headers: { 'Content-Type': 'application/json', 'Referer': BASE + '/' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.localId ? { uid: data.localId, email: data.email } : null;
}

async function authorize(event) {
  if (event.httpMethod === 'GET') {
    const p = event.queryStringParameters || {};
    if (p.response_type && p.response_type !== 'code') return html(400, 'response_type non supporté');
    const err = checkAuthorizeParams(p);
    if (err) return html(400, escHtml(err));
    return loginPage(p);
  }

  const p = parseForm(event);
  const err = checkAuthorizeParams(p);
  if (err) return html(400, escHtml(err));

  initFirebase();
  const rl = await checkRateLimit(db(), event, 'mcp-login', { max: 8, windowMs: 15 * 60 * 1000 });
  if (rl.limited) return loginPage(p, 'Trop de tentatives — réessayez dans quelques minutes.');

  const user = await firebaseSignIn(String(p.email || '').trim(), String(p.password || ''));
  if (!user) return loginPage(p, 'E-mail ou mot de passe incorrect.');
  if (!emailAllowed(user.email)) return loginPage(p, 'Ce compte n\'est pas autorisé à connecter Claude.');

  const code = sign({ typ: 'code', uid: user.uid, email: user.email, cid: p.client_id, ru: p.redirect_uri, cc: p.code_challenge }, CODE_TTL);
  const target = new URL(p.redirect_uri);
  target.searchParams.set('code', code);
  if (p.state) target.searchParams.set('state', p.state);
  // Pas de 302 : la CSP globale du site (form-action 'self') bloquerait la
  // redirection vers claude.ai à la suite d'un POST de formulaire.
  const url = escHtml(target.toString());
  return html(200, `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${url}"><title>Autorisé</title></head>
<body style="font-family:system-ui,sans-serif;padding:24px">Accès autorisé ✓ — <a href="${url}">retour à Claude</a></body></html>`);
}

async function issueTokens(uid, email, cid) {
  return {
    access_token: sign({ typ: 'access', uid, email, cid, aud: RESOURCE }, ACCESS_TTL),
    token_type: 'Bearer',
    expires_in: ACCESS_TTL,
    refresh_token: sign({ typ: 'refresh', uid, email, cid }, REFRESH_TTL),
    scope: 'gestion',
  };
}

async function token(event) {
  const p = parseForm(event);
  const fail = (desc) => json(400, { error: 'invalid_grant', error_description: desc });

  if (p.grant_type === 'authorization_code') {
    const c = verify(p.code, 'code');
    if (!c) return fail('Code invalide ou expiré');
    if (p.redirect_uri && p.redirect_uri !== c.ru) return fail('redirect_uri différente');
    if (p.client_id && p.client_id !== c.cid) return fail('client_id différent');
    const challenge = b64url(crypto.createHash('sha256').update(String(p.code_verifier || '')).digest());
    if (challenge !== c.cc) return fail('code_verifier invalide');
    return json(200, await issueTokens(c.uid, c.email, c.cid));
  }

  if (p.grant_type === 'refresh_token') {
    const r = verify(p.refresh_token, 'refresh');
    if (!r) return fail('Refresh token invalide ou expiré');
    // Un compte désactivé/supprimé dans Firebase Auth perd l'accès au prochain rafraîchissement.
    initFirebase();
    try {
      const u = await admin.auth().getUser(r.uid);
      if (u.disabled || !emailAllowed(u.email)) return fail('Compte désactivé');
    } catch (e) { return fail('Compte introuvable'); }
    return json(200, await issueTokens(r.uid, r.email, r.cid));
  }

  return json(400, { error: 'unsupported_grant_type' });
}

function unauthorized() {
  return json(401, { error: 'invalid_token' }, {
    'WWW-Authenticate': `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource/mcp"`,
  });
}

// ════════════════════════════════════════════════════════════
//  Utilitaires métier (mêmes règles que gestion.js)
// ════════════════════════════════════════════════════════════
function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

// Date du jour à Paris (YYYY-MM-DD) — la fonction tourne en UTC.
function todayParis(offsetDays) {
  const d = new Date(Date.now() + (offsetDays || 0) * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);
}

// "2026-10-18" + "14:30" (heure de Paris) → ISO UTC, comme le fireISO calculé
// par le navigateur dans gestion.js (utilisé par rdv-rappels).
function parisToISO(date, heure) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = heure.split(':').map(Number);
  const wanted = Date.UTC(y, m - 1, d, hh, mm);
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(new Date(guess)).map((x) => [x.type, x.value]));
    const asParis = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
    guess += wanted - asParis;
  }
  return new Date(guess).toISOString();
}

function isDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z')); }
function isHeure(s) { return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s); }
function str(v, max) { return typeof v === 'string' ? v.trim().slice(0, max || 500) : (v == null ? '' : String(v).slice(0, max || 500)); }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

function lineNetHT(l) {
  if (!l || l.offert) return 0;
  let base = (parseFloat(l.qte) || 0) * (parseFloat(l.pu) || 0);
  const r = parseFloat(l.remise) || 0;
  if (r > 0) base = l.remiseType === 'eur' ? Math.max(0, base - r) : base * (1 - Math.min(r, 100) / 100);
  return base < 0 ? 0 : base;
}
function lineGrossHT(l) { return (!l || l.offert) ? 0 : (parseFloat(l.qte) || 0) * (parseFloat(l.pu) || 0); }

function docReglements(d) {
  const list = [];
  if (d.acompte && d.acompte.recu) list.push({ id: 'acompte', date: d.acompte.date, montant: d.acompte.montant || 0, mode: d.acompte.mode || '', note: 'Acompte' });
  return list.concat(d.paiements || []);
}
function docEncaisse(d) { return docReglements(d).reduce((s, p) => s + (p.montant || 0), 0); }
function docResteDu(d) { return Math.max(0, round2((d.ttc || 0) - docEncaisse(d))); }

async function allDocs() {
  const snap = await db().collection('docs').get();
  return snap.docs.map((d) => d.data()).filter((d) => d && d.id != null);
}
async function allClients() {
  const snap = await db().collection('clients').get();
  return snap.docs.map((d) => d.data()).filter((c) => c && c.id != null);
}
async function allRdvs() {
  const snap = await db().collection('rdvs').get();
  return snap.docs.filter((d) => d.id !== 'all').map((d) => d.data()).filter((r) => r && r.id);
}

async function findDoc(args) {
  if (args.id != null && args.id !== '') {
    const snap = await db().collection('docs').doc(String(args.id)).get();
    if (snap.exists) return snap.data();
  }
  if (args.num) {
    const snap = await db().collection('docs').where('num', '==', String(args.num)).limit(1).get();
    if (!snap.empty) return snap.docs[0].data();
  }
  return null;
}

async function findClient(id) {
  if (id == null || id === '') return null;
  const snap = await db().collection('clients').doc(String(id)).get();
  return snap.exists ? snap.data() : null;
}

// Même logique que genNum() dans gestion.js (compteur annuel), en sautant
// un numéro déjà pris au besoin.
function genNum(prefix, docs) {
  const y = todayParis().slice(0, 4);
  const pre = prefix + '-' + y;
  const taken = new Set(docs.map((d) => d.num));
  let n = docs.filter((d) => d.num && d.num.startsWith(pre)).length + 1;
  while (taken.has(pre + '-' + String(n).padStart(3, '0'))) n++;
  return pre + '-' + String(n).padStart(3, '0');
}

function resumeDoc(d) {
  return {
    id: d.id, type: d.type, num: d.num, date: d.date, statut: d.statut,
    client: d.cn, vehicule: [d.vm, d.vmo, d.vmot].filter(Boolean).join(' ') || undefined,
    immat: d.vim || undefined,
    ht: round2(d.ht), ttc: round2(d.ttc),
    resteDu: d.type === 'facture' ? docResteDu(d) : undefined,
  };
}

function resumeRdv(r) {
  return {
    id: r.id, titre: r.title, type: r.type, date: r.date, heure: r.heure || '',
    client: r.clientNom || '', clientId: r.clientId || null, tel: r.clientTel || '',
    lieu: r.lieu || '', notes: r.notes || '', statut: r.statut || undefined,
    source: r.source || undefined, docIds: r.docIds || (r.docId ? [r.docId] : []),
  };
}

function resumeClient(c) {
  return {
    id: c.id, nom: c.nom, tel: c.tel || '', email: c.email || '', ville: c.ville || '', type: c.type || 'particulier',
    vehicules: (c.vehs && c.vehs.length ? c.vehs : (c.vm || c.vim ? [c] : []))
      .map((v) => ({ marque: v.vm || '', modele: v.vmo || '', motorisation: v.vmot || '', annee: v.van || '', immat: v.vim || '' })),
  };
}

function cleanLines(lignes) {
  return (Array.isArray(lignes) ? lignes : []).slice(0, 60).map((l, i) => ({
    id: Date.now() + i + Math.random(),
    label: str(l.label, 200),
    qte: parseFloat(l.qte) > 0 ? parseFloat(l.qte) : 1,
    pu: round2(parseFloat(l.pu) || 0),
    desc: str(l.desc, 1000),
    ref: str(l.ref, 80),
    remise: parseFloat(l.remise) > 0 ? parseFloat(l.remise) : 0,
    remiseType: l.remiseType === 'eur' ? 'eur' : 'pct',
    ...(l.offert ? { offert: true } : {}),
  })).filter((l) => l.label);
}

// Totaux d'un document à partir de ses lignes, de sa remise globale et de
// son taux de TVA — même calcul que buildObj() dans gestion.js.
function computeTotals(lines, remiseGlobale, tvaRate) {
  const brut = lines.reduce((s, l) => s + lineGrossHT(l), 0);
  const net = lines.reduce((s, l) => s + lineNetHT(l), 0);
  const rg = remiseGlobale || {};
  const val = Math.max(0, parseFloat(rg.val) || 0);
  const rgEur = rg.type === 'pct' ? net * Math.min(val, 100) / 100 : rg.type === 'eur' ? Math.min(val, net) : 0;
  const ht = Math.max(0, net - rgEur);
  const rate = (parseFloat(tvaRate) || 0) / 100;
  return {
    htBrut: brut,
    remiseLignes: Math.max(0, brut - net),
    remiseGlobale: { type: rg.type || 'none', val: rg.type === 'pct' || rg.type === 'eur' ? val : 0, montant: rgEur },
    remiseTotale: Math.max(0, brut - net) + rgEur,
    ht,
    tva: ht * rate,
    ttc: ht * (1 + rate),
  };
}

async function loadTemplate() {
  const snap = await db().collection('config').doc('template').get();
  const tpl = Object.assign({}, TPL_FALLBACK, snap.exists ? snap.data() : {});
  if (!tpl.legal) tpl.legal = TPL_FALLBACK.legal;
  return { tpl, synchro: snap.exists };
}

function eur(n) {
  const v = round2(n).toFixed(2).split('.');
  return v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + v[1] + ' €';
}
function dateFr(d) { return isDate(d) ? d.split('-').reverse().join('/') : (d || ''); }
function typeLabel(d) { return d.type === 'facture' ? 'Facture' : d.type === 'ordre' ? 'Ordre de réparation' : 'Devis'; }

// Mêmes textes par défaut que buildDefaultSubject / buildDefaultMessage (gestion.js).
function defaultSubject(d, tpl) { return (tpl.nom || 'AREPROG') + ' — ' + typeLabel(d) + ' ' + (d.num || '') + ' — ' + eur(d.ttc); }
function defaultMessage(d, tpl) {
  const prenom = (d.cn || '').trim().split(/\s+/)[0] || '';
  const salut = 'Bonjour' + (prenom ? ' ' + prenom : '') + ',';
  const veh = [d.vm, d.vmo].filter(Boolean).join(' ');
  const contact = [tpl.tel, tpl.web].filter(Boolean).join(' · ');
  const sign = 'Cordialement,\n' + (tpl.nom || 'AREPROG') + (contact ? '\n' + contact : '');
  const type = typeLabel(d);
  if (type === 'Facture') {
    return salut + '\n\nMerci pour votre confiance. Vous trouverez ci-joint votre facture ' + (d.num || '')
      + (veh ? ' pour l\'intervention réalisée sur votre ' + veh : '') + ', d\'un montant de ' + eur(d.ttc) + ' TTC.\n\n'
      + 'N\'hésitez pas à nous contacter pour toute question concernant cette facture.\n\n' + sign;
  }
  if (type === 'Ordre de réparation') {
    return salut + '\n\nVous trouverez ci-joint l\'ordre de réparation ' + (d.num || '') + (veh ? ' pour votre ' + veh : '') + '.\n\n'
      + 'Merci de le relire avant votre venue à l\'atelier ; n\'hésitez pas à nous contacter pour toute question.\n\n' + sign;
  }
  return salut + '\n\nMerci pour votre demande. Vous trouverez ci-joint votre devis ' + (d.num || '')
    + (veh ? ' pour votre ' + veh : '') + ', d\'un montant de ' + eur(d.ttc) + ' TTC.' + (d.ech ? ' Il est valable jusqu\'au ' + dateFr(d.ech) + '.' : '') + '\n\n'
    + 'Pour valider cette intervention, il vous suffit de répondre à cet email ou de nous appeler' + (tpl.tel ? ' au ' + tpl.tel : '')
    + ' : nous conviendrons ensemble d\'un créneau à l\'atelier.\n\n'
    + 'N\'hésitez pas à revenir vers nous pour toute question, nous restons à votre disposition.\n\n' + sign;
}

// Même gabarit que buildDocEmailHtml (gestion.js), blocs récap + PJ (+ avis Google sur facture).
function docEmailHtml(d, tpl, message) {
  const color = /^#[0-9a-fA-F]{6}$/.test(tpl.color) ? tpl.color : '#2196F3';
  const type = typeLabel(d);
  const row = (label, val, accent) => val ? '<tr><td style="padding:5px 0;color:#6b7280;font-size:13px">' + label + '</td>'
    + '<td style="padding:5px 0;text-align:right;font-size:13px' + (accent ? ';font-weight:700;color:' + color : ';color:#111') + '">' + val + '</td></tr>' : '';
  const recap = '<table style="width:100%;border-collapse:collapse">' + row('Référence', escHtml(d.num || '')) + row('Date', dateFr(d.date))
    + (type === 'Devis' && d.ech ? row('Valable jusqu\'au', dateFr(d.ech)) : '') + row('Montant TTC', eur(d.ttc), true) + '</table>';
  const article = type === 'Facture' ? 'cette facture' : type === 'Ordre de réparation' ? 'cet ordre de réparation' : 'ce devis';
  return '<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
    + '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
    + '<div style="background:' + color + ';padding:22px 28px"><div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">' + escHtml(tpl.nom || 'AREPROG') + '</div>'
    + (tpl.activite ? '<div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px">' + escHtml(tpl.activite) + '</div>' : '') + '</div>'
    + '<div style="padding:26px 28px"><p style="margin:0 0 18px;font-size:14px;color:#111;line-height:1.6">' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
    + '<div style="background:#f9fafb;border:1px solid #eef0f2;border-radius:8px;padding:14px 18px;margin:0 0 18px">' + recap + '</div>'
    + '<p style="margin:0' + (type === 'Facture' ? ' 0 22px' : '') + ';font-size:13px;color:#374151">📎 Vous trouverez ' + article + ' en pièce jointe, au format PDF.</p>'
    + (type === 'Facture' ? '<div style="text-align:center;padding-top:18px;border-top:1px solid #eef0f2"><p style="margin:0 0 12px;font-size:13px;color:#374151">Si vous êtes satisfait(e) de notre intervention, un avis Google nous aiderait beaucoup à nous faire connaître :</p>'
      + '<a href="' + GOOGLE_REVIEW_URL + '" style="display:inline-block;background:' + color + ';color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px">★★★★★ Laisser un avis Google</a></div>' : '')
    + '</div><div style="background:#f9fafb;border-top:1px solid #eef0f2;padding:16px 28px;font-size:11px;color:#9ca3af;line-height:1.7">' + escHtml(tpl.footer || '').replace(/\n/g, '<br>') + '</div>'
    + '</div></div>';
}

function pdfFilename(d) {
  const type = d.type === 'devis' ? 'Devis' : d.type === 'ordre' ? 'OrdreReparation' : 'Facture';
  const nom = (d.cn || 'Client').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-');
  return 'AREPROG_' + type + '_' + String(d.num || '').replace(/[^a-zA-Z0-9_-]/g, '-') + '_' + nom + '.pdf';
}

// Empreinte de tout ce qui part chez le client : si le document ou l'e-mail
// change après le récapitulatif montré à l'utilisateur, le code ne vaut plus.
function envoiHash(d, envoi) {
  const contenu = {
    d: [d.id, d.type, d.num, d.date, d.ech, d.cn, d.ca, d.cv, d.ct, d.ce, d.vm, d.vmo, d.vmot, d.van, d.vim, d.vkm,
      d.tvaRate, round2(d.ht), round2(d.ttc), d.notes, d.statut, d.accordUsage,
      (d.lines || []).map((l) => [l.label, l.qte, l.pu, l.desc, l.remise, l.remiseType, !!l.offert])],
    e: [envoi.to, envoi.sujet, envoi.message],
  };
  return crypto.createHash('sha256').update(JSON.stringify(contenu)).digest('hex');
}

async function resendSend(payload) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY non configurée sur Netlify');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Resend ' + res.status + ' : ' + (body.message || JSON.stringify(body)).slice(0, 200));
  return body;
}

function emailValide(e) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e || ''); }

// ════════════════════════════════════════════════════════════
//  Outils MCP
// ════════════════════════════════════════════════════════════
const S = {
  date: { type: 'string', description: 'Date au format YYYY-MM-DD' },
  heure: { type: 'string', description: 'Heure HH:MM (heure de Paris)' },
};
const vehiculeSchema = {
  type: 'object',
  properties: {
    marque: { type: 'string' }, modele: { type: 'string' }, motorisation: { type: 'string' },
    annee: { type: 'string' }, immat: { type: 'string' }, km: { type: 'string' },
  },
};

const TOOLS = [
  {
    name: 'resume_activite',
    description: 'Tableau de bord : CA facturé et encaissé du mois, factures impayées, devis en attente, RDV des 7 prochains jours, nouvelles demandes.',
    inputSchema: { type: 'object', properties: { mois: { type: 'string', description: 'Mois YYYY-MM (défaut : mois en cours)' } } },
    annotations: { readOnlyHint: true },
    async run(a) {
      const mois = /^\d{4}-\d{2}$/.test(a.mois || '') ? a.mois : todayParis().slice(0, 7);
      const [docs, rdvs, leads] = await Promise.all([allDocs(), allRdvs(), db().collection('leads').orderBy('createdAt', 'desc').limit(50).get()]);
      const factures = docs.filter((d) => d.type === 'facture' && d.statut !== 'annulé');
      const duMois = factures.filter((d) => (d.date || '').startsWith(mois));
      let encaisseMois = 0;
      factures.forEach((d) => docReglements(d).forEach((p) => { if ((p.date || '').startsWith(mois)) encaisseMois += p.montant || 0; }));
      const impayees = factures.filter((d) => d.statut !== 'payé' && docResteDu(d) > 0);
      const devisAttente = docs.filter((d) => d.type === 'devis' && ['créé', 'envoyé'].includes(d.statut));
      const auj = todayParis(), j7 = todayParis(7);
      const nouvelles = leads.docs.map((x) => x.data()).filter((l) => (l.status || 'nouveau') === 'nouveau');
      return {
        mois,
        caFactureTTC: round2(duMois.reduce((s, d) => s + (d.ttc || 0), 0)),
        nbFactures: duMois.length,
        encaisseTTC: round2(encaisseMois),
        impayes: { total: round2(impayees.reduce((s, d) => s + docResteDu(d), 0)), factures: impayees.map(resumeDoc) },
        devisEnAttente: devisAttente.map(resumeDoc),
        rdvProchains: rdvs.filter((r) => r.date >= auj && r.date <= j7).sort((x, y) => (x.date + (x.heure || '')).localeCompare(y.date + (y.heure || ''))).map(resumeRdv),
        nouvellesDemandes: nouvelles.length,
      };
    },
  },
  {
    name: 'lister_rdvs',
    description: 'Liste les rendez-vous de l\'agenda entre deux dates (défaut : aujourd\'hui → +14 jours). Les demandes de RDV en ligne ont statut "a_confirmer".',
    inputSchema: { type: 'object', properties: { du: S.date, au: S.date, client: { type: 'string', description: 'Filtre sur le nom du client' } } },
    annotations: { readOnlyHint: true },
    async run(a) {
      const du = isDate(a.du) ? a.du : todayParis();
      const au = isDate(a.au) ? a.au : todayParis(14);
      const q = norm(a.client);
      const rdvs = (await allRdvs())
        .filter((r) => r.date >= du && r.date <= au && (!q || norm(r.clientNom + ' ' + r.title).includes(q)))
        .sort((x, y) => (x.date + (x.heure || '')).localeCompare(y.date + (y.heure || '')));
      return { du, au, nombre: rdvs.length, rdvs: rdvs.map(resumeRdv) };
    },
  },
  {
    name: 'creneaux_disponibles',
    description: 'Créneaux horaires libres de l\'atelier pour une date (selon les horaires configurés dans gestion et les RDV déjà pris).',
    inputSchema: { type: 'object', properties: { date: S.date }, required: ['date'] },
    annotations: { readOnlyHint: true },
    async run(a) {
      if (!isDate(a.date)) throw new Error('date invalide (YYYY-MM-DD)');
      const snap = await db().collection('config').doc('rdvDispo').get();
      const c = snap.exists ? snap.data() : {};
      const dispo = {
        jours: Array.isArray(c.jours) && c.jours.length ? c.jours : DEFAULT_DISPO.jours,
        heures: Array.isArray(c.heures) && c.heures.length ? c.heures : DEFAULT_DISPO.heures,
        fermetures: Array.isArray(c.fermetures) ? c.fermetures : [],
      };
      if (!dispo.jours.includes(new Date(a.date + 'T00:00:00Z').getUTCDay())) return { date: a.date, ferme: true, motif: 'Atelier fermé ce jour-là', libres: [] };
      const f = dispo.fermetures.find((x) => x && x.date === a.date);
      if (f) return { date: a.date, ferme: true, motif: 'Fermeture exceptionnelle' + (f.label ? ' — ' + f.label : ''), libres: [] };
      const pris = (await allRdvs()).filter((r) => r.date === a.date && r.heure).map((r) => r.heure);
      return { date: a.date, ferme: false, pris, libres: dispo.heures.filter((h) => !pris.includes(h)) };
    },
  },
  {
    name: 'creer_rdv',
    description: 'Ajoute un rendez-vous (ou une relance / un rappel) à l\'agenda. Rappels e-mail par défaut 24 h et 1 h avant. Vérifier les créneaux avec creneaux_disponibles d\'abord.',
    inputSchema: {
      type: 'object',
      properties: {
        titre: { type: 'string' }, date: S.date, heure: S.heure,
        type: { type: 'string', enum: RDV_TYPES, description: 'rdv = RDV client, relance = relance devis, impaye = relance facture, perso = rappel perso' },
        clientId: { type: ['number', 'string'], description: 'id du carnet clients (voir rechercher_clients)' },
        clientNom: { type: 'string', description: 'si le client n\'est pas dans le carnet' },
        clientTel: { type: 'string' },
        notes: { type: 'string' },
        lieu: { type: 'string' },
        rappels: { type: 'array', items: { type: 'number' }, description: 'Minutes avant le RDV (ex. [1440, 60])' },
        docIds: { type: 'array', items: { type: 'number' }, description: 'ids de devis/factures à lier' },
      },
      required: ['titre', 'date'],
    },
    async run(a) {
      if (!str(a.titre)) throw new Error('titre obligatoire');
      if (!isDate(a.date)) throw new Error('date invalide (YYYY-MM-DD)');
      if (a.heure && !isHeure(a.heure)) throw new Error('heure invalide (HH:MM)');
      const client = await findClient(a.clientId);
      if (a.clientId != null && a.clientId !== '' && !client) throw new Error('client introuvable : ' + a.clientId);
      const docIds = (Array.isArray(a.docIds) ? a.docIds : []).map(Number).filter(Boolean);
      const rappels = Array.isArray(a.rappels) ? a.rappels.map(Number).filter((n) => n > 0) : (a.heure ? [1440, 60] : []);
      const rdv = {
        id: String(Date.now()),
        title: str(a.titre, 200),
        type: RDV_TYPES.includes(a.type) ? a.type : 'rdv',
        date: a.date,
        heure: a.heure || '',
        rappels,
        rappelsSent: [],
        fireISO: a.heure ? parisToISO(a.date, a.heure) : null,
        clientId: client ? client.id : null,
        clientNom: client ? client.nom : str(a.clientNom, 120),
        clientTel: client ? (client.tel || '') : str(a.clientTel, 40),
        vehIdx: null,
        docIds,
        docId: docIds[0] || null,
        lieu: str(a.lieu, 200),
        notes: str(a.notes, 2000),
        source: 'claude',
      };
      await db().collection('rdvs').doc(rdv.id).set(rdv);
      return { ok: true, rdv: resumeRdv(rdv) };
    },
  },
  {
    name: 'modifier_rdv',
    description: 'Modifie un rendez-vous existant (seuls les champs fournis changent). statut "confirme" pour valider une demande en ligne.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }, titre: { type: 'string' }, date: S.date, heure: S.heure,
        type: { type: 'string', enum: RDV_TYPES }, notes: { type: 'string' }, lieu: { type: 'string' },
        statut: { type: 'string', description: 'ex. confirme, a_confirmer' },
        docIds: { type: 'array', items: { type: 'number' }, description: 'remplace la liste des documents liés' },
      },
      required: ['id'],
    },
    async run(a) {
      const ref = db().collection('rdvs').doc(String(a.id));
      const snap = await ref.get();
      if (!snap.exists) throw new Error('RDV introuvable : ' + a.id);
      const rdv = snap.data();
      if (a.titre != null) rdv.title = str(a.titre, 200);
      if (a.date != null) { if (!isDate(a.date)) throw new Error('date invalide'); rdv.date = a.date; }
      if (a.heure != null) { if (a.heure && !isHeure(a.heure)) throw new Error('heure invalide'); rdv.heure = a.heure; }
      if (a.type != null && RDV_TYPES.includes(a.type)) rdv.type = a.type;
      if (a.notes != null) rdv.notes = str(a.notes, 2000);
      if (a.lieu != null) rdv.lieu = str(a.lieu, 200);
      if (a.statut != null) rdv.statut = str(a.statut, 40);
      if (Array.isArray(a.docIds)) { rdv.docIds = a.docIds.map(Number).filter(Boolean); rdv.docId = rdv.docIds[0] || null; }
      if (a.date != null || a.heure != null) {
        rdv.fireISO = rdv.heure ? parisToISO(rdv.date, rdv.heure) : null;
        rdv.rappelsSent = []; // nouvelle date : les rappels repartent
      }
      await ref.set(rdv);
      return { ok: true, rdv: resumeRdv(rdv) };
    },
  },
  {
    name: 'supprimer_rdv',
    description: 'Supprime définitivement un rendez-vous de l\'agenda. Demander confirmation à l\'utilisateur avant.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    annotations: { destructiveHint: true },
    async run(a) {
      const ref = db().collection('rdvs').doc(String(a.id));
      const snap = await ref.get();
      if (!snap.exists) throw new Error('RDV introuvable : ' + a.id);
      await ref.delete();
      return { ok: true, supprime: resumeRdv(snap.data()) };
    },
  },
  {
    name: 'rechercher_clients',
    description: 'Recherche dans le carnet clients (nom, téléphone, e-mail, immatriculation, véhicule). Sans recherche : les derniers clients.',
    inputSchema: { type: 'object', properties: { recherche: { type: 'string' }, limite: { type: 'number' } } },
    annotations: { readOnlyHint: true },
    async run(a) {
      const q = norm(a.recherche).replace(/\s+/g, ' ').trim();
      const qc = q.replace(/[\s-]/g, '');
      const clients = (await allClients()).filter((c) => {
        if (!q) return true;
        const vehs = (c.vehs || []).map((v) => [v.vm, v.vmo, v.vim].join(' ')).join(' ');
        const hay = norm([c.nom, c.email, c.ville, c.vm, c.vmo, c.vim, vehs].join(' '));
        return hay.includes(q) || norm(hay).replace(/[\s-]/g, '').includes(qc) || String(c.tel || '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§');
      }).sort((x, y) => (y.id || 0) - (x.id || 0));
      const lim = Math.min(Math.max(parseInt(a.limite) || 20, 1), 100);
      return { nombre: clients.length, clients: clients.slice(0, lim).map(resumeClient) };
    },
  },
  {
    name: 'obtenir_client',
    description: 'Fiche client complète avec ses devis/factures et ses RDV.',
    inputSchema: { type: 'object', properties: { id: { type: ['number', 'string'] } }, required: ['id'] },
    annotations: { readOnlyHint: true },
    async run(a) {
      const c = await findClient(a.id);
      if (!c) throw new Error('client introuvable : ' + a.id);
      const [docs, rdvs] = await Promise.all([allDocs(), allRdvs()]);
      const nom = norm(c.nom);
      return {
        client: Object.assign(resumeClient(c), { adresse: c.adr || '', siret: c.siret || '', tvaIntra: c.tvaIntra || '' }),
        documents: docs.filter((d) => norm(d.cn) === nom).sort((x, y) => (y.date || '').localeCompare(x.date || '')).map(resumeDoc),
        rdvs: rdvs.filter((r) => String(r.clientId) === String(c.id) || norm(r.clientNom) === nom).sort((x, y) => (y.date || '').localeCompare(x.date || '')).map(resumeRdv),
      };
    },
  },
  {
    name: 'creer_client',
    description: 'Ajoute un client au carnet. Vérifier d\'abord avec rechercher_clients qu\'il n\'existe pas déjà.',
    inputSchema: {
      type: 'object',
      properties: {
        nom: { type: 'string' }, tel: { type: 'string' }, email: { type: 'string' },
        adresse: { type: 'string' }, ville: { type: 'string' },
        type: { type: 'string', enum: ['particulier', 'pro'] }, siret: { type: 'string' }, tvaIntra: { type: 'string' },
        vehicule: vehiculeSchema,
      },
      required: ['nom'],
    },
    async run(a) {
      const nom = str(a.nom, 120);
      if (!nom) throw new Error('nom obligatoire');
      const v = a.vehicule || {};
      const veh = { id: 'cv' + Date.now(), vm: str(v.marque, 60), vmo: str(v.modele, 80), vmot: str(v.motorisation, 80), van: str(v.annee, 10), vim: str(v.immat, 20).toUpperCase(), notes: '', photos: [], videos: [] };
      const vehs = veh.vm || veh.vmo || veh.vim ? [veh] : [];
      const pro = a.type === 'pro';
      const cl = {
        id: Date.now(), nom, tel: str(a.tel, 40), email: str(a.email, 120), adr: str(a.adresse, 200), ville: str(a.ville, 120),
        type: pro ? 'pro' : 'particulier', siret: pro ? str(a.siret, 20) : '', tvaIntra: pro ? str(a.tvaIntra, 20) : '',
        vm: veh.vm, vmo: veh.vmo, vmot: veh.vmot, van: veh.van, vim: veh.vim, vehs, documents: [],
      };
      await db().collection('clients').doc(String(cl.id)).set(cl);
      return { ok: true, client: resumeClient(cl) };
    },
  },
  {
    name: 'lister_documents',
    description: 'Liste les devis, factures et ordres de réparation, du plus récent au plus ancien, avec filtres.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: DOC_TYPES }, statut: { type: 'string', enum: DOC_STATUTS },
        client: { type: 'string', description: 'Filtre sur le nom du client, l\'immat ou le numéro' },
        du: S.date, au: S.date,
        impayees: { type: 'boolean', description: 'Uniquement les factures avec un reste dû' },
        limite: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true },
    async run(a) {
      const q = norm(a.client);
      const docs = (await allDocs()).filter((d) =>
        (!a.type || d.type === a.type) && (!a.statut || d.statut === a.statut) &&
        (!isDate(a.du) || (d.date || '') >= a.du) && (!isDate(a.au) || (d.date || '') <= a.au) &&
        (!q || norm([d.cn, d.num, d.vim, d.vm, d.vmo].join(' ')).includes(q)) &&
        (!a.impayees || (d.type === 'facture' && d.statut !== 'annulé' && docResteDu(d) > 0))
      ).sort((x, y) => (y.date || '').localeCompare(x.date || '') || (y.id || 0) - (x.id || 0));
      const lim = Math.min(Math.max(parseInt(a.limite) || 30, 1), 200);
      return { nombre: docs.length, documents: docs.slice(0, lim).map(resumeDoc) };
    },
  },
  {
    name: 'obtenir_document',
    description: 'Détail complet d\'un devis/facture/ordre (lignes, totaux, paiements) par id ou numéro (ex. DEV-2026-012).',
    inputSchema: { type: 'object', properties: { id: { type: ['number', 'string'] }, num: { type: 'string' } } },
    annotations: { readOnlyHint: true },
    async run(a) {
      const d = await findDoc(a);
      if (!d) throw new Error('document introuvable');
      return Object.assign(resumeDoc(d), {
        echeance: d.ech, tvaRate: d.tvaRate, tva: round2(d.tva), remiseTotale: round2(d.remiseTotale),
        clientDetail: { nom: d.cn, adresse: d.ca, ville: d.cv, tel: d.ct, email: d.ce },
        vehiculeDetail: { marque: d.vm, modele: d.vmo, motorisation: d.vmot, annee: d.van, immat: d.vim, km: d.vkm },
        lignes: (d.lines || []).map((l) => ({ label: l.label, qte: l.qte, pu: l.pu, desc: l.desc || undefined, remise: l.remise || undefined, remiseType: l.remise ? l.remiseType : undefined, offert: l.offert || undefined, totalHT: round2(lineNetHT(l)) })),
        notes: d.notes || '', notesInternes: d.nint || '',
        paiements: docReglements(d), encaisse: round2(docEncaisse(d)),
      });
    },
  },
  {
    name: 'creer_document',
    description: 'Crée un devis (par défaut), une facture ou un ordre de réparation, visible aussitôt dans gestion.html (statut "créé", à relire puis envoyer depuis gestion). Utiliser lister_catalogue pour les prix officiels AREPROG. TVA 0 % par défaut (non assujetti).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: DOC_TYPES },
        clientId: { type: ['number', 'string'], description: 'id du carnet : reprend nom, adresse, contact et 1er véhicule' },
        client: { type: 'object', properties: { nom: { type: 'string' }, adresse: { type: 'string' }, ville: { type: 'string' }, tel: { type: 'string' }, email: { type: 'string' } } },
        vehicule: vehiculeSchema,
        lignes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' }, qte: { type: 'number' }, pu: { type: 'number', description: 'Prix unitaire HT en €' },
              desc: { type: 'string' }, ref: { type: 'string' },
              remise: { type: 'number' }, remiseType: { type: 'string', enum: ['pct', 'eur'] }, offert: { type: 'boolean' },
            },
            required: ['label', 'pu'],
          },
        },
        tvaRate: { type: 'number', enum: [0, 20] },
        date: S.date, echeance: S.date,
        notes: { type: 'string', description: 'Notes visibles par le client' },
        notesInternes: { type: 'string' },
        rdvId: { type: 'string', description: 'RDV auquel lier ce document' },
      },
      required: ['lignes'],
    },
    async run(a) {
      const type = DOC_TYPES.includes(a.type) ? a.type : 'devis';
      const lines = cleanLines(a.lignes);
      if (!lines.length) throw new Error('au moins une ligne avec un libellé est requise');
      const cl = await findClient(a.clientId);
      if (a.clientId != null && a.clientId !== '' && !cl) throw new Error('client introuvable : ' + a.clientId);
      const ci = a.client || {};
      const cn = cl ? cl.nom : str(ci.nom, 120);
      if (!cn) throw new Error('nom du client obligatoire (clientId ou client.nom)');
      const cveh = cl ? ((cl.vehs && cl.vehs[0]) || cl) : {};
      const v = a.vehicule || {};
      const tvaRate = a.tvaRate === 20 ? 20 : 0;
      const docs = await allDocs();
      const doc = {
        id: Date.now(),
        type,
        num: genNum(DOC_PREFIX[type], docs),
        date: isDate(a.date) ? a.date : todayParis(),
        ech: isDate(a.echeance) ? a.echeance : todayParis(30),
        statut: 'créé',
        cn,
        ca: cl ? (cl.adr || '') : str(ci.adresse, 200),
        cv: cl ? (cl.ville || '') : str(ci.ville, 120),
        ct: cl ? (cl.tel || '') : str(ci.tel, 40),
        ce: cl ? (cl.email || '') : str(ci.email, 120),
        csiret: cl ? (cl.siret || '') : '',
        ctva: cl ? (cl.tvaIntra || '') : '',
        vm: str(v.marque, 60) || cveh.vm || '',
        vmo: str(v.modele, 80) || cveh.vmo || '',
        vmot: str(v.motorisation, 80) || cveh.vmot || '',
        van: str(v.annee, 10) || cveh.van || '',
        vim: (str(v.immat, 20) || cveh.vim || '').toUpperCase(),
        vkm: str(v.km, 20),
        lines,
        gains: null,
        customGains: [],
        declare: true,
        tvaRate,
        ...computeTotals(lines, null, tvaRate),
        notes: str(a.notes, 3000),
        nint: str(a.notesInternes, 3000),
        acompte: null,
        paiements: [],
        motif: '',
        delai: '',
        sigclient: false,
        accordUsage: null,
        demandeRef: null,
        source: 'claude',
      };
      await db().collection('docs').doc(String(doc.id)).set(doc);
      let rdvLie = null;
      if (a.rdvId) {
        const ref = db().collection('rdvs').doc(String(a.rdvId));
        const snap = await ref.get();
        if (snap.exists) {
          const rdv = snap.data();
          const ids = (rdv.docIds || (rdv.docId ? [rdv.docId] : [])).concat(doc.id);
          await ref.update({ docIds: ids, docId: ids[0] });
          rdvLie = rdv.id;
        }
      }
      return { ok: true, document: resumeDoc(doc), rdvLie, aRelire: 'Ouvrir dans gestion.html (Liste) pour vérifier, imprimer ou envoyer au client.' };
    },
  },
  {
    name: 'modifier_document',
    description: 'Modifie un devis / ordre de réparation (ou une facture encore jamais envoyée) : lignes, client, véhicule, TVA, remise globale, dates, notes. '
      + 'Seuls les champs fournis changent ; "lignes" remplace toutes les lignes. Montrer d\'abord les changements à l\'utilisateur et obtenir son accord. '
      + 'Annule une éventuelle proposition d\'envoi en cours (à refaire avec preparer_envoi_document).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: ['number', 'string'] }, num: { type: 'string' },
        client: { type: 'object', properties: { nom: { type: 'string' }, adresse: { type: 'string' }, ville: { type: 'string' }, tel: { type: 'string' }, email: { type: 'string' } } },
        vehicule: vehiculeSchema,
        lignes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' }, qte: { type: 'number' }, pu: { type: 'number', description: 'Prix unitaire HT en €' },
              desc: { type: 'string' }, ref: { type: 'string' },
              remise: { type: 'number' }, remiseType: { type: 'string', enum: ['pct', 'eur'] }, offert: { type: 'boolean' },
            },
            required: ['label', 'pu'],
          },
        },
        tvaRate: { type: 'number', enum: [0, 20] },
        remiseGlobale: { type: 'object', properties: { type: { type: 'string', enum: ['none', 'pct', 'eur'] }, val: { type: 'number' } } },
        date: S.date, echeance: S.date,
        notes: { type: 'string' }, notesInternes: { type: 'string' },
      },
    },
    async run(a) {
      const d = await findDoc(a);
      if (!d) throw new Error('document introuvable');
      if (d.statut === 'annulé') throw new Error('document annulé : non modifiable');
      if (d.type === 'facture' && (d.statut !== 'créé' || d.lastEmailAt || (d.paiements || []).length)) {
        throw new Error('facture déjà envoyée ou réglée : non modifiable ici (faire un avoir / corriger dans gestion.html)');
      }
      const avant = resumeDoc(d);
      if (a.lignes !== undefined) {
        const lines = cleanLines(a.lignes);
        if (!lines.length) throw new Error('au moins une ligne avec un libellé est requise');
        d.lines = lines;
      }
      const c = a.client || {};
      if (c.nom !== undefined) { if (!str(c.nom)) throw new Error('nom du client vide'); d.cn = str(c.nom, 120); }
      if (c.adresse !== undefined) d.ca = str(c.adresse, 200);
      if (c.ville !== undefined) d.cv = str(c.ville, 120);
      if (c.tel !== undefined) d.ct = str(c.tel, 40);
      if (c.email !== undefined) d.ce = str(c.email, 120);
      const v = a.vehicule || {};
      if (v.marque !== undefined) d.vm = str(v.marque, 60);
      if (v.modele !== undefined) d.vmo = str(v.modele, 80);
      if (v.motorisation !== undefined) d.vmot = str(v.motorisation, 80);
      if (v.annee !== undefined) d.van = str(v.annee, 10);
      if (v.immat !== undefined) d.vim = str(v.immat, 20).toUpperCase();
      if (v.km !== undefined) d.vkm = str(v.km, 20);
      if (a.tvaRate !== undefined) d.tvaRate = a.tvaRate === 20 ? 20 : 0;
      if (a.date !== undefined) { if (!isDate(a.date)) throw new Error('date invalide'); d.date = a.date; }
      if (a.echeance !== undefined) { if (!isDate(a.echeance)) throw new Error('échéance invalide'); d.ech = a.echeance; }
      if (a.notes !== undefined) d.notes = str(a.notes, 3000);
      if (a.notesInternes !== undefined) d.nint = str(a.notesInternes, 3000);
      const rg = a.remiseGlobale !== undefined
        ? { type: ['pct', 'eur'].includes(a.remiseGlobale && a.remiseGlobale.type) ? a.remiseGlobale.type : 'none', val: a.remiseGlobale && a.remiseGlobale.val }
        : d.remiseGlobale;
      Object.assign(d, computeTotals(d.lines || [], rg, d.tvaRate));
      d.envoiPropose = null;
      d.modifieParClaudeAt = new Date().toISOString();
      await db().collection('docs').doc(String(d.id)).set(d);
      return { ok: true, avant, apres: resumeDoc(d) };
    },
  },
  {
    name: 'preparer_envoi_document',
    description: 'ÉTAPE 1/2 de l\'envoi d\'un devis/facture/ordre par e-mail. N\'envoie RIEN. Renvoie le récapitulatif complet '
      + '(destinataire, objet, message, pièce jointe, lignes et montants) et un code de confirmation. '
      + 'Tu DOIS présenter ce récapitulatif en entier à l\'utilisateur dans la conversation et lui demander explicitement s\'il valide l\'envoi. '
      + 'Sans objet/message fournis, le texte standard de la gestion est utilisé.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: ['number', 'string'] }, num: { type: 'string' },
        destinataire: { type: 'string', description: 'E-mail du client (défaut : celui du document)' },
        objet: { type: 'string' },
        message: { type: 'string', description: 'Corps du mail en texte brut (le PDF est joint automatiquement)' },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
    async run(a) {
      const d = await findDoc(a);
      if (!d) throw new Error('document introuvable');
      if (d.statut === 'annulé') throw new Error('document annulé');
      const to = str(a.destinataire, 120) || d.ce || '';
      if (!emailValide(to)) throw new Error('e-mail du destinataire manquant ou invalide (le préciser dans "destinataire")');
      const { tpl, synchro } = await loadTemplate();
      const envoi = { to, sujet: str(a.objet, 200) || defaultSubject(d, tpl), message: str(a.message, 5000) || defaultMessage(d, tpl) };
      const h = envoiHash(d, envoi);
      await db().collection('docs').doc(String(d.id)).update({ envoiPropose: Object.assign({}, envoi, { par: 'claude', at: new Date().toISOString(), h }) });
      const dejaEnvoye = d.lastEmailAt ? { le: d.lastEmailAt, a: d.lastEmailTo || '' } : null;
      return {
        envoye: false,
        aFaire: 'Montrer ce récapitulatif à l\'utilisateur et lui demander « Je l\'envoie ? ». '
          + 'Appeler envoyer_document avec le code UNIQUEMENT après un oui explicite de sa part pour CET envoi. '
          + 'Il peut aussi l\'envoyer lui-même depuis lienGestion.',
        confirmation: sign({ typ: 'envoi', docId: d.id, h }, ENVOI_TTL),
        recapitulatif: {
          document: typeLabel(d) + ' ' + d.num + ' du ' + dateFr(d.date) + (d.type === 'devis' && d.ech ? ' (valable jusqu\'au ' + dateFr(d.ech) + ')' : ''),
          client: d.cn,
          vehicule: [d.vm, d.vmo, d.vmot].filter(Boolean).join(' ') + (d.vim ? ' — ' + d.vim : ''),
          lignes: (d.lines || []).map((l) => (l.qte || 1) + ' × ' + l.label + ' — ' + (l.offert ? 'offert' : eur(lineNetHT(l)) + ' HT')),
          totalHT: eur(d.ht), tva: (d.tvaRate || 0) + ' % (' + eur(d.tva) + ')', totalTTC: eur(d.ttc),
          destinataire: to,
          objet: envoi.sujet,
          message: envoi.message,
          pieceJointe: pdfFilename(d) + (d.type === 'ordre' ? '' : ' (avec CGV en annexe)'),
          dejaEnvoye,
          modeleDocument: synchro ? 'modèle de gestion' : 'modèle par défaut (ouvrir gestion.html une fois pour synchroniser le vôtre)',
        },
        lienGestion: BASE + '/gestion?envoi=' + d.id,
      };
    },
  },
  {
    name: 'envoyer_document',
    description: 'ÉTAPE 2/2 : envoie réellement au client l\'e-mail préparé par preparer_envoi_document, avec le PDF en pièce jointe. '
      + 'N\'appeler QUE si l\'utilisateur vient de répondre oui, explicitement, au récapitulatif de CET envoi dans la conversation. '
      + 'Jamais de sa propre initiative, jamais pour un autre document, jamais en lot. Refusé si le document ou l\'e-mail a changé depuis le récapitulatif.',
    inputSchema: {
      type: 'object',
      properties: {
        confirmation: { type: 'string', description: 'Code renvoyé par preparer_envoi_document' },
        accordUtilisateur: { type: 'string', description: 'Réponse exacte de l\'utilisateur qui valide l\'envoi (ex. « oui, envoie »)' },
      },
      required: ['confirmation', 'accordUtilisateur'],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    async run(a, user) {
      if (!str(a.accordUtilisateur)) throw new Error('accord explicite de l\'utilisateur requis');
      const c = verify(a.confirmation, 'envoi');
      if (!c) throw new Error('code de confirmation invalide ou expiré : refaire preparer_envoi_document et redemander l\'accord');
      const d = await findDoc({ id: c.docId });
      if (!d) throw new Error('document introuvable');
      const envoi = d.envoiPropose;
      if (!envoi || envoi.h !== c.h || envoiHash(d, envoi) !== c.h) {
        throw new Error('le document ou l\'e-mail a changé depuis le récapitulatif (ou il a déjà été envoyé) : refaire preparer_envoi_document et redemander l\'accord');
      }
      const { tpl } = await loadTemplate();
      const pdfB64 = await buildDocPdf(d, tpl);
      const html = docEmailHtml(d, tpl, envoi.message);
      const sent = await resendSend({
        from: process.env.RESEND_FROM || RESEND_FROM,
        to: [envoi.to],
        reply_to: REPLY_TO,
        subject: envoi.sujet,
        html,
        attachments: [{ filename: pdfFilename(d), content: pdfB64 }],
      });
      const now = new Date().toISOString();
      const upd = { lastEmailAt: now, lastEmailTo: envoi.to, envoiPropose: null, envoyeParClaude: { at: now, accord: str(a.accordUtilisateur, 300), par: user.email } };
      if (d.statut === 'créé') upd.statut = 'envoyé';
      if (d.type === 'facture') { upd.avisEmailAt = now; upd.avisEmailTo = envoi.to; }
      await db().collection('docs').doc(String(d.id)).update(upd);
      if (sent.id) {
        await db().collection('emailsEnvoyes').doc(String(sent.id)).set({
          id: String(sent.id), to: [envoi.to], from: process.env.RESEND_FROM || RESEND_FROM, subject: envoi.sujet, html,
          createdAt: now, lastEvent: 'sent', attachments: [pdfFilename(d)], source: 'claude', sentBy: user.email,
        }, { merge: true }).catch((e) => console.warn('mcp: archivage —', e.message));
      }
      return { envoye: true, a: envoi.to, objet: envoi.sujet, document: resumeDoc(Object.assign(d, upd)), resendId: sent.id || null };
    },
  },
  {
    name: 'modifier_statut_document',
    description: 'Change le statut d\'un devis/facture (créé, envoyé, accepté, payé, annulé).',
    inputSchema: { type: 'object', properties: { id: { type: ['number', 'string'] }, num: { type: 'string' }, statut: { type: 'string', enum: DOC_STATUTS } }, required: ['statut'] },
    async run(a) {
      if (!DOC_STATUTS.includes(a.statut)) throw new Error('statut invalide');
      const d = await findDoc(a);
      if (!d) throw new Error('document introuvable');
      await db().collection('docs').doc(String(d.id)).update({ statut: a.statut });
      d.statut = a.statut;
      return { ok: true, document: resumeDoc(d) };
    },
  },
  {
    name: 'enregistrer_paiement',
    description: 'Enregistre un paiement reçu sur une facture (passe en "payé" automatiquement une fois couverte).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: ['number', 'string'] }, num: { type: 'string' },
        montant: { type: 'number', description: 'Montant TTC reçu en €' },
        date: S.date,
        mode: { type: 'string', description: 'ex. CB, Virement, Espèces, Chèque' },
        ref: { type: 'string', description: 'Référence bancaire / transaction' },
        note: { type: 'string' },
      },
      required: ['montant'],
    },
    async run(a) {
      const montant = round2(a.montant);
      if (!(montant > 0)) throw new Error('montant invalide');
      const d = await findDoc(a);
      if (!d) throw new Error('facture introuvable');
      if (d.type !== 'facture') throw new Error('les paiements s\'enregistrent sur une facture');
      const p = { id: Date.now(), date: isDate(a.date) ? a.date : todayParis(), montant, mode: str(a.mode, 40), ref: str(a.ref, 80), note: str(a.note, 300), pointe: false };
      d.paiements = (d.paiements || []).concat(p);
      const upd = { paiements: d.paiements };
      if (docResteDu(d) <= 0 && d.statut !== 'annulé') upd.statut = d.statut = 'payé';
      await db().collection('docs').doc(String(d.id)).update(upd);
      return { ok: true, paiement: p, facture: resumeDoc(d) };
    },
  },
  {
    name: 'lister_catalogue',
    description: 'Catalogue officiel des prestations AREPROG avec leurs prix (à reprendre exactement dans les devis).',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    async run() {
      const snap = await db().collection('config').doc('catalogue').get();
      const cat = snap.exists && Array.isArray(snap.data().cat) ? snap.data().cat : [];
      return cat.map((g) => ({ groupe: g.g, prestations: (g.items || []).map((it) => ({ label: it.l, prix: it.p })) }));
    },
  },
  {
    name: 'lister_demandes',
    description: 'Demandes reçues via le formulaire de contact / simulateur du site (leads), les plus récentes d\'abord.',
    inputSchema: { type: 'object', properties: { statut: { type: 'string', description: 'ex. nouveau' }, limite: { type: 'number' } } },
    annotations: { readOnlyHint: true },
    async run(a) {
      const lim = Math.min(Math.max(parseInt(a.limite) || 20, 1), 100);
      const snap = await db().collection('leads').orderBy('createdAt', 'desc').limit(a.statut ? 200 : lim).get();
      const rows = snap.docs.map((x) => {
        const d = x.data(), v = d.vehicle || {};
        const quand = d.createdAt && typeof d.createdAt.toDate === 'function' ? d.createdAt.toDate().toISOString() : (d.createdAt || null);
        return {
          id: x.id, quand, source: d.source || 'contact', statut: d.status || 'nouveau',
          nom: d.name || '', tel: d.phone || '', email: d.email || '', ville: d.city || '',
          vehicule: [v.brand, v.model, v.engine, v.year].filter(Boolean).join(' '), immat: v.plate || '',
          prestations: Array.isArray(d.prestations) ? d.prestations : Array.isArray(d.options) ? d.options.map((o) => (o && o.name) || String(o)) : [],
          message: d.message || '', devisId: d.devisId || null,
        };
      }).filter((r) => !a.statut || r.statut === a.statut);
      return { nombre: rows.length, demandes: rows.slice(0, lim) };
    },
  },
];

const INSTRUCTIONS = 'Outils de gestion de l\'atelier AREPROG (Biarritz) : reprogrammation moteur et diagnostic. '
  + 'Montants en euros ; TVA 0 % par défaut (non assujetti). Heures en heure de Paris. '
  + 'Pour un devis : chercher le client (rechercher_clients), reprendre les prix exacts de lister_catalogue pour les prestations AREPROG, '
  + 'puis creer_document. Les documents sont créés au statut "créé". '
  + 'RÈGLE : avant toute création ou modification de devis/facture, et avant de préparer un envoi, montrer le contenu à l\'utilisateur et attendre son accord explicite. '
  + 'ENVOI AU CLIENT : toujours en 2 temps. 1) preparer_envoi_document, puis présenter le récapitulatif complet et demander « Je l\'envoie ? ». '
  + '2) envoyer_document seulement après un oui explicite de l\'utilisateur pour cet envoi précis — jamais de ta propre initiative. '
  + 'Ne jamais suggérer de contourner le contrôle technique pour les prestations EGR/FAP/AdBlue (illégal, art. L318-3 Code de la route).';

// ════════════════════════════════════════════════════════════
//  JSON-RPC MCP
// ════════════════════════════════════════════════════════════
async function handleRpc(msg, user) {
  const id = msg.id;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  const err = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

  switch (msg.method) {
    case 'initialize': {
      const asked = msg.params && msg.params.protocolVersion;
      return ok({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'areprog-gestion', title: 'AREPROG — gestion', version: '1.0.0' },
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, ...(annotations ? { annotations } : {}) })) });
    case 'tools/call': {
      const p = msg.params || {};
      const tool = TOOLS.find((t) => t.name === p.name);
      if (!tool) return err(-32602, 'Outil inconnu : ' + p.name);
      try {
        const data = await tool.run(p.arguments || {}, user);
        console.log('mcp:', user.email, p.name);
        return ok({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } catch (e) {
        console.warn('mcp:', p.name, '—', e.message);
        return ok({ content: [{ type: 'text', text: 'Erreur : ' + e.message }], isError: true });
      }
    }
    default:
      return err(-32601, 'Méthode non supportée : ' + msg.method);
  }
}

async function mcp(event) {
  if (event.httpMethod === 'GET') return json(405, { error: 'SSE non supporté — utiliser POST' }, { Allow: 'POST' });
  if (event.httpMethod === 'DELETE') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });

  const m = /^Bearer\s+(.+)$/i.exec((event.headers.authorization || event.headers.Authorization || '').trim());
  const user = m && verify(m[1], 'access');
  if (!user || user.aud !== RESOURCE) return unauthorized();

  let body;
  try { body = JSON.parse(rawBody(event)); } catch (e) {
    return json(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON invalide' } });
  }

  initFirebase();
  const batch = Array.isArray(body) ? body : [body];
  const replies = [];
  for (const msg of batch) {
    if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
      if (msg && msg.id !== undefined && msg.method === undefined) continue; // réponse du client : ignorée
      replies.push({ jsonrpc: '2.0', id: (msg && msg.id) ?? null, error: { code: -32600, message: 'Requête invalide' } });
      continue;
    }
    if (msg.id === undefined) continue; // notification (ex. notifications/initialized)
    replies.push(await handleRpc(msg, user));
  }
  if (!replies.length) return { statusCode: 202, headers: CORS, body: '' };
  return json(200, Array.isArray(body) ? replies : replies[0]);
}

// ════════════════════════════════════════════════════════════
//  Routeur
// ════════════════════════════════════════════════════════════
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  // Selon le cas, Netlify transmet le chemin d'origine (/mcp/token) ou la
  // cible réécrite (/.netlify/functions/mcp/token) : on route sur la fin.
  const path = requestPath(event).replace(/\/+$/, '');
  try {
    if (/oauth-protected-resource|\/mcp\/prm$/.test(path)) return protectedResourceMetadata();
    if (/oauth-authorization-server|\/mcp\/asm$/.test(path)) return authServerMetadata();
    if (/\/mcp\/register$/.test(path) && event.httpMethod === 'POST') return register(event);
    if (/\/mcp\/authorize$/.test(path)) return await authorize(event);
    if (/\/mcp\/token$/.test(path) && event.httpMethod === 'POST') return await token(event);
    return await mcp(event);
  } catch (e) {
    console.error('mcp:', e);
    return json(500, { error: 'server_error', error_description: e.message });
  }
};
