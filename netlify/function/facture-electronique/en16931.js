// Conversion d'une facture de gestion.html (objet `doc` de la collection
// `docs`, cf. buildObj()) vers le modèle sémantique EN16931 au format JSON
// de l'API SUPER PDP (schéma `en_invoice`). SUPER PDP convertit ensuite ce
// JSON en Factur-X (PDF + XML CII) via POST /v1.beta/invoices/convert.
//
// Règles propres à AREPROG :
//  - un seul taux de TVA par document (doc.tvaRate) ;
//  - activité de services (réparation / reprogrammation) → cadre S1,
//    TVA exigible à l'encaissement (d'où le statut « Encaissée » fr:212) ;
//  - client pro = SIRET renseigné (doc.csiret) → facture B2B adressée à
//    l'adresse électronique 0225:<SIREN> ; sinon facture B2C (note BAR=B2C)
//    qui n'est pas acheminée au client mais sert à l'e-reporting.

// Identité légale du vendeur (Kbis du 01/10/2026). À tenir à jour à la main,
// comme l'expéditeur Resend des autres fonctions.
const SELLER = {
  name: 'AREPROG',
  siren: '130785355',
  vat: 'FR01130785355',
  legalInfo: 'SASU au capital de 500 € — RCS Paris 130 785 355',
  address: '47 rue Vivienne',
  postCode: '75002',
  city: 'Paris',
  email: 'contact@areprog.fr',
};

// Mentions obligatoires (BR-FR-05) sur toute facture, B2B comme B2C.
const NOTES_PAIEMENT = [
  { subject_code: 'PMD', note: 'En cas de retard de paiement, pénalités exigibles au taux de trois fois le taux d\'intérêt légal.' },
  { subject_code: 'PMT', note: 'Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €.' },
  { subject_code: 'AAB', note: 'Pas d\'escompte pour paiement anticipé.' },
];

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function amt(n) { return r2(n).toFixed(2); }
function qty(n) { return String(r2(n)); }

// "64100 Bayonne" → { post_code: '64100', city: 'Bayonne' }
function splitVille(v) {
  const s = String(v || '').trim();
  let m = /^(\d{5})\s+(.+)$/.exec(s);
  if (m) return { post_code: m[1], city: m[2] };
  m = /^(.+?)\s+(\d{5})$/.exec(s);
  if (m) return { post_code: m[2], city: m[1] };
  return { city: s };
}

function sirenDe(doc) {
  const digits = String(doc.csiret || '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(0, 9) : '';
}

function estB2B(doc) { return !!sirenDe(doc); }

function lineNet(l) {
  if (!l || l.offert) return 0;
  let base = num(l.qte) * num(l.pu);
  const r = num(l.remise);
  if (r > 0) base = l.remiseType === 'eur' ? Math.max(0, base - r) : base * (1 - Math.min(r, 100) / 100);
  return Math.max(0, base);
}

// Erreurs bloquantes avant tout appel à SUPER PDP (message pour l'admin).
function verifier(doc) {
  const errs = [];
  if (!doc || doc.type !== 'facture') errs.push('Seules les factures peuvent être transmises.');
  if (doc && !doc.num) errs.push('La facture n\'a pas de numéro.');
  if (doc && !/^\d{4}-\d{2}-\d{2}$/.test(doc.date || '')) errs.push('Date d\'émission manquante.');
  if (doc && !String(doc.cn || '').trim()) errs.push('Nom du client manquant.');
  if (doc && !(doc.lines || []).some(function (l) { return String(l.label || l.desc || '').trim(); })) errs.push('Aucune ligne.');
  if (doc && doc.csiret && !estB2B(doc)) errs.push('SIRET client invalide (9 ou 14 chiffres attendus).');
  return errs;
}

function toEnInvoice(doc) {
  const b2b = estB2B(doc);
  const rate = num(doc.tvaRate);
  const cat = rate > 0 ? 'S' : 'E';
  const rateStr = qty(rate);

  const lines = [];
  (doc.lines || []).forEach(function (l) {
    const name = String(l.label || l.desc || '').trim();
    if (!name) return;
    const description = l.label && l.desc ? String(l.desc).trim() : '';
    const q = l.offert ? 0 : num(l.qte);
    const pu = l.offert ? 0 : num(l.pu);
    const gross = r2(q * pu);
    const net = r2(lineNet(l));
    const line = {
      identifier: String(lines.length + 1),
      invoiced_quantity: qty(q || 1),
      invoiced_quantity_code: 'C62',
      net_amount: amt(net),
      item_information: { name: name.slice(0, 250) },
      price_details: { item_net_price: amt(q ? pu : net) },
      vat_information: { invoiced_item_vat_category_code: cat, invoiced_item_vat_rate: rateStr },
    };
    const descr = [description, l.offert ? 'Offert' : ''].filter(Boolean).join(' — ');
    if (descr) line.item_information.description = descr.slice(0, 1000);
    if (l.ref) line.item_information.seller_identifier = String(l.ref).slice(0, 100);
    if (gross - net > 0.004 && q) line.allowances = [{ amount: amt(gross - net), reason: 'Remise' }];
    lines.push(line);
  });

  const sumLines = r2(lines.reduce(function (s, l) { return s + num(l.net_amount); }, 0));
  const rg = r2(Math.min(num(doc.remiseGlobale && doc.remiseGlobale.montant), sumLines));
  const ht = r2(sumLines - rg);
  const tva = r2(ht * rate / 100);
  const ttc = r2(ht + tva);
  const paid = doc.acompte && doc.acompte.recu ? r2(Math.min(num(doc.acompte.montant), ttc)) : 0;

  const buyerVille = splitVille(doc.cv);
  const buyer = {
    name: String(doc.cn).trim(),
    postal_address: Object.assign({ country_code: 'FR' }, doc.ca ? { address_line1: String(doc.ca).trim() } : {}, buyerVille),
  };
  if (doc.ce) buyer.contact = { email_address: String(doc.ce).trim() };
  if (b2b) {
    const siren = sirenDe(doc);
    buyer.legal_registration_identifier = { scheme: '0002', value: siren };
    buyer.electronic_address = { scheme: '0225', value: siren };
    if (doc.ctva) buyer.vat_identifier = String(doc.ctva).replace(/\s/g, '').toUpperCase();
  } else {
    // BT-49 est obligatoire même en B2C (BR-FR-12) : faute d'adresse de
    // facturation électronique, on utilise l'email du client (scheme EM).
    buyer.electronic_address = { scheme: 'EM', value: String(doc.ce || SELLER.email).trim() };
  }

  const notes = [{ subject_code: 'ABL', note: SELLER.legalInfo }];
  Array.prototype.push.apply(notes, NOTES_PAIEMENT);
  if (!b2b) notes.push({ subject_code: 'BAR', note: 'B2C' });
  const vehicule = [doc.vm, doc.vmo, doc.vmot].filter(Boolean).join(' ');
  if (vehicule || doc.vim) notes.push({ subject_code: 'AAI', note: ('Véhicule : ' + vehicule + (doc.vim ? ' — Immat. ' + String(doc.vim).toUpperCase() : '')).trim() });

  const inv = {
    number: String(doc.num),
    issue_date: doc.date,
    type_code: 380,
    currency_code: 'EUR',
    process_control: { business_process_type: 'S1', specification_identifier: 'urn:cen.eu:en16931:2017' },
    notes: notes,
    seller: {
      name: SELLER.name,
      legal_registration_identifier: { scheme: '0002', value: SELLER.siren },
      vat_identifier: SELLER.vat,
      electronic_address: { scheme: '0225', value: SELLER.siren },
      postal_address: { address_line1: SELLER.address, post_code: SELLER.postCode, city: SELLER.city, country_code: 'FR' },
      contact: { email_address: SELLER.email },
    },
    buyer: buyer,
    // Prestations de services : TVA exigible à l'encaissement (code 72).
    vat_point_date_code: '72',
    lines: lines,
    vat_break_down: [{
      vat_category_code: cat,
      vat_category_rate: rateStr,
      vat_category_taxable_amount: amt(ht),
      vat_category_tax_amount: amt(tva),
    }],
    totals: {
      sum_invoice_lines_amount: amt(sumLines),
      total_without_vat: amt(ht),
      total_vat_amount: { value: amt(tva), currency_code: 'EUR' },
      total_with_vat: amt(ttc),
      amount_due_for_payment: amt(ttc - paid),
    },
  };
  if (cat === 'E') {
    inv.vat_break_down[0].vat_exemption_reason = 'TVA non applicable';
  }
  if (rg > 0) {
    inv.document_level_allowances = [{ amount: amt(rg), reason: 'Remise', vat_category_code: cat, vat_rate: rateStr }];
    inv.totals.sum_allowances_amount = amt(rg);
  }
  if (paid > 0) inv.totals.paid_amount = amt(paid);
  if (/^\d{4}-\d{2}-\d{2}$/.test(doc.ech || '')) inv.payment_due_date = doc.ech;
  if (b2b) inv.payment_terms = 'Règlement à réception de facture.';
  return { invoice: inv, b2b: b2b, totals: { ht: ht, tva: tva, ttc: ttc, rate: rate } };
}

module.exports = { toEnInvoice, verifier, estB2B, SELLER };
