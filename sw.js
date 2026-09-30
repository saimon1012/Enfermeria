const CACHE_NAME = 'enfermeria-pwa-v3'; // Incrementamos a v3 para forzar la actualización en los teléfonos

// Lista corregida con rutas absolutas desde la raíz
const ARCHIVOS_APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/js/subnav.js',
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
      .then((cache) => {
        return cache.addAll(ARCHIVOS_APP_SHELL);
      })
      .catch((error) => {
        console.error('Error crítico: No se pudo precargar el App Shell. Verifica que todos los archivos existan en el proyecto.', error);
      })
  );
  self.skipWaiting();
});

// El resto de tus eventos (activate y fetch) se quedan exactamente igual a como los tenías...
