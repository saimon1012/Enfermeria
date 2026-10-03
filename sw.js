// ============================================================
// sw.js — Service Worker: caché offline con estrategia cache-first
//
// IMPORTANTE: cada vez que cambies CUALQUIER archivo del proyecto,
// sube también CACHE_NAME (ej. 'v5' → 'v6'). Si no lo subes, los
// teléfonos que ya instalaron la app van a seguir viendo la versión
// vieja guardada en caché, sin importar que subas cambios a Vercel.
// ============================================================

const CACHE_NAME = 'enfermeria-pwa-v8'; // v7: agregada la vista Ajustes (instalar, actualizar, estado offline)

const ARCHIVOS_APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/js/subnav.js',
  '/js/ajustes.js',
  '/js/modules/goteo.js',
  '/js/modules/conversor-unidades.js',
  '/js/modules/dosificacion.js',
  '/js/modules/flashcards-morfologia.js',
  '/js/modules/calculadoras-nutricion.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// ---------- Instalación: descarga y guarda el App Shell ----------
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS_APP_SHELL))
      .catch((error) => {
        console.error('Error crítico: no se pudo precargar el App Shell.', error);
      })
  );
  self.skipWaiting(); // activa el nuevo Service Worker sin esperar a cerrar todas las pestañas
});

// ---------- Activación: borra cachés de versiones anteriores ----------
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombresCache) =>
      Promise.all(
        nombresCache
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim(); // toma control de las pestañas abiertas de inmediato
});

// ---------- Fetch: cache-first, con red como respaldo ----------
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request).then((respuestaEnCache) => {
      if (respuestaEnCache) return respuestaEnCache;

      return fetch(evento.request)
        .then((respuestaDeRed) => {
          const copia = respuestaDeRed.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, copia));
          return respuestaDeRed;
        })
        .catch(() => {
          // Sin caché y sin red: no hay nada que devolver para este archivo.
        });
    })
  );
});
