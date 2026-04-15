/* ═══════════════════════════════════════════
   AREPROG — Admin Boutique (gestion-boutique)
   Auth : même projet Firebase que /gestion
   ═══════════════════════════════════════════ */

const FB_CONFIG = {
  apiKey:            "AIzaSyCAPjBtmwrcNUUg9Nlkn_2ltUa_P_90yV4",
  authDomain:        "areprog-devis.firebaseapp.com",
  projectId:         "areprog-devis",
  storageBucket:     "areprog-devis.firebasestorage.app",
  messagingSenderId: "1047582505562",
  appId:             "1:1047582505562:web:32cefe1cab9eeeb270f663",
};

let db = null;
let storage = null;

const CATEGORY_LABEL = {
  camera:'Caméra', regulateur:'Régulateur', navigation:'Navigation',
  diagnostic:'Diagnostic', module:'Module'
};
const PLACEHOLDER_BY_CATEGORY = {
  camera:     '/images/produits/placeholder-camera.svg',
  regulateur: '/images/produits/placeholder-regulateur.svg',
  navigation: '/images/produits/placeholder-navigation.svg',
  diagnostic: '/images/produits/placeholder-diagnostic.svg',
  module:     '/images/produits/placeholder-module.svg',
};

// État
let allProducts = [];     // source merge (JSON + Firestore)
let jsonProducts = [];
let firestoreProducts = {}; // map slug -> override
let currentEdit = null;   // slug en cours d'édition, ou null pour nouveau

/* ══ AUTH ══════════════════════════════════════ */
function $(id) { return document.getElementById(id); }

function setLoginLoading(loading) {
  const btn = $('login-btn');
  if (btn) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Connexion…' : 'Se connecter';
  }
}
function showLogin() {
  $('login-screen').style.display = 'flex';
  $('app').style.display = 'none';
}
function showApp() {
  $('login-screen').style.display = 'none';
  $('app').style.display = 'block';
  const u = firebase.auth().currentUser;
  if (u) $('user-email').textContent = u.email || '';
  bootAdmin();
}
async function doLogin() {
  const email = $('l-email').value.trim();
  const pass  = $('l-pass').value;
  $('login-error').textContent = '';
  if (!email || !pass) { $('login-error').textContent = 'Email et mot de passe requis.'; return; }
  setLoginLoading(true);
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
  } catch(e) {
    $('login-error').textContent = 'Connexion refusée : ' + (e.message || e.code || 'erreur');
    setLoginLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
  db = firebase.firestore();
  try { storage = firebase.storage(); } catch(e) { storage = null; }

  $('login-btn').onclick = doLogin;
  $('l-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('l-email').addEventListener('keydown', e => { if (e.key === 'Enter') $('l-pass').focus(); });
  $('logout-btn').onclick = () => firebase.auth().signOut();

  firebase.auth().onAuthStateChanged(user => {
    if (user) showApp();
    else { setLoginLoading(false); showLogin(); }
  });
});

/* ══ TABS ══════════════════════════════════════ */
function bindTabs() {
  document.querySelectorAll('.gb-tab').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.gb-tab').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.gb-tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === tab));
      if (tab === 'stats') renderStats();
      if (tab === 'reviews') renderReviewsAdmin();
    };
  });
}

/* ══ BOOT ══════════════════════════════════════ */
async function bootAdmin() {
  bindTabs();
  bindProductModal();
  bindFilters();
  setSync('Chargement du catalogue…');
  await loadCatalog();
  renderProducts();
  await refreshPendingBadge();
  setSync('Prêt.');
}

function setSync(msg) {
  $('sync-status').textContent = msg;
}

/* ══ CATALOGUE ═════════════════════════════════ */
async function loadCatalog() {
  // JSON
  try {
    const res = await fetch('/products.json', { cache: 'no-cache' });
    jsonProducts = await res.json();
  } catch(e) { jsonProducts = []; }

  // Firestore overrides + new products
  firestoreProducts = {};
  try {
    const snap = await db.collection('products').get();
    snap.forEach(d => { firestoreProducts[d.id] = Object.assign({ slug: d.id }, d.data()); });
  } catch(e) { console.warn('Firestore products load error', e); }

  // Merge
  const map = {};
  jsonProducts.forEach(p => { map[p.slug] = Object.assign({}, p, { _source: 'json' }); });
  Object.values(firestoreProducts).forEach(p => {
    map[p.slug] = Object.assign({}, map[p.slug] || {}, p, { _source: (map[p.slug] ? 'merged' : 'firestore') });
  });
  allProducts = Object.values(map);
}

function bindFilters() {
  $('p-search').addEventListener('input', renderProducts);
  $('p-filter-cat').addEventListener('change', renderProducts);
  $('p-new').onclick = () => openProductModal(null);
  $('rv-filter').addEventListener('change', renderReviewsAdmin);
  $('rv-search').addEventListener('input', renderReviewsAdmin);
}

function renderProducts() {
  const q = ($('p-search').value || '').toLowerCase().trim();
  const cat = $('p-filter-cat').value;
  const tbody = $('p-tbody');
  tbody.innerHTML = '';

  const list = allProducts
    .filter(p => !cat || p.category === cat)
    .filter(p => {
      if (!q) return true;
      const s = (p.name + ' ' + p.slug + ' ' + (p.desc || '') + ' ' + (p.compat || []).join(' ')).toLowerCase();
      return s.includes(q);
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td></td><td></td><td></td><td></td><td></td><td></td>
    `;
    const cells = tr.children;

    // image
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = p.imageUrl || PLACEHOLDER_BY_CATEGORY[p.category] || PLACEHOLDER_BY_CATEGORY.module;
    img.alt = '';
    cells[0].appendChild(img);

    // name
    const nameWrap = document.createElement('div');
    const strong = document.createElement('strong'); strong.textContent = p.name || '(sans nom)';
    const small = document.createElement('small'); small.style.color = 'var(--muted)';
    small.textContent = '/' + p.slug;
    nameWrap.appendChild(strong); nameWrap.appendChild(document.createElement('br')); nameWrap.appendChild(small);
    cells[1].appendChild(nameWrap);

    cells[2].textContent = CATEGORY_LABEL[p.category] || p.category || '—';
    cells[3].textContent = (p.priceLabel || ((p.price || 0) + ' €'));

    const status = document.createElement('span');
    const active = p.active !== false;
    status.className = 'gb-status ' + (active ? 'active' : 'inactive');
    status.textContent = active ? 'Actif' : 'Inactif';
    cells[4].appendChild(status);

    // actions
    const editBtn = document.createElement('button');
    editBtn.className = 'gb-btn gb-btn-ghost gb-btn-sm';
    editBtn.textContent = 'Éditer';
    editBtn.onclick = () => openProductModal(p.slug);

    const viewLink = document.createElement('a');
    viewLink.className = 'gb-btn gb-btn-ghost gb-btn-sm';
    viewLink.href = '/produit-vag/' + p.slug;
    viewLink.target = '_blank'; viewLink.rel = 'noopener';
    viewLink.textContent = 'Voir';

    cells[5].style.whiteSpace = 'nowrap';
    cells[5].appendChild(editBtn);
    cells[5].appendChild(document.createTextNode(' '));
    cells[5].appendChild(viewLink);

    tbody.appendChild(tr);
  });

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">Aucun produit</td></tr>';
  }
}

/* ══ MODAL PRODUIT ═════════════════════════════ */
function bindProductModal() {
  $('p-modal-close').onclick = closeProductModal;
  $('p-modal').querySelector('.gb-modal-bg').onclick = closeProductModal;

  $('f-img-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadProductImage(file);
  });
  $('f-img-url').addEventListener('input', (e) => {
    $('f-img-preview').src = e.target.value || PLACEHOLDER_BY_CATEGORY[$('f-category').value];
  });
  $('f-category').addEventListener('change', () => {
    if (!$('f-img-url').value) $('f-img-preview').src = PLACEHOLDER_BY_CATEGORY[$('f-category').value];
  });

  $('p-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });
  $('p-delete').onclick = async () => {
    if (!currentEdit) return;
    if (!confirm('Supprimer ce produit ? Les avis resteront en base mais le produit sera retiré du catalogue.')) return;
    try {
      await db.collection('products').doc(currentEdit).delete();
      await loadCatalog(); renderProducts();
      closeProductModal();
    } catch(err) {
      setFormStatus('Erreur suppression : ' + err.message, 'err');
    }
  };
}

function openProductModal(slug) {
  currentEdit = slug;
  $('p-modal-title').textContent = slug ? 'Éditer le produit' : 'Nouveau produit';
  $('p-delete').style.display = slug ? 'inline-block' : 'none';

  let p = slug ? allProducts.find(x => x.slug === slug) : null;
  p = p || { slug:'', category:'camera', name:'', price:0, desc:'', descExt:'', compat:[], imageUrl:'', badge:'', seoTitle:'', seoDesc:'', active:true };

  $('f-slug').value = p.slug || '';
  $('f-slug').readOnly = !!slug;
  $('f-category').value = p.category || 'camera';
  $('f-name').value = p.name || '';
  $('f-price').value = p.price || 0;
  $('f-badge').value = p.badge || '';
  $('f-desc').value = p.desc || '';
  $('f-descExt').value = p.descExt || '';
  $('f-compat').value = (p.compat || []).join(', ');
  $('f-img-url').value = p.imageUrl || '';
  $('f-img-preview').src = p.imageUrl || PLACEHOLDER_BY_CATEGORY[p.category];
  $('f-seoTitle').value = p.seoTitle || '';
  $('f-seoDesc').value = p.seoDesc || '';
  $('f-active').checked = p.active !== false;
  setFormStatus('', '');
  $('p-modal').style.display = 'flex';
}

function closeProductModal() {
  $('p-modal').style.display = 'none';
  currentEdit = null;
}

function setFormStatus(msg, cls) {
  const el = $('p-form-status');
  el.textContent = msg;
  el.className = 'gb-form-status ' + (cls || '');
}

async function uploadProductImage(file) {
  if (!storage) { setFormStatus('Storage non initialisé', 'err'); return; }
  const slug = ($('f-slug').value || 'tmp-' + Date.now()).replace(/[^a-z0-9-]/gi, '-');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = 'products/' + slug + '-' + Date.now() + '.' + ext;
  $('f-img-status').textContent = 'Upload en cours…';
  try {
    const ref = storage.ref().child(path);
    const task = await ref.put(file);
    const url = await task.ref.getDownloadURL();
    $('f-img-url').value = url;
    $('f-img-preview').src = url;
    $('f-img-status').textContent = 'Image uploadée ✓';
  } catch(err) {
    console.error(err);
    $('f-img-status').textContent = 'Échec upload : ' + err.message;
  }
}

async function saveProduct() {
  const slug = $('f-slug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!slug) { setFormStatus('Slug requis', 'err'); return; }
  const price = +$('f-price').value || 0;
  const payload = {
    slug,
    category: $('f-category').value,
    name: $('f-name').value.trim(),
    price,
    priceLabel: price + ' €',
    badge: $('f-badge').value.trim(),
    desc: $('f-desc').value.trim(),
    descExt: $('f-descExt').value.trim(),
    compat: $('f-compat').value.split(',').map(s => s.trim()).filter(Boolean),
    imageUrl: $('f-img-url').value.trim(),
    seoTitle: $('f-seoTitle').value.trim(),
    seoDesc: $('f-seoDesc').value.trim(),
    active: $('f-active').checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  try {
    await db.collection('products').doc(slug).set(payload, { merge: true });
    setFormStatus('Enregistré ✓', 'ok');
    await loadCatalog();
    renderProducts();
    setTimeout(closeProductModal, 600);
  } catch(err) {
    setFormStatus('Erreur enregistrement : ' + err.message, 'err');
  }
}

/* ══ AVIS (MODÉRATION) ═════════════════════════ */
async function refreshPendingBadge() {
  try {
    const snap = await db.collection('reviews').where('status','==','pending').get();
    $('badge-pending').textContent = snap.size;
  } catch(e) { $('badge-pending').textContent = '?'; }
}

async function renderReviewsAdmin() {
  const status = $('rv-filter').value;
  const q = ($('rv-search').value || '').toLowerCase().trim();
  const list = $('rv-list');
  list.innerHTML = '<div style="color:var(--muted);padding:1rem">Chargement…</div>';

  try {
    let query = db.collection('reviews');
    if (status !== 'all') query = query.where('status', '==', status);
    const snap = await query.get();
    const items = [];
    snap.forEach(d => items.push(Object.assign({ id: d.id }, d.data())));
    items.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });

    list.innerHTML = '';
    const productMap = Object.fromEntries(allProducts.map(p => [p.slug, p]));

    const filtered = items.filter(r => {
      if (!q) return true;
      const txt = ((r.authorName||'') + ' ' + (r.comment||'') + ' ' + (r.productId||'') + ' ' +
                   ((productMap[r.productId] || {}).name || '')).toLowerCase();
      return txt.includes(q);
    });

    if (!filtered.length) {
      list.innerHTML = '<div style="color:var(--muted);padding:2rem;text-align:center">Aucun avis pour ce filtre.</div>';
      return;
    }

    filtered.forEach(r => {
      const p = productMap[r.productId];
      const card = document.createElement('div');
      card.className = 'gb-review-card';

      const stars = '★★★★★☆☆☆☆☆'.slice(5 - (r.rating || 0), 10 - (r.rating || 0));
      const when = r.createdAt && r.createdAt.toDate
        ? r.createdAt.toDate().toLocaleString('fr-FR')
        : '—';

      const head = document.createElement('div');
      head.className = 'gb-review-head';
      const meta = document.createElement('div');
      meta.className = 'gb-review-meta';
      const strong = document.createElement('strong');
      strong.textContent = r.authorName || 'Client';
      meta.appendChild(strong);
      const small = document.createElement('small');
      const prodLink = document.createElement('a');
      prodLink.href = '/produit-vag/' + r.productId;
      prodLink.target = '_blank'; prodLink.rel = 'noopener';
      prodLink.style.color = 'var(--blue-light)';
      prodLink.textContent = p ? p.name : r.productId;
      small.appendChild(document.createTextNode(when + ' · '));
      small.appendChild(prodLink);
      meta.appendChild(small);
      head.appendChild(meta);
      const st = document.createElement('span');
      st.className = 'gb-status ' + (r.status === 'approved' ? 'active' : (r.status === 'rejected' ? 'inactive' : ''));
      st.textContent = r.status || 'pending';
      head.appendChild(st);
      card.appendChild(head);

      const starsEl = document.createElement('div');
      starsEl.className = 'gb-review-stars';
      starsEl.textContent = stars;
      card.appendChild(starsEl);

      const body = document.createElement('div');
      body.className = 'gb-review-body';
      body.textContent = r.comment || '';
      card.appendChild(body);

      if (r.adminReply) {
        const re = document.createElement('div');
        re.className = 'gb-review-existing-reply';
        re.innerHTML = '<strong>Réponse publiée :</strong> ';
        re.appendChild(document.createTextNode(r.adminReply));
        card.appendChild(re);
      }

      // Actions
      const act = document.createElement('div');
      act.className = 'gb-review-actions';

      const mkBtn = (label, cls, fn) => {
        const b = document.createElement('button');
        b.className = 'gb-btn ' + cls + ' gb-btn-sm';
        b.textContent = label; b.onclick = fn;
        return b;
      };
      if (r.status !== 'approved') act.appendChild(mkBtn('✓ Approuver', 'gb-btn-primary', () => updateReview(r.id, { status: 'approved' })));
      if (r.status !== 'rejected') act.appendChild(mkBtn('✗ Rejeter', 'gb-btn-danger', () => updateReview(r.id, { status: 'rejected' })));
      act.appendChild(mkBtn('Supprimer', 'gb-btn-ghost', () => {
        if (confirm('Supprimer définitivement cet avis ?')) deleteReview(r.id);
      }));
      card.appendChild(act);

      // Reply
      const reply = document.createElement('div');
      reply.className = 'gb-review-reply-box';
      const input = document.createElement('input');
      input.placeholder = 'Répondre publiquement…';
      input.value = r.adminReply || '';
      const btn = document.createElement('button');
      btn.className = 'gb-btn gb-btn-ghost gb-btn-sm';
      btn.textContent = 'Enregistrer réponse';
      btn.onclick = () => updateReview(r.id, { adminReply: input.value.trim() });
      reply.appendChild(input); reply.appendChild(btn);
      card.appendChild(reply);

      list.appendChild(card);
    });

  } catch(e) {
    list.innerHTML = '<div style="color:#ff8b95;padding:1rem">Erreur : ' + e.message + '</div>';
  }
}

async function updateReview(id, patch) {
  try {
    await db.collection('reviews').doc(id).set(Object.assign({}, patch, {
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }), { merge: true });
    await refreshPendingBadge();
    renderReviewsAdmin();
  } catch(e) { alert('Erreur : ' + e.message); }
}
async function deleteReview(id) {
  try {
    await db.collection('reviews').doc(id).delete();
    await refreshPendingBadge();
    renderReviewsAdmin();
  } catch(e) { alert('Erreur : ' + e.message); }
}

/* ══ STATS ═════════════════════════════════════ */
async function renderStats() {
  // Produits actifs
  const active = allProducts.filter(p => p.active !== false).length;
  $('s-active').textContent = active;

  // Avis & note moyenne
  let approved = [];
  try {
    const snap = await db.collection('reviews').where('status', '==', 'approved').get();
    snap.forEach(d => approved.push(d.data()));
  } catch(e) {}
  $('s-reviews').textContent = approved.length;
  const avg = approved.length ? (approved.reduce((s, r) => s + (r.rating || 0), 0) / approved.length) : 0;
  $('s-avg').textContent = approved.length ? avg.toFixed(2) + ' / 5' : '—';

  // Stats produits
  let stats = {};
  try {
    const snap = await db.collection('product_stats').get();
    snap.forEach(d => { stats[d.id] = d.data(); });
  } catch(e) {}
  let totalViews = 0, totalOrders = 0;
  Object.values(stats).forEach(s => {
    totalViews  += s.views || 0;
    totalOrders += s.orderClicks || 0;
  });
  $('s-views').textContent = totalViews;
  $('s-orders').textContent = totalOrders;

  // Top table
  const rows = allProducts.map(p => {
    const s = stats[p.slug] || {};
    return { p, views: s.views || 0, orders: s.orderClicks || 0 };
  }).sort((a, b) => b.views - a.views).slice(0, 20);

  const tbody = $('s-tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    const conv = r.views ? ((r.orders / r.views) * 100).toFixed(1) + ' %' : '—';
    const a = document.createElement('a');
    a.href = '/produit-vag/' + r.p.slug;
    a.target = '_blank'; a.rel = 'noopener';
    a.style.color = 'var(--blue-light)';
    a.textContent = r.p.name;
    const td1 = document.createElement('td'); td1.appendChild(a);
    const td2 = document.createElement('td'); td2.textContent = r.views;
    const td3 = document.createElement('td'); td3.textContent = r.orders;
    const td4 = document.createElement('td'); td4.textContent = conv;
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
    tbody.appendChild(tr);
  });
  if (!rows.length) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:2rem">Aucune donnée</td></tr>';
}
