/* ═══════════════════════════════════════════
   AREPROG — Fiche produit (logique)
   Source de vérité : /products.json (+ overrides Firestore)
   Avis clients    : Firestore collection "reviews"
   Stats           : Firestore collection "product_stats"
   ═══════════════════════════════════════════ */

const FB_CONFIG = {
  apiKey:            "AIzaSyCAPjBtmwrcNUUg9Nlkn_2ltUa_P_90yV4",
  authDomain:        "areprog-devis.firebaseapp.com",
  projectId:         "areprog-devis",
  storageBucket:     "areprog-devis.firebasestorage.app",
  messagingSenderId: "1047582505562",
  appId:             "1:1047582505562:web:32cefe1cab9eeeb270f663",
};

const CATEGORY_LABEL = {
  camera:      'Caméra recul',
  regulateur:  'Régulateur',
  navigation:  'Navigation',
  diagnostic:  'Diagnostic',
  module:      'Module'
};

const PLACEHOLDER_BY_CATEGORY = {
  camera:     '/images/produits/placeholder-camera.svg',
  regulateur: '/images/produits/placeholder-regulateur.svg',
  navigation: '/images/produits/placeholder-navigation.svg',
  diagnostic: '/images/produits/placeholder-diagnostic.svg',
  module:     '/images/produits/placeholder-module.svg',
};

let db = null;
let currentProduct = null;
let selectedRating = 5;

/* ── Routing : récupérer le slug ─────────────── */
function getSlug() {
  // 1. /produit-vag/:slug (rewrite Netlify)
  const m = window.location.pathname.match(/\/produit-vag\/([a-z0-9-]+)/i);
  if (m) return m[1];
  // 2. ?slug=xxx
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('slug')) return qs.get('slug');
  return null;
}

/* ── Init Firebase ───────────────────────────── */
function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    db = firebase.firestore();
  } catch(e) {
    console.warn('Firebase init failed:', e);
    db = null;
  }
}

/* ── Charger le catalogue ────────────────────── */
async function loadProducts() {
  const res = await fetch('/products.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('products.json indisponible');
  return res.json();
}

async function loadProductOverride(slug) {
  if (!db) return null;
  try {
    const snap = await db.collection('products').doc(slug).get();
    return snap.exists ? snap.data() : null;
  } catch(e) { return null; }
}

/* ── Rendu ───────────────────────────────────── */
function renderNotFound() {
  document.getElementById('produit-layout').style.display = 'none';
  document.getElementById('produit-notfound').style.display = 'block';
  document.getElementById('produit-reviews').style.display = 'none';
  document.getElementById('produit-related').style.display = 'none';
  document.title = 'Produit introuvable — AREPROG';
}

function renderProduct(p) {
  currentProduct = p;
  document.getElementById('produit-layout').style.display = 'grid';

  // Image
  const img = document.getElementById('produit-image');
  img.src = p.imageUrl || PLACEHOLDER_BY_CATEGORY[p.category] || PLACEHOLDER_BY_CATEGORY.module;
  img.alt = p.name;

  // Textes
  document.getElementById('bc-category').textContent = CATEGORY_LABEL[p.category] || 'Produit';
  const badge = document.getElementById('produit-cat-badge');
  badge.textContent = p.badge || CATEGORY_LABEL[p.category] || '';
  badge.classList.add(p.category);

  document.getElementById('produit-name').textContent = p.name;
  document.getElementById('produit-desc').textContent = p.desc;
  const dext = document.getElementById('produit-desc-ext');
  if (p.descExt) { dext.textContent = p.descExt; } else { dext.style.display = 'none'; }

  // Compat
  const compatBox = document.getElementById('produit-compat');
  compatBox.innerHTML = '';
  (p.compat || []).forEach(c => {
    const sp = document.createElement('span');
    sp.className = 'boutique-compat-tag';
    sp.textContent = c;
    compatBox.appendChild(sp);
  });

  // Prix
  document.getElementById('produit-price').textContent = (p.priceLabel || (p.price + ' €'));

  // CTA
  document.getElementById('produit-cta').onclick = () => showContactModal(p.name, p.price);

  // SEO dynamique
  document.title = (p.seoTitle || (p.name + ' — AREPROG')) + ' | AREPROG';
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', (p.seoDesc || p.desc).slice(0, 160));
  const can = document.querySelector('link[rel="canonical"]');
  if (can) can.setAttribute('href', 'https://areprog.fr/produit-vag/' + p.slug);

  // OG
  const setMeta = (prop, content) => {
    const tag = document.querySelector(`meta[property="${prop}"]`);
    if (tag) tag.setAttribute('content', content);
  };
  setMeta('og:title', p.name + ' — AREPROG');
  setMeta('og:description', (p.seoDesc || p.desc).slice(0, 200));
  setMeta('og:url', 'https://areprog.fr/produit-vag/' + p.slug);
  if (p.imageUrl) setMeta('og:image', p.imageUrl);
}

function renderProductJsonLd(p, reviews) {
  const approved = (reviews || []).filter(r => r.status === 'approved');
  const count = approved.length;
  const avg = count ? (approved.reduce((s, r) => s + (r.rating || 0), 0) / count) : 0;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "description": p.desc,
    "category": CATEGORY_LABEL[p.category] || p.category,
    "image": p.imageUrl
      ? ['https://areprog.fr' + (p.imageUrl.startsWith('/') ? p.imageUrl : '/' + p.imageUrl)]
      : ['https://areprog.fr' + PLACEHOLDER_BY_CATEGORY[p.category]],
    "brand": { "@type": "Brand", "name": "AREPROG" },
    "offers": {
      "@type": "Offer",
      "price": p.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://areprog.fr/produit-vag/" + p.slug,
      "seller": { "@type": "LocalBusiness", "name": "AREPROG" }
    }
  };

  if (count > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avg.toFixed(1),
      "reviewCount": count,
      "bestRating": 5, "worstRating": 1
    };
    ld.review = approved.slice(0, 10).map(r => ({
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5 },
      "author": { "@type": "Person", "name": r.authorName || 'Client' },
      "reviewBody": r.comment || '',
      "datePublished": r.createdAt && r.createdAt.toDate
        ? r.createdAt.toDate().toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    }));
  }
  document.getElementById('ld-product').textContent = JSON.stringify(ld);
}

/* ── Avis ─────────────────────────────────── */
function starsStr(n) {
  n = Math.round(n || 0);
  return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
}

async function loadReviews(slug) {
  if (!db) return [];
  try {
    const snap = await db.collection('reviews')
      .where('productId', '==', slug)
      .get();
    const items = [];
    snap.forEach(d => items.push(Object.assign({ id: d.id }, d.data())));
    // Tri côté client (desc)
    items.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    return items;
  } catch(e) {
    console.warn('loadReviews failed', e);
    return [];
  }
}

function renderReviews(reviews) {
  document.getElementById('produit-reviews').style.display = 'block';
  const approved = reviews.filter(r => r.status === 'approved');
  const list = document.getElementById('produit-reviews-list');
  const summary = document.getElementById('produit-reviews-summary');
  const stars = document.getElementById('produit-stars');
  const count = document.getElementById('produit-rating-count');

  if (!approved.length) {
    list.innerHTML = '<div class="produit-reviews-empty">Aucun avis pour le moment. Soyez le premier à donner votre retour.</div>';
    summary.textContent = 'Aucun avis publié';
    stars.textContent = '☆☆☆☆☆';
    count.textContent = 'Aucun avis';
    return;
  }

  const avg = approved.reduce((s, r) => s + (r.rating || 0), 0) / approved.length;
  stars.textContent = starsStr(avg);
  stars.setAttribute('aria-label', avg.toFixed(1) + ' sur 5');
  count.textContent = approved.length + ' avis · ' + avg.toFixed(1) + '/5';
  summary.textContent = approved.length + ' avis publiés · Note moyenne ' + avg.toFixed(1) + '/5';

  list.innerHTML = '';
  approved.forEach(r => {
    const el = document.createElement('article');
    el.className = 'produit-review';
    const dt = r.createdAt && r.createdAt.toDate ? r.createdAt.toDate() : null;
    const when = dt ? dt.toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' }) : '';
    el.innerHTML = `
      <div class="produit-review-head">
        <span class="produit-review-author"></span>
        <span class="produit-review-date"></span>
      </div>
      <div class="produit-review-stars"></div>
      <div class="produit-review-comment"></div>
    `;
    el.querySelector('.produit-review-author').textContent = r.authorName || 'Client';
    el.querySelector('.produit-review-date').textContent = when;
    el.querySelector('.produit-review-stars').textContent = starsStr(r.rating);
    el.querySelector('.produit-review-comment').textContent = r.comment || '';
    if (r.adminReply) {
      const reply = document.createElement('div');
      reply.className = 'produit-review-reply';
      reply.innerHTML = '<strong>Réponse AREPROG :</strong> ';
      reply.appendChild(document.createTextNode(r.adminReply));
      el.appendChild(reply);
    }
    list.appendChild(el);
  });
}

/* ── Soumission d'avis ────────────────────── */
function bindReviewForm(slug) {
  const stars = document.getElementById('rv-stars');
  stars.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = +btn.dataset.val;
      selectedRating = v;
      stars.dataset.value = v;
      stars.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i + 1) <= v));
    });
  });
  // init visuel
  stars.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i + 1) <= selectedRating));

  const form = document.getElementById('produit-review-form');
  const statusEl = document.getElementById('rv-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = ''; statusEl.className = 'produit-review-form-status';
    const name = document.getElementById('rv-name').value.trim();
    const comment = document.getElementById('rv-comment').value.trim();
    if (!name || !comment) return;
    if (!db) {
      statusEl.textContent = 'Service temporairement indisponible.';
      statusEl.classList.add('err');
      return;
    }
    try {
      document.getElementById('rv-submit').disabled = true;
      await db.collection('reviews').add({
        productId: slug,
        authorName: name,
        rating: selectedRating,
        comment: comment,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      statusEl.textContent = 'Merci ! Votre avis sera publié après modération.';
      statusEl.classList.add('ok');
    } catch(err) {
      console.warn(err);
      statusEl.textContent = 'Échec de l\'envoi. Réessayez plus tard.';
      statusEl.classList.add('err');
    } finally {
      document.getElementById('rv-submit').disabled = false;
    }
  });
}

/* ── Produits liés ────────────────────────── */
function renderRelated(all, current) {
  const sameCat = all.filter(p => p.category === current.category && p.slug !== current.slug).slice(0, 6);
  if (!sameCat.length) return;
  document.getElementById('produit-related').style.display = 'block';
  const grid = document.getElementById('produit-related-grid');
  grid.innerHTML = '';
  sameCat.forEach(p => {
    const a = document.createElement('a');
    a.className = 'produit-related-card';
    a.href = '/produit-vag/' + p.slug;
    a.innerHTML = '<div class="n"></div><div class="p"></div>';
    a.querySelector('.n').textContent = p.name;
    a.querySelector('.p').textContent = p.priceLabel || (p.price + ' €');
    grid.appendChild(a);
  });
}

/* ── Stats (vues / commandes) ─────────────── */
async function trackView(slug) {
  if (!db) return;
  try {
    const ref = db.collection('product_stats').doc(slug);
    await ref.set({
      views: firebase.firestore.FieldValue.increment(1),
      lastViewed: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch(e) { /* silencieux */ }
}

async function trackOrderClick(slug) {
  if (!db) return;
  try {
    const ref = db.collection('product_stats').doc(slug);
    await ref.set({
      orderClicks: firebase.firestore.FieldValue.increment(1),
      lastOrderClick: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch(e) {}
}

/* ── Modal contact ─────────────────────────── */
function showContactModal(name, price) {
  document.getElementById('modal-product-name').textContent = name + ' — ' + price + ' €';
  document.getElementById('contact-modal').style.display = 'flex';
  if (currentProduct) trackOrderClick(currentProduct.slug);
}
function closeContactModal() {
  document.getElementById('contact-modal').style.display = 'none';
}
window.showContactModal = showContactModal;
window.closeContactModal = closeContactModal;

/* ── Bootstrap ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initFirebase();

  const slug = getSlug();
  if (!slug) { renderNotFound(); return; }

  let products = [];
  try { products = await loadProducts(); } catch(e) { renderNotFound(); return; }

  let p = products.find(x => x.slug === slug);
  if (!p) { renderNotFound(); return; }

  // Overrides depuis Firestore (prix/desc/image édités par l'admin)
  const override = await loadProductOverride(slug);
  if (override) p = Object.assign({}, p, override);
  if (p.active === false) { renderNotFound(); return; }

  renderProduct(p);

  const reviews = await loadReviews(slug);
  renderReviews(reviews);
  renderProductJsonLd(p, reviews);
  bindReviewForm(slug);
  renderRelated(products, p);
  trackView(slug);
});
