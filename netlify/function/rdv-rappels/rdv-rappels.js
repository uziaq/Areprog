// Netlify Scheduled Function — envoi automatique des rappels RDV par EmailJS + SMS Twilio
// Toutes les 5 minutes : lit Firestore, envoie via EmailJS et Twilio, persiste l'état.
//
// Env vars requises (Netlify dashboard) :
//   FIREBASE_SERVICE_ACCOUNT : JSON complet du service account Firebase
//   EMAILJS_PRIVATE_KEY      : clé privée EmailJS (Account → General → Private Key)
//   TWILIO_ACCOUNT_SID       : Account SID Twilio
//   TWILIO_AUTH_TOKEN        : Auth Token Twilio
//   TWILIO_FROM_NUMBER       : Numéro Twilio E.164 (+33...)

const { schedule } = require('@netlify/functions');
const admin = require('firebase-admin');

const EJS_SERVICE    = 'service_ipazk28';
const EJS_TPL_RAPPEL = 'Rappel AREPROG';
const EJS_PUBLIC_KEY = '5Lk7jHaGZ9YzEfM51';
const EJS_FROM_EMAIL = 'arthur@areprog.fr';
const STALE_RAPPEL_MS = 7 * 24 * 3600000;
const AVIS_DELAY_MS   = 24 * 3600000;   // 24h après le RDV
const AVIS_EXPIRE_MS  = 72 * 3600000;   // expire après 72h (évite les envois tardifs)

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

async function getSmsConfig(db) {
  try {
    const doc = await db.collection('config').doc('sms').get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    return {};
  }
}

async function logSms(db, entry) {
  try {
    await db.collection('sms_log').add(entry);
  } catch (e) {
    console.warn('sms_log write failed:', e.message);
  }
}

function formatPhone(tel) {
  if (!tel) return null;
  let t = tel.replace(/[\s.\-()]/g, '');
  if (t.startsWith('+')) return t;
  if (t.startsWith('0033')) return '+33' + t.slice(4);
  if (t.startsWith('0')) return '+33' + t.slice(1);
  return '+' + t;
}

async function sendTwilioSms(to, message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error('Variables Twilio manquantes');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body = new URLSearchParams({ From: from, To: to, Body: message });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(sid + ':' + token).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error('Twilio ' + res.status + ' : ' + (json.message || JSON.stringify(json)));
  return json.sid;
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
  if (rdv.fireISO) {
    const t = new Date(rdv.fireISO).getTime();
    return isNaN(t) ? null : t;
  }
  if (!rdv.date || !rdv.heure) return null;
  const t = new Date(rdv.date + 'T' + rdv.heure + ':00Z').getTime();
  return isNaN(t) ? null : t;
}

function buildEmailParams(rdv, minutes) {
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

function buildRappelSms(rdv, minutes) {
  const label = RAPPEL_LABELS[minutes] || (minutes + ' min avant');
  return `AREPROG — Rappel : votre RDV "${rdv.title || 'RDV'}" est ${label}.\n${rdv.date || ''}${rdv.heure ? ' à ' + rdv.heure : ''}${rdv.lieu ? ' — ' + rdv.lieu : ''}`;
}

function buildAvisSms(rdv, googleUrl) {
  return `Merci pour votre confiance chez AREPROG !\nVotre avis nous aide énormément :\n${googleUrl}`;
}

const handler = async () => {
  initFirebase();
  const db = admin.firestore();

  const [snapshot, smsConfig] = await Promise.all([
    db.collection('rdvs').get(),
    getSmsConfig(db),
  ]);

  const smsRappelEnabled  = smsConfig.rappel !== false;
  const smsAvisEnabled    = smsConfig.avis_google !== false;
  const googleReviewUrl   = smsConfig.google_review_url || '';

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

    // ── Rappels (email + SMS) ──────────────────────────────────
    const rappels = (rdv.rappels && rdv.rappels.length) ? rdv.rappels
      : (rdv.rappel && rdv.rappel > 0 ? [rdv.rappel] : []);

    if (rappels.length && fireBase !== null) {
      rdv.rappelsSent = rdv.rappelsSent || [];
      const phone = smsRappelEnabled ? formatPhone(rdv.clientTel) : null;

      for (const m of rappels) {
        if (rdv.rappelsSent.includes(m)) continue;
        const fire = fireBase - m * 60000;
        if (fire > now) continue;
        if (now - fire > STALE_RAPPEL_MS) {
          rdv.rappelsSent.push(m);
          dirty = true;
          continue;
        }

        // Email
        try {
          await sendEmailJS(buildEmailParams(rdv, m));
          rdv.rappelsSent.push(m);
          dirty = true;
          sent++;
        } catch (e) {
          console.error('Email rappel échoué rdv', rdv.id, 'min', m, e.message);
          errors++;
          continue; // On ne marque pas pour retry
        }

        // SMS (optionnel, ne bloque pas si échec)
        if (phone) {
          try {
            const smsSid = await sendTwilioSms(phone, buildRappelSms(rdv, m));
            await logSms(db, {
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              type: 'rappel',
              clientNom: rdv.clientNom || '',
              to: phone,
              rdvId: rdv.id,
              message: buildRappelSms(rdv, m),
              statut: 'envoyé',
              twilio_sid: smsSid,
              erreur: null,
            });
          } catch (e) {
            console.warn('SMS rappel échoué rdv', rdv.id, 'min', m, e.message);
            await logSms(db, {
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              type: 'rappel',
              clientNom: rdv.clientNom || '',
              to: phone,
              rdvId: rdv.id,
              message: buildRappelSms(rdv, m),
              statut: 'erreur',
              twilio_sid: null,
              erreur: e.message,
            });
          }
        }
      }
    }

    // ── Avis Google (SMS 24h après le RDV) ───────────────────
    if (
      smsAvisEnabled &&
      googleReviewUrl &&
      fireBase !== null &&
      !rdv.avisGoogleSent
    ) {
      const elapsed = now - fireBase;
      if (elapsed >= AVIS_DELAY_MS && elapsed < AVIS_EXPIRE_MS) {
        const phone = formatPhone(rdv.clientTel);
        if (phone) {
          const msg = buildAvisSms(rdv, googleReviewUrl);
          try {
            const smsSid = await sendTwilioSms(phone, msg);
            await logSms(db, {
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              type: 'avis_google',
              clientNom: rdv.clientNom || '',
              to: phone,
              rdvId: rdv.id,
              message: msg,
              statut: 'envoyé',
              twilio_sid: smsSid,
              erreur: null,
            });
            rdv.avisGoogleSent = true;
            dirty = true;
          } catch (e) {
            console.warn('SMS avis Google échoué rdv', rdv.id, e.message);
            await logSms(db, {
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              type: 'avis_google',
              clientNom: rdv.clientNom || '',
              to: phone,
              rdvId: rdv.id,
              message: msg,
              statut: 'erreur',
              twilio_sid: null,
              erreur: e.message,
            });
          }
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
