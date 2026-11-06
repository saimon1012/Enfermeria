// ============================================================
// subnav.js — Navegación interna de módulos (Práctico / Teórico)
//
// Maneja 3 niveles de anidamiento:
//
//   NIVEL 1 — Selector de semestre dentro del Teórico:
//     [data-semestre-teorico="1"|"2"] → [data-bloque-semestre="1"|"2"]
//
//   NIVEL 2 — Subvista por materia dentro del semestre:
//     [data-subvista="..."], [data-subvista-contenido="..."]
//     Se busca DENTRO del bloque de semestre para evitar colisiones
//     entre el 1° y el 2° semestre.
//
//   NIVEL 3 — Submenú interno de una materia (farmacología, materno):
//     [data-sub-farmaco="..."], [data-sub-farmaco-contenido="..."]
//     [data-sub-materno="..."], [data-sub-materno-contenido="..."]
//
// El módulo Práctico reutiliza el mismo motor del NIVEL 2 pero
// acotado a #vista-practico.
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Motor genérico: activa un grupo de botones ↔ paneles
  // ----------------------------------------------------------
  /**
   * @param {HTMLElement} contenedor  Raíz donde buscar botones y paneles
   * @param {string} atributoBoton    Ej. 'subvista'  (dataset: data-subvista)
   * @param {string} atributoPanel    Ej. 'subvistaContenido'
   * @param {string} atributoValor    Ej. 'subvista'  (clave del dataset a comparar)
   */
  function activarGrupo(contenedor, atributoBoton, atributoPanel, atributoValor) {
    if (!contenedor) return;

    const selectorBoton = `[data-${kebab(atributoBoton)}]`;
    const selectorPanel = `[data-${kebab(atributoPanel)}]`;

    const botones = contenedor.querySelectorAll(selectorBoton);
    const paneles = contenedor.querySelectorAll(selectorPanel);
    if (!botones.length) return;

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const objetivo = boton.dataset[atributoValor];

        botones.forEach((b) =>
          b.setAttribute('aria-pressed', String(b === boton))
        );
        paneles.forEach((panel) => {
          panel.hidden = panel.dataset[atributoPanel] !== objetivo;
        });
      });
    });
  }

  // Convierte camelCase → kebab-case para selectores CSS
  function kebab(s) {
    return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  }

  // ----------------------------------------------------------
  // NIVEL 1 — Selector de semestre dentro del Teórico
  // ----------------------------------------------------------
  function activarSelectorSemestreTeorico() {
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

        // Al cambiar de semestre, volver al top y re-inicializar
        // el subnav del bloque recién mostrado, porque sus botones
        // ya existían pero debían reflejar su estado inicial.
        window.scrollTo(0, 0);
      });
    });
  }

  // ----------------------------------------------------------
  // NIVEL 2 — Subnav dentro de cada bloque de semestre
  //
  // Importante: buscamos los botones DENTRO del bloque de cada
  // semestre para que el 1° y 2° no compartan listeners ni se
  // pisen los paneles (ambos tienen data-subvista, pero nombres
  // distintos: morfología/psicología/nutrición vs bioquímica/...).
  // ----------------------------------------------------------
  function activarSubnavPorSemestre() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    vista.querySelectorAll('[data-bloque-semestre]').forEach((bloque) => {
      activarGrupo(bloque, 'subvista', 'subvistaContenido', 'subvista');
    });
  }

  // ----------------------------------------------------------
  // NIVEL 3 — Submenús internos de materias del 2° semestre
  // ----------------------------------------------------------
  function activarSubmenusInternos() {
    const vista = document.getElementById('vista-teorico');
    if (!vista) return;

    // Farmacología: Flashcards ↔ Dosis pediátrica
    const bloqueFarmaco = vista.querySelector('[data-subvista-contenido="farmacologia"]');
    if (bloqueFarmaco) {
      activarGrupo(
        bloqueFarmaco,
        'subFarmaco',
        'subFarmacoContenido',
        'subFarmaco'
      );
    }

    // Materno Infantil: Flashcards ↔ Edad gestacional
    const bloqueMaterno = vista.querySelector('[data-subvista-contenido="materno-infantil"]');
    if (bloqueMaterno) {
      activarGrupo(
        bloqueMaterno,
        'subMaterno',
        'subMaternoContenido',
        'subMaterno'
      );
    }

    // Bioquímica: Glucosa ↔ Osmolaridad
    const bloqueBioq = vista.querySelector('[data-subvista-contenido="bioquimica"]');
    if (bloqueBioq) {
      // El toggle de tipo (glucosa / osmolaridad) usa data-tipo-bioq.
      // No usa paneles data-*-contenido, sino bloques con id:
      //   #bloque-bioq-glucosa y #bloque-bioq-osmolaridad.
      // Ese toggle ya lo maneja bioquimica.js para mantener el
      // estado de dirección de glucosa. No lo duplicamos aquí.
    }
  }

  // ----------------------------------------------------------
  // Módulo Práctico — subnav clásico (goteo / conversor / dosis)
  // ----------------------------------------------------------
  function activarSubnavPractico() {
    const vista = document.getElementById('vista-practico');
    if (!vista) return;
    activarGrupo(vista, 'subvista', 'subvistaContenido', 'subvista');
  }

  // ----------------------------------------------------------
  // Inicialización
  // ----------------------------------------------------------
  // El orden importa poco, pero dejamos primero el nivel más alto
  // (semestre) para que los bloques ocultos no interfieran.
  activarSelectorSemestreTeorico();
  activarSubnavPorSemestre();
  activarSubmenusInternos();
  activarSubnavPractico();

  // ----------------------------------------------------------
  // Refresco al mostrar la vista Teórico por primera vez
  // ----------------------------------------------------------
  // Cuando app.js cambia a la vista teórico, los listeners ya
  // están registrados (corren al cargar el DOM), así que no hace
  // falta re-inicializar. Pero si en el futuro agregas bloques
  // dinámicos (por ejemplo, desde un fetch), exponemos un hook:
  window.FABSI_subnavRefresh = function () {
    activarSelectorSemestreTeorico();
    activarSubnavPorSemestre();
    activarSubmenusInternos();
    activarSubnavPractico();
  };
})();
