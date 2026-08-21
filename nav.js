/* ═══════════════════════════════════════════
 AREPROG — nav.js v3
 Navigation, footer, SEO schema, WhatsApp widget
 ═══════════════════════════════════════════ */

// ── Mesure d'audience Umami — sans cookie, sans donnée personnelle ─────────
// Point unique : avant, ce <script> (avec un ID factice "UMAMI_WEBSITE_ID")
// était dupliqué tel quel dans le <head> de chaque page, si bien que le vrai
// identifiant n'a jamais remplacé le texte d'exemple sur aucune des 29
// pages concernées — zéro donnée de trafic collectée depuis la mise en
// ligne. Remplacer la valeur ci-dessous par l'identifiant fourni par
// cloud.umami.is (une seule fois, ici) active le suivi sur tout le site.
const UMAMI_WEBSITE_ID = 'UMAMI_WEBSITE_ID';
if (UMAMI_WEBSITE_ID && UMAMI_WEBSITE_ID !== 'UMAMI_WEBSITE_ID' && !document.querySelector('script[data-website-id]')) {
  const umamiScript = document.createElement('script');
  umamiScript.defer = true;
  umamiScript.src = 'https://cloud.umami.is/script.js';
  umamiScript.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  document.head.appendChild(umamiScript);
}

const NAV_HTML = `
<a href="#contenu" class="skip-link">Aller au contenu</a>
<nav>
 <a href="/" class="nav-logo">ARE<span>PROG</span></a>
 <ul class="nav-links">
 <li><a href="/" data-page="index">Accueil</a></li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="diagnostic">Diagnostic ▾</a>
 <ul class="nav-dropdown-menu">
 <li><a href="/diagnostic">Diagnostic multimarque</a></li>
 <li><a href="/diagnostic-vag">Diagnostic VAG <span class="nav-badge">ODIS</span></a></li>
 <li><a href="/diagnostic-bmw">Diagnostic BMW <span class="nav-badge">ISTA</span></a></li>
 </ul>
 </li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="reprogrammation">Reprogrammation ▾</a>
 <ul class="nav-dropdown-menu">
 <li><a href="/stage1">Stage 1</a></li>
 <li><a href="/stage2">Stage 2</a></li>
 <li><a href="/conversion-e85">Conversion E85</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Désactivations</li>
 <li><a href="/desactivation-egr">EGR</a></li>
 <li><a href="/desactivation-fap">FAP</a></li>
 <li><a href="/desactivation-adblue">AdBlue</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Entretien</li>
 <li><a href="/vidange-boite-automatique">Vidange Boîte Auto</a></li>
 <li><a href="/reprogrammation-boite-vitesse">Reprog Boîte (TCU) <span class="nav-badge" style="color:#FCD34D;border-color:rgba(245,158,11,.4)">NEW</span></a></li>
 </ul>
 </li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="zones">Zones ▾</a>
 <ul class="nav-dropdown-menu">
 <li class="dropdown-group-label">Pays Basque</li>
 <li><a href="/reprogrammation-moteur-bayonne">Bayonne</a></li>
 <li><a href="/reprogrammation-moteur-biarritz">Biarritz</a></li>
 <li><a href="/reprogrammation-moteur-anglet">Anglet</a></li>
 <li><a href="/reprogrammation-moteur-saint-jean-de-luz">Saint-Jean-de-Luz</a></li>
 <li><a href="/reprogrammation-moteur-hendaye">Hendaye</a></li>
 </ul>
 </li>
 <li><a href="/simulateur" data-page="simulateur">Simulateur</a></li>
 <li><a href="/tarifs" data-page="tarifs">Tarifs</a></li>
 <li><a href="/about" data-page="about">À propos</a></li>
 <li><a href="/faq" data-page="faq">FAQ</a></li>
 <li><a href="/contact" data-page="contact">Contact</a></li>
 <li><a href="/rdv" data-page="rdv">Prendre RDV</a></li>
 </ul>
 <a href="/contact" class="nav-cta">Devis gratuit</a>
 <button class="nav-burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navMobile">
 <span></span><span></span><span></span>
 </button>
</nav>
<div class="nav-mobile" id="navMobile">
 <a href="/" data-page="index">Accueil</a>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Zones desservies</div>
 <a href="/reprogrammation-moteur-bayonne" class="nav-mobile-sub">Bayonne</a>
 <a href="/reprogrammation-moteur-biarritz" class="nav-mobile-sub">Biarritz</a>
 <a href="/reprogrammation-moteur-anglet" class="nav-mobile-sub">Anglet</a>
 <a href="/reprogrammation-moteur-saint-jean-de-luz" class="nav-mobile-sub">Saint-Jean-de-Luz</a>
 <a href="/reprogrammation-moteur-hendaye" class="nav-mobile-sub">Hendaye</a>
 </div>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Diagnostic</div>
 <a href="/diagnostic" class="nav-mobile-sub" data-page="diagnostic">Diagnostic multimarque</a>
 <a href="/diagnostic-vag" class="nav-mobile-sub" data-page="diagnostic-vag">Diagnostic VAG (ODIS)</a>
 <a href="/diagnostic-bmw" class="nav-mobile-sub" data-page="diagnostic-bmw">Diagnostic BMW (ISTA)</a>
 </div>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Reprogrammation</div>
 <a href="/stage1" class="nav-mobile-sub" data-page="stage1">Stage 1</a>
 <a href="/stage2" class="nav-mobile-sub" data-page="stage2">Stage 2</a>
 <a href="/conversion-e85" class="nav-mobile-sub" data-page="conversion-e85">Conversion E85</a>
 <a href="/desactivation-egr" class="nav-mobile-sub" data-page="desactivation-egr">Désactivation EGR</a>
 <a href="/desactivation-fap" class="nav-mobile-sub" data-page="desactivation-fap">Désactivation FAP</a>
 <a href="/desactivation-adblue" class="nav-mobile-sub" data-page="desactivation-adblue">Désactivation AdBlue</a>
 <a href="/vidange-boite-automatique" class="nav-mobile-sub" data-page="vidange-boite-automatique">Vidange Boîte Automatique</a>
 <a href="/reprogrammation-boite-vitesse" class="nav-mobile-sub" data-page="reprogrammation-boite-vitesse">Reprogrammation Boîte (TCU)</a>
 </div>
 <a href="/tarifs" data-page="tarifs">Tarifs 2026</a>
 <a href="/about" data-page="about">À propos</a>
 <a href="/faq" data-page="faq">FAQ</a>
 <a href="/simulateur" data-page="simulateur">Simulateur</a>
 <a href="/contact" data-page="contact">Nous contacter</a>
 <a href="/rdv" data-page="rdv">Prendre RDV</a>
</div>
`;

const FOOTER_HTML = `
<footer>
 <div class="footer-top">
 <div class="footer-brand">
 <a href="/" class="footer-logo">ARE<span>PROG</span></a>
 <p>Votre moteur mérite mieux.<br>Venez à notre atelier, avec le bon matériel.</p>
 <a href="tel:+33667924630" class="footer-tel"> 06 67 92 46 30</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Diagnostic</div>
 <a href="/diagnostic">Diagnostic multimarque</a>
 <a href="/diagnostic-vag">Diagnostic VAG (ODIS)</a>
 <a href="/diagnostic-bmw">Diagnostic BMW (ISTA)</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Reprogrammation</div>
 <a href="/stage1">Stage 1</a>
 <a href="/stage2">Stage 2</a>
 <a href="/conversion-e85">Conversion E85</a>
 <a href="/desactivation-egr">Désactivation EGR</a>
 <a href="/desactivation-fap">Désactivation FAP</a>
 <a href="/desactivation-adblue">Désactivation AdBlue</a>
 <a href="/vidange-boite-automatique">Vidange Boîte Automatique</a>
 <a href="/reprogrammation-boite-vitesse">Reprogrammation Boîte (TCU)</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Zones</div>
 <a href="/reprogrammation-moteur-bayonne">Bayonne</a>
 <a href="/reprogrammation-moteur-biarritz">Biarritz</a>
 <a href="/reprogrammation-moteur-anglet">Anglet</a>
 <a href="/reprogrammation-moteur-saint-jean-de-luz">Saint-Jean-de-Luz</a>
 <a href="/reprogrammation-moteur-hendaye">Hendaye</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Navigation</div>
 <a href="/tarifs">Tarifs 2026</a>
 <a href="/simulateur">Simulateur de gains</a>
 <a href="/faq">FAQ</a>
 <a href="/about">À propos</a>
 <a href="/guide-reprogrammation-moteur">Guide reprogrammation</a>
 <a href="/contact">Devis gratuit</a>
 <a href="/rdv">Prendre RDV</a>
 </div>
 </div>
 <div class="footer-bottom">
 <span>© ${new Date().getFullYear()} AREPROG — Reprogrammation moteur en atelier</span>
 <div class="footer-bottom-links">
 <a href="/mentions-legales">Mentions légales</a>
   <a href="/politique-confidentialite">Confidentialité</a>
 <a href="/sitemap-visuel">Plan du site</a>
 </div>
 </div>
</footer>
`;

// nav.js v4 — Schema injecté statiquement dans chaque page HTML
// Le schema LocalBusiness global a été retiré ici pour éviter les doublons
// avec les schemas spécifiques définis dans chaque page.

document.addEventListener('DOMContentLoaded', () => {

 // ── Inject nav
 const navContainer = document.getElementById('nav-container');
 if (navContainer) navContainer.innerHTML = NAV_HTML;

 // ── Inject footer
 const footerContainer = document.getElementById('footer-container');
 if (footerContainer) footerContainer.innerHTML = FOOTER_HTML;

 // ── Cible du lien d'évitement : premier bloc de contenu de la page
 if (!document.getElementById('contenu')) {
 const main = document.querySelector('main, .page-wrap, header.hero, .contact-hero');
 if (main) {
 main.id = 'contenu';
 main.setAttribute('tabindex', '-1');
 }
 }

 // ── Active page highlight
 const page = document.body.dataset.page;
 document.querySelectorAll('[data-page]').forEach(el => {
 if (el.dataset.page === page) el.classList.add('active');
 });

 // ── Burger menu
 const burger = document.getElementById('burger');
 const mobile = document.getElementById('navMobile');
 if (burger && mobile) {
 burger.addEventListener('click', () => {
   const isOpen = mobile.classList.toggle('open');
   burger.setAttribute('aria-expanded', isOpen);
   burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
   // La barre d'appel et la bulle WhatsApp flottent par-dessus le bas de
   // l'écran : sans ça, elles masquent les derniers liens du menu mobile.
   document.documentElement.classList.toggle('nav-mobile-open', isOpen);
 });
 mobile.querySelectorAll('a').forEach(a => {
 a.addEventListener('click', () => {
   mobile.classList.remove('open');
   document.documentElement.classList.remove('nav-mobile-open');
 });
 });
 }

 // ── Dropdown menus (Services + Zones)
 document.querySelectorAll('.nav-dropdown-toggle').forEach((toggle, i) => {
 const menu = toggle.closest('.nav-dropdown').querySelector('.nav-dropdown-menu');
 if (!menu) return;

 // Le lecteur d'écran doit annoncer qu'il s'agit d'un sous-menu, et son état.
 const menuId = menu.id || ('nav-dropdown-menu-' + i);
 menu.id = menuId;
 toggle.setAttribute('role', 'button');
 toggle.setAttribute('aria-haspopup', 'true');
 toggle.setAttribute('aria-controls', menuId);
 toggle.setAttribute('aria-expanded', 'false');

 const setOpen = (open) => {
 menu.classList.toggle('open', open);
 toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
 };

 toggle.addEventListener('click', (e) => {
 e.preventDefault();
 const willOpen = !menu.classList.contains('open');
 closeAllDropdowns();
 setOpen(willOpen);
 });

 // Échap referme et rend le focus au déclencheur.
 toggle.closest('.nav-dropdown').addEventListener('keydown', (e) => {
 if (e.key === 'Escape' && menu.classList.contains('open')) {
 setOpen(false);
 toggle.focus();
 }
 });
 });

 function closeAllDropdowns() {
 document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => {
 m.classList.remove('open');
 const t = m.closest('.nav-dropdown')?.querySelector('.nav-dropdown-toggle');
 if (t) t.setAttribute('aria-expanded', 'false');
 });
 }
 // Fermer les dropdowns au clic en dehors (capture:true pour iOS Safari)
 document.addEventListener('click', (e) => {
 if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
 }, { capture: true });
 // Fermer également au touch (mobile sans délai 300ms)
 document.addEventListener('touchstart', (e) => {
 if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
 }, { passive: true });

 // WhatsApp widget : chargé directement via <script src="whatsapp-widget.js"> dans chaque page HTML

});

/* ══════════════════════════════════════
   BARRE D'APPEL MOBILE — masquage au défilement
   Pose ou retire `callbar-hidden` sur <html>. Ce contrat est lu par
   shared.css (transform de .mobile-call-bar) et par whatsapp-widget.js
   (position du bouton flottant). Isolé dans son propre listener : une
   erreur ici ne doit pas emporter la nav ni le pied de page.
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.mobile-call-bar')) return; // absente de 12 pages

  const root = document.documentElement;
  const SEUIL = 8;        // absorbe le micro-défilement et le rebond iOS
  const ZONE_HAUTE = 80;  // toujours visible en haut de page
  const ZONE_BASSE = 60;  // et en bas, où le pied de page réserve déjà la place
  let dernierY = window.scrollY;
  let enAttente = false;

  window.addEventListener('scroll', () => {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(() => {
      const y = Math.max(0, window.scrollY); // iOS renvoie des valeurs négatives
      const enBas = (y + window.innerHeight) >= (document.body.scrollHeight - ZONE_BASSE);
      if (Math.abs(y - dernierY) > SEUIL) {
        root.classList.toggle('callbar-hidden', y > ZONE_HAUTE && y > dernierY && !enBas);
        dernierY = y;
      }
      enAttente = false;
    });
  }, { passive: true });
});
