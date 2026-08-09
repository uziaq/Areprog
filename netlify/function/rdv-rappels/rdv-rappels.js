// Netlify Scheduled Function — envoi automatique des rappels RDV par Resend
// Toutes les 5 minutes : lit Firestore, envoie via Resend, persiste l'état.
//
// Env vars requises (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON complet du service account Firebase
//   RESEND_API_KEY           : clé API Resend
//   RESEND_FROM              : adresse d'expédition vérifiée (optionnel)

const { schedule } = require('@netlify/functions');
const admin = require('firebase-admin');

const RESEND_FROM   = 'AREPROG <rappels@areprog.fr>';
const RAPPEL_TO_EMAIL = 'arthur@areprog.fr';
const STALE_RAPPEL_MS = 7 * 24 * 3600000;

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

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendResend(subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY non configurée');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || RESEND_FROM,
      to: [RAPPEL_TO_EMAIL],
      subject: subject,
      html: html,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(function(){ return ''; });
    throw new Error('Resend HTTP ' + res.status + ' : ' + txt);
  }
}

function computeFireBase(rdv) {
  if (rdv.fireISO) {
    const t = new Date(rdv.fireISO).getTime();
    return isNaN(t) ? null : t;
  }
  if (!rdv.date || !rdv.heure) return null;
  const t = new Date(rdv.date + 'T' + rdv.heure + ':00Z').getTime();
  return isNaN(t) ? null : t;
}

function buildRappelEmail(rdv, minutes) {
  const vehLabel = [rdv.vm, rdv.vmo, rdv.vmot, rdv.van ? '(' + rdv.van + ')' : '']
    .filter(Boolean).join(' ');
  const label = RAPPEL_LABELS[minutes] || (minutes + ' min avant');
  const row = (l, v) => v
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${l}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
    : '';
  const subject = 'Rappel RDV — ' + (rdv.title || 'Sans titre') + ' (' + label + ')';
  const html = '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">'
    + row('Titre', rdv.title)
    + row('Date', rdv.date)
    + row('Heure', rdv.heure || 'Non précisée')
    + row('Lieu', rdv.lieu || 'Non précisé')
    + row('Client', rdv.clientNom || 'Non précisé')
    + row('Véhicule', vehLabel || 'Non précisé')
    + row('Notes', rdv.notes)
    + row('Rappel', label)
    + '</table>';
  return { subject, html };
}

const handler = async () => {
  initFirebase();
  const db = admin.firestore();

  const snapshot = await db.collection('rdvs').get();

  const rdvDocs = [];
  snapshot.forEach(doc => {
    if (doc.id === 'all') return;
    const data = doc.data();
    if (data && data.id) rdvDocs.push({ ref: doc.ref, rdv: data });
  });
  if (!rdvDocs.length) return { statusCode: 200, body: 'no rdvs' };

  const now = Date.now();
  let sent = 0;
  let errors = 0;
  const updates = [];

  for (const { ref, rdv } of rdvDocs) {
    let dirty = false;
    const fireBase = computeFireBase(rdv);

    // ── Rappels (email) ─────────────────────────────────────────
    const rappels = (rdv.rappels && rdv.rappels.length) ? rdv.rappels
      : (rdv.rappel && rdv.rappel > 0 ? [rdv.rappel] : []);

    if (rappels.length && fireBase !== null) {
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
          const email = buildRappelEmail(rdv, m);
          await sendResend(email.subject, email.html);
          rdv.rappelsSent.push(m);
          dirty = true;
          sent++;
        } catch (e) {
          console.error('Email rappel échoué rdv', rdv.id, 'min', m, e.message);
          errors++;
        }
      }
    }

    if (dirty) updates.push(ref.set(rdv));
  }

  await Promise.all(updates);

  return {
    statusCode: 200,
    body: JSON.stringify({ sent, errors, total: rdvDocs.length }),
  };
};

exports.handler = schedule('*/5 * * * *', handler);
