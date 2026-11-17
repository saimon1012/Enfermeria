// ============================================================
// service-worker.js — FABSI · TSU Enfermería
// Versión 2.1 (Cache tolerante a fallos)
// ============================================================

const VERSION = 'fabsi-v7';

const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/datos-pensum.js',
  './js/app.js',
  './js/goteo.js',
  './js/dosificacion.js',
  './js/conversor-unidades.js',
  './js/bioquimica.js',
  './js/calculadoras-nutricion.js',
  './js/materno-infantil.js',
  './js/flashcards-morfologia.js',
  './js/flashcards-psicologia.js',
  './js/anatomia.js',
  './js/farmacologia.js',
  './js/microbiologia.js',
  './js/flashcards-etica.js',
  './js/flashcards-fisiologia.js',
  './js/flashcards-medico-quirurgico.js',
  './js/flashcards-materno-2.js',
  './js/flashcards-salud-mental.js',
  './js/flashcards-medico-quirurgico-2.js',
  './js/flashcards-administracion.js',
  './js/flashcards-comunitaria.js',
  './js/flashcards-pasantia.js',
  './iconos/icon-192.png',
  './iconos/icon-512.png'
];

// ---------- INSTALL: cachea uno por uno (tolerante a fallos) ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => {
      return Promise.all(
        ARCHIVOS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('SW: no se pudo cachear', url, err);
          })
        )
      );
    })
  );
});

// ---------- ACTIVATE: limpia cachés viejos ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ---------- FETCH: Cache First ----------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const copia = response.clone();
          return caches
            .open(VERSION)
            .then((cache) => cache.put(event.request, copia))
            .then(() => response);
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// ---------- MESSAGE: el cliente pide activar nueva versión ----------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
