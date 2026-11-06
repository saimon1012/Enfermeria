// ============================================================
// ajustes.js — Vista Ajustes: instalación PWA + updates SW
// ============================================================

(function () {
  // ----------------------------------------------------------
  // INSTALACIÓN PWA
  // ----------------------------------------------------------
  let promptInstalacion = null;
  const btnInstalar = document.getElementById('btn-instalar-app');

  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    promptInstalacion = evento;
    if (btnInstalar) btnInstalar.hidden = false;
  });

  btnInstalar?.addEventListener('click', async () => {
    if (!promptInstalacion) return;
    promptInstalacion.prompt();
    const resultado = await promptInstalacion.userChoice;
    if (resultado.outcome === 'accepted') {
      if (btnInstalar) btnInstalar.hidden = true;
    }
    promptInstalacion = null;
  });

  window.addEventListener('appinstalled', () => {
    if (btnInstalar) btnInstalar.hidden = true;
    promptInstalacion = null;
  });

  // ----------------------------------------------------------
  // Buscar actualizaciones (mensaje al SW)
  // ----------------------------------------------------------
  const btnActualizar = document.getElementById('btn-buscar-actualizaciones');

  btnActualizar?.addEventListener('click', () => {
    const sw = navigator.serviceWorker?.controller;
    if (sw) {
      sw.postMessage({ type: 'CHECK_UPDATE' });
    } else if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }
  });

  navigator.serviceWorker?.addEventListener('message', (evento) => {
    if (evento.data?.type === 'UPDATE_CHECKED' && btnActualizar) {
      const textoOriginal = btnActualizar.textContent;
      btnActualizar.textContent = '✓ Buscando...';
      setTimeout(() => { btnActualizar.textContent = textoOriginal; }, 1500);
    }
  });
})();
