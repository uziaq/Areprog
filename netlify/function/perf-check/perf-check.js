// Netlify Function — proxy vers Google PageSpeed Insights
// GET /.netlify/functions/perf-check?path=/stage1&strategy=mobile
//
// Outil interne : mesure les Core Web Vitals et les scores Lighthouse d'une
// page du site, sans exposer le site à un usage de proxy ouvert. Le
// paramètre `path` est donc validé contre une liste blanche des pages
// publiques réelles (mêmes routes que _redirects / sitemap.xml) — jamais une
// URL arbitraire fournie par l'appelant.
//
// Env var optionnelle (Netlify dashboard) :
//   PAGESPEED_API_KEY : relève le plafond de requêtes/jour de l'API publique
//                        PageSpeed Insights (fonctionne aussi sans, en plus
//                        limité). https://developers.google.com/speed/docs/insights/v5/get-started

const SITE_ORIGIN = 'https://areprog.fr';

const ALLOWED_ORIGINS = ['https://areprog.fr', 'https://www.areprog.fr'];

// Pages publiques du site (mêmes routes propres que _redirects / sitemap.xml).
const ALLOWED_PATHS = [
  '/',
  '/diagnostic',
  '/diagnostic-vag',
  '/diagnostic-bmw',
  '/reprogrammation',
  '/stage1',
  '/stage2',
  '/conversion-e85',
  '/desactivation-egr',
  '/desactivation-fap',
  '/desactivation-adblue',
  '/optimisation-consommation',
  '/reprogrammation-boite-vitesse',
  '/vidange-boite-automatique',
  '/tarifs',
  '/simulateur',
  '/contact',
  '/rdv',
  '/about',
  '/faq',
  '/guide-reprogrammation-moteur',
  '/mentions-legales',
  '/politique-confidentialite',
  '/reprogrammation-moteur-bayonne',
  '/reprogrammation-moteur-biarritz',
  '/reprogrammation-moteur-anglet',
  '/reprogrammation-moteur-saint-jean-de-luz',
  '/reprogrammation-moteur-hendaye',
];

const AUDITS_OF_INTEREST = [
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
  'first-contentful-paint',
  'interactive',
];

function scoreOf(categories, key) {
  const c = categories && categories[key];
  return c && typeof c.score === 'number' ? Math.round(c.score * 100) : null;
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

  const qs = event.queryStringParameters || {};
  const path = qs.path || '/';
  const strategy = qs.strategy === 'desktop' ? 'desktop' : 'mobile';

  if (!ALLOWED_PATHS.includes(path)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Page inconnue — cet outil ne peut analyser que les pages publiques du site AREPROG.' }) };
  }

  const targetUrl = SITE_ORIGIN + (path === '/' ? '/' : path);
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', targetUrl);
  apiUrl.searchParams.set('strategy', strategy);
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach((c) => apiUrl.searchParams.append('category', c));
  if (process.env.PAGESPEED_API_KEY) apiUrl.searchParams.set('key', process.env.PAGESPEED_API_KEY);

  // PageSpeed Insights peut prendre 15-30s pour une page, surtout en mobile.
  // On borne l'attente pour renvoyer une vraie erreur plutôt qu'un timeout
  // muet côté plateforme.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  try {
    const res = await fetch(apiUrl.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('perf-check : PageSpeed API', res.status, txt.slice(0, 300));
      return { statusCode: 502, headers: cors, body: JSON.stringify({ error: 'PageSpeed Insights indisponible (HTTP ' + res.status + ').' }) };
    }

    const data = await res.json();
    const lh = data.lighthouseResult || {};
    const categories = lh.categories || {};
    const audits = lh.audits || {};

    const metrics = {};
    AUDITS_OF_INTEREST.forEach((id) => {
      const a = audits[id];
      if (a) metrics[id] = { value: a.displayValue || null, score: typeof a.score === 'number' ? Math.round(a.score * 100) : null };
    });

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        path,
        strategy,
        analyzedUrl: lh.finalUrl || targetUrl,
        fetchedAt: lh.fetchTime || new Date().toISOString(),
        scores: {
          performance: scoreOf(categories, 'performance'),
          accessibility: scoreOf(categories, 'accessibility'),
          bestPractices: scoreOf(categories, 'best-practices'),
          seo: scoreOf(categories, 'seo'),
        },
        metrics,
      }),
    };
  } catch (e) {
    clearTimeout(timeout);
    const timedOut = e.name === 'AbortError';
    console.error('perf-check : échec —', e.message);
    return {
      statusCode: timedOut ? 504 : 500,
      headers: cors,
      body: JSON.stringify({ error: timedOut ? 'Le scan a dépassé le délai (page lente ou API surchargée). Réessayez.' : 'Analyse impossible pour le moment.' }),
    };
  }
};
