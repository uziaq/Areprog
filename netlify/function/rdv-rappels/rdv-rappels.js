// Netlify Scheduled Function — envoi automatique des rappels RDV par EmailJS
// Toutes les 5 minutes : lit Firestore, envoie via l'API REST EmailJS, persiste l'état.
//
// Env vars requises (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON complet du service account Firebase
//   EMAILJS_PRIVATE_KEY      : clé privée EmailJS (Account → General → Private Key)

const { schedule } = require('@netlify/functions');
const admin = require('firebase-admin');

const EJS_SERVICE    = 'service_6dj8dmv';
const EJS_TPL_RAPPEL = 'template_mlbev47';
const EJS_PUBLIC_KEY = '3xdOxKiXtMqhlc7ei';
const EJS_FROM_EMAIL = 'arthur@areprog.fr';
const STALE_RAPPEL_MS = 7 * 24 * 3600000;

// Même liste que côté client, pour construire un libellé lisible
const RAPPEL_LABELS = {
  15: '15 min avant', 30: '30 min avant', 60: '1 heure avant',
  120: '2 heures avant', 360: '6 heures avant',
  1440: 'La veille (24h)', 2880: '2 jours avant',
  4320: '3 jours avant', 10080: '1 semaine avant',
};

function initFirebase() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT non configurée');
  const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

async function sendEmailJS(params) {
  const privKey = process.env.EMAILJS_PRIVATE_KEY;
  if (!privKey) throw new Error('EMAILJS_PRIVATE_KEY non configurée');
  const body = {
    service_id: EJS_SERVICE,
    template_id: EJS_TPL_RAPPEL,
    user_id: EJS_PUBLIC_KEY,
    accessToken: privKey,
    template_params: params,
  };
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(function(){ return ''; });
    throw new Error('EmailJS HTTP ' + res.status + ' : ' + txt);
  }
}

function computeFireBase(rdv) {
  // Priorité à fireISO (absolu UTC, posé par saveRdv côté client). Sinon, fallback
  // sur date+heure interprété comme Europe/Paris (offset -60 min par rapport à UTC l'hiver,
  // -120 l'été — on accepte l'imprécision, les rdvs anciens passent le cutoff stale).
  if (rdv.fireISO) {
    const t = new Date(rdv.fireISO).getTime();
    return isNaN(t) ? null : t;
  }
  if (!rdv.date || !rdv.heure) return null;
  // Fallback brut — Netlify tourne en UTC. On ne peut pas deviner la TZ sans lib.
  const t = new Date(rdv.date + 'T' + rdv.heure + ':00Z').getTime();
  return isNaN(t) ? null : t;
}

function buildTemplateParams(rdv, minutes) {
  const vehLabel = [rdv.vm, rdv.vmo, rdv.vmot, rdv.van ? '(' + rdv.van + ')' : '']
    .filter(Boolean).join(' ');
  return {
    to_email:     EJS_FROM_EMAIL,
    rdv_title:    rdv.title || '',
    rdv_date:     rdv.date || '',
    rdv_heure:    rdv.heure || 'Non précisée',
    rdv_lieu:     rdv.lieu || 'Non précisé',
    rdv_client:   rdv.clientNom || 'Non précisé',
    rdv_vehicule: vehLabel || 'Non précisé',
    rdv_notes:    rdv.notes || '',
    rappel_label: RAPPEL_LABELS[minutes] || (minutes + ' min avant'),
  };
}

const handler = async () => {
  initFirebase();
  const db = admin.firestore();
  const snap = await db.collection('rdvs').doc('all').get();
  if (!snap.exists) return { statusCode: 200, body: 'no rdvs doc' };

  const rdvs = (snap.data() && snap.data().rdvs) || [];
  const now = Date.now();
  let dirty = false;
  let sent = 0;
  let errors = 0;

  for (const rdv of rdvs) {
    const rappels = (rdv.rappels && rdv.rappels.length) ? rdv.rappels
      : (rdv.rappel && rdv.rappel > 0 ? [rdv.rappel] : []);
    if (!rappels.length) continue;
    const fireBase = computeFireBase(rdv);
    if (fireBase === null) continue;
    rdv.rappelsSent = rdv.rappelsSent || [];

    for (const m of rappels) {
      if (rdv.rappelsSent.includes(m)) continue;
      const fire = fireBase - m * 60000;
      if (fire > now) continue;
      if (now - fire > STALE_RAPPEL_MS) {
        rdv.rappelsSent.push(m);
        dirty = true;
        continue;
      }
      try {
        await sendEmailJS(buildTemplateParams(rdv, m));
        rdv.rappelsSent.push(m);
        dirty = true;
        sent++;
      } catch (e) {
        console.error('Envoi rappel échoué pour rdv', rdv.id, 'minutes', m, e.message);
        errors++;
        // On ne marque pas : retry au prochain cron
      }
    }
  }

  if (dirty) {
    await db.collection('rdvs').doc('all').set({ rdvs }, { merge: true });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ sent: sent, errors: errors, total: rdvs.length }),
  };
};

exports.handler = schedule('*/5 * * * *', handler);
