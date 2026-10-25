// Netlify Function — vrais avis Google de la fiche AREPROG
// GET /.netlify/functions/google-avis
//
// Lit la note, le nombre d'avis et les avis de la fiche Google via l'API
// Places (New) et les renvoie à la page d'accueil (section « Ce que disent
// nos clients »). Aucun paramètre fourni par l'appelant : la fiche
// interrogée est fixée par GOOGLE_PLACE_ID (pas de proxy ouvert).
//
// La réponse est mise en cache 24 h sur le CDN Netlify : environ un appel
// Google par jour, ce qui reste dans le crédit gratuit mensuel de l'API.
//
// Env vars requises (Netlify dashboard) :
//   GOOGLE_PLACES_API_KEY : clé Google Cloud avec « Places API (New) » activée
//   GOOGLE_PLACE_ID       : Place ID de la fiche AREPROG (Place ID Finder)
//
// Google ne renvoie que 5 avis au maximum (les « plus pertinents »).

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

// Les avis qui parlent de suppression antipollution ne sont pas repris sur
// le site : en faire la publicité est interdit (art. L318-3 Code de la route).
const EXCLUS = /\b(egr|fap|adblue|ad blue|antipollution|anti-pollution|catalyseur|scr|dpf|contr[ôo]le technique|ct)\b/i;

function avisPublic(r) {
  const texte = ((r.originalText || r.text || {}).text || '').trim();
  const auteur = r.authorAttribution || {};
  return {
    auteur: auteur.displayName || 'Client Google',
    photo: auteur.photoUri || null,
    lienAuteur: auteur.uri || null,
    note: r.rating || 0,
    texte,
    date: r.relativePublishTimeDescription || '',
    publieLe: r.publishTime || null,
    lien: r.googleMapsUri || null,
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    console.error('google-avis : GOOGLE_PLACES_API_KEY ou GOOGLE_PLACE_ID manquant');
    return { statusCode: 503, headers: cors, body: JSON.stringify({ error: 'Avis Google non configurés.' }) };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId) + '?languageCode=fr', {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('google-avis : Places API', res.status, txt.slice(0, 300));
      return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'Avis Google indisponibles (HTTP ' + res.status + ').' }) };
    }

    const data = await res.json();
    const avis = (data.reviews || [])
      .map(avisPublic)
      .filter((a) => a.note >= 4 && a.texte && !EXCLUS.test(a.texte));

    return {
      statusCode: 200,
      headers: {
        ...cors,
        'Cache-Control': 'public, max-age=3600',
        'Netlify-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
      body: JSON.stringify({
        rating: typeof data.rating === 'number' ? data.rating : null,
        total: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
        mapsUrl: data.googleMapsUri || null,
        avis,
      }),
    };
  } catch (e) {
    clearTimeout(timeout);
    console.error('google-avis : échec —', e.message);
    return { statusCode: e.name === 'AbortError' ? 504 : 500, headers: cors, body: JSON.stringify({ error: 'Avis Google indisponibles.' }) };
  }
};
