// Netlify Function — facturation électronique via SUPER PDP (Plateforme Agréée)
// POST /.netlify/functions/facture-electronique
//
// Réservée aux utilisateurs authentifiés (gestion.html, jeton Firebase).
// Les identifiants SUPER PDP restent côté serveur. Le mode bac à sable ou
// production est déterminé par l'application SUPER PDP dont viennent les
// identifiants : rien à changer ici pour passer en production.
//
// Actions (corps JSON { action, ... }) :
//   valider   { doc }              → rapport du validateur officiel (sans identifiants)
//   envoyer   { doc, pdf }         → Factur-X (PDF du devis/facture + XML) déposée sur SUPER PDP
//   encaisser { pdpId, date, montant, taux } → statut « Encaissée » (fr:212), requis
//                                    pour la TVA sur les encaissements (prestations de services)
//   statuts   { pdpIds: [...] }    → derniers événements de chaque facture
//   compte    {}                   → entreprise et environnement (sandbox/production) liés aux identifiants
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase     (requis)
//   SUPERPDP_CLIENT_ID       : client_id de l'application SUPER PDP (requis sauf « valider »)
//   SUPERPDP_CLIENT_SECRET   : client_secret de l'application       (requis sauf « valider »)

const admin = require('firebase-admin');
const { toEnInvoice, verifier } = require('./en16931');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const API = 'https://api.superpdp.tech';
// Même plafond que send-email : le corps JSON doit rester sous la limite
// d'~6 Mo des fonctions Netlify.
const MAX_PDF_B64_LEN = 4 * 1024 * 1024;
const B64_RE = /^[A-Za-z0-9+/]+=*$/;
const MAX_STATUTS = 50;

let ready = false;
function initAdmin() {
  if (ready) return;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  ready = true;
}

async function requireAuth(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  try {
    return await admin.auth().verifyIdToken(match[1]);
  } catch (e) {
    console.warn('facture-electronique: jeton refusé —', e.code || e.message);
    return null;
  }
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Jeton OAuth2 (client credentials), valable ~30 min : gardé en mémoire tant
// que l'instance de la fonction reste chaude.
let token = null;
async function getToken() {
  if (token && token.exp > Date.now() + 60 * 1000) return token.value;
  const id = process.env.SUPERPDP_CLIENT_ID, secret = process.env.SUPERPDP_CLIENT_SECRET;
  if (!id || !secret) throw new HttpError(500, 'Identifiants SUPER PDP non configurés (SUPERPDP_CLIENT_ID / SUPERPDP_CLIENT_SECRET).');
  const resp = await fetch(API + '/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }).toString(),
  });
  if (!resp.ok) {
    console.error('facture-electronique: token SUPER PDP refusé', resp.status, await resp.text());
    throw new HttpError(502, 'Authentification SUPER PDP refusée (vérifier les identifiants).');
  }
  const body = await resp.json();
  token = { value: body.access_token, exp: Date.now() + (body.expires_in || 1800) * 1000 };
  return token.value;
}

// Appel à l'API SUPER PDP ; renvoie la réponse brute (le corps peut être du
// JSON, du XML ou un PDF selon la route).
async function pdp(path, opts, auth) {
  const headers = Object.assign({}, opts.headers || {});
  if (auth !== false) headers.Authorization = 'Bearer ' + await getToken();
  const resp = await fetch(API + path, Object.assign({}, opts, { headers }));
  if (!resp.ok) {
    const text = await resp.text();
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch (e) { /* corps non JSON */ }
    console.error('facture-electronique:', opts.method || 'GET', path, resp.status, text.slice(0, 2000));
    throw new HttpError(resp.status >= 500 ? 502 : 422, 'SUPER PDP : ' + simplifierErreur(msg));
  }
  return resp;
}

// Les erreurs de validation listent des XPath illisibles : on ne garde que
// les messages, une règle par ligne.
function simplifierErreur(msg) {
  return String(msg || '').split('\n')
    .map(function (l) { return l.replace(/\s+at\s+\/\*:.*$/, '').trim(); })
    .filter(Boolean).slice(0, 10).join('\n').slice(0, 2000);
}

function lireDoc(body) {
  const doc = body.doc;
  if (!doc || typeof doc !== 'object') throw new HttpError(400, 'Facture manquante.');
  const errs = verifier(doc);
  if (errs.length) throw new HttpError(400, errs.join('\n'));
  return doc;
}

async function valider(body) {
  const doc = lireDoc(body);
  const { invoice } = toEnInvoice(doc);
  // La conversion JSON → CII applique déjà les règles EN16931 et françaises.
  const conv = await pdp('/v1.beta/invoices/convert?from=en16931&to=cii', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoice),
  }, false);
  const fd = new FormData();
  fd.append('file', new Blob([await conv.text()], { type: 'application/xml' }), 'facture.xml');
  const report = (await (await pdp('/v1.beta/validation_reports', { method: 'POST', body: fd }, false)).json()).data[0];
  const remarques = [];
  (report.subreports || []).forEach(function (s) {
    (s.failures || []).concat(s.messages || []).forEach(function (m) { remarques.push(m.message); });
  });
  return { valide: !!report.is_valid, remarques: remarques.slice(0, 20) };
}

async function envoyer(body) {
  const doc = lireDoc(body);
  const pdf = typeof body.pdf === 'string' ? body.pdf : '';
  if (!pdf || pdf.length > MAX_PDF_B64_LEN || !B64_RE.test(pdf)) throw new HttpError(400, 'PDF de la facture manquant ou trop volumineux.');
  const { invoice, b2b, totals } = toEnInvoice(doc);

  // 1. Factur-X : PDF lisible généré par gestion.html + données structurées.
  const fd = new FormData();
  fd.append('invoice', new Blob([JSON.stringify(invoice)], { type: 'application/json' }), 'facture.json');
  fd.append('pdf', new Blob([Buffer.from(pdf, 'base64')], { type: 'application/pdf' }), 'facture.pdf');
  const facturx = Buffer.from(await (await pdp('/v1.beta/invoices/convert?from=en16931&to=factur-x', { method: 'POST', body: fd }, false)).arrayBuffer());

  // 2. Dépôt sur SUPER PDP : acheminement au client (B2B) et/ou e-reporting
  // à l'administration fiscale (B2B et B2C).
  const qs = new URLSearchParams({ external_id: String(doc.num).slice(0, 36), processing_rule: b2b ? 'B2B' : 'B2C' });
  const created = await (await pdp('/v1.beta/invoices?' + qs, {
    method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: facturx,
  })).json();
  const company = await compte();
  return { id: created.id, env: company.env, b2b: b2b, ttc: totals.ttc, taux: totals.rate };
}

async function encaisser(body) {
  const id = parseInt(body.pdpId, 10);
  const montant = parseFloat(body.montant);
  const taux = parseFloat(body.taux);
  const date = String(body.date || '');
  if (!id || !(montant > 0) || !isFinite(taux) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, 'Paramètres d\'encaissement invalides.');
  const ev = await (await pdp('/v1.beta/invoice_events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoice_id: id,
      status_code: 'fr:212',
      details: [{ reported_data: [{ amount: montant.toFixed(2), currency_code: 'EUR', type_code: 'MEN', value_percent: taux.toFixed(2), date: date }] }],
    }),
  })).json();
  return { eventId: ev.id };
}

async function statuts(body) {
  const ids = (Array.isArray(body.pdpIds) ? body.pdpIds : [])
    .map(function (v) { return parseInt(v, 10); }).filter(Boolean).slice(0, MAX_STATUTS);
  const out = {};
  for (const id of ids) {
    const list = await (await pdp('/v1.beta/invoice_events?invoice_id=' + id + '&limit=1000')).json();
    out[id] = (list.data || []).map(function (e) {
      return { code: e.status_code, texte: e.status_text, date: e.created_at };
    });
  }
  return { statuts: out };
}

async function compte() {
  const c = await (await pdp('/v1.beta/companies/me', {})).json();
  return { nom: c.formal_name, numero: c.number, env: c.env, regimeTva: c.vat_regime };
}

const ACTIONS = { valider, envoyer, encaisser, statuts, compte };

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'Origine non autorisée' }) };
  }

  try {
    initAdmin();
    const caller = await requireAuth(event);
    if (!caller) return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Authentification requise' }) };

    let body;
    try { body = JSON.parse(event.body || '{}'); } catch (e) { throw new HttpError(400, 'JSON invalide'); }
    const fn = ACTIONS[body.action];
    if (!fn) throw new HttpError(400, 'Action inconnue');
    const result = await fn(body);
    return { statusCode: 200, headers: cors, body: JSON.stringify(result) };
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status === 500) console.error('facture-electronique:', e);
    return { statusCode: status, headers: cors, body: JSON.stringify({ error: e.message || 'Erreur interne' }) };
  }
};
