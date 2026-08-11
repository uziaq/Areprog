// Netlify Function — prise de rendez-vous en ligne pour les clients
// GET  /.netlify/functions/rdv-booking?date=YYYY-MM-DD  → créneaux déjà pris ce jour-là
// POST /.netlify/functions/rdv-booking                  → crée un RDV dans Firestore (rdvs)
//
// Écrit directement dans la collection `rdvs` lue par gestion.html, avec le
// SDK admin (aucune règle Firestore publique à ouvrir). Le rendez-vous est
// créé avec le statut "a_confirmer" : c'est une demande de créneau, que
// l'atelier valide ensuite (même logique que les leads du formulaire de
// contact — un échec de notification ne doit jamais faire perdre la
// demande).
//
// Env vars (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON du service account Firebase   (requis)
//   RESEND_API_KEY           : clé API Resend                     (requis pour l'e-mail)
//   RESEND_FROM              : adresse d'expédition vérifiée      (optionnel)

const admin = require('firebase-admin');
const { checkRateLimit } = require('../_lib/rate-limit');

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

const RESEND_FROM    = 'AREPROG <contact@areprog.fr>';
const NOTIF_TO_EMAIL  = 'contact@areprog.fr';

const MAX = { court: 120, moyen: 200, long: 2000 };

// Valeurs par défaut si config/rdvDispo n'existe pas encore (même valeurs
// que celles pré-remplies dans la modale « Créneaux RDV » de gestion.html).
// Lun–Sam 8h–19h (cf. schema.org OpeningHoursSpecification des pages
// publiques) : créneaux d'une heure, le dernier commençant à 18h.
const DEFAULT_DISPO = {
  jours: [1, 2, 3, 4, 5, 6], // 0 = dimanche … 6 = samedi
  heures: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
  fermetures: [], // [{ date: 'YYYY-MM-DD', label: '...' }]
};
const MAX_DAYS_AHEAD = 90;

function initFirebase() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT non configurée');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

// Lue à chaque requête (pas de cache) : gestion.html doit pouvoir changer
// les créneaux et voir l'effet immédiatement sur la page publique.
async function chargerDispo() {
  try {
    const snap = await admin.firestore().collection('config').doc('rdvDispo').get();
    if (!snap.exists) return DEFAULT_DISPO;
    const data = snap.data() || {};
    return {
      jours: Array.isArray(data.jours) && data.jours.length ? data.jours : DEFAULT_DISPO.jours,
      heures: Array.isArray(data.heures) && data.heures.length ? data.heures : DEFAULT_DISPO.heures,
      fermetures: Array.isArray(data.fermetures) ? data.fermetures : [],
    };
  } catch (e) {
    console.warn('rdv-booking : config rdvDispo introuvable —', e.message);
    return DEFAULT_DISPO;
  }
}

function texte(valeur, maxLen) {
  if (typeof valeur !== 'string') return '';
  return valeur.trim().slice(0, maxLen);
}

function emailValide(e) {
  return !e || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);
}

// Fermeture ce jour-là : jour de semaine non ouvert, ou date listée dans les
// fermetures exceptionnelles. Renvoie le motif (ou null si ouvert).
function raisonFermeture(dateStr, dispo) {
  const parsed = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) return 'Date invalide';
  if (!dispo.jours.includes(parsed.getUTCDay())) return 'Atelier fermé ce jour-là';
  const exceptionnelle = dispo.fermetures.find((f) => f && f.date === dateStr);
  if (exceptionnelle) return exceptionnelle.label ? `Fermeture exceptionnelle — ${exceptionnelle.label}` : 'Fermeture exceptionnelle';
  return null;
}

function dateValide(d, dispo) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const parsed = new Date(d + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) return false;
  const aujourdhui = new Date();
  const minuitAuj = Date.UTC(aujourdhui.getUTCFullYear(), aujourdhui.getUTCMonth(), aujourdhui.getUTCDate());
  const diffJours = (parsed.getTime() - minuitAuj) / 86400000;
  if (diffJours < 0 || diffJours > MAX_DAYS_AHEAD) return false;
  return raisonFermeture(d, dispo) === null;
}

function escape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDateFr(d) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

async function envoyerEmail(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('rdv-booking : notification ignorée (RESEND_API_KEY absente)');
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ from: process.env.RESEND_FROM || RESEND_FROM, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ' : ' + (await res.text()).slice(0, 200));
  return true;
}

function recapHtml(rdv) {
  const l = (label, valeur) => valeur
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><strong>${escape(valeur)}</strong></td></tr>`
    : '';
  const vehicule = [rdv.vehicle?.brand, rdv.vehicle?.model, rdv.vehicle?.year && `(${rdv.vehicle.year})`].filter(Boolean).join(' ');
  return '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">'
    + l('Date', formatDateFr(rdv.date))
    + l('Heure', rdv.heure)
    + l('Nom', rdv.clientNom)
    + l('Téléphone', rdv.clientTel)
    + l('E-mail', rdv.clientEmail)
    + l('Véhicule', vehicule)
    + l('Motorisation', rdv.vehicle?.engine)
    + l('Immat.', rdv.vehicle?.plate)
    + l('Prestations', (rdv.prestations || []).join(', '))
    + l('Message', rdv.message)
    + '</table>';
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'Origine non autorisée' }) };
  }

  if (event.httpMethod === 'GET') {
    const month = texte((event.queryStringParameters || {}).month, 7);
    if (/^\d{4}-\d{2}$/.test(month)) {
      try {
        initFirebase();
        const dispo = await chargerDispo();
        const [y, m] = month.split('-').map(Number);
        const joursDansMois = new Date(Date.UTC(y, m, 0)).getUTCDate();
        const closedDates = [];
        for (let d = 1; d <= joursDansMois; d++) {
          const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (raisonFermeture(dateStr, dispo) !== null) closedDates.push(dateStr);
        }
        return { statusCode: 200, headers: cors, body: JSON.stringify({ closedDates }) };
      } catch (e) {
        console.error('rdv-booking GET (month) : lecture Firestore échouée —', e.message);
        return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Lecture du calendrier impossible' }) };
      }
    }

    const date = texte((event.queryStringParameters || {}).date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Date invalide' }) };
    }
    try {
      initFirebase();
      const dispo = await chargerDispo();
      const reason = raisonFermeture(date, dispo);
      if (reason) {
        return { statusCode: 200, headers: cors, body: JSON.stringify({ slots: dispo.heures, busy: dispo.heures, closed: true, reason }) };
      }
      const snap = await admin.firestore().collection('rdvs').where('date', '==', date).get();
      const busy = [];
      snap.forEach((doc) => {
        const h = doc.data().heure;
        if (h) busy.push(h);
      });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ slots: dispo.heures, busy, closed: false }) };
    } catch (e) {
      console.error('rdv-booking GET : lecture Firestore échouée —', e.message);
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Lecture des créneaux impossible' }) };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
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
    console.error('rdv-booking : Firebase non initialisé —', e.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Configuration serveur invalide.' }) };
  }

  const rl = await checkRateLimit(admin.firestore(), event, 'rdv-booking', { max: 5, windowMs: 10 * 60 * 1000 });
  if (rl.limited) {
    return { statusCode: 429, headers: cors, body: JSON.stringify({ error: 'Trop de demandes depuis cette connexion. Merci de réessayer dans quelques minutes.' }) };
  }

  const v = body.vehicle || {};
  const rdv = {
    clientNom:   texte(body.name, MAX.court),
    clientTel:   texte(body.phone, 30),
    clientEmail: texte(body.email, MAX.court),
    date:        texte(body.date, 10),
    heure:       texte(body.heure, 5),
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
    message: texte(body.message, MAX.long),
    page: texte(body.page, MAX.moyen),
  };

  if (!rdv.clientNom || !rdv.clientTel) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Nom et téléphone requis' }) };
  }
  if (!emailValide(rdv.clientEmail)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Adresse e-mail invalide' }) };
  }

  try {
    initFirebase();
    const dispo = await chargerDispo();

    if (!dateValide(rdv.date, dispo)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Date indisponible (atelier fermé ce jour-là, ou hors période de réservation)' }) };
    }
    if (!dispo.heures.includes(rdv.heure)) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Créneau horaire invalide' }) };
    }

    const db = admin.firestore();
    const collRdvs = db.collection('rdvs');

    // Re-vérifier juste avant l'écriture : le créneau a pu être pris entre le
    // moment où le client a chargé la page et celui où il valide sa demande.
    const conflit = await collRdvs.where('date', '==', rdv.date).where('heure', '==', rdv.heure).limit(1).get();
    if (!conflit.empty) {
      return { statusCode: 409, headers: cors, body: JSON.stringify({ error: 'Ce créneau vient d\'être réservé, merci d\'en choisir un autre.', code: 'SLOT_TAKEN' }) };
    }

    const vehicule = [rdv.vehicle.brand, rdv.vehicle.model].filter(Boolean).join(' ');
    const ref = collRdvs.doc();
    const doc = {
      id: ref.id,
      title: 'RDV client — ' + rdv.clientNom + (vehicule ? ' — ' + vehicule : ''),
      type: 'rdv',
      date: rdv.date,
      heure: rdv.heure,
      rappels: [1440, 60],
      rappelsSent: [],
      fireISO: new Date(rdv.date + 'T' + rdv.heure).toISOString(),
      clientId: null,
      clientNom: rdv.clientNom,
      clientTel: rdv.clientTel,
      clientEmail: rdv.clientEmail,
      vehIdx: null,
      docId: null,
      lieu: 'Atelier AREPROG — Biarritz',
      notes: [
        vehicule && `Véhicule : ${vehicule}${rdv.vehicle.year ? ' (' + rdv.vehicle.year + ')' : ''}`,
        rdv.vehicle.engine && `Motorisation : ${rdv.vehicle.engine}`,
        rdv.vehicle.km && `Kilométrage : ${rdv.vehicle.km}`,
        rdv.vehicle.plate && `Immat. : ${rdv.vehicle.plate.toUpperCase()}`,
        rdv.prestations.length && `Prestation(s) souhaitée(s) : ${rdv.prestations.join(', ')}`,
        rdv.message && `Message : ${rdv.message}`,
      ].filter(Boolean).join('\n'),
      source: 'client_booking',
      statut: 'a_confirmer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(doc);

    let notified = false;
    try {
      notified = await envoyerEmail(
        NOTIF_TO_EMAIL,
        `Nouvelle demande de RDV — ${rdv.clientNom} (${formatDateFr(rdv.date)} ${rdv.heure})`,
        recapHtml(rdv) + '<p style="margin-top:16px;font-size:13px;color:#666">Demande à confirmer dans l\'agenda de gestion.</p>'
      );
    } catch (e) {
      console.error('rdv-booking : notification atelier échouée —', e.message);
    }

    if (rdv.clientEmail) {
      try {
        await envoyerEmail(
          rdv.clientEmail,
          `Votre demande de RDV AREPROG — ${formatDateFr(rdv.date)} à ${rdv.heure}`,
          '<p style="font-family:sans-serif;font-size:14px">Bonjour ' + escape(rdv.clientNom) + ',</p>'
          + '<p style="font-family:sans-serif;font-size:14px">Votre demande de rendez-vous a bien été reçue. Nous vous la confirmons rapidement par téléphone ou WhatsApp.</p>'
          + recapHtml(rdv)
          + '<p style="font-family:sans-serif;font-size:13px;color:#666;margin-top:16px">Une question avant votre RDV ? Appelez le 06 67 92 46 30.</p>'
        );
      } catch (e) {
        console.error('rdv-booking : confirmation client échouée —', e.message);
      }
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, id: ref.id, date: rdv.date, heure: rdv.heure, notified }) };
  } catch (e) {
    console.error('rdv-booking POST : écriture Firestore échouée —', e.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "La réservation a échoué." }) };
  }
};
