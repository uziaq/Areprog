// Netlify Function — envoi d'email via Resend (remplace EmailJS)
// POST /.netlify/functions/send-email
//
// Réservée aux utilisateurs authentifiés (gestion.html) : rappels RDV,
// alertes factures impayées, envoi de devis/factures aux clients. La clé
// Resend ne doit jamais être exposée côté navigateur, d'où ce proxy.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase   (requis)
//   RESEND_API_KEY           : clé API Resend                     (requis)
//   RESEND_FROM              : adresse d'expédition vérifiée      (optionnel)

const admin = require('firebase-admin');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const DEFAULT_FROM = 'AREPROG <devis@areprog.fr>';
const MAX_HTML_LEN = 200 * 1024;

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
    console.warn('send-email: jeton refusé —', e.code || e.message);
    return null;
  }
}

function emailValide(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);
}

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
    if (!caller) {
      return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Authentification requise' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const to = body.to;
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
    const html = typeof body.html === 'string' ? body.html : '';
    const replyTo = body.replyTo;

    if (!emailValide(to)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Destinataire invalide' }) };
    }
    if (!subject || !html) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Sujet et contenu requis' }) };
    }
    if (html.length > MAX_HTML_LEN) {
      return { statusCode: 413, headers: cors, body: JSON.stringify({ error: 'Contenu trop volumineux' }) };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'RESEND_API_KEY non configurée' }) };
    }

    const payload = {
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [to],
      subject: subject,
      html: html,
    };
    if (emailValide(replyTo)) payload.reply_to = replyTo;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(function () { return ''; });
      console.error('send-email: Resend', res.status, txt.slice(0, 300));
      return { statusCode: 502, headers: cors, body: JSON.stringify({ error: "L'envoi a échoué." }) };
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('send-email error:', e);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "L'envoi a échoué." }) };
  }
};
