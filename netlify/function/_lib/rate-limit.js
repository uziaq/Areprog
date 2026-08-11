// Limite de débit basique par IP, appuyée sur Firestore — partagée entre les
// fonctions publiques qui écrivent des données (lead-capture, rdv-booking).
// Le champ leurre (honeypot) arrête les robots qui remplissent tout le
// formulaire ; ceci arrête les scripts qui l'ignorent et soumettent en boucle.

function clientIp(event) {
  const h = event.headers || {};
  return (
    h['x-nf-client-connection-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  );
}

// À appeler avant tout traitement coûteux. `db` : instance Firestore déjà
// initialisée par l'appelant. `bucket` : nom de la fonction appelante, pour
// isoler les compteurs entre fonctions. Renvoie { limited: boolean } — une
// panne du limiteur laisse toujours passer la vraie demande client plutôt
// que de la bloquer.
async function checkRateLimit(db, event, bucket, opts) {
  const max = (opts && opts.max) || 8;
  const windowMs = (opts && opts.windowMs) || 10 * 60 * 1000; // 10 min

  const ip = clientIp(event);
  if (ip === 'unknown') return { limited: false };

  const docId = (bucket + '_' + ip).replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 140);
  const ref = db.collection('rateLimits').doc(docId);

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();
      const data = snap.exists ? snap.data() : null;

      if (!data || (now - data.windowStart) > windowMs) {
        tx.set(ref, { windowStart: now, count: 1, updatedAt: now });
        return { limited: false };
      }
      if (data.count >= max) {
        return { limited: true };
      }
      tx.set(ref, { windowStart: data.windowStart, count: data.count + 1, updatedAt: now }, { merge: true });
      return { limited: false };
    });
  } catch (e) {
    console.warn(bucket + ' : rate-limit indisponible, on laisse passer —', e.message);
    return { limited: false };
  }
}

module.exports = { checkRateLimit, clientIp };
