// AUTH — Appel direct API Netlify Identity (fetch natif, zéro dépendance)
function $(s) { return document.getElementById(s); }

// ── Auth : Firebase Authentication ──────────────────────────
function showApp() {
  $('login-screen').style.display = 'none';
  $('app').style.display = 'block';
  initApp();
}
function showLogin() {
  $('app').style.display = 'none';
  $('login-screen').style.display = 'flex';
}
function setLoginLoading(on) {
  var btn = $('login-btn');
  btn.disabled = on;
  btn.textContent = on ? 'Connexion…' : 'Se connecter →';
}
function showLoginErr(msg) {
  var el = $('lerr');
  el.textContent = msg;
  el.style.display = 'block';
}

async function doLogin() {
  var email = $('l-email').value.trim();
  var pass  = $('l-pass').value;
  $('lerr').style.display = 'none';
  if (!email || !pass) { showLoginErr('Renseigne ton email et mot de passe.'); return; }
  setLoginLoading(true);
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
    // onAuthStateChanged prend le relais automatiquement
  } catch(e) {
    setLoginLoading(false);
    var msg = 'Email ou mot de passe incorrect.';
    if (e.code === 'auth/too-many-requests') msg = 'Trop de tentatives. Réessaie dans quelques minutes.';
    showLoginErr(msg);
    console.error(e);
  }
}

function doLogout() {
  firebase.auth().signOut();
}

function applyThemeIcon() {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var btn = $('theme-toggle-btn');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
  var meta = $('theme-color-meta');
  if (meta) meta.setAttribute('content', dark ? '#14161a' : '#f4f5f7');
}

function toggleTheme() {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (dark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('ar_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('ar_theme', 'dark');
  }
  applyThemeIcon();
}

// Appel d'une Netlify Function avec le jeton d'identité Firebase.
// Les fonctions refusent les requêtes non authentifiées.
async function authedFetch(url, options) {
  var opts = options || {};
  var user = firebase.auth().currentUser;
  if (!user) throw new Error('Session expirée — reconnecte-toi.');
  var idToken = await user.getIdToken();
  var headers = Object.assign({}, opts.headers || {}, { 'Authorization': 'Bearer ' + idToken });
  return fetch(url, Object.assign({}, opts, { headers: headers }));
}

// Au chargement : session encore valide → connecter directement
document.addEventListener('DOMContentLoaded', function() {
  applyThemeIcon();
  // Charger jsPDF, html2canvas dynamiquement
  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb || function(){};
    s.onerror = function(){ console.warn('Script non chargé:', src); };
    document.head.appendChild(s);
  }
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

  // Touches clavier
  var lp = $('l-pass');
  if (lp) lp.addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });
  var le = $('l-email');
  if (le) le.addEventListener('keydown', function(e){ if(e.key==='Enter') $('l-pass').focus(); });

  // Initialiser Firebase avant tout appel à firebase.auth()
  if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
  db = firebase.firestore();

  // Gestion de session via Firebase Auth
  // onAuthStateChanged est appelé à chaque changement d'état (login, logout, expiration)
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      showApp();
    } else {
      setLoginLoading(false);
      showLogin();
    }
  });

  // Relier le bouton proprement (évite tout souci de timing)
  var btn = $('login-btn');
  if (btn) btn.onclick = doLogin;
  // Enter dans les modals catalogue
  var cli = $('cat-item-label');
  if (cli) cli.addEventListener('keydown', function(e){ if(e.key==='Enter') saveCatItem(); });
  var cgi = $('cat-group-name-input');
  if (cgi) cgi.addEventListener('keydown', function(e){ if(e.key==='Enter') confirmAddGroup(); });
});

// ============================================================
//  FIREBASE — Synchronisation cloud
// ============================================================
var FB_CONFIG = {
  apiKey:            "AIzaSyCAPjBtmwrcNUUg9Nlkn_2ltUa_P_90yV4",
  authDomain:        "areprog-devis.firebaseapp.com",
  projectId:         "areprog-devis",
  storageBucket:     "areprog-devis.firebasestorage.app",
  messagingSenderId: "1047582505562",
  appId:             "1:1047582505562:web:32cefe1cab9eeeb270f663",
};

var db = null;
var syncOk = false;

function initFirebase() {
  try {
    // Firebase est déjà initialisé dans DOMContentLoaded avant onAuthStateChanged
    // On s'assure juste que db est disponible
    if (!db) db = firebase.firestore();
    if (!window._storage) window._storage = firebase.storage();
    // Test de connexion Firestore
    db.collection('docs').limit(1).get()
      .then(function() { setSyncStatus(true, 'Firebase connecté'); })
      .catch(function(e) { setSyncStatus(false, 'Firestore inaccessible'); console.warn(e); });
  } catch(e) {
    setSyncStatus(false, 'Firebase non disponible');
    console.warn('Firebase init failed:', e);
  }
}

function setSyncStatus(ok, msg) {
  syncOk = ok;
  var dot = $('sync-dot');
  var lbl = $('sync-status');
  if (!dot || !lbl) return;
  dot.className = 'sync-dot ' + (ok ? 'ok' : 'err');
  lbl.textContent = msg;
  if (ok) {
    var last = $('sync-last');
    if (last) last.textContent = 'Sync ' + new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});
  }
}

function setSyncLoading(msg) {
  var dot = $('sync-dot');
  var lbl = $('sync-status');
  if (dot) dot.className = 'sync-dot loading';
  if (lbl) lbl.textContent = msg || 'Synchronisation…';
}

// ── DOCS ────────────────────────────────────────────────────────────────────
function loadDocs() {
  return JSON.parse(localStorage.getItem('ar_docs') || '[]');
}

function saveDocs(arr) {
  localStorage.setItem('ar_docs', JSON.stringify(arr));
  // Sync Firebase en arrière-plan
  if (db && syncOk) {
    arr.forEach(function(doc) {
      db.collection('docs').doc(String(doc.id)).set(doc)
        .catch(function(e){ console.warn('Firebase save doc:', e); });
    });
  }
}

// Sync Firebase → localStorage (appelé au démarrage)
function syncFromFirebase(callback) {
  if (!db) { if (callback) callback(); return; }
  setSyncLoading('Chargement depuis Firebase…');
  db.collection('docs').orderBy('date','desc').get()
    .then(function(snap) {
      if (!snap.empty) {
        var docs = [];
        snap.forEach(function(d){ docs.push(d.data()); });
        localStorage.setItem('ar_docs', JSON.stringify(docs));
      }
      // Sync clients
      return db.collection('clients').get();
    })
    .then(function(snap) {
      if (snap && !snap.empty) {
        var clients = [];
        snap.forEach(function(d){ clients.push(d.data()); });
        localStorage.setItem('ar_clients', JSON.stringify(clients));
      }
      syncCatalogueFromFirebase();
      syncRdvDispoFromFirebase();
      syncRdvsFromFirebase();
      setSyncStatus(true, 'Firebase synchronisé');
      renderDash();
      renderCarnet();
      if (callback) callback();
    })
    .catch(function(e) {
      setSyncStatus(false, 'Sync échouée — données locales');
      console.warn('Firebase sync:', e);
      if (callback) callback();
    });
}

// Listener temps réel — met à jour si un autre appareil modifie
function startRealtimeSync() {
  if (!db || !syncOk) return;
  db.collection('docs').onSnapshot(function(snap) {
    var docs = [];
    snap.forEach(function(d){ docs.push(d.data()); });
    docs.sort(function(a,b){ return (b.id||0)-(a.id||0); });
    localStorage.setItem('ar_docs', JSON.stringify(docs));
    renderDash();
    if ($('t-liste') && $('t-liste').classList.contains('on')) renderListe();
    setSyncStatus(true, 'Synchronisé en temps réel');
  }, function(e){ console.warn('Realtime sync err:', e); });

  db.collection('clients').onSnapshot(function(snap) {
    var clients = [];
    snap.forEach(function(d){ clients.push(d.data()); });
    localStorage.setItem('ar_clients', JSON.stringify(clients));
    if ($('t-carnet') && $('t-carnet').classList.contains('on')) renderCarnet();
  }, function(e){ console.warn('Clients sync err:', e); });
}

// ── VÉHICULES MULTIPLES ──────────────────────────────────────────────────────
var vehRowId = 0;
function removeVehRow(btn) {
  var row = btn.parentElement && btn.parentElement.parentElement;
  if (row && row.classList.contains('veh-row')) row.remove();
}
function addVehicleRow(data) {
  data = data || {};
  var id = ++vehRowId;
  var vl = $('ac-veh-list');
  if (!vl) return;
  var div = document.createElement('div');
  div.className = 'veh-row';
  div.dataset.vehId = data.id || ('cv' + Date.now() + id);
  div._photos = (data.photos || []).slice();
  div._videos = (data.videos || []).slice();
  div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px';
  div.innerHTML =
    '<div style="display:flex;gap:6px;margin-bottom:6px">'
    + '<input class="vr-vm" type="text" placeholder="Marque" value="'+escHtml(data.vm)+'" style="flex:1;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"/>'
    + '<input class="vr-vmo" type="text" placeholder="Modèle" value="'+escHtml(data.vmo)+'" style="flex:1.5;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"/>'
    + '<button onclick="removeVehRow(this)" style="width:28px;height:32px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text-dim);cursor:pointer;font-size:16px;flex-shrink:0">×</button>'
    + '</div>'
    + '<div style="display:flex;gap:6px">'
    + '<input class="vr-vmot" type="text" placeholder="Motorisation" value="'+escHtml(data.vmot)+'" style="flex:2;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"/>'
    + '<input class="vr-van" type="text" placeholder="Année" value="'+escHtml(data.van)+'" style="flex:0.8;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"/>'
    + '<input class="vr-vim" type="text" placeholder="Immat" value="'+escHtml(data.vim)+'" style="flex:1.2;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;text-transform:uppercase"/>'
    + '</div>'
    + '<textarea class="vr-notes" placeholder="Notes internes (état du véhicule, historique, remarques...)" style="width:100%;margin-top:6px;padding:7px 9px;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12.5px;font-family:inherit;resize:vertical;min-height:40px;box-sizing:border-box">'+escHtml(data.notes)+'</textarea>'
    + '<div class="veh-media vr-photo-list" style="margin-top:8px"></div>'
    + '<div style="margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
    + '<label class="veh-upload" style="font-size:11px;padding:6px 10px">📷 Ajouter des photos<input type="file" accept="image/*" multiple style="display:none" onchange="uploadClientVehPhotos(this)"/></label>'
    + '<span class="vr-photo-status" style="font-size:11px"></span>'
    + '</div>'
    + '<div class="vr-video-list" style="margin-top:8px"></div>'
    + '<div style="margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
    + '<label class="veh-upload" style="font-size:11px;padding:6px 10px">🎥 Ajouter une vidéo (4 Mo max)<input type="file" accept="video/mp4,video/quicktime" multiple style="display:none" onchange="uploadClientVehVideos(this)"/></label>'
    + '<span class="vr-video-status" style="font-size:11px"></span>'
    + '</div>';
  vl.appendChild(div);
  renderVehRowPhotos(div);
  renderVehRowVideos(div);
}

function renderVehRowPhotos(row) {
  var el = row.querySelector('.vr-photo-list');
  if (!el) return;
  var photos = row._photos || [];
  el.innerHTML = photos.map(function(p, i) {
    return '<div class="veh-thumb" style="background-image:url(\''+escHtml(p.url)+'\')">'
      + '<div class="veh-thumb-acts">'
        + '<button type="button" onclick="openClientVehPhoto(this,'+i+')" title="Ouvrir">⤢</button>'
        + '<button type="button" onclick="removeClientVehPhoto(this,'+i+')" title="Retirer">🗑</button>'
      + '</div></div>';
  }).join('');
}

function openClientVehPhoto(btn, i) {
  var row = btn.closest('.veh-row');
  if (row && row._photos[i]) window.open(row._photos[i].url, '_blank', 'noopener');
}

function removeClientVehPhoto(btn, i) {
  var row = btn.closest('.veh-row');
  if (!row) return;
  row._photos.splice(i, 1);
  renderVehRowPhotos(row);
}

// Envoi des photos d'un véhicule client vers Firebase Storage (même fonction
// Netlify que le module Parc auto — resizeImage/fileToBase64/UPLOAD_EXT/
// safeUploadName/uploadVehFile sont définis plus bas dans ce même script).
async function uploadClientVehPhotos(input) {
  var row = input.closest('.veh-row');
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length || !row) return;
  var status = row.querySelector('.vr-photo-status');
  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Envoi ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    try {
      var img = await resizeImage(files[i], 1600);
      var ct  = img ? img.contentType : (files[i].type || '');
      if (!UPLOAD_EXT[ct]) throw new Error('Format non accepté : ' + (files[i].name || 'photo'));
      var b64  = img ? img.base64 : await fileToBase64(files[i]);
      var name = safeUploadName(files[i].name || 'photo', UPLOAD_EXT[ct]);
      var res = await uploadVehFile({
        fileBase64: b64, contentType: ct, kind: 'photo',
        vehiculeId: row.dataset.vehId, filename: name,
      });
      row._photos.push({ url: res.url, path: res.path, name: name });
      renderVehRowPhotos(row);
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '✓ ' + files.length + ' photo' + (files.length > 1 ? 's' : '') + ' ajoutée' + (files.length > 1 ? 's' : '');
  status.style.color = 'var(--green)';
}

// Formats vidéo acceptés par upload-vehicule, et taille max associée : la
// fonction Netlify reçoit le fichier encodé en base64 dans le corps JSON de
// la requête, plafonné à ~6 Mo par Netlify — d'où cette limite bien plus
// basse que pour un fichier stocké tel quel.
var UPLOAD_VIDEO_EXT = { 'video/mp4': 'mp4', 'video/quicktime': 'mov' };
var MAX_VIDEO_UPLOAD_BYTES = 4 * 1024 * 1024;

function renderVehRowVideos(row) {
  var el = row.querySelector('.vr-video-list');
  if (!el) return;
  var videos = row._videos || [];
  if (!videos.length) { el.innerHTML = ''; return; }
  el.innerHTML = videos.map(function(v, i) {
    return '<div class="veh-doc">'
      + '<span>🎥</span>'
      + '<a href="' + escHtml(v.url) + '" target="_blank" rel="noopener">' + escHtml(v.name || 'vidéo') + '</a>'
      + '<button type="button" class="exp-del" onclick="removeClientVehVideo(this,' + i + ')" title="Retirer">×</button>'
      + '</div>';
  }).join('');
}

function removeClientVehVideo(btn, i) {
  var row = btn.closest('.veh-row');
  if (!row) return;
  row._videos.splice(i, 1);
  renderVehRowVideos(row);
}

async function uploadClientVehVideos(input) {
  var row = input.closest('.veh-row');
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length || !row) return;
  var status = row.querySelector('.vr-video-status');
  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Envoi ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    try {
      var ct = files[i].type || '';
      if (!UPLOAD_VIDEO_EXT[ct]) throw new Error('Format non accepté : ' + (files[i].name || 'vidéo') + ' (MP4 ou MOV uniquement)');
      if (files[i].size > MAX_VIDEO_UPLOAD_BYTES) throw new Error((files[i].name || 'Vidéo') + ' dépasse 4 Mo — raccourcis le clip ou compresse-le avant envoi');
      var name = safeUploadName(files[i].name || 'video', UPLOAD_VIDEO_EXT[ct]);
      var res = await uploadVehFile({
        fileBase64: await fileToBase64(files[i]), contentType: ct, kind: 'video',
        vehiculeId: row.dataset.vehId, filename: name,
      });
      row._videos.push({ url: res.url, path: res.path, name: name });
      renderVehRowVideos(row);
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '✓ ' + files.length + ' vidéo' + (files.length > 1 ? 's' : '') + ' ajoutée' + (files.length > 1 ? 's' : '');
  status.style.color = 'var(--green)';
}

// ── Fichiers rattachés directement à la fiche client (hors véhicule) ────────
// acDocs reflète le formulaire ouvert ; acDraftId identifie le dossier de
// stockage Firebase (id du client existant, ou un id généré à l'ouverture du
// formulaire pour un nouveau client — repris comme id définitif à l'enregistrement
// pour que les fichiers déjà envoyés restent associés au bon client).
var acDocs = [];
var acDraftId = null;

function renderAcDocs() {
  var el = $('ac-doc-list');
  if (!el) return;
  if (!acDocs.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">Aucun fichier.</div>';
    return;
  }
  el.innerHTML = acDocs.map(function(d, i) {
    return '<div class="veh-doc">'
      + '<span>' + (String(d.name||'').toLowerCase().endsWith('.pdf') ? '📄' : '🖼️') + '</span>'
      + '<a href="' + escHtml(d.url) + '" target="_blank" rel="noopener">' + escHtml(d.name || 'fichier') + '</a>'
      + '<span style="color:var(--text-muted);font-size:11px">' + escHtml(CLIENT_DOC_TYPES[d.type] || 'Autre') + '</span>'
      + '<button type="button" class="exp-del" onclick="removeAcDoc(' + i + ')" title="Retirer">×</button>'
      + '</div>';
  }).join('');
}

function removeAcDoc(i) {
  acDocs.splice(i, 1);
  renderAcDocs();
}

async function uploadClientDocs(input) {
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length) return;
  var status = $('ac-doc-status');
  var type = $('ac-doc-type').value;

  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Envoi ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    if (files[i].size > 8 * 1024 * 1024) {
      status.textContent = '✗ ' + files[i].name + ' dépasse 8 Mo';
      status.style.color = 'var(--red)';
      return;
    }
    try {
      var ct = files[i].type || 'application/pdf';
      if (!UPLOAD_EXT[ct]) throw new Error('Format non accepté : ' + (files[i].name || 'fichier') + ' (PDF ou image)');
      var name = safeUploadName(files[i].name || 'fichier', UPLOAD_EXT[ct]);
      var res = await uploadVehFile({
        fileBase64: await fileToBase64(files[i]),
        contentType: ct,
        kind: 'document',
        entity: 'client',
        vehiculeId: String(acDraftId),
        filename: name,
      });
      acDocs.push({ url: res.url, path: res.path, name: name, type: type });
      renderAcDocs();
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '✓ ' + files.length + ' fichier' + (files.length > 1 ? 's' : '') + ' ajouté' + (files.length > 1 ? 's' : '');
  status.style.color = 'var(--green)';
}

// Ouvrir le sélecteur de véhicule pour un client dans le formulaire devis
function openVehSelect(clientId) {
  var cl = loadClients().find(function(cl){ return cl.id === clientId; });
  if (!cl) return;
  var vehs = cl.vehs && cl.vehs.length ? cl.vehs
    : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}] : []);
  if (vehs.length === 0) return;
  if (vehs.length === 1) { applyVehicle(vehs[0]); return; }
  // Plusieurs véhicules → afficher le sélecteur
  var list = $('veh-select-list');
  list.innerHTML = vehs.map(function(v, i) {
    var label = [v.vm,v.vmo,v.vmot,v.van?'('+v.van+')':''].filter(Boolean).join(' ');
    return '<div class="veh-item" onclick="applyVehicle('+JSON.stringify(v).replace(/"/g,'&quot;')+')">'
      + '<div class="veh-item-info">'
        + '<div class="veh-item-name">'+escHtml(label)+'</div>'
        + (v.vim ? '<div class="veh-item-sub">'+escHtml(v.vim.toUpperCase())+'</div>' : '')
      + '</div>'
      + '<span style="color:var(--blue);font-size:18px">→</span>'
      + '</div>';
  }).join('');
  $('veh-select-modal').classList.add('open');
}

function applyVehicle(v) {
  $('f-vm').value   = v.vm   || '';
  $('f-vmo').value  = v.vmo  || '';
  $('f-vmot').value = v.vmot || '';
  $('f-van').value  = v.van  || '';
  $('f-vim').value  = (v.vim || '').toUpperCase();
  $('veh-select-modal').classList.remove('open');
}

// ── CLIENTS ─────────────────────────────────────────────────────────────────
function loadClients() {
  return JSON.parse(localStorage.getItem('ar_clients') || '[]');
}

function saveClients(arr) {
  localStorage.setItem('ar_clients', JSON.stringify(arr));
  if (db && syncOk) {
    arr.forEach(function(cl) {
      db.collection('clients').doc(String(cl.id)).set(cl)
        .catch(function(e){ console.warn('Firebase save client:', e); });
    });
  }
}

function deleteDocFirebase(docId) {
  if (db && syncOk) {
    db.collection('docs').doc(String(docId)).delete()
      .catch(function(e){ console.warn('Firebase delete:', e); });
  }
}

function deleteClientFirebase(clientId) {
  if (db && syncOk) {
    db.collection('clients').doc(String(clientId)).delete()
      .catch(function(e){ console.warn('Firebase delete client:', e); });
  }
}

// ============================================================
//  CATALOGUE — extrait exact de tarifs.html
// ============================================================
var CAT_DEFAULT = [
  { g: 'Reprogrammation moteur', items: [
    { l: 'Stage 1 — Reprogrammation moteur (essence & diesel turbo) · 100% réversible', p: 330,
      gains: ['Meilleure réactivité moteur', 'Couple optimisé dès bas régimes', 'Agrément de conduite amélioré', '100% réversible'] },
    { l: 'Stage 2 — Reprogrammation haute performance (avec modifs mécaniques)', p: 460,
      gains: ['Cartographie sur-mesure', 'Couple & puissance maximisés', 'Suivi personnalisé', '100% réversible'] },
    { l: 'Conversion E85 — Bioéthanol natif ECU · Sans boîtier externe', p: 330,
      gains: ['Carburant E85 ≈ 0,75 €/L vs 1,80 €/L SP95', '−40% sur le coût carburant', 'Compatible toutes stations E85', 'Bilan carbone amélioré'] },
    { l: 'Optimisation consommation — Idéal grands rouleurs & flottes', p: 380,
      gains: ['−10 à −15% de carburant', 'Idéal grands rouleurs & flottes', 'Couple amélioré bas régime'] },
    { l: 'Retour à l\'origine — Restauration fichier constructeur (offert si reprog AREPROG)', p: 0, gains: [] },
  ]},
  { g: 'Désactivations — usage spécifique', items: [
    { l: 'EGR OFF — Désactivation vanne EGR · Diesel · Logiciel uniquement', p: 180,
      gains: ['Admission protégée de l\'encrassement', 'Moteur plus propre', 'Fiabilité accrue +80 000 km'] },
    { l: 'FAP / DPF OFF — Usage circuit & export uniquement (après retrait physique)', p: 280,
      gains: ['Régénérations forcées supprimées', 'Contre-pressions éliminées', 'Consommation stabilisée'] },
    { l: 'AdBlue / SCR OFF — Désactivation réduction catalytique · Hors homologation voie publique', p: 280,
      gains: ['Coût AdBlue supprimé', 'Système simplifié', 'Alertes défaillance supprimées'] },
    { l: 'Swirl OFF — Désactivation volets d\'admission · Diesel · Prévention défaillances', p: 140,
      gains: ['Prévention casse mécanique', 'Moteur protégé', 'Aucun impact sur les performances'] },
  ]},
  { g: 'Packs combinés — économies garanties', items: [
    { l: 'Pack Stage 1 + EGR OFF · Diesel — 2 prestations en 1 intervention', p: 370,
      gains: ['Performance + protection admission', 'Économie vs prestations séparées', '2 prestations en 1 déplacement'] },
    { l: 'Pack Stage 1 + FAP OFF · Diesel (après retrait physique du filtre)', p: 370,
      gains: ['Performance + suppression régénérations', 'Économie vs prestations séparées', '2 prestations en 1 déplacement'] },
    { l: 'Pack Stage 1 + EGR + FAP OFF — Préparation diesel complète ★', p: 390,
      gains: ['Performance + protection + flux échappement', 'Tout en une seule intervention', 'Économies maximales'] },
    { l: 'Pack Stage 1 + AdBlue OFF — Moteur optimisé + SCR désactivé', p: 400,
      gains: ['Performance moteur', 'Coût AdBlue supprimé', 'Économie vs prestations séparées'] },
  ]},
  { g: 'Diagnostic & spécialités VAG', items: [
    { l: 'Diagnostic ODIS VAG — VW · Audi · Seat · Skoda · Porsche · Outil officiel constructeur', p: 100,
      gains: ['Diagnostic officiel constructeur', 'Codages avancés disponibles', 'Mises à jour via serveurs VAG officiels'] },
  ]},
  { g: 'Options logicielles (en complément d\'une reprog, sinon +100 €)', items: [
    { l: 'Pop & Bang — Détonations à la décélération · Effet sonore agressif', p: 150, gains: ['Son sportif à la décélération'] },
    { l: 'Pop & Bang Sport Button — Pops actifs uniquement en mode Sport', p: 180, gains: ['Pops actifs en mode Sport uniquement'] },
    { l: 'DSG Farts — Crépitements à la décélération sur boîtes DSG', p: 150, gains: ['Crépitements DSG à la décélération'] },
    { l: 'Popcorn — Crépitements agressifs continus', p: 150, gains: ['Crépitements agressifs continus'] },
    { l: 'Launch Control — Optimisation départ arrêté · Meilleur 0-100', p: 150, gains: ['Départ arrêté optimisé', 'Meilleur chrono 0-100'] },
    { l: 'Octane Adaptation — Adaptation automatique selon indice d\'octane', p: 360, gains: ['Adaptation auto selon carburant utilisé'] },
    { l: 'Exhaust Flaps — Gestion des clapets d\'échappement selon le mode', p: 60, gains: ['Gestion des clapets par mode de conduite'] },
    { l: 'Start & Stop OFF — Désactivation définitive du Start & Stop', p: 60, gains: ['Start & Stop définitivement désactivé'] },
    { l: 'Vmax OFF — Suppression du limiteur de vitesse constructeur', p: 60, gains: ['Bridage vitesse supprimé'] },
    { l: 'Power on Driving Mode — Démarrage automatique en mode Sport', p: 60, gains: ['Démarre toujours en mode Sport'] },
    { l: 'Sport Display — Affichage données sportives au tableau de bord', p: 60, gains: ['Données sportives sur le tableau de bord'] },
    { l: 'Vmax 30 — Limitation à 30 km/h', p: 90, gains: ['Limitation à 30 km/h — chantier/logistique'] },
  ]},
  { g: 'Suppléments & options', items: [
{ l: 'Supplément fichier inconnu (reprise modif tiers)', p: 30, gains: [] },
    { l: 'Supplément intervention urgente (sous 24h)', p: 50, gains: [] },
    { l: 'Prestation personnalisée / Sur-mesure', p: 0, gains: [] },
  ]},
];

// ============================================================
//  CATALOGUE DYNAMIQUE — modifiable par l'utilisateur
// ============================================================
var CAT_KEY = 'ar_catalogue';

function loadCat() {
  try {
    var raw = localStorage.getItem(CAT_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(CAT_DEFAULT));
  } catch(e) { return JSON.parse(JSON.stringify(CAT_DEFAULT)); }
}

function saveCat(cat) {
  localStorage.setItem(CAT_KEY, JSON.stringify(cat));
  // Sync Firebase
  if (db && syncOk) {
    db.collection('config').doc('catalogue').set({ cat: cat })
      .catch(function(e){ console.warn('Firebase cat save:', e); });
  }
}

// CAT actif (rechargé à chaque renderLines)
var CAT = loadCat();

function reloadCat() {
  CAT = loadCat();
}


// Gains automatiques par mot-clé
// getGains — récupère les gains directement depuis le catalogue dynamique
function getGains(lines) {
  var cat = loadCat();
  var set = new Set();
  lines.forEach(function(l) {
    if (!l.label) return;
    // Cherche la prestation exacte dans le catalogue
    for (var gi = 0; gi < cat.length; gi++) {
      for (var ii = 0; ii < cat[gi].items.length; ii++) {
        var it = cat[gi].items[ii];
        if (it.l === l.label && it.gains && it.gains.length) {
          it.gains.forEach(function(g){ if(g) set.add(g); });
        }
      }
    }
  });
  return [...set].slice(0, 8);
}

// ============================================================
//  HELPERS
// ============================================================
function fmt(n) { return n.toFixed(2).replace('.', ',') + ' \u20ac'; }
function fmtDate(d) {
  if (!d) return '\u2014';
  const [y,m,j] = d.split('-');
  return j + '/' + m + '/' + y;
}
function today() { return new Date().toISOString().split('T')[0]; }
function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
function genNum(prefix) {
  const y = new Date().getFullYear();
  const cnt = loadDocs().filter(d => d.num && d.num.startsWith(prefix + '-' + y)).length;
  return prefix + '-' + y + '-' + String(cnt + 1).padStart(3, '0');
}

// ============================================================
//  TABS
// ============================================================

// ============================================================
//  FORM STATE
// ============================================================
var lines = [];
var editId = null;
var loadedType = null;
var loadedNum = null;

function initApp() {
  resetForm(false);
  fillTplForm(loadTemplate());
  renderDash();
  renderCarnet();
  initKeyboardShortcuts();
  // Firebase
  initFirebase();
  setTimeout(function() {
    syncFromFirebase(function() {
      startRealtimeSync();
      syncRdvsFromFirebase();
      syncVehiculesFromFirebase();
      setTimeout(function() {
        startRdvsRealtimeSync();
        startVehiculesRealtimeSync();
        seedVehiculesOnce();
      }, 1000);
    });
  }, 500);
  // Vérifier rappels agenda
  setTimeout(checkTodayNotifs, 2000);
  // Vérifier si un brouillon existe
  setTimeout(checkAndRestoreDraft, 500);
  // Compter les demandes web en attente pour la pastille de l'onglet, sans
  // attendre que l'onglet soit ouvert.
  setTimeout(renderDemandes, 1500);
}

function resetForm(goToForm) {
  editId = null;
  _demandeActuelle = null;
  loadedType = 'devis';
  loadedNum = null;
  lines = [];
  $('f-type').value = 'devis';
  $('f-num').value = genNum('DEV');
  $('f-date').value = today();
  $('f-ech').value = plusDays(30);
  $('f-statut').value = 'créé';
  ['f-cnom','f-cadr','f-cville','f-ctel','f-cemail','f-vm','f-vmo','f-vmot','f-van','f-vim','f-vkm','f-nint'].forEach(function(i) { $(i).value = ''; });
  if ($('f-cnom-results')) { $('f-cnom-results').style.display = 'none'; $('f-cnom-results').innerHTML = ''; }
  $('f-tva').value = '0';
  applyRemiseGlobaleFromDoc(null);
  $('f-notes').value = 'Prestation réalisée en atelier. Garantie 2 ans. Reprogrammation 100% réversible. Paiement à réception. Devis valable 30 jours.';
  $('form-h').textContent = 'Nouveau devis';
  if ($('form-facturer-btn')) $('form-facturer-btn').style.display = 'none';
  currentGains = null;
  currentAcompte = null;
  renderGainsBar();
  if ($('f-gains')) { $('f-gains').value = ''; previewGainsBadge(); }
  resetDeclaration();
  addLine();
  if (goToForm) showTab('form');
}

function newDoc() { resetForm(true); }

function onTypeChange() {
  var t = $('f-type').value;
  var labels = { devis: ['Modifier le devis', 'Nouveau devis'], facture: ['Modifier la facture', 'Nouvelle facture'], ordre: ['Modifier l\'ordre de réparation', 'Nouvel ordre de réparation'] };
  var l = labels[t] || labels['devis'];
  $('form-h').textContent = editId ? l[0] : l[1];
  if (!editId) {
    $('f-num').value = genNum(t === 'devis' ? 'DEV' : t === 'ordre' ? 'ODR' : 'FAC');
  } else if (t !== loadedType) {
    // Changement de type d'un document existant (ex: devis → facture) : nouveau numéro dans la série du nouveau type
    $('f-num').value = genNum(t === 'devis' ? 'DEV' : t === 'ordre' ? 'ODR' : 'FAC');
  } else {
    // Retour au type d'origine : on restaure le numéro d'origine du document
    $('f-num').value = loadedNum;
  }
  var odrFields = document.getElementById('odr-fields');
  if (odrFields) odrFields.style.display = t === 'ordre' ? '' : 'none';
  var facturerBtn = $('form-facturer-btn');
  if (facturerBtn) facturerBtn.style.display = (editId && t === 'devis') ? '' : 'none';
  var echLabel = document.querySelector('label[for="f-ech"]') || (function(){ var el = $('f-ech'); return el ? el.previousElementSibling : null; })();
  var echRow = $('f-ech') ? $('f-ech').closest ? $('f-ech').closest('.fr') : null : null;
  if (echRow) { var lbl = echRow.querySelector('label'); if (lbl) lbl.textContent = t === 'ordre' ? 'Date prévue de restitution' : (t === 'devis' ? 'Validité / Échéance' : 'Validité / Échéance'); }
}

// ============================================================
//  LINES
// ============================================================
function buildSuggestions(query) {
  var q = query.trim().toLowerCase();
  if (!q) return [];
  var results = [], seen = {};
  var cat = loadCat();
  cat.forEach(function(group) {
    group.items.forEach(function(it) {
      var matches = it.l.toLowerCase().indexOf(q) !== -1 || (it.ref && it.ref.toLowerCase().indexOf(q) !== -1);
      if (matches && !seen[it.l]) {
        seen[it.l] = true;
        results.push({ label: it.l, price: it.p || 0, group: group.g, ref: it.ref || '', desc: it.desc || '', type: it.type || 'service' });
      }
    });
  });
  return results.slice(0, 20);
}

function initLineAutocomplete(inputEl, lid, field) {
  field = field === 'ref' ? 'ref' : 'label';
  var wrap = document.createElement('div');
  wrap.className = 'ac-wrap';
  inputEl.parentNode.insertBefore(wrap, inputEl);
  wrap.appendChild(inputEl);
  var drop = document.createElement('div');
  drop.className = 'ac-drop';
  wrap.appendChild(drop);
  var activeIdx = -1;

  function getItems() { return drop.querySelectorAll('.ac-item'); }
  function setActive(idx) {
    var items = getItems();
    items.forEach(function(el, i) { el.classList.toggle('active', i === idx); });
    activeIdx = idx;
  }
  function showDrop(suggestions) {
    drop.innerHTML = '';
    if (!suggestions.length) { drop.classList.remove('open'); return; }
    var lastGroup = null;
    suggestions.forEach(function(s) {
      if (s.group !== lastGroup) {
        var sep = document.createElement('div');
        sep.className = 'ac-sep';
        sep.textContent = s.group;
        drop.appendChild(sep);
        lastGroup = s.group;
      }
      var item = document.createElement('div');
      item.className = 'ac-item';
      var main = document.createElement('div');
      main.className = 'ac-main';
      var lbl = document.createElement('span');
      lbl.textContent = s.label;
      main.appendChild(lbl);
      if (s.ref) {
        var refEl = document.createElement('span');
        refEl.className = 'ac-ref';
        refEl.textContent = 'R\u00e9f. ' + s.ref;
        main.appendChild(refEl);
      }
      var pr = document.createElement('span');
      pr.className = 'ac-price';
      pr.textContent = s.price > 0 ? s.price.toFixed(2) + '\u00a0\u20ac' : '';
      item.appendChild(main);
      item.appendChild(pr);
      (function(suggestion) {
        item.addEventListener('mousedown', function(e) {
          e.preventDefault();
          selectSuggestion(suggestion);
        });
      })(s);
      drop.appendChild(item);
    });
    activeIdx = -1;
    drop.classList.add('open');
  }
  function hideDrop() { drop.classList.remove('open'); activeIdx = -1; }
  function selectSuggestion(s) {
    var line = lines.find(function(l) { return l.id === lid; });
    if (!line) return;
    line.label = s.label;
    line.pu = s.price || 0;
    line.ref = s.ref || '';
    line.desc = s.desc || '';
    inputEl.value = field === 'ref' ? line.ref : line.label;
    hideDrop();
    var wrapperEl = inputEl.closest('.line-item');
    if (wrapperEl) {
      var puInp = wrapperEl.querySelector('.lf-pu input');
      if (puInp) puInp.value = line.pu.toFixed(2);
      var ltVal = wrapperEl.querySelector('.lt-val');
      if (ltVal && !line.offert) ltVal.textContent = lineNetHT(line).toFixed(2) + '\u00a0\u20ac';
      var ltValTtc = wrapperEl.querySelector('.lt-val-ttc');
      if (ltValTtc && !line.offert) ltValTtc.textContent = lineNetTTC(line).toFixed(2) + '\u00a0\u20ac';
      var labelInp = wrapperEl.querySelector('.line-label-input');
      if (labelInp && labelInp !== inputEl) labelInp.value = line.label;
      var refInp = wrapperEl.querySelector('.line-ref');
      if (refInp && refInp !== inputEl) refInp.value = line.ref;
      var descInp = wrapperEl.querySelector('.line-desc');
      if (descInp) descInp.value = line.desc;
    }
    calcTotaux();
    onFormChange();
  }
  inputEl.addEventListener('input', function() {
    var line = lines.find(function(l) { return l.id === lid; });
    if (line) { line[field] = inputEl.value; onFormChange(); }
    if (inputEl.value.length >= 1) {
      showDrop(buildSuggestions(inputEl.value));
    } else {
      hideDrop();
    }
  });
  inputEl.addEventListener('keydown', function(e) {
    var items = getItems();
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIdx + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) { e.preventDefault(); items[activeIdx].dispatchEvent(new MouseEvent('mousedown')); }
    else if (e.key === 'Escape' || e.key === 'Tab') { hideDrop(); }
  });
  inputEl.addEventListener('blur', function() { hideDrop(); });
}

function addLine(data) {
  data = data || {};
  lines.push({ id: Date.now() + Math.random(), label: data.label || '', qte: data.qte || 1, pu: data.pu || 0, desc: data.desc || '', ref: data.ref || '', remise: data.remise || 0, remiseType: data.remiseType === 'eur' ? 'eur' : 'pct' });
  renderLines();
}

function removeLine(lid) {
  lines = lines.filter(function(l) { return l.id !== lid; });
  renderLines();
  calcTotaux();
}

// Génère des lignes de devis à partir d'un message libre, via la fonction
// Netlify devis-ia (Claude) : reprend le tarif exact du catalogue AREPROG
// pour les prestations reconnues, et propose une estimation « à valider »
// pour tout le reste (pièces, main d'œuvre...).
async function genererDevisIA() {
  var msgEl = $('ia-message');
  var msg = (msgEl.value || '').trim();
  if (!msg) { alert('Décris le besoin ou colle le message du client.'); return; }
  var btn = $('ia-devis-btn'), statusEl = $('ia-devis-status');
  btn.disabled = true; btn.textContent = '⏳ Génération…';
  statusEl.textContent = ''; statusEl.style.color = 'var(--text-muted)';
  try {
    var res = await authedFetch('/.netlify/functions/devis-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de la génération.');

    (data.lignes || []).forEach(function(l) {
      addLine({
        label: l.label,
        qte: l.qte,
        pu: l.pu,
        ref: l.ref || '',
        desc: l.aValider ? ('⚠ Estimation IA à vérifier' + (l.desc ? ' — ' + l.desc : '')) : (l.desc || '')
      });
    });

    var v = data.vehicule || {};
    if (v.marque && !$('f-vm').value) $('f-vm').value = v.marque;
    if (v.modele && !$('f-vmo').value) $('f-vmo').value = v.modele;
    if (v.motorisation && !$('f-vmot').value) $('f-vmot').value = v.motorisation;
    if (v.annee && !$('f-van').value) $('f-van').value = v.annee;

    var nb = (data.lignes || []).length;
    var nbAValider = (data.lignes || []).filter(function(l){ return l.aValider; }).length;
    if (!nb) {
      statusEl.textContent = data.warning || "Aucune ligne identifiée dans ce message.";
      statusEl.style.color = '#dc2626';
    } else {
      statusEl.textContent = nb + ' ligne(s) ajoutée(s)' + (nbAValider ? ' — ' + nbAValider + ' à vérifier' : '');
      statusEl.style.color = 'var(--green)';
    }
    onFormChange();
  } catch (e) {
    statusEl.textContent = e.message || 'Erreur';
    statusEl.style.color = '#dc2626';
  } finally {
    btn.disabled = false; btn.textContent = '✨ Générer les lignes';
  }
}

function renderLines() {
  var c = $('lines');
  c.innerHTML = '';
  lines.forEach(function(line) {
    var wrapper = document.createElement('div');
    wrapper.className = 'line-item';

    var div = document.createElement('div');
    div.className = 'line-row';
    div.dataset.lid = line.id;
    var isOffert = line.offert || false;
    var total = isOffert ? 'Offert' : lineNetHT(line).toFixed(2) + ' \u20ac';
    var totalTtc = isOffert ? 'Offert' : lineNetTTC(line).toFixed(2) + ' \u20ac';
    var disabledAttr = isOffert ? ' disabled' : '';
    var rType = line.remiseType === 'eur' ? 'eur' : 'pct';
    var rVal = parseFloat(line.remise) || 0;
    div.innerHTML =
      '<input type="text" class="line-label-input" placeholder="D\u00e9signation\u2026" value="' + (line.label || '').replace(/"/g,'&quot;') + '" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
      '<div class="lf lf-qte"><span class="lf-lbl">Qt\u00e9</span><input type="number" min="1" step="1" value="' + line.qte + '" onchange="lineField(this,' + line.id + ',\'qte\')"' + disabledAttr + '/></div>' +
      '<div class="lf lf-pu"><span class="lf-lbl">PU\u00a0HT</span><input type="number" min="0" step="0.01" value="' + line.pu.toFixed(2) + '" onchange="lineField(this,' + line.id + ',\'pu\')"' + (isOffert ? ' style="opacity:.4"' : '') + disabledAttr + '/></div>' +
      '<div class="lf lf-remise"><span class="lf-lbl">Remise</span><div class="lf-remise-controls">' +
        '<input type="number" min="0" step="0.01" value="' + (rVal ? rVal : '') + '" placeholder="0" onchange="lineRemise(this,' + line.id + ')"' + (isOffert ? ' style="opacity:.4"' : '') + disabledAttr + ' title="Remise sur cette ligne"/>' +
        '<select onchange="lineRemiseType(this,' + line.id + ')"' + disabledAttr + ' title="Type de remise (% ou \u20ac)">' +
          '<option value="pct"' + (rType === 'pct' ? ' selected' : '') + '>%</option>' +
          '<option value="eur"' + (rType === 'eur' ? ' selected' : '') + '>\u20ac</option>' +
        '</select>' +
      '</div></div>' +
      '<label class="lf lf-offert" title="Offert"><span class="lf-lbl">Offert</span><input type="checkbox"' + (isOffert ? ' checked' : '') + ' onchange="lineOffert(this,' + line.id + ')" style="width:18px;height:18px;accent-color:var(--green);cursor:pointer"/></label>' +
      '<div class="lt"><span class="lf-lbl">Total HT</span><span class="lt-val" style="color:' + (isOffert ? 'var(--green)' : '') + '">' + total + '</span></div>' +
      '<div class="lt lt-ttc"><span class="lf-lbl">Total TTC</span><span class="lt-val-ttc" style="color:' + (isOffert ? 'var(--green)' : '') + '">' + totalTtc + '</span></div>' +
      '<button class="rm-line" onclick="removeLine(' + line.id + ')" title="Supprimer">\xd7</button>';

    var labelInput = div.querySelector('.line-label-input');
    (function(id) { initLineAutocomplete(labelInput, id); })(line.id);

    var descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'line-desc';
    descInput.placeholder = 'Description (optionnel)';
    descInput.value = line.desc || '';
    (function(id) {
      descInput.addEventListener('input', function() { lineDesc(this, id); });
    })(line.id);

    var refInput = document.createElement('input');
    refInput.type = 'text';
    refInput.className = 'line-ref';
    refInput.placeholder = 'Réf. (optionnel)';
    refInput.value = line.ref || '';

    var descWrap = document.createElement('div');
    descWrap.className = 'line-desc-wrap';
    descWrap.appendChild(refInput);
    descWrap.appendChild(descInput);

    (function(id) { initLineAutocomplete(refInput, id, 'ref'); })(line.id);

    wrapper.appendChild(div);
    wrapper.appendChild(descWrap);
    c.appendChild(wrapper);
  });
  calcTotaux();
}

function lineOffert(chk, lid) {
  var line = lines.find(function(l){ return l.id === lid; });
  if (!line) return;
  line.offert = chk.checked;
  renderLines();
}


// HT net d'une ligne (quantit\u00e9 \u00d7 PU \u2212 remise de ligne ; 0 si offert)
function lineNetHT(l) {
  if (!l || l.offert) return 0;
  var base = (parseFloat(l.qte) || 0) * (parseFloat(l.pu) || 0);
  var r = parseFloat(l.remise) || 0;
  if (r > 0) base = (l.remiseType === 'eur') ? Math.max(0, base - r) : base * (1 - Math.min(r, 100) / 100);
  return base < 0 ? 0 : base;
}
function lineGrossHT(l) { return (!l || l.offert) ? 0 : (parseFloat(l.qte) || 0) * (parseFloat(l.pu) || 0); }
function curTvaRate() { return parseFloat(($('f-tva')||{}).value) / 100 || 0; }
function lineNetTTC(l) { return lineNetHT(l) * (1 + curTvaRate()); }

function refreshLineRowTotal(rowEl, line) {
  if (!rowEl) return;
  var v = rowEl.querySelector('.lt-val');
  if (v) v.textContent = line.offert ? 'Offert' : lineNetHT(line).toFixed(2) + '\u00a0\u20ac';
  var vt = rowEl.querySelector('.lt-val-ttc');
  if (vt) vt.textContent = line.offert ? 'Offert' : lineNetTTC(line).toFixed(2) + '\u00a0\u20ac';
}

function lineField(inp, lid, field) {
  var line = lines.find(function(l) { return l.id === lid; });
  if (!line) return;
  line[field] = parseFloat(inp.value) || 0;
  refreshLineRowTotal(inp.closest('.line-row'), line);
  calcTotaux();
  onFormChange();
}

function lineRemise(inp, lid) {
  var line = lines.find(function(l) { return l.id === lid; });
  if (!line) return;
  line.remise = Math.max(0, parseFloat(inp.value) || 0);
  refreshLineRowTotal(inp.closest('.line-row'), line);
  calcTotaux();
  onFormChange();
}

function lineRemiseType(sel, lid) {
  var line = lines.find(function(l) { return l.id === lid; });
  if (!line) return;
  line.remiseType = sel.value === 'eur' ? 'eur' : 'pct';
  refreshLineRowTotal(sel.closest('.line-row'), line);
  calcTotaux();
  onFormChange();
}

// Remise globale appliqu\u00e9e sur le sous-total HT (apr\u00e8s remises de ligne)
function getRemiseGlobale(base) {
  var typeEl = $('f-remg-type'), valEl = $('f-remg-val');
  var type = typeEl ? typeEl.value : 'none';
  var val = Math.max(0, parseFloat(valEl ? valEl.value : '') || 0);
  if (type === 'pct') { var p = Math.min(val, 100); return { type: 'pct', val: p, eur: base * p / 100 }; }
  if (type === 'eur') { return { type: 'eur', val: val, eur: Math.min(val, base) }; }
  return { type: 'none', val: 0, eur: 0 };
}

function onRemiseGlobaleChange() {
  var typeEl = $('f-remg-type'), valEl = $('f-remg-val');
  if (typeEl && valEl) {
    valEl.style.display = (typeEl.value === 'none') ? 'none' : '';
    if (typeEl.value === 'none') valEl.value = '';
  }
  calcTotaux();
  onFormChange();
}

function applyRemiseGlobaleFromDoc(doc) {
  var typeEl = $('f-remg-type'), valEl = $('f-remg-val');
  if (!typeEl || !valEl) return;
  var rg = (doc && doc.remiseGlobale) || { type: 'none', val: 0 };
  var t = (rg.type === 'pct' || rg.type === 'eur') ? rg.type : 'none';
  typeEl.value = t;
  valEl.value = (t === 'none') ? '' : (rg.val || '');
  valEl.style.display = (t === 'none') ? 'none' : '';
}

function lineDesc(inp, lid) {
  var line = lines.find(function(l) { return l.id === lid; });
  if (!line) return;
  line.desc = inp.value;
  onFormChange();
}

// ============================================================
//  ACOMPTE
// ============================================================
var currentAcompte = null;

function openAcompteModal() {
  var doc = buildObj();
  var ttc = doc.ttc || 0;
  $('acomp-ttc').textContent = fmt(ttc);
  var savedPct = (currentAcompte && currentAcompte.pct) ? currentAcompte.pct : 30;
  var savedMontant = (currentAcompte && currentAcompte.montant) ? currentAcompte.montant : Math.round(ttc * savedPct / 100 * 100) / 100;
  $('acomp-pct').value = savedPct;
  $('acomp-montant').value = savedMontant.toFixed(2);
  $('acomp-date').value = (currentAcompte && currentAcompte.date) ? currentAcompte.date : today();
  if (currentAcompte && currentAcompte.mode) $('acomp-mode').value = currentAcompte.mode;
  _acompTtc = ttc;
  updateAcompSolde(ttc, savedMontant);
  $('acompte-modal').classList.add('open');
}

var _acompTtc = 0;

function closeAcompteModal() { $('acompte-modal').classList.remove('open'); }

function updateAcompSolde(ttc, montant) {
  $('acomp-solde').textContent = fmt(Math.max(0, ttc - montant));
}

function syncAcomptePct() {
  var pct = parseFloat($('acomp-pct').value) || 0;
  var montant = Math.round(_acompTtc * pct / 100 * 100) / 100;
  $('acomp-montant').value = montant.toFixed(2);
  updateAcompSolde(_acompTtc, montant);
}

function syncAcompteMontant() {
  var montant = parseFloat($('acomp-montant').value) || 0;
  $('acomp-pct').value = _acompTtc > 0 ? Math.round(montant / _acompTtc * 1000) / 10 : 0;
  updateAcompSolde(_acompTtc, montant);
}

function _getAcompteData() {
  var montant = parseFloat($('acomp-montant').value) || 0;
  return {
    montant: montant,
    pct: parseFloat($('acomp-pct').value) || 0,
    mode: $('acomp-mode').value,
    date: $('acomp-date').value,
    recu: true,
    ttc: _acompTtc,
    solde: Math.max(0, _acompTtc - montant)
  };
}

function previewAcomptePDF() {
  var doc = buildObj();
  var ac = _getAcompteData();
  $('preview').innerHTML = renderAcompteHTML(doc, ac);
  $('modal').classList.add('open');
  $('modal').dataset.printTitle = 'AREPROG_Acompte_' + (doc.num || 'doc').replace(/[^a-zA-Z0-9_-]/g,'-') + '_' + (doc.cn || 'client').replace(/\s+/g,'-');
}

function validerAcompteRecu() {
  var ac = _getAcompteData();
  if (!ac.montant) { alert('Saisissez un montant d\'acompte.'); return; }
  currentAcompte = ac;
  var doc = buildObj();
  if (!doc.cn) { alert('Renseignez le nom du client avant d\'enregistrer.'); return; }
  var docs = loadDocs();
  if (editId) {
    var i = docs.findIndex(function(d) { return d.id === editId; });
    if (i >= 0) docs[i] = doc; else docs.unshift(doc);
  } else { docs.unshift(doc); editId = doc.id; }
  saveDocs(docs);
  closeAcompteModal();
  renderDash();
  showNotifBanner('\ud83d\udcb6', 'Acompte enregistré', fmt(ac.montant) + ' — ' + ac.mode);
  previewAcomptePDF();
}

function renderAcompteHTML(doc, ac) {
  var tpl = loadTemplate();
  var accentColor = sanitizeCssColor(tpl.color || '#1E90FF');
  var vehStr = [escHtml(doc.vm||''), escHtml(doc.vmo||''), escHtml(doc.vmot||''), doc.van?'('+escHtml(doc.van)+')':''].filter(Boolean).join(' ');
  var linesHTML = (doc.lines||[]).filter(function(l){return !l.offert;}).map(function(l){
    var rVal = parseFloat(l.remise) || 0;
    var remStr = rVal > 0
      ? (l.remiseType === 'eur' ? '\u2212 '+rVal.toFixed(2)+'\u00a0\u20ac' : '\u2212 '+(Math.round(rVal*100)/100).toString().replace('.',',')+'\u00a0%')
      : '<span style="color:#bbb">\u2014</span>';
    return '<tr><td>'+escHtml(l.label||'—')+'</td><td style="text-align:center">'+(l.qte!=null?l.qte:1)+'</td><td style="text-align:right">'+(l.pu||0).toFixed(2)+'\u00a0\u20ac</td><td style="text-align:right">'+remStr+'</td><td style="text-align:right"><strong>'+lineNetHT(l).toFixed(2)+'\u00a0\u20ac</strong></td></tr>';
  }).join('');
  return '<style>'
    + 'body,*{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;box-sizing:border-box}'
    + '.ah{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid '+accentColor+'33;margin-bottom:20px}'
    + '.ab{font-size:20px;font-weight:800;color:'+accentColor+'}'
    + '.ai{font-size:11px;color:#666;margin-top:4px;line-height:1.6}'
    + '.at{font-size:20px;font-weight:800;color:'+accentColor+';text-align:right}'
    + '.an{font-size:12px;color:#555;text-align:right}'
    + '.ap{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:18px 0}'
    + '.apl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:3px}'
    + '.apn{font-size:15px;font-weight:700;margin-bottom:3px}'
    + '.api{font-size:12px;color:#555;line-height:1.6}'
    + '.adt{width:100%;border-collapse:collapse;margin:14px 0;font-size:12px}'
    + '.adt th{background:#f8f8f8;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#666;border-bottom:1px solid #eee}'
    + '.adt td{padding:7px 10px;border-bottom:1px solid #f5f5f5}'
    + '.abox{border:2px solid '+accentColor+'44;border-radius:8px;padding:18px;margin:18px 0}'
    + '.abox-t{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:'+accentColor+';font-weight:700;margin-bottom:12px}'
    + '.ar{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f0f0f0}'
    + '.ar:last-child{border:none}'
    + '.ar.big{font-weight:700;font-size:15px;color:'+accentColor+';padding-top:10px}'
    + '.ar.solde{font-weight:700;font-size:14px;color:#f97316;margin-top:6px;padding-top:8px;border-top:2px solid #f9731644}'
    + '.sig{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:28px}'
    + '.sig-b{border-top:1px solid #ccc;padding-top:8px}'
    + '.sig-l{font-size:11px;color:#888}'
    + '</style>'
    + '<div class="ah">'
      + '<div><div class="ab">'+buildLogoHTML(tpl)+'</div>'
        + '<div class="ai">'+escHtml(tpl.activite||'')+(tpl.tel?'<br>'+escHtml(tpl.tel):'')+(tpl.email?'<br>'+escHtml(tpl.email):'')+'</div></div>'
      + '<div><div class="at">RE\u00c7U D\u2019ACOMPTE</div>'
        + '<div class="an">R\u00e9f. '+escHtml(doc.num||'—')+'</div>'
        + '<div class="an">Date\u00a0: '+fmtDate(ac.date)+'</div></div>'
    + '</div>'
    + '<div class="ap">'
      + '<div><div class="apl">Prestataire</div><div class="apn">'+escHtml(tpl.nom||'AREPROG')+'</div>'
        + '<div class="api">'+escHtml(tpl.activite||'')+(tpl.adresse?'<br>'+escHtml(tpl.adresse):'')+(tpl.tel?'<br>'+escHtml(tpl.tel):'')+(tpl.email?'<br>'+escHtml(tpl.email):'')+(tpl.legal?'<br><small style="color:#aaa">'+escHtml(tpl.legal)+'</small>':'')+'</div></div>'
      + '<div><div class="apl">Client</div><div class="apn">'+escHtml(doc.cn||'—')+'</div>'
        + '<div class="api">'+(doc.ca?escHtml(doc.ca)+'<br>':'')+escHtml(doc.cv||'')+(doc.ct?'<br>'+escHtml(doc.ct):'')+(doc.ce?'<br>'+escHtml(doc.ce):'')+(vehStr?'<br><br><strong>V\u00e9hicule\u00a0:</strong> '+vehStr:'')+(doc.vim?'<br>Immat.\u00a0: <strong>'+escHtml(doc.vim.toUpperCase())+'</strong>':'')+'</div></div>'
    + '</div>'
    + (linesHTML?'<table class="adt"><thead><tr><th>D\u00e9signation</th><th style="text-align:center">Qt\u00e9</th><th style="text-align:right">PU\u00a0HT</th><th style="text-align:right">Remise</th><th style="text-align:right">Total\u00a0HT</th></tr></thead><tbody>'+linesHTML+'</tbody></table>':'')
    + '<div class="abox"><div class="abox-t">D\u00e9tail de l\u2019acompte</div>'
      + '<div class="ar"><span>Total TTC du document</span><span>'+(ac.ttc||0).toFixed(2)+'\u00a0\u20ac</span></div>'
      + '<div class="ar big"><span>Acompte re\u00e7u</span><span>'+(ac.montant||0).toFixed(2)+'\u00a0\u20ac</span></div>'
      + '<div class="ar"><span>Mode de paiement</span><span>'+escHtml(ac.mode||'')+'</span></div>'
      + '<div class="ar solde"><span>Solde restant \u00e0 r\u00e9gler</span><span>'+(ac.solde||0).toFixed(2)+'\u00a0\u20ac</span></div>'
    + '</div>'
    + '<div class="sig">'
      + '<div class="sig-b"><div class="sig-l">Signature prestataire</div><div style="height:60px"></div></div>'
      + '<div class="sig-b"><div class="sig-l">Signature client (bon pour accord)</div><div style="height:60px"></div></div>'
    + '</div>'
    + (tpl.showFooter!==false&&tpl.footer?'<div style="margin-top:22px;padding-top:10px;border-top:1px solid #eee;font-size:11px;color:#888;text-align:center">'+escHtml(tpl.footer).replace(/\n/g,'<br>')+'</div>':'');
}

// ============================================================
//  TOTAUX
// ============================================================
function onFormChange() {
  // Appelé par chaque changement de champ du formulaire
  if ($('t-form') && $('t-form').classList.contains('on')) {
    triggerAutoSave();
  }
}

function calcTotaux() {
  var brut = lines.reduce(function(s, l) { return s + lineGrossHT(l); }, 0);
  var netLignes = lines.reduce(function(s, l) { return s + lineNetHT(l); }, 0);
  var remiseLignes = Math.max(0, brut - netLignes);
  var rg = getRemiseGlobale(netLignes);
  var ht = Math.max(0, netLignes - rg.eur);
  var tvaRate = parseFloat($('f-tva').value) / 100 || 0;

  var showBrut = remiseLignes > 0.005 || rg.eur > 0.005;
  if ($('t-row-brut')) $('t-row-brut').style.display = showBrut ? '' : 'none';
  if ($('t-brut')) $('t-brut').textContent = fmt(brut);
  if ($('t-row-remlignes')) $('t-row-remlignes').style.display = remiseLignes > 0.005 ? '' : 'none';
  if ($('t-remlignes')) $('t-remlignes').textContent = '− ' + fmt(remiseLignes);
  if ($('t-remg-val')) $('t-remg-val').textContent = rg.eur > 0.005 ? '− ' + fmt(rg.eur) : '—';
  $('t-ht').textContent = fmt(ht);
  $('t-tva').textContent = fmt(ht * tvaRate);
  $('t-ttc').textContent = fmt(ht * (1 + tvaRate));
}

// ============================================================
//  SAVE / LOAD
// ============================================================
function buildObj() {
  var brut = lines.reduce(function(s, l) { return s + lineGrossHT(l); }, 0);
  var netLignes = lines.reduce(function(s, l) { return s + lineNetHT(l); }, 0);
  var remiseLignes = Math.max(0, brut - netLignes);
  var rg = getRemiseGlobale(netLignes);
  var ht = Math.max(0, netLignes - rg.eur);
  var tvaRate = parseFloat($('f-tva').value) / 100 || 0;
  return {
    id: editId || Date.now(),
    type: $('f-type').value,
    num: $('f-num').value,
    date: $('f-date').value,
    ech: $('f-ech').value,
    statut: $('f-statut').value,
    cn: $('f-cnom').value,
    ca: $('f-cadr').value,
    cv: $('f-cville').value,
    ct: $('f-ctel').value,
    ce: $('f-cemail').value,
    vm: $('f-vm').value,
    vmo: $('f-vmo').value,
    vmot: $('f-vmot').value,
    van: $('f-van').value,
    vim: $('f-vim').value,
    vkm: $('f-vkm').value,
    lines: JSON.parse(JSON.stringify(lines)),
    gains: currentGains ? JSON.parse(JSON.stringify(currentGains)) : null,
    customGains: ($('f-gains') ? $('f-gains').value.split('\n').map(function(g){return g.trim();}).filter(Boolean) : []),
    declare: getDeclaration(),
    tvaRate: parseFloat($('f-tva').value),
    htBrut: brut,
    remiseLignes: remiseLignes,
    remiseGlobale: { type: rg.type, val: rg.val, montant: rg.eur },
    remiseTotale: remiseLignes + rg.eur,
    ht: ht,
    tva: ht * tvaRate,
    ttc: ht * (1 + tvaRate),
    notes: $('f-notes').value,
    nint: $('f-nint').value,
    acompte: currentAcompte ? JSON.parse(JSON.stringify(currentAcompte)) : null,
    motif: $('f-motif') ? $('f-motif').value : '',
    delai: $('f-delai') ? $('f-delai').value : '',
    sigclient: $('f-sigclient') ? $('f-sigclient').checked : false,
  };
}

function saveDoc() {
  var doc = buildObj();
  if (!doc.cn) { alert('Renseignez le nom du client avant d\'enregistrer.'); return; }
  var docs = loadDocs();
  if (editId) {
    var i = docs.findIndex(function(d) { return d.id === editId; });
    if (i >= 0) docs[i] = doc; else docs.unshift(doc);
  } else {
    docs.unshift(doc);
  }
  editId = doc.id;
  saveDocs(docs);
  if (_demandeActuelle) lierDevisALaDemande(_demandeActuelle, doc);
  renderDash();
  // Proposer d'enregistrer le client dans le carnet si nouveau
  var cn = $('f-cnom').value.trim();
  var clients = loadClients();
  var exists = cn && clients.some(function(cl){ return cl.nom.toLowerCase() === cn.toLowerCase(); });
  if (cn && !exists) {
    if (confirm('Enregistrer "' + cn + '" dans le carnet clients ?')) {
      saveCurrentClientToCarnet();
    }
  }
  alert('Document enregistré ✓');
}

// Relie le devis enregistré à sa demande d'origine : on retient son id
// (pour rouvrir le même devis au lieu d'en recréer un autre) et on
// rafraîchit l'aperçu affiché sur la carte "Demandes" avec le contenu
// réellement enregistré — sinon elle reste bloquée sur le brouillon
// auto-généré à la création de la demande.
function lierDevisALaDemande(ref, doc) {
  var d = trouverDemande(ref);
  if (!d || !db) return;
  var draft = {
    lignes: (doc.lines || []).map(function(l) {
      return { label: l.label || '', qte: l.qte || 1, pu: l.pu || 0, desc: l.desc || '', ref: l.ref || '', remise: l.remise || 0, remiseType: l.remiseType || 'pct' };
    }),
    total: doc.ht,
    aTarifer: (doc.lines || []).filter(function(l){ return !l.pu; }).length
  };
  db.collection(d.collection).doc(d.id).update({ devisId: doc.id, devisDraft: draft })
    .then(function() {
      d.devisId = doc.id;
      d.devisDraft = draft;
      paintDemandes();
    })
    .catch(function(e){ console.warn('Lien devis→demande :', e); });
}

// Charger un objet doc directement dans le formulaire (draft restore)
function loadDocData(doc) {
  if (!doc) return;
  editId = doc.id || null;
  loadedType = doc.type || 'devis';
  loadedNum = doc.num || '';
  $('f-type').value  = doc.type  || 'devis';
  $('f-num').value   = doc.num   || '';
  $('f-date').value  = doc.date  || today();
  $('f-ech').value   = doc.ech   || '';
  $('f-statut').value= doc.statut|| 'envoyé';
  $('f-cnom').value  = doc.cn    || '';
  $('f-cadr').value  = doc.ca    || '';
  $('f-cville').value= doc.cv    || '';
  $('f-ctel').value  = doc.ct    || '';
  $('f-cemail').value= doc.ce    || '';
  $('f-vm').value    = doc.vm    || '';
  $('f-vmo').value   = doc.vmo   || '';
  $('f-vmot').value  = doc.vmot  || '';
  $('f-van').value   = doc.van   || '';
  $('f-vim').value   = doc.vim   || '';
  $('f-vkm').value   = doc.vkm   || '';
  $('f-tva').value   = String(doc.tvaRate || 0);
  $('f-notes').value = doc.notes || '';
  $('f-nint').value  = doc.nint  || '';
  lines = doc.lines ? JSON.parse(JSON.stringify(doc.lines)) : [];
  currentGains = doc.gains ? JSON.parse(JSON.stringify(doc.gains)) : null;
  if ($('f-gains')) {
    $('f-gains').value = (doc.customGains||[]).join('\n');
    previewGainsBadge();
  }
  setDeclaration(doc.declare !== false);
  if ($('f-motif')) $('f-motif').value = doc.motif || '';
  if ($('f-delai')) $('f-delai').value = doc.delai || '';
  if ($('f-sigclient')) $('f-sigclient').checked = doc.sigclient || false;
  onTypeChange();
  applyRemiseGlobaleFromDoc(doc);
  renderLines();
  calcTotaux();
  renderGainsBar();
  fillTplForm(loadTemplate());
  showTab('form');
}

function loadDoc(docId) {
  var doc = loadDocs().find(function(d) { return d.id === docId; });
  if (!doc) return;
  editId = doc.id;
  _demandeActuelle = null;
  loadedType = doc.type;
  loadedNum = doc.num;
  $('f-type').value = doc.type;
  $('f-num').value = doc.num;
  $('f-date').value = doc.date;
  $('f-ech').value = doc.ech || plusDays(30);
  $('f-statut').value = doc.statut;
  $('f-cnom').value = doc.cn || '';
  $('f-cadr').value = doc.ca || '';
  $('f-cville').value = doc.cv || '';
  $('f-ctel').value = doc.ct || '';
  $('f-cemail').value = doc.ce || '';
  $('f-vm').value = doc.vm || '';
  $('f-vmo').value = doc.vmo || '';
  $('f-vmot').value = doc.vmot || '';
  $('f-van').value = doc.van || '';
  $('f-vim').value = doc.vim || '';
  $('f-vkm').value = doc.vkm || '';
  $('f-tva').value = String(doc.tvaRate || 0);
  $('f-notes').value = doc.notes || '';
  $('f-nint').value = doc.nint || '';
  lines = JSON.parse(JSON.stringify(doc.lines));
  currentGains = doc.gains || null;
  currentAcompte = doc.acompte || null;
  renderGainsBar();
  // Restaurer déclaration
  setDeclaration(doc.declare !== false);
  // Restaurer les gains personnalisés
  if ($('f-gains')) {
    if (doc.customGains && doc.customGains.length) {
      $('f-gains').value = doc.customGains.join('\n');
    } else {
      // Pré-remplir depuis le catalogue si pas de gains custom
      $('f-gains').value = buildGainsFromLines(doc.lines || []).join('\n');
    }
    previewGainsBadge();
  }
  applyRemiseGlobaleFromDoc(doc);
  renderLines();
  if ($('f-motif')) $('f-motif').value = doc.motif || '';
  if ($('f-delai')) $('f-delai').value = doc.delai || '';
  if ($('f-sigclient')) $('f-sigclient').checked = doc.sigclient || false;
  onTypeChange();
  showTab('form');
}

function deleteDoc(docId) {
  if (!confirm('Supprimer définitivement ce document ?')) return;
  saveDocs(loadDocs().filter(function(d) { return d.id !== docId; }));
  deleteDocFirebase(docId);
  renderDash();
  renderListe();
}

// ============================================================
//  APERÇU / PRINT
// ============================================================
function renderDocHTML(doc, tplOverride) {
  var tpl = tplOverride || loadTemplate();
  var accentColor = sanitizeCssColor(tpl.color || '#1E90FF');
  var brutHT = (doc.lines || []).reduce(function(s,l){ return s + lineGrossHT(l); }, 0);
  var netLignesHT = (doc.lines || []).reduce(function(s,l){ return s + lineNetHT(l); }, 0);
  var remiseLignes = Math.max(0, brutHT - netLignesHT);
  var rgObj = doc.remiseGlobale || { type: 'none', val: 0, montant: 0 };
  var rgEur = (typeof rgObj.montant === 'number' && rgObj.montant > 0) ? rgObj.montant : 0;
  var ht = Math.max(0, netLignesHT - rgEur);
  var tvaRate = (doc.tvaRate || 0) / 100;
  var tva = ht * tvaRate;
  var ttc = ht + tva;
  var hasRemise = remiseLignes > 0.005 || rgEur > 0.005;
  var isDevis = doc.type === 'devis';
  var isOrdre = doc.type === 'ordre';
  var gains = getGains(doc.lines);
  var vehStr = [escHtml(doc.vm||''), escHtml(doc.vmo||''), escHtml(doc.vmot||''), doc.van ? '(' + escHtml(doc.van) + ')' : ''].filter(Boolean).join(' ');

  var acompteNotice = (doc.acompte && doc.acompte.recu)
    ? '<div class="d-notice" style="background:rgba(168,85,247,.12);border-left:3px solid #a855f7;color:#a855f7">'
      + '\ud83d\udcb6\u00a0Acompte re\u00e7u\u00a0: <strong>' + (doc.acompte.montant||0).toFixed(2) + '\u00a0\u20ac</strong>'
      + ' via ' + escHtml(doc.acompte.mode||'') + ' le ' + fmtDate(doc.acompte.date)
      + ' \u2014 Solde restant\u00a0: <strong>' + (doc.acompte.solde||0).toFixed(2) + '\u00a0\u20ac</strong></div>'
    : '';
  var noticeHTML = doc.statut === 'payé'
    ? '<div class="d-notice paye">✓ FACTURE RÉGLÉE — Paiement reçu</div>'
    : (isOrdre
      ? '<div class="d-notice" style="background:rgba(234,88,12,.1);border-left:3px solid #ea580c;color:#ea580c;font-size:12px">🔧 Ordre de réparation établi conformément au Décret n°78-993 du 4 octobre 1978 et au Code de la consommation (art. R224-22). Travaux autorisés par le client. Kilométrage enregistré à l\'entrée du véhicule.</div>'
      : (isDevis
        ? '<div class="d-notice devis">⏳ Ce devis est valable ' + (tpl.validite||30) + ' jours à compter du ' + fmtDate(doc.date) + (doc.acompte && doc.acompte.recu ? '' : ' — Paiement après intervention.') + '</div>'
        : '<div class="d-notice facture">📄 Facture émise le ' + fmtDate(doc.date) + ' — Règlement à réception.</div>'))
    + acompteNotice;

  var linesHTML = doc.lines.map(function(l) {
    var rVal = parseFloat(l.remise) || 0;
    var puStr = l.offert ? '<span style="color:#22c55e;font-weight:700">Offert</span>' : (l.pu||0).toFixed(2) + ' €';
    var remStr;
    if (l.offert || rVal <= 0) remStr = '<span style="color:#bbb">—</span>';
    else if (l.remiseType === 'eur') remStr = '− ' + rVal.toFixed(2) + ' €';
    else remStr = '− ' + (Math.round(rVal * 100) / 100).toString().replace('.', ',') + ' %';
    var htStr = l.offert ? '<span style="color:#22c55e;font-weight:700">Offert</span>' : lineNetHT(l).toFixed(2) + ' €';
    var ttcStr = l.offert ? '<span style="color:#22c55e;font-weight:700">Offert</span>' : '<strong>' + (lineNetHT(l) * (1 + tvaRate)).toFixed(2) + ' €</strong>';
    var refStr = l.ref ? 'Réf : ' + escHtml(l.ref) : '';
    var descRowText = [refStr, l.desc ? escHtml(l.desc) : ''].filter(Boolean).join(' — ');
    var descRow = descRowText ? '<tr><td colspan="6" style="padding-top:2px;padding-bottom:8px;font-size:12px;color:#888;font-style:italic">' + descRowText + '</td></tr>' : '';
    return '<tr><td>' + escHtml(l.label || '—') + '</td><td>' + (l.qte != null ? l.qte : 1) + '</td><td>' + puStr + '</td><td>' + remStr + '</td><td>' + htStr + '</td><td>' + ttcStr + '</td></tr>' + descRow;
  }).join('');

  var gainsHTML = '';
  // Priorité 1 : gains personnalisés du document
  // Priorité 2 : gains OLSX numériques
  // Priorité 3 : gains du catalogue par prestation
  var customGainsArr = doc.customGains && doc.customGains.length ? doc.customGains : null;
  if (customGainsArr && tpl.showGains !== false) {
    gainsHTML = '<div class="d-gains"><div class="d-gains-title">✦ Bénéfices de votre prestation</div><div class="d-gains-grid">'
      + customGainsArr.map(function(g){return '<div class="d-gain">'+escHtml(g)+'</div>';}).join('')
      + '</div></div>';
  } else if (doc.gains && (doc.gains.chOrig || doc.gains.ch || doc.gains.nm || doc.gains.conso)) {
    var g = doc.gains;
    var items = [];
    if (g.chOrig && g.ch) items.push({lbl:'Puissance', val:'+'+(g.ch-g.chOrig)+' ch', sub:g.chOrig+' → '+g.ch+' ch'});
    if (g.nmOrig && g.nm) items.push({lbl:'Couple', val:'+'+(g.nm-g.nmOrig)+' Nm', sub:g.nmOrig+' → '+g.nm+' Nm'});
    if (g.conso) items.push({lbl:'Consommation', val:g.conso, sub:'estimation'});
    if (items.length) {
      gainsHTML = '<div class="d-gains-olsx"><div class="d-gains-olsx-title">✦ Gains estimés pour ce véhicule</div><div class="d-gains-olsx-grid">'
        + items.map(function(it){ return '<div class="d-gains-olsx-item"><div class="d-gains-olsx-val">'+it.val+'</div><div class="d-gains-olsx-lbl">'+it.lbl+'</div></div>'; }).join('')
        + '</div></div>';
    }
  } else if (gains.length && tpl.showGains !== false) {
    gainsHTML = '<div class="d-gains"><div class="d-gains-title">✦ Bénéfices de votre prestation</div><div class="d-gains-grid">'
      + gains.map(function(g){return '<div class="d-gain">'+g+'</div>';}).join('')
      + '</div></div>';
  }
  if (customGainsArr && !tpl.showGains) gainsHTML = '';

  return '<div class="d-header" style="border-bottom:2px solid ' + accentColor + '22">'
    + '<div><div class="d-brand">' + buildLogoHTML(tpl) + '</div>'
    + '<div class="d-brand-info">' + escHtml(tpl.activite||'')
    + (tpl.zones ? '<br>' + escHtml(tpl.zones) : '')
    + (tpl.tel ? '<br>' + escHtml(tpl.tel) : '')
    + (tpl.email ? ' &nbsp;·&nbsp; ' + escHtml(tpl.email) : '')
    + (tpl.web ? ' &nbsp;·&nbsp; ' + escHtml(tpl.web) : '')
    + '</div></div>'
    + '<div class="d-right">'
    + '<div class="d-type">' + (isOrdre ? 'ORDRE DE RÉPARATION' : isDevis ? 'DEVIS' : 'FACTURE') + '</div>'
    + '<div class="d-num">' + (doc.num || '—') + '</div>'
    + '<div class="d-date">Émis le ' + fmtDate(doc.date) + '</div>'
    + (doc.ech ? '<div class="d-date">' + (isOrdre ? 'Restitution prévue le' : isDevis ? 'Valable jusqu\'au' : 'Échéance') + ' ' + fmtDate(doc.ech) + '</div>' : '')
    + '</div></div>'
    + '<div class="d-parties">'
    + '<div class="d-party"><div class="d-party-label">Prestataire</div><div class="d-party-name">' + escHtml(tpl.nom||'AREPROG') + '</div>'
    + '<div class="d-party-info">' + escHtml(tpl.activite||'')
    + (tpl.zones ? '<br>' + escHtml(tpl.zones) : '')
    + (tpl.adresse ? '<br>' + escHtml(tpl.adresse) : '')
    + (tpl.tel ? '<br>' + escHtml(tpl.tel) : '')
    + (tpl.email ? '<br>' + escHtml(tpl.email) : '')
    + (tpl.web ? '<br>' + escHtml(tpl.web) : '')
    + (tpl.legal ? '<br><small style="color:#aaa">' + escHtml(tpl.legal) + '</small>' : '')
    + '</div></div>'
    + '<div class="d-party"><div class="d-party-label">Client</div><div class="d-party-name">' + escHtml(doc.cn || '—') + '</div>'
    + '<div class="d-party-info">'
    + (doc.ca ? escHtml(doc.ca) + '<br>' : '') + escHtml(doc.cv || '')
    + (doc.ct ? '<br>' + escHtml(doc.ct) : '')
    + (doc.ce ? '<br>' + escHtml(doc.ce) : '')
    + (vehStr ? '<br><br><strong>Véhicule :</strong> ' + vehStr : '')
    + (doc.vim ? '<br>Immatriculation : <strong>' + escHtml(doc.vim.toUpperCase()) + '</strong>' : '')
    + (doc.vkm ? '<br>Kilométrage : <strong>' + escHtml(doc.vkm) + '</strong>' : '')
    + '</div></div></div>'
    + noticeHTML
    + (isOrdre && doc.motif ? '<div style="margin:14px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #ea580c;border-radius:4px"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#ea580c">Motif d\'entrée</strong><p style="margin:6px 0 0;color:#333;font-size:13px">' + escHtml(doc.motif).replace(/\n/g,'<br>') + '</p></div>' : '')
    + (isOrdre && doc.delai ? '<div style="margin:8px 0 14px;font-size:13px;color:#555">⏱ <strong>Délai d\'immobilisation estimé :</strong> ' + escHtml(doc.delai) + '</div>' : '')
    + '<table class="d-table"><thead><tr>'
    + '<th style="width:32%">Désignation</th>'
    + '<th style="width:7%;text-align:right">Qté</th>'
    + '<th style="width:14%;text-align:right">PU HT</th>'
    + '<th style="width:12%;text-align:right">Remise</th>'
    + '<th style="width:16%;text-align:right">Total HT</th>'
    + '<th style="width:19%;text-align:right">Total TTC</th>'
    + '</tr></thead><tbody>' + linesHTML + '</tbody></table>'
    + '<div class="d-totaux"><div class="d-totaux-box">'
    + (hasRemise ? '<div class="d-tot-row"><span>Sous-total HT</span><span>' + brutHT.toFixed(2) + ' €</span></div>' : '')
    + (remiseLignes > 0.005 ? '<div class="d-tot-row"><span>Remise sur prestations</span><span style="color:#16a34a">− ' + remiseLignes.toFixed(2) + ' €</span></div>' : '')
    + (rgEur > 0.005 ? '<div class="d-tot-row"><span>Remise globale' + (rgObj.type === 'pct' ? ' (−' + (Math.round((rgObj.val||0)*100)/100).toString().replace('.', ',') + ' %)' : '') + '</span><span style="color:#16a34a">− ' + rgEur.toFixed(2) + ' €</span></div>' : '')
    + '<div class="d-tot-row"><span>Total HT</span><span>' + ht.toFixed(2) + ' €</span></div>'
    + '<div class="d-tot-row"><span>TVA (' + (doc.tvaRate || 0) + ' %)</span><span>' + tva.toFixed(2) + ' €</span></div>'
    + '<div class="d-tot-row big" style="color:' + accentColor + '"><span>TOTAL TTC</span><span>' + ttc.toFixed(2) + ' €</span></div>'
    + '</div></div>'
    + gainsHTML
    + (doc.notes ? '<div class="d-notes"><strong>Conditions & mentions</strong><p>' + escHtml(doc.notes).replace(/\n/g,'<br>') + '</p></div>' : '')
    + (isOrdre ? '<div style="margin-top:28px;display:flex;gap:40px;border-top:1px solid #e5e7eb;padding-top:20px">'
      + '<div style="flex:1"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#888;margin-bottom:12px">Signature du client</div>'
      + (doc.sigclient ? '<div style="font-size:12px;color:#16a34a;font-weight:600">✓ Accord client enregistré</div>' : '<div style="border-bottom:1px solid #ccc;height:40px;margin-bottom:6px"></div><div style="font-size:11px;color:#888">Lu et approuvé — Date : ___________</div>')
      + '</div>'
      + '<div style="flex:1"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#888;margin-bottom:12px">Signature du technicien</div><div style="border-bottom:1px solid #ccc;height:40px"></div></div>'
      + '</div>' : '')
    + (tpl.showFooter !== false ? '<div class="d-footer">' + escHtml(tpl.footer||'').replace(/\n/g,'<br>') + '</div>' : '');
}

// Construit le nom de fichier PDF : AREPROG_TYPE_NUMERO_CLIENT
function buildPdfTitle(doc) {
  var type = (doc.type === 'devis' ? 'Devis' : doc.type === 'ordre' ? 'OrdreReparation' : 'Facture');
  var num  = (doc.num || '').replace(/[^a-zA-Z0-9_-]/g, '-');
  var nom  = (doc.cn || 'Client').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-');
  return 'AREPROG_' + type + '_' + num + '_' + nom;
}

// Injecte le title dans la page (utilisé comme nom de fichier par le navigateur)
var _originalTitle = document.title;
function setPrintTitle(doc) {
  document.title = buildPdfTitle(doc);
}
function restoreTitle() {
  document.title = _originalTitle;
}

function openPreview() {
  var doc = buildObj();
  _currentDocForEmail = doc;
  $('preview').innerHTML = renderDocHTML(doc);
  $('modal').classList.add('open');
  $('modal').dataset.printTitle = buildPdfTitle(doc);
}
function previewDoc(docId) {
  var doc = loadDocs().find(function(d){ return d.id === docId; });
  if (!doc) return;
  _currentDocForEmail = doc;
  $('preview').innerHTML = renderDocHTML(doc);
  $('modal').classList.add('open');
  $('modal').dataset.printTitle = buildPdfTitle(doc);
}
function closeModal() {
  $('modal').classList.remove('open');
  restoreTitle();
}
function printFromModal() {
  var title = $('modal').dataset.printTitle || _originalTitle;
  document.title = title;
  window.print();
  // Restaurer après impression (délai pour laisser le dialog s'ouvrir)
  setTimeout(restoreTitle, 2000);
}
function printDoc() {
  var doc = buildObj();
  _currentDocForEmail = doc;
  $('preview').innerHTML = renderDocHTML(doc);
  $('modal').classList.add('open');
  $('modal').dataset.printTitle = buildPdfTitle(doc);
  setTimeout(function(){
    document.title = buildPdfTitle(doc);
    window.print();
    setTimeout(restoreTitle, 2000);
  }, 250);
}

// ============================================================
//  DASHBOARD
// ============================================================
// Masquer le CA sur le dashboard (page d'accueil) — utile quand l'écran est
// visible d'un client, sans perdre l'accès au chiffre pour soi-même.
function isCaHidden() {
  try { return localStorage.getItem('ar_hide_ca') === '1'; } catch(e) { return false; }
}
function toggleCaVisibility() {
  var hidden = !isCaHidden();
  try { localStorage.setItem('ar_hide_ca', hidden ? '1' : '0'); } catch(e) {}
  renderDash();
}

function renderDash() {
  var docs = loadDocs();
  var devis = docs.filter(function(d){ return d.type === 'devis'; }).length;
  var factures = docs.filter(function(d){ return d.type === 'facture'; }).length;
  var ordres = docs.filter(function(d){ return d.type === 'ordre'; }).length;
  var caHidden = isCaHidden();
  var caTiles;
  if (caHidden) {
    caTiles = '<div class="sc"><div class="sc-label">Chiffre d\'affaires</div><div class="sc-val" style="color:var(--text-muted)">••••</div><div class="sc-sub">Masqué — <a href="#" onclick="toggleCaVisibility();return false" style="color:var(--blue)">afficher</a></div></div>';
  } else {
    var caEnc = docs.filter(function(d){ return d.type === 'facture' && d.statut === 'payé'; }).reduce(function(s,d){ return s+(d.ttc||0); }, 0);
    var caAtt = docs.filter(function(d){ return d.type === 'facture' && d.statut !== 'payé' && d.statut !== 'annulé'; }).reduce(function(s,d){ return s+(d.ttc||0); }, 0);
    caTiles = '<div class="sc"><div class="sc-label">CA encaissé</div><div class="sc-val green">'+fmt(caEnc)+'</div><div class="sc-sub">Factures payées</div></div>' +
      '<div class="sc"><div class="sc-label">En attente</div><div class="sc-val orange">'+fmt(caAtt)+'</div><div class="sc-sub">À encaisser</div></div>';
  }
  var caBtn = $('ca-toggle-btn');
  if (caBtn) caBtn.textContent = caHidden ? '👁 Afficher le CA' : '🙈 Masquer le CA';

  $('stats').innerHTML =
    '<div class="sc"><div class="sc-label">Devis créés</div><div class="sc-val blue">'+devis+'</div><div class="sc-sub">Total</div></div>' +
    '<div class="sc"><div class="sc-label">Factures</div><div class="sc-val">'+factures+'</div><div class="sc-sub">Émises</div></div>' +
    '<div class="sc"><div class="sc-label">OdR en cours</div><div class="sc-val" style="color:#ea580c">'+ordres+'</div><div class="sc-sub">Ordres de réparation</div></div>' +
    caTiles;

  var filterStatut = $('dash-filter-statut') ? $('dash-filter-statut').value : '';
  var filtered = filterStatut ? docs.filter(function(d){ return d.statut === filterStatut; }) : docs;
  var recent = filtered.slice(0, 15);
  $('dash-list').innerHTML = recent.length ? buildTable(recent, false)
    : '<div class="empty"><div class="empty-icon">📄</div><div>Aucun document trouvé.</div></div>';
}

// ============================================================
//  LISTE
// ============================================================
function renderListe() {
  var all = loadDocs();
  var flt        = $('flt') ? $('flt').value : '';
  var fltStatut  = $('flt-statut') ? $('flt-statut').value : '';
  var fltPeriod  = $('flt-period') ? parseInt($('flt-period').value) : 0;
  var docs = all;
  if (flt) docs = docs.filter(function(d){ return d.type === flt; });
  if (fltStatut) {
    if (fltStatut === 'impayé') {
      docs = docs.filter(function(d){ return d.type==='facture' && d.statut!=='payé' && d.statut!=='annulé'; });
    } else {
      docs = docs.filter(function(d){ return d.statut === fltStatut; });
    }
  }
  if (fltPeriod) {
    var cutoff = Date.now() - fltPeriod * 86400000;
    docs = docs.filter(function(d){ return new Date(d.date).getTime() >= cutoff; });
  }
  updateListeFilterCounts();
  var countInfo = docs.length !== all.length
    ? '<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">'+docs.length+' document'+(docs.length>1?'s':'')+' sur '+all.length+'</div>'
    : '';
  $('liste-body').innerHTML = countInfo + (docs.length ? buildTable(docs, true)
    : '<div class="empty"><div class="empty-icon">📂</div><div>Aucun document trouvé pour ce filtre.</div></div>');
}

function buildTable(docs, withDelete) {
  var rows = docs.map(function(d) {
    var typeBadge = d.type === 'devis' ? '<span class="badge b-devis">Devis</span>' : d.type === 'ordre' ? '<span class="badge b-ordre">OdR</span>' : '<span class="badge b-facture">Facture</span>';
    var statBadge = d.statut === 'payé' ? '<span class="badge b-paye">Payé ✓</span>'
      : d.statut === 'annulé' ? '<span class="badge b-annule">Annulé</span>'
      : d.statut === 'créé' ? '<span class="badge b-cree">📝 Créé</span>'
      : '<span style="color:var(--text-dim);font-size:12px">'+escHtml(d.statut)+'</span>';
    var veh = escHtml([d.vm, d.vmo].filter(Boolean).join(' '));
    var declBadge = d.declare === false
      ? '<span class="badge-non-decl" style="font-size:10px">⚠ Non déclaré</span>'
      : '<span class="badge-decl" style="font-size:10px">✓ Déclaré</span>';
    var acompteBadge = (d.acompte && d.acompte.recu)
      ? '<br><span class="badge b-acompte" style="margin-top:3px">\ud83d\udcb6\u00a0' + fmt(d.acompte.montant) + ' vers\u00e9</span>'
      : '';
    var emailBadge = d.lastEmailAt
      ? ' <span title="Envoy\u00e9 par email le ' + escHtml(new Date(d.lastEmailAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})) + ' \u00e0 ' + escHtml(d.lastEmailTo||'') + '" style="cursor:help;font-size:11px">\u2709\ufe0f</span>'
      : '';
    var delBtn = withDelete ? '<button class="btn-d btn-sm" onclick="deleteDoc('+d.id+')">🗑</button>' : '';
    // La demande d'avis est désormais intégrée directement à l'email de la
    // facture (voir buildDocEmailHtml). Ce bouton reste disponible comme
    // relance manuelle une fois la facture payée (prestation terminée) et si
    // on a une adresse à qui l'envoyer.
    var avisBtn = (d.type === 'facture' && d.statut === 'payé' && d.ce)
      ? '<button class="btn-s btn-sm" onclick="openAvisModal('+d.id+')" title="'+(d.avisEmailAt ? 'Déjà demandé le '+escHtml(new Date(d.avisEmailAt).toLocaleDateString('fr-FR')) : 'Demander un avis Google')+'">⭐'+(d.avisEmailAt ? '' : ' Avis')+'</button>'
      : '';
    var factureBtn = d.type === 'devis'
      ? '<button class="btn-s btn-sm" onclick="devisToFacture('+d.id+')" title="Transformer en facture">🧾 Facturer</button>'
      : '';
    return '<tr>'
      + '<td><span class="doc-num">'+(escHtml(d.num)||'—')+'</span></td>'
      + '<td>'+typeBadge+'</td>'
      + '<td>'+fmtDate(d.date)+'</td>'
      + '<td><strong>'+(escHtml(d.cn)||'—')+'</strong>'+(veh?'<br><span style="color:var(--text-dim);font-size:11px">'+veh+(d.van?' ('+escHtml(d.van)+')':'')+'</span>':'')+'</td>'
      + '<td style="font-family:var(--fm);color:var(--blue)">'+fmt(d.ttc||0)+'</td>'
      + '<td>'+statBadge+emailBadge+acompteBadge+'</td>'
      + '<td><div class="act-cell">'
        + '<button class="btn-s btn-sm" onclick="previewDoc('+d.id+')">👁 Aperçu</button>'
        + '<button class="btn-s btn-sm" onclick="loadDoc('+d.id+')">✏️ Modifier</button>'
        + factureBtn
        + avisBtn
        + delBtn
      + '</div></td>'
      + '</tr>';
  }).join('');
  return '<table class="dt"><thead><tr><th>N°</th><th>Type</th><th>Date</th><th>Client / Véhicule</th><th>Montant TTC</th><th>Statut</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
}

// ============================================================
//  CARNET CLIENTS
// ============================================================
// loadClients/saveClients définis dans le bloc Firebase ci-dessus

var editClientId = null;

function renderCarnet() {
  var q = ($('carnet-search') ? $('carnet-search').value : '').toLowerCase();
  var clients = loadClients().filter(function(cl) {
    return !q || (cl.nom+cl.vm+cl.vmo+cl.vim+cl.tel).toLowerCase().includes(q);
  });
  var grid = $('carnet-grid');
  if (!grid) return;
  grid.innerHTML = clients.length ? clients.map(function(cl) {
    return clientCard(cl, false);
  }).join('') : '<div class="carnet-empty">Aucun client enregistré.</div>';
}

function renderCarnetModal() {
  var q = ($('carnet-modal-search') ? $('carnet-modal-search').value : '').toLowerCase();
  var clients = loadClients().filter(function(cl) {
    return !q || (cl.nom+cl.vm+cl.vmo+cl.vim+cl.tel).toLowerCase().includes(q);
  });
  var grid = $('carnet-modal-grid');
  if (!grid) return;
  grid.innerHTML = clients.length ? clients.map(function(cl) {
    return clientCard(cl, true);
  }).join('') : '<div class="carnet-empty">Aucun client.</div>';
}

function clientCard(cl, selectable) {
  var onclick = selectable ? 'onclick="selectClient(' + cl.id + ')"' : '';
  // Construire la liste de tous les véhicules
  var vehs = cl.vehs && cl.vehs.length
    ? cl.vehs
    : (cl.vm ? [{ vm:cl.vm, vmo:cl.vmo||'', vmot:cl.vmot||'', van:cl.van||'', vim:cl.vim||'' }] : []);
  var vehsHTML = vehs.map(function(v) {
    var label = [v.vm, v.vmo, v.vmot, v.van ? '(' + v.van + ')' : ''].filter(Boolean).join(' ');
    var immat = v.vim ? ' <span style="font-family:var(--fm);font-size:10px;color:var(--text-muted)">' + escHtml(v.vim.toUpperCase()) + '</span>' : '';
    return label ? '<div class="carnet-card-veh">🚗 ' + escHtml(label) + immat + '</div>' : '';
  }).filter(Boolean).join('');
  return '<div class="carnet-card" ' + onclick + '>'
    + '<button class="carnet-card-del" onclick="event.stopPropagation();deleteClient(' + cl.id + ')" title="Supprimer">×</button>'
    + '<div class="carnet-card-name">' + escHtml(cl.nom || '—') + '</div>'
    + vehsHTML
    + (cl.tel ? '<div class="carnet-card-tel">📞 ' + escHtml(cl.tel) + '</div>' : '')
    + (!selectable ? '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn-s btn-sm" onclick="editClient(' + cl.id + ')">✏️ Modifier</button><button class="btn-s btn-sm" onclick="showClientHistory(' + cl.id + ')">📋 Historique</button><button class="btn-p btn-sm" onclick="selectClientAndGo(' + cl.id + ')">→ Devis</button></div>' : '')
    + '</div>';
}

function openCarnetModal() {
  $('carnet-modal-search').value = '';
  renderCarnetModal();
  $('carnet-modal').classList.add('open');
}
function closeCarnetModal() { $('carnet-modal').classList.remove('open'); }

function openAddClientModal(fromCarnet) {
  editClientId = null;
  // Généré une seule fois ici et réutilisé comme id définitif à l'enregistrement
  // (saveClient) : les fichiers déjà envoyés pendant que le formulaire est
  // encore ouvert doivent pointer vers le même dossier de stockage que le
  // client une fois créé.
  acDraftId = Date.now();
  acDocs = [];
  $('add-client-title').textContent = 'Nouveau client';
  ['ac-nom','ac-tel','ac-email','ac-adr','ac-ville'].forEach(function(i){ $(i).value=''; });
  var vl = $('ac-veh-list'); if(vl) vl.innerHTML = '';
  addVehicleRow();
  renderAcDocs();
  $('ac-doc-status').textContent = '';
  closeCarnetModal();
  $('add-client-modal').classList.add('open');
}
function closeAddClientModal() { $('add-client-modal').classList.remove('open'); }

function editClient(cid) {
  var cl = loadClients().find(function(c){ return c.id === cid; });
  if (!cl) return;
  editClientId = cid;
  acDraftId = cid;
  acDocs = (cl.documents || []).slice();
  $('add-client-title').textContent = 'Modifier le client';
  $('ac-nom').value = cl.nom || '';
  $('ac-tel').value = cl.tel || '';
  $('ac-email').value = cl.email || '';
  $('ac-adr').value = cl.adr || '';
  $('ac-ville').value = cl.ville || '';
  // Charger les véhicules multiples
  var vehList = $('ac-veh-list');
  if (vehList) {
    vehList.innerHTML = '';
    var clVehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}] : []);
    clVehs.forEach(function(v){ addVehicleRow(v); });
  }
  renderAcDocs();
  $('ac-doc-status').textContent = '';
  $('add-client-modal').classList.add('open');
}

function saveClient() {
  var nom = $('ac-nom').value.trim();
  if (!nom) { alert('Le nom est obligatoire.'); return; }
  var clients = loadClients();
  // Collecter les véhicules depuis les lignes dynamiques
  var vehs = [];
  document.querySelectorAll('#ac-veh-list .veh-row').forEach(function(row) {
    var vm    = row.querySelector('.vr-vm').value.trim();
    var vmo   = row.querySelector('.vr-vmo').value.trim();
    var vmot  = row.querySelector('.vr-vmot').value.trim();
    var van   = row.querySelector('.vr-van').value.trim();
    var vim   = row.querySelector('.vr-vim').value.trim();
    var notes = row.querySelector('.vr-notes').value.trim();
    var photos = row._photos || [];
    var videos = row._videos || [];
    if (vm || vmo || vim) vehs.push({ id: row.dataset.vehId, vm:vm, vmo:vmo, vmot:vmot, van:van, vim:vim, notes:notes, photos:photos, videos:videos });
  });
  // Compatibilité rétro : conserver vm/vmo/etc sur le premier véhicule
  var firstVeh = vehs[0] || {};
  var cl = {
    id: editClientId || acDraftId || Date.now(),
    nom: nom, tel: $('ac-tel').value, email: $('ac-email').value,
    adr: $('ac-adr').value, ville: $('ac-ville').value,
    vm: firstVeh.vm||'', vmo: firstVeh.vmo||'', vmot: firstVeh.vmot||'',
    van: firstVeh.van||'', vim: firstVeh.vim||'',
    vehs: vehs,
    documents: acDocs,
  };
  if (editClientId) {
    var i = clients.findIndex(function(c){ return c.id === editClientId; });
    if (i >= 0) clients[i] = cl; else clients.unshift(cl);
  } else {
    clients.unshift(cl);
  }
  saveClients(clients);
  closeAddClientModal();
  renderCarnet();
}

function deleteClient(cid) {
  if (!confirm('Supprimer ce client ?')) return;
  saveClients(loadClients().filter(function(c){ return c.id !== cid; }));
  deleteClientFirebase(cid);
  renderCarnet();
  renderCarnetModal();
}

// Recherche client inline sur le champ "Nom / Société" du formulaire de
// document — même patron que renderRdvClientResults() / renderCodageClientResults().
function renderDocClientResults() {
  var input = $('f-cnom');
  var box = $('f-cnom-results');
  if (!input || !box) return;
  var q = normCodageStr(input.value);
  if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
  var matches = loadClients().filter(function(c) {
    var hay = normCodageStr([c.nom, c.tel, c.email, c.vm, c.vmo, c.vim].join(' '));
    return hay.indexOf(q) >= 0;
  }).slice(0, 15);
  box.style.display = 'block';
  box.innerHTML = matches.length ? matches.map(function(c) {
    var veh = (c.vehs && c.vehs[0]) ? (c.vehs[0].vm + ' ' + (c.vehs[0].vmo||'')) : (c.vm ? (c.vm + ' ' + (c.vmo||'')) : '');
    return '<div class="search-result-item" onclick="pickDocClient(' + c.id + ')">'
      + '<div style="font-weight:600;font-size:13px">' + escHtml(c.nom) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim)">' + escHtml(veh || 'Aucun véhicule enregistré') + '</div>'
      + '</div>';
  }).join('') : '<div style="padding:12px;font-size:12.5px;color:var(--text-muted)">Aucun client trouvé.</div>';
}

function pickDocClient(cid) {
  selectClient(cid);
  $('f-cnom-results').style.display = 'none';
  $('f-cnom-results').innerHTML = '';
  onFormChange();
}

function selectClient(cid) {
  var cl = loadClients().find(function(c){ return c.id === cid; });
  if (!cl) return;
  $('f-cnom').value  = cl.nom   || '';
  $('f-ctel').value  = cl.tel   || '';
  $('f-cemail').value = cl.email || '';
  $('f-cadr').value  = cl.adr   || '';
  $('f-cville').value = cl.ville || '';
  closeCarnetModal();
  // Si plusieurs véhicules → afficher le sélecteur
  var vehs = cl.vehs && cl.vehs.length ? cl.vehs
    : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}] : []);
  if (vehs.length > 1) {
    openVehSelect(cid);
  } else if (vehs.length === 1) {
    applyVehicle(vehs[0]);
  }
}

function selectClientAndGo(cid) {
  selectClient(cid);
  showTab('form');
}

// Enregistrer client depuis le formulaire courant
function saveCurrentClientToCarnet() {
  var nom = $('f-cnom').value.trim();
  if (!nom) { alert('Renseignez le nom du client d\'abord.'); return; }
  var clients = loadClients();
  // Chercher si déjà existant (même nom)
  var existing = clients.find(function(c){ return c.nom.toLowerCase() === nom.toLowerCase(); });
  if (existing && !confirm('Un client "' + nom + '" existe déjà. Mettre à jour ?')) return;
  var cl = {
    id: existing ? existing.id : Date.now(),
    nom: nom, tel: $('f-ctel').value, email: $('f-cemail').value,
    adr: $('f-cadr').value, ville: $('f-cville').value,
    vm: $('f-vm').value, vmo: $('f-vmo').value, vmot: $('f-vmot').value,
    van: $('f-van').value, vim: $('f-vim').value,
  };
  if (existing) {
    var i = clients.indexOf(existing);
    clients[i] = cl;
  } else {
    clients.unshift(cl);
  }
  saveClients(clients);
  alert('Client enregistré dans le carnet ✓');
}

// ============================================================
//  OLSX — GAINS MOTEUR
// ============================================================
var currentGains = null;
var olsxDetected = null;

// Retourne la liste des gains depuis les lignes via le catalogue
function buildGainsFromLines(linesArr) {
  var cat = loadCat();
  var set = new Set();
  linesArr.forEach(function(l) {
    if (!l.label) return;
    for (var gi = 0; gi < cat.length; gi++) {
      for (var ii = 0; ii < cat[gi].items.length; ii++) {
        var it = cat[gi].items[ii];
        if (it.l === l.label && it.gains && it.gains.length) {
          it.gains.forEach(function(g){ if(g) set.add(g); });
        }
      }
    }
  });
  return [...set].slice(0, 8);
}

// Pré-remplir f-gains depuis les prestations actuellement sélectionnées
function prefillGains() {
  var suggestions = buildGainsFromLines(lines);
  if (suggestions.length) {
    $('f-gains').value = suggestions.join('\n');
    previewGainsBadge();
  } else {
    $('f-gains').value = '';
    previewGainsBadge();
    // Feedback
    var btn = event.currentTarget;
    btn.textContent = 'Aucun gain trouvé';
    setTimeout(function(){ btn.textContent = '↺ Auto'; }, 1500);
  }
}

// Afficher les gains comme badges dans le formulaire
function previewGainsBadge() {
  var el = $('gains-badge-preview');
  if (!el) return;
  var raw = ($('f-gains') ? $('f-gains').value : '');
  var items = raw.split('\n').map(function(g){return g.trim();}).filter(Boolean);
  if (!items.length) { el.innerHTML = ''; return; }
  el.innerHTML = items.map(function(g) {
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:rgba(30,144,255,.1);border:1px solid rgba(30,144,255,.2);border-radius:20px;font-size:11px;color:var(--blue)">' + g + '</span>';
  }).join('');
}

var _olsxUrl = null;

function openOlsxModal() {
  olsxDetected = null;
  $('olsx-gains-preview').textContent = 'Sélectionne un véhicule dans le simulateur…';
  $('olsx-import-btn').style.display = 'none';
  $('olsx-modal').classList.add('open');
  loadOlsxIframe();
}

function loadOlsxIframe() {
  var frame = $('olsx-iframe');
  if (!frame || frame.src.indexOf('api.olsx.eu') !== -1) return;
  if (_olsxUrl) { frame.src = _olsxUrl; return; }
  fetch('/.netlify/functions/olsx-token')
    .then(function(r) { return r.json(); })
    .then(function(j) {
      if (!j.url) throw new Error('URL absente');
      _olsxUrl = j.url;
      frame.src = j.url;
    })
    .catch(function() {
      $('olsx-gains-preview').textContent = 'Simulateur indisponible — vérifie OLSX_TOKEN dans les variables Netlify.';
    });
}
function closeOlsxModal() { $('olsx-modal').classList.remove('open'); }

function importOlsxGains() {
  if (!olsxDetected) return;
  currentGains = olsxDetected;
  renderGainsBar();
  // Ajouter les gains numériques OLSX dans f-gains
  var g = olsxDetected;
  var parts = [];
  if (g.chOrig && g.ch) parts.push(g.chOrig + ' ch → ' + g.ch + ' ch (+' + (g.ch - g.chOrig) + ' ch)');
  if (g.nmOrig && g.nm) parts.push(g.nmOrig + ' Nm → ' + g.nm + ' Nm (+' + (g.nm - g.nmOrig) + ' Nm)');
  if (g.conso) parts.push('Consommation : ' + g.conso);
  if (parts.length && $('f-gains')) {
    var existing = $('f-gains').value.trim();
    $('f-gains').value = (existing ? existing + '\n' : '') + parts.join('\n');
    previewGainsBadge();
  }
  closeOlsxModal();
}

function clearGains() {
  currentGains = null;
  renderGainsBar();
}

function renderGainsBar() {
  var bar = $('gains-bar');
  if (!bar) return;
  if (!currentGains) {
    bar.style.display = 'none';
    return;
  }
  var g = currentGains;
  var items = [];
  if (g.chOrig && g.ch)   items.push({ lbl: 'Puissance', val: g.chOrig + ' → ' + g.ch + ' ch (+' + (g.ch - g.chOrig) + ')' });
  if (g.nmOrig && g.nm)   items.push({ lbl: 'Couple',    val: g.nmOrig + ' → ' + g.nm + ' Nm (+' + (g.nm - g.nmOrig) + ')' });
  if (g.conso)             items.push({ lbl: 'Conso',     val: g.conso });
  bar.style.display = 'block';
  $('gains-bar-vals').innerHTML = items.map(function(it) {
    return '<div style="font-size:13px"><strong style="color:var(--green)">' + it.val + '</strong> <span style="color:var(--text-dim);font-size:11px">' + it.lbl + '</span></div>';
  }).join('');
}

// Écouter les messages postMessage de l'iframe OLSX
window.addEventListener('message', function(e) {
  // OLSX envoie les données de gain via postMessage
  if (!e.data) return;
  var d = e.data;
  // Format OLSX : { type: 'olsx_data', ch: 220, chOrig: 180, nm: 380, nmOrig: 320, ... }
  // ou format alternatif selon la version de l'API
  if (d.type === 'olsx_data' || d.ch || d.power || d.horsepower) {
    olsxDetected = {
      ch:     d.ch || d.power || d.horsepower || null,
      chOrig: d.chOrig || d.powerOrig || d.originalHorsepower || null,
      nm:     d.nm || d.torque || null,
      nmOrig: d.nmOrig || d.torqueOrig || null,
      conso:  d.conso || d.consumption || null,
      raw:    d
    };
    // Construire le preview
    var parts = [];
    if (olsxDetected.chOrig && olsxDetected.ch) parts.push(olsxDetected.chOrig + '→' + olsxDetected.ch + ' ch');
    if (olsxDetected.nmOrig && olsxDetected.nm) parts.push(olsxDetected.nmOrig + '→' + olsxDetected.nm + ' Nm');
    if (olsxDetected.conso) parts.push(olsxDetected.conso);
    if (parts.length) {
      $('olsx-gains-preview').textContent = '✓ Gains détectés : ' + parts.join(' · ');
      $('olsx-gains-preview').style.color = 'var(--green)';
      $('olsx-import-btn').style.display = 'inline-flex';
    }
  }
});

// ============================================================
//  TABS (mis à jour avec carnet)
// ============================================================

// ============================================================
//  GESTIONNAIRE CATALOGUE
// ============================================================
var catEditingGroup = null;   // index groupe en cours d'édition
var catEditingItem  = null;   // index item en cours d'édition

function renderCatEditor() {
  var cat = loadCat();
  var el = $('cat-editor');
  if (!el) return;
  if (!cat.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div>Aucun service. Clique sur "+ Ajouter une catégorie".</div>';
    return;
  }
  el.innerHTML = cat.map(function(grp, gi) {
    var items = (grp.items || []).map(function(it, ii) {
      var gainsCount = (it.gains || []).filter(Boolean).length;
      var typeLabel = it.type === 'piece' ? 'Pièce' : (it.type === 'mo' ? 'MO' : '');
      return '<div class="cat-item">'
        + '<div class="cat-item-label">' + escHtml(it.l)
          + (typeLabel ? ' <span class="cat-item-type ' + it.type + '">' + typeLabel + '</span>' : '')
          + (it.ref ? ' <span class="cat-item-ref">Réf. ' + escHtml(it.ref) + '</span>' : '')
          + (gainsCount > 0 ? ' <span style="font-size:10px;color:var(--green);margin-left:6px">✓ ' + gainsCount + ' gain' + (gainsCount>1?'s':'') + '</span>' : '') + '</div>'
        + '<div class="cat-item-price">' + (it.p > 0 ? it.p + ' €' : '<span style="color:var(--text-muted)">Sur devis</span>') + '</div>'
        + '<div class="cat-item-actions">'
          + '<button class="cat-icon-btn" onclick="editCatItem(' + gi + ',' + ii + ')" title="Modifier">✏️</button>'
          + '<button class="cat-icon-btn" onclick="moveCatItem(' + gi + ',' + ii + ',-1)" title="Monter">↑</button>'
          + '<button class="cat-icon-btn" onclick="moveCatItem(' + gi + ',' + ii + ',1)" title="Descendre">↓</button>'
          + '<button class="cat-icon-btn del" onclick="deleteCatItem(' + gi + ',' + ii + ')" title="Supprimer">×</button>'
        + '</div>'
      + '</div>';
    }).join('');
    return '<div class="cat-group">'
      + '<div class="cat-group-head" onclick="toggleCatGroup(this)">'
        + '<div class="cat-group-name">' + escHtml(grp.g) + '</div>'
        + '<div class="cat-group-count">' + (grp.items||[]).length + ' entrée' + ((grp.items||[]).length > 1 ? 's' : '') + '</div>'
        + '<div class="cat-group-actions" onclick="event.stopPropagation()">'
          + '<button class="cat-icon-btn" onclick="renameCatGroup(' + gi + ')" title="Renommer">✏️</button>'
          + '<button class="cat-icon-btn" onclick="moveCatGroup(' + gi + ',-1)" title="Monter">↑</button>'
          + '<button class="cat-icon-btn" onclick="moveCatGroup(' + gi + ',1)" title="Descendre">↓</button>'
          + '<button class="cat-icon-btn del" onclick="deleteCatGroup(' + gi + ')" title="Supprimer la catégorie">×</button>'
        + '</div>'
      + '</div>'
      + '<div class="cat-items" id="cat-group-' + gi + '">'
        + items
        + '<button class="cat-add-item" onclick="addCatItem(' + gi + ')">+ Ajouter une entrée</button>'
      + '</div>'
    + '</div>';
  }).join('');
}

function toggleCatGroup(head) {
  var items = head.nextElementSibling;
  items.style.display = items.style.display === 'none' ? '' : 'none';
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Édition item ─────────────────────────────────────────────
function openCatModal(gi, ii) {
  catEditingGroup = gi;
  catEditingItem  = ii;
  var cat = loadCat();
  var isNew = ii === null;
  $('cat-modal-title').textContent = isNew ? 'Nouvelle entrée' : 'Modifier l\'entrée';

  // Remplir le select des groupes
  var sel = $('cat-item-group');
  sel.innerHTML = cat.map(function(grp, i) {
    return '<option value="' + i + '"' + (i === gi ? ' selected' : '') + '>' + escHtml(grp.g) + '</option>';
  }).join('');

  if (!isNew) {
    var it = cat[gi].items[ii];
    $('cat-item-label').value = it.l;
    $('cat-item-price').value = it.p;
    $('cat-item-gains').value = (it.gains || []).join('\n');
    $('cat-item-type').value = it.type || 'service';
    $('cat-item-ref').value = it.ref || '';
    $('cat-item-desc').value = it.desc || '';
  } else {
    $('cat-item-label').value = '';
    $('cat-item-price').value = '';
    $('cat-item-gains').value = '';
    $('cat-item-type').value = 'service';
    $('cat-item-ref').value = '';
    $('cat-item-desc').value = '';
  }
  $('cat-item-modal').classList.add('open');
  setTimeout(function(){ $('cat-item-label').focus(); }, 100);
}

function closeCatModal() { $('cat-item-modal').classList.remove('open'); }

function addCatItem(gi) { openCatModal(gi, null); }
function editCatItem(gi, ii) { openCatModal(gi, ii); }

function saveCatItem() {
  var label = $('cat-item-label').value.trim();
  if (!label) { alert('Le nom du service est obligatoire.'); return; }
  var price = parseFloat($('cat-item-price').value) || 0;
  var targetGroup = parseInt($('cat-item-group').value);
  var cat = loadCat();

  var gainsRaw = ($('cat-item-gains').value || '').split('\n').map(function(g){ return g.trim(); }).filter(Boolean);
  var type = $('cat-item-type').value || 'service';
  var ref = $('cat-item-ref').value.trim();
  var desc = $('cat-item-desc').value.trim();
  var item = { l: label, p: price, gains: gainsRaw, type: type, ref: ref, desc: desc };

  if (catEditingItem === null) {
    // Nouveau
    cat[targetGroup].items.push(item);
  } else {
    // Modifier — gérer le changement de groupe
    if (targetGroup === catEditingGroup) {
      cat[catEditingGroup].items[catEditingItem] = item;
    } else {
      cat[catEditingGroup].items.splice(catEditingItem, 1);
      cat[targetGroup].items.push(item);
    }
  }
  saveCat(cat);
  closeCatModal();
  renderCatEditor();
}

// ── Suppression / déplacement items ──────────────────────────
function deleteCatItem(gi, ii) {
  if (!confirm('Supprimer ce service ?')) return;
  var cat = loadCat();
  cat[gi].items.splice(ii, 1);
  saveCat(cat);
  renderCatEditor();
}

function moveCatItem(gi, ii, dir) {
  var cat = loadCat();
  var items = cat[gi].items;
  var ni = ii + dir;
  if (ni < 0 || ni >= items.length) return;
  var tmp = items[ii]; items[ii] = items[ni]; items[ni] = tmp;
  saveCat(cat);
  renderCatEditor();
}

// ── Groupes ───────────────────────────────────────────────────
function addCatGroup() {
  $('cat-group-name-input').value = '';
  $('cat-group-modal').classList.add('open');
  setTimeout(function(){ $('cat-group-name-input').focus(); }, 100);
}

function confirmAddGroup() {
  var name = $('cat-group-name-input').value.trim();
  if (!name) { alert('Nom de catégorie obligatoire.'); return; }
  var cat = loadCat();
  cat.push({ g: name, items: [] });
  saveCat(cat);
  $('cat-group-modal').classList.remove('open');
  renderCatEditor();
}

function renameCatGroup(gi) {
  var cat = loadCat();
  var name = prompt('Nouveau nom de la catégorie :', cat[gi].g);
  if (!name || !name.trim()) return;
  cat[gi].g = name.trim();
  saveCat(cat);
  renderCatEditor();
}

function deleteCatGroup(gi) {
  var cat = loadCat();
  if (cat[gi].items.length > 0 && !confirm('Supprimer la catégorie "' + cat[gi].g + '" et ses ' + cat[gi].items.length + ' services ?')) return;
  cat.splice(gi, 1);
  saveCat(cat);
  renderCatEditor();
}

function moveCatGroup(gi, dir) {
  var cat = loadCat();
  var ni = gi + dir;
  if (ni < 0 || ni >= cat.length) return;
  var tmp = cat[gi]; cat[gi] = cat[ni]; cat[ni] = tmp;
  saveCat(cat);
  renderCatEditor();
}

function resetCatalogue() {
  if (!confirm('Réinitialiser le catalogue aux services par défaut ?')) return;
  localStorage.removeItem(CAT_KEY);
  if (db && syncOk) db.collection('config').doc('catalogue').delete().catch(function(){});
  renderCatEditor();
}

function exportCatalogue() {
  var cat = loadCat();
  var json = JSON.stringify(cat, null, 2);
  var blob = new Blob([json], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'catalogue-areprog.json';
  a.click();
}

// Sync Firebase → catalogue
function syncCatalogueFromFirebase() {
  if (!db) return;
  db.collection('config').doc('catalogue').get()
    .then(function(doc) {
      if (doc.exists && doc.data().cat) {
        localStorage.setItem(CAT_KEY, JSON.stringify(doc.data().cat));
      }
    })
    .catch(function(){});
}

// ============================================================
//  CRÉNEAUX RDV — disponibilité de la page publique /rdv
//  Lu par netlify/function/rdv-booking (config/rdvDispo). Mêmes
//  valeurs par défaut que la fonction si le document n'existe pas.
// ============================================================
var RDV_DISPO_KEY = 'ar_rdv_dispo';
var RDV_DISPO_DEFAULT = {
  jours: [1,2,3,4,5,6], // 0=dimanche … 6=samedi
  heures: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
  fermetures: [], // [{date:'2026-12-25', label:'Noël'}]
};
var DISPO_JOURS_LABELS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
var DISPO_HEURES_CANDIDATS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

function loadRdvDispo() {
  try {
    var raw = localStorage.getItem(RDV_DISPO_KEY);
    var d = raw ? JSON.parse(raw) : null;
    if (!d || !Array.isArray(d.jours) || !Array.isArray(d.heures)) return JSON.parse(JSON.stringify(RDV_DISPO_DEFAULT));
    return { jours: d.jours, heures: d.heures, fermetures: Array.isArray(d.fermetures) ? d.fermetures : [] };
  } catch(e) { return JSON.parse(JSON.stringify(RDV_DISPO_DEFAULT)); }
}

function saveRdvDispo(dispo) {
  localStorage.setItem(RDV_DISPO_KEY, JSON.stringify(dispo));
  if (db && syncOk) {
    db.collection('config').doc('rdvDispo').set(dispo)
      .catch(function(e){ console.warn('Firebase rdvDispo save:', e); });
  }
}

function syncRdvDispoFromFirebase() {
  if (!db) return;
  db.collection('config').doc('rdvDispo').get()
    .then(function(doc) {
      if (doc.exists) localStorage.setItem(RDV_DISPO_KEY, JSON.stringify(doc.data()));
    })
    .catch(function(){});
}

// État en cours d'édition dans la modale (copie de travail, appliquée à
// l'enregistrement seulement au clic sur "Enregistrer").
var dispoDraft = null;

function openRdvDispoModal() {
  dispoDraft = loadRdvDispo();
  renderDispoDays();
  renderDispoHours();
  renderDispoClosures();
  $('rdv-dispo-modal').classList.add('open');
}

function closeRdvDispoModal() {
  $('rdv-dispo-modal').classList.remove('open');
  dispoDraft = null;
}

function renderDispoDays() {
  var el = $('dispo-days');
  if (!el) return;
  el.innerHTML = DISPO_JOURS_LABELS.map(function(label, i) {
    var on = dispoDraft.jours.indexOf(i) >= 0;
    return '<button type="button" class="dispo-day-btn'+(on?' on':'')+'" onclick="toggleDispoDay('+i+')">'+label+'</button>';
  }).join('');
}

function toggleDispoDay(i) {
  var idx = dispoDraft.jours.indexOf(i);
  if (idx >= 0) dispoDraft.jours.splice(idx, 1);
  else dispoDraft.jours.push(i);
  renderDispoDays();
}

function renderDispoHours() {
  var el = $('dispo-hours');
  if (!el) return;
  el.innerHTML = DISPO_HEURES_CANDIDATS.map(function(h) {
    var on = dispoDraft.heures.indexOf(h) >= 0;
    return '<button type="button" class="dispo-hour-chip'+(on?' on':'')+'" onclick="toggleDispoHour(\''+h+'\')">'+h+'</button>';
  }).join('');
}

function toggleDispoHour(h) {
  var idx = dispoDraft.heures.indexOf(h);
  if (idx >= 0) dispoDraft.heures.splice(idx, 1);
  else dispoDraft.heures.push(h);
  dispoDraft.heures.sort();
  renderDispoHours();
}

function renderDispoClosures() {
  var el = $('dispo-closures-list');
  if (!el) return;
  if (!dispoDraft.fermetures.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">Aucune fermeture exceptionnelle programmée.</div>';
    return;
  }
  var sorted = dispoDraft.fermetures.slice().sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });
  el.innerHTML = sorted.map(function(f) {
    var d = f.date ? f.date.split('-').reverse().join('/') : '?';
    return '<div class="dispo-closure-row"><span><strong>'+d+'</strong>'+(f.label ? ' — '+escHtml(f.label) : '')+'</span>'
      + '<button type="button" onclick="removeDispoClosure(\''+f.date+'\')" style="width:26px;height:26px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text-dim);cursor:pointer;font-size:14px">×</button></div>';
  }).join('');
}

function addDispoClosure() {
  var date = $('dispo-new-date').value;
  if (!date) { alert('Choisissez une date.'); return; }
  var label = $('dispo-new-label').value.trim();
  if (dispoDraft.fermetures.some(function(f){ return f.date === date; })) {
    alert('Cette date est déjà dans la liste.');
    return;
  }
  dispoDraft.fermetures.push({ date: date, label: label });
  $('dispo-new-date').value = '';
  $('dispo-new-label').value = '';
  renderDispoClosures();
}

function removeDispoClosure(date) {
  dispoDraft.fermetures = dispoDraft.fermetures.filter(function(f){ return f.date !== date; });
  renderDispoClosures();
}

function resetRdvDispo() {
  if (!confirm('Réinitialiser les créneaux aux valeurs par défaut (Lun–Sam, 8h–18h, aucune fermeture) ?')) return;
  dispoDraft = JSON.parse(JSON.stringify(RDV_DISPO_DEFAULT));
  renderDispoDays();
  renderDispoHours();
  renderDispoClosures();
}

function saveRdvDispoFromModal() {
  if (!dispoDraft.jours.length) { alert('Sélectionnez au moins un jour ouvert.'); return; }
  if (!dispoDraft.heures.length) { alert('Sélectionnez au moins un créneau horaire.'); return; }
  saveRdvDispo(dispoDraft);
  closeRdvDispoModal();
}

// ============================================================
//  LOGO HTML pour les documents
// ============================================================
function sanitizeCssColor(c) {
  return /^#[0-9a-fA-F]{3,8}$|^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$|^rgba\(/.test(c||'') ? c : '#1E90FF';
}
function buildLogoHTML(tpl) {
  var nom = tpl.nom || 'AREPROG';
  var style = tpl.logoStyle || 'split';
  var color = sanitizeCssColor(tpl.color || '#1E90FF');
  if (style === 'split') {
    var half = Math.ceil(nom.length / 2);
    return escHtml(nom.slice(0,half)) + '<span style="color:' + color + '">' + escHtml(nom.slice(half)) + '</span>';
  } else if (style === 'full') {
    return '<span style="color:' + color + '">' + escHtml(nom) + '</span>';
  }
  return escHtml(nom);
}

// ============================================================
//  TEMPLATE — Modèle de document
// ============================================================
var TPL_KEY = 'ar_template';
var TPL_DEFAULT = {
  nom:'AREPROG', activite:'Reprogrammation moteur en atelier',
  zones:'Pays Basque (64) · Landes (40) · Yonne (89)',
  tel:'06 67 92 46 30', email:'contact@areprog.fr', web:'areprog.fr',
  adresse:'', legal:'',
  footer:'AREPROG — Reprogrammation moteur en atelier · Pays Basque (64) · Landes (40) · Yonne (89)\n06 67 92 46 30 · areprog.fr · Garantie 2 ans sur chaque prestation · 100% réversible',
  color:'#1E90FF', titleColor:'#111111', logoStyle:'split',
  showGains:true, showVeh:true, showFooter:true, showLegal:true,
  validite:30,
};

function loadTemplate() {
  try {
    var raw = localStorage.getItem(TPL_KEY);
    return raw ? Object.assign({},TPL_DEFAULT,JSON.parse(raw)) : Object.assign({},TPL_DEFAULT);
  } catch(e) { return Object.assign({},TPL_DEFAULT); }
}
function saveTemplate() {
  localStorage.setItem(TPL_KEY, JSON.stringify(readTplForm()));
  alert('Template enregistré ✓');
}
function resetTemplate() {
  if (!confirm('Réinitialiser le template aux valeurs par défaut ?')) return;
  localStorage.removeItem(TPL_KEY);
  fillTplForm(TPL_DEFAULT);
  livePreview();
}
function syncTpl(key,val) {
  var map = {
    nom:['tpl-nom','tpl2-nom'], activite:['tpl-activite','tpl2-activite'],
    zones:['tpl-zones','tpl2-zones'], tel:['tpl-tel','tpl2-tel'],
    web:['tpl-web','tpl2-web'], legal:['tpl-legal','tpl2-legal'],
    footer:['tpl-footer','tpl2-footer'], color:['tpl-color-hex','tpl2-color-hex'],
  };
  if (map[key]) map[key].forEach(function(id){ var el=$(id); if(el&&el.value!==val)el.value=val; });
  livePreview();
}
function readTplForm() {
  function v(id,def){ var el=$(id); return el&&el.value?el.value:def; }
  function ck(id,def){ var el=$(id); return el?el.checked:def; }
  return {
    nom:v('tpl-nom','AREPROG'), activite:v('tpl-activite',TPL_DEFAULT.activite),
    zones:v('tpl-zones',''), tel:v('tpl-tel',''), email:v('tpl-email',''),
    web:v('tpl-web',''), adresse:v('tpl-adresse',''), legal:v('tpl-legal',''),
    footer:v('tpl-footer',TPL_DEFAULT.footer),
    color:v('tpl-color-hex','#1E90FF'), titleColor:v('tpl-title-color-hex','#111111'),
    logoStyle:v('tpl-logo-style','split'),
    showGains:ck('tpl-show-gains',true), showVeh:ck('tpl-show-veh',true),
    showFooter:ck('tpl-show-footer',true), showLegal:ck('tpl-show-legal',true),
    validite:parseInt(v('tpl-validite','30'))||30,
  };
}
function fillTplForm(tpl) {
  var fields=[
    ['tpl-nom',tpl.nom],['tpl-activite',tpl.activite],['tpl-zones',tpl.zones],
    ['tpl-tel',tpl.tel],['tpl-email',tpl.email],['tpl-web',tpl.web],
    ['tpl-adresse',tpl.adresse],['tpl-legal',tpl.legal],['tpl-footer',tpl.footer],
    ['tpl-color-hex',tpl.color],['tpl-color-pick',tpl.color],
    ['tpl-title-color-hex',tpl.titleColor],['tpl-title-color-pick',tpl.titleColor],
    ['tpl2-nom',tpl.nom],['tpl2-activite',tpl.activite],['tpl2-zones',tpl.zones],
    ['tpl2-tel',tpl.tel],['tpl2-web',tpl.web],['tpl2-legal',tpl.legal],
    ['tpl2-footer',tpl.footer],['tpl2-color-hex',tpl.color],['tpl2-color-pick',tpl.color],
  ];
  fields.forEach(function(f){ var el=$(f[0]); if(el) el.value=f[1]||''; });
  var ls=$('tpl-logo-style'); if(ls) ls.value=tpl.logoStyle||'split';
  var ve=$('tpl-validite'); if(ve) ve.value=tpl.validite||30;
  if($('tpl-show-gains'))  $('tpl-show-gains').checked  = tpl.showGains!==false;
  if($('tpl-show-veh'))    $('tpl-show-veh').checked    = tpl.showVeh!==false;
  if($('tpl-show-footer')) $('tpl-show-footer').checked = tpl.showFooter!==false;
  if($('tpl-show-legal'))  $('tpl-show-legal').checked  = tpl.showLegal!==false;
}
function syncColorInput(){ var v=$('tpl-color-pick').value; $('tpl-color-hex').value=v; if($('tpl2-color-pick'))$('tpl2-color-pick').value=v; if($('tpl2-color-hex'))$('tpl2-color-hex').value=v; livePreview(); }
function syncColorPicker(){ var v=$('tpl-color-hex').value; if(/^#[0-9a-fA-F]{6}$/.test(v)){$('tpl-color-pick').value=v; if($('tpl2-color-pick'))$('tpl2-color-pick').value=v; if($('tpl2-color-hex'))$('tpl2-color-hex').value=v;} livePreview(); }
function syncTitleColorInput(){ var v=$('tpl-title-color-pick').value; $('tpl-title-color-hex').value=v; livePreview(); }
function syncTitleColorPicker(){ var v=$('tpl-title-color-hex').value; if(/^#[0-9a-fA-F]{6}$/.test(v))$('tpl-title-color-pick').value=v; livePreview(); }
function openTemplateModal(){ fillTplForm(readTplForm()); livePreview(); $('tpl-modal').classList.add('open'); }
function closeTplModal(){ $('tpl-modal').classList.remove('open'); }
function livePreview() {
  var tpl = readTplForm();
  var sampleDoc = {
    type:'devis',num:'DEV-2026-001',date:new Date().toISOString().split('T')[0],
    ech:new Date(Date.now()+30*86400000).toISOString().split('T')[0],statut:'envoyé',
    cn:'Dupont Thomas',ca:'12 rue des Pins',cv:'64100 Bayonne',
    ct:'06 12 34 56 78',ce:'thomas@email.fr',
    vm:'Volkswagen',vmo:'Golf 7 GTI',vmot:'2.0 TSI 220ch',van:'2019',vim:'AB-123-CD',
    lines:[
      {label:'Stage 1 — Reprogrammation moteur (essence & diesel turbo)',qte:1,pu:330,offert:false},
      {label:'Conversion E85 — Bioéthanol natif ECU',qte:1,pu:330,offert:false},
      {label:'Diagnostic ODIS VAG',qte:1,pu:0,offert:true},
    ],
    tvaRate:0,ht:660,tva:0,ttc:660,
    notes:'Prestation réalisée en atelier. Garantie 2 ans. 100% réversible.',
    gains:{ch:220,chOrig:180,nm:380,nmOrig:320},
  };
  var html = renderDocHTML(sampleDoc, tpl);
  var m=$('tpl-mini-preview'); if(m) m.innerHTML=html;
  var l=$('tpl-live-preview'); if(l) l.innerHTML=html;
}

// ============================================================
//  TABS (complet avec template)
// ============================================================
// ============================================================
//  AGENDA — Calendrier + Notifications
// ============================================================
var RDV_KEY = 'ar_rdvs';
var calDate = new Date(); // mois affiché
var calSelected = new Date(); // jour sélectionné
var editingRdvId = null;

// ── Storage RDVs ─────────────────────────────────────────────
function loadRdvs() {
  try { return JSON.parse(localStorage.getItem(RDV_KEY) || '[]'); } catch(e) { return []; }
}
function saveRdvs(arr) {
  localStorage.setItem(RDV_KEY, JSON.stringify(arr));
  if (db && syncOk) {
    // Sauvegarde chaque RDV dans son propre document pour éviter l'écrasement global
    var batch = db.batch();
    arr.forEach(function(rdv) {
      batch.set(db.collection('rdvs').doc(String(rdv.id)), rdv);
    });
    batch.commit().catch(function(e){ console.warn('Firebase rdvs batch:', e); });
  }
}

function saveOneRdv(rdv) {
  if (db && syncOk) {
    db.collection('rdvs').doc(String(rdv.id)).set(rdv)
      .catch(function(e){ console.warn('Firebase rdv save:', e); });
  }
}

function deleteOneRdvFirebase(rdvId) {
  if (db && syncOk) {
    db.collection('rdvs').doc(String(rdvId)).delete()
      .catch(function(e){ console.warn('Firebase rdv delete:', e); });
  }
}

// ── Rendu calendrier ─────────────────────────────────────────
var DOW = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
var MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function renderAgenda() {
  renderCalendar();
  renderSideEvents(calSelected);
  renderAutoAlerts();
  fillRdvClientSelect();
}

function calPrev() { calDate.setMonth(calDate.getMonth()-1); renderCalendar(); }
function calNext() { calDate.setMonth(calDate.getMonth()+1); renderCalendar(); }
function calToday() { calDate = new Date(); calSelected = new Date(); renderCalendar(); renderSideEvents(calSelected); }

function renderCalendar() {
  var y = calDate.getFullYear(), m = calDate.getMonth();
  $('cal-month-label').textContent = MONTHS[m] + ' ' + y;

  // Premier lundi avant le 1er du mois
  var first = new Date(y, m, 1);
  var startDow = (first.getDay() + 6) % 7; // lundi=0
  var start = new Date(first); start.setDate(1 - startDow);

  var rdvs = loadRdvs();
  var grid = $('cal-grid');
  grid.innerHTML = DOW.map(function(d){ return '<div class="cal-dow">'+d+'</div>'; }).join('');
  var today = new Date(); today.setHours(0,0,0,0);

  for (var i = 0; i < 42; i++) {
    var d = new Date(start); d.setDate(start.getDate() + i);
    var isToday = d.getTime() === today.getTime();
    var isSel = d.toDateString() === calSelected.toDateString();
    var isOther = d.getMonth() !== m;
    var dStr = toDateStr(d);

    var dayRdvs = rdvs.filter(function(r){ return r.date === dStr; });

    var cls = 'cal-cell' + (isToday?' today':'') + (isSel?' selected':'') + (isOther?' other-month':'') + (dayRdvs.length?' has-event':'');
    var evHTML = dayRdvs.slice(0,3).map(function(r){
      return '<div class="cal-event '+r.type+'" onclick="event.stopPropagation();openRdvModal(\''+r.id+'\',null)" title="'+escHtml(r.title)+'">'+escHtml(r.heure?r.heure+' ':'')+escHtml(r.title)+'</div>';
    }).join('');
    if (dayRdvs.length > 3) evHTML += '<div class="cal-more">+' + (dayRdvs.length-3) + '</div>';

    var cell = document.createElement('div');
    cell.className = cls;
    cell.innerHTML = '<div class="cal-day-num">'+d.getDate()+'</div>' + evHTML;
    cell.addEventListener('click', (function(dd){ return function(){ calSelected = new Date(dd); renderCalendar(); renderSideEvents(calSelected); }; })(d));
    grid.appendChild(cell);
  }
}

function renderSideEvents(d) {
  var dStr = toDateStr(d);
  var label = $('side-date-label');
  var today = new Date(); today.setHours(0,0,0,0);
  var isToday = d.getTime() === today.getTime();
  if (label) label.textContent = isToday ? 'Aujourd\'hui — ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();

  var rdvs = loadRdvs().filter(function(r){ return r.date === dStr; });
  rdvs.sort(function(a,b){ return (a.heure||'99:99').localeCompare(b.heure||'99:99'); });

  var el = $('side-events');
  if (!rdvs.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Aucun événement</div>'; return; }

  el.innerHTML = rdvs.map(function(r) {
    var clientName = '';
    var rdvVehLabel = '';
    if (r.clientId) {
      var cl = loadClients().find(function(c){ return c.id === r.clientId; });
      if (cl) {
        clientName = cl.nom;
        var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}] : []);
        if (r.vehIdx !== null && r.vehIdx !== undefined && vehs[r.vehIdx]) {
          var v = vehs[r.vehIdx];
          rdvVehLabel = [v.vm,v.vmo,v.vmot,v.van?'('+v.van+')':''].filter(Boolean).join(' ');
          if (v.vim) rdvVehLabel += ' · ' + v.vim.toUpperCase();
        }
      }
    }
    return '<div class="rdv-item '+escHtml(r.type)+'">'
      + '<button class="rdv-del" onclick="deleteRdv(\''+escHtml(r.id)+'\')" title="Supprimer">×</button>'
      + (r.heure ? '<div class="rdv-time">'+escHtml(r.heure)+'</div>' : '')
      + '<div class="rdv-title">'+escHtml(r.title)+'</div>'
      + (clientName ? '<div class="rdv-sub">👤 '+escHtml(clientName)+'</div>' : '')
      + (rdvVehLabel ? '<div class="rdv-sub">🚗 '+escHtml(rdvVehLabel)+'</div>' : '')

      + (r.lieu ? '<div class="rdv-sub">📍 '+escHtml(r.lieu)+'</div>' : '')
      + (r.notes ? '<div class="rdv-sub" style="margin-top:4px;font-style:italic">'+escHtml(r.notes.slice(0,80))+(r.notes.length>80?'…':'')+'</div>' : '')
      + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
        + '<button class="btn-s btn-sm" onclick="openRdvModal(\''+r.id+'\',null)">✏️ Modifier</button>'
        + (r.clientId ? '<button class="btn-s btn-sm" onclick="selectClientAndGo('+r.clientId+')">📄 Devis</button>' : '')
        + '<button class="rdv-confirm-btn" onclick="copyConfirmMsg(\''+r.id+'\')">📋 Copier confirmation</button>'
      + '</div>'
    + '</div>';
  }).join('');
}

function renderAutoAlerts() {
  var el = $('auto-alerts');
  if (!el) return;
  var docs = loadDocs();
  var alerts = [];
  var now = new Date(); now.setHours(0,0,0,0);

  // Devis en attente depuis + de 3 jours
  docs.filter(function(d){ return d.type==='devis' && (d.statut==='envoyé'||d.statut==='accepté'); }).forEach(function(d) {
    var dDate = new Date(d.date);
    var days = Math.floor((now - dDate) / 86400000);
    if (days >= 3) {
      alerts.push({ type:'orange', text: 'Devis '+d.num+' — '+d.cn+' en attente depuis '+days+' jour'+(days>1?'s':''), date: d.date });
    }
  });

  // Factures impayées depuis + de 7 jours
  docs.filter(function(d){ return d.type==='facture' && d.statut!=='payé' && d.statut!=='annulé'; }).forEach(function(d) {
    var dDate = new Date(d.date);
    var days = Math.floor((now - dDate) / 86400000);
    if (days >= 7) {
      alerts.push({ type:'red', text: 'Facture '+d.num+' — '+d.cn+' impayée depuis '+days+' jour'+(days>1?'s':''), date: d.date });
    }
  });

  if (!alerts.length) {
    el.innerHTML = '<div style="color:var(--green);font-size:12px">✓ Aucune alerte en cours</div>';
    return;
  }

  alerts.sort(function(a,b){ return a.type.localeCompare(b.type); });
  el.innerHTML = alerts.map(function(a) {
    return '<div class="alert-item">'
      + '<div class="alert-dot '+a.type+'"></div>'
      + '<div class="alert-text">'+escHtml(a.text)+'<div class="alert-date">'+fmtDate(a.date)+'</div></div>'
    + '</div>';
  }).join('');
}

// ── Modal RDV ────────────────────────────────────────────────
function openRdvModal(rdvId) {
  editingRdvId = rdvId;
  fillRdvClientSelect();
  $('rdv-client-search').value = '';
  $('rdv-client-results').style.display = 'none';
  $('rdv-client-results').innerHTML = '';

  if (rdvId) {
    var rdv = loadRdvs().find(function(r){ return r.id === rdvId; });
    if (!rdv) return;
    $('rdv-modal-title').textContent = 'Modifier le rendez-vous';
    $('rdv-title').value = rdv.title || '';
    $('rdv-type').value = rdv.type || 'rdv';
    $('rdv-date').value = rdv.date || '';
    $('rdv-heure').value = rdv.heure || '';
    setRappels(rdv.rappels || (rdv.rappel ? [rdv.rappel] : []));
    $('rdv-client').value = rdv.clientId || '';
    updateRdvVehSelect();
    refreshRdvClientPicked();

    if (rdv.vehIdx !== null && rdv.vehIdx !== undefined && $('rdv-vehicule')) {
      $('rdv-vehicule').value = String(rdv.vehIdx);
    }
    fillRdvDocSelect();
    $('rdv-doc').value = rdv.docId || '';
    $('rdv-lieu').value = rdv.lieu || '';
    $('rdv-notes').value = rdv.notes || '';
    $('rdv-delete-btn').style.display = 'inline-flex';
    $('rdv-copy-btn').style.display = 'inline-flex';
  } else {
    $('rdv-modal-title').textContent = 'Nouveau rendez-vous';
    $('rdv-title').value = '';
    $('rdv-type').value = 'rdv';
    $('rdv-date').value = toDateStr(calSelected);
    $('rdv-heure').value = '';
    setRappels([]);
    $('rdv-client').value = '';
    updateRdvVehSelect();
    refreshRdvClientPicked();
    fillRdvDocSelect();
    $('rdv-doc').value = '';
    $('rdv-lieu').value = '';
    $('rdv-notes').value = '';
    $('rdv-delete-btn').style.display = 'none';
    $('rdv-copy-btn').style.display = 'none';
  }
  $('rdv-modal').classList.add('open');
  setTimeout(function(){ $('rdv-title').focus(); }, 100);
}

function closeRdvModal() { $('rdv-modal').classList.remove('open'); }

function copyConfirmMsgFromModal() {
  if (editingRdvId) copyConfirmMsg(editingRdvId);
}

function fillRdvClientSelect() {
  var sel = $('rdv-client');
  if (!sel) return;
  var cur = sel.value;
  sel.innerHTML = '<option value="">— Aucun client —</option>'
    + loadClients().map(function(cl) {
        var vLabel = '';
        var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||''}] : []);
        if (vehs.length === 1 && vehs[0].vm) vLabel = ' — ' + vehs[0].vm + ' ' + (vehs[0].vmo||'');
        else if (vehs.length > 1) vLabel = ' — ' + vehs.length + ' véhicules';
        return '<option value="'+cl.id+'">' + escHtml(cl.nom) + vLabel + '</option>';
      }).join('');
  if (cur) sel.value = cur;
  updateRdvVehSelect();
}

// Recherche client pour le RDV — même patron que renderCodageClientResults() :
// le <select id="rdv-client"> reste la source de vérité (utilisée partout
// ailleurs dans le module RDV), la recherche ne fait que le piloter.
function renderRdvClientResults() {
  var q = normCodageStr($('rdv-client-search').value);
  var box = $('rdv-client-results');
  if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
  var matches = loadClients().filter(function(c) {
    var hay = normCodageStr([c.nom, c.tel, c.email, c.vm, c.vmo, c.vim].join(' '));
    return hay.indexOf(q) >= 0;
  }).slice(0, 15);
  box.style.display = 'block';
  box.innerHTML = matches.length ? matches.map(function(c) {
    var veh = (c.vehs && c.vehs[0]) ? (c.vehs[0].vm + ' ' + (c.vehs[0].vmo||'')) : (c.vm ? (c.vm + ' ' + (c.vmo||'')) : '');
    return '<div class="search-result-item" onclick="pickRdvClient(' + c.id + ')">'
      + '<div style="font-weight:600;font-size:13px">' + escHtml(c.nom) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim)">' + escHtml(veh || 'Aucun véhicule enregistré') + '</div>'
      + '</div>';
  }).join('') : '<div style="padding:12px;font-size:12.5px;color:var(--text-muted)">Aucun client trouvé.</div>';
}

function pickRdvClient(id) {
  $('rdv-client').value = String(id);
  $('rdv-client-search').value = '';
  $('rdv-client-results').style.display = 'none';
  $('rdv-client-results').innerHTML = '';
  updateRdvVehSelect();
  refreshRdvClientPicked();
  fillRdvDocSelect();
}

function clearRdvClient() {
  $('rdv-client').value = '';
  updateRdvVehSelect();
  refreshRdvClientPicked();
  fillRdvDocSelect();
  $('rdv-client-search').focus();
}

// Affiche le client sélectionné sous forme de puce (nom + tél), à la place
// du <select> qui reste piloté par la recherche.
function refreshRdvClientPicked() {
  var clientId = $('rdv-client').value ? parseInt($('rdv-client').value) : null;
  var cl = clientId ? loadClients().find(function(c){ return c.id === clientId; }) : null;
  var picked = $('rdv-client-picked');
  if (cl) {
    picked.style.display = 'block';
    $('rdv-client-picked-name').textContent = cl.nom + (cl.tel ? ' — ' + cl.tel : '');
  } else {
    picked.style.display = 'none';
  }
}

function updateRdvVehSelect() {
  var clientId = parseInt($('rdv-client').value);
  var row = $('rdv-veh-row');
  var sel = $('rdv-vehicule');
  if (!row || !sel) return;
  if (!clientId) {
    row.style.display = 'none';
    sel.innerHTML = '<option value="">— Tous les véhicules —</option>';
    return;
  }
  var cl = loadClients().find(function(c){ return c.id === clientId; });
  if (!cl) { row.style.display = 'none'; return; }
  var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}] : []);
  if (vehs.length <= 1) {
    row.style.display = 'none';
    return;
  }
  // Plusieurs véhicules → afficher le select
  row.style.display = 'block';
  sel.innerHTML = '<option value="">— Tous les véhicules —</option>'
    + vehs.map(function(v, i) {
        var label = [v.vm, v.vmo, v.vmot, v.van?'('+v.van+')':''].filter(Boolean).join(' ');
        return '<option value="'+i+'">' + escHtml(label) + (v.vim?' · '+escHtml(v.vim.toUpperCase()):'') + '</option>';
      }).join('');
}

var RDV_DOC_TYPE_LABEL = { devis: 'Devis', facture: 'Facture', ordre: 'Ordre' };

// Une fois un client sélectionné, on ne propose que SES documents (même
// rapprochement par nom que showClientHistory, les docs n'ayant pas de
// clientId) — sinon on retombe sur les 50 derniers documents, tous clients
// confondus, comme avant.
function fillRdvDocSelect() {
  var sel = $('rdv-doc');
  if (!sel) return;
  var cur = sel.value;
  var clientId = $('rdv-client') && $('rdv-client').value ? parseInt($('rdv-client').value) : null;
  var cl = clientId ? loadClients().find(function(c){ return c.id === clientId; }) : null;
  var docs = cl
    ? loadDocs().filter(function(d){ return d.cn && d.cn.trim().toLowerCase() === (cl.nom || '').trim().toLowerCase(); })
    : loadDocs().slice(0, 50);
  sel.innerHTML = (cl && !docs.length ? '<option value="">— Aucun document pour ce client —</option>' : '<option value="">— Aucun document —</option>')
    + docs.map(function(d){
        var label = escHtml(d.num) + ' — ' + (RDV_DOC_TYPE_LABEL[d.type] || d.type || '');
        if (!cl) label += ' — ' + escHtml(d.cn || '');
        return '<option value="'+d.id+'">' + label + '</option>';
      }).join('');
  if (cur) sel.value = cur;
}

function saveRdv() {
  var title = $('rdv-title').value.trim();
  if (!title) { alert('Le titre est obligatoire.'); return; }
  var rdvDate = $('rdv-date').value;
  if (!rdvDate) { alert('La date est obligatoire.'); return; }

  var rdvs = loadRdvs();
  var existing = editingRdvId ? rdvs.find(function(r){ return r.id === editingRdvId; }) : null;
  var rappels = getRappels();

  // Préserver rappelsSent existants, mais élaguer aux minutes toujours présentes dans rappels
  var prevSent = (existing && existing.rappelsSent) ? existing.rappelsSent : [];
  var rappelsSent = prevSent.filter(function(m){ return rappels.indexOf(m) >= 0; });

  var heure = $('rdv-heure').value;
  // fireISO : timestamp UTC absolu utilisé par le cron serveur (TZ-safe)
  var fireISO = heure ? new Date(rdvDate+'T'+heure).toISOString() : null;

  var rdvClientId = $('rdv-client').value ? parseInt($('rdv-client').value) : null;
  var rdvClient = rdvClientId ? loadClients().find(function(c){ return c.id === rdvClientId; }) : null;

  var rdv = {
    id:        editingRdvId || String(Date.now()),
    title:     title,
    type:      $('rdv-type').value,
    date:      rdvDate,
    heure:     heure,
    rappels:   rappels,
    rappelsSent: rappelsSent,
    fireISO:   fireISO,
    clientId:  rdvClientId,
    clientNom: rdvClient ? rdvClient.nom : '',
    clientTel: rdvClient ? (rdvClient.tel || '') : '',
    vehIdx:    $('rdv-vehicule') && $('rdv-vehicule').value !== '' ? parseInt($('rdv-vehicule').value) : null,
    docId:     $('rdv-doc').value ? parseInt($('rdv-doc').value) : null,

    lieu:      $('rdv-lieu').value,
    notes:     $('rdv-notes').value,
  };

  if (editingRdvId) {
    // Annuler les timers existants pour ce rdv avant de reprogrammer
    cancelRdvTimers(editingRdvId);
    var i = rdvs.findIndex(function(r){ return r.id === editingRdvId; });
    if (i >= 0) rdvs[i] = rdv; else rdvs.push(rdv);
  } else {
    rdvs.push(rdv);
  }
  localStorage.setItem(RDV_KEY, JSON.stringify(rdvs));
  saveOneRdv(rdv);

  // Programmer le rappel (timers live) + rattrapage immédiat si besoin
  scheduleRdvNotif(rdv);
  runRappelCheck();

  closeRdvModal();
  renderCalendar();
  renderSideEvents(calSelected);
}

function deleteRdv(rdvId) {
  if (!confirm('Supprimer ce rendez-vous ?')) return;
  cancelRdvTimers(rdvId);
  var remaining = loadRdvs().filter(function(r){ return r.id !== rdvId; });
  localStorage.setItem(RDV_KEY, JSON.stringify(remaining));
  deleteOneRdvFirebase(rdvId);
  renderCalendar();
  renderSideEvents(calSelected);
}

function deleteRdvFromModal() {
  if (!editingRdvId) return;
  deleteRdv(editingRdvId);
  closeRdvModal();
}

// ══════════════════════════════════════════════════════════════
//  EMAIL (Resend, via la fonction Netlify send-email) — Rappels RDV + Envoi devis/factures
// ══════════════════════════════════════════════════════════════
var NOTIF_EMAIL       = 'arthur@areprog.fr'; // destinataire des notifs internes + reply-to client
var notifTimer        = null;
var _currentDocForEmail = null; // doc en cours d'affichage dans le modal

// État rappels RDV (timers live + boucle de rattrapage)
var _rdvTimers          = {};   // { rdvId: [timeoutId, ...] }
var _rappelLoopInterval = null; // setInterval id pour runRappelCheck
var _rappelInFlight     = {};   // "rdvId|minutes" → true (dédup intra-onglet)
var STALE_RAPPEL_MS     = 7 * 24 * 3600000; // rappels ratés depuis > 7j : on marque sans envoyer
var RAPPEL_LOOP_MS      = 60000; // boucle de rattrapage toutes les 60s

// ── Rappels multiples UI ──────────────────────────────────────
var RAPPEL_OPTIONS = [
  { v:'15',    l:'15 min avant' },
  { v:'30',    l:'30 min avant' },
  { v:'60',    l:'1 heure avant' },
  { v:'120',   l:'2 heures avant' },
  { v:'360',   l:'6 heures avant' },
  { v:'1440',  l:'La veille (24h)' },
  { v:'2880',  l:'2 jours avant' },
  { v:'4320',  l:'3 jours avant' },
  { v:'10080', l:'1 semaine avant' },
];

function addRappelRow(val) {
  var list = $('rdv-rappels-list');
  if (!list) return;
  var opts = RAPPEL_OPTIONS.map(function(o) {
    return '<option value="'+o.v+'"'+(o.v===(val||'1440')?' selected':'')+'>'+o.l+'</option>';
  }).join('');
  var div = document.createElement('div');
  div.className = 'rappel-row';
  div.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:4px';
  div.innerHTML = '<select style="flex:1;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:13px">'+opts+'</select>'
    + '<button type="button" onclick="this.parentElement.remove()" style="width:30px;height:32px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text-dim);cursor:pointer;font-size:16px">×</button>';
  list.appendChild(div);
}

function getRappels() {
  var vals = [];
  document.querySelectorAll('#rdv-rappels-list .rappel-row select').forEach(function(sel) {
    var v = parseInt(sel.value);
    if (v > 0 && vals.indexOf(v) < 0) vals.push(v);
  });
  return vals;
}

function setRappels(arr) {
  var list = $('rdv-rappels-list');
  if (!list) return;
  list.innerHTML = '';
  if (!arr || !arr.length) { addRappelRow('1440'); return; }
  arr.forEach(function(v) { addRappelRow(String(v)); });
}

// ── Envoi email via la fonction Netlify send-email (Resend, authentifiée) ──
function envoyerEmail(to, subject, html, replyTo, attachments) {
  return authedFetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: to, subject: subject, html: html, replyTo: replyTo || undefined, attachments: attachments || undefined }),
  }).then(function(res) {
    if (!res.ok) return res.json().catch(function(){ return {}; }).then(function(j) {
      throw { status: res.status, text: j.error || ('HTTP ' + res.status) };
    });
  });
}

// ── Envoi email rappel RDV ────────────────────────────────────
function sendReminderEmail(rdv, minutes) {
  var key = rdv.id + '|' + minutes;
  if (_rappelInFlight[key]) return Promise.resolve();
  _rappelInFlight[key] = true;

  var cl = rdv.clientId ? loadClients().find(function(c){ return c.id===rdv.clientId; }) : null;
  var vehs = cl && cl.vehs && cl.vehs.length ? cl.vehs : (cl&&cl.vm?[{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||''}]:[]);
  var selV = (rdv.vehIdx!=null && vehs[rdv.vehIdx]) ? vehs[rdv.vehIdx] : vehs[0];
  var vehLabel = selV ? [selV.vm,selV.vmo,selV.vmot,selV.van?'('+selV.van+')':''].filter(Boolean).join(' ') : '';
  var opt = RAPPEL_OPTIONS.find(function(o){ return parseInt(o.v)===minutes; });
  var label = opt ? opt.l : minutes+' min avant';

  var row = function(l, v) { return v ? '<tr><td style="padding:4px 12px 4px 0;color:#666">'+l+'</td><td style="padding:4px 0"><strong>'+escHtml(v)+'</strong></td></tr>' : ''; };
  var subject = 'Rappel RDV — ' + (rdv.title||'Sans titre') + ' (' + label + ')';
  var html = '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">'
    + row('Titre', rdv.title) + row('Date', rdv.date ? fmtDate(rdv.date) : '')
    + row('Heure', rdv.heure||'Non précisée') + row('Lieu', rdv.lieu||'Non précisé')
    + row('Client', cl ? cl.nom : 'Non précisé') + row('Véhicule', vehLabel||'Non précisé')
    + row('Notes', rdv.notes) + row('Rappel', label) + '</table>';

  return envoyerEmail(NOTIF_EMAIL, subject, html).then(function(){
    markRappelSent(rdv.id, minutes);
    showNotifBanner('📧', 'Rappel envoyé', rdv.title||'');
    delete _rappelInFlight[key];
  }).catch(function(e){
    console.error('Rappel email:', e);
    var msg = (e && (e.text || e.message)) || 'Erreur inconnue';
    showNotifBanner('⚠️', 'Erreur envoi rappel', msg);
    delete _rappelInFlight[key];
    throw e;
  });
}

// Marque un rappel comme envoyé dans la liste des rdvs (persisté Firebase + localStorage)
function markRappelSent(rdvId, minutes) {
  var rdvs = loadRdvs();
  var i = rdvs.findIndex(function(r){ return r.id === rdvId; });
  if (i < 0) return;
  rdvs[i].rappelsSent = rdvs[i].rappelsSent || [];
  if (rdvs[i].rappelsSent.indexOf(minutes) < 0) {
    rdvs[i].rappelsSent.push(minutes);
    saveRdvs(rdvs);
  }
}

function cancelRdvTimers(rdvId) {
  var ids = _rdvTimers[rdvId];
  if (!ids) return;
  ids.forEach(function(id){ clearTimeout(id); });
  delete _rdvTimers[rdvId];
}

function cancelAllRdvTimers() {
  Object.keys(_rdvTimers).forEach(cancelRdvTimers);
}

function scheduleRdvNotif(rdv) {
  cancelRdvTimers(rdv.id);
  var rappels = rdv.rappels && rdv.rappels.length ? rdv.rappels
    : (rdv.rappel && rdv.rappel>0 ? [rdv.rappel] : []);
  if (!rdv.heure || !rappels.length) return;
  var sent = rdv.rappelsSent || [];
  var rdvDT = new Date(rdv.date+'T'+rdv.heure);
  rappels.forEach(function(minutes) {
    if (sent.indexOf(minutes) >= 0) return;
    var delay = rdvDT.getTime() - minutes*60000 - Date.now();
    // delay < 0 → la boucle runRappelCheck s'en charge ; > 30j → trop loin
    if (delay < 0 || delay > 30*24*3600000) return;
    var tid = setTimeout(function() {
      sendReminderEmail(rdv, minutes);
    }, delay);
    (_rdvTimers[rdv.id] = _rdvTimers[rdv.id] || []).push(tid);
  });
}

// Boucle de rattrapage : envoie tous les rappels dont l'heure est passée et non encore marqués sent
function runRappelCheck() {
  updateRappelIndicator();
  if (!firebase.auth().currentUser) return;
  var now = Date.now();
  var rdvs = loadRdvs();
  var dirty = false;
  rdvs.forEach(function(rdv) {
    var rappels = rdv.rappels && rdv.rappels.length ? rdv.rappels
      : (rdv.rappel && rdv.rappel>0 ? [rdv.rappel] : []);
    if (!rdv.heure || !rappels.length) return;
    var fireBase = new Date(rdv.date+'T'+rdv.heure).getTime();
    if (isNaN(fireBase)) return;
    rdv.rappelsSent = rdv.rappelsSent || [];
    rappels.forEach(function(m) {
      if (rdv.rappelsSent.indexOf(m) >= 0) return;
      var fire = fireBase - m*60000;
      if (fire > now) return; // futur — géré par scheduleRdvNotif
      if (now - fire > STALE_RAPPEL_MS) {
        // trop vieux : on marque sans envoyer pour éviter un flood
        rdv.rappelsSent.push(m);
        dirty = true;
        return;
      }
      sendReminderEmail(rdv, m);
    });
  });
  if (dirty) saveRdvs(rdvs);
}

function updateRappelIndicator() {
  var el = document.getElementById('rappel-heartbeat');
  if (!el) return;
  var d = new Date();
  var hh = String(d.getHours()).padStart(2,'0');
  var mm = String(d.getMinutes()).padStart(2,'0');
  el.textContent = '⏱ Rappels : ' + hh + ':' + mm;
}

function maybeShowInstallHint() {} // supprimé

function checkTodayNotifs() {
  // 1. Rattrapage immédiat des rappels ratés (navigateur fermé, etc.)
  runRappelCheck();
  // 2. Timers live pour les rappels à venir dans cette session
  loadRdvs().forEach(function(r){ scheduleRdvNotif(r); });
  // 3. Démarrer la boucle de rattrapage périodique
  if (!_rappelLoopInterval) {
    _rappelLoopInterval = setInterval(runRappelCheck, RAPPEL_LOOP_MS);
  }

  // Alertes factures impayées — dédup journalier (évite un envoi à chaque reload)
  if (!firebase.auth().currentUser) return;
  var todayKey = new Date().toISOString().slice(0,10);
  if (localStorage.getItem('ar_last_facture_alert_day') === todayKey) return;
  var now = new Date(); now.setHours(0,0,0,0);
  var sent = false;
  loadDocs().filter(function(d){ return d.type==='facture'&&d.statut!=='payé'&&d.statut!=='annulé'; }).forEach(function(d) {
    var days = Math.floor((now - new Date(d.date))/86400000);
    if (days===7||days===14||days===30) {
      sent = true;
      setTimeout(function(){
        var subject = 'Facture impayée — '+(d.cn||'')+' — depuis '+days+' jours';
        var html = '<p>Montant : <strong>'+fmt(d.ttc||0)+'</strong> · Ref : '+escHtml(d.num||'')+'</p>'
          + '<p>Véhicule : '+escHtml([d.vm,d.vmo].filter(Boolean).join(' '))+'</p>';
        envoyerEmail(NOTIF_EMAIL, subject, html).catch(function(){});
      }, 5000);
    }
  });
  if (sent) localStorage.setItem('ar_last_facture_alert_day', todayKey);
}

// ══════════════════════════════════════════════════════════════
//  ENVOI DEVIS / FACTURES PAR EMAIL
// ══════════════════════════════════════════════════════════════
var _emailDocPdfB64 = null;

function docTypeLabel(doc) {
  return doc && doc.type === 'facture' ? 'Facture' : doc && doc.type === 'ordre' ? 'Ordre de réparation' : 'Devis';
}

// Article + libellé accordés selon le type, pour les tournures "ce devis" /
// "cette facture" / "cet ordre de réparation".
function docTypeArticle(type) {
  if (type === 'Facture') return 'cette facture';
  if (type === 'Ordre de réparation') return 'cet ordre de réparation';
  return 'ce devis';
}

// Message par défaut, personnalisé avec les infos déjà connues du document
// (client, véhicule, montant, validité) — reste modifiable avant l'envoi.
function buildDefaultMessage(doc, tpl, type) {
  var prenom = (doc.cn || '').trim().split(/\s+/)[0] || '';
  var salutation = 'Bonjour' + (prenom ? ' ' + prenom : '') + ',';
  var vehicule = [doc.vm, doc.vmo].filter(Boolean).join(' ');
  var montant = fmt(doc.ttc || 0);
  var contact = [tpl.tel, tpl.web].filter(Boolean).join(' · ');
  var signature = 'Cordialement,\n' + (tpl.nom || 'AREPROG') + (contact ? '\n' + contact : '');

  if (type === 'Facture') {
    return salutation + '\n\n'
      + 'Merci pour votre confiance. Vous trouverez ci-joint votre facture ' + (doc.num || '')
      + (vehicule ? ' pour l\'intervention réalisée sur votre ' + vehicule : '') + ', d\'un montant de ' + montant + ' TTC.\n\n'
      + 'N\'hésitez pas à nous contacter pour toute question concernant cette facture.\n\n'
      + signature;
  }
  if (type === 'Ordre de réparation') {
    return salutation + '\n\n'
      + 'Vous trouverez ci-joint l\'ordre de réparation ' + (doc.num || '')
      + (vehicule ? ' pour votre ' + vehicule : '') + '.\n\n'
      + 'Merci de le relire avant votre venue à l\'atelier ; n\'hésitez pas à nous contacter pour toute question.\n\n'
      + signature;
  }
  var validite = doc.ech ? ' Il est valable jusqu\'au ' + fmtDate(doc.ech) + '.' : '';
  return salutation + '\n\n'
    + 'Merci pour votre demande. Vous trouverez ci-joint votre devis ' + (doc.num || '')
    + (vehicule ? ' pour votre ' + vehicule : '') + ', d\'un montant de ' + montant + ' TTC.' + validite + '\n\n'
    + 'Pour valider cette intervention, il vous suffit de répondre à cet email ou de nous appeler'
    + (tpl.tel ? ' au ' + tpl.tel : '') + ' : nous conviendrons ensemble d\'un créneau à l\'atelier.\n\n'
    + 'N\'hésitez pas à revenir vers nous pour toute question, nous restons à votre disposition.\n\n'
    + signature;
}

// Objet par défaut, modifiable avant l'envoi.
function buildDefaultSubject(doc, tpl, type) {
  return (tpl.nom || 'AREPROG') + ' — ' + type + ' ' + (doc.num || '') + ' — ' + fmt(doc.ttc || 0);
}

// Autres devis/factures/ordres du même client (rapproché par nom, comme
// showClientHistory), triés du plus récent au plus ancien — permet de
// changer de document à joindre sans quitter la modale d'envoi.
function clientDocsFor(doc) {
  var name = ((doc && doc.cn) || '').trim().toLowerCase();
  if (!name) return doc ? [doc] : [];
  return loadDocs()
    .filter(function(d){ return (d.cn||'').trim().toLowerCase() === name; })
    .sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); });
}

// Photos déjà présentes sur la fiche véhicule du client (carnet clients),
// rapprochées via l'immatriculation puis marque+modèle du document ; à
// défaut de correspondance, on propose les photos de tous ses véhicules.
function findVehiclePhotosForDoc(doc) {
  if (!doc) return [];
  var cl = loadClients().find(function(c){ return (c.nom||'').trim().toLowerCase() === (doc.cn||'').trim().toLowerCase(); });
  if (!cl) return [];
  var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vim:cl.vim||'',photos:cl.photos||[]}] : []);
  var match = null;
  if (doc.vim) match = vehs.find(function(v){ return v.vim && v.vim.toUpperCase() === doc.vim.toUpperCase(); });
  if (!match && (doc.vm || doc.vmo)) match = vehs.find(function(v){ return (v.vm||'') === (doc.vm||'') && (v.vmo||'') === (doc.vmo||''); });
  if (match) return match.photos || [];
  var all = [];
  vehs.forEach(function(v){ (v.photos||[]).forEach(function(p){ all.push(p); }); });
  return all;
}

// Photos ajoutées juste pour cet envoi (redimensionnées côté client, pas
// persistées sur la fiche véhicule) — {name, base64, contentType}.
var _sendAdHocPhotos = [];

function sendDocByEmail() {
  populateSendEmailModal(_currentDocForEmail);
  $('send-email-modal').classList.add('open');
}

function onSendDocChange() {
  var id = Number($('send-doc-select').value);
  var doc = loadDocs().find(function(d){ return d.id === id; });
  if (!doc) return;
  _currentDocForEmail = doc;
  populateSendEmailModal(doc);
}

function populateSendEmailModal(doc) {
  doc = doc || {};
  $('send-to-email').value = doc.ce || '';

  var tpl = loadTemplate();
  var type = docTypeLabel(doc);
  $('send-subject').value = buildDefaultSubject(doc, tpl, type);
  $('send-message').value = buildDefaultMessage(doc, tpl, type);
  $('send-opt-recap').checked = true;
  $('send-opt-pj').checked = true;
  $('send-opt-avis').checked = true;
  $('send-opt-avis-row').style.display = type === 'Facture' ? 'flex' : 'none';

  var lastInfo = $('send-last-info');
  if (doc.lastEmailAt) {
    lastInfo.textContent = '✉️ Déjà envoyé le ' + new Date(doc.lastEmailAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' à ' + (doc.lastEmailTo || '');
    lastInfo.style.display = 'block';
  } else {
    lastInfo.style.display = 'none';
  }

  var docs = clientDocsFor(doc);
  var docRow = $('send-doc-row'), docSel = $('send-doc-select');
  if (docs.length > 1) {
    docSel.innerHTML = docs.map(function(d) {
      return '<option value="' + d.id + '"' + (d.id === doc.id ? ' selected' : '') + '>'
        + docTypeLabel(d) + ' ' + escHtml(d.num || '') + ' — ' + fmtDate(d.date) + ' — ' + fmt(d.ttc || 0) + '</option>';
    }).join('');
    docRow.style.display = 'block';
  } else {
    docRow.style.display = 'none';
  }

  _sendAdHocPhotos = [];
  renderSendAdHocPhotos();
  renderSendExistingPhotos(doc);

  $('send-email-status').style.display = 'none';
  $('send-photo-status').textContent = '';
  $('send-email-confirm-btn').disabled = false;
  $('send-email-confirm-btn').textContent = '📧 Envoyer';
}

function renderSendExistingPhotos(doc) {
  var el = $('send-photo-existing');
  var photos = findVehiclePhotosForDoc(doc);
  if (!photos.length) { el.innerHTML = ''; return; }
  el.innerHTML = photos.map(function(p) {
    return '<label style="position:relative;display:inline-block;width:64px;height:48px;border-radius:6px;overflow:hidden;border:1px solid var(--border);cursor:pointer;background:var(--bg3) center/cover no-repeat;background-image:url(\'' + escHtml(p.url) + '\')" title="' + escHtml(p.name || '') + '">'
      + '<input type="checkbox" class="send-photo-cb" data-url="' + escHtml(p.url) + '" data-name="' + escHtml(p.name || 'photo.jpg') + '" style="position:absolute;top:3px;left:3px;width:15px;height:15px;margin:0"/>'
      + '</label>';
  }).join('');
}

async function addSendAdHocPhotos(input) {
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length) return;
  var status = $('send-photo-status');
  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Préparation ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    try {
      var img = await resizeImage(files[i], 1200);
      if (!img) throw new Error('Image illisible : ' + (files[i].name || ''));
      _sendAdHocPhotos.push({ name: safeUploadName(files[i].name || 'photo', 'jpg'), base64: img.base64, contentType: img.contentType });
      renderSendAdHocPhotos();
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '';
}

function renderSendAdHocPhotos() {
  var el = $('send-photo-adhoc');
  if (!_sendAdHocPhotos.length) { el.innerHTML = ''; return; }
  el.innerHTML = _sendAdHocPhotos.map(function(p, i) {
    return '<div class="veh-thumb" style="width:64px;height:48px;background-image:url(\'data:' + p.contentType + ';base64,' + p.base64 + '\')">'
      + '<div class="veh-thumb-acts"><button type="button" onclick="removeSendAdHocPhoto(' + i + ')" title="Retirer">🗑</button></div>'
      + '</div>';
  }).join('');
}

function removeSendAdHocPhoto(i) {
  _sendAdHocPhotos.splice(i, 1);
  renderSendAdHocPhotos();
}

// Email "lettre à en-tête" : couleur/nom/activité/pied de page repris du
// template de document (onglet Réglages), montant et référence en résumé,
// PDF joint au lieu d'un lien à cliquer. opts permet de masquer les blocs
// générés automatiquement (récap, mention PJ, avis Google) depuis la modale.
function buildDocEmailHtml(doc, tpl, type, message, opts) {
  opts = opts || {};
  var color = /^#[0-9a-fA-F]{6}$/.test(tpl.color) ? tpl.color : '#2196F3';
  var row = function(label, val, accent) {
    if (!val) return '';
    return '<tr><td style="padding:5px 0;color:#6b7280;font-size:13px">' + label + '</td>'
      + '<td style="padding:5px 0;text-align:right;font-size:13px' + (accent ? ';font-weight:700;color:' + color : ';color:#111') + '">' + val + '</td></tr>';
  };
  var recap = '<table style="width:100%;border-collapse:collapse">'
    + row('Référence', escHtml(doc.num || ''))
    + row('Date', doc.date ? fmtDate(doc.date) : '')
    + (type === 'Devis' && doc.ech ? row('Valable jusqu\'au', fmtDate(doc.ech)) : '')
    + row('Montant TTC', fmt(doc.ttc || 0), true)
    + '</table>';

  return '<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
    + '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
      + '<div style="background:' + color + ';padding:22px 28px">'
        + '<div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">' + escHtml(tpl.nom || 'AREPROG') + '</div>'
        + (tpl.activite ? '<div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px">' + escHtml(tpl.activite) + '</div>' : '')
      + '</div>'
      + '<div style="padding:26px 28px">'
        + '<p style="margin:0 0 18px;font-size:14px;color:#111;line-height:1.6">' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
        + (opts.recap ? '<div style="background:#f9fafb;border:1px solid #eef0f2;border-radius:8px;padding:14px 18px;margin:0 0 18px">' + recap + '</div>' : '')
        + (opts.pj ? '<p style="margin:0' + (type === 'Facture' ? ' 0 22px' : '') + ';font-size:13px;color:#374151">📎 Vous trouverez ' + docTypeArticle(type) + ' en pièce jointe, au format PDF.</p>' : '')
        + (type === 'Facture' && opts.avis
          ? '<div style="text-align:center;padding-top:18px;border-top:1px solid #eef0f2">'
            + '<p style="margin:0 0 12px;font-size:13px;color:#374151">Si vous êtes satisfait(e) de notre intervention, un avis Google nous aiderait beaucoup à nous faire connaître :</p>'
            + '<a href="' + GOOGLE_REVIEW_URL + '" style="display:inline-block;background:' + color + ';color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px">★★★★★ Laisser un avis Google</a>'
          + '</div>'
          : '')
      + '</div>'
      + '<div style="background:#f9fafb;border-top:1px solid #eef0f2;padding:16px 28px;font-size:11px;color:#9ca3af;line-height:1.7">'
        + escHtml(tpl.footer || '').replace(/\n/g, '<br>')
      + '</div>'
    + '</div>'
  + '</div>';
}

// Télécharge une photo déjà hébergée (Firebase Storage) et la renvoie en
// base64, pour pouvoir la joindre à l'email au même titre que le PDF.
function urlToBase64(url) {
  return fetch(url).then(function(r) {
    if (!r.ok) throw new Error('Téléchargement d\'une photo jointe échoué');
    return r.blob();
  }).then(function(blob) { return fileToBase64(blob); });
}

async function confirmSendEmail() {
  var toEmail = $('send-to-email').value.trim();
  if (!toEmail || !toEmail.includes('@')) {
    showSendStatus('error', 'Email invalide.');
    return;
  }
  var subject = $('send-subject').value.trim();
  if (!subject) {
    showSendStatus('error', 'L\'objet du mail est obligatoire.');
    return;
  }

  var btn = $('send-email-confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Génération PDF…';

  try {
    var pdfB64 = await generatePdfBase64();
    var doc = _currentDocForEmail || {};
    var filename = buildPdfTitle(doc) + '.pdf';

    // Les fonctions Netlify coupent la connexion (sans réponse HTTP propre,
    // juste "Load failed"/"Failed to fetch") au-delà d'~6 Mo de requête —
    // on vérifie donc ici, avant l'envoi, avec la même limite que le serveur
    // (send-email.js) pour donner un message clair plutôt qu'une erreur réseau.
    var MAX_PDF_B64 = 4 * 1024 * 1024;
    if (pdfB64.length > MAX_PDF_B64) {
      throw new Error('Le PDF généré est trop volumineux pour être envoyé par email (~' + Math.round(pdfB64.length / 1024 / 1024 * 0.75) + ' Mo). Réduisez le nombre de lignes/pages, ou retirez des images, puis réessayez.');
    }

    var attachments = [{ filename: filename, content: pdfB64 }];

    var checkedPhotos = Array.prototype.slice.call(document.querySelectorAll('#send-photo-existing .send-photo-cb:checked'));
    if (checkedPhotos.length) {
      btn.textContent = 'Préparation des photos…';
      for (var i = 0; i < checkedPhotos.length; i++) {
        var cb = checkedPhotos[i];
        attachments.push({ filename: cb.dataset.name || ('photo-' + (i + 1) + '.jpg'), content: await urlToBase64(cb.dataset.url) });
      }
    }
    _sendAdHocPhotos.forEach(function(p) { attachments.push({ filename: p.name, content: p.base64 }); });

    var MAX_TOTAL_B64 = 5 * 1024 * 1024;
    var totalB64 = attachments.reduce(function(s, a){ return s + a.content.length; }, 0);
    if (totalB64 > MAX_TOTAL_B64) {
      throw new Error('Le PDF et les photos jointes dépassent la taille maximale autorisée pour un envoi (~' + Math.round(totalB64 / 1024 / 1024 * 0.75) + ' Mo). Retirez une ou plusieurs photos, puis réessayez.');
    }

    btn.textContent = 'Envoi en cours…';
    var tpl = loadTemplate();
    var message = $('send-message').value;
    var type = docTypeLabel(doc);
    var opts = {
      recap: $('send-opt-recap').checked,
      pj:    $('send-opt-pj').checked,
      avis:  $('send-opt-avis').checked,
    };
    var html = buildDocEmailHtml(doc, tpl, type, message, opts);

    await envoyerEmail(toEmail, subject, html, NOTIF_EMAIL, attachments);

    // Trace de l'envoi sur le document (visible dans la liste + réouverture
    // de cette fenêtre) et passage automatique "Créé" → "Envoyé".
    if (doc.id) {
      var docs = loadDocs();
      var idx = docs.findIndex(function(d){ return d.id === doc.id; });
      if (idx >= 0) {
        docs[idx].lastEmailAt = new Date().toISOString();
        docs[idx].lastEmailTo = toEmail;
        if (docs[idx].statut === 'créé') docs[idx].statut = 'envoyé';
        // La facture embarque désormais directement le lien d'avis Google
        // (voir buildDocEmailHtml) : on trace la demande comme pour l'envoi
        // manuel, pour que le bouton ⭐ de la liste reflète l'état réel — sauf
        // si le bloc a été décoché pour cet envoi, auquel cas il n'a pas été
        // proposé au client.
        if (type === 'Facture' && opts.avis) {
          docs[idx].avisEmailAt = new Date().toISOString();
          docs[idx].avisEmailTo = toEmail;
        }
        saveDocs(docs);
        _currentDocForEmail = docs[idx];
        renderDash();
        if ($('t-liste') && $('t-liste').classList.contains('on')) renderListe();
      }
    }

    showSendStatus('success', 'Email envoyé à '+toEmail+' ✓');
    btn.textContent = '✓ Envoyé !';
    setTimeout(function(){ $('send-email-modal').classList.remove('open'); }, 2000);
    showNotifBanner('📧', 'Email envoyé !', type+' '+doc.num+' → '+toEmail);

  } catch(e) {
    console.error('Envoi email doc:', e);
    var msg = e.text || e.message || 'Réessayez.';
    // "Load failed" (Safari) / "Failed to fetch" (Chrome) = échec réseau brut,
    // sans réponse du serveur : le message générique du navigateur n'aide pas
    // l'utilisateur, on l'oriente vers les causes les plus probables.
    if (/load failed|failed to fetch|networkerror/i.test(msg)) {
      msg = 'Connexion au serveur interrompue pendant l\'envoi (souvent : PDF trop volumineux, ou coupure réseau). Réessayez ; si ça persiste avec ce document, vérifiez son nombre de pages.';
    }
    showSendStatus('error', 'Erreur : ' + msg);
    btn.disabled = false;
    btn.textContent = '📧 Envoyer';
  }
}

function showSendStatus(type, msg) {
  var el = $('send-email-status');
  el.style.display = 'block';
  el.style.background = type==='success'?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)';
  el.style.color = type==='success'?'var(--green)':'var(--red)';
  el.style.border = '1px solid '+(type==='success'?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)');
  el.textContent = msg;
}

// ── Demande d'avis Google (facture payée → e-mail avec lien vers l'avis) ──
// Réutilise la fonction générique send-email : pas de PDF joint, juste un
// bouton vers la fiche Google de l'atelier.
var GOOGLE_REVIEW_URL = 'https://g.page/r/CQNOwHcSQhflEBM/review';
var _currentDocForAvis = null;

function openAvisModal(docId) {
  var doc = loadDocs().find(function(d){ return d.id === docId; });
  if (!doc) return;
  _currentDocForAvis = doc;
  $('avis-to-email').value = doc.ce || '';
  var prenom = (doc.cn || '').split(' ')[0] || '';
  $('avis-message').value = 'Bonjour' + (prenom ? ' ' + prenom : '') + ',\n\n'
    + 'Merci d\'avoir fait confiance à AREPROG. Si vous êtes satisfait(e) de l\'intervention, '
    + 'un avis Google nous aiderait beaucoup à nous faire connaître.\n\n'
    + 'Cordialement,\nAREPROG';
  var lastInfo = $('avis-last-info');
  if (doc.avisEmailAt) {
    lastInfo.textContent = '⭐ Déjà demandé le ' + new Date(doc.avisEmailAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' à ' + (doc.avisEmailTo || '');
    lastInfo.style.display = 'block';
  } else {
    lastInfo.style.display = 'none';
  }
  $('avis-status').style.display = 'none';
  $('avis-confirm-btn').disabled = false;
  $('avis-confirm-btn').textContent = '⭐ Envoyer';
  $('avis-modal').classList.add('open');
}

function buildAvisEmailHtml(tpl, message) {
  var color = /^#[0-9a-fA-F]{6}$/.test(tpl.color) ? tpl.color : '#2196F3';
  return '<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
    + '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
      + '<div style="background:' + color + ';padding:22px 28px">'
        + '<div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">' + escHtml(tpl.nom || 'AREPROG') + '</div>'
      + '</div>'
      + '<div style="padding:26px 28px">'
        + '<p style="margin:0 0 22px;font-size:14px;color:#111;line-height:1.6">' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
        + '<div style="text-align:center">'
          + '<a href="' + GOOGLE_REVIEW_URL + '" style="display:inline-block;background:' + color + ';color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px">★★★★★ Laisser un avis Google</a>'
        + '</div>'
      + '</div>'
      + '<div style="background:#f9fafb;border-top:1px solid #eef0f2;padding:16px 28px;font-size:11px;color:#9ca3af;line-height:1.7">'
        + escHtml(tpl.footer || '').replace(/\n/g, '<br>')
      + '</div>'
    + '</div>'
  + '</div>';
}

async function confirmSendAvis() {
  var toEmail = $('avis-to-email').value.trim();
  if (!toEmail || !toEmail.includes('@')) {
    showAvisStatus('error', 'Email invalide.');
    return;
  }
  var btn = $('avis-confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  try {
    var doc = _currentDocForAvis || {};
    var tpl = loadTemplate();
    var message = $('avis-message').value;
    var subject = (tpl.nom || 'AREPROG') + ' — Votre avis compte pour nous';
    var html = buildAvisEmailHtml(tpl, message);

    await envoyerEmail(toEmail, subject, html, NOTIF_EMAIL);

    if (doc.id) {
      var docs = loadDocs();
      var idx = docs.findIndex(function(d){ return d.id === doc.id; });
      if (idx >= 0) {
        docs[idx].avisEmailAt = new Date().toISOString();
        docs[idx].avisEmailTo = toEmail;
        saveDocs(docs);
        _currentDocForAvis = docs[idx];
        if ($('t-liste') && $('t-liste').classList.contains('on')) renderListe();
      }
    }

    showAvisStatus('success', 'Demande envoyée à '+toEmail+' ✓');
    btn.textContent = '✓ Envoyé !';
    setTimeout(function(){ $('avis-modal').classList.remove('open'); }, 2000);
    showNotifBanner('⭐', 'Demande d\'avis envoyée !', toEmail);
  } catch(e) {
    console.error('Envoi demande avis:', e);
    var msg = e.text || e.message || 'Réessayez.';
    if (/load failed|failed to fetch|networkerror/i.test(msg)) {
      msg = 'Connexion au serveur interrompue pendant l\'envoi. Réessayez.';
    }
    showAvisStatus('error', 'Erreur : ' + msg);
    btn.disabled = false;
    btn.textContent = '⭐ Envoyer';
  }
}

function showAvisStatus(type, msg) {
  var el = $('avis-status');
  el.style.display = 'block';
  el.style.background = type==='success'?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)';
  el.style.color = type==='success'?'var(--green)':'var(--red)';
  el.style.border = '1px solid '+(type==='success'?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)');
  el.textContent = msg;
}

async function generatePdfBase64(elId, opts) {
  opts = opts || {};
  var scale = opts.scale || 2;
  var quality = opts.quality || 0.92;
  // Utiliser jsPDF + html2canvas pour capturer le document
  var original = $(elId || 'preview');
  if (!original) throw new Error('Aperçu non disponible');

  // Le #preview affiché à l'écran suit .modal-inner{max-width:100%}, donc sur
  // mobile / fenêtre étroite il est rétréci (colonnes tassées, texte coupé).
  // On clone le contenu dans un conteneur hors-écran à largeur fixe "desktop"
  // pour que le PDF soit toujours généré avec la mise en page complète.
  var clone = original.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.width = '780px';
  clone.style.maxWidth = 'none';
  clone.style.padding = '44px 52px';

  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:0;left:-99999px;width:780px;background:#fff';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);

  var canvas;
  try {
    canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
  } finally {
    document.body.removeChild(wrap);
  }

  var { jsPDF } = window.jspdf;
  var pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  var imgW = 210; // A4 width mm
  var imgH = (canvas.height * imgW) / canvas.width;
  var pageH = 297; // A4 height mm
  var pos = 0;

  // Gestion multi-pages si le doc est long
  while (pos < imgH) {
    if (pos > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', quality), 'JPEG', 0, -pos, imgW, imgH);
    pos += pageH;
  }

  // Retourner en base64 sans le prefixe data:
  var b64 = pdf.output('datauristring');
  return b64.split(',')[1];
}

// Banner in-app (fallback ou iOS qui bloque Notification API)
function showNotifBanner(icon, title, msg) {
  $('notif-icon').textContent = icon;
  $('notif-title').textContent = title;
  $('notif-msg').textContent = msg;
  $('notif-banner').classList.add('show');
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(closeNotifBanner, 5000);
}
function closeNotifBanner() {
  $('notif-banner').classList.remove('show');
}

// ── Message de confirmation RDV ─────────────────────────────
function buildConfirmMsg(rdv) {
  var tpl = loadTemplate();
  var nomEntreprise = tpl.nom || 'AREPROG';
  var tel = tpl.tel || '06 67 92 46 30';
  var cl = rdv.clientId ? loadClients().find(function(c){ return c.id === rdv.clientId; }) : null;
  var clientPrenom = cl ? cl.nom.split(' ')[0] : '';

  var dateStr = rdv.date ? (function() {
    var d = new Date(rdv.date);
    var jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    var mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    return jours[d.getDay()] + ' ' + d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
  })() : '';

  var lignes = [];
  lignes.push('Bonjour ' + (clientPrenom || '') + ' !');
  lignes.push('');
  lignes.push('Je vous confirme notre rendez-vous pour l\'intervention :');
  lignes.push('');
  lignes.push('📅 ' + (dateStr || rdv.date));
  if (rdv.heure) lignes.push('🕐 ' + rdv.heure);
  if (rdv.lieu)  lignes.push('📍 ' + rdv.lieu);
  if (rdv.title) lignes.push('🔧 ' + rdv.title);
  lignes.push('');
  // Infos véhicule du RDV (priorité au véhicule sélectionné, sinon premier)
  if (cl) {
    var vehs2 = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm ? [{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||''}] : []);
    var selV = (rdv.vehIdx !== null && rdv.vehIdx !== undefined && vehs2[rdv.vehIdx]) ? vehs2[rdv.vehIdx] : vehs2[0];
    if (selV && selV.vm) {
      lignes.push('🚗 Véhicule : ' + [selV.vm,selV.vmo,selV.vmot,selV.van?'('+selV.van+')':''].filter(Boolean).join(' '));
      lignes.push('');
    }
  }
  if (rdv.notes) {
    lignes.push('📝 ' + rdv.notes);
    lignes.push('');
  }
  lignes.push('N\'h\u00e9sitez pas \u00e0 me contacter si besoin.');
  lignes.push('');
  lignes.push('À bientôt,');
  lignes.push(nomEntreprise);
  lignes.push(tel);

  return lignes.join('\n');
}

function copyConfirmMsg(rdvId) {
  var rdv = loadRdvs().find(function(r){ return r.id === rdvId; });
  if (!rdv) return;
  var msg = buildConfirmMsg(rdv);

  // Copier dans le presse-papier
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(function() {
      showNotifBanner('📋', 'Message copié !', 'Colle-le dans WhatsApp ou SMS.');
      // Mettre à jour le bouton visuellement
      document.querySelectorAll('.rdv-confirm-btn').forEach(function(btn) {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(rdvId)) {
          btn.textContent = '✓ Copié !';
          btn.classList.add('copied');
          setTimeout(function(){ btn.textContent = '📋 Copier confirmation'; btn.classList.remove('copied'); }, 2000);
        }
      });
    }).catch(function() { fallbackCopy(msg); });
  } else {
    fallbackCopy(msg);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showNotifBanner('📋', 'Message copié !', 'Colle-le dans WhatsApp ou SMS.');
  } catch(e) {
    // Afficher le message dans une alerte pour copie manuelle
    prompt('Copie ce message :', text);
  }
  document.body.removeChild(ta);
}

// Aperçu du message de confirmation (dans le modal RDV)
function previewConfirmMsg(rdvId) {
  if (!rdvId) return '';
  var rdv = loadRdvs().find(function(r){ return r.id === rdvId; });
  if (!rdv) return '';
  return buildConfirmMsg(rdv);
}

// ── Helpers ─────────────────────────────────────────────────
function toDateStr(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var j = String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+j;
}

// ── Sync Firebase rdvs ───────────────────────────────────────
function syncRdvsFromFirebase() {
  if (!db) return;
  db.collection('rdvs').get()
    .then(function(snapshot) {
      var rdvs = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        // Ignorer l'ancien document monolithique 'all'
        if (doc.id === 'all') return;
        if (data && data.id) rdvs.push(data);
      });
      if (rdvs.length > 0) {
        localStorage.setItem(RDV_KEY, JSON.stringify(rdvs));
      }
    }).catch(function(){});
}

// ============================================================
//  TABS (complet avec agenda)
// ============================================================

// ============================================================
//  STATUT RAPIDE
// ============================================================
function toggleStatusDropdown(e, docId) {
  e.stopPropagation();
  var dd = $('sd-' + docId);
  if (!dd) return;
  var pill = dd.parentElement;
  var isOpen = pill.classList.contains('open');
  // Fermer tous les autres
  document.querySelectorAll('.status-pill.open').forEach(function(p){ p.classList.remove('open'); });
  if (!isOpen) pill.classList.add('open');
}
// Fermer les dropdowns au clic extérieur
document.addEventListener('click', function() {
  document.querySelectorAll('.status-pill.open').forEach(function(p){ p.classList.remove('open'); });
});

function quickSetStatus(docId, newStatus) {
  var docs = loadDocs();
  var idx = docs.findIndex(function(d){ return d.id === docId; });
  if (idx < 0) return;
  docs[idx].statut = newStatus;
  saveDocs(docs);
  renderDash();
  if ($('t-liste').classList.contains('on')) renderListe();
  showNotifBanner('✅', 'Statut mis à jour', docs[idx].num + ' → ' + newStatus);
}

// ============================================================
//  DUPLIQUER UN DOCUMENT
// ============================================================
function duplicateDoc(docId) {
  var docs = loadDocs();
  var orig = docs.find(function(d){ return d.id === docId; });
  if (!orig) return;
  var copy = JSON.parse(JSON.stringify(orig));
  copy.id = Date.now();
  copy.date = today();
  var ech = new Date(); ech.setDate(ech.getDate() + 30);
  copy.ech = ech.toISOString().split('T')[0];
  copy.statut = 'créé';
  // Nouveau numéro
  var prefix = copy.type === 'devis' ? 'DEV' : 'FAC';
  copy.num = genNum(prefix);
  docs.unshift(copy);
  saveDocs(docs);
  // Charger dans le formulaire
  loadDoc(copy.id);
  showNotifBanner('⧉', 'Document dupliqué', copy.num + ' créé depuis ' + orig.num);
}

// ============================================================
//  DEVIS → FACTURE EN 1 CLIC
// ============================================================
function devisToFacture(docId) {
  var docs = loadDocs();
  var devis = docs.find(function(d){ return d.id === docId; });
  if (!devis) return;
  if (!confirm('Convertir ce devis en facture ? Le devis sera conservé.')) return;
  var dateEmission = prompt('Date d\'émission de la facture (AAAA-MM-JJ) :', today());
  if (dateEmission === null) return; // annulé
  dateEmission = dateEmission.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateEmission) || isNaN(new Date(dateEmission).getTime())) {
    alert('Date invalide, utilisez le format AAAA-MM-JJ.');
    return;
  }
  var facture = JSON.parse(JSON.stringify(devis));
  facture.id = Date.now();
  facture.type = 'facture';
  facture.num = genNum('FAC');
  facture.date = dateEmission;
  facture.statut = 'créé';
  facture.refDevis = devis.num; // référence au devis d'origine
  docs.unshift(facture);
  // Marquer le devis comme accepté
  var devisIdx = docs.findIndex(function(d){ return d.id === docId; });
  if (devisIdx >= 0 && (docs[devisIdx].statut === 'envoyé' || docs[devisIdx].statut === 'créé')) docs[devisIdx].statut = 'accepté';
  saveDocs(docs);
  loadDoc(facture.id);
  showNotifBanner('🧾', 'Facture créée', facture.num + ' depuis devis ' + devis.num);
}

// ============================================================
//  RECHERCHE GLOBALE
// ============================================================
function globalSearch(q) {
  var el = $('search-results');
  if (!el) return;
  q = (q || '').toLowerCase().trim();
  if (!q || q.length < 2) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px">Tape au moins 2 caractères…</div>';
    return;
  }
  var results = [];
  // Recherche dans les documents
  loadDocs().forEach(function(d) {
    var haystack = [d.num,d.cn,d.vm,d.vmo,d.vmot,d.vim,d.cv,d.type,d.statut].join(' ').toLowerCase();
    if (d.lines) d.lines.forEach(function(l){ haystack += ' ' + (l.label||'').toLowerCase(); });
    if (haystack.includes(q)) {
      results.push({ type:'doc', icon: d.type==='devis'?'📄':'🧾',
        title: d.num + ' — ' + (d.cn||'—'),
        sub: [d.type, fmtDate(d.date), fmt(d.ttc||0), d.statut].join(' · '),
        action: 'loadDoc(' + d.id + ')' });
    }
  });
  // Recherche dans les clients
  loadClients().forEach(function(cl) {
    var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm?[{vm:cl.vm,vmo:cl.vmo||'',vim:cl.vim||''}]:[]);
    var haystack = [cl.nom,cl.tel,cl.email,cl.ville].join(' ').toLowerCase();
    vehs.forEach(function(v){ haystack += ' ' + [v.vm,v.vmo,v.vmot,v.vim].join(' ').toLowerCase(); });
    if (haystack.includes(q)) {
      var vLabel = vehs.length ? vehs.map(function(v){return [v.vm,v.vmo].filter(Boolean).join(' ');}).join(', ') : '';
      results.push({ type:'client', icon:'👤',
        title: cl.nom,
        sub: (vLabel||'') + (cl.tel?' · '+cl.tel:''),
        action: 'showClientHistory(' + cl.id + ')' });
    }
  });
  // Recherche dans le parc véhicules (achat / revente)
  loadVehicules().forEach(function(v) {
    var haystack = [v.brand,v.model,v.plate,v.vin,v.year,v.notes].join(' ').toLowerCase();
    (v.expenses||[]).forEach(function(e){ haystack += ' ' + (e.label||'').toLowerCase(); });
    if (haystack.includes(q)) {
      var marge = vehMarge(v);
      results.push({ type:'vehicule', icon:'🚗',
        title: vehLabel(v) + (v.plate ? ' — ' + String(v.plate).toUpperCase() : ''),
        sub: [(VEH_ST[v.status]||VEH_ST.en_stock).l, 'revient ' + fmt(vehRevient(v)), marge !== null ? 'marge ' + fmt(marge) : null].filter(Boolean).join(' · '),
        action: 'showTab(\'parc\');openVehModal(\'' + String(v.id).replace(/'/g, '') + '\')' });
    }
  });
  // Recherche dans les RDVs
  loadRdvs().forEach(function(r) {
    var haystack = [r.title,r.lieu,r.notes].join(' ').toLowerCase();
    if (haystack.includes(q)) {
      results.push({ type:'rdv', icon:'📅',
        title: r.title,
        sub: fmtDate(r.date) + (r.heure?' à '+r.heure:'') + (r.lieu?' · '+r.lieu:''),
        action: 'showTab(\'agenda\')' });
    }
  });

  if (!results.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px">Aucun résultat pour "' + escHtml(q) + '"</div>';
    return;
  }
  el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">' + results.length + ' résultat' + (results.length>1?'s':'') + '</div>'
    + results.map(function(r) {
      return '<div class="search-result-item" onclick="' + r.action + (r.type==='doc'?';showTab(\'form\')':'') + '">'
        + '<div class="search-result-icon">' + r.icon + '</div>'
        + '<div class="search-result-body">'
          + '<div class="search-result-title">' + escHtml(r.title) + '</div>'
          + '<div class="search-result-sub">' + escHtml(r.sub) + '</div>'
        + '</div>'
        + '<span style="color:var(--blue);font-size:16px">→</span>'
      + '</div>';
    }).join('');
}

function dashQuickSearch(q) {
  var res = $('dash-search-results');
  if (!q || q.length < 2) { res.style.display='none'; return; }
  res.style.display = 'block';
  globalSearch(q);
  res.innerHTML = $('search-results').innerHTML;
}

// ============================================================
//  HISTORIQUE CLIENT
// ============================================================
function showClientHistory(clientId) {
  var cl = loadClients().find(function(c){ return c.id === clientId; });
  if (!cl) return;
  var docs = loadDocs().filter(function(d){ return d.cn && d.cn.toLowerCase() === (cl.nom||'').toLowerCase(); });
  var rdvs = loadRdvs().filter(function(r){ return r.clientId === clientId; });

  $('client-history-title').textContent = '📋 ' + cl.nom;

  var vehs = cl.vehs && cl.vehs.length ? cl.vehs : (cl.vm?[{vm:cl.vm,vmo:cl.vmo||'',vmot:cl.vmot||'',van:cl.van||'',vim:cl.vim||''}]:[]);
  var vehsHTML = vehs.map(function(v){
    var label = [v.vm,v.vmo,v.van?'('+v.van+')':'',v.vim?'· '+v.vim:''].filter(Boolean).join(' ');
    var extra = '';
    if (v.notes) extra += '<div style="font-size:11px;color:var(--text-dim);margin-top:4px;white-space:pre-wrap">📝 '+escHtml(v.notes)+'</div>';
    if (v.photos && v.photos.length) {
      extra += '<div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">' + v.photos.map(function(p){
        return '<a href="'+escHtml(p.url)+'" target="_blank" rel="noopener" style="display:block;width:52px;height:40px;border-radius:5px;border:1px solid var(--border);background:var(--bg4) center/cover no-repeat;background-image:url(\''+escHtml(p.url)+'\')"></a>';
      }).join('') + '</div>';
    }
    if (v.videos && v.videos.length) {
      extra += '<div style="margin-top:6px">' + v.videos.map(function(vd){
        return '<a href="'+escHtml(vd.url)+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;color:var(--blue);text-decoration:none;font-size:11px;margin-right:8px">🎥 '+escHtml(vd.name||'vidéo')+'</a>';
      }).join('') + '</div>';
    }
    return '<div style="display:inline-block;vertical-align:top;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:11px;margin:0 6px 6px 0;min-width:160px">🚗 '+escHtml(label)+extra+'</div>';
  }).join('');

  var totalCA = docs.filter(function(d){return d.statut==='payé';}).reduce(function(s,d){return s+(d.ttc||0);},0);

  var html = '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">'
    + (cl.tel?'<span style="font-size:13px;color:var(--text-dim)">📞 '+escHtml(cl.tel)+'</span>':'')
    + (cl.email?'<span style="font-size:13px;color:var(--text-dim)">✉️ '+escHtml(cl.email)+'</span>':'')
    + '</div>';
  if (vehsHTML) html += '<div style="margin-bottom:16px">' + vehsHTML + '</div>';

  if (cl.documents && cl.documents.length) {
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:8px">📎 Fichiers du client</div>';
    html += '<div style="margin-bottom:16px">' + cl.documents.map(function(d) {
      return '<div class="veh-doc">'
        + '<span>' + (String(d.name||'').toLowerCase().endsWith('.pdf') ? '📄' : '🖼️') + '</span>'
        + '<a href="' + escHtml(d.url) + '" target="_blank" rel="noopener">' + escHtml(d.name || 'fichier') + '</a>'
        + '<span style="color:var(--text-muted);font-size:11px">' + escHtml(CLIENT_DOC_TYPES[d.type] || 'Autre') + '</span>'
        + '</div>';
    }).join('') + '</div>';
  }
  html += '<div style="display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap">'
    + '<div style="background:var(--bg3);border-radius:8px;padding:10px 14px;text-align:center"><div style="font-family:var(--fh);font-size:20px;color:var(--blue)">' + docs.length + '</div><div style="font-size:10px;color:var(--text-muted)">Documents</div></div>'
    + '<div style="background:var(--bg3);border-radius:8px;padding:10px 14px;text-align:center"><div style="font-family:var(--fh);font-size:20px;color:var(--green)">' + fmt(totalCA) + '</div><div style="font-size:10px;color:var(--text-muted)">CA total</div></div>'
    + '<div style="background:var(--bg3);border-radius:8px;padding:10px 14px;text-align:center"><div style="font-family:var(--fh);font-size:20px;color:var(--orange)">' + rdvs.length + '</div><div style="font-size:10px;color:var(--text-muted)">RDVs</div></div>'
    + '</div>';

  if (docs.length) {
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:8px">Documents</div>';
    html += docs.map(function(d) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06)">'
        + '<span class="badge ' + (d.type==='devis'?'b-devis':'b-facture') + '">' + d.type + '</span>'
        + '<span class="doc-num">' + escHtml(d.num) + '</span>'
        + '<span style="font-size:12px;color:var(--text-dim)">' + fmtDate(d.date) + '</span>'
        + '<span style="flex:1;font-size:12px;color:var(--text-dim)">' + (d.lines||[]).map(function(l){return l.label?l.label.split(' — ')[0]:'';}).filter(Boolean).slice(0,2).join(', ') + '</span>'
        + '<span style="font-family:var(--fm);color:var(--blue);font-size:13px">' + fmt(d.ttc||0) + '</span>'
        + '<button class="btn-s btn-sm" onclick="loadDoc('+d.id+');$(' + "'client-history-modal'" + ').classList.remove(' + "'open'" + ')">✏️</button>'
        + '</div>';
    }).join('');
  } else {
    html += '<div style="color:var(--text-muted);font-size:13px">Aucun document trouvé pour ce client.</div>';
  }

  $('client-history-content').innerHTML = html;
  $('client-history-modal').classList.add('open');
}

// Bouton historique depuis le carnet
function clientHistoryBtn(id) { showClientHistory(id); }

// ============================================================
//  STATISTIQUES
// ============================================================
function renderStats() {
  var period = parseInt($('stats-period') ? $('stats-period').value : '6') || 0;
  var now = new Date();
  var allDocs = loadDocs();
  var docs = allDocs;

  // Filtrer par période
  var cutoff = null;
  if (period > 0) {
    cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - period);
    docs = docs.filter(function(d){ return new Date(d.date) >= cutoff; });
  }

  var factures = docs.filter(function(d){ return d.type==='facture'; });
  var devis = docs.filter(function(d){ return d.type==='devis'; });
  var payees = factures.filter(function(d){ return d.statut==='payé'; });
  var caTotal = payees.reduce(function(s,d){ return s+(d.ttc||0); }, 0);
  var caAttente = factures.filter(function(d){ return d.statut!=='payé'&&d.statut!=='annulé'; }).reduce(function(s,d){ return s+(d.ttc||0); }, 0);
  var convRate = devis.length > 0 ? Math.round((factures.length / devis.length) * 100) : 0;
  var panierMoyen = payees.length > 0 ? caTotal / payees.length : 0;

  // CA moyen / jour sur la période affichée
  var periodStart = cutoff;
  if (!periodStart) {
    var oldestTs = allDocs.reduce(function(min,d){ var t = new Date(d.date).getTime(); return (!isNaN(t) && t < min) ? t : min; }, now.getTime());
    periodStart = new Date(oldestTs);
  }
  var joursPeriode = Math.max(1, Math.ceil((now - periodStart) / 86400000));
  var caMoyenJour = caTotal / joursPeriode;

  // CA du mois en cours (indépendant du filtre de période)
  var caMoisEnCours = allDocs.filter(function(d){
    var dt = new Date(d.date);
    return d.type === 'facture' && d.statut === 'payé' && dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  }).reduce(function(s,d){ return s+(d.ttc||0); }, 0);

  // KPIs
  var nbDeclare  = docs.filter(function(d){ return d.declare !== false; }).length;
  var nbNonDecl  = docs.filter(function(d){ return d.declare === false; }).length;

  var nbClients = loadClients().length;
  var rdvAVenir = loadRdvs().filter(function(r){ return r.date >= today(); }).length;
  var impayees = factures.filter(function(d){ return d.statut!=='payé' && d.statut!=='annulé'; }).length;

  var kpis = $('stats-kpis');
  if (kpis) kpis.innerHTML = [
    { val: fmt(caTotal),     lbl: 'CA encaissé' },
    { val: fmt(caAttente),   lbl: 'En attente' },
    { val: fmt(caMoisEnCours), lbl: 'CA du mois en cours' },
    { val: fmt(caMoyenJour), lbl: 'CA moyen / jour' },
    { val: convRate + '%',   lbl: 'Taux conversion' },
    { val: fmt(panierMoyen), lbl: 'Panier moyen' },
    { val: nbDeclare + '',   lbl: 'Déclarés', color: 'var(--green)' },
    { val: nbNonDecl + '',   lbl: 'Non déclarés', color: nbNonDecl > 0 ? 'var(--orange)' : 'var(--text-dim)' },
    { val: fmt(caTotal * 0.226), lbl: 'Cotis. estimées (22,6%)' },
    { val: nbClients + '',   lbl: 'Clients au carnet' },
    { val: impayees + '',    lbl: 'Factures impayées', color: impayees > 0 ? 'var(--orange)' : 'var(--text-dim)' },
    { val: rdvAVenir + '',   lbl: 'RDV à venir' },
  ].map(function(k) {
    return '<div class="kpi-item"><div class="kpi-val" style="color:'+(k.color||'var(--blue)')+'">'+k.val+'</div><div class="kpi-lbl">'+k.lbl+'</div></div>';
  }).join('');

  // Graphique CA par mois
  var mois6 = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now);
    d.setMonth(d.getMonth() - i);
    mois6.push({ y: d.getFullYear(), m: d.getMonth(), lbl: ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'][d.getMonth()] });
  }
  var maxCA = 0;
  var maxDocs = 0;
  var moisData = mois6.map(function(mo) {
    var moFacts = allDocs.filter(function(d){ return d.type==='facture' && d.statut==='payé' && new Date(d.date).getFullYear()===mo.y && new Date(d.date).getMonth()===mo.m; });
    var moAll = allDocs.filter(function(d){ return new Date(d.date).getFullYear()===mo.y && new Date(d.date).getMonth()===mo.m; });
    var ca = moFacts.reduce(function(s,d){ return s+(d.ttc||0); }, 0);
    if (ca > maxCA) maxCA = ca;
    if (moAll.length > maxDocs) maxDocs = moAll.length;
    return { lbl: mo.lbl, ca: ca, cnt: moAll.length };
  });

  var chartCA = $('chart-ca');
  if (chartCA) chartCA.innerHTML = moisData.map(function(mo) {
    var h = maxCA > 0 ? Math.max(4, Math.round((mo.ca / maxCA) * 90)) : 4;
    return '<div class="bar-col"><div class="bar-val">' + (mo.ca>0?Math.round(mo.ca)+'€':'') + '</div><div class="bar-fill" style="height:'+h+'px;background:var(--blue)"></div><div class="bar-label">' + mo.lbl + '</div></div>';
  }).join('');

  var chartDocs = $('chart-docs');
  if (chartDocs) chartDocs.innerHTML = moisData.map(function(mo) {
    var h = maxDocs > 0 ? Math.max(4, Math.round((mo.cnt / maxDocs) * 90)) : 4;
    return '<div class="bar-col"><div class="bar-val">' + (mo.cnt>0?mo.cnt:'') + '</div><div class="bar-fill" style="height:'+h+'px;background:var(--green)"></div><div class="bar-label">' + mo.lbl + '</div></div>';
  }).join('');

  // Prestations les plus vendues
  var prestCount = {};
  allDocs.forEach(function(d) {
    (d.lines||[]).forEach(function(l) {
      if (!l.label || l.offert) return;
      var key = l.label.split(' — ')[0].split(' · ')[0];
      prestCount[key] = (prestCount[key]||0) + 1;
    });
  });
  var topPrests = Object.keys(prestCount).sort(function(a,b){ return prestCount[b]-prestCount[a]; }).slice(0,6);
  var maxP = topPrests.length ? prestCount[topPrests[0]] : 1;
  var chartP = $('chart-prestations');
  if (chartP) chartP.innerHTML = topPrests.length ? topPrests.map(function(p) {
    var pct = Math.round((prestCount[p]/maxP)*100);
    return '<div style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:var(--text)">' + escHtml(p) + '</span><span style="color:var(--text-dim)">' + prestCount[p] + 'x</span></div>'
      + '<div style="height:6px;background:var(--bg3);border-radius:3px"><div style="height:100%;width:'+pct+'%;background:var(--blue);border-radius:3px"></div></div>'
    + '</div>';
  }).join('') : '<div style="color:var(--text-muted);font-size:13px">Pas encore de données.</div>';

  // Taux conversion
  var convEl = $('chart-conversion');
  if (convEl) convEl.innerHTML = '<div style="text-align:center">'
    + '<div style="font-family:var(--fh);font-size:48px;font-weight:700;color:' + (convRate>=50?'var(--green)':'var(--orange)') + '">' + convRate + '%</div>'
    + '<div style="color:var(--text-dim);font-size:13px;margin-top:4px">' + devis.length + ' devis → ' + factures.length + ' factures</div>'
    + '<div style="margin-top:16px;height:8px;background:var(--bg3);border-radius:4px"><div style="height:100%;width:'+Math.min(convRate,100)+'%;background:' + (convRate>=50?'var(--green)':'var(--orange)') + ';border-radius:4px"></div></div>'
  + '</div>';

  // Répartition par statut
  var statutsList = ['créé','envoyé','accepté','payé','annulé'];
  var statutColors = { 'créé':'var(--text-dim)', 'envoyé':'var(--blue)', 'accepté':'#8b5cf6', 'payé':'var(--green)', 'annulé':'#ef4444' };
  var statutCounts = statutsList.map(function(s){ return { s: s, n: docs.filter(function(d){ return d.statut === s; }).length }; });
  var maxStatut = Math.max.apply(null, statutCounts.map(function(x){ return x.n; }).concat([1]));
  var chartStatuts = $('chart-statuts');
  if (chartStatuts) chartStatuts.innerHTML = statutCounts.map(function(x) {
    var h = Math.max(4, Math.round((x.n / maxStatut) * 90));
    return '<div class="bar-col"><div class="bar-val">' + (x.n>0?x.n:'') + '</div><div class="bar-fill" style="height:'+h+'px;background:'+(statutColors[x.s]||'var(--blue)')+'"></div><div class="bar-label">' + x.s + '</div></div>';
  }).join('');

  // Top clients (CA)
  var caParClient = {};
  payees.forEach(function(d) { var cn = d.cn || 'Inconnu'; caParClient[cn] = (caParClient[cn]||0) + (d.ttc||0); });
  var topClients = Object.keys(caParClient).sort(function(a,b){ return caParClient[b]-caParClient[a]; }).slice(0,6);
  var maxClient = topClients.length ? caParClient[topClients[0]] : 1;
  var chartClients = $('chart-clients');
  if (chartClients) chartClients.innerHTML = topClients.length ? topClients.map(function(cn) {
    var pct = Math.round((caParClient[cn]/maxClient)*100);
    return '<div style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:var(--text)">' + escHtml(cn) + '</span><span style="color:var(--text-dim)">' + fmt(caParClient[cn]) + '</span></div>'
      + '<div style="height:6px;background:var(--bg3);border-radius:3px"><div style="height:100%;width:'+pct+'%;background:var(--green);border-radius:3px"></div></div>'
    + '</div>';
  }).join('') : '<div style="color:var(--text-muted);font-size:13px">Pas encore de données.</div>';

  // CA par marque de véhicule
  var caParMarque = {};
  payees.forEach(function(d) { var vm = d.vm || 'Non renseigné'; caParMarque[vm] = (caParMarque[vm]||0) + (d.ttc||0); });
  var topMarques = Object.keys(caParMarque).sort(function(a,b){ return caParMarque[b]-caParMarque[a]; }).slice(0,6);
  var maxMarque = topMarques.length ? caParMarque[topMarques[0]] : 1;
  var chartMarques = $('chart-marques');
  if (chartMarques) chartMarques.innerHTML = topMarques.length ? topMarques.map(function(vm) {
    var pct = Math.round((caParMarque[vm]/maxMarque)*100);
    return '<div style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:var(--text)">' + escHtml(vm) + '</span><span style="color:var(--text-dim)">' + fmt(caParMarque[vm]) + '</span></div>'
      + '<div style="height:6px;background:var(--bg3);border-radius:3px"><div style="height:100%;width:'+pct+'%;background:var(--blue);border-radius:3px"></div></div>'
    + '</div>';
  }).join('') : '<div style="color:var(--text-muted);font-size:13px">Pas encore de données.</div>';

  // Parc auto (indépendant de la période sélectionnée)
  var allVehs = loadVehicules();
  var vendus = allVehs.filter(function(v){ return v.status === 'vendu'; });
  var enStock = allVehs.length - vendus.length;
  var margeTotale = vendus.reduce(function(s,v){ return s + (vehMarge(v)||0); }, 0);
  var chartParc = $('chart-parc');
  if (chartParc) chartParc.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:center">'
    + '<div><div style="font-family:var(--fh);font-size:28px;font-weight:700;color:var(--blue)">' + enStock + '</div><div style="color:var(--text-dim);font-size:12px">En cours (stock/répa/à vendre)</div></div>'
    + '<div><div style="font-family:var(--fh);font-size:28px;font-weight:700;color:var(--text-dim)">' + vendus.length + '</div><div style="color:var(--text-dim);font-size:12px">Vendus</div></div>'
    + '<div style="grid-column:1/3"><div style="font-family:var(--fh);font-size:28px;font-weight:700;color:' + (margeTotale>=0?'var(--green)':'#ef4444') + '">' + fmt(margeTotale) + '</div><div style="color:var(--text-dim);font-size:12px">Marge totale (véhicules vendus)</div></div>'
  + '</div>';

  renderMonthDetail();
}

// ============================================================
//  VUE MENSUELLE DÉTAILLÉE (comptabilité) — choisir n'importe quel
//  mois des 24 derniers mois et voir son détail (CA encaissé/facturé,
//  CA moyen/jour, panier moyen, évolution vs mois précédent).
// ============================================================
var MOIS_NOMS_LONGS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function populateMonthPicker() {
  var sel = $('stats-month-picker');
  if (!sel || sel.options.length) return;
  var now = new Date();
  var opts = '';
  for (var i = 0; i < 24; i++) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    opts += '<option value="' + val + '">' + MOIS_NOMS_LONGS[d.getMonth()] + ' ' + d.getFullYear() + '</option>';
  }
  sel.innerHTML = opts;
}

function renderMonthDetail() {
  populateMonthPicker();
  var sel = $('stats-month-picker');
  var kpisEl = $('stats-month-kpis');
  if (!sel || !sel.value || !kpisEl) return;
  var parts = sel.value.split('-');
  var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1;
  var allDocs = loadDocs();
  function docsDuMois(yy, mm) {
    return allDocs.filter(function(d) { var dt = new Date(d.date); return dt.getFullYear() === yy && dt.getMonth() === mm; });
  }
  var moDocs = docsDuMois(y, m);
  var moFactures = moDocs.filter(function(d){ return d.type === 'facture'; });
  var moDevis = moDocs.filter(function(d){ return d.type === 'devis'; });
  var moPayees = moFactures.filter(function(d){ return d.statut === 'payé'; });
  var caEncMo = moPayees.reduce(function(s,d){ return s+(d.ttc||0); }, 0);
  var caEmisMo = moFactures.reduce(function(s,d){ return s+(d.ttc||0); }, 0);
  var panierMo = moPayees.length ? caEncMo / moPayees.length : 0;
  var convMo = moDevis.length ? Math.round((moFactures.length / moDevis.length) * 100) : 0;

  var now = new Date();
  var isCurrentMonth = (y === now.getFullYear() && m === now.getMonth());
  var joursDansMois = new Date(y, m + 1, 0).getDate();
  var joursEcoules = isCurrentMonth ? now.getDate() : joursDansMois;
  var caMoyenJourMo = caEncMo / joursEcoules;

  var prevD = new Date(y, m - 1, 1);
  var caEncPrev = docsDuMois(prevD.getFullYear(), prevD.getMonth())
    .filter(function(d){ return d.type === 'facture' && d.statut === 'payé'; })
    .reduce(function(s,d){ return s+(d.ttc||0); }, 0);
  var evolution = caEncPrev > 0 ? Math.round(((caEncMo - caEncPrev) / caEncPrev) * 100) : (caEncMo > 0 ? 100 : 0);

  kpisEl.innerHTML = [
    { val: fmt(caEncMo),        lbl: 'CA encaissé' + (isCurrentMonth ? ' (mois en cours)' : '') },
    { val: fmt(caEmisMo),       lbl: 'CA facturé (émis)' },
    { val: fmt(caMoyenJourMo),  lbl: 'CA moyen / jour' },
    { val: moFactures.length + '', lbl: 'Factures' },
    { val: moDevis.length + '',    lbl: 'Devis' },
    { val: convMo + '%',        lbl: 'Taux conversion' },
    { val: fmt(panierMo),       lbl: 'Panier moyen' },
    { val: (evolution >= 0 ? '+' : '') + evolution + '%', lbl: 'Vs mois précédent', color: evolution >= 0 ? 'var(--green)' : '#ef4444' },
  ].map(function(k) {
    return '<div class="kpi-item"><div class="kpi-val" style="color:'+(k.color||'var(--blue)')+'">'+k.val+'</div><div class="kpi-lbl">'+k.lbl+'</div></div>';
  }).join('');
}

// ============================================================
//  EXPORT CSV
// ============================================================
function exportCSV() {
  var docs = loadDocs();
  var rows = [['Numéro','Type','Date','Client','Véhicule','Immat','Montant HT','Remise totale','TVA','Montant TTC','Statut','Déclaré','Prestations']];
  docs.forEach(function(d) {
    var prests = (d.lines||[]).map(function(l){ return l.label?l.label.split(' — ')[0]:''; }).filter(Boolean).join(' | ');
    rows.push([
      d.num||'', d.type||'', d.date||'', d.cn||'',
      [d.vm,d.vmo].filter(Boolean).join(' '), d.vim||'',
      (d.ht||0).toFixed(2), (d.remiseTotale||0).toFixed(2), (d.tva||0).toFixed(2), (d.ttc||0).toFixed(2),
      d.statut||'',
      d.declare === false ? 'Non déclaré' : 'Déclaré',
      prests
    ]);
  });
  var csv = rows.map(function(r){
    return r.map(function(cell){ return '"' + String(cell).replace(/"/g,'""') + '"'; }).join(';');
  }).join('\n');
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'AREPROG_export_' + today() + '.csv';
  a.click();
  showNotifBanner('⬇', 'Export CSV', docs.length + ' documents exportés');
}

// ============================================================
//  TABS (complet)
// ============================================================
// ⚠ Les deux tableaux ci-dessous sont POSITIONNELS : le i-ème nom correspond
// au i-ème bouton .nb de la barre. L'index 2 ('form') est le bouton
// « + Nouveau », qui n'ouvre pas d'onglet mais partage la position.
// Ajouter un onglet impose de le déclarer ici ET au bon rang dans .tb-nav.
var TABS = ['dash','demandes','form','liste','carnet','template','services','agenda','parc','stats','search','codage','mail'];

function showTab(t) {
  TABS.forEach(function(x){ var el=$('t-'+x); if(el) el.classList.toggle('on',x===t); });
  document.querySelectorAll('.nb').forEach(function(b,i){ b.classList.toggle('on',TABS[i]===t); });
  if(t==='demandes') renderDemandes();
  if(t==='dash')     renderDash();
  if(t==='liste')    renderListe();
  if(t==='carnet')   renderCarnet();
  if(t==='template') { fillTplForm(loadTemplate()); livePreview(); }
  if(t==='services') renderCatEditor();
  if(t==='agenda')   renderAgenda();
  if(t==='parc')     renderParc();
  if(t==='stats')    renderStats();
  if(t==='search')   { $('global-search').value=''; $('search-results').innerHTML='<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px">Tape pour rechercher…</div>'; setTimeout(function(){ $('global-search').focus(); }, 100); }
  if(t==='codage')   initCodageTab();
  if(t==='mail')     initMailTab();
}

// ══════════════════════════════════════════════════════════════
//  OPTIONS CODAGE — sélection client/véhicule + envoi email du
//  catalogue de codages (codages-data.js) correspondant au modèle.
// ══════════════════════════════════════════════════════════════
var _codageClient = null;
var _codageVehs = [];
var _codageVeh = null;
var _codageModelKey = null;

function initCodageTab() {
  $('codage-client-results').style.display = 'none';
}

function normCodageStr(s) {
  return (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function renderCodageClientResults() {
  var q = normCodageStr($('codage-client-search').value);
  var box = $('codage-client-results');
  if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
  var matches = loadClients().filter(function(c) {
    var hay = normCodageStr([c.nom, c.tel, c.email, c.vm, c.vmo, c.vim].join(' '));
    return hay.indexOf(q) >= 0;
  }).slice(0, 15);
  box.style.display = 'block';
  box.innerHTML = matches.length ? matches.map(function(c) {
    var veh = (c.vehs && c.vehs[0]) ? (c.vehs[0].vm + ' ' + c.vehs[0].vmo) : (c.vm ? (c.vm + ' ' + c.vmo) : '');
    return '<div class="search-result-item" onclick="pickCodageClient(' + c.id + ')">'
      + '<div style="font-weight:600;font-size:13px">' + escHtml(c.nom) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim)">' + escHtml(veh || 'Aucun véhicule enregistré') + '</div>'
      + '</div>';
  }).join('') : '<div style="padding:12px;font-size:12.5px;color:var(--text-muted)">Aucun client trouvé.</div>';
}

function pickCodageClient(id) {
  var cl = loadClients().find(function(c) { return c.id === id; });
  if (!cl) return;
  _codageClient = cl;
  $('codage-client-results').style.display = 'none';
  $('codage-client-search').value = '';
  $('codage-client-picked').style.display = 'block';
  $('codage-client-picked-name').textContent = cl.nom + (cl.email ? ' — ' + cl.email : '');

  _codageVehs = (cl.vehs && cl.vehs.length) ? cl.vehs : (cl.vm ? [{ vm: cl.vm, vmo: cl.vmo, vmot: cl.vmot, van: cl.van, vim: cl.vim }] : []);
  var vehRow = $('codage-veh-row'), vehSel = $('codage-veh-select');
  if (_codageVehs.length) {
    vehSel.innerHTML = _codageVehs.map(function(v, i) {
      return '<option value="' + i + '">' + escHtml([v.vm, v.vmo, v.van ? '(' + v.van + ')' : ''].filter(Boolean).join(' ') || 'Véhicule ' + (i + 1)) + '</option>';
    }).join('');
    vehRow.style.display = 'block';
    vehSel.selectedIndex = 0;
    onCodageVehChange();
  } else {
    vehRow.style.display = 'none';
    _codageVeh = null;
    $('codage-model-card').style.display = 'block';
    populateCodageModelSelect(null);
    $('codage-options-card').style.display = 'block';
    $('codage-send-card').style.display = 'block';
    renderCodageOptions();
    prefillCodageSend();
  }
}

function resetCodageClient() {
  _codageClient = null; _codageVeh = null; _codageVehs = [];
  $('codage-client-picked').style.display = 'none';
  $('codage-veh-row').style.display = 'none';
  $('codage-model-card').style.display = 'none';
  $('codage-options-card').style.display = 'none';
  $('codage-send-card').style.display = 'none';
  $('codage-client-search').value = '';
  $('codage-client-search').focus();
}

function onCodageVehChange() {
  var i = Number($('codage-veh-select').value || 0);
  _codageVeh = _codageVehs[i] || null;
  $('codage-immat').value = (_codageVeh && _codageVeh.vim) || '';
  $('codage-finition').value = (_codageVeh && _codageVeh.vmot) ? (_codageVeh.vmot + (_codageVeh.van ? ' / ' + _codageVeh.van : '')) : ((_codageVeh && _codageVeh.van) || '');

  $('codage-model-card').style.display = 'block';
  $('codage-options-card').style.display = 'block';
  $('codage-send-card').style.display = 'block';
  populateCodageModelSelect(matchCodageModel(_codageVeh));
  renderCodageOptions();
  prefillCodageSend();
}

// Rapprochement marque/modèle libre (champ texte du carnet clients) avec
// une clé du catalogue codages-data.js : comparaison par mots-clés normalisés
// (accents/casse ignorés), pas de liste de marques figée côté app.
function matchCodageModel(veh) {
  var cat = window.CODAGES_CATALOGUE || {};
  var hay = normCodageStr(veh ? [veh.vm, veh.vmo].join(' ') : '');
  if (!hay) return null;
  var best = null, bestScore = 0;
  Object.keys(cat).forEach(function(key) {
    var m = cat[key];
    var needle = normCodageStr([m.marque, m.modele, key.replace(/-/g, ' ')].join(' '));
    var words = needle.split(' ').filter(function(w) { return w.length > 1; });
    var score = words.reduce(function(s, w) { return s + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0);
    if (score > bestScore) { bestScore = score; best = key; }
  });
  return bestScore > 0 ? best : null;
}

function populateCodageModelSelect(preselectKey) {
  var cat = window.CODAGES_CATALOGUE || {};
  var sel = $('codage-model-select');
  var keys = Object.keys(cat);
  sel.innerHTML = '<option value="">— Choisir un modèle —</option>' + keys.map(function(k) {
    var m = cat[k];
    return '<option value="' + k + '">' + escHtml(m.marque + ' ' + m.modele + ' (' + m.periode + ')') + '</option>';
  }).join('');
  sel.value = preselectKey || '';
  _codageModelKey = sel.value || null;
}

var FAISABILITE_LABELS = { OUI: 'OUI', COND: 'SOUS CONDITION', RETROFIT: 'RETROFIT', ENTRETIEN: 'ENTRETIEN' };
var FAISABILITE_COLORS = {
  OUI:       { bg: '#dcfce7', fg: '#0b7a52' },
  COND:      { bg: '#fef3c7', fg: '#92610a' },
  RETROFIT:  { bg: '#dbeafe', fg: '#1d4ed8' },
  ENTRETIEN: { bg: '#e5e7eb', fg: '#374151' },
};

function renderCodageOptions() {
  var key = $('codage-model-select').value;
  _codageModelKey = key || null;
  var box = $('codage-cats');
  var m = key && window.CODAGES_CATALOGUE ? window.CODAGES_CATALOGUE[key] : null;
  if (!m) { box.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Choisis un modèle de catalogue ci-dessus.</p>'; return; }

  box.innerHTML = m.categories.map(function(cat, ci) {
    var rows = cat.items.map(function(it, ii) {
      var col = FAISABILITE_COLORS[it.faisabilite] || FAISABILITE_COLORS.OUI;
      var id = 'codage-chk-' + ci + '-' + ii;
      return '<label style="display:grid;grid-template-columns:20px 1fr 130px;gap:10px;align-items:start;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer">'
        + '<input type="checkbox" id="' + id + '" checked style="margin-top:3px"/>'
        + '<span><span style="font-size:13px;color:var(--text)">' + escHtml(it.option) + '</span>'
        + '<span style="display:block;font-size:11.5px;color:var(--text-dim);margin-top:2px">' + escHtml(it.prerequis) + '</span></span>'
        + '<span style="justify-self:start;font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:20px;background:' + col.bg + ';color:' + col.fg + ';white-space:nowrap">' + FAISABILITE_LABELS[it.faisabilite] + '</span>'
        + '</label>';
    }).join('');
    return '<div style="margin-bottom:14px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 4px">'
        + '<div style="font-size:13.5px;font-weight:700;color:var(--text)">' + escHtml(cat.nom) + ' <span style="color:var(--text-muted);font-weight:400">(' + cat.items.length + ')</span></div>'
        + '<div style="display:flex;gap:6px">'
          + '<button type="button" class="btn-s btn-sm" onclick="setCatCodageChecks(' + ci + ',true)">Tout</button>'
          + '<button type="button" class="btn-s btn-sm" onclick="setCatCodageChecks(' + ci + ',false)">Aucun</button>'
        + '</div>'
      + '</div>'
      + rows
    + '</div>';
  }).join('');
}

function setAllCodageChecks(val) {
  document.querySelectorAll('#codage-cats input[type=checkbox]').forEach(function(cb) { cb.checked = val; });
}
function setCatCodageChecks(ci, val) {
  document.querySelectorAll('#codage-cats input[id^="codage-chk-' + ci + '-"]').forEach(function(cb) { cb.checked = val; });
}

function prefillCodageSend() {
  var m = _codageModelKey && window.CODAGES_CATALOGUE ? window.CODAGES_CATALOGUE[_codageModelKey] : null;
  $('codage-to-email').value = (_codageClient && _codageClient.email) || '';
  $('codage-subject').value = 'Vos options de codage — ' + (m ? (m.marque + ' ' + m.modele) : 'votre véhicule') + ' — AREPROG';
  $('codage-message').value = 'Bonjour ' + ((_codageClient && _codageClient.nom) ? _codageClient.nom.split(' ')[0] : '') + ',\n\n'
    + 'Voici la liste des options personnalisables par codage sur votre véhicule, avec leur faisabilité et les prérequis éventuels. '
    + 'Cochez celles qui vous intéressent sur le document et faites-le nous savoir pour un devis.\n\n'
    + 'Cordialement, AREPROG';
  $('codage-send-status').style.display = 'none';
  $('codage-send-btn').disabled = false;
  $('codage-send-btn').textContent = '📧 Envoyer';
}

// Construit le document imprimable (capturé par html2canvas) à partir des
// lignes cochées uniquement.
function buildCodagePreviewHtml() {
  var m = window.CODAGES_CATALOGUE[_codageModelKey];
  var selectedCats = [];
  var counts = { OUI: 0, COND: 0, RETROFIT: 0, ENTRETIEN: 0 };
  m.categories.forEach(function(cat, ci) {
    var items = [];
    cat.items.forEach(function(it, ii) {
      var cb = $('codage-chk-' + ci + '-' + ii);
      if (cb && cb.checked) { items.push(it); counts[it.faisabilite]++; }
    });
    if (items.length) selectedCats.push({ nom: cat.nom, items: items });
  });
  var total = counts.OUI + counts.COND + counts.RETROFIT + counts.ENTRETIEN;

  var row = function(label, val) { return val ? '<tr><td style="padding:3px 0;color:#6b7280;font-size:12px">' + label + '</td><td style="padding:3px 0;font-size:12px;font-weight:600;color:#111">' + escHtml(val) + '</td></tr>' : ''; };

  var legend = [
    ['OUI', 'Codage simple, réalisable sans équipement optionnel requis.'],
    ['COND', 'Réalisable uniquement si le véhicule possède l’équipement précisé dans « Prérequis précis ».'],
    ['RETROFIT', 'Nécessite l’installation préalable d’une pièce physique. Le codage active la pièce une fois montée.'],
    ['ENTRETIEN', 'Procédure d’atelier/diagnostic liée à une intervention mécanique, pas une option de personnalisation.'],
  ].map(function(l) {
    var col = FAISABILITE_COLORS[l[0]];
    return '<tr><td style="padding:4px 8px;font-size:11px;font-weight:700;background:' + col.bg + ';color:' + col.fg + ';border-radius:4px;white-space:nowrap;vertical-align:top">' + FAISABILITE_LABELS[l[0]] + '</td><td style="padding:4px 0 4px 10px;font-size:11.5px;color:#374151">' + l[1] + '</td></tr>';
  }).join('');

  var catsHtml = selectedCats.map(function(cat) {
    var rows = cat.items.map(function(it) {
      var col = FAISABILITE_COLORS[it.faisabilite];
      return '<tr>'
        + '<td style="padding:6px 8px;font-size:11.5px;color:#111;border-bottom:1px solid #eef0f2">' + escHtml(it.option) + '</td>'
        + '<td style="padding:6px 8px;font-size:10.5px;font-weight:700;color:' + col.fg + ';background:' + col.bg + ';white-space:nowrap;border-bottom:1px solid #eef0f2">' + FAISABILITE_LABELS[it.faisabilite] + '</td>'
        + '<td style="padding:6px 8px;font-size:11px;color:#4b5563;border-bottom:1px solid #eef0f2">' + escHtml(it.prerequis) + '</td>'
        + '</tr>';
    }).join('');
    return '<div style="margin:16px 0 8px;font-size:14px;font-weight:700;color:#111">' + escHtml(cat.nom) + ' (' + cat.items.length + ')</div>'
      + '<table style="width:100%;border-collapse:collapse"><thead><tr>'
        + '<th style="text-align:left;padding:5px 8px;font-size:10.5px;color:#6b7280;border-bottom:1px solid #d1d5db">Option</th>'
        + '<th style="text-align:left;padding:5px 8px;font-size:10.5px;color:#6b7280;border-bottom:1px solid #d1d5db">Faisabilité</th>'
        + '<th style="text-align:left;padding:5px 8px;font-size:10.5px;color:#6b7280;border-bottom:1px solid #d1d5db">Prérequis précis</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }).join('');

  var html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#111;padding:0">'
    + '<h1 style="font-size:22px;margin:0 0 4px">' + escHtml(m.marque + ' ' + m.modele) + ' — Liste des codages et faisabilité</h1>'
    + '<div style="font-size:12.5px;color:#6b7280;margin-bottom:14px">' + escHtml(m.sousTitre) + '</div>'
    + '<table style="margin-bottom:16px">' + row('Date', fmtDate(today())) + row('Client', (_codageClient && _codageClient.nom) || '') + row('Immatriculation', $('codage-immat').value) + row('Finition / année', $('codage-finition').value) + '</table>'
    + '<div style="font-size:13px;font-weight:700;margin-bottom:6px">Comment lire ce document</div>'
    + '<p style="font-size:11.5px;color:#374151;line-height:1.6;margin:0 0 10px">Chaque option est classée selon sa faisabilité sur votre véhicule. Les codages se font par la prise OBD avec un outil officiel (VCDS, OBDeleven ou VCP), après sauvegarde complète des calculateurs concernés. Aucune pièce n’est modifiée sauf mention « Retrofit ».</p>'
    + '<table style="width:100%;border-collapse:collapse;margin-bottom:12px">' + legend + '</table>'
    + '<div style="background:#f9fafb;border:1px solid #eef0f2;border-radius:8px;padding:10px 14px;font-size:12px;color:#374151;margin-bottom:6px">'
      + '<b>Récapitulatif :</b> ' + total + ' option(s) sélectionnée(s) — ' + counts.OUI + ' réalisable(s) directement, ' + counts.COND + ' sous condition d’équipement, ' + counts.RETROFIT + ' avec pièce à ajouter, ' + counts.ENTRETIEN + ' procédure(s) d’entretien.'
    + '</div>'
    + catsHtml
    + '<div style="margin-top:22px;padding-top:14px;border-top:1px solid #eef0f2;font-size:10.5px;color:#6b7280;line-height:1.7">'
      + '• La faisabilité définitive est confirmée après lecture des calculateurs du véhicule (équipements, versions logicielles).<br/>'
      + '• Certains codages liés à l’éclairage doivent respecter la réglementation du pays d’immatriculation ; le client en assume la responsabilité.<br/>'
      + '• Une sauvegarde complète des valeurs d’origine est effectuée avant toute intervention ; chaque codage reste réversible.<br/>'
      + '• ' + escHtml(m.source)
    + '</div>'
    + '<div style="margin-top:28px;font-size:11.5px;color:#374151">Signature client : ______________________________ &nbsp;&nbsp; Date : ______________</div>'
  + '</div>';

  $('codage-preview').innerHTML = html;
  return { total: total };
}

// La liste de codages peut faire plusieurs dizaines de lignes (donc
// plusieurs pages A4), bien plus long que les devis/factures habituels —
// on réessaie donc à une résolution/qualité JPEG décroissante jusqu'à
// repasser sous la limite du serveur (send-email.js : 4 Mo en base64 par
// pièce jointe), plutôt que d'imposer d'office une qualité basse à tout
// le monde (le rendu par défaut de generatePdfBase64 reste inchangé pour
// les devis/factures).
var CODAGE_PDF_ATTEMPTS = [
  { scale: 2,    quality: 0.92 },
  { scale: 1.5,  quality: 0.82 },
  { scale: 1.15, quality: 0.65 },
  { scale: 0.85, quality: 0.5 },
];
var CODAGE_MAX_PDF_B64 = 4 * 1024 * 1024;

async function generateCodagePdfBase64() {
  var last;
  for (var i = 0; i < CODAGE_PDF_ATTEMPTS.length; i++) {
    last = await generatePdfBase64('codage-preview', CODAGE_PDF_ATTEMPTS[i]);
    if (last.length <= CODAGE_MAX_PDF_B64) return last;
  }
  throw new Error('Le PDF généré est trop volumineux pour être envoyé par email même en qualité réduite (~' + Math.round(last.length / 1024 / 1024 * 0.75) + ' Mo). Décoche des lignes ou des catégories entières, puis réessaie.');
}

async function previewCodagePdf() {
  if (!_codageModelKey) { alert('Choisis d’abord un modèle de catalogue.'); return; }
  buildCodagePreviewHtml();
  var b64 = await generateCodagePdfBase64();
  var bin = atob(b64);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  var blob = new Blob([bytes], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob), '_blank');
}

function buildCodageEmailHtml(tpl, message) {
  var color = /^#[0-9a-fA-F]{6}$/.test(tpl.color) ? tpl.color : '#2196F3';
  return '<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
    + '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
      + '<div style="background:' + color + ';padding:22px 28px">'
        + '<div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">' + escHtml(tpl.nom || 'AREPROG') + '</div>'
        + (tpl.activite ? '<div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px">' + escHtml(tpl.activite) + '</div>' : '')
      + '</div>'
      + '<div style="padding:26px 28px">'
        + '<p style="margin:0 0 18px;font-size:14px;color:#111;line-height:1.6">' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
        + '<p style="margin:0;font-size:13px;color:#374151">📎 Vous trouverez la liste complète en pièce jointe, au format PDF.</p>'
      + '</div>'
      + '<div style="background:#f9fafb;border-top:1px solid #eef0f2;padding:16px 28px;font-size:11px;color:#9ca3af;line-height:1.7">'
        + escHtml(tpl.footer || '').replace(/\n/g, '<br>')
      + '</div>'
    + '</div>'
  + '</div>';
}

async function confirmSendCodageEmail() {
  var toEmail = $('codage-to-email').value.trim();
  if (!toEmail || !toEmail.includes('@')) { showCodageSendStatus('error', 'Email invalide.'); return; }
  var subject = $('codage-subject').value.trim();
  if (!subject) { showCodageSendStatus('error', 'L’objet du mail est obligatoire.'); return; }
  if (!_codageModelKey) { showCodageSendStatus('error', 'Choisis d’abord un modèle de catalogue.'); return; }

  var btn = $('codage-send-btn');
  btn.disabled = true;
  btn.textContent = 'Génération PDF…';

  try {
    var m = window.CODAGES_CATALOGUE[_codageModelKey];
    var info = buildCodagePreviewHtml();
    if (!info.total) throw new Error('Aucune option cochée : sélectionne au moins une ligne à envoyer.');
    var pdfB64 = await generateCodagePdfBase64();

    var filename = 'Options-codage-' + m.marque + '-' + m.modele.replace(/[^a-zA-Z0-9]+/g, '-') + '.pdf';
    btn.textContent = 'Envoi en cours…';
    var tpl = loadTemplate();
    var html = buildCodageEmailHtml(tpl, $('codage-message').value);
    await envoyerEmail(toEmail, subject, html, NOTIF_EMAIL, [{ filename: filename, content: pdfB64 }]);

    showCodageSendStatus('success', 'Email envoyé à ' + toEmail + ' ✓');
    btn.textContent = '✓ Envoyé !';
    showNotifBanner('📧', 'Liste de codages envoyée !', m.marque + ' ' + m.modele + ' → ' + toEmail);
    setTimeout(function() { prefillCodageSend(); }, 2000);
  } catch (e) {
    console.error('Envoi email codage:', e);
    var msg = e.text || e.message || 'Réessaie.';
    if (/load failed|failed to fetch|networkerror/i.test(msg)) msg = 'Connexion au serveur interrompue pendant l’envoi. Réessaie ; si ça persiste, décoche quelques lignes pour réduire la taille du PDF.';
    showCodageSendStatus('error', 'Erreur : ' + msg);
    btn.disabled = false;
    btn.textContent = '📧 Envoyer';
  }
}

function showCodageSendStatus(type, msg) {
  var el = $('codage-send-status');
  el.style.display = 'block';
  el.style.background = type === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)';
  el.style.color = type === 'success' ? 'var(--green)' : 'var(--red)';
  el.style.border = '1px solid ' + (type === 'success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)');
  el.textContent = msg;
}

// ══════════════════════════════════════════════════════════════
//  MAIL — envoi email libre à un client (documents/photos/vidéos
//  liés + modèles prédéfinis), via la fonction générique envoyerEmail.
// ══════════════════════════════════════════════════════════════
var _mailClient = null;

function vehLabelShort(v) {
  if (!v) return '';
  return [v.vm, v.vmo, v.van ? '(' + v.van + ')' : ''].filter(Boolean).join(' ');
}
function mailSalutation(cl) {
  var prenom = ((cl && cl.nom) || '').trim().split(/\s+/)[0] || '';
  return 'Bonjour' + (prenom ? ' ' + prenom : '') + ',';
}
function mailSignature(tpl) {
  var contact = [tpl.tel, tpl.web].filter(Boolean).join(' · ');
  return 'Cordialement,\n' + (tpl.nom || 'AREPROG') + (contact ? '\n' + contact : '');
}

// Modèles de message prédéfinis : chaque entrée génère objet + corps à
// partir du client / véhicule sélectionné et des coordonnées de l'atelier
// (onglet Template). Reste modifiable avant l'envoi.
var MAIL_TEMPLATES = [
  {
    id: 'documents', label: '📎 Envoi de documents / photos',
    subject: function(cl, veh, tpl) { return (tpl.nom || 'AREPROG') + ' — Documents' + (veh ? ' — ' + vehLabelShort(veh) : ''); },
    message: function(cl, veh, tpl) {
      return mailSalutation(cl) + '\n\n'
        + 'Vous trouverez ci-joint les documents' + (veh ? ' concernant votre ' + vehLabelShort(veh) : '') + '.\n\n'
        + 'N\'hésitez pas à revenir vers nous pour toute question.\n\n'
        + mailSignature(tpl);
    }
  },
  {
    id: 'diagnostic', label: '🔍 Photos/vidéos du diagnostic',
    subject: function(cl, veh, tpl) { return (tpl.nom || 'AREPROG') + ' — Diagnostic' + (veh ? ' — ' + vehLabelShort(veh) : ''); },
    message: function(cl, veh, tpl) {
      return mailSalutation(cl) + '\n\n'
        + 'Suite à notre intervention sur votre' + (veh ? ' ' + vehLabelShort(veh) : ' véhicule') + ', vous trouverez ci-joint les photos/vidéos de l\'anomalie constatée.\n\n'
        + 'N\'hésitez pas à nous contacter pour toute question ou pour convenir d\'un rendez-vous.\n\n'
        + mailSignature(tpl);
    }
  },
  {
    id: 'relance', label: '📄 Relance devis',
    subject: function(cl, veh, tpl) {
      var d = mailLatestDevis(cl);
      return (tpl.nom || 'AREPROG') + ' — Suivi de votre devis' + (d && d.num ? ' ' + d.num : '');
    },
    message: function(cl, veh, tpl) {
      var d = mailLatestDevis(cl);
      var ref = d ? ' ' + (d.num || '') + (d.ttc ? ', d\'un montant de ' + fmt(d.ttc) : '') + (d.ech ? ' (valable jusqu\'au ' + fmtDate(d.ech) + ')' : '') : '';
      return mailSalutation(cl) + '\n\n'
        + 'Nous revenons vers vous concernant le devis' + ref + ' que nous vous avons transmis' + (veh ? ' pour votre ' + vehLabelShort(veh) : '') + '.\n\n'
        + 'N\'hésitez pas à nous contacter si vous avez des questions, ou pour convenir ensemble d\'un créneau à l\'atelier.'
        + (d ? ' Vous trouverez ci-dessus le devis correspondant, accessible depuis la liste « Devis / factures / OdR » de cet onglet si vous souhaitez le renvoyer.' : '') + '\n\n'
        + mailSignature(tpl);
    }
  },
  {
    id: 'rappel-rdv', label: '📅 Rappel de rendez-vous',
    subject: function(cl, veh, tpl) { return (tpl.nom || 'AREPROG') + ' — Rappel de votre rendez-vous'; },
    message: function(cl, veh, tpl) {
      return mailSalutation(cl) + '\n\n'
        + 'Nous vous confirmons votre rendez-vous à l\'atelier' + (veh ? ' pour votre ' + vehLabelShort(veh) : '') + '.\n\n'
        + 'Merci de nous prévenir au plus vite en cas d\'empêchement.\n\n'
        + mailSignature(tpl);
    }
  },
  {
    id: 'merci', label: '🙏 Merci pour votre visite',
    subject: function(cl, veh, tpl) { return (tpl.nom || 'AREPROG') + ' — Merci pour votre visite'; },
    message: function(cl, veh, tpl) {
      return mailSalutation(cl) + '\n\n'
        + 'Merci pour votre confiance suite à l\'intervention réalisée sur votre' + (veh ? ' ' + vehLabelShort(veh) : ' véhicule') + '.\n\n'
        + 'N\'hésitez pas à revenir vers nous pour toute question, nous restons à votre disposition.\n\n'
        + mailSignature(tpl);
    }
  },
  {
    id: 'suivi-repro', label: '⚙️ Suivi après reprogrammation',
    subject: function(cl, veh, tpl) { return (tpl.nom || 'AREPROG') + ' — Suivi de votre reprogrammation'; },
    message: function(cl, veh, tpl) {
      return mailSalutation(cl) + '\n\n'
        + 'Nous espérons que votre' + (veh ? ' ' + vehLabelShort(veh) : ' véhicule') + ' vous donne pleinement satisfaction depuis la reprogrammation réalisée à l\'atelier.\n\n'
        + 'N\'hésitez pas à nous faire un retour ou à nous contacter en cas de besoin.\n\n'
        + mailSignature(tpl);
    }
  },
];

function initMailTab() {
  var sel = $('mail-template-select');
  if (sel && !sel.options.length) {
    sel.innerHTML = '<option value="">— Message personnalisé —</option>' + MAIL_TEMPLATES.map(function(t) {
      return '<option value="' + t.id + '">' + escHtml(t.label) + '</option>';
    }).join('');
  }
}

function renderMailClientResults() {
  var q = normCodageStr($('mail-client-search').value);
  var box = $('mail-client-results');
  if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
  var matches = loadClients().filter(function(c) {
    var hay = normCodageStr([c.nom, c.tel, c.email, c.vm, c.vmo, c.vim].join(' '));
    return hay.indexOf(q) >= 0;
  }).slice(0, 15);
  box.style.display = 'block';
  box.innerHTML = matches.length ? matches.map(function(c) {
    var veh = (c.vehs && c.vehs[0]) ? (c.vehs[0].vm + ' ' + c.vehs[0].vmo) : (c.vm ? (c.vm + ' ' + c.vmo) : '');
    return '<div class="search-result-item" onclick="pickMailClient(' + c.id + ')">'
      + '<div style="font-weight:600;font-size:13px">' + escHtml(c.nom) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim)">' + escHtml(veh || 'Aucun véhicule enregistré') + (c.email ? ' · ' + escHtml(c.email) : '') + '</div>'
      + '</div>';
  }).join('') : '<div style="padding:12px;font-size:12.5px;color:var(--text-muted)">Aucun client trouvé.</div>';
}

function mailVehs() {
  var cl = _mailClient;
  if (!cl) return [];
  return (cl.vehs && cl.vehs.length) ? cl.vehs
    : (cl.vm ? [{ vm: cl.vm, vmo: cl.vmo || '', van: cl.van || '', photos: cl.photos || [], videos: cl.videos || [] }] : []);
}

function pickMailClient(id) {
  var cl = loadClients().find(function(c) { return c.id === id; });
  if (!cl) return;
  _mailClient = cl;
  $('mail-client-results').style.display = 'none';
  $('mail-client-search').value = '';
  $('mail-client-picked').style.display = 'block';
  $('mail-client-picked-name').textContent = cl.nom + (cl.email ? ' — ' + cl.email : '');

  var lastInfo = $('mail-last-info');
  if (cl.lastEmailAt) {
    lastInfo.textContent = '✉️ Dernier email envoyé le ' + new Date(cl.lastEmailAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' à ' + (cl.lastEmailTo || '');
    lastInfo.style.display = 'block';
  } else {
    lastInfo.style.display = 'none';
  }

  $('mail-files-card').style.display = 'block';
  $('mail-msg-card').style.display = 'block';
  renderMailVehSelect();
  renderMailFiles();
  $('mail-to-email').value = cl.email || '';
  $('mail-template-select').value = '';
  $('mail-subject').value = '';
  $('mail-message').value = '';
  $('mail-send-status').style.display = 'none';
  $('mail-send-btn').disabled = false;
  $('mail-send-btn').textContent = '📧 Envoyer';
}

function resetMailClient() {
  _mailClient = null;
  $('mail-client-picked').style.display = 'none';
  $('mail-files-card').style.display = 'none';
  $('mail-msg-card').style.display = 'none';
  $('mail-client-search').value = '';
  $('mail-client-search').focus();
}

function renderMailVehSelect() {
  var vehs = mailVehs();
  var row = $('mail-veh-row'), sel = $('mail-veh-select');
  if (vehs.length > 1) {
    sel.innerHTML = '<option value="">— Aucun véhicule spécifique —</option>' + vehs.map(function(v, i) {
      return '<option value="' + i + '">' + escHtml(vehLabelShort(v) || ('Véhicule ' + (i + 1))) + '</option>';
    }).join('');
    row.style.display = 'block';
  } else {
    row.style.display = 'none';
    sel.innerHTML = '';
  }
}

function mailSelectedVeh() {
  var vehs = mailVehs();
  if (!vehs.length) return null;
  if (vehs.length === 1) return vehs[0];
  var sel = $('mail-veh-select');
  var i = sel && sel.value !== '' ? Number(sel.value) : -1;
  return i >= 0 ? vehs[i] : null;
}

function applyMailTemplate() {
  var id = $('mail-template-select').value;
  if (!id || !_mailClient) return;
  var t = MAIL_TEMPLATES.find(function(m) { return m.id === id; });
  if (!t) return;
  var tpl = loadTemplate();
  var veh = mailSelectedVeh();
  $('mail-subject').value = t.subject(_mailClient, veh, tpl);
  $('mail-message').value = t.message(_mailClient, veh, tpl);
}

// Liste des fichiers rattachés au client (documents divers + photos/vidéos
// de chacun de ses véhicules) avec une case à cocher par fichier — mêmes
// URLs Firebase Storage que dans l'historique client (showClientHistory).
// Devis/factures/ordres de réparation du client (même rapprochement par nom
// que showClientHistory/clientDocsFor), du plus récent au plus ancien.
function mailDocsFor(cl) {
  return loadDocs().filter(function(d) { return (d.cn || '').trim().toLowerCase() === (cl.nom || '').trim().toLowerCase(); })
    .sort(function(a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
}

// Devis non annulé le plus récent du client — utilisé pour personnaliser le
// modèle « Relance devis » (référence, montant, validité réels).
function mailLatestDevis(cl) {
  return mailDocsFor(cl).find(function(d) { return d.type === 'devis' && d.statut !== 'annulé'; }) || null;
}

// RDVs liés au client (agenda), du plus ancien au plus récent.
function mailRdvsFor(cl) {
  return loadRdvs().filter(function(r) { return r.clientId === cl.id; })
    .sort(function(a, b) { return (String(a.date || '') + (a.heure || '')).localeCompare(String(b.date || '') + (b.heure || '')); });
}

function renderMailFiles() {
  var cl = _mailClient;
  var box = $('mail-files-list');
  var empty = $('mail-files-empty');
  var html = '';

  var docs = mailDocsFor(cl);
  if (docs.length) {
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin:0 0 8px">🧾 Devis / factures / ordres de réparation</div>';
    html += docs.map(function(d) {
      var typeBadge = d.type === 'devis' ? '<span class="badge b-devis">Devis</span>' : d.type === 'ordre' ? '<span class="badge b-ordre">OdR</span>' : '<span class="badge b-facture">Facture</span>';
      var statBadge = d.statut === 'payé' ? '<span class="badge b-paye">Payé ✓</span>'
        : d.statut === 'annulé' ? '<span class="badge b-annule">Annulé</span>'
        : d.statut === 'créé' ? '<span class="badge b-cree">📝 Créé</span>'
        : '<span style="color:var(--text-dim);font-size:11px">' + escHtml(d.statut || '') + '</span>';
      return '<div class="veh-doc" style="flex-wrap:wrap">'
        + typeBadge
        + '<span style="flex:1;min-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(d.num || '') + ' — ' + fmtDate(d.date) + '</span>'
        + '<span style="font-family:var(--fm);color:var(--blue);font-size:12px">' + fmt(d.ttc || 0) + '</span>'
        + statBadge
        + '<button type="button" class="btn-s btn-sm" onclick="previewDoc(' + d.id + ')">👁 Aperçu &amp; envoi</button>'
        + '</div>';
    }).join('');
  }

  if (cl.documents && cl.documents.length) {
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin:0 0 8px">📎 Documents du client</div>';
    html += cl.documents.map(function(d) {
      var isPdf = String(d.name || '').toLowerCase().endsWith('.pdf');
      return '<label class="veh-doc" style="cursor:pointer">'
        + '<input type="checkbox" class="mail-file-cb" data-url="' + escHtml(d.url) + '" data-name="' + escHtml(d.name || 'document') + '" style="margin:0"/>'
        + '<span>' + (isPdf ? '📄' : '🖼️') + '</span>'
        + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(d.name || 'fichier') + '</span>'
        + '<span style="color:var(--text-muted);font-size:11px">' + escHtml(CLIENT_DOC_TYPES[d.type] || 'Autre') + '</span>'
        + '</label>';
    }).join('');
  }

  mailVehs().forEach(function(v, vi) {
    var hasMedia = (v.photos && v.photos.length) || (v.videos && v.videos.length);
    if (!hasMedia) return;
    var label = vehLabelShort(v) || ('Véhicule ' + (vi + 1));
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin:16px 0 8px">🚗 ' + escHtml(label) + '</div>';
    if (v.photos && v.photos.length) {
      html += '<div class="veh-media" style="margin-bottom:8px">' + v.photos.map(function(p) {
        return '<label style="position:relative;display:inline-block;width:78px;height:58px;border-radius:6px;overflow:hidden;border:1px solid var(--border);cursor:pointer;background:var(--bg3) center/cover no-repeat;background-image:url(\'' + escHtml(p.url) + '\')" title="' + escHtml(p.name || '') + '">'
          + '<input type="checkbox" class="mail-file-cb" data-url="' + escHtml(p.url) + '" data-name="' + escHtml(p.name || 'photo.jpg') + '" style="position:absolute;top:4px;left:4px;width:16px;height:16px;margin:0"/>'
          + '</label>';
      }).join('') + '</div>';
    }
    if (v.videos && v.videos.length) {
      html += v.videos.map(function(vd) {
        return '<label class="veh-doc" style="cursor:pointer">'
          + '<input type="checkbox" class="mail-file-cb" data-url="' + escHtml(vd.url) + '" data-name="' + escHtml(vd.name || 'video.mp4') + '" style="margin:0"/>'
          + '<span>🎥</span>'
          + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(vd.name || 'vidéo') + '</span>'
          + '</label>';
      }).join('');
    }
  });

  var rdvs = mailRdvsFor(cl);
  if (rdvs.length) {
    var now = new Date();
    html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin:16px 0 8px">📅 Rendez-vous liés</div>';
    html += rdvs.map(function(r) {
      var futur = new Date(r.date + 'T' + (r.heure || '23:59')) >= now;
      return '<div class="veh-doc" style="flex-wrap:wrap">'
        + '<span>' + (futur ? '🟢' : '⚪') + '</span>'
        + '<span style="flex:1;min-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(r.title || 'Rendez-vous') + ' — ' + fmtDate(r.date) + (r.heure ? ' à ' + escHtml(r.heure) : '') + (r.lieu ? ' · ' + escHtml(r.lieu) : '') + '</span>'
        + '<button type="button" class="btn-s btn-sm" onclick="insertMailRdvLine(\'' + r.id + '\')">✏️ Insérer</button>'
        + '</div>';
    }).join('');
  }

  box.innerHTML = html;
  empty.style.display = html ? 'none' : 'block';
}

// Ajoute la ligne d'un rendez-vous dans le message en cours de rédaction
// (ex. pour un rappel de RDV manuel, avec la vraie date/heure/lieu).
function insertMailRdvLine(rdvId) {
  var rdv = loadRdvs().find(function(r) { return String(r.id) === String(rdvId); });
  if (!rdv) return;
  var line = '📅 Rendez-vous : ' + (rdv.title || 'Rendez-vous') + ' le ' + fmtDate(rdv.date) + (rdv.heure ? ' à ' + rdv.heure : '') + (rdv.lieu ? ' — ' + rdv.lieu : '');
  var ta = $('mail-message');
  ta.value = ta.value ? (ta.value.replace(/\s+$/, '') + '\n\n' + line + '\n') : (line + '\n');
  ta.focus();
}

function setAllMailFileChecks(val) {
  document.querySelectorAll('#mail-files-list .mail-file-cb').forEach(function(cb) { cb.checked = val; });
}

// Nom de pièce jointe compatible avec le filtre du serveur (send-email.js :
// lettres/chiffres/espaces/._- uniquement) — même nettoyage que pour les
// uploads (safeUploadName), en conservant l'extension d'origine du fichier.
function safeAttachName(name) {
  var m = /\.([a-zA-Z0-9]{1,5})$/.exec(name || '');
  var ext = m ? m[1].toLowerCase() : 'bin';
  return safeUploadName(name, ext);
}

function buildMailHtml(cl, tpl, message) {
  var color = /^#[0-9a-fA-F]{6}$/.test(tpl.color) ? tpl.color : '#2196F3';
  return '<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
    + '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
      + '<div style="background:' + color + ';padding:22px 28px">'
        + '<div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">' + escHtml(tpl.nom || 'AREPROG') + '</div>'
        + (tpl.activite ? '<div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px">' + escHtml(tpl.activite) + '</div>' : '')
      + '</div>'
      + '<div style="padding:26px 28px">'
        + '<p style="margin:0;font-size:14px;color:#111;line-height:1.6">' + escHtml(message).replace(/\n/g, '<br>') + '</p>'
      + '</div>'
      + '<div style="background:#f9fafb;border-top:1px solid #eef0f2;padding:16px 28px;font-size:11px;color:#9ca3af;line-height:1.7">'
        + escHtml(tpl.footer || '').replace(/\n/g, '<br>')
      + '</div>'
    + '</div>'
  + '</div>';
}

async function confirmSendMail() {
  var cl = _mailClient;
  if (!cl) return;
  var toEmail = $('mail-to-email').value.trim();
  if (!toEmail || !toEmail.includes('@')) { showMailStatus('error', 'Email invalide.'); return; }
  var subject = $('mail-subject').value.trim();
  if (!subject) { showMailStatus('error', 'L\'objet du mail est obligatoire.'); return; }
  var message = $('mail-message').value.trim();
  if (!message) { showMailStatus('error', 'Le message ne peut pas être vide.'); return; }

  var checked = Array.prototype.slice.call(document.querySelectorAll('#mail-files-list .mail-file-cb:checked'));
  var MAX_FILES = 8;
  if (checked.length > MAX_FILES) {
    showMailStatus('error', 'Maximum ' + MAX_FILES + ' fichiers par envoi. Décoche-en ' + (checked.length - MAX_FILES) + '.');
    return;
  }

  var btn = $('mail-send-btn');
  btn.disabled = true;
  btn.textContent = checked.length ? 'Préparation des fichiers…' : 'Envoi en cours…';

  try {
    var attachments = [];
    var MAX_ATTACH_B64 = 4 * 1024 * 1024;
    for (var i = 0; i < checked.length; i++) {
      var cb = checked[i];
      btn.textContent = 'Préparation ' + (i + 1) + '/' + checked.length + '…';
      var content = await urlToBase64(cb.dataset.url);
      if (content.length > MAX_ATTACH_B64) {
        throw new Error('Le fichier « ' + cb.dataset.name + ' » est trop volumineux pour être joint par email (~3 Mo max).');
      }
      attachments.push({ filename: safeAttachName(cb.dataset.name), content: content });
    }
    var MAX_TOTAL_B64 = 5 * 1024 * 1024;
    var total = attachments.reduce(function(s, a) { return s + a.content.length; }, 0);
    if (total > MAX_TOTAL_B64) {
      throw new Error('Les fichiers sélectionnés dépassent la taille maximale autorisée pour un envoi (~5 Mo au total). Décoche-en quelques-uns.');
    }

    btn.textContent = 'Envoi en cours…';
    var tpl = loadTemplate();
    var html = buildMailHtml(cl, tpl, message);
    await envoyerEmail(toEmail, subject, html, NOTIF_EMAIL, attachments);

    var clients = loadClients();
    var idx = clients.findIndex(function(c) { return c.id === cl.id; });
    if (idx >= 0) {
      clients[idx].lastEmailAt = new Date().toISOString();
      clients[idx].lastEmailTo = toEmail;
      saveClients(clients);
      _mailClient = clients[idx];
    }

    showMailStatus('success', 'Email envoyé à ' + toEmail + ' ✓');
    btn.textContent = '✓ Envoyé !';
    showNotifBanner('📧', 'Email envoyé !', cl.nom + ' → ' + toEmail);
    setTimeout(function() { btn.disabled = false; btn.textContent = '📧 Envoyer'; }, 2000);
  } catch (e) {
    console.error('Envoi mail client:', e);
    var msg = (e && (e.text || e.message)) || 'Réessayez.';
    if (/load failed|failed to fetch|networkerror/i.test(msg)) {
      msg = 'Connexion au serveur interrompue pendant l\'envoi (souvent : fichiers trop volumineux, ou coupure réseau). Réessayez avec moins de pièces jointes si ça persiste.';
    }
    showMailStatus('error', 'Erreur : ' + msg);
    btn.disabled = false;
    btn.textContent = '📧 Envoyer';
  }
}

function showMailStatus(type, msg) {
  var el = $('mail-send-status');
  el.style.display = 'block';
  el.style.background = type === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)';
  el.style.color = type === 'success' ? 'var(--green)' : 'var(--red)';
  el.style.border = '1px solid ' + (type === 'success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)');
  el.textContent = msg;
}

// ══════════════════════════════════════════════════════════════
//  AUTO-SAVE DU FORMULAIRE
// ══════════════════════════════════════════════════════════════
var AUTOSAVE_KEY  = 'ar_form_draft';
var _autoSaveTimer = null;
var _lastSavedHash = '';

function getFormHash() {
  // Hash simple pour détecter les changements
  var obj = buildObj();
  return JSON.stringify(obj.lines) + obj.cn + obj.type + obj.notes + (obj.gains||'');
}

function triggerAutoSave() {
  clearTimeout(_autoSaveTimer);
  setAutoSaveStatus('saving');
  _autoSaveTimer = setTimeout(function() {
    var hash = getFormHash();
    if (hash === _lastSavedHash) { setAutoSaveStatus('saved'); return; }
    try {
      var draft = buildObj();
      draft._isDraft = true;
      draft._savedAt = Date.now();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
      _lastSavedHash = hash;
      setAutoSaveStatus('saved');
    } catch(e) {
      console.warn('Auto-save error:', e);
    }
  }, 800);
}

function setAutoSaveStatus(status) {
  var bar = $('autosave-bar');
  var lbl = $('autosave-label');
  if (!bar || !lbl) return;
  bar.className = 'autosave-bar ' + status;
  if (status === 'saving') lbl.textContent = 'Sauvegarde…';
  else if (status === 'saved') lbl.textContent = 'Brouillon sauvegardé';
  else if (status === 'restored') lbl.textContent = 'Brouillon restauré ↺';
  else lbl.textContent = 'Prêt';
}

function checkAndRestoreDraft() {
  var raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) return;
  try {
    var draft = JSON.parse(raw);
    if (!draft._isDraft || !draft.lines || !draft.lines.length) return;
    var age = Date.now() - (draft._savedAt || 0);
    if (age > 24 * 3600000) { // Ignorer les drafts > 24h
      localStorage.removeItem(AUTOSAVE_KEY);
      return;
    }
    var mins = Math.round(age / 60000);
    var ageLabel = mins < 1 ? 'il y a moins d\'1 min' : 'il y a ' + mins + ' min';
    if (confirm('Un brouillon non enregistré a été trouvé (' + ageLabel + '). Voulez-vous le restaurer ?')) {
      loadDocData(draft);
      setAutoSaveStatus('restored');
      showNotifBanner('↺', 'Brouillon restauré', draft.cn || 'Document sans client');
    } else {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  } catch(e) {}
}

function clearDraft() {
  localStorage.removeItem(AUTOSAVE_KEY);
  _lastSavedHash = '';
  setAutoSaveStatus('');
}

// ══════════════════════════════════════════════════════════════
//  FILTRES AVANCÉS LISTE
// ══════════════════════════════════════════════════════════════
var _currentListeFilter = '';
var _currentStatutFilter = '';

function setListeFilter(type, btn) {
  _currentListeFilter = type;
  _currentStatutFilter = '';
  // Reset tous les chips statut
  ['cree','envoye','accepte','paye','impaye'].forEach(function(s) {
    var chip = $('fchip-'+s);
    if (chip) chip.className = 'filter-chip';
  });
  // Activer le bon chip type
  ['all','devis','facture'].forEach(function(t) {
    var chip = $('fchip-'+t);
    if (chip) chip.className = 'filter-chip' + (t === (type||'all') ? ' active' : '');
  });
  if ($('flt')) $('flt').value = type;
  if ($('flt-statut')) $('flt-statut').value = '';
  renderListe();
}

function setStatutFilter(statut, btn) {
  var isActive = _currentStatutFilter === statut;
  _currentStatutFilter = isActive ? '' : statut;
  _currentListeFilter = '';
  // Reset chips type
  ['all','devis','facture'].forEach(function(t) {
    var chip = $('fchip-'+t);
    if (chip) chip.className = 'filter-chip' + (t === 'all' ? ' active' : '');
  });
  // Activer/désactiver chip statut
  var colorMap = { 'créé':'', 'envoyé':'', 'accepté':'active', 'payé':'active-green', 'impayé':'active-red active-orange' };
  ['cree','envoye','accepte','paye','impaye'].forEach(function(s) {
    var chipStatut = { 'cree':'créé', 'envoye':'envoyé', 'accepte':'accepté', 'paye':'payé', 'impaye':'impayé' }[s];
    var chip = $('fchip-'+s);
    if (!chip) return;
    if (chipStatut === _currentStatutFilter) {
      chip.className = 'filter-chip ' + (colorMap[chipStatut] || 'active');
    } else {
      chip.className = 'filter-chip';
    }
  });
  if ($('flt')) $('flt').value = '';
  if ($('flt-statut')) $('flt-statut').value = _currentStatutFilter;
  renderListe();
}

function updateListeFilterCounts() {
  var all = loadDocs();
  var cnt = function(fn) { return all.filter(fn).length; };
  [
    ['fcount-all',    function(){ return true; }],
    ['fcount-devis',  function(d){ return d.type==='devis'; }],
    ['fcount-facture',function(d){ return d.type==='facture'; }],
    ['fcount-ordre',  function(d){ return d.type==='ordre'; }],
  ].forEach(function(pair) {
    var el = $(pair[0]);
    if (el) el.textContent = cnt(pair[1]);
  });
}

// ══════════════════════════════════════════════════════════════
//  SYNC RDVS EN TEMPS RÉEL (Firebase onSnapshot)
// ══════════════════════════════════════════════════════════════
function startRdvsRealtimeSync() {
  if (!db || !syncOk) return;
  db.collection('rdvs').onSnapshot(function(snapshot) {
    var rdvs = [];
    snapshot.forEach(function(doc) {
      var data = doc.data();
      // Ignorer l'ancien document monolithique 'all'
      if (doc.id === 'all') return;
      if (data && data.id) rdvs.push(data);
    });
    localStorage.setItem(RDV_KEY, JSON.stringify(rdvs));
    // Rafraîchir l'agenda si ouvert
    if ($('t-agenda') && $('t-agenda').classList.contains('on')) {
      renderCalendar();
      renderSideEvents(calSelected);
    }
    // Reprogrammer les rappels
    cancelAllRdvTimers();
    rdvs.forEach(function(r){ scheduleRdvNotif(r); });
    runRappelCheck();
  }, function(err) {
    console.warn('RDV realtime sync error:', err);
  });
}

// ══════════════════════════════════════════════════════════════
//  RACCOURCIS CLAVIER
// ══════════════════════════════════════════════════════════════
var _gKeyPressed = false;
var _gKeyTimer = null;

function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ignorer si dans un input/textarea/select
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    // Ignorer si modal ouverte (sauf Echap)
    var modalOpen = document.querySelector('.rdv-modal.open, .olsx-modal.open, .wa-modal.open');

    var key = e.key;
    var ctrl = e.ctrlKey || e.metaKey;

    // Fermer modaux avec Echap
    if (key === 'Escape') {
      document.querySelectorAll('.rdv-modal.open, .olsx-modal.open, .shortcuts-modal.open, .client-history-modal.open').forEach(function(m) {
        m.classList.remove('open');
      });
      return;
    }

    if (modalOpen) return;

    // Ctrl+S — Sauvegarder
    if (ctrl && key === 's') {
      e.preventDefault();
      if ($('t-form') && $('t-form').classList.contains('on')) {
        saveDoc();
        showNotifBanner('💾', 'Sauvegardé', 'Document enregistré');
      }
      return;
    }
    // Ctrl+P — Aperçu/Imprimer
    if (ctrl && key === 'p') {
      e.preventDefault();
      if ($('t-form') && $('t-form').classList.contains('on')) printDoc();
      return;
    }
    // Ctrl+E — Envoyer par email
    if (ctrl && (key === 'e' || key === 'E')) {
      e.preventDefault();
      if ($('t-form') && $('t-form').classList.contains('on')) {
        openPreview();
        setTimeout(sendDocByEmail, 300);
      }
      return;
    }
    // Ctrl+K — Recherche globale
    if (ctrl && key === 'k') {
      e.preventDefault();
      showTab('search');
      setTimeout(function(){ $('global-search') && $('global-search').focus(); }, 100);
      return;
    }
    // Ctrl++ — Ajouter une ligne prestation
    if (ctrl && (key === '+' || key === '=')) {
      e.preventDefault();
      if ($('t-form') && $('t-form').classList.contains('on')) addLine();
      return;
    }
    // ? — Raccourcis
    if (key === '?') {
      $('shortcuts-modal').classList.add('open');
      return;
    }
    // N — Nouveau devis
    if (key === 'n' || key === 'N') {
      newDoc();
      return;
    }
    // Navigation G+lettre (type Gmail)
    if (key === 'g' || key === 'G') {
      _gKeyPressed = true;
      clearTimeout(_gKeyTimer);
      _gKeyTimer = setTimeout(function(){ _gKeyPressed = false; }, 1500);
      return;
    }
    if (_gKeyPressed) {
      _gKeyPressed = false;
      clearTimeout(_gKeyTimer);
      var navMap = {
        'd': 'dash', 'D': 'dash',
        'l': 'liste', 'L': 'liste',
        'c': 'carnet', 'C': 'carnet',
        'a': 'agenda', 'A': 'agenda',
        's': 'stats', 'S': 'stats',
      };
      if (navMap[key]) { showTab(navMap[key]); return; }
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  DÉCLARATION FISCALE
// ══════════════════════════════════════════════════════════════
function setDeclaration(declared) {
  var hdField = $('f-declare');
  if (hdField) hdField.value = declared ? 'true' : 'false';
  var btnOui = $('decl-oui');
  var btnNon = $('decl-non');
  if (btnOui) btnOui.className = 'decl-btn' + (declared ? ' active-decl' : '');
  if (btnNon) btnNon.className = 'decl-btn' + (!declared ? ' active-non' : '');
  onFormChange();
}

function getDeclaration() {
  var hdField = $('f-declare');
  return !hdField || hdField.value !== 'false';
}

function resetDeclaration() {
  setDeclaration(true);
}

// ══════════════════════════════════════════════════════════════
//  START — Netlify Identity gère l'auth
// ============================================================
// L'initialisation est gérée par netlifyIdentity.on('init') ci-dessus

// ══════════════════════════════════════════════════════════════
//  DEMANDES WEB — formulaire de contact, simulateur
//  Lecture directe de Firestore (pas de cache localStorage) : ces documents
//  sont écrits par le site public, jamais par ce back-office.
// ══════════════════════════════════════════════════════════════
var _demandes = [];
var _demFilter = 'nouveau';
// Référence ("collection:id") de la demande dont le devis est actuellement
// ouvert dans le formulaire — permet de relier le devis enregistré à la
// demande d'origine (voir lierDevisALaDemande).
var _demandeActuelle = null;

function setDemFilter(f, btn) {
  _demFilter = f;
  document.querySelectorAll('#t-demandes .filter-chip').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  paintDemandes();
}

// Normalise les documents de la collection `leads` (contact et simulateur)
// vers une forme commune consommée par paintDemandes().
function normaliserDemande(id, d, collection) {
  var veh = d.vehicle || {};
  var prestations = Array.isArray(d.prestations) ? d.prestations
    : Array.isArray(d.options) ? d.options.map(function(o){ return o && o.name ? o.name : String(o); })
    : [];
  var quand = null;
  if (d.createdAt && typeof d.createdAt.toDate === 'function') quand = d.createdAt.toDate();
  else if (d.createdAt) quand = new Date(d.createdAt);
  return {
    id: id,
    collection: collection,
    source: d.source || 'contact',
    nom: d.name || '',
    tel: d.phone || '',
    email: d.email || '',
    ville: d.city || '',
    message: d.message || '',
    marque: veh.brand || '',
    modele: veh.model || '',
    annee: veh.year || '',
    moteur: veh.engine || '',
    km: veh.km || '',
    immat: veh.plate || '',
    prestations: prestations,
    total: typeof d.total === 'number' ? d.total : null,
    statut: d.status || 'nouveau',
    quand: quand,
    devisDraft: (d.devisDraft && Array.isArray(d.devisDraft.lignes)) ? d.devisDraft : null,
    devisId: d.devisId || null
  };
}

function renderDemandes() {
  var el = $('demandes-body');
  if (!el) return;
  if (!db) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Firebase non connecté</div>';
    return;
  }
  el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Chargement…</div>';

  db.collection('leads').orderBy('createdAt', 'desc').limit(200).get()
    .then(function(snap) {
      var out = [];
      snap.forEach(function(doc){ out.push(normaliserDemande(doc.id, doc.data(), 'leads')); });
      _demandes = out.sort(function(a, b) {
        return (b.quand ? b.quand.getTime() : 0) - (a.quand ? a.quand.getTime() : 0);
      });
      paintDemandes();
    })
    .catch(function(e) {
      el.innerHTML = '<div style="color:#ef4444;font-size:13px;padding:16px">Erreur : ' + escHtml(e.message) + '</div>';
    });
}

function paintDemandes() {
  var el = $('demandes-body');
  if (!el) return;

  var nouveaux = _demandes.filter(function(d){ return d.statut === 'nouveau'; }).length;
  var traites  = _demandes.length - nouveaux;
  if ($('dcount-nouveau')) $('dcount-nouveau').textContent = nouveaux;
  if ($('dcount-traite'))  $('dcount-traite').textContent  = traites;
  if ($('dcount-'))        $('dcount-').textContent        = _demandes.length;

  var badge = $('dem-badge');
  if (badge) { badge.textContent = nouveaux; badge.hidden = nouveaux === 0; }

  var liste = _demFilter === ''
    ? _demandes
    : _demandes.filter(function(d){
        return _demFilter === 'nouveau' ? d.statut === 'nouveau' : d.statut !== 'nouveau';
      });

  if (!liste.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px">'
      + (_demFilter === 'nouveau' ? 'Aucune demande en attente. 👌' : 'Aucune demande.') + '</div>';
    return;
  }
  el.innerHTML = liste.map(carteDemande).join('');
}

var SOURCE_LABEL = {
  contact:    { txt: '📝 Formulaire', col: 'var(--blue)' },
  simulateur: { txt: '📊 Simulateur', col: 'var(--orange)' }
};

function carteDemande(d) {
  var src = SOURCE_LABEL[d.source] || SOURCE_LABEL.contact;
  var veh = [d.marque, d.modele, d.annee ? '(' + d.annee + ')' : ''].filter(Boolean).join(' ');
  var quand = d.quand ? d.quand.toLocaleString('fr-FR') : '—';
  var ref = escHtml(d.collection) + ':' + escHtml(d.id);

  var lignes = '';
  var ajouter = function(label, valeur) {
    if (!valeur) return;
    lignes += '<div style="display:flex;gap:8px;font-size:12.5px;margin-top:3px">'
      + '<span style="color:var(--text-muted);min-width:88px">' + label + '</span>'
      + '<span>' + escHtml(valeur) + '</span></div>';
  };
  ajouter('Véhicule', veh);
  ajouter('Motorisation', d.moteur);
  ajouter('Kilométrage', d.km);
  ajouter('Immat.', d.immat);
  ajouter('Zone', d.ville);
  ajouter('Prestations', d.prestations.join(', '));
  if (d.total !== null) ajouter('Total estimé', fmt(d.total));
  ajouter('Message', d.message);

  var contacts = '';
  if (d.tel) contacts += '<a href="tel:' + escHtml(d.tel) + '" class="btn-s btn-sm">📞 ' + escHtml(d.tel) + '</a>';
  if (d.email) contacts += '<a href="mailto:' + escHtml(d.email) + '" class="btn-s btn-sm">✉️ ' + escHtml(d.email) + '</a>';

  // Devis brouillon calculé automatiquement depuis le catalogue (lead-capture.js) :
  // affiché ici pour validation avant tout envoi.
  var devisPreview = '';
  if (d.devisDraft && d.devisDraft.lignes.length) {
    var lignesHtml = d.devisDraft.lignes.map(function(l) {
      return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:2px 0">'
        + '<span>' + escHtml(l.label) + '</span>'
        + '<span style="white-space:nowrap;color:' + (l.pu > 0 ? 'var(--text)' : 'var(--orange)') + '">' + (l.pu > 0 ? fmt(l.pu) : 'à tarifer') + '</span>'
        + '</div>';
    }).join('');
    devisPreview = '<div style="background:var(--bg);border:1px dashed var(--border-blue);border-radius:8px;padding:10px 12px;margin-top:10px">'
      + '<div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">📄 Devis auto-généré'
        + (d.devisDraft.aTarifer ? ' — ' + d.devisDraft.aTarifer + ' ligne(s) à tarifer' : '') + '</div>'
      + lignesHtml
      + '<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><span>Total estimé</span><span>' + fmt(d.devisDraft.total) + '</span></div>'
      + '</div>';
  }

  var creerLabel = d.devisDraft ? '✏️ Modifier le devis' : '→ Créer le devis';
  var confirmBtn = (d.devisDraft && d.email)
    ? '<button class="btn-p btn-sm" onclick="confirmerEtEnvoyerDevis(\'' + ref + '\')" style="background:var(--green)">✅ Confirmer & envoyer</button>'
    : '';

  var actions = d.statut === 'nouveau'
    ? confirmBtn + '<button class="btn-s btn-sm" onclick="demandeVersDevis(\'' + ref + '\')">' + creerLabel + '</button>'
      + '<button class="btn-s btn-sm" onclick="marquerDemande(\'' + ref + '\',\'traite\')">✓ Marquer traitée</button>'
    : confirmBtn + '<button class="btn-s btn-sm" onclick="demandeVersDevis(\'' + ref + '\')">' + creerLabel + '</button>'
      + '<button class="btn-s btn-sm" onclick="marquerDemande(\'' + ref + '\',\'nouveau\')">↩ Rouvrir</button>';

  return '<div style="background:var(--bg2);border:1px solid ' + (d.statut === 'nouveau' ? 'var(--border-blue)' : 'var(--border)') + ';border-radius:10px;padding:14px 16px;margin-bottom:10px">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div>'
        + '<span style="font-size:11px;font-weight:700;color:' + src.col + '">' + src.txt + '</span>'
        + (d.statut === 'nouveau' ? '' : '<span style="font-size:11px;color:var(--text-muted);margin-left:8px">traitée</span>')
        + '<div style="font-family:var(--fh);font-size:17px;font-weight:700;margin-top:2px">' + (escHtml(d.nom) || 'Sans nom') + '</div>'
      + '</div>'
      + '<div style="font-size:11px;color:var(--text-muted);white-space:nowrap">' + escHtml(quand) + '</div>'
    + '</div>'
    + '<div style="margin-top:8px">' + lignes + '</div>'
    + devisPreview
    + '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">' + contacts + actions + '</div>'
    + '</div>';
}

function trouverDemande(ref) {
  var i = ref.indexOf(':');
  var collection = ref.slice(0, i), id = ref.slice(i + 1);
  return _demandes.find(function(d){ return d.collection === collection && d.id === id; });
}

function marquerDemande(ref, statut) {
  var d = trouverDemande(ref);
  if (!d || !db) return;
  db.collection(d.collection).doc(d.id).update({ status: statut })
    .then(function(){ d.statut = statut; paintDemandes(); })
    .catch(function(e){ alert('Impossible de mettre à jour : ' + e.message); });
}

// Préremplit le formulaire de devis puis bascule dessus — même patron que
// selectClientAndGo() et loadDoc().
function demandeVersDevis(ref) {
  var d = trouverDemande(ref);
  if (!d) return;
  // Un devis a déjà été enregistré pour cette demande : on continue de
  // l'éditer (sinon "Modifier le devis" recréerait un devis en double à
  // chaque clic, et la demande n'aurait jamais connaissance des modifs).
  if (d.devisId) {
    var existant = loadDocs().find(function(doc){ return doc.id === d.devisId; });
    if (existant) {
      loadDoc(existant.id);
      _demandeActuelle = ref;
      if (d.statut === 'nouveau') marquerDemande(ref, 'traite');
      return;
    }
  }
  resetForm(false);
  _demandeActuelle = ref;
  $('f-type').value = 'devis';
  $('f-cnom').value  = d.nom || '';
  $('f-ctel').value  = d.tel || '';
  $('f-cemail').value= d.email || '';
  $('f-cville').value= d.ville || '';
  $('f-vm').value    = d.marque || '';
  $('f-vmo').value   = d.modele || '';
  $('f-vmot').value  = d.moteur || '';
  $('f-van').value   = d.annee || '';
  $('f-vim').value   = d.immat || '';
  $('f-vkm').value   = d.km || '';
  if (d.devisDraft && d.devisDraft.lignes.length) {
    lines = d.devisDraft.lignes.map(function(l) {
      return { id: Date.now() + Math.random(), label: l.label || '', qte: l.qte || 1, pu: l.pu || 0, desc: l.desc || '', ref: l.ref || '', remise: l.remise || 0, remiseType: l.remiseType === 'eur' ? 'eur' : 'pct' };
    });
  }
  var notes = [];
  if (d.prestations.length) notes.push('Prestations demandées : ' + d.prestations.join(', '));
  if (d.devisDraft && d.devisDraft.aTarifer) notes.push('⚠ ' + d.devisDraft.aTarifer + ' prestation(s) à tarifer manuellement.');
  if (d.message) notes.push(d.message);
  if ($('f-notes')) $('f-notes').value = notes.join('\n');
  onTypeChange();
  renderLines();
  calcTotaux();
  showTab('form');
  // La demande est prise en charge : elle sort de la file d'attente.
  if (d.statut === 'nouveau') marquerDemande(ref, 'traite');
}

// Enregistre le devis auto-rempli à partir d'une demande puis ouvre
// directement l'aperçu + l'envoi par email — il ne reste plus qu'à confirmer
// l'envoi (bouton "Envoyer" du modal), sans repasser par tout le formulaire.
function confirmerEtEnvoyerDevis(ref) {
  demandeVersDevis(ref);
  if (!$('f-cnom').value.trim()) { alert('Renseignez le nom du client avant de confirmer.'); return; }
  var doc = buildObj();
  var docs = loadDocs();
  if (editId) {
    var i = docs.findIndex(function(dd) { return dd.id === editId; });
    if (i >= 0) docs[i] = doc; else docs.unshift(doc);
  } else {
    docs.unshift(doc);
  }
  editId = doc.id;
  saveDocs(docs);
  lierDevisALaDemande(ref, doc);
  renderDash();
  previewDoc(doc.id);
  sendDocByEmail();
}

// ══════════════════════════════════════════════════════════════
//  PARC AUTO — achat / revente de véhicules
//  Stockage : localStorage 'ar_vehicules' + Firestore 'vehicules'
//  Modèle : { id, brand, model, year, plate, vin, mileage, status,
//             purchase_date, purchase_price, sale_date, sale_price,
//             notes, expenses[], photos[], documents[], created_at }
// ══════════════════════════════════════════════════════════════
var VEH_KEY = 'ar_vehicules';

var VEH_ST = {
  en_stock:      { l: 'En stock',      i: '📦' },
  en_reparation: { l: 'En réparation', i: '🔧' },
  a_vendre:      { l: 'À vendre',      i: '🏷️' },
  vendu:         { l: 'Vendu',         i: '✅' },
};

var EXP_CATS = {
  achat:       'Achat',
  reparation:  'Réparation',
  piece:       'Pièce',
  carte_grise: 'Carte grise',
  ct:          'Contrôle technique',
  transport:   'Transport / livraison',
  carburant:   'Carburant',
  esthetique:  'Esthétique / nettoyage',
  assurance:   'Assurance',
  annonce:     'Annonce / publicité',
  autre:       'Autre',
};

var DOC_TYPES = {
  carte_grise:   'Carte grise',
  ct:            'Contrôle technique',
  facture_achat: "Facture d'achat",
  facture_vente: 'Facture de vente',
  cession:       'Certificat de cession',
  autre:         'Autre',
};

var CLIENT_DOC_TYPES = {
  carte_id:    "Pièce d'identité",
  carte_grise: 'Carte grise',
  devis_signe: 'Devis signé',
  facture:     'Facture',
  contrat:     'Contrat',
  autre:       'Autre',
};

var parcFilter    = '';
var vehModalId    = null;   // id du véhicule ouvert (existant ou futur)
var vehIsNew      = true;
var vehPhotos     = [];
var vehDocs       = [];
var vehExpSeq     = 0;

// ── Persistance ──────────────────────────────────────────────
function loadVehicules() {
  try { return JSON.parse(localStorage.getItem(VEH_KEY) || '[]'); } catch(e) { return []; }
}

function storeVehicules(arr) {
  localStorage.setItem(VEH_KEY, JSON.stringify(arr));
}

function persistVehicule(v) {
  var arr = loadVehicules();
  var i = arr.findIndex(function(x){ return String(x.id) === String(v.id); });
  if (i >= 0) arr[i] = v; else arr.push(v);
  storeVehicules(arr);
  if (db && syncOk) {
    db.collection('vehicules').doc(String(v.id)).set(v)
      .catch(function(e){ console.warn('Firebase save véhicule:', e); });
  }
  return arr;
}

function syncVehiculesFromFirebase() {
  if (!db) return;
  db.collection('vehicules').get()
    .then(function(snap) {
      var arr = [];
      snap.forEach(function(d){ var v = d.data(); if (v && v.id != null) arr.push(v); });
      storeVehicules(arr);
      if ($('t-parc') && $('t-parc').classList.contains('on')) renderParc();
    })
    .catch(function(e){ console.warn('Sync véhicules:', e); });
}

function startVehiculesRealtimeSync() {
  if (!db || !syncOk) return;
  db.collection('vehicules').onSnapshot(function(snap) {
    var arr = [];
    snap.forEach(function(d){ var v = d.data(); if (v && v.id != null) arr.push(v); });
    storeVehicules(arr);
    if ($('t-parc') && $('t-parc').classList.contains('on') && !$('veh-modal').classList.contains('open')) renderParc();
  }, function(e){ console.warn('Realtime véhicules:', e); });
}

// ── Calculs ──────────────────────────────────────────────────
function vehFrais(v) {
  return (v.expenses || []).reduce(function(s, e){ return s + (parseFloat(e.amount) || 0); }, 0);
}
function vehRevient(v) {
  return (parseFloat(v.purchase_price) || 0) + vehFrais(v);
}
function vehMarge(v) {
  if (v.sale_price === null || v.sale_price === undefined || v.sale_price === '') return null;
  return (parseFloat(v.sale_price) || 0) - vehRevient(v);
}
function vehLabel(v) {
  return [v.brand, v.model].map(function(s){ return (s||'').trim(); }).filter(Boolean).join(' ') || 'Véhicule';
}
function vehCover(v) {
  var ph = v.photos || [];
  var c = ph.find(function(p){ return p.cover; }) || ph[0];
  return c ? c.url : '';
}

// ── Rendu du parc ────────────────────────────────────────────
function setParcFilter(f, btn) {
  parcFilter = f;
  document.querySelectorAll('#t-parc .filter-chip').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderParc();
}

function renderParc() {
  var all = loadVehicules();
  var grid = $('parc-grid');
  if (!grid) return;

  // Compteurs par statut
  $('vcount-').textContent = all.length;
  Object.keys(VEH_ST).forEach(function(s) {
    var el = $('vcount-' + s);
    if (el) el.textContent = all.filter(function(v){ return (v.status||'en_stock') === s; }).length;
  });

  // KPIs
  var enParc = all.filter(function(v){ return (v.status||'en_stock') !== 'vendu'; });
  var vendus = all.filter(function(v){ return (v.status||'en_stock') === 'vendu' || vehMarge(v) !== null; });
  var immo   = enParc.reduce(function(s,v){ return s + vehRevient(v); }, 0);
  var ca     = vendus.reduce(function(s,v){ return s + (parseFloat(v.sale_price) || 0); }, 0);
  var marge  = vendus.reduce(function(s,v){ return s + (vehMarge(v) || 0); }, 0);
  var invest = vendus.reduce(function(s,v){ return s + vehRevient(v); }, 0);
  var rentab = invest > 0 ? (marge / invest * 100) : 0;

  $('parc-kpis').innerHTML =
      kpiCard('Véhicules en parc', String(enParc.length), enParc.length + ' / ' + all.length + ' au total', '')
    + kpiCard('Capital immobilisé', fmt(immo), 'Achat + frais des véhicules non vendus', 'orange')
    + kpiCard('CA revente', fmt(ca), vendus.length + ' véhicule' + (vendus.length > 1 ? 's' : '') + ' vendu' + (vendus.length > 1 ? 's' : ''), 'blue')
    + kpiCard('Marge réalisée', fmt(marge), rentab ? 'Rentabilité ' + rentab.toFixed(1).replace('.', ',') + ' %' : '—', marge >= 0 ? 'green' : 'orange');

  // Liste filtrée
  var q = ($('parc-search') && $('parc-search').value || '').toLowerCase().trim();
  var list = all.filter(function(v) {
    if (parcFilter && (v.status||'en_stock') !== parcFilter) return false;
    if (!q) return true;
    return [v.brand, v.model, v.plate, v.vin, v.notes, v.year].join(' ').toLowerCase().indexOf(q) !== -1;
  });
  list.sort(function(a, b) {
    var av = (a.status||'') === 'vendu', bv = (b.status||'') === 'vendu';
    if (av !== bv) return av ? 1 : -1;
    return String(b.purchase_date || b.created_at || '').localeCompare(String(a.purchase_date || a.created_at || ''));
  });

  if (!list.length) {
    grid.innerHTML = '<div class="parc-empty">'
      + (all.length ? 'Aucun véhicule ne correspond à ce filtre.' : '🚗 Aucun véhicule pour l\'instant.<br/>Clique sur « + Ajouter un véhicule » pour démarrer ton suivi achat / revente.')
      + '</div>';
    return;
  }
  grid.innerHTML = list.map(vehCard).join('');
}

function kpiCard(label, val, sub, color) {
  return '<div class="sc">'
    + '<div class="sc-label">' + escHtml(label) + '</div>'
    + '<div class="sc-val ' + (color||'') + '">' + escHtml(val) + '</div>'
    + '<div class="sc-sub">' + escHtml(sub||'') + '</div>'
    + '</div>';
}

function vehCard(v) {
  var st     = VEH_ST[v.status] || VEH_ST.en_stock;
  var cover  = vehCover(v);
  var marge  = vehMarge(v);
  var nPhoto = (v.photos || []).length;
  var sub    = [v.year, v.plate ? String(v.plate).toUpperCase() : '', v.mileage ? Number(v.mileage).toLocaleString('fr-FR') + ' km' : '']
                 .filter(Boolean).join(' · ');

  return '<div class="veh-card" onclick="openVehModal(\'' + escHtml(String(v.id)).replace(/'/g, '&#39;') + '\')">'
    + '<div class="veh-cover"' + (cover ? ' style="background-image:url(\'' + escHtml(cover) + '\')"' : '') + '>'
      + (cover ? '' : '🚗')
      + '<span class="vst vst-' + (v.status || 'en_stock') + '">' + st.i + ' ' + escHtml(st.l) + '</span>'
      + (nPhoto > 1 ? '<span class="veh-cover-count">📷 ' + nPhoto + '</span>' : '')
    + '</div>'
    + '<div class="veh-card-body">'
      + '<div class="veh-title">' + escHtml(vehLabel(v)) + '</div>'
      + '<div class="veh-sub">' + escHtml(sub || '—') + '</div>'
      + '<div class="veh-lines">'
        + '<div class="veh-line"><span>Achat' + (v.purchase_date ? ' · ' + fmtDate(v.purchase_date) : '') + '</span><b>' + fmt(parseFloat(v.purchase_price) || 0) + '</b></div>'
        + '<div class="veh-line"><span>Frais (' + (v.expenses || []).length + ')</span><b style="color:var(--orange)">' + fmt(vehFrais(v)) + '</b></div>'
        + '<div class="veh-line"><span>Prix de revient</span><b>' + fmt(vehRevient(v)) + '</b></div>'
        + (marge !== null ? '<div class="veh-line"><span>Vente' + (v.sale_date ? ' · ' + fmtDate(v.sale_date) : '') + '</span><b>' + fmt(parseFloat(v.sale_price) || 0) + '</b></div>' : '')
      + '</div>'
      + '<div class="veh-marge">'
        + '<span class="veh-marge-lbl">' + (marge !== null ? 'Marge nette' : 'À revendre à partir de') + '</span>'
        + '<span class="veh-marge-val" style="color:' + (marge === null ? 'var(--text)' : (marge >= 0 ? 'var(--green)' : 'var(--red)')) + '">'
          + (marge !== null ? (marge >= 0 ? '+' : '') + fmt(marge) : fmt(vehRevient(v)))
        + '</span>'
      + '</div>'
    + '</div>'
    + '</div>';
}

// ── Fiche véhicule ───────────────────────────────────────────
function openVehModal(id) {
  var v = id ? loadVehicules().find(function(x){ return String(x.id) === String(id); }) : null;
  vehIsNew   = !v;
  vehModalId = v ? v.id : String(Date.now());
  v = v || {};

  $('veh-modal-title').textContent = vehIsNew ? 'Nouveau véhicule' : '🚗 ' + vehLabel(v);
  $('veh-delete-btn').style.display = vehIsNew ? 'none' : '';

  $('v-brand').value          = v.brand || '';
  $('v-model').value          = v.model || '';
  $('v-year').value           = v.year || '';
  $('v-plate').value          = v.plate || '';
  $('v-vin').value            = v.vin || '';
  $('v-mileage').value        = v.mileage || '';
  $('v-status').value         = v.status || 'en_stock';
  $('v-purchase-date').value  = v.purchase_date || (vehIsNew ? today() : '');
  $('v-purchase-price').value = v.purchase_price != null ? v.purchase_price : '';
  $('v-sale-date').value      = v.sale_date || '';
  $('v-sale-price').value     = v.sale_price != null ? v.sale_price : '';
  $('v-notes').value          = v.notes || '';

  vehPhotos = (v.photos || []).slice();
  vehDocs   = (v.documents || []).slice();
  $('veh-photo-status').textContent = '';
  $('veh-doc-status').textContent   = '';

  $('veh-exp-list').innerHTML = '';
  vehExpSeq = 0;
  (v.expenses || []).forEach(function(e){ addExpRow(e); });

  renderVehPhotos();
  renderVehDocs();
  refreshVehRecap();
  $('veh-modal').classList.add('open');
}

function closeVehModal() {
  $('veh-modal').classList.remove('open');
}

function onVehStatusChange() {
  if ($('v-status').value === 'vendu' && !$('v-sale-date').value) $('v-sale-date').value = today();
  refreshVehRecap();
}

// ── Frais ────────────────────────────────────────────────────
function addExpRow(e) {
  e = e || {};
  var id = 'exp' + (++vehExpSeq);
  var div = document.createElement('div');
  div.className = 'exp-row';
  div.id = id;
  var opts = Object.keys(EXP_CATS).map(function(k) {
    return '<option value="' + k + '"' + ((e.category || 'reparation') === k ? ' selected' : '') + '>' + escHtml(EXP_CATS[k]) + '</option>';
  }).join('');
  div.innerHTML =
      '<select class="exp-cat">' + opts + '</select>'
    + '<input class="exp-label" type="text" placeholder="Désignation (ex : kit distribution)" value="' + escHtml(e.label || '') + '"/>'
    + '<input class="exp-amount" type="number" min="0" step="0.01" placeholder="0,00" value="' + (e.amount != null ? e.amount : '') + '" oninput="refreshVehRecap()"/>'
    + '<input class="exp-date" type="date" value="' + escHtml(e.date || e.expense_date || '') + '"/>'
    + '<button class="exp-del" onclick="removeExpRow(\'' + id + '\')" title="Supprimer">×</button>';
  $('veh-exp-list').appendChild(div);
  refreshVehRecap();
}

function removeExpRow(id) {
  var el = $(id);
  if (el) el.remove();
  refreshVehRecap();
}

function collectExpenses() {
  var out = [];
  document.querySelectorAll('#veh-exp-list .exp-row').forEach(function(row) {
    var label  = row.querySelector('.exp-label').value.trim();
    var amount = parseFloat(row.querySelector('.exp-amount').value) || 0;
    if (!label && !amount) return;
    out.push({
      category: row.querySelector('.exp-cat').value,
      label:    label,
      amount:   amount,
      date:     row.querySelector('.exp-date').value || '',
    });
  });
  return out;
}

// ── Récapitulatif live ───────────────────────────────────────
function refreshVehRecap() {
  var achat = parseFloat($('v-purchase-price').value) || 0;
  var frais = collectExpenses().reduce(function(s, e){ return s + e.amount; }, 0);
  var rev   = achat + frais;
  var vRaw  = $('v-sale-price').value;
  var vente = vRaw === '' ? null : (parseFloat(vRaw) || 0);

  $('veh-exp-total').textContent = fmt(frais);
  $('vr-achat').textContent   = fmt(achat);
  $('vr-frais').textContent   = fmt(frais);
  $('vr-revient').textContent = fmt(rev);
  $('vr-vente').textContent   = vente === null ? '—' : fmt(vente);

  var mEl = $('vr-marge'), pEl = $('vr-marge-pct');
  if (vente === null) {
    $('vr-marge-lbl').textContent = 'Marge nette';
    mEl.textContent = '—';
    mEl.style.color = 'var(--text-dim)';
    pEl.textContent = 'Renseigne un prix de vente';
    pEl.style.color = 'var(--text-dim)';
  } else {
    var marge = vente - rev;
    var pct   = rev > 0 ? (marge / rev * 100) : 0;
    $('vr-marge-lbl').textContent = marge >= 0 ? 'Marge nette' : 'Perte';
    mEl.textContent = (marge >= 0 ? '+' : '') + fmt(marge);
    mEl.style.color = marge >= 0 ? 'var(--green)' : 'var(--red)';
    pEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(1).replace('.', ',') + ' %';
    pEl.style.color = marge >= 0 ? 'var(--green)' : 'var(--red)';
  }
}

// ── Enregistrement / suppression ─────────────────────────────
function saveVehFromModal() {
  var brand = $('v-brand').value.trim();
  var model = $('v-model').value.trim();
  if (!brand || !model) { alert('Marque et modèle sont obligatoires.'); return; }

  var existing = loadVehicules().find(function(x){ return String(x.id) === String(vehModalId); });
  var saleRaw  = $('v-sale-price').value;
  var status   = $('v-status').value;
  if (saleRaw !== '' && $('v-sale-date').value === '') $('v-sale-date').value = today();

  var v = {
    id:             vehModalId,
    brand:          brand,
    model:          model,
    year:           $('v-year').value ? parseInt($('v-year').value, 10) : null,
    plate:          $('v-plate').value.trim().toUpperCase(),
    vin:            $('v-vin').value.trim().toUpperCase(),
    mileage:        $('v-mileage').value ? parseInt($('v-mileage').value, 10) : null,
    status:         status,
    purchase_date:  $('v-purchase-date').value || '',
    purchase_price: parseFloat($('v-purchase-price').value) || 0,
    sale_date:      $('v-sale-date').value || '',
    sale_price:     saleRaw === '' ? null : (parseFloat(saleRaw) || 0),
    notes:          $('v-notes').value.trim(),
    expenses:       collectExpenses(),
    photos:         vehPhotos,
    documents:      vehDocs,
    created_at:     (existing && existing.created_at) || new Date().toISOString(),
  };

  persistVehicule(v);
  closeVehModal();
  renderParc();

  var marge = vehMarge(v);
  showNotifBanner('🚗', vehIsNew ? 'Véhicule ajouté' : 'Véhicule mis à jour',
    vehLabel(v) + ' — prix de revient ' + fmt(vehRevient(v)) + (marge !== null ? ' · marge ' + fmt(marge) : ''));
}

function deleteVehicule() {
  var v = loadVehicules().find(function(x){ return String(x.id) === String(vehModalId); });
  if (!v) { closeVehModal(); return; }
  if (!confirm('Supprimer définitivement ' + vehLabel(v) + ' ainsi que ses frais, photos et documents ?')) return;

  storeVehicules(loadVehicules().filter(function(x){ return String(x.id) !== String(vehModalId); }));
  if (db && syncOk) {
    db.collection('vehicules').doc(String(vehModalId)).delete()
      .catch(function(e){ console.warn('Firebase delete véhicule:', e); });
  }
  closeVehModal();
  renderParc();
}

// ── Photos & documents (Firebase Storage via Netlify) ────────
function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var r = new FileReader();
    r.onload  = function(){ resolve(String(r.result).split(',')[1]); };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Redimensionne une image côté client (max 1600px, JPEG q0.82)
function resizeImage(file, maxDim) {
  return new Promise(function(resolve) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function() {
      var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      var dataUrl = cv.toDataURL('image/jpeg', 0.82);
      resolve({ base64: dataUrl.split(',')[1], contentType: 'image/jpeg' });
    };
    img.onerror = function() { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Extensions acceptées par la fonction upload-vehicule, par type MIME
var UPLOAD_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

// La fonction n'accepte que des noms simples (le nom compose le chemin de
// l'objet dans le bucket) : on nettoie accents, espaces et ponctuation.
function safeUploadName(name, ext) {
  var base = String(name || 'fichier').replace(/\.[^.]+$/, '');
  base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
             .replace(/[^A-Za-z0-9 _-]+/g, '-')
             .replace(/-{2,}/g, '-')
             .trim()
             .slice(0, 60)
             .replace(/^[-\s]+|[-\s]+$/g, '');
  return (base || 'fichier') + '.' + ext;
}

function uploadVehFile(payload) {
  return authedFetch('/.netlify/functions/upload-vehicule', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).then(function(r) {
    return r.json().catch(function(){ return {}; }).then(function(j) {
      if (!r.ok) throw new Error(j.error || 'Upload échoué (' + r.status + ')');
      return j;
    });
  });
}

async function uploadVehPhotos(input) {
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length) return;
  var status = $('veh-photo-status');

  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Envoi ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    try {
      // Le redimensionnement produit toujours du JPEG ; sinon on garde le
      // fichier tel quel, à condition que son type soit accepté.
      var img = await resizeImage(files[i], 1600);
      var ct  = img ? img.contentType : (files[i].type || '');
      if (!UPLOAD_EXT[ct]) throw new Error('Format non accepté : ' + (files[i].name || 'photo'));
      var b64  = img ? img.base64 : await fileToBase64(files[i]);
      var name = safeUploadName(files[i].name || 'photo', UPLOAD_EXT[ct]);
      var res = await uploadVehFile({
        fileBase64: b64, contentType: ct, kind: 'photo',
        vehiculeId: String(vehModalId), filename: name,
      });
      vehPhotos.push({ url: res.url, path: res.path, name: name, cover: vehPhotos.length === 0 });
      renderVehPhotos();
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '✓ ' + files.length + ' photo' + (files.length > 1 ? 's' : '') + ' ajoutée' + (files.length > 1 ? 's' : '') + ' — pense à enregistrer';
  status.style.color = 'var(--green)';
}

async function uploadVehDocs(input) {
  var files = Array.prototype.slice.call(input.files || []);
  input.value = '';
  if (!files.length) return;
  var status = $('veh-doc-status');
  var type   = $('v-doc-type').value;

  for (var i = 0; i < files.length; i++) {
    status.textContent = 'Envoi ' + (i + 1) + '/' + files.length + '…';
    status.style.color = 'var(--text-dim)';
    if (files[i].size > 8 * 1024 * 1024) {
      status.textContent = '✗ ' + files[i].name + ' dépasse 8 Mo';
      status.style.color = 'var(--red)';
      return;
    }
    try {
      var ct = files[i].type || 'application/pdf';
      if (!UPLOAD_EXT[ct]) throw new Error('Format non accepté : ' + (files[i].name || 'document') + ' (PDF ou image)');
      var name = safeUploadName(files[i].name || 'document', UPLOAD_EXT[ct]);
      var res = await uploadVehFile({
        fileBase64: await fileToBase64(files[i]),
        contentType: ct,
        kind: 'document',
        vehiculeId: String(vehModalId),
        filename: name,
      });
      vehDocs.push({ url: res.url, path: res.path, name: name, type: type });
      renderVehDocs();
    } catch(e) {
      status.textContent = '✗ ' + e.message;
      status.style.color = 'var(--red)';
      return;
    }
  }
  status.textContent = '✓ ' + files.length + ' document' + (files.length > 1 ? 's' : '') + ' ajouté' + (files.length > 1 ? 's' : '') + ' — pense à enregistrer';
  status.style.color = 'var(--green)';
}

function renderVehPhotos() {
  var el = $('veh-photo-list');
  if (!vehPhotos.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">Aucune photo.</div>';
    return;
  }
  el.innerHTML = vehPhotos.map(function(p, i) {
    return '<div class="veh-thumb' + (p.cover ? ' cover' : '') + '" style="background-image:url(\'' + escHtml(p.url) + '\')">'
      + '<div class="veh-thumb-acts">'
        + '<button onclick="setVehCover(' + i + ')" title="Photo principale">' + (p.cover ? '★' : '☆') + '</button>'
        + '<button onclick="openVehPhoto(' + i + ')" title="Ouvrir">⤢</button>'
        + '<button onclick="removeVehPhoto(' + i + ')" title="Retirer">🗑</button>'
      + '</div></div>';
  }).join('');
}

function openVehPhoto(i) {
  if (vehPhotos[i]) window.open(vehPhotos[i].url, '_blank', 'noopener');
}

function setVehCover(i) {
  vehPhotos.forEach(function(p, j){ p.cover = (i === j); });
  renderVehPhotos();
}

function removeVehPhoto(i) {
  var wasCover = vehPhotos[i] && vehPhotos[i].cover;
  vehPhotos.splice(i, 1);
  if (wasCover && vehPhotos.length) vehPhotos[0].cover = true;
  renderVehPhotos();
}

function renderVehDocs() {
  var el = $('veh-doc-list');
  if (!vehDocs.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">Aucun document.</div>';
    return;
  }
  el.innerHTML = vehDocs.map(function(d, i) {
    return '<div class="veh-doc">'
      + '<span>' + (String(d.name||'').toLowerCase().endsWith('.pdf') ? '📄' : '🖼️') + '</span>'
      + '<a href="' + escHtml(d.url) + '" target="_blank" rel="noopener">' + escHtml(d.name || 'document') + '</a>'
      + '<span style="color:var(--text-muted);font-size:11px">' + escHtml(DOC_TYPES[d.type] || 'Autre') + '</span>'
      + '<button class="exp-del" onclick="removeVehDoc(' + i + ')" title="Retirer">×</button>'
      + '</div>';
  }).join('');
}

function removeVehDoc(i) {
  vehDocs.splice(i, 1);
  renderVehDocs();
}

// ── Export CSV ───────────────────────────────────────────────
function exportParcCSV() {
  var vehs = loadVehicules();
  if (!vehs.length) { alert('Aucun véhicule à exporter.'); return; }

  var rows = [['Marque','Modèle','Année','Immat','VIN','Km','Statut','Date achat','Prix achat','Total frais','Prix de revient','Date vente','Prix vente','Marge','Marge %','Détail frais','Notes']];
  vehs.forEach(function(v) {
    var frais = vehFrais(v), rev = vehRevient(v), marge = vehMarge(v);
    rows.push([
      v.brand||'', v.model||'', v.year||'', v.plate||'', v.vin||'', v.mileage||'',
      (VEH_ST[v.status] || VEH_ST.en_stock).l,
      v.purchase_date||'', (parseFloat(v.purchase_price)||0).toFixed(2),
      frais.toFixed(2), rev.toFixed(2),
      v.sale_date||'', v.sale_price != null ? (parseFloat(v.sale_price)||0).toFixed(2) : '',
      marge !== null ? marge.toFixed(2) : '',
      marge !== null && rev > 0 ? (marge / rev * 100).toFixed(1) : '',
      (v.expenses||[]).map(function(e){ return (EXP_CATS[e.category]||e.category) + ' : ' + (e.label||'') + ' = ' + (parseFloat(e.amount)||0).toFixed(2) + ' €'; }).join(' | '),
      v.notes||'',
    ]);
  });

  var csv = rows.map(function(r) {
    return r.map(function(c){ return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';');
  }).join('\n');
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'AREPROG_parc_auto_' + today() + '.csv';
  a.click();
  showNotifBanner('⬇', 'Export CSV', vehs.length + ' véhicule' + (vehs.length > 1 ? 's' : '') + ' exporté' + (vehs.length > 1 ? 's' : ''));
}

// ── Reprise des données de vehicules.db (import unique) ──────
var VEH_SEED = [
  { id: 'seed-1', brand: 'FIAT', model: '500', year: 2013, plate: 'CX-084-LM', vin: 'ZFA3120000J037384',
    mileage: 119000, status: 'en_reparation', purchase_date: '2026-07-06', purchase_price: 350,
    sale_date: '', sale_price: null, notes: '', created_at: '2026-07-06T14:33:54.000Z',
    photos: [], documents: [],
    expenses: [
      { category: 'reparation',  label: 'Moteur occasion',              amount: 339,    date: '2026-07-06' },
      { category: 'reparation',  label: 'Bougies',                      amount: 36.96,  date: '2026-07-06' },
      { category: 'reparation',  label: 'Kit distribution + pompe à eau', amount: 45.24, date: '2026-07-06' },
      { category: 'reparation',  label: 'Essuie-glaces',                amount: 21.19,  date: '2026-07-06' },
      { category: 'reparation',  label: 'Filtres',                      amount: 30.88,  date: '2026-07-06' },
      { category: 'reparation',  label: 'Courroie accessoire',          amount: 12.36,  date: '2026-07-06' },
      { category: 'carte_grise', label: 'Carte grise',                  amount: 129.76, date: '2026-07-06' },
      { category: 'reparation',  label: 'Biellette de direction',       amount: 35.60,  date: '2026-07-06' },
      { category: 'reparation',  label: 'Amortisseur + coupelles',      amount: 134.16, date: '2026-07-07' },
      { category: 'transport',   label: 'Livraison',                    amount: 12,     date: '2026-07-07' },
      { category: 'reparation',  label: 'Pneus x4',                     amount: 164.02, date: '2026-07-07' },
      { category: 'assurance',   label: 'Assurance',                    amount: 58.47,  date: '2026-07-07' },
    ] },
  { id: 'seed-2', brand: 'SEAT', model: 'IBIZA', year: null, plate: '', vin: '',
    mileage: null, status: 'en_stock', purchase_date: '', purchase_price: 500,
    sale_date: '', sale_price: null, notes: '', created_at: '2026-07-08T22:31:56.000Z',
    photos: [], documents: [],
    expenses: [
      { category: 'reparation', label: 'Ligne d\'échappement', amount: 200, date: '2026-07-17' },
      { category: 'reparation', label: 'Autoradio',            amount: 60,  date: '2026-07-17' },
    ] },
];

// Importe les véhicules de l'ancienne base SQLite une seule fois.
// Le drapeau vit dans Firestore (config/vehicules_seed) pour éviter
// tout doublon si plusieurs appareils se connectent.
function seedVehiculesOnce() {
  if (!db || !syncOk) return;
  if (localStorage.getItem('ar_veh_seeded') === '1') return;

  db.collection('config').doc('vehicules_seed').get()
    .then(function(doc) {
      if (doc.exists) { localStorage.setItem('ar_veh_seeded', '1'); return null; }
      return db.collection('vehicules').limit(1).get().then(function(snap) {
        if (!snap.empty) {
          localStorage.setItem('ar_veh_seeded', '1');
          return db.collection('config').doc('vehicules_seed').set({ done: true, at: new Date().toISOString(), imported: 0 });
        }
        var batch = db.batch();
        VEH_SEED.forEach(function(v){ batch.set(db.collection('vehicules').doc(String(v.id)), v); });
        batch.set(db.collection('config').doc('vehicules_seed'), { done: true, at: new Date().toISOString(), imported: VEH_SEED.length });
        return batch.commit().then(function() {
          localStorage.setItem('ar_veh_seeded', '1');
          storeVehicules(VEH_SEED.slice());
          if ($('t-parc') && $('t-parc').classList.contains('on')) renderParc();
        });
      });
    })
    .catch(function(e){ console.warn('Seed véhicules:', e); });
}
