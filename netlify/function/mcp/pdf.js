// PDF d'un devis / facture / ordre de réparation généré côté serveur, pour
// les envois faits par Claude via le connecteur MCP (mcp.js). Version
// simplifiée du PDF de gestion.html (renderDocHTML + generatePdfBase64, qui
// tournent dans le navigateur) : mêmes informations — en-tête et mentions
// légales du modèle de document, client, véhicule, lignes, totaux, notes,
// mention d'usage EGR/FAP/AdBlue, CGV — sans les fiches prestations.
//
// Le modèle (nom, coordonnées, couleur, mentions, CGV) est lu dans
// config/template, que gestion.js y recopie (saveTemplate / chargement).

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Copie de DECHARGE_TEXTE (gestion.js) — à garder synchronisée.
const DECHARGE_TEXTE = 'Prestation(s) de désactivation (EGR / FAP / AdBlue) : le client déclare avoir été informé que la désactivation d\'un dispositif antipollution rend le véhicule non conforme à son homologation pour la circulation sur la voie publique. Cette prestation est réalisée à sa demande, pour un usage hors voie publique (circuit, compétition, export). Le client en assume seul l\'utilisation et les conséquences réglementaires, et dégage AREPROG de toute responsabilité à ce titre.';
const DECHARGE_RE = /\begr\b|\bfap\b|\bdpf\b|adblue|\bscr\b/;

const A4 = [595.28, 841.89];
const M = 40; // marge

function hexColor(h, fallback) {
  const m = /^#([0-9a-f]{6})$/i.exec(h || '') || /^#([0-9a-f]{6})$/i.exec(fallback);
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function eur(n) {
  const v = (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).split('.');
  return v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + v[1] + ' €';
}

function dateFr(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '')) return d || '';
  const [y, m, j] = d.split('-');
  return j + '/' + m + '/' + y;
}

function normLabel(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

async function buildDocPdf(doc, tpl) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const accent = hexColor(tpl.color, '#1E90FF');
  const grey = rgb(0.42, 0.45, 0.5);
  const black = rgb(0.07, 0.07, 0.07);
  const typeLabel = doc.type === 'facture' ? 'FACTURE' : doc.type === 'ordre' ? 'ORDRE DE RÉPARATION' : 'DEVIS';

  // Les polices standard PDF n'encodent que WinAnsi : on remplace ce qui
  // ne passe pas (emojis, symboles) plutôt que de faire échouer l'envoi.
  const okChar = new Map();
  function clean(s) {
    return String(s == null ? '' : s).replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/ | /g, ' ')
      .split('').map((ch) => {
        if (ch === '\n') return ch;
        if (!okChar.has(ch)) { try { font.encodeText(ch); okChar.set(ch, true); } catch (e) { okChar.set(ch, false); } }
        return okChar.get(ch) ? ch : '';
      }).join('');
  }
  function wrap(text, f, size, width) {
    const out = [];
    clean(text).split('\n').forEach((para) => {
      let line = '';
      para.split(/\s+/).forEach((w) => {
        const t = line ? line + ' ' + w : w;
        if (f.widthOfTextAtSize(t, size) <= width || !line) line = t;
        else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }

  let page, y;
  function newPage() {
    page = pdf.addPage(A4);
    y = A4[1] - M;
  }
  function ensure(h) { if (y - h < M + 40) { footer(); newPage(); } }
  function text(t, x, size, f, color) { page.drawText(clean(t), { x, y, size, font: f || font, color: color || black }); }
  function footer() {
    const lines = [];
    if (tpl.showFooter !== false && tpl.footer) lines.push(...wrap(tpl.footer, font, 7, A4[0] - 2 * M));
    if (tpl.showLegal !== false && tpl.legal) lines.push(...wrap(tpl.legal, font, 6.5, A4[0] - 2 * M));
    let fy = M - 10 + lines.length * 8.5;
    lines.forEach((l) => { page.drawText(l, { x: M, y: fy, size: 6.8, font, color: grey }); fy -= 8.5; });
  }

  // ── En-tête ──
  newPage();
  page.drawRectangle({ x: 0, y: A4[1] - 92, width: A4[0], height: 92, color: accent });
  page.drawText(clean(tpl.nom || 'AREPROG'), { x: M, y: A4[1] - 44, size: 22, font: bold, color: rgb(1, 1, 1) });
  if (tpl.activite) page.drawText(clean(tpl.activite), { x: M, y: A4[1] - 62, size: 9.5, font, color: rgb(1, 1, 1) });
  const contact = [tpl.adresse, [tpl.tel, tpl.email, tpl.web].filter(Boolean).join(' · ')].filter(Boolean);
  contact.forEach((c, i) => page.drawText(clean(c), { x: M, y: A4[1] - 76 - i * 10, size: 8, font, color: rgb(1, 1, 1) }));
  const right = typeLabel + ' N° ' + (doc.num || '—');
  page.drawText(clean(right), { x: A4[0] - M - bold.widthOfTextAtSize(clean(right), 13), y: A4[1] - 44, size: 13, font: bold, color: rgb(1, 1, 1) });
  const dates = 'Date : ' + dateFr(doc.date) + (doc.type === 'devis' && doc.ech ? '  ·  Valable jusqu\'au ' + dateFr(doc.ech) : doc.type === 'facture' && doc.ech ? '  ·  Échéance ' + dateFr(doc.ech) : '');
  page.drawText(clean(dates), { x: A4[0] - M - font.widthOfTextAtSize(clean(dates), 8.5), y: A4[1] - 62, size: 8.5, font, color: rgb(1, 1, 1) });
  y = A4[1] - 120;

  // ── Client / véhicule ──
  const colW = (A4[0] - 2 * M - 16) / 2;
  const cli = [doc.cn, doc.ca, doc.cv, doc.ct, doc.ce, doc.csiret && 'SIRET ' + doc.csiret, doc.ctva && 'TVA ' + doc.ctva].filter(Boolean);
  const veh = tpl.showVeh === false ? [] : [
    [doc.vm, doc.vmo].filter(Boolean).join(' '), doc.vmot, doc.van && 'Année ' + doc.van,
    doc.vim && 'Immat. ' + String(doc.vim).toUpperCase(), doc.vkm && 'Kilométrage ' + doc.vkm,
  ].filter(Boolean);
  const boxH = 22 + Math.max(cli.length, veh.length, 1) * 12;
  [[0, 'CLIENT', cli], [1, 'VÉHICULE', veh]].forEach(([i, titre, rows]) => {
    if (!rows.length) return;
    const x = M + i * (colW + 16);
    page.drawRectangle({ x, y: y - boxH, width: colW, height: boxH, color: rgb(0.97, 0.98, 0.98), borderColor: rgb(0.9, 0.91, 0.93), borderWidth: 0.8 });
    page.drawText(clean(titre), { x: x + 10, y: y - 14, size: 7.5, font: bold, color: accent });
    rows.forEach((r, k) => page.drawText(clean(r).slice(0, 70), { x: x + 10, y: y - 28 - k * 12, size: 9, font: k === 0 && i === 0 ? bold : font, color: black }));
  });
  y -= boxH + 22;

  // ── Lignes ──
  const cols = { label: M, qte: M + 300, pu: M + 340, rem: M + 410, tot: A4[0] - M };
  function head() {
    page.drawRectangle({ x: M, y: y - 6, width: A4[0] - 2 * M, height: 18, color: accent });
    const hy = y;
    page.drawText('Désignation', { x: cols.label + 6, y: hy, size: 8, font: bold, color: rgb(1, 1, 1) });
    page.drawText('Qté', { x: cols.qte, y: hy, size: 8, font: bold, color: rgb(1, 1, 1) });
    page.drawText('PU HT', { x: cols.pu, y: hy, size: 8, font: bold, color: rgb(1, 1, 1) });
    page.drawText('Remise', { x: cols.rem, y: hy, size: 8, font: bold, color: rgb(1, 1, 1) });
    page.drawText('Total HT', { x: cols.tot - bold.widthOfTextAtSize('Total HT', 8) - 6, y: hy, size: 8, font: bold, color: rgb(1, 1, 1) });
    y -= 24;
  }
  head();
  (doc.lines || []).forEach((l) => {
    const labelLines = wrap(l.label || '', bold, 9, 285);
    const descLines = l.desc ? wrap(l.desc, font, 7.5, 285) : [];
    const h = labelLines.length * 11 + descLines.length * 9.5 + 8;
    if (y - h < M + 60) { footer(); newPage(); head(); }
    const top = y;
    labelLines.forEach((t) => { page.drawText(t, { x: cols.label + 6, y, size: 9, font: bold, color: black }); y -= 11; });
    descLines.forEach((t) => { page.drawText(t, { x: cols.label + 6, y, size: 7.5, font, color: grey }); y -= 9.5; });
    const net = l.offert ? 0 : (() => {
      let b = (parseFloat(l.qte) || 0) * (parseFloat(l.pu) || 0);
      const r = parseFloat(l.remise) || 0;
      if (r > 0) b = l.remiseType === 'eur' ? Math.max(0, b - r) : b * (1 - Math.min(r, 100) / 100);
      return b;
    })();
    page.drawText(String(l.qte || 1), { x: cols.qte, y: top, size: 9, font, color: black });
    page.drawText(clean(eur(l.pu)), { x: cols.pu, y: top, size: 9, font, color: black });
    const rem = l.offert ? 'Offert' : (parseFloat(l.remise) > 0 ? (l.remiseType === 'eur' ? eur(l.remise) : l.remise + ' %') : '');
    if (rem) page.drawText(clean(rem), { x: cols.rem, y: top, size: 9, font, color: black });
    const tot = clean(eur(net));
    page.drawText(tot, { x: cols.tot - font.widthOfTextAtSize(tot, 9) - 6, y: top, size: 9, font, color: black });
    y -= 6;
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: A4[0] - M, y: y + 2 }, thickness: 0.5, color: rgb(0.9, 0.91, 0.93) });
    y -= 8;
  });

  // ── Totaux ──
  const tvaRate = parseFloat(doc.tvaRate) || 0;
  const rows = [];
  if ((doc.remiseTotale || 0) > 0.005) {
    rows.push(['Total brut HT', eur(doc.htBrut)]);
    rows.push(['Remises', '- ' + eur(doc.remiseTotale)]);
  }
  rows.push(['Total HT', eur(doc.ht)]);
  rows.push(['TVA (' + tvaRate + ' %)', eur(doc.tva)]);
  ensure(rows.length * 15 + 30);
  y -= 4;
  rows.forEach(([k, v]) => {
    page.drawText(clean(k), { x: A4[0] - M - 200, y, size: 9.5, font, color: grey });
    page.drawText(clean(v), { x: A4[0] - M - font.widthOfTextAtSize(clean(v), 9.5) - 6, y, size: 9.5, font, color: black });
    y -= 15;
  });
  page.drawRectangle({ x: A4[0] - M - 210, y: y - 8, width: 210, height: 22, color: accent });
  page.drawText('TOTAL TTC', { x: A4[0] - M - 200, y: y - 1, size: 10.5, font: bold, color: rgb(1, 1, 1) });
  const ttc = clean(eur(doc.ttc));
  page.drawText(ttc, { x: A4[0] - M - bold.widthOfTextAtSize(ttc, 11.5) - 6, y: y - 1, size: 11.5, font: bold, color: rgb(1, 1, 1) });
  y -= 36;

  // ── Paiements reçus (facture) ──
  if (doc.type === 'facture') {
    const regl = [];
    if (doc.acompte && doc.acompte.recu) regl.push(doc.acompte);
    (doc.paiements || []).forEach((p) => regl.push(p));
    if (regl.length) {
      ensure(16 + regl.length * 12);
      text('Règlements reçus', M, 9, bold);
      y -= 13;
      regl.forEach((p) => { text(dateFr(p.date) + ' · ' + eur(p.montant) + (p.mode ? ' · ' + p.mode : ''), M, 8.5, font, grey); y -= 12; });
      y -= 6;
    }
  }

  // ── Notes ──
  if (doc.notes) {
    const nl = wrap(doc.notes, font, 8.5, A4[0] - 2 * M);
    ensure(16 + nl.length * 11);
    text('Notes', M, 9, bold);
    y -= 13;
    nl.forEach((t) => { ensure(11); page.drawText(t, { x: M, y, size: 8.5, font, color: black }); y -= 11; });
    y -= 6;
  }

  // ── Mention d'usage EGR / FAP / AdBlue ──
  if ((doc.type === 'devis' || doc.type === 'facture') && (doc.lines || []).some((l) => DECHARGE_RE.test(normLabel(l.label)))) {
    const dl = wrap('Mention d\'usage — ' + DECHARGE_TEXTE, font, 8, A4[0] - 2 * M - 16);
    const ac = doc.accordUsage || {};
    const sig = ac.ok ? ['Accord du client enregistré' + (ac.date ? ' le ' + dateFr(ac.date) : '') + (ac.mode ? ' — ' + ac.mode : '')] : ['Lu et approuvé — Date :                                Signature du client :'];
    const h = (dl.length + 2) * 10.5 + 14;
    ensure(h);
    page.drawRectangle({ x: M, y: y - h + 10, width: A4[0] - 2 * M, height: h, borderColor: rgb(0.85, 0.6, 0.2), borderWidth: 0.8, color: rgb(1, 0.98, 0.94) });
    y -= 4;
    dl.forEach((t) => { page.drawText(t, { x: M + 8, y, size: 8, font, color: black }); y -= 10.5; });
    y -= 6;
    sig.forEach((t) => { page.drawText(clean(t), { x: M + 8, y, size: 8, font: bold, color: black }); y -= 10.5; });
    y -= 22;
  }

  // ── Acceptation (devis) ──
  if (doc.type === 'devis') {
    ensure(40);
    text('Bon pour accord (date et signature du client) :', M, 8.5, bold, grey);
    y -= 40;
  }
  footer();

  // ── CGV (devis et factures) ──
  const cgv = tpl.showCgv === false ? '' : (tpl.cgv || tpl.cgvDefault || '');
  if ((doc.type === 'devis' || doc.type === 'facture') && cgv) {
    newPage();
    text('Conditions générales de vente et de réparation', M, 12, bold, accent);
    y -= 12;
    text('Annexe ' + (doc.type === 'devis' ? 'au devis' : 'à la facture') + ' n° ' + (doc.num || '—') + ' du ' + dateFr(doc.date), M, 8, font, grey);
    y -= 18;
    const gap = 14, cw = (A4[0] - 2 * M - gap) / 2;
    let top = y;
    let col = 0;
    const paras = String(cgv).replace(/\{validite\}/g, String(tpl.validite || 30)).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paras.forEach((p) => {
      const isH4 = p.indexOf('## ') === 0, isH5 = p.indexOf('### ') === 0;
      const f = isH4 || isH5 ? bold : font, size = isH4 ? 8 : isH5 ? 7.4 : 6.6, lh = size + 1.6;
      const lines = wrap(p.replace(/^#{2,3} /, ''), f, size, cw);
      lines.forEach((t) => {
        if (y < M + 30) {
          if (col === 0) { col = 1; y = top; } else { footer(); newPage(); col = 0; top = y; }
        }
        page.drawText(t, { x: M + col * (cw + gap), y, size, font: f, color: isH4 || isH5 ? accent : black });
        y -= lh;
      });
      y -= 3;
    });
    footer();
  }

  return Buffer.from(await pdf.save()).toString('base64');
}

module.exports = { buildDocPdf };
