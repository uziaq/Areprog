// Netlify Function — Envoi SMS via Twilio
// POST /.netlify/functions/sms-send
// Body JSON : { to, message, type, clientNom, rdvId }
//
// Env vars requises (Netlify dashboard) :
//   TWILIO_ACCOUNT_SID   : Account SID Twilio (AC...)
//   TWILIO_AUTH_TOKEN    : Auth Token Twilio
//   TWILIO_FROM_NUMBER   : Numéro Twilio au format E.164 (+33...)
//   FIREBASE_SERVICE_ACCOUNT : JSON complet du service account Firebase

const admin = require('firebase-admin');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

function initFirebase() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT non configurée');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

function formatPhone(tel) {
  if (!tel) return null;
  let t = tel.replace(/[\s.\-()]/g, '');
  // Déjà E.164
  if (t.startsWith('+')) return t;
  // 0033... → +33...
  if (t.startsWith('0033')) return '+33' + t.slice(4);
  // 06... / 07... → +336... / +337...
  if (t.startsWith('0')) return '+33' + t.slice(1);
  return '+' + t;
}

async function sendTwilioSms(to, message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error('Variables Twilio manquantes');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body = new URLSearchParams({ From: from, To: to, Body: message });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(sid + ':' + token).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error('Twilio ' + res.status + ' : ' + (json.message || JSON.stringify(json)));
  return json.sid;
}

async function logSms(db, entry) {
  try {
    await db.collection('sms_log').add(entry);
  } catch (e) {
    console.warn('sms_log write failed:', e.message);
  }
}

async function getSmsConfig(db) {
  try {
    const doc = await db.collection('config').doc('sms').get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    return {};
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: 'JSON invalide' };
  }

  const { to, message, type = 'manuel', clientNom = '', rdvId = null } = payload;
  if (!to || !message) {
    return { statusCode: 400, headers: corsHeaders, body: 'Champs "to" et "message" requis' };
  }

  const phone = formatPhone(to);
  if (!phone) {
    return { statusCode: 400, headers: corsHeaders, body: 'Numéro de téléphone invalide' };
  }

  initFirebase();
  const db = admin.firestore();

  // Vérifier la config SMS (activation par type)
  const cfg = await getSmsConfig(db);
  const typeEnabled = {
    confirmation: cfg.confirmation !== false,
    rappel:       cfg.rappel !== false,
    avis_google:  cfg.avis_google !== false,
    manuel:       true,
    test:         true,
  };
  if (!typeEnabled[type]) {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ skipped: true, reason: 'type disabled' }) };
  }

  const logEntry = {
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    type,
    clientNom,
    to: phone,
    rdvId,
    message,
    statut: 'envoyé',
    twilio_sid: null,
    erreur: null,
  };

  try {
    const sid = await sendTwilioSms(phone, message);
    logEntry.twilio_sid = sid;
    await logSms(db, logEntry);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true, sid }),
    };
  } catch (e) {
    logEntry.statut = 'erreur';
    logEntry.erreur = e.message;
    await logSms(db, logEntry);
    console.error('sms-send error:', e.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: e.message }),
    };
  }
};
