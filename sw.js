// ============================================================
// sw.js — Service Worker FABSI
//
// Estrategia mixta:
//   · App Shell (HTML/CSS/JS/iconos): stale-while-revalidate
//   · Navegaciones: network-first con fallback a index.html
//   · Peticiones externas: pass-through
//
// Actualización controlada via postMessage:
//   · 'SKIP_WAITING' → activa la nueva versión ya
//   · 'CHECK_UPDATE' → fuerza verificación manual
//
// IMPORTANTE: al cambiar cualquier archivo del proyecto, sube
// CACHE_VERSION (ej. 'v9' → 'v10').
// ============================================================

const CACHE_VERSION = 'enfermeria-pwa-v11';
const CACHE_NAME = CACHE_VERSION;

const ARCHIVOS_APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './js/subnav.js',
  './js/ajustes.js',
  './js/modules/goteo.js',
  './js/modules/conversor-unidades.js',
  './js/modules/dosificacion.js',
  './js/modules/flashcards-morfologia.js',
  './js/modules/flashcards-psicologia.js',
  './js/modules/calculadoras-nutricion.js',
  './js/modules/bioquimica.js',
  './js/modules/farmacologia.js',
  './js/modules/materno-infantil.js',
  './js/modules/anatomia.js',
  './js/modules/microbiologia.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// ------------------------------------------------------------
// INSTALL: precachea el App Shell (sin skipWaiting automático)
// ------------------------------------------------------------
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS_APP_SHELL))
      .catch((error) => {
        console.error('[SW] Error al precachear App Shell:', error);
      })
  );
});

// ------------------------------------------------------------
// ACTIVATE: limpia cachés viejas y toma control
// ------------------------------------------------------------
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombresCache) =>
      Promise.all(
        nombresCache
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => {
            console.log('[SW] Eliminando caché obsoleta:', nombre);
            return caches.delete(nombre);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ------------------------------------------------------------
// FETCH: estrategia mixta
// ------------------------------------------------------------
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  const url = new URL(evento.request.url);
  if (!url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;

  if (evento.request.mode === 'navigate') {
    evento.respondWith(networkFirstNavigation(evento.request));
    return;
  }

  evento.respondWith(staleWhileRevalidate(evento.request));
});

async function networkFirstNavigation(request) {
  try {
    const red = await fetch(request);
    if (red && red.ok) {
      const copia = red.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, copia);
    }
    return red;
  } catch (_) {
    const fallback = await caches.match('./index.html');
    if (fallback) return fallback;
    return caches.match(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cacheado = await cache.match(request);

  const fetchAndUpdate = fetch(request)
    .then(async (red) => {
      if (red && red.ok) {
        await cache.put(request, red.clone());
      }
      return red;
    })
    .catch(() => null);

  return cacheado || (await fetchAndUpdate);
}

// ------------------------------------------------------------
// MESSAGE: control desde el cliente
// ------------------------------------------------------------
self.addEventListener('message', (evento) => {
  const data = evento.data || {};

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'CHECK_UPDATE') {
    evento.waitUntil(
      self.registration.update()
        .then(() => {
          evento.source?.postMessage({ type: 'UPDATE_CHECKED' });
        })
        .catch(() => {
          evento.source?.postMessage({ type: 'UPDATE_FAILED' });
        })
    );
  }
});
