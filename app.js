// ============================================================
// app.js — Control de Vistas, Pensum, Modo guardia y Update SW
// ============================================================

const VISTAS = {
  inicio:           { seccion: 'vista-inicio',           titulo: 'Inicio' },
  semestres:        { seccion: 'vista-semestres',        titulo: 'Plan de Estudios' },
  practico:         { seccion: 'vista-practico',         titulo: 'Central de Prácticas' },
  teorico:          { seccion: 'vista-teorico',          titulo: 'Módulo Teórico' },
  'semestre-2':     { seccion: 'vista-semestre-2',     titulo: '2.° Semestre' }, // <- Vista independiente del 2do semestre
  ajustes:          { seccion: 'vista-ajustes',          titulo: 'Ajustes' },
};

const tituloEl = document.getElementById('vista-titulo');

// ------------------------------------------------------------
// Datos del pensum (Plan 2010 UNEFA) — Escalable para 1 al 5
// ------------------------------------------------------------
const DATOS_SEMESTRES = {
  1: {
    titulo: '1.er Semestre',
    desc: 'Bases biológicas, morfología y fundamentos de enfermería.',
    items: [
      { icono: '💉', texto: 'Módulo Práctico', desc: 'Goteo, dosificación y conversor de unidades.', ir: 'practico' },
      { icono: '🦴', texto: 'Módulo Teórico', desc: 'Flashcards de Morfología, Psicología y Nutrición.', ir: 'teorico' },
      { icono: '🧠', texto: 'Psicología General y Social', desc: 'Bases de la conducta y relación enfermero-paciente.', ir: 'teorico' },
    ],
  },
  2: {
    titulo: '2.do Semestre',
    desc: 'Bioquímica, farmacología fundamental, microbiología y anatomía.',
    items: [
      { icono: '🧬', texto: 'Asignaturas del 2.° Semestre', desc: 'Bioquímica, Farmacología, Materno-Infantil, Anatomía y Microbiología.', ir: 'semestre-2' },
    ],
  },
  3: {
    titulo: '3.er Semestre',
    desc: 'Enfermería medicoquirúrgica I y fisiopatología clínica.',
    items: [
      { icono: '🏥', texto: 'Enfermería Médico-Quirúrgico I', desc: 'Valoración de pacientes adultos y perioperatorio.', ir: '' },
      { icono: '🔬', texto: 'Fisiopatología', desc: 'Alteraciones funcionales del organismo humano.', ir: '' },
    ],
  },
  4: {
    titulo: '4.to Semestre',
    desc: 'Salud mental, psiquiatría y enfermería comunitaria.',
    items: [
      { icono: '🧩', texto: 'Salud Mental y Psiquiatría', desc: 'Abordaje clínico y guías de PAE.', ir: '' },
      { icono: '🏡', texto: 'Enfermería Comunitaria', desc: 'Atención primaria en salud y epidemiología.', ir: '' },
    ],
  },
  5: {
    titulo: '5.to Semestre',
    desc: 'Práctica profesional y consolidación de pasantías.',
    items: [
      { icono: '🩺', texto: 'Pasantía Hospitalaria', desc: 'Procedimientos avanzados en áreas críticas.', ir: '' },
      { icono: '🤝', texto: 'Pasantía Comunitaria', desc: 'Planes de atención integral en comunidades.', ir: '' },
    ],
  },
};

// ------------------------------------------------------------
// Control de vistas
// ------------------------------------------------------------
function mostrarVista(nombreVista) {
  const vista = VISTAS[nombreVista];
  if (!vista) return;

  document.querySelectorAll('[data-vista]').forEach((seccion) => {
    seccion.hidden = seccion.id !== vista.seccion;
  });

  if (tituloEl) tituloEl.textContent = vista.titulo;

  document.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    const esActivo = btn.dataset.irA === nombreVista;
    if (esActivo) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  window.scrollTo(0, 0);
}

// ------------------------------------------------------------
// Render dinámico de semestres
// ------------------------------------------------------------
function seleccionarSemestre(num) {
  num = String(num);

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.setAttribute('aria-selected', btn.dataset.semestre === num ? 'true' : 'false');
  });

  const sem = DATOS_SEMESTRES[num];
  if (!sem) return;

  const tituloSem = document.getElementById('semestre-titulo');
  const descSem = document.getElementById('semestre-desc');
  const grid = document.getElementById('semestre-contenido-grid');
  if (!grid) return;

  if (tituloSem) tituloSem.textContent = sem.titulo;
  if (descSem) descSem.textContent = sem.desc;

  grid.innerHTML = '';
  sem.items.forEach((item) => {
    const tarjeta = document.createElement(item.ir ? 'a' : 'div');
    tarjeta.className = 'card';

    if (item.ir) {
      tarjeta.href = '#';
      tarjeta.dataset.irA = item.ir;
    } else {
      tarjeta.setAttribute('aria-disabled', 'true');
      tarjeta.classList.add('card--deshabilitada');
    }

    tarjeta.innerHTML = `
      <span class="card__icono" aria-hidden="true">${item.icono}</span>
      <span class="card__texto">
        <strong>${item.texto}</strong>
        <small>${item.desc}</small>
      </span>
    `;
    grid.appendChild(tarjeta);
  });
}

// ------------------------------------------------------------
// Delegación global: tabs + navegación
// ------------------------------------------------------------
document.body.addEventListener('click', (evento) => {
  const tab = evento.target.closest('.tab-btn[data-semestre]');
  if (tab) {
    seleccionarSemestre(tab.dataset.semestre);
    return;
  }

  const nav = evento.target.closest('[data-ir-a]');
  if (!nav || nav.disabled) return;

  evento.preventDefault();

  const semestreObjetivo = nav.dataset.abrirSemestre;
  if (semestreObjetivo) seleccionarSemestre(semestreObjetivo);

  mostrarVista(nav.dataset.irA);
});

// ------------------------------------------------------------
// Indicador de conexión
// ------------------------------------------------------------
const badgeConexion = document.getElementById('estado-conexion');
function actualizarEstadoConexion() {
  if (!badgeConexion) return;
  const enLinea = navigator.onLine;
  badgeConexion.textContent = enLinea ? 'En línea' : 'Sin conexión';
  badgeConexion.classList.toggle('app-header__badge--online', enLinea);
}
window.addEventListener('online', actualizarEstadoConexion);
window.addEventListener('offline', actualizarEstadoConexion);
actualizarEstadoConexion();

// ------------------------------------------------------------
// Modo guardia (persistente)
// ------------------------------------------------------------
const CLAVE_MODO = 'fabsi:modo';
const toggleGuardia = document.getElementById('toggle-modo-guardia');

function aplicarModoGuardia(activo) {
  document.documentElement.dataset.modo = activo ? 'guardia' : '';
}

try {
  if (localStorage.getItem(CLAVE_MODO) === 'guardia') {
    aplicarModoGuardia(true);
    if (toggleGuardia) toggleGuardia.checked = true;
  }
} catch (_) { /* localStorage no disponible */ }

if (toggleGuardia) {
  toggleGuardia.addEventListener('change', (e) => {
    const activo = e.target.checked;
    aplicarModoGuardia(activo);
    try { localStorage.setItem(CLAVE_MODO, activo ? 'guardia' : ''); }
    catch (_) { /* silencioso */ }
  });
}

// ------------------------------------------------------------
// Registro de Service Worker + aviso de actualización
// ------------------------------------------------------------
(function () {
  if (!('serviceWorker' in navigator)) return;

  let swRegistrado = null;
  let recargaPendiente = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargaPendiente) {
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        swRegistrado = reg;

        if (reg.waiting && navigator.serviceWorker.controller) {
          mostrarBannerActualizacion(reg.waiting);
        }

        reg.addEventListener('updatefound', () => {
          const nuevoSW = reg.installing;
          if (!nuevoSW) return;
          nuevoSW.addEventListener('statechange', () => {
            if (nuevoSW.state === 'installed' && navigator.serviceWorker.controller) {
              mostrarBannerActualizacion(nuevoSW);
            }
          });
        });
      })
      .catch((error) => {
        console.error('[FABSI] Error al registrar SW:', error);
      });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && swRegistrado) {
      swRegistrado.update().catch(() => {});
    }
  });

  function mostrarBannerActualizacion(swEsperando) {
    if (document.getElementById('banner-update')) return;

    const banner = document.createElement('div');
    banner.id = 'banner-update';
    banner.className = 'banner-update';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <span class="banner-update__texto">
        <strong>Nueva versión disponible</strong>
        <small>Actualiza para ver los últimos cambios.</small>
      </span>
      <button type="button" class="banner-update__boton" id="btn-aplicar-update">
        Actualizar
      </button>
      <button type="button" class="banner-update__cerrar" aria-label="Cerrar aviso" id="btn-cerrar-update">×</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('btn-cerrar-update')?.addEventListener('click', () => {
      banner.remove();
    });

    document.getElementById('btn-aplicar-update')?.addEventListener('click', () => {
      recargaPendiente = true;
      swEsperando.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        if (recargaPendiente) window.location.reload();
      }, 3000);
    });
  }
})();

// ------------------------------------------------------------
// Manejo de pestañas/subvistas internas (para cualquier vista con materias o herramientas)
// ------------------------------------------------------------
function inicializarSubvistasContenedor(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const botones = contenedor.querySelectorAll('[data-subvista]');
  const paneles = contenedor.querySelectorAll('[data-subvista-contenido]');

  botones.forEach((btn) => {
    btn.addEventListener('click', () => {
      const objetivo = btn.dataset.subvista;

      botones.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      paneles.forEach((panel) => {
        panel.hidden = panel.dataset.subvistaContenido !== objetivo;
      });
    });
  });
}

// Inicializar subvistas en el 2do semestre y en el teórico
inicializarSubvistasContenedor('vista-semestre-2');
inicializarSubvistasContenedor('vista-teorico');

// ------------------------------------------------------------
// Inicialización
// ------------------------------------------------------------
seleccionarSemestre(1);
mostrarVista('inicio');
