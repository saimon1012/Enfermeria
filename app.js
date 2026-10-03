// ============================================================
// app.js — Fase 1: solo cambio de vista (sin hash routing todavía,
// sin IndexedDB, sin Service Worker). Eso llega en fases posteriores.
// ============================================================

// Mapea el nombre lógico de cada vista a su <section> y a su título de header
const VISTAS = {
  inicio:   { seccion: 'vista-inicio',   titulo: 'Inicio' },
  practico: { seccion: 'vista-practico', titulo: 'Módulo Práctico' },
  teorico:  { seccion: 'vista-teorico',  titulo: 'Módulo Teórico' },
  ajustes:  { seccion: 'vista-ajustes',  titulo: 'Ajustes' },
};

const tituloEl = document.getElementById('vista-titulo');

/**
 * Muestra la vista solicitada y oculta el resto.
 * @param {string} nombreVista - clave de VISTAS (ej. 'practico')
 */
function mostrarVista(nombreVista) {
  const vista = VISTAS[nombreVista];
  if (!vista) return; // evita romper si data-ir-a trae un valor no mapeado

  // Oculta todas las <section data-vista>, muestra solo la que corresponde
  document.querySelectorAll('[data-vista]').forEach((seccion) => {
    seccion.hidden = seccion.id !== vista.seccion;
  });

  // Actualiza el título del header para dar contexto de "dónde estoy"
  tituloEl.textContent = vista.titulo;

  // Actualiza el estado visual activo en la navegación inferior
  document.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    const esActivo = btn.dataset.irA === nombreVista;
    if (esActivo) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  // Sube el scroll al tope al cambiar de vista (evita quedar a media pantalla)
  window.scrollTo(0, 0);
}

// Delegación de eventos: un solo listener en <body> captura clics
// tanto de las tarjetas del Inicio como de los botones de la nav inferior.
document.body.addEventListener('click', (evento) => {
  const disparador = evento.target.closest('[data-ir-a]');
  if (!disparador || disparador.disabled) return;

  evento.preventDefault();
  mostrarVista(disparador.dataset.irA);
});

// ---------- Estado de conexión (indicador visual, sin lógica offline real aún) ----------
const badgeConexion = document.getElementById('estado-conexion');

function actualizarEstadoConexion() {
  const enLinea = navigator.onLine;
  badgeConexion.textContent = enLinea ? 'En línea' : 'Sin conexión';
  badgeConexion.classList.toggle('app-header__badge--online', enLinea);
}

window.addEventListener('online', actualizarEstadoConexion);
window.addEventListener('offline', actualizarEstadoConexion);
actualizarEstadoConexion(); // estado inicial al cargar la app

// ---------- Registro del Service Worker (caché offline) ----------
// 'serviceWorker' en navigator no existe en navegadores muy viejos, y
// SIEMPRE es undefined si la página se abre como file:// — por eso esto
// nunca corre en index-movil.html, solo en la versión desplegada (https).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('No se pudo registrar el Service Worker:', error);
    });
  });
}
