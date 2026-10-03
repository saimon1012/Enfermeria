// ============================================================
// ajustes.js — Vista Ajustes: instalación, actualizaciones y estado offline
// ============================================================

(function () {
  // ---------- Referencias al DOM ----------
  const btnInstalar = document.getElementById('btn-instalar-app');
  const mensajeInstalar = document.getElementById('ajustes-mensaje-instalar');
  const btnActualizar = document.getElementById('btn-buscar-actualizaciones');
  const estadoActualizacion = document.getElementById('ajustes-estado-actualizacion');
  const estadoCache = document.getElementById('ajustes-estado-cache');
  const versionEl = document.getElementById('ajustes-version');

  if (!btnInstalar) return; // esta vista no está en el DOM, no hace nada

  // ============================================================
  // 1. INSTALACIÓN
  // ============================================================
  let eventoInstalacionDiferido = null;

  function appYaInstalada() {
    // 'display-mode: standalone' es el estándar; 'navigator.standalone' es el caso de iOS/Safari
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  if (appYaInstalada()) {
    mensajeInstalar.textContent = 'Ya está instalada en este dispositivo. ✅';
  }

  // Chrome dispara este evento SOLO si la app cumple los requisitos de instalación
  // (manifest válido + Service Worker + HTTPS) y no está instalada todavía.
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault(); // evita el mini-banner automático, mostramos nuestro propio botón
    eventoInstalacionDiferido = evento;
    btnInstalar.hidden = false;
    mensajeInstalar.textContent = 'Tu navegador permite instalarla. Toca el botón de abajo.';
  });

  btnInstalar.addEventListener('click', async () => {
    if (!eventoInstalacionDiferido) return;

    eventoInstalacionDiferido.prompt();
    const resultado = await eventoInstalacionDiferido.userChoice;

    if (resultado.outcome === 'accepted') {
      mensajeInstalar.textContent = '¡Instalada! Búscala en tu pantalla de inicio. ✅';
    } else {
      mensajeInstalar.textContent = 'Instalación cancelada. Puedes intentarlo de nuevo cuando quieras.';
    }

    eventoInstalacionDiferido = null;
    btnInstalar.hidden = true;
  });

  // Se dispara cuando la instalación se completa (por este botón o por el menú del navegador)
  window.addEventListener('appinstalled', () => {
    btnInstalar.hidden = true;
    mensajeInstalar.textContent = 'Ya está instalada en este dispositivo. ✅';
  });

  // ============================================================
  // 2. BUSCAR ACTUALIZACIONES
  // ============================================================
  if ('serviceWorker' in navigator) {
    let yaRecargando = false;

    // Cuando un Service Worker nuevo toma control (porque encontró una versión
    // distinta), recargamos la página una sola vez para que se vea lo nuevo.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (yaRecargando) return;
      yaRecargando = true;
      window.location.reload();
    });

    btnActualizar.addEventListener('click', async () => {
      estadoActualizacion.textContent = 'Buscando actualizaciones…';

      const registro = await navigator.serviceWorker.getRegistration();
      if (!registro) {
        estadoActualizacion.textContent = 'No se encontró el Service Worker. Intenta recargar la app primero.';
        return;
      }

      await registro.update();

      // Si en 3 segundos no se disparó 'controllerchange', no había nada nuevo.
      setTimeout(() => {
        if (!yaRecargando) {
          estadoActualizacion.textContent = 'Ya tienes la versión más reciente. ✅';
        }
      }, 3000);
    });
  } else {
    btnActualizar.disabled = true;
    estadoActualizacion.textContent = 'Tu navegador no soporta esta función.';
  }

  // ============================================================
  // 3. ESTADO DEL CACHÉ OFFLINE + VERSIÓN
  // ============================================================
  // Leemos el número de versión directo del nombre real del caché que
  // existe en el dispositivo — una sola fuente de verdad, en vez de
  // guardarlo por separado y arriesgarnos a que quede desincronizado.
  async function revisarEstadoCache() {
    if (!('caches' in window)) {
      estadoCache.textContent = 'Tu navegador no soporta uso sin conexión.';
      return;
    }

    const nombresCache = await caches.keys();
    const nombreAppShell = nombresCache.find((n) => n.startsWith('enfermeria-pwa-'));

    if (!nombreAppShell) {
      estadoCache.textContent = '⚠️ Aún no se guardó para uso sin conexión. Ábrela con internet y espera unos segundos.';
      versionEl.textContent = '—';
      return;
    }

    versionEl.textContent = nombreAppShell.replace('enfermeria-pwa-', '');

    const archivoClave = await caches.match('/index.html');
    estadoCache.textContent = archivoClave
      ? '✅ Lista para usar sin conexión a internet.'
      : '⚠️ El caché existe pero parece incompleto. Prueba "Buscar actualizaciones".';
  }

  revisarEstadoCache();
})();
