const CACHE_NAME = 'librairie-pointage-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Pour les appels API Google, toujours aller sur le réseau
  if (event.request.url.includes('script.google.com') ||
      event.request.url.includes('fonts.googleapis.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Pour les assets locaux : cache en premier
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
