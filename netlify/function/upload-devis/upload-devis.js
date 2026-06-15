// Netlify Function — upload PDF devis vers Firebase Storage
// Env vars requises : FIREBASE_SERVICE_ACCOUNT (JSON service account)

const admin = require('firebase-admin');

const BUCKET = 'areprog-devis.firebasestorage.app';
let ready = false;

function initAdmin() {
  if (ready) return;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(sa), storageBucket: BUCKET });
  ready = true;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    initAdmin();
    var body = JSON.parse(event.body);
    var pdfBase64 = body.pdfBase64;
    var docId     = body.docId;
    var filename  = body.filename;

    if (!pdfBase64 || !docId || !filename) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }

    var buffer = Buffer.from(pdfBase64, 'base64');
    var bucket = admin.storage().bucket();
    var file   = bucket.file('devis-partages/' + docId + '/' + filename);

    await file.save(buffer, { metadata: { contentType: 'application/pdf' } });

    var expires = new Date();
    expires.setFullYear(expires.getFullYear() + 2);
    var result = await file.getSignedUrl({ action: 'read', expires: expires });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: result[0] }),
    };
  } catch(e) {
    console.error('upload-devis error:', e);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
