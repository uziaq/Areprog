// Netlify Function — upload photos & documents véhicule vers Firebase Storage
// Env vars requises : FIREBASE_SERVICE_ACCOUNT (JSON service account)

const admin = require('firebase-admin');

const BUCKET = 'areprog-devis.firebasestorage.app';
const ALLOWED = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
];
const MAX_BYTES = 8 * 1024 * 1024;

let ready = false;

function initAdmin() {
  if (ready) return;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(sa), storageBucket: BUCKET });
  ready = true;
}

// Nom de fichier sûr : pas de séparateur de chemin ni de caractère exotique
function safeName(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'fichier';
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    initAdmin();
    var body = JSON.parse(event.body || '{}');
    var fileBase64  = body.fileBase64;
    var vehiculeId  = body.vehiculeId;
    var filename    = body.filename;
    var contentType = body.contentType || 'application/octet-stream';
    var kind        = body.kind === 'document' ? 'documents' : 'photos';

    if (!fileBase64 || !vehiculeId || !filename) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }
    if (ALLOWED.indexOf(contentType) === -1) {
      return { statusCode: 415, headers: CORS, body: JSON.stringify({ error: 'Type de fichier non autorisé : ' + contentType }) };
    }

    var buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 413, headers: CORS, body: JSON.stringify({ error: 'Fichier trop volumineux (max 8 Mo)' }) };
    }

    var path = 'vehicules/' + safeName(vehiculeId) + '/' + kind + '/' + Date.now() + '-' + safeName(filename);
    var file = admin.storage().bucket().file(path);

    await file.save(buffer, {
      metadata: { contentType: contentType },
      public: true,
      resumable: false,
    });

    var encodedPath = file.name.split('/').map(encodeURIComponent).join('/');

    return {
      statusCode: 200,
      headers: Object.assign({ 'Content-Type': 'application/json' }, CORS),
      body: JSON.stringify({
        url:  'https://storage.googleapis.com/' + BUCKET + '/' + encodedPath,
        path: file.name,
      }),
    };
  } catch(e) {
    console.error('upload-vehicule error:', e);
    return {
      statusCode: 500,
      headers: Object.assign({ 'Content-Type': 'application/json' }, CORS),
      body: JSON.stringify({ error: e.message }),
    };
  }
};
