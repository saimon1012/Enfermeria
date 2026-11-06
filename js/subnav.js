// ============================================================
// subnav.js — Navegación interna anidada (Práctico / Teórico)
//
// Arquitectura de 3 niveles dentro de #vista-teorico:
//
//   N1  [data-semestre-teorico]  ↔  [data-bloque-semestre]
//   N2  [data-subvista]          ↔  [data-subvista-contenido]
//       (acotado por bloque de semestre para evitar colisiones)
//   N3  [data-tipo-bioq]         ↔  [data-tipo-bioq-contenido]
//       [data-sub-farmaco]       ↔  [data-sub-farmaco-contenido]
//       [data-sub-materno]       ↔  [data-sub-materno-contenido]
//
// El módulo Práctico reutiliza el motor de N2, acotado a #vista-practico.
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Motor genérico reutilizable
  //
  // @param {HTMLElement} contenedor  Raíz donde buscar botones y paneles
  // @param {string}      keyBoton    Propiedad de dataset del botón (camelCase)
  // @param {string}      keyPanel    Propiedad de dataset del panel (camelCase)
  // ----------------------------------------------------------
  function activarGrupo(contenedor, keyBoton, keyPanel) {
    if (!contenedor) return;

    const selBoton = `[data-${kebab(keyBoton)}]`;
    const selPanel = `[data-${kebab(keyPanel)}]`;

    const botones = contenedor.querySelectorAll(selBoton);
    const paneles = contenedor.querySelectorAll(selPanel);
    if (!botones.length || !paneles.length) return;

    // Normaliza: panel más cercano por data-* a cada botón, pero
    // como en este proyecto los grupos están en un solo scope,
    // basta con comparar por valor.
    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const objetivo = boton.dataset[keyBoton];

        botones.forEach((b) =>
          b.setAttribute('aria-pressed', String(b === boton))
        );

        paneles.forEach((panel) => {
          panel.hidden = panel.dataset[keyPanel] !== objetivo;
        });
      });
    });
  }

  // camelCase → kebab-case (para selectores CSS válidos)
  function kebab(s) {
    return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  }

  // ----------------------------------------------------------
  // N1 — Selector de semestre dentro del Teórico
  // ----------------------------------------------------------
  function montarN1() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    const botones = vista.querySelectorAll('[data-semestre-teorico]');
    const bloques = vista.querySelectorAll('[data-bloque-semestre]');
    if (!botones.length || !bloques.length) return;

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const objetivo = boton.dataset.semestreTeorico;

        botones.forEach((b) =>
          b.setAttribute('aria-pressed', String(b === boton))
        );
        bloques.forEach((bloque) => {
          bloque.hidden = bloque.dataset.bloqueSemestre !== objetivo;
        });

        // Al cambiar de semestre, subir al top (misma UX que el router)
        window.scrollTo(0, 0);
      });
    });
  }

  // ----------------------------------------------------------
  // N2 — Subnav de materias, uno por bloque de semestre
  //
  // Se monta POR BLOQUE para que cada semestre tenga sus propios
  // listeners. Si algún día el 3° semestre se agrega, solo hay que
  // meter su bloque en el HTML y este código lo detecta sin tocar.
  // ----------------------------------------------------------
  function montarN2() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    vista.querySelectorAll('[data-bloque-semestre]').forEach((bloque) => {
      activarGrupo(bloque, 'subvista', 'subvistaContenido');
    });
  }

  // ----------------------------------------------------------
  // N3 — Submenús internos por materia
  //
  // Se acotan al contenedor del panel de la materia para no
  // interferir con otros submenús del mismo bloque.
  // ----------------------------------------------------------
  function montarN3() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    // Bioquímica: Glucosa ↔ Osmolaridad
    const panelBioq = vista.querySelector('[data-subvista-contenido="bioquimica"]');
    activarGrupo(panelBioq, 'tipoBioq', 'tipoBioqContenido');

    // Farmacología: Flashcards ↔ Dosis pediátrica
    const panelFarma = vista.querySelector('[data-subvista-contenido="farmacologia"]');
    activarGrupo(panelFarma, 'subFarmaco', 'subFarmacoContenido');

    // Materno: Flashcards ↔ Edad gestacional
    const panelMaterno = vista.querySelector('[data-subvista-contenido="materno-infantil"]');
    activarGrupo(panelMaterno, 'subMaterno', 'subMaternoContenido');
  }

  // ----------------------------------------------------------
  // Práctico — reutiliza el motor de N2, acotado a #vista-practico
  // ----------------------------------------------------------
  function montarPractico() {
    const vista = document.getElementById('vista-practico');
    if (!vista) return;
    activarGrupo(vista, 'subvista', 'subvistaContenido');
  }

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  montarN1();
  montarN2();
  montarN3();
  montarPractico();

  // Hook por si en el futuro agregas bloques dinámicos (fetch, etc.)
  window.FABSI_subnavRefresh = function () {
    montarN1();
    montarN2();
    montarN3();
    montarPractico();
  };
})();
