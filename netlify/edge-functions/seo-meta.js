// Netlify Edge Function — injection SSR des meta tags SEO
// pour /codage-vag/:brand et /codage-vag/:brand/:model

const BRANDS = [
  { slug: 'volkswagen', name: 'Volkswagen' },
  { slug: 'audi',       name: 'Audi' },
  { slug: 'seat',       name: 'Seat' },
  { slug: 'cupra',      name: 'Cupra' },
  { slug: 'skoda',      name: 'Skoda' },
];

const MODELS = [
  // ── Volkswagen ──────────────────────────────────────────────
  { brandSlug: 'volkswagen', slug: 'golf-5',          name: 'Golf 5',             yearMin: 2003, yearMax: 2009 },
  { brandSlug: 'volkswagen', slug: 'golf-6',          name: 'Golf 6',             yearMin: 2008, yearMax: 2012 },
  { brandSlug: 'volkswagen', slug: 'golf-7',          name: 'Golf 7',             yearMin: 2012, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'golf-7-facelift', name: 'Golf 7.5 Facelift',  yearMin: 2017, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'golf-8',          name: 'Golf 8',             yearMin: 2019, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'golf-8-gte',      name: 'Golf 8 GTE',         yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'golf-variant-7',  name: 'Golf Variant 7',     yearMin: 2013, yearMax: 2020 },
  { brandSlug: 'volkswagen', slug: 'golf-variant-8',  name: 'Golf Variant 8',     yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'golf-gti-7',      name: 'Golf GTI 7',         yearMin: 2013, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'golf-gti-8',      name: 'Golf GTI 8',         yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'golf-r-7',        name: 'Golf R 7',           yearMin: 2013, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'golf-r-8',        name: 'Golf R 8',           yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'golf-sportsvan',  name: 'Golf Sportsvan',     yearMin: 2014, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'polo-5',          name: 'Polo 5',             yearMin: 2009, yearMax: 2017 },
  { brandSlug: 'volkswagen', slug: 'polo-6',          name: 'Polo 6',             yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'polo-gti-6',      name: 'Polo GTI 6',         yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 't-cross',         name: 'T-Cross',            yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'taigo',           name: 'Taigo',              yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 't-roc',           name: 'T-Roc',              yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 't-roc-r',         name: 'T-Roc R',            yearMin: 2019, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'tiguan-1',        name: 'Tiguan 1',           yearMin: 2007, yearMax: 2016 },
  { brandSlug: 'volkswagen', slug: 'tiguan-2',        name: 'Tiguan 2',           yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'tiguan-allspace', name: 'Tiguan Allspace',    yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'touran-1',        name: 'Touran 1',           yearMin: 2003, yearMax: 2015 },
  { brandSlug: 'volkswagen', slug: 'touran-2',        name: 'Touran 2',           yearMin: 2015, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'passat-7',        name: 'Passat 7 (B7)',      yearMin: 2010, yearMax: 2014 },
  { brandSlug: 'volkswagen', slug: 'passat-8',        name: 'Passat 8 (B8)',      yearMin: 2014, yearMax: 2023 },
  { brandSlug: 'volkswagen', slug: 'arteon',          name: 'Arteon',             yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'scirocco',        name: 'Scirocco',           yearMin: 2008, yearMax: 2017 },
  { brandSlug: 'volkswagen', slug: 'caddy-5',         name: 'Caddy 5',            yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'multivan-t7',     name: 'Multivan T7',        yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'touareg-3',       name: 'Touareg 3',          yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'id3',             name: 'ID.3',               yearMin: 2019, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'id4',             name: 'ID.4',               yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'id5',             name: 'ID.5',               yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'id-buzz',         name: 'ID. Buzz',           yearMin: 2022, yearMax: 2024 },
  { brandSlug: 'volkswagen', slug: 'up',              name: 'Up!',                yearMin: 2011, yearMax: 2023 },
  { brandSlug: 'volkswagen', slug: 'jetta-6',         name: 'Jetta 6',            yearMin: 2011, yearMax: 2018 },
  { brandSlug: 'volkswagen', slug: 'sharan-2',        name: 'Sharan 2',           yearMin: 2010, yearMax: 2022 },
  { brandSlug: 'volkswagen', slug: 'beetle',          name: 'Beetle',             yearMin: 2011, yearMax: 2019 },
  { brandSlug: 'volkswagen', slug: 'amarok',          name: 'Amarok',             yearMin: 2010, yearMax: 2022 },

  // ── Audi ────────────────────────────────────────────────────
  { brandSlug: 'audi', slug: 'a1-8x',    name: 'A1 (8X)',           yearMin: 2010, yearMax: 2018 },
  { brandSlug: 'audi', slug: 'a1-gb',    name: 'A1 (GB)',           yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a3-8p',    name: 'A3 (8P)',           yearMin: 2003, yearMax: 2013 },
  { brandSlug: 'audi', slug: 'a3-8v',    name: 'A3 (8V)',           yearMin: 2012, yearMax: 2020 },
  { brandSlug: 'audi', slug: 'a3-8y',    name: 'A3 (8Y)',           yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'audi', slug: 's3-8p',    name: 'S3 (8P)',           yearMin: 2006, yearMax: 2013 },
  { brandSlug: 'audi', slug: 's3-8v',    name: 'S3 (8V)',           yearMin: 2013, yearMax: 2020 },
  { brandSlug: 'audi', slug: 's3-8y',    name: 'S3 (8Y)',           yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'rs3-8v',   name: 'RS3 (8V)',          yearMin: 2015, yearMax: 2020 },
  { brandSlug: 'audi', slug: 'rs3-8y',   name: 'RS3 (8Y)',          yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'tt-8s',    name: 'TT (8S)',           yearMin: 2014, yearMax: 2023 },
  { brandSlug: 'audi', slug: 'q2-ga',    name: 'Q2 (GA)',           yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'q3-8u',    name: 'Q3 1ère gen (8U)',  yearMin: 2011, yearMax: 2018 },
  { brandSlug: 'audi', slug: 'q3-f3',    name: 'Q3 2ème gen (F3)',  yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a4-b8',    name: 'A4 (B8)',           yearMin: 2007, yearMax: 2015 },
  { brandSlug: 'audi', slug: 'a4-b9',    name: 'A4 (B9)',           yearMin: 2015, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a5-8t',    name: 'A5 (8T)',           yearMin: 2007, yearMax: 2017 },
  { brandSlug: 'audi', slug: 'a5-f5',    name: 'A5 (F5)',           yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'q5-8r',    name: 'Q5 1ère gen (8R)',  yearMin: 2008, yearMax: 2017 },
  { brandSlug: 'audi', slug: 'q5-fy',    name: 'Q5 (FY)',           yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'sq5-fy',   name: 'SQ5 (FY)',          yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a6-c7',    name: 'A6 (C7)',           yearMin: 2011, yearMax: 2018 },
  { brandSlug: 'audi', slug: 'a6-c8',    name: 'A6 (C8)',           yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a7-4k',    name: 'A7 (4K)',           yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'a8-d5',    name: 'A8 (D5)',           yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'q7-4m',    name: 'Q7 (4M)',           yearMin: 2015, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'q8-4m',    name: 'Q8 (4M)',           yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'q4-etron', name: 'Q4 e-tron',         yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'audi', slug: 'etron',    name: 'e-tron (GE)',        yearMin: 2018, yearMax: 2023 },

  // ── Seat ────────────────────────────────────────────────────
  { brandSlug: 'seat', slug: 'ibiza-6j',  name: 'Ibiza 6J',      yearMin: 2008, yearMax: 2017 },
  { brandSlug: 'seat', slug: 'ibiza-kj',  name: 'Ibiza 6F (KJ)', yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'seat', slug: 'arona',     name: 'Arona',         yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'seat', slug: 'leon-5f',   name: 'Leon 5F',       yearMin: 2012, yearMax: 2020 },
  { brandSlug: 'seat', slug: 'leon-4',    name: 'Leon 4 (KL)',   yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'seat', slug: 'ateca',     name: 'Ateca',         yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'seat', slug: 'tarraco',   name: 'Tarraco',       yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'seat', slug: 'alhambra',  name: 'Alhambra 2',    yearMin: 2010, yearMax: 2020 },
  { brandSlug: 'seat', slug: 'altea',     name: 'Altea / XL',    yearMin: 2004, yearMax: 2015 },
  { brandSlug: 'seat', slug: 'toledo-4',  name: 'Toledo 4',      yearMin: 2013, yearMax: 2019 },
  { brandSlug: 'seat', slug: 'mii',       name: 'Mii',           yearMin: 2011, yearMax: 2021 },

  // ── Cupra ───────────────────────────────────────────────────
  { brandSlug: 'cupra', slug: 'leon',      name: 'Cupra Leon',      yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'cupra', slug: 'formentor', name: 'Cupra Formentor', yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'cupra', slug: 'ateca',     name: 'Cupra Ateca',     yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'cupra', slug: 'born',      name: 'Cupra Born',      yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'cupra', slug: 'tavascan',  name: 'Cupra Tavascan',  yearMin: 2024, yearMax: 2025 },
  { brandSlug: 'cupra', slug: 'terramar',  name: 'Cupra Terramar',  yearMin: 2024, yearMax: 2025 },

  // ── Skoda ───────────────────────────────────────────────────
  { brandSlug: 'skoda', slug: 'citigo',    name: 'Citigo',          yearMin: 2011, yearMax: 2019 },
  { brandSlug: 'skoda', slug: 'fabia-2',   name: 'Fabia 2 (5J)',    yearMin: 2006, yearMax: 2014 },
  { brandSlug: 'skoda', slug: 'fabia-3',   name: 'Fabia 3 (NJ)',    yearMin: 2014, yearMax: 2021 },
  { brandSlug: 'skoda', slug: 'fabia-4',   name: 'Fabia 4 (PJ)',    yearMin: 2021, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'rapid',     name: 'Rapid (NH)',      yearMin: 2012, yearMax: 2019 },
  { brandSlug: 'skoda', slug: 'scala',     name: 'Scala',           yearMin: 2018, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'kamiq',     name: 'Kamiq',           yearMin: 2019, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'octavia-3', name: 'Octavia 3 (5E)',  yearMin: 2012, yearMax: 2020 },
  { brandSlug: 'skoda', slug: 'octavia-4', name: 'Octavia 4 (NX5)', yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'superb-3',  name: 'Superb 3 (3V)',   yearMin: 2015, yearMax: 2023 },
  { brandSlug: 'skoda', slug: 'superb-4',  name: 'Superb 4',        yearMin: 2024, yearMax: 2025 },
  { brandSlug: 'skoda', slug: 'karoq',     name: 'Karoq',           yearMin: 2017, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'kodiaq',    name: 'Kodiaq',          yearMin: 2016, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'kodiaq-2',  name: 'Kodiaq 2',        yearMin: 2023, yearMax: 2025 },
  { brandSlug: 'skoda', slug: 'kodiaq-rs', name: 'Kodiaq RS',       yearMin: 2018, yearMax: 2023 },
  { brandSlug: 'skoda', slug: 'enyaq',     name: 'Enyaq',           yearMin: 2020, yearMax: 2024 },
  { brandSlug: 'skoda', slug: 'yeti',      name: 'Yeti (5L)',       yearMin: 2009, yearMax: 2017 },
];

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  // parts[0] = 'codage-vag', parts[1] = brandSlug, parts[2] = modelSlug

  if (parts.length < 2) return context.next();

  const brandSlug = parts[1];
  const modelSlug = parts[2] || null;

  const brand = BRANDS.find(b => b.slug === brandSlug);
  if (!brand) return context.next();

  const response = await context.next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  let html = await response.text();

  let title, desc, canonical;

  if (modelSlug) {
    const model = MODELS.find(m => m.brandSlug === brandSlug && m.slug === modelSlug);
    if (!model) return new Response(html, { status: response.status, headers: response.headers });

    canonical = `https://areprog.fr/codage-vag/${brandSlug}/${modelSlug}`;
    title     = `Codage ${brand.name} ${model.name} (${model.yearMin}–${model.yearMax}) — Options cachées | AREPROG`;
    desc      = `Activez les options cachées de votre ${brand.name} ${model.name} (${model.yearMin}–${model.yearMax}). Régulateur de vitesse, caméra de recul, éclairage ambiant et plus — codage VCDS à domicile, Pays Basque & 64. Devis gratuit.`;
  } else {
    const modelCount = MODELS.filter(m => m.brandSlug === brandSlug).length;
    canonical = `https://areprog.fr/codage-vag/${brandSlug}`;
    title     = `Codage ${brand.name} — Options cachées VAG | AREPROG`;
    desc      = `Activez les options cachées de votre ${brand.name}. ${modelCount} modèles supportés, codage VCDS professionnel à domicile — Pays Basque, 64, Yonne. Devis gratuit sous 24h.`;
  }

  const t = esc(title);
  const d = esc(desc);
  const c = esc(canonical);

  html = html
    .replace(/<title>[^<]*<\/title>/,               `<title>${t}</title>`)
    .replace(/<link\s+rel="canonical"[^>]*>/,        `<link rel="canonical" id="canonical-url" href="${c}"/>`)
    .replace(/<meta\s+name="description"[^>]*>/,     `<meta name="description" content="${d}"/>`)
    .replace(/<meta[^>]*id="og-title"[^>]*>/,        `<meta id="og-title" property="og:title" content="${t}"/>`)
    .replace(/<meta[^>]*id="og-description"[^>]*>/,  `<meta id="og-description" property="og:description" content="${d}"/>`)
    .replace(/<meta[^>]*id="og-url"[^>]*>/,          `<meta id="og-url" property="og:url" content="${c}"/>`);

  return new Response(html, { status: response.status, headers: response.headers });
}
