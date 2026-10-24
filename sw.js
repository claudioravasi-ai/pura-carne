/* Pura Carne — funcionar sin internet (Workbox).
   Guarda una copia de la app, de las librerías y de las láminas que ya se miraron. */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (self.workbox) {
  workbox.setConfig({ debug: false });
  var rutas = workbox.routing, estrategias = workbox.strategies;
  var Vence = workbox.expiration.ExpirationPlugin, Respuestas = workbox.cacheableResponse.CacheableResponsePlugin;

  // Páginas: primero internet; si no hay, la última copia.
  rutas.registerRoute(function (o) { return o.request.mode === 'navigate'; }, new estrategias.NetworkFirst({ cacheName: 'pc-paginas', networkTimeoutSeconds: 4 }));
  // Archivos propios de la app: siempre la versión nueva si hay internet; la copia, si no.
  rutas.registerRoute(function (o) { return o.url.origin === self.location.origin; }, new estrategias.NetworkFirst({ cacheName: 'pc-app', networkTimeoutSeconds: 4 }));
  // Librerías y letras (no cambian: tienen versión fija).
  rutas.registerRoute(function (o) { return /(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|esm\.sh|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(o.url.hostname); },
    new estrategias.CacheFirst({ cacheName: 'pc-librerias', plugins: [new Respuestas({ statuses: [0, 200] }), new Vence({ maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 90 })] }));
  // Teselas de las láminas que ya se miraron.
  rutas.registerRoute(function (o) { return o.url.hostname.indexOf('openslide-demo-site') >= 0; },
    new estrategias.CacheFirst({ cacheName: 'pc-laminas', plugins: [new Respuestas({ statuses: [0, 200] }), new Vence({ maxEntries: 800, maxAgeSeconds: 60 * 60 * 24 * 30 })] }));
}

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
