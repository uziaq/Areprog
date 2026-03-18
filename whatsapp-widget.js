/* ═══════════════════════════════════════════
 AREPROG — WhatsApp Floating Widget
 Injecter via <script src="whatsapp-widget.js"></script>
 ═══════════════════════════════════════════ */

(function() {
 const WA_NUMBER = '33667924630';
 const WA_MSG = encodeURIComponent("Bonjour AREPROG ! J'ai une question à propos de mon véhicule!");
 const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

 // CSS
 const style = document.createElement('style');
 style.textContent = `
 #wa-widget {
 position: fixed;
 bottom: 1.8rem;
 right: 1.8rem;
 z-index: 9000;
 display: flex;
 flex-direction: column;
 align-items: flex-end;
 gap: .8rem;
 }

 /* Bubble tooltip */
 #wa-bubble {
 background: #1c1e20;
 border: 1px solid #2f3336;
 padding: .9rem 1.2rem;
 max-width: 220px;
 font-family: 'Barlow', sans-serif;
 font-size: .82rem;
 line-height: 1.5;
 color: #e8eaed;
 position: relative;
 display: none;
 animation: waFadeUp .25s ease;
 box-shadow: 0 8px 32px rgba(0,0,0,.4);
 }
 #wa-bubble.visible { display: block; }
 #wa-bubble strong { color: #25D366; font-weight: 600; }
 #wa-bubble::after {
 content: '';
 position: absolute;
 bottom: -6px; right: 1.4rem;
 width: 10px; height: 10px;
 background: #1c1e20;
 border-right: 1px solid #2f3336;
 border-bottom: 1px solid #2f3336;
 transform: rotate(45deg);
 }
 #wa-close {
 position: absolute; top: .4rem; right: .5rem;
 background: none; border: none; color: #565a60;
 cursor: pointer; font-size: .85rem; padding: .1rem .3rem;
 line-height: 1;
 }
 #wa-close:hover { color: #e8eaed; }

 /* Main button */
 #wa-btn {
 width: 3.4rem; height: 3.4rem;
 background: #25D366;
 border: none; border-radius: 50%;
 display: flex; align-items: center; justify-content: center;
 cursor: pointer;
 box-shadow: 0 4px 20px rgba(37,211,102,.35);
 transition: background .2s, transform .2s, box-shadow .2s;
 text-decoration: none;
 }
 #wa-btn:hover {
 background: #1ebe5a;
 transform: scale(1.08);
 box-shadow: 0 6px 28px rgba(37,211,102,.5);
 }
 #wa-btn svg {
 width: 1.7rem; height: 1.7rem; fill: #fff;
 }

 /* Pulse ring */
 #wa-btn::before {
 content: '';
 position: absolute;
 width: 3.4rem; height: 3.4rem;
 border-radius: 50%;
 border: 2px solid rgba(37,211,102,.4);
 animation: waPulse 2.5s ease-out infinite;
 }
 #wa-btn { position: relative; }

 @keyframes waPulse {
 0% { transform: scale(1); opacity: .8; }
 100% { transform: scale(1.8); opacity: 0; }
 }
 @keyframes waFadeUp {
 from { opacity: 0; transform: translateY(8px); }
 to { opacity: 1; transform: translateY(0); }
 }

 /* Don't show on contact page (already has WA button) */
 body[data-page="contact"] #wa-widget { display: none; }

 @media (max-width: 600px) {
 #wa-widget { bottom: 1.2rem; right: 1.2rem; }
 #wa-bubble { max-width: 180px; font-size: .78rem; }
 }
 `;
 document.head.appendChild(style);

 // HTML
 const widget = document.createElement('div');
 widget.id = 'wa-widget';
 widget.innerHTML = `
 <div id="wa-bubble">
 <button id="wa-close" aria-label="Fermer"></button>
 <strong>Besoin d'un devis rapide ?</strong><br>
 On vous répond sur WhatsApp en quelques minutes.
 </div>
 <a id="wa-btn" href="${WA_URL}" target="_blank" rel="noopener" aria-label="Contacter AREPROG sur WhatsApp">
 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
 <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.12 1.529 5.845L.057 23.093a.75.75 0 0 0 .924.924l5.205-1.458A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.503-5.25-1.381l-.375-.22-3.886 1.088 1.104-3.805-.238-.386A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
 </svg>
 </a>
 `;
 document.body.appendChild(widget);

 // Show bubble after 4s on first visit
 const bubble = document.getElementById('wa-bubble');
 const closeBtn = document.getElementById('wa-close');
 const waBtn = document.getElementById('wa-btn');

 const dismissed = sessionStorage.getItem('wa-dismissed');
 if (!dismissed) {
 setTimeout(() => bubble.classList.add('visible'), 4000);
 }

 closeBtn.addEventListener('click', (e) => {
 e.preventDefault();
 bubble.classList.remove('visible');
 sessionStorage.setItem('wa-dismissed', '1');
 });

 // Toggle bubble on button click (mobile)
 waBtn.addEventListener('click', (e) => {
 if (window.innerWidth < 600) {
 // On mobile, just open WA directly
 return;
 }
 });

})();
