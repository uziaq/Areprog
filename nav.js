/* ═══════════════════════════════════════════
 AREPROG — nav.js v3
 Navigation, footer, SEO schema, WhatsApp widget
 ═══════════════════════════════════════════ */

const NAV_HTML = `
<nav>
 <a href="index.html" class="nav-logo">ARE<span>PROG</span></a>
 <ul class="nav-links">
 <li><a href="index.html" data-page="index">Accueil</a></li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="services">Services ▾</a>
 <ul class="nav-dropdown-menu">
 <li><a href="stage1.html">Stage 1</a></li>
 <li><a href="stage2.html">Stage 2</a></li>
 <li><a href="conversion-e85.html">Conversion E85</a></li>
 <li><a href="optimisation-consommation.html">Optimisation consommation</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Désactivations</li>
 <li><a href="desactivation-egr.html">EGR</a></li>
 <li><a href="desactivation-fap.html">FAP</a></li>
 <li><a href="desactivation-adblue.html">AdBlue</a></li>
 <li class="dropdown-divider"></li>
 <li><a href="odis.html">Diagnostic ODIS <span class="nav-badge">VAG</span></a></li>
 </ul>
 </li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="zones">Zones ▾</a>
 <ul class="nav-dropdown-menu">
 <li class="dropdown-group-label">Pays Basque</li>
 <li><a href="reprogrammation-moteur-bayonne.html">Bayonne</a></li>
 <li><a href="reprogrammation-moteur-biarritz.html">Biarritz</a></li>
 <li><a href="reprogrammation-moteur-anglet.html">Anglet</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Pyrénées-Atlantiques</li>
 <li><a href="reprogrammation-moteur-pau.html">Pau</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Landes</li>
 <li><a href="reprogrammation-moteur-dax.html">Dax & Landes</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Yonne</li>
 <li><a href="reprogrammation-moteur-auxerre.html">Auxerre & Yonne</a></li>
 </ul>
 </li>
 <li><a href="about.html" data-page="about">À propos</a></li>
 <li><a href="faq.html" data-page="faq">FAQ</a></li>
 <li><a href="contact.html" data-page="contact">Contact</a></li>
 </ul>
 <a href="contact.html" class="nav-cta">Devis gratuit</a>
 <button class="nav-burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navMobile">
 <span></span><span></span><span></span>
 </button>
</nav>
<div class="nav-mobile" id="navMobile">
 <a href="index.html" data-page="index">Accueil</a>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Zones d'intervention</div>
 <a href="reprogrammation-moteur-bayonne.html" class="nav-mobile-sub">Bayonne</a>
 <a href="reprogrammation-moteur-biarritz.html" class="nav-mobile-sub">Biarritz</a>
 <a href="reprogrammation-moteur-anglet.html" class="nav-mobile-sub">Anglet</a>
 <a href="reprogrammation-moteur-pau.html" class="nav-mobile-sub">Pau</a>
 <a href="reprogrammation-moteur-dax.html" class="nav-mobile-sub">Dax & Landes</a>
 <a href="reprogrammation-moteur-auxerre.html" class="nav-mobile-sub">Auxerre & Yonne</a>
 </div>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Services</div>
 <a href="stage1.html" class="nav-mobile-sub">Stage 1</a>
 <a href="stage2.html" class="nav-mobile-sub">Stage 2</a>
 <a href="conversion-e85.html" class="nav-mobile-sub">Conversion E85</a>
 <a href="optimisation-consommation.html" class="nav-mobile-sub">Optimisation consommation</a>
 <a href="desactivation-egr.html" class="nav-mobile-sub">Désactivation EGR</a>
 <a href="desactivation-fap.html" class="nav-mobile-sub">Désactivation FAP</a>
 <a href="desactivation-adblue.html" class="nav-mobile-sub">Désactivation AdBlue</a>
 </div>
 <a href="about.html" data-page="about">À propos</a>
 <a href="faq.html" data-page="faq">FAQ</a>
 <a href="contact.html" data-page="contact">Nous contacter</a>
</div>
`;

const FOOTER_HTML = `
<footer>
 <div class="footer-top">
 <div class="footer-brand">
 <a href="index.html" class="footer-logo">ARE<span>PROG</span></a>
 <p>Votre moteur mérite mieux.<br>On vient chez vous, avec le bon matériel.</p>
 <a href="tel:+33667924630" class="footer-tel"> 06 67 92 46 30</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Services</div>
 <a href="stage1.html">Stage 1</a>
 <a href="stage2.html">Stage 2</a>
 <a href="conversion-e85.html">Conversion E85</a>
 <a href="optimisation-consommation.html">Optimisation consommation</a>
 <a href="desactivation-egr.html">Désactivation EGR</a>
 <a href="desactivation-fap.html">Désactivation FAP</a>
 <a href="desactivation-adblue.html">Désactivation AdBlue</a>
 <a href="odis.html">Diagnostic ODIS VAG</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Zones</div>
 <a href="reprogrammation-moteur-bayonne.html">Bayonne</a>
 <a href="reprogrammation-moteur-biarritz.html">Biarritz</a>
 <a href="reprogrammation-moteur-anglet.html">Anglet</a>
 <a href="reprogrammation-moteur-pau.html">Pau & Pyrénées-Atlantiques</a>
 <a href="reprogrammation-moteur-dax.html">Dax & Landes</a>
 <a href="reprogrammation-moteur-auxerre.html">Auxerre & Yonne</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Navigation</div>
 <a href="tarifs.html">Tarifs 2026</a>
 <a href="simulateur.html">Simulateur de gains</a>
 <a href="faq.html">FAQ</a>
 <a href="about.html">À propos</a>
 <a href="contact.html">Devis gratuit</a>
 </div>
 </div>
 <div class="footer-bottom">
 <span>© ${new Date().getFullYear()} AREPROG — Reprogrammation moteur à domicile</span>
 <div class="footer-bottom-links">
 <a href="mentions-legales.html">Mentions légales</a>
   <a href="politique-confidentialite.html">Confidentialité</a>
 <a href="sitemap.xml">Plan du site</a>
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
 });
 mobile.querySelectorAll('a').forEach(a => {
 a.addEventListener('click', () => mobile.classList.remove('open'));
 });
 }

 // ── Dropdown menus (Services + Zones)
 document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
 const menu = toggle.closest('.nav-dropdown').querySelector('.nav-dropdown-menu');
 if (!menu) return;
 toggle.addEventListener('click', (e) => {
 e.preventDefault();
 document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => {
 if (m !== menu) m.classList.remove('open');
 });
 menu.classList.toggle('open');
 });
 });
 document.addEventListener('click', (e) => {
 if (!e.target.closest('.nav-dropdown')) {
 document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => m.classList.remove('open'));
 }
 });

 // WhatsApp widget : chargé directement via <script src="whatsapp-widget.js"> dans chaque page HTML

});
