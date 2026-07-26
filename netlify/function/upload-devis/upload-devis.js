// Netlify Function — upload PDF devis vers Firebase Storage
// Env vars requises : FIREBASE_SERVICE_ACCOUNT (JSON service account)
//
// Réservé aux utilisateurs authentifiés : le PDF déposé devient lisible
// publiquement (le client ouvre le lien sans compte), donc l'écriture doit
// rester strictement contrôlée.

const admin = require('firebase-admin');

const BUCKET = 'areprog-devis.firebasestorage.app';
const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,80}$/;
const SAFE_FILENAME = /^[A-Za-z0-9 _.-]{1,200}\.pdf$/;

let ready = false;

function initAdmin() {
  if (ready) return;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(sa), storageBucket: BUCKET });
  ready = true;
}

async function requireAuth(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  try {
    return await admin.auth().verifyIdToken(match[1]);
  } catch (e) {
    console.warn('upload-devis: jeton refusé —', e.code || e.message);
    return null;
  }
}

exports.handler = async function(event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
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
    const pdfBase64 = body.pdfBase64;
    const docId     = body.docId;
    const filename  = body.filename;

    if (!pdfBase64 || !docId || !filename) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }
    // docId et filename composent le chemin de l'objet : sans validation, un
    // « ../ » ou un « / » permettrait d'écraser le devis d'un autre client.
    if (!SAFE_SEGMENT.test(String(docId))) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Identifiant de document invalide' }) };
    }
    if (!SAFE_FILENAME.test(String(filename))) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Nom de fichier invalide' }) };
    }

    const buffer = Buffer.from(pdfBase64, 'base64');
    if (buffer.length === 0 || buffer.length > MAX_PDF_BYTES) {
      return { statusCode: 413, headers: cors, body: JSON.stringify({ error: 'PDF vide ou trop volumineux (10 Mo max)' }) };
    }
    if (buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Le fichier envoyé n\'est pas un PDF' }) };
    }

    const bucket = admin.storage().bucket();
    const file   = bucket.file('devis-partages/' + docId + '/' + filename);

    await file.save(buffer, {
      metadata: { contentType: 'application/pdf' },
      public: true,
      resumable: false,
    });

    const encodedPath = file.name.split('/').map(encodeURIComponent).join('/');
    const url = 'https://storage.googleapis.com/' + BUCKET + '/' + encodedPath;

    return { statusCode: 200, headers: cors, body: JSON.stringify({ url: url }) };
  } catch (e) {
    // Les messages du SDK Firebase citent le bucket, le projet et le service
    // account : ils restent dans les logs Netlify.
    console.error('upload-devis error:', e);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "L'envoi du PDF a échoué." }),
    };
  }
};
