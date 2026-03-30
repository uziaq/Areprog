// AREPROG — Service Worker
// Gère les notifications push en arrière-plan (même app fermée)

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

// Réception d'un push depuis le serveur (si configuré plus tard)
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'AREPROG', {
      body: data.body || '',
      icon: '/favicon512.png',
      badge: '/favicon32x32.png',
      tag: 'areprog-rdv',
      data: data,
    })
  );
});

// Clic sur la notification → ouvrir l'app sur l'agenda
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes('areprog.fr') && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://areprog.fr/devis#agenda');
      }
    })
  );
});

// Messages depuis la page (rappels programmés côté SW)
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    var rdv = e.data.rdv;
    var delay = e.data.delay;
    setTimeout(function() {
      self.registration.showNotification('📅 Rappel AREPROG', {
        body: rdv.heure + ' — ' + rdv.title + (rdv.lieu ? '\n📍 ' + rdv.lieu : ''),
        icon: '/favicon512.png',
        badge: '/favicon32x32.png',
        tag: 'areprog-rdv-' + rdv.id,
      });
    }, delay);
  }
});
