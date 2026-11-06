// ----------------------------------------------------------
  // NIVEL 1 — Selector de semestre dentro del Teórico
  // ----------------------------------------------------------
  function activarSelectorSemestreTeorico() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    // Buscamos los botones del selector de semestre específico del teórico
    const botones = vista.querySelectorAll('[data-semestre-teorico]');
    const bloques = vista.querySelectorAll('[data-bloque-semestre]');
    if (!botones.length || !bloques.length) return;

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const objetivo = boton.dataset.semestreTeorico;

        // Cambiamos el estado aria-pressed para mantener el estilo segmentado limpio
        botones.forEach((b) => {
          b.setAttribute('aria-pressed', String(b === boton));
        });

        // Mostramos u ocultamos el bloque correspondiente sin alterar otros estilos
        bloques.forEach((bloque) => {
          bloque.hidden = bloque.dataset.bloqueSemestre !== objetivo;
        });
      });
    });
  }
