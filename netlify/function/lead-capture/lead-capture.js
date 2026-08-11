// Netlify Function — enregistrement des demandes web
// POST /.netlify/functions/lead-capture
//
// Reçoit les demandes du formulaire de contact et du simulateur, les écrit dans
// Firestore avec le SDK admin (aucune règle publique à ouvrir), pré-calcule un
// brouillon de devis à partir du catalogue de prix, puis notifie par e-mail.
// La notification est optionnelle : un échec d'envoi ne doit jamais faire
// perdre la demande.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase   (requis)
//   RESEND_API_KEY           : clé API Resend                     (requis pour l'e-mail)
//   RESEND_FROM              : adresse d'expédition vérifiée      (optionnel)

const admin = require('firebase-admin');
const { checkRateLimit } = require('../_lib/rate-limit');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

const RESEND_FROM  = 'AREPROG <contact@areprog.fr>';
const NOTIF_TO_EMAIL = 'contact@areprog.fr';

const MAX = { court: 120, moyen: 200, long: 2000 };

// ── Brouillon de devis : associe chaque prestation demandée à une ligne du
// catalogue (config/catalogue) quand le libellé correspond clairement. Les
// packs combinés sont volontairement exclus (tarif différent d'une simple
// somme) — l'admin les applique manuellement s'il le juge pertinent.
const PRESTATION_KEYWORDS = [
  { match: /stage\s*1\b/i, keywords: ['stage 1'] },
  { match: /stage\s*2\b/i, keywords: ['stage 2'] },
  { match: /e85/i, keywords: ['e85'] },
  { match: /optimisation.*consommation|consommation.*optimis/i, keywords: ['optimisation', 'consommation'] },
  { match: /\begr\b/i, keywords: ['egr'] },
  { match: /\bfap\b|\bdpf\b/i, keywords: ['fap'] },
  { match: /adblue/i, keywords: ['adblue'] },
  { match: /\bodis\b/i, keywords: ['odis'] },
];

function normaliserTexte(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function trouverItemCatalogue(prestation, catalogue) {
  const regle = PRESTATION_KEYWORDS.find(function (r) { return r.match.test(prestation); });
  if (!regle) return null;
  for (const groupe of catalogue) {
    if (/pack/i.test(groupe.g || '')) continue;
    for (const item of (groupe.items || [])) {
      const label = normaliserTexte(item.l);
      if (regle.keywords.every(function (k) { return label.includes(k); })) return item;
    }
  }
  return null;
}

async function chargerCatalogue() {
  try {
    const snap = await admin.firestore().collection('config').doc('catalogue').get();
    const cat = snap.exists ? snap.data().cat : null;
    return Array.isArray(cat) ? cat : [];
  } catch (e) {
    console.warn('lead-capture : catalogue introuvable —', e.message);
    return [];
  }
}

function construireDevisDraft(prestations, catalogue) {
  if (!catalogue.length || !prestations.length) return null;
  const lignes = [];
  let total = 0;
  let aTarifer = 0;
  prestations.forEach(function (p) {
    const item = trouverItemCatalogue(p, catalogue);
    if (item) {
      lignes.push({ label: item.l, qte: 1, pu: item.p, desc: '', ref: '', remise: 0, remiseType: 'pct' });
      total += item.p;
    } else {
      lignes.push({ label: p, qte: 1, pu: 0, desc: 'À tarifer', ref: '', remise: 0, remiseType: 'pct' });
      aTarifer++;
    }
  });
  if (!lignes.length) return null;
  return { lignes: lignes, total: total, aTarifer: aTarifer };
}

function initFirebase() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT non configurée');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

function texte(valeur, maxLen) {
  if (typeof valeur !== 'string') return '';
  return valeur.trim().slice(0, maxLen);
}

// Le formulaire n'impose pas l'e-mail : on ne rejette que ce qui est renseigné
// et manifestement invalide.
function emailValide(e) {
  return !e || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);
}

function resumeHtml(lead) {
  const l = (label, valeur) => valeur
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><strong>${escape(valeur)}</strong></td></tr>`
    : '';
  const v = lead.vehicle || {};
  const vehicule = [v.brand, v.model, v.year && `(${v.year})`].filter(Boolean).join(' ');
  return '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">'
    + l('Source',       lead.source === 'simulateur' ? 'Simulateur' : 'Formulaire de contact')
    + l('Nom',          lead.name)
    + l('Téléphone',    lead.phone)
    + l('E-mail',       lead.email)
    + l('Zone',         lead.city)
    + l('Véhicule',     vehicule)
    + l('Motorisation', v.engine)
    + l('Kilométrage',  v.km)
    + l('Immat.',       v.plate)
    + l('Prestations',  (lead.prestations || []).join(', '))
    + l('Message',      lead.message)
    + '</table>';
}

function escape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function devisDraftHtml(draft) {
  if (!draft) return '';
  const lignes = draft.lignes.map(function (l) {
    const prix = l.pu > 0 ? l.pu.toFixed(2) + ' €' : 'à tarifer';
    return `<tr><td style="padding:2px 12px 2px 0">${escape(l.label)}</td><td style="padding:2px 0;text-align:right">${prix}</td></tr>`;
  }).join('');
  return '<p style="margin:16px 0 4px;font-weight:bold">Devis brouillon (créé automatiquement) :</p>'
    + '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">' + lignes + '</table>'
    + `<p style="margin:6px 0 0"><strong>Total estimé : ${draft.total.toFixed(2)} €</strong>`
    + (draft.aTarifer ? ` — ${draft.aTarifer} ligne(s) à tarifer manuellement` : '') + '</p>';
}

async function notifier(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('lead-capture : notification ignorée (RESEND_API_KEY absente)');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || RESEND_FROM,
      to: [NOTIF_TO_EMAIL],
      subject: `Nouvelle demande — ${lead.name || 'sans nom'}`,
      html: resumeHtml(lead) + devisDraftHtml(lead.devisDraft),
    }),
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ' : ' + (await res.text()).slice(0, 200));
  return true;
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'Origine non autorisée' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  // Champ leurre : rempli uniquement par les robots, qui remplissent tout.
  if (body.website) {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  }

  try {
    initFirebase();
  } catch (e) {
    console.error('lead-capture : Firebase non initialisé —', e.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Configuration serveur invalide.' }) };
  }

  const rl = await checkRateLimit(admin.firestore(), event, 'lead-capture', { max: 8, windowMs: 10 * 60 * 1000 });
  if (rl.limited) {
    return { statusCode: 429, headers: cors, body: JSON.stringify({ error: 'Trop de demandes depuis cette connexion. Merci de réessayer dans quelques minutes.' }) };
  }

  const source = body.source === 'simulateur' ? 'simulateur' : 'contact';
  const v = body.vehicle || {};

  const lead = {
    source,
    name:    texte(body.name, MAX.court),
    phone:   texte(body.phone, 30),
    email:   texte(body.email, MAX.court),
    city:    texte(body.city, MAX.court),
    message: texte(body.message, MAX.long),
    vehicle: {
      brand:  texte(v.brand, MAX.court),
      model:  texte(v.model, MAX.court),
      year:   texte(v.year, 10),
      engine: texte(v.engine, MAX.moyen),
      km:     texte(v.km, 15),
      plate:  texte(v.plate, 15),
    },
    prestations: Array.isArray(body.prestations)
      ? body.prestations.slice(0, 20).map(p => texte(p, MAX.court)).filter(Boolean)
      : [],
    status: 'nouveau',
    page: texte(body.page, MAX.moyen),
    userAgent: texte(event.headers['user-agent'], MAX.moyen),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Une demande sans aucun moyen de rappel n'a pas d'intérêt.
  if (!lead.phone && !lead.email) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Téléphone ou e-mail requis' }) };
  }
  if (!emailValide(lead.email)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Adresse e-mail invalide' }) };
  }

  let id;
  try {
    initFirebase();
    const catalogue = await chargerCatalogue();
    const devisDraft = construireDevisDraft(lead.prestations, catalogue);
    if (devisDraft) lead.devisDraft = devisDraft;
    const ref = await admin.firestore().collection('leads').add(lead);
    id = ref.id;
  } catch (e) {
    console.error('lead-capture : écriture Firestore échouée —', e.message);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "L'enregistrement a échoué." }),
    };
  }

  // La demande est en base : une notification qui échoue ne doit pas la
  // transformer en erreur côté visiteur.
  let notified = false;
  try {
    notified = await notifier(lead);
  } catch (e) {
    console.error('lead-capture : notification échouée —', e.message);
  }

  return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, id, notified }) };
};
