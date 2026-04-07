/* ═══════════════════════════════════════════
   AREPROG — Codage VAG App v1.0
   Wizard 3 étapes + panier + upsell + Firebase
   ═══════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyCAPjBtmwrcNUUg9Nlkn_2ltUa_P_90yV4",
  authDomain: "areprog-devis.firebaseapp.com",
  projectId: "areprog-devis",
  storageBucket: "areprog-devis.firebasestorage.app",
  messagingSenderId: "1047582505562",
  appId: "1:1047582505562:web:32cefe1cab9eeeb270f663",
  measurementId: "G-L3DVK09YSV"
};
const VCApp = (() => {

  // ── État global ──────────────────────────────
  const state = {
    step: 1,
    selectedBrand:  null,
    selectedModel:  null,
    selectedYear:   null,
    cart:           [],
    activeCategory: 'all',
    expandedOption: null,
    upsellTimeout:  null
  };

  let db = null;

  // ── Init Firebase ──────────────────────────
  function initFirebase() {
    try {
      if (window.firebase) {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
      }
    } catch(e) {
      console.warn('Firebase non disponible — mode offline');
    }
  }

  // ── Utilitaires ────────────────────────────
  function qs(id)  { return document.getElementById(id); }
  function fmt(n)  { return n.toFixed(0) + ' €'; }

  function getBrandById(id)  { return VAG.BRANDS.find(b => b.id === id); }
  function getModelById(id)  { return VAG.MODELS.find(m => m.id === id); }
  function getOptionById(id) { return VAG.OPTIONS.find(o => o.id === id); }

  function modelsForBrand(brandId) {
    return VAG.MODELS.filter(m => m.brandId === brandId);
  }

  function catLabel(catId) {
    const c = VAG.CATEGORIES.find(c => c.id === catId);
    return c ? c.label : catId;
  }

  // ── Compatibilité ──────────────────────────
  function isCompatible(opt) {
    if (!opt.active) return false;
    const m = state.selectedModel;
    if (!m) return true;
    const { models, platforms, yearMin, yearMax } = opt.compatible;
    if (models && models.length > 0 && !models.includes(m.id)) return false;
    if (platforms && platforms.length > 0 && !platforms.includes(m.platform)) return false;
    if (state.selectedYear) {
      const yr = parseInt(state.selectedYear);
      if (yearMin && yr < yearMin) return false;
      if (yearMax && yr > yearMax) return false;
    }
    return true;
  }

  function isInCart(optId) { return state.cart.some(o => o.id === optId); }

  // ── Navigation wizard ──────────────────────
  function goToStep(n) {
    state.step = n;
    [1, 2, 3].forEach(i => {
      const panel = qs('step-' + i);
      if (panel) panel.classList.toggle('hidden', i !== n);
    });
    updateStepIndicator();
    if (n === 3) { renderOptions(); renderCart(); }
    window.scrollTo({ top: qs('wizard') ? qs('wizard').offsetTop - 80 : 0, behavior: 'smooth' });
  }

  function updateStepIndicator() {
    document.querySelectorAll('.vc-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      if (s === state.step) el.classList.add('active');
      else if (s < state.step) el.classList.add('done');
    });
    document.querySelectorAll('.vc-step-line').forEach((line, i) => {
      line.classList.toggle('done', i + 1 < state.step);
    });
  }

  // ── Sélection marque ──────────────────────
  function selectBrand(brandId) {
    state.selectedBrand = getBrandById(brandId);
    state.selectedModel = null;
    state.selectedYear  = null;
    state.cart = [];
    document.querySelectorAll('.vc-brand-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.brandId === brandId);
    });
    renderModels(brandId);
    pushBrandUrl(state.selectedBrand);
    goToStep(2);
  }

  // ── Sélection modèle ──────────────────────
  function selectModel(modelId) {
    state.selectedModel = getModelById(modelId);
    state.selectedYear  = null;
    document.querySelectorAll('.vc-model-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.modelId === modelId);
    });
    populateYearSelect();
    const btn = qs('vc-confirm-model');
    if (btn) btn.disabled = true;
  }

  function populateYearSelect() {
    const sel = qs('vc-year-select');
    if (!sel || !state.selectedModel) return;
    const { yearMin, yearMax } = state.selectedModel;
    sel.innerHTML = '<option value="">— Sélectionnez une année —</option>';
    for (let y = yearMax; y >= yearMin; y--) {
      sel.innerHTML += `<option value="${y}">${y}</option>`;
    }
    sel.onchange = () => {
      state.selectedYear = sel.value;
      const btn = qs('vc-confirm-model');
      if (btn) btn.disabled = !state.selectedYear;
    };
  }

  function confirmModel() {
    if (!state.selectedModel || !state.selectedYear) return;
    pushModelUrl(state.selectedBrand, state.selectedModel);
    goToStep(3);
  }

  // ── Filtrage catégories ────────────────────
  function filterByCategory(cat) {
    state.activeCategory = cat;
    document.querySelectorAll('.vc-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
    renderOptions();
  }

  // ── Toggle option dans le panier ──────────
  function toggleOption(optId) {
    const opt = getOptionById(optId);
    if (!opt || !isCompatible(opt)) return;
    const idx = state.cart.findIndex(o => o.id === optId);
    if (idx >= 0) {
      state.cart.splice(idx, 1);
    } else {
      state.cart.push(opt);
      showUpsell(optId);
    }
    document.querySelectorAll('.vc-option-card[data-opt-id="' + optId + '"]').forEach(card => {
      card.classList.toggle('selected', isInCart(optId));
    });
    renderCart();
  }

  // ── Calcul panier + packs ─────────────────
  function getCartTotal() {
    const subtotal = state.cart.reduce((s, o) => s + o.price, 0);
    let discount = 0;
    const activePacks = [];
    VAG.PACKS.forEach(pack => {
      const allIn = pack.optionIds.every(id => isInCart(id));
      if (allIn) {
        const packSum = pack.optionIds.reduce((s, id) => {
          const o = getOptionById(id);
          return s + (o ? o.price : 0);
        }, 0);
        discount += packSum * pack.discount;
        activePacks.push(pack);
      }
    });
    return { subtotal, discount: Math.round(discount), total: Math.max(0, subtotal - Math.round(discount)), activePacks };
  }

  // ── Upsell toast ──────────────────────────
  function showUpsell(optId) {
    const opt = getOptionById(optId);
    if (!opt || !opt.upsellIds || !opt.upsellIds.length) return;
    const suggestion = opt.upsellIds
      .map(id => getOptionById(id))
      .find(o => o && !isInCart(o.id) && isCompatible(o));
    if (!suggestion) return;
    if (state.upsellTimeout) clearTimeout(state.upsellTimeout);
    const toast = qs('vc-upsell-toast');
    if (!toast) return;
    toast.innerHTML = `
      <button class="vc-toast-close" onclick="VCApp.closeUpsell()">×</button>
      <div class="vc-toast-label">💡 Suggestion</div>
      <div class="vc-toast-text">Vous pourriez aussi activer <strong>${suggestion.name}</strong> — ${fmt(suggestion.price)}</div>
      <button class="vc-toast-btn" onclick="VCApp.toggleOption('${suggestion.id}');VCApp.closeUpsell()">Ajouter +${fmt(suggestion.price)}</button>
    `;
    toast.classList.remove('hidden');
    state.upsellTimeout = setTimeout(closeUpsell, 5000);
  }

  function closeUpsell() {
    const toast = qs('vc-upsell-toast');
    if (toast) toast.classList.add('hidden');
    if (state.upsellTimeout) clearTimeout(state.upsellTimeout);
  }

  // ── WhatsApp devis ────────────────────────
  const WA_NUMBER = '33667924630';
  function buildWhatsAppMessage() {
    const b = state.selectedBrand ? state.selectedBrand.name : '';
    const m = state.selectedModel;
    const { subtotal, discount, total, activePacks } = getCartTotal();
    let msg = 'Bonjour AREPROG \uD83D\uDC4B\n';
    msg += 'Je souhaite un devis pour du *codage d\'options VAG*.\n\n';
    msg += '\uD83D\uDE97 *Mon v\u00e9hicule*\n';
    if (b || m) {
      msg += b + (m ? ' ' + m.name : '');
      if (m && m.code) msg += ' (' + m.code + ')';
      if (state.selectedYear) msg += ' \u00b7 ' + state.selectedYear;
      msg += '\n';
      if (m && m.platform) msg += 'Plateforme\u00a0: ' + m.platform + '\n';
    }
    if (state.cart.length) {
      msg += '\n\u2699\uFE0F *Options souhait\u00e9es (' + state.cart.length + ')*\n';
      state.cart.forEach(function(o) { msg += '\u2022 ' + o.name + ' \u2014 ' + o.price + '\u20ac\n'; });
      msg += '\n\uD83D\uDCB0 *Estimation\u00a0: ' + total + '\u20ac*';
      if (discount > 0) msg += '\n(R\u00e9duction pack\u00a0: \u2212' + discount + '\u20ac)';
      if (activePacks.length) msg += '\n\uD83C\uDF81 ' + activePacks[0].name + ' appliqu\u00e9';
    }
    msg += '\n\nMerci\u00a0!';
    return msg;
  }
  function openWhatsApp() {
    if (!state.cart.length) return;
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage()), '_blank');
  }

  // ── Modale lead ───────────────────────────
  function openLeadModal() {
    if (!state.cart.length) return;
    renderRecap();
    const modal = qs('vc-lead-modal');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLeadModal() {
    const modal = qs('vc-lead-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function renderRecap() {
    const el = qs('vc-modal-recap');
    if (!el) return;
    const { total, discount, activePacks } = getCartTotal();
    const brand = state.selectedBrand ? state.selectedBrand.name : '';
    const model = state.selectedModel ? state.selectedModel.name : '';
    const year  = state.selectedYear  || '';
    const optsList = state.cart.map(o =>
      `<span>• ${o.name} — <strong>${fmt(o.price)}</strong></span>`
    ).join('<br>');
    const packLine = activePacks.length
      ? `<div style="color:var(--green);margin-top:.4rem">🎁 ${activePacks.map(p => p.name).join(', ')} — -${fmt(discount)}</div>`
      : '';
    el.innerHTML = `
      <div class="vc-recap-vehicle">${brand} ${model} — ${year}</div>
      <div class="vc-recap-options">${optsList}</div>
      ${packLine}
      <div class="vc-recap-total">Total estimé : ${fmt(total)}</div>
    `;
  }

  function submitLead(e) {
    e.preventDefault();
    const form = e.target;
    const name  = form.querySelector('[name=name]').value.trim();
    const phone = form.querySelector('[name=phone]').value.trim();
    const email = form.querySelector('[name=email]').value.trim();
    const city  = form.querySelector('[name=city]').value.trim();
    const msg   = form.querySelector('[name=message]') ? form.querySelector('[name=message]').value.trim() : '';
    const phoneRx = /^(\+33|0)[1-9](\d{8})$/;
    if (!phoneRx.test(phone.replace(/\s/g, ''))) {
      alert('Numéro de téléphone invalide. Format attendu : 06 XX XX XX XX');
      return;
    }
    const { total, discount, activePacks } = getCartTotal();
    const order = {
      name, phone, email, city, message: msg,
      vehicle: {
        brand: state.selectedBrand ? state.selectedBrand.name : '',
        model: state.selectedModel ? state.selectedModel.name : '',
        year:  state.selectedYear || ''
      },
      options: state.cart.map(o => ({ id: o.id, name: o.name, price: o.price })),
      total, discount,
      activePacks: activePacks.map(p => p.id),
      status: 'nouveau',
      createdAt: db ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };
    const btn = form.querySelector('.vc-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
    const doConfirm = () => {
      qs('vc-lead-form').style.display = 'none';
      const conf = qs('vc-confirmation');
      if (conf) conf.classList.remove('hidden');
    };
    if (db) {
      db.collection('vag_orders').add(order)
        .then(doConfirm)
        .catch(err => {
          console.error(err);
          if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
          alert('Erreur lors de l\'envoi. Veuillez nous contacter par téléphone.');
        });
    } else {
      console.log('Order (offline):', order);
      setTimeout(doConfirm, 800);
    }
  }

  // ── Render : marques ──────────────────────
  function renderBrands() {
    const grid = qs('vc-brands-grid');
    if (!grid) return;
    grid.innerHTML = VAG.BRANDS.map(b => {
      const count = modelsForBrand(b.id).length;
      return `
        <div class="vc-brand-card" data-brand-id="${b.id}" onclick="VCApp.selectBrand('${b.id}')">
          <div class="vc-brand-logo">${b.abbr}</div>
          <div class="vc-brand-name">${b.name}</div>
          <div class="vc-brand-count">${count} modèles</div>
        </div>`;
    }).join('');
  }

  // ── Render : modèles ──────────────────────
  function renderModels(brandId) {
    const grid = qs('vc-models-grid');
    if (!grid) return;
    const models = modelsForBrand(brandId);
    grid.innerHTML = models.map(m => `
      <div class="vc-model-card" data-model-id="${m.id}" onclick="VCApp.selectModel('${m.id}')">
        <div class="vc-model-name">${m.name}</div>
        <div class="vc-model-code">${m.code} · ${m.yearMin}–${m.yearMax}</div>
        <div class="vc-platform-badge">${m.platform}</div>
      </div>`).join('');
  }

  // ── Render : options (uniquement compatibles) ──────────
  function renderOptions() {
    const grid = qs('vc-options-grid');
    if (!grid) return;

    // N'afficher QUE les options compatibles avec le véhicule sélectionné
    let opts = VAG.OPTIONS.filter(o => o.active && isCompatible(o));
    if (state.activeCategory !== 'all') {
      opts = opts.filter(o => o.category === state.activeCategory);
    }

    if (!opts.length) {
      grid.innerHTML = `<div class="vc-options-empty">
        <div style="font-size:2rem;margin-bottom:.8rem">⚙️</div>
        <strong>Aucune option dans cette catégorie</strong>
        <p>Essayez une autre catégorie ou contactez-nous pour un codage sur mesure.</p>
      </div>`;
      renderCategoryBar();
      renderVehicleSummary();
      return;
    }

    const renderCard = opt => {
      const inCart   = isInCart(opt.id);
      const expanded = state.expandedOption === opt.id;
      const reqEquip = opt.compatible.requiresEquipment;
      const diffLabel = { facile:'Facile', moyen:'Moyen', avance:'Avancé' }[opt.difficulty] || opt.difficulty;
      return `
        <div class="vc-option-card${inCart ? ' selected' : ''}"
             data-opt-id="${opt.id}"
             onclick="VCApp.toggleOption('${opt.id}')">
          <div class="vc-option-header">
            <div class="vc-option-check">
              <svg class="vc-option-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="vc-option-info">
              <div class="vc-option-name">${opt.name}</div>
              <div class="vc-option-desc">${opt.description}</div>
            </div>
          </div>
          <div class="vc-option-footer">
            <div class="vc-option-price">${fmt(opt.price)}</div>
            <div class="vc-option-meta">
              <span class="vc-difficulty-badge ${opt.difficulty}">${diffLabel}</span>
              <span class="vc-option-time">~${opt.timeMin} min</span>
              <button class="vc-option-expand-btn" onclick="event.stopPropagation();VCApp.expandOption('${opt.id}')">
                ${expanded ? '▲ Moins' : '▼ Plus'}
              </button>
            </div>
          </div>
          <div class="vc-option-details${expanded ? '' : ' hidden'}">
            ${opt.techDescription || ''}
            ${reqEquip && reqEquip.length ? `<div class="vc-option-requires">📋 Équipement requis : ${reqEquip.join(', ')}</div>` : ''}
          </div>
        </div>`;
    };

    renderCategoryBar();
    grid.innerHTML = opts.map(renderCard).join('');
    renderVehicleSummary();
  }

  function renderCategoryBar() {
    const bar = qs('vc-categories-bar');
    if (!bar) return;
    const compatOpts = VAG.OPTIONS.filter(o => o.active && isCompatible(o));
    bar.innerHTML = VAG.CATEGORIES.map(c => {
      const count = c.id === 'all'
        ? compatOpts.length
        : compatOpts.filter(o => o.category === c.id).length;
      return `
        <button class="vc-cat-btn${state.activeCategory === c.id ? ' active' : ''}"
                data-cat="${c.id}" onclick="VCApp.filterByCategory('${c.id}')">
          <span class="vc-cat-icon">${c.icon}</span>
          ${c.label}
          <span class="vc-cat-count">${count}</span>
        </button>`;
    }).join('');
  }

  function renderVehicleSummary() {
    const el = qs('vc-vehicle-summary');
    if (!el || !state.selectedModel) return;
    const b = state.selectedBrand ? state.selectedBrand.name : '';
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2">
        <rect x="1" y="3" width="22" height="18" rx="2"/><path d="M1 9h22"/>
      </svg>
      <strong>${b} ${state.selectedModel.name}</strong>
      &nbsp;·&nbsp; ${state.selectedModel.code}
      &nbsp;·&nbsp; ${state.selectedYear || '—'}
      &nbsp;·&nbsp; <span style="color:var(--muted)">${state.selectedModel.platform}</span>
    `;
  }

  // ── Render : panier ───────────────────────
  function renderCart() {
    const itemsEl = qs('vc-cart-items');
    const totalEl = qs('vc-cart-total');
    const packEl  = qs('vc-pack-banner');
    const devisBtn = qs('vc-devis-btn');
    if (!itemsEl) return;
    if (!state.cart.length) {
      itemsEl.innerHTML = `
        <div class="vc-cart-empty">
          <div class="vc-cart-empty-icon">◻</div>
          Sélectionnez les options que vous souhaitez activer sur votre véhicule.
        </div>`;
      if (totalEl) totalEl.innerHTML = '';
      if (packEl)  packEl.classList.add('hidden');
      if (devisBtn) { devisBtn.disabled = true; devisBtn.textContent = '\uD83D\uDCAC Demander un devis WhatsApp'; }
      return;
    }
    itemsEl.innerHTML = state.cart.map(o => `
      <div class="vc-cart-item">
        <div class="vc-cart-item-name">${o.name}</div>
        <div class="vc-cart-item-price">${fmt(o.price)}</div>
        <button class="vc-cart-item-remove" title="Retirer"
                onclick="event.stopPropagation();VCApp.toggleOption('${o.id}')">×</button>
      </div>`).join('');
    const { subtotal, discount, total, activePacks } = getCartTotal();
    if (totalEl) {
      totalEl.innerHTML = `
        <div class="vc-cart-subtotal">
          <span>${state.cart.length} option${state.cart.length > 1 ? 's' : ''}</span>
          <span>${fmt(subtotal)}</span>
        </div>
        ${discount > 0 ? `<div class="vc-cart-discount"><span>Réduction pack</span><span>−${fmt(discount)}</span></div>` : ''}
        <div class="vc-cart-total-row">
          <span>Total estimé</span>
          <span>${fmt(total)}</span>
        </div>`;
    }
    if (packEl) {
      if (activePacks.length) {
        packEl.classList.remove('hidden');
        packEl.innerHTML = activePacks.map(p => `
          <div class="vc-pack-banner-title">🎁 ${p.name} appliqué</div>
          <div>Réduction ${Math.round(p.discount * 100)}% sur ce pack</div>`).join('');
      } else {
        packEl.classList.add('hidden');
        checkPackSuggestions();
      }
    }
    if (devisBtn) {
      devisBtn.disabled = false;
      devisBtn.textContent = `\uD83D\uDCAC Devis WhatsApp — ${fmt(total)}`;
    }
  }

  function checkPackSuggestions() {
    const packEl = qs('vc-pack-banner');
    if (!packEl) return;
    for (const pack of VAG.PACKS) {
      const inCart  = pack.optionIds.filter(id => isInCart(id)).length;
      const missing = pack.optionIds.length - inCart;
      if (inCart >= 2 && missing > 0) {
        packEl.classList.remove('hidden');
        const savings = pack.optionIds.reduce((s, id) => {
          const o = getOptionById(id); return s + (o ? o.price : 0);
        }, 0) * pack.discount;
        packEl.innerHTML = `
          <div class="vc-pack-banner-title">💡 ${pack.name} disponible</div>
          <div>Ajoutez ${missing} option${missing > 1 ? 's' : ''} manquante${missing > 1 ? 's' : ''} → économisez ${fmt(Math.round(savings))}</div>`;
        return;
      }
    }
    packEl.classList.add('hidden');
  }

  // ── Expand option details ─────────────────
  function expandOption(optId) {
    state.expandedOption = state.expandedOption === optId ? null : optId;
    renderOptions();
  }

  // ── Init ──────────────────────────────────
  function init() {
    initFirebase();
    // Sur /codage-vag, lire l'URL pour pré-charger brand/model si présent
    // URL structure: /codage-vag/volkswagen/golf-8
    const parts = location.pathname.replace(/^\/|\/$/g, '').split('/');
    // parts[0]='codage-vag', parts[1]=brandSlug, parts[2]=modelSlug
    if (parts[0] === 'codage-vag' && parts.length >= 3) {
      const brand = VAG.BRANDS.find(b => b.slug === parts[1]);
      const model = brand ? VAG.MODELS.find(m => m.brandId === brand.id && m.slug === parts[2]) : null;
      if (brand && model) {
        _preload(brand.id, model.id, model.yearMin);
        return;
      }
    }
    renderBrands();
    updateStepIndicator();
  }

  // ── Preload brand+model (utilisé par les pages /marque/modele) ──────
  function _preload(brandId, modelId, year) {
    state.selectedBrand = getBrandById(brandId);
    state.selectedModel = getModelById(modelId);
    state.selectedYear  = String(year || state.selectedModel?.yearMin || '');
    // Met à jour les labels de l'indicateur d'étapes si présents
    const l1 = document.getElementById('step-label-1');
    const l2 = document.getElementById('step-label-2');
    if (l1 && state.selectedBrand) l1.textContent = state.selectedBrand.name;
    if (l2 && state.selectedModel) l2.textContent = state.selectedModel.name;
    initFirebase();
    goToStep(3);
  }

  // ── Navigation URL ─────────────────────────
  function pushBrandUrl(brand) {
    if (brand && brand.slug) {
      history.pushState({}, '', '/codage-vag/' + brand.slug);
    }
  }
  function pushModelUrl(brand, model) {
    if (brand && model && brand.slug && model.slug) {
      history.pushState({}, '', '/codage-vag/' + brand.slug + '/' + model.slug);
    }
  }

  // ── API publique ──────────────────────────
  return {
    init, goToStep, selectBrand, selectModel,
    confirmModel, filterByCategory, toggleOption,
    expandOption, openLeadModal, closeLeadModal,
    submitLead, closeUpsell, openWhatsApp, _preload
  };

})();

document.addEventListener('DOMContentLoaded', VCApp.init);
