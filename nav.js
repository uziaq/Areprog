/* ═══════════════════════════════════════════
 AREPROG — nav.js v3
 Navigation, footer, SEO schema, WhatsApp widget
 ═══════════════════════════════════════════ */

const NAV_HTML = `
<nav>
 <a href="/" class="nav-logo">ARE<span>PROG</span></a>
 <ul class="nav-links">
 <li><a href="/" data-page="index">Accueil</a></li>
 <li class="nav-dropdown">
 <a href="#" class="nav-dropdown-toggle" data-page="services">Services ▾</a>
 <ul class="nav-dropdown-menu">
 <li><a href="/stage1">Stage 1</a></li>
 <li><a href="/stage2">Stage 2</a></li>
 <li><a href="/conversion-e85">Conversion E85</a></li>
 <li><a href="/ethanol-prix">Prix E85 en temps réel</a></li>
 <li><a href="/optimisation-consommation">Optimisation consommation</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Désactivations</li>
 <li><a href="/desactivation-egr">EGR</a></li>
 <li><a href="/desactivation-fap">FAP</a></li>
 <li><a href="/desactivation-adblue">AdBlue</a></li>
 <li class="dropdown-divider"></li>
 <li><a href="/odis">Diagnostic ODIS <span class="nav-badge">VAG</span></a></li>
 <li class="dropdown-divider"></li>
 <li><a href="/codage-vag">Codage VAG <span class="nav-badge" style="color:var(--green);border-color:rgba(52,211,153,.4)">NEW</span></a></li>
 <li><a href="/boutique-vag">Boutique Retrofit <span class="nav-badge" style="color:var(--amber);border-color:rgba(245,158,11,.4)">NEW</span></a></li>
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
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Pyrénées-Atlantiques</li>
 <li><a href="/reprogrammation-moteur-pau">Pau</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Landes</li>
 <li><a href="/reprogrammation-moteur-dax">Dax & Landes</a></li>
 <li class="dropdown-divider"></li>
 <li class="dropdown-group-label">Yonne</li>
 <li><a href="/reprogrammation-moteur-auxerre">Auxerre & Yonne</a></li>
 </ul>
 </li>
 <li><a href="/simulateur" data-page="simulateur">Simulateur</a></li>
 <li><a href="/tarifs" data-page="tarifs">Tarifs</a></li>
 <li><a href="/about" data-page="about">À propos</a></li>
 <li><a href="/faq" data-page="faq">FAQ</a></li>
 <li><a href="/contact" data-page="contact">Contact</a></li>
 </ul>
 <a href="/contact" class="nav-cta">Devis gratuit</a>
 <button class="nav-burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navMobile">
 <span></span><span></span><span></span>
 </button>
</nav>
<div class="nav-mobile" id="navMobile">
 <a href="/" data-page="index">Accueil</a>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Zones d'intervention</div>
 <a href="/reprogrammation-moteur-bayonne" class="nav-mobile-sub">Bayonne</a>
 <a href="/reprogrammation-moteur-biarritz" class="nav-mobile-sub">Biarritz</a>
 <a href="/reprogrammation-moteur-anglet" class="nav-mobile-sub">Anglet</a>
 <a href="/reprogrammation-moteur-saint-jean-de-luz" class="nav-mobile-sub">Saint-Jean-de-Luz</a>
 <a href="/reprogrammation-moteur-hendaye" class="nav-mobile-sub">Hendaye</a>
 <a href="/reprogrammation-moteur-pau" class="nav-mobile-sub">Pau</a>
 <a href="/reprogrammation-moteur-dax" class="nav-mobile-sub">Dax & Landes</a>
 <a href="/reprogrammation-moteur-auxerre" class="nav-mobile-sub">Auxerre & Yonne</a>
 </div>
 <div class="nav-mobile-group">
 <div class="nav-mobile-group-label">Services</div>
 <a href="/stage1" class="nav-mobile-sub" data-page="stage1">Stage 1</a>
 <a href="/stage2" class="nav-mobile-sub" data-page="stage2">Stage 2</a>
 <a href="/conversion-e85" class="nav-mobile-sub" data-page="conversion-e85">Conversion E85</a>
 <a href="/ethanol-prix" class="nav-mobile-sub" data-page="ethanol-prix">Prix E85 en temps réel</a>
 <a href="/optimisation-consommation" class="nav-mobile-sub" data-page="optimisation-consommation">Optimisation consommation</a>
 <a href="/desactivation-egr" class="nav-mobile-sub" data-page="desactivation-egr">Désactivation EGR</a>
 <a href="/desactivation-fap" class="nav-mobile-sub" data-page="desactivation-fap">Désactivation FAP</a>
 <a href="/desactivation-adblue" class="nav-mobile-sub" data-page="desactivation-adblue">Désactivation AdBlue</a>
 <a href="/odis" class="nav-mobile-sub" data-page="odis">Diagnostic ODIS VAG</a>
 <a href="/codage-vag" class="nav-mobile-sub" data-page="codage-vag">Codage VAG — Options cachées</a>
 <a href="/boutique-vag" class="nav-mobile-sub" data-page="boutique-vag">Boutique Retrofit VAG</a>
 </div>
 <a href="/tarifs" data-page="tarifs">Tarifs 2026</a>
 <a href="/about" data-page="about">À propos</a>
 <a href="/faq" data-page="faq">FAQ</a>
 <a href="/simulateur" data-page="simulateur">Simulateur</a>
 <a href="/contact" data-page="contact">Nous contacter</a>
</div>
`;

const FOOTER_HTML = `
<footer>
 <div class="footer-top">
 <div class="footer-brand">
 <a href="/" class="footer-logo">ARE<span>PROG</span></a>
 <p>Votre moteur mérite mieux.<br>On vient chez vous, avec le bon matériel.</p>
 <a href="tel:+33667924630" class="footer-tel"> 06 67 92 46 30</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Services</div>
 <a href="/stage1">Stage 1</a>
 <a href="/stage2">Stage 2</a>
 <a href="/conversion-e85">Conversion E85</a>
 <a href="/optimisation-consommation">Optimisation consommation</a>
 <a href="/desactivation-egr">Désactivation EGR</a>
 <a href="/desactivation-fap">Désactivation FAP</a>
 <a href="/desactivation-adblue">Désactivation AdBlue</a>
 <a href="/odis">Diagnostic ODIS VAG</a>
 <a href="/codage-vag">Codage VAG</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Zones</div>
 <a href="/reprogrammation-moteur-bayonne">Bayonne</a>
 <a href="/reprogrammation-moteur-biarritz">Biarritz</a>
 <a href="/reprogrammation-moteur-anglet">Anglet</a>
 <a href="/reprogrammation-moteur-saint-jean-de-luz">Saint-Jean-de-Luz</a>
 <a href="/reprogrammation-moteur-hendaye">Hendaye</a>
 <a href="/reprogrammation-moteur-pau">Pau & Pyrénées-Atlantiques</a>
 <a href="/reprogrammation-moteur-dax">Dax & Landes</a>
 <a href="/reprogrammation-moteur-auxerre">Auxerre & Yonne</a>
 </div>
 <div class="footer-col">
 <div class="footer-col-title">Navigation</div>
 <a href="/tarifs">Tarifs 2026</a>
 <a href="/simulateur">Simulateur de gains</a>
 <a href="/ethanol-prix">Prix E85 en temps réel</a>
 <a href="/faq">FAQ</a>
 <a href="/about">À propos</a>
 <a href="/chip-tuning-pays-basque">Chip Tuning Pays Basque</a>
 <a href="/guide-reprogrammation-moteur">Guide reprogrammation</a>
 <a href="/contact">Devis gratuit</a>
 </div>
 </div>
 <div class="footer-bottom">
 <span>© ${new Date().getFullYear()} AREPROG — Reprogrammation moteur à domicile</span>
 <div class="footer-bottom-links">
 <a href="/mentions-legales">Mentions légales</a>
   <a href="/politique-confidentialite">Confidentialité</a>
 <a href="/sitemap-visuel.html">Plan du site</a>
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
 // Fermer les dropdowns au clic en dehors (capture:true pour iOS Safari)
 document.addEventListener('click', (e) => {
 if (!e.target.closest('.nav-dropdown')) {
 document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => m.classList.remove('open'));
 }
 }, { capture: true });
 // Fermer également au touch (mobile sans délai 300ms)
 document.addEventListener('touchstart', (e) => {
 if (!e.target.closest('.nav-dropdown')) {
 document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => m.classList.remove('open'));
 }
 }, { passive: true });

 // WhatsApp widget : chargé directement via <script src="whatsapp-widget.js"> dans chaque page HTML

});
