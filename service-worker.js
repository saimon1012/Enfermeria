// ============================================================
// service-worker.js — FABSI · TSU Enfermería
// Versión 2.0 (Arquitectura Dinámica)
// ============================================================

const VERSION = 'fabsi-v3';

const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/datos-pensum.js',
  './js/app.js',
  // Herramientas clínicas
  './js/goteo.js',
  './js/dosificacion.js',
  './js/conversor-unidades.js',
  './js/bioquimica.js',
  './js/calculadoras-nutricion.js',
  './js/materno-infantil.js',
  // Flashcards (Semestres 1, 2 y 3)
  './js/flashcards-morfologia.js',
  './js/flashcards-psicologia.js',
  './js/anatomia.js',
  './js/farmacologia.js',
  './js/microbiologia.js',
  './js/flashcards-etica.js',
  './js/flashcards-fisiologia.js',
  './js/flashcards-medico-quirurgico.js',
  './js/flashcards-materno-2.js',
  // Flashcards (Semestres 4 y 5)
  './js/flashcards-salud-mental.js',
  './js/flashcards-medico-quirurgico-2.js',
  './js/flashcards-administracion.js',
  './js/flashcards-comunitaria.js',
  './js/flashcards-pasantia.js',
  // Íconos
  './iconos/icon-192.png',
  './iconos/icon-512.png'
];

// ---------- INSTALL: guarda todo en caché ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => {
      return cache.addAll(ARCHIVOS);
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
  // Solo manejar GET
  if (event.request.method !== 'GET') return;

  // Ignorar peticiones a otros orígenes
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      // Si no está en caché, ir a la red y guardar copia
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copia = response.clone();
        caches.open(VERSION).then((cache) => cache.put(event.request, copia));
        return response;
      }).catch(() => {
        // Si falla la red y es una navegación, devolver el index cacheado
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
