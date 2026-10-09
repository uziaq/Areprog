// Netlify Function — historique des emails envoyés (Resend → Firestore)
// GET /.netlify/functions/emails-envoyes          → liste (synchronisée avec Resend)
// GET /.netlify/functions/emails-envoyes?id=<id> → détail d'un email (contenu HTML)
//
// Réservée aux utilisateurs authentifiés (gestion.html, onglet Mail).
// Resend ne conserve ses journaux que pendant une durée limitée : à chaque
// consultation, les emails récents de Resend (gestion, rappels RDV,
// notifications de demandes) sont recopiés dans la collection Firestore
// `emailsEnvoyes`, qui sert d'archive durable. send-email.js y enregistre
// aussi directement chaque envoi fait depuis la gestion.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase   (requis)
//   RESEND_API_KEY           : clé API Resend                     (requis)

const admin = require('firebase-admin');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const COLLECTION = 'emailsEnvoyes';
// Resend limite à ~2 requêtes/s par équipe : on espace les pages et on
// borne la synchro pour rester sous le délai d'exécution de Netlify (10 s).
const MAX_SYNC_PAGES = 8;
const PAGE_DELAY_MS = 600;
const MAX_LIST = 500;
// Une valeur de champ Firestore est limitée à ~1 Mo.
const MAX_HTML_STORE = 900 * 1024;
const RESEND_ID = /^[A-Za-z0-9-]{8,64}$/;

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
    console.warn('emails-envoyes: jeton refusé —', e.code || e.message);
    return null;
  }
}

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function resendGet(path, apiKey) {
  return fetch('https://api.resend.com' + path, {
    headers: { 'Authorization': 'Bearer ' + apiKey },
  }).then(async function (res) {
    if (!res.ok) {
      const txt = await res.text().catch(function () { return ''; });
      throw new Error('Resend ' + res.status + ' ' + txt.slice(0, 200));
    }
    return res.json();
  });
}

function toArr(v) {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return v ? [String(v)] : [];
}

// Recopie dans Firestore les emails récents connus de Resend. S'arrête dès
// qu'une page ne contient plus rien de nouveau (les suivantes sont déjà
// archivées) : la première consultation rattrape l'historique, les
// suivantes ne coûtent qu'une page (qui rafraîchit aussi les statuts).
async function syncFromResend(db, apiKey) {
  let after = null;
  let imported = 0;
  for (let page = 0; page < MAX_SYNC_PAGES; page++) {
    if (page > 0) await sleep(PAGE_DELAY_MS);
    const list = await resendGet('/emails?limit=100' + (after ? '&after=' + encodeURIComponent(after) : ''), apiKey);
    const data = Array.isArray(list.data) ? list.data : [];
    if (!data.length) break;

    const refs = data.map(function (e) { return db.collection(COLLECTION).doc(String(e.id)); });
    const snaps = await db.getAll.apply(db, refs);
    let fresh = 0;
    const batch = db.batch();
    data.forEach(function (e, i) {
      if (!snaps[i].exists) fresh++;
      batch.set(refs[i], {
        id: String(e.id),
        to: toArr(e.to),
        cc: toArr(e.cc),
        bcc: toArr(e.bcc),
        from: e.from || '',
        subject: e.subject || '',
        createdAt: e.created_at ? new Date(e.created_at).toISOString() : '',
        lastEvent: e.last_event || '',
        syncedAt: new Date().toISOString(),
      }, { merge: true });
    });
    await batch.commit();
    imported += fresh;

    if (!list.has_more || !fresh) break;
    after = data[data.length - 1].id;
  }
  return imported;
}

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'GET') {
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

    const db = admin.firestore();
    const apiKey = process.env.RESEND_API_KEY;
    const qs = event.queryStringParameters || {};

    // ── Détail d'un email ──
    if (qs.id) {
      if (!RESEND_ID.test(qs.id)) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Identifiant invalide' }) };
      }
      const ref = db.collection(COLLECTION).doc(qs.id);
      const snap = await ref.get();
      const stored = snap.exists ? snap.data() : null;
      if (stored && stored.html) {
        return { statusCode: 200, headers: cors, body: JSON.stringify({ email: stored }) };
      }
      if (!apiKey) {
        return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'Contenu indisponible' }) };
      }
      let full;
      try {
        full = await resendGet('/emails/' + encodeURIComponent(qs.id), apiKey);
      } catch (e) {
        console.warn('emails-envoyes: détail —', e.message);
        if (stored) return { statusCode: 200, headers: cors, body: JSON.stringify({ email: stored }) };
        return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'Email introuvable (plus conservé par Resend)' }) };
      }
      const email = Object.assign({}, stored || {}, {
        id: String(full.id || qs.id),
        to: toArr(full.to),
        cc: toArr(full.cc),
        bcc: toArr(full.bcc),
        from: full.from || '',
        subject: full.subject || '',
        createdAt: full.created_at ? new Date(full.created_at).toISOString() : ((stored && stored.createdAt) || ''),
        lastEvent: full.last_event || ((stored && stored.lastEvent) || ''),
        html: typeof full.html === 'string' ? full.html : '',
        text: typeof full.text === 'string' ? full.text : '',
      });
      const toStore = Object.assign({}, email);
      if (toStore.html.length > MAX_HTML_STORE) delete toStore.html;
      if ((toStore.text || '').length > MAX_HTML_STORE) delete toStore.text;
      await ref.set(toStore, { merge: true }).catch(function (e) {
        console.warn('emails-envoyes: archivage détail —', e.message);
      });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ email: email }) };
    }

    // ── Liste ──
    let syncError = '';
    let imported = 0;
    if (!apiKey) {
      syncError = 'RESEND_API_KEY non configurée';
    } else {
      try {
        imported = await syncFromResend(db, apiKey);
      } catch (e) {
        console.warn('emails-envoyes: synchro Resend —', e.message);
        syncError = 'Synchronisation Resend impossible — affichage de l’archive seule.';
      }
    }

    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(MAX_LIST).get();
    const emails = snap.docs.map(function (d) {
      const e = d.data();
      return {
        id: d.id,
        to: e.to || [],
        from: e.from || '',
        subject: e.subject || '',
        createdAt: e.createdAt || '',
        lastEvent: e.lastEvent || '',
        attachments: e.attachments || [],
        hasHtml: !!e.html,
      };
    });

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ emails: emails, imported: imported, syncError: syncError || undefined }),
    };
  } catch (e) {
    console.error('emails-envoyes error:', e);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Chargement impossible.' }) };
  }
};
