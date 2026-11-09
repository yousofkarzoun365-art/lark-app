/* ===== SW.JS - Offline support for Lark ===== */
const CACHE_NAME = 'lark-shell-v4';
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
  './js/app.js'
];

// Install: pre-cache the app shell. Each file is cached independently so
// one missing/404 file doesn't stop the Service Worker from activating.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          SHELL_FILES.map((url) =>
            cache.add(url).catch((err) => console.warn('SW: could not cache', url, err))
          )
        )
      )
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
