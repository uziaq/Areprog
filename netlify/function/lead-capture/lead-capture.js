// Netlify Function — enregistrement des demandes web
// POST /.netlify/functions/lead-capture
//
// Reçoit les demandes du formulaire de contact et du simulateur, les écrit dans
// Firestore avec le SDK admin (aucune règle publique à ouvrir), puis notifie
// par e-mail. La notification est optionnelle : un échec d'envoi ne doit jamais
// faire perdre la demande.
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase        (requis)
//   EMAILJS_PRIVATE_KEY      : clé privée EmailJS                      (requis pour l'e-mail)
//   EMAILJS_LEAD_TEMPLATE    : id du template EmailJS de notification  (requis pour l'e-mail)

const admin = require('firebase-admin');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

const EJS_SERVICE    = 'service_ipazk28';
const EJS_PUBLIC_KEY = '5Lk7jHaGZ9YzEfM51';
const EJS_TO_EMAIL   = 'contact@areprog.fr';

const MAX = { court: 120, moyen: 200, long: 2000 };

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

async function notifier(lead) {
  const template = process.env.EMAILJS_LEAD_TEMPLATE;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  if (!template || !privateKey) {
    console.warn('lead-capture : notification ignorée (EMAILJS_LEAD_TEMPLATE ou EMAILJS_PRIVATE_KEY absente)');
    return false;
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EJS_SERVICE,
      template_id: template,
      user_id: EJS_PUBLIC_KEY,
      accessToken: privateKey,
      template_params: {
        to_email:    EJS_TO_EMAIL,
        subject:     `Nouvelle demande — ${lead.name || 'sans nom'}`,
        client_nom:  lead.name || '—',
        client_tel:  lead.phone || '—',
        client_mail: lead.email || '—',
        source:      lead.source === 'simulateur' ? 'Simulateur' : 'Formulaire de contact',
        resume_html: resumeHtml(lead),
      },
    }),
  });
  if (!res.ok) throw new Error('EmailJS ' + res.status + ' : ' + (await res.text()).slice(0, 200));
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
