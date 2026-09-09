/* ===== SW.JS - Offline support for Lark ===== */
const CACHE_NAME = 'lark-shell-v2';
const DATA_CACHE_NAME = 'lark-data-v1';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './images/logo.png',
  './css/main.css',
  './css/cards.css',
  './css/modals.css',
  './js/supabase.js',
  './js/state.js',
  './js/translations.js',
  './js/ai.js',
  './js/quiz.js',
  './js/vocab.js',
  './js/ads.js',
  './js/settings.js',
  './js/notifications.js',
  './js/app.js'
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== DATA_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests. Writes (POST/PATCH/DELETE) and the AI proxy
  // must always go straight to the network, untouched.
  if (event.request.method !== 'GET') return;
  if (url.pathname.includes('/functions/v1/ai-proxy')) return;

  // Supabase data reads (settings, ads, daily content):
  // network-first, but cache each successful response so the last
  // loaded content is available when offline.
  if (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DATA_CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App shell (HTML/CSS/JS/images): cache-first, refresh cache in the background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Show an incoming push notification
self.addEventListener('push', (event) => {
  let data = { title: 'Lark', body: 'You have a new update!' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (e) { /* ignore malformed payload */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './images/logo.png',
      badge: './images/logo.png'
    })
  );
});

// Focus/open the app when the notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
