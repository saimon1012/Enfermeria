// ============================================================
// sw.js — Service Worker: caché offline con estrategia cache-first
//
// Estrategia: al instalar, descarga y guarda TODOS los archivos de la
// app (App Shell completo). Al pedir cualquier archivo, primero mira si
// ya está en caché (responde al instante, funciona sin internet); si no
// está, lo busca en la red.
//
// IMPORTANTE: cada vez que cambies CUALQUIER archivo del proyecto,
// sube también CACHE_NAME (ej. 'v1' → 'v2'). Si no lo subes, los
// teléfonos que ya instalaron la app van a seguir viendo la versión
// vieja guardada en caché, sin importar que subas cambios a Vercel.
// ============================================================

const CACHE_NAME = 'enfermeria-pwa-v1';

// Lista de todo lo que se debe poder abrir sin internet
const ARCHIVOS_APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './js/subnav.js',
  './js/modules/goteo.js',
  './js/modules/conversor-unidades.js',
  './js/modules/dosificacion.js',
  './js/modules/flashcards-morfologia.js',
  './js/modules/calculadoras-nutricion.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// ---------- Instalación: descarga y guarda el App Shell ----------
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_APP_SHELL))
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
  // Solo intervenimos peticiones GET; deja pasar todo lo demás sin tocar
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request).then((respuestaEnCache) => {
      if (respuestaEnCache) return respuestaEnCache;

      return fetch(evento.request)
        .then((respuestaDeRed) => {
          // Guarda en caché una copia de cualquier archivo nuevo que se pida
          // con éxito (ej. si agregamos módulos después), para que la próxima
          // vez también funcione offline.
          const copia = respuestaDeRed.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, copia));
          return respuestaDeRed;
        })
        .catch(() => {
          // Sin caché y sin red: no hay nada que devolver para este archivo.
          // (La navegación principal ya está cubierta por './' e './index.html'
          // en el App Shell, así que esto solo afecta a archivos sueltos.)
        });
    })
  );
});
