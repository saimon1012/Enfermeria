// ============================================================
// subnav.js — Pestañas internas de cada módulo (Práctico / Teórico)
//
// Genérico y reutilizable: no sabe nada de goteo, flashcards, etc.
// Solo busca botones [data-subvista] y paneles [data-subvista-contenido]
// DENTRO de un mismo contenedor, y muestra el panel cuyo nombre coincide
// con el botón activo. Cada módulo (Práctico, Teórico) se conecta aparte
// para que sus pestañas no interfieran entre sí.
// ============================================================

(function () {
  function activarSubnav(contenedor) {
    const botones = contenedor.querySelectorAll('[data-subvista]');
    const paneles = contenedor.querySelectorAll('[data-subvista-contenido]');
    if (!botones.length) return;

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const objetivo = boton.dataset.subvista;

        botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
        paneles.forEach((panel) => {
          panel.hidden = panel.dataset.subvistaContenido !== objetivo;
        });

        // Sube el scroll al tope al cambiar de herramienta, igual que el router principal
        window.scrollTo(0, 0);
      });
    });
  }

  const vistaPractico = document.getElementById('vista-practico');
  const vistaTeorico = document.getElementById('vista-teorico');

  if (vistaPractico) activarSubnav(vistaPractico);
  if (vistaTeorico) activarSubnav(vistaTeorico);
})();
