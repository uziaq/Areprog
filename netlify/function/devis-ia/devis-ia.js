// Netlify Function — génère des lignes de devis à partir d'un message libre (IA)
// POST /.netlify/functions/devis-ia
//
// Réservée aux utilisateurs authentifiés (gestion.html) : le staff colle la
// demande d'un client (message brut, besoin exprimé) dans un champ texte ;
// cette fonction demande à Claude de la transformer en lignes de devis
// exploitables (désignation, quantité, prix), en reprenant le tarif exact du
// catalogue AREPROG (config/catalogue) pour les prestations logicielles
// connues, et en proposant une estimation à vérifier pour tout le reste
// (pièces mécaniques, main d'œuvre...) — Claude n'a pas d'accès à des prix
// fournisseurs en temps réel, ces lignes-là restent à valider manuellement
// par l'admin avant envoi au client.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase   (requis)
//   ANTHROPIC_API_KEY        : clé API Anthropic                  (requis)

const admin = require('firebase-admin');
const { checkRateLimit } = require('../_lib/rate-limit');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];
const MAX_MESSAGE_LEN = 4000;
const MODEL = 'claude-haiku-4-5-20251001';

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
    console.warn('devis-ia: jeton refusé —', e.code || e.message);
    return null;
  }
}

async function chargerCatalogue() {
  try {
    const snap = await admin.firestore().collection('config').doc('catalogue').get();
    const cat = snap.exists ? snap.data().cat : null;
    return Array.isArray(cat) ? cat : [];
  } catch (e) {
    console.warn('devis-ia: catalogue introuvable —', e.message);
    return [];
  }
}

// Ne garde que ce qui sert au prompt (libellé + prix) — les "gains" marketing
// alourdiraient le contexte pour rien ici. Les packs combinés sont exclus :
// leur tarif n'est pas la somme des lignes, l'admin les applique lui-même.
function catalogueAllege(cat) {
  return cat
    .filter(function (g) { return !/pack/i.test(g.g || ''); })
    .map(function (g) {
      return { groupe: g.g, items: (g.items || []).map(function (it) { return { label: it.l, prix: it.p }; }) };
    });
}

function buildPrompt(message, catalogue) {
  return 'Voici le catalogue officiel de prestations AREPROG (reprogrammation moteur / diagnostics), au format JSON :\n'
    + JSON.stringify(catalogue)
    + '\n\nVoici la demande d\'un client, telle quelle (message brut, à interpréter) :\n"""\n' + message + '\n"""\n\n'
    + 'Transforme cette demande en lignes de devis. Règles strictes :\n'
    + '- Pour toute prestation qui correspond clairement à une entrée du catalogue ci-dessus, reprends EXACTEMENT son "label" et son "prix" — aValider: false.\n'
    + '- Pour tout le reste (pièces mécaniques, main d\'œuvre, prestations hors catalogue AREPROG), propose une désignation claire et une estimation de prix réaliste en euros HT (tu n\'as pas accès à des prix fournisseurs en temps réel) — aValider: true, et précise dans "desc" que c\'est une estimation à vérifier.\n'
    + '- Une ligne par pièce ou prestation distincte, quantité réaliste.\n'
    + '- Si un véhicule est mentionné, extrais marque/modele/motorisation/annee (chaîne vide si absent).\n'
    + '- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans markdown, au format exact :\n'
    + '{"vehicule":{"marque":"","modele":"","motorisation":"","annee":""},"lignes":[{"label":"","qte":1,"pu":0,"desc":"","ref":"","aValider":false}]}';
}

function clampStr(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function clampNum(v, min, max, fallback) {
  const n = parseFloat(v);
  if (!isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function validerReponse(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const m = /\{[\s\S]*\}/.exec(raw || '');
    if (!m) throw new Error('Réponse IA invalide');
    parsed = JSON.parse(m[0]);
  }
  const lignesIn = Array.isArray(parsed.lignes) ? parsed.lignes.slice(0, 15) : [];
  const lignes = lignesIn.map(function (l) {
    return {
      label: clampStr(l.label, 200),
      qte: clampNum(l.qte, 1, 999, 1),
      pu: clampNum(l.pu, 0, 200000, 0),
      desc: clampStr(l.desc, 300),
      ref: clampStr(l.ref, 60),
      aValider: !!l.aValider,
    };
  }).filter(function (l) { return l.label; });

  const v = parsed.vehicule || {};
  const vehicule = {
    marque: clampStr(v.marque, 60),
    modele: clampStr(v.modele, 60),
    motorisation: clampStr(v.motorisation, 100),
    annee: clampStr(v.annee, 10),
  };
  return { lignes: lignes, vehicule: vehicule };
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

    const rl = await checkRateLimit(admin.firestore(), event, 'devis-ia', { max: 20, windowMs: 10 * 60 * 1000 });
    if (rl.limited) {
      return { statusCode: 429, headers: cors, body: JSON.stringify({ error: 'Trop de générations, réessaie dans quelques minutes.' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const message = clampStr(body.message, MAX_MESSAGE_LEN);
    if (!message) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Message vide' }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurée' }) };
    }

    const catalogue = catalogueAllege(await chargerCatalogue());

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: buildPrompt(message, catalogue) }],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text().catch(function () { return ''; });
      console.error('devis-ia: Anthropic', aiRes.status, txt.slice(0, 300));
      return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'La génération a échoué.' }) };
    }

    const data = await aiRes.json();
    const rawText = (data.content && data.content[0] && data.content[0].text) || '';

    let result;
    try {
      result = validerReponse(rawText);
    } catch (e) {
      console.error('devis-ia: réponse IA non exploitable —', e.message, rawText.slice(0, 300));
      return { statusCode: 502, headers: cors, body: JSON.stringify({ error: "La réponse générée n'a pas pu être interprétée." }) };
    }

    if (!result.lignes.length) {
      return { statusCode: 200, headers: cors, body: JSON.stringify({ lignes: [], vehicule: result.vehicule, warning: "Aucune ligne exploitable n'a été identifiée dans ce message." }) };
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify(result) };
  } catch (e) {
    console.error('devis-ia error:', e);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'La génération a échoué.' }) };
  }
};
