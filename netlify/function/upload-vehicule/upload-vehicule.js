// Netlify Function — upload photos, vidéos & documents véhicule vers Firebase Storage
// Env vars requises : FIREBASE_SERVICE_ACCOUNT (JSON service account)
//
// Réservé aux utilisateurs authentifiés : les fichiers déposés deviennent
// lisibles publiquement (les liens sont ouverts sans compte depuis la fiche
// véhicule), donc l'écriture doit rester strictement contrôlée.

const admin = require('firebase-admin');

const BUCKET = 'areprog-devis.firebasestorage.app';
const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const MAX_BYTES = 8 * 1024 * 1024;
// Les fonctions Netlify classiques coupent la requête (sans réponse HTTP
// propre) au-delà d'~6 Mo de corps JSON — le fichier y voyage encodé en
// base64 (+33 %), d'où ce plafond vidéo nettement plus bas que sa taille
// brute finale sur disque.
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;
const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,80}$/;
const SAFE_FILENAME = /^[A-Za-z0-9 _.-]{1,200}\.(jpe?g|png|webp|pdf|mp4|mov)$/i;
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

// Le type déclaré par le navigateur n'engage à rien : on vérifie aussi la
// signature binaire avant de publier le fichier.
// MP4 et QuickTime (.mov) partagent le conteneur ISO base media file format :
// une boîte "ftyp" (ou, pour les .mov plus anciens, "moov"/"free"/"wide"/
// "mdat") à l'offset 4 suffit à écarter un fichier qui n'est pas de la vidéo.
const SIGNATURES = {
  'image/jpeg':      (b) => b.subarray(0, 3).toString('hex') === 'ffd8ff',
  'image/png':       (b) => b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
  'image/webp':      (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  'application/pdf': (b) => b.subarray(0, 5).toString('latin1') === '%PDF-',
  'video/mp4':       (b) => b.length > 8 && b.subarray(4, 8).toString('latin1') === 'ftyp',
  'video/quicktime': (b) => b.length > 8 && ['ftyp', 'moov', 'free', 'wide', 'mdat'].indexOf(b.subarray(4, 8).toString('latin1')) !== -1,
};

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
    console.warn('upload-vehicule: jeton refusé —', e.code || e.message);
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

    const body        = JSON.parse(event.body || '{}');
    const fileBase64  = body.fileBase64;
    const vehiculeId  = body.vehiculeId;
    const filename    = body.filename;
    const contentType = body.contentType;
    const kind        = body.kind === 'document' ? 'documents' : body.kind === 'video' ? 'videos' : 'photos';
    const isVideo     = VIDEO_TYPES.indexOf(contentType) !== -1;

    if (!fileBase64 || !vehiculeId || !filename) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }
    // vehiculeId et filename composent le chemin de l'objet : sans validation,
    // un « ../ » ou un « / » permettrait d'écraser les fichiers d'un autre
    // véhicule — ou n'importe quel objet du bucket.
    if (!SAFE_SEGMENT.test(String(vehiculeId))) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Identifiant de véhicule invalide' }) };
    }
    if (!SAFE_FILENAME.test(String(filename))) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Nom de fichier invalide' }) };
    }
    if (!Object.prototype.hasOwnProperty.call(SIGNATURES, contentType)) {
      return { statusCode: 415, headers: cors, body: JSON.stringify({ error: 'Type de fichier non autorisé' }) };
    }

    const buffer  = Buffer.from(fileBase64, 'base64');
    const maxByte = isVideo ? MAX_VIDEO_BYTES : MAX_BYTES;
    if (buffer.length === 0 || buffer.length > maxByte) {
      return { statusCode: 413, headers: cors, body: JSON.stringify({ error: 'Fichier vide ou trop volumineux (' + Math.round(maxByte / 1024 / 1024) + ' Mo max)' }) };
    }
    if (!SIGNATURES[contentType](buffer)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Le contenu ne correspond pas au type annoncé' }) };
    }

    const path = 'vehicules/' + vehiculeId + '/' + kind + '/' + Date.now() + '-' + filename;
    const file = admin.storage().bucket().file(path);

    await file.save(buffer, {
      metadata: { contentType: contentType },
      public: true,
      resumable: false,
    });

    const encodedPath = file.name.split('/').map(encodeURIComponent).join('/');

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        url:  'https://storage.googleapis.com/' + BUCKET + '/' + encodedPath,
        path: file.name,
      }),
    };
  } catch (e) {
    // Les messages du SDK Firebase citent le bucket, le projet et le service
    // account : ils restent dans les logs Netlify.
    console.error('upload-vehicule error:', e);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "L'envoi du fichier a échoué." }),
    };
  }
};
