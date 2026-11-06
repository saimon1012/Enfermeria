// ============================================================
// subnav.js — Control universal de subpestañas internas
// ============================================================

document.addEventListener('click', (evento) => {
  // Buscar si se hizo clic en un botón de subnavegación ([data-subvista])
  const botonSub = evento.target.closest('[data-subvista]');
  if (!botonSub) return;

  // Encontrar la sección o vista padre donde está el submenú
  const vistaActual = botonSub.closest('.vista') || botonSub.closest('section');
  if (!vistaActual) return;

  const destino = botonSub.dataset.subvista;

  // 1. Actualizar el estado visual de los botones (aria-pressed) solo en esta vista
  vistaActual.querySelectorAll('[data-subvista]').forEach((btn) => {
    const esActivo = btn === botonSub;
    btn.setAttribute('aria-pressed', esActivo ? 'true' : 'false');
  });

  // 2. Mostrar el contenido correspondiente y ocultar los demás dentro de esta vista
  vistaActual.querySelectorAll('[data-subvista-contenido]').forEach((contenido) => {
    const coincide = contenido.dataset.subvistaContenido === destino;
    contenido.hidden = !coincide;
  });
});
