// ============================================================
// goteo.js — Módulo 1: Calculadora de goteo (macro/microgotero)
//
// Fórmula clínica estándar:
//   gotas/min = (Volumen en ml × Factor de goteo en gtt/ml) / Tiempo en minutos
//
// Factor de goteo:
//   - Macrogotero: varía según el equipo (10, 15 o 20 gtt/ml) — el estudiante
//     debe leerlo en el empaque del equipo de infusión que tiene en mano.
//   - Microgotero: siempre 60 gtt/ml, es un estándar fijo internacional.
// ============================================================

(function () {
  // ---------- Referencias al DOM ----------
  const botonesEquipo = document.querySelectorAll('[data-tipo-equipo]');
  const campoFactorMacro = document.getElementById('campo-factor-macro');
  const notaFactorMicro = document.getElementById('nota-factor-micro');
  const selectFactorMacro = document.getElementById('select-factor-macro');

  const inputVolumen = document.getElementById('input-volumen');
  const inputTiempo = document.getElementById('input-tiempo');
  const sufijoTiempo = document.getElementById('sufijo-tiempo');
  const botonesUnidadTiempo = document.querySelectorAll('[data-unidad-tiempo]');

  const btnCalcular = document.getElementById('btn-calcular-goteo');
  const errorEl = document.getElementById('error-goteo');
  const resultadoEl = document.getElementById('resultado-goteo');
  const resultadoValorEl = document.getElementById('resultado-valor');
  const desgloseEl = document.getElementById('desglose-goteo');

  // Si esta vista no existe en el DOM (por ejemplo, script cargado en otra página
  // en el futuro), no continúa. Evita errores en consola por elementos nulos.
  if (!btnCalcular) return;

  // ---------- Estado local del formulario ----------
  let tipoEquipo = 'macro';     // 'macro' | 'micro'
  let unidadTiempo = 'horas';   // 'horas' | 'minutos'

  // ---------- Toggle: tipo de equipo (macro / micro) ----------
  botonesEquipo.forEach((boton) => {
    boton.addEventListener('click', () => {
      tipoEquipo = boton.dataset.tipoEquipo;

      // Marca visualmente cuál botón quedó activo (aria-pressed también
      // es lo que usa un lector de pantalla para anunciar el estado)
      botonesEquipo.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));

      const esMacro = tipoEquipo === 'macro';
      campoFactorMacro.hidden = !esMacro;
      notaFactorMicro.hidden = esMacro;

      ocultarResultadoYError();
    });
  });

  // ---------- Toggle: unidad de tiempo (horas / minutos) ----------
  botonesUnidadTiempo.forEach((boton) => {
    boton.addEventListener('click', () => {
      unidadTiempo = boton.dataset.unidadTiempo;
      botonesUnidadTiempo.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      sufijoTiempo.textContent = unidadTiempo === 'horas' ? 'h' : 'min';
      ocultarResultadoYError();
    });
  });

  // ---------- Cálculo principal ----------
  btnCalcular.addEventListener('click', calcularGoteo);

  function calcularGoteo() {
    ocultarResultadoYError();

    const volumen = parseFloat(inputVolumen.value);
    const tiempoIngresado = parseFloat(inputTiempo.value);

    // Validación clínica: un volumen o tiempo en 0/negativo/vacío no debe
    // devolver Infinity o NaN en pantalla — se corta acá con un mensaje claro.
    if (!volumen || volumen <= 0) {
      mostrarError('Ingresa un volumen mayor a 0 ml.');
      return;
    }
    if (!tiempoIngresado || tiempoIngresado <= 0) {
      mostrarError('Ingresa un tiempo de infusión mayor a 0.');
      return;
    }

    const factor = tipoEquipo === 'macro' ? parseInt(selectFactorMacro.value, 10) : 60;
    const tiempoMin = unidadTiempo === 'horas' ? tiempoIngresado * 60 : tiempoIngresado;

    const gotasPorMinutoExacto = (volumen * factor) / tiempoMin;
    const gotasPorMinuto = Math.round(gotasPorMinutoExacto); // no se puede contar una gota parcial

    const mlPorHora = (volumen / tiempoMin) * 60;

    mostrarResultado(gotasPorMinuto, {
      volumen,
      factor,
      tiempoMin,
      gotasPorMinutoExacto,
      mlPorHora,
    });
  }

  function mostrarError(mensaje) {
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  function ocultarResultadoYError() {
    errorEl.hidden = true;
    resultadoEl.hidden = true;
  }

  function mostrarResultado(gotasPorMinuto, datos) {
    resultadoValorEl.textContent = gotasPorMinuto;
    resultadoEl.hidden = false;

    // Desglose pedagógico: se muestra la fórmula con los números reales
    // sustituidos, no solo el resultado final — el objetivo es que el
    // estudiante entienda el procedimiento, no que memorice un número.
    desgloseEl.innerHTML = `
      <p><strong>Fórmula:</strong> gotas/min = (Volumen × Factor) ÷ Tiempo en minutos</p>
      <p>
        gotas/min = (${datos.volumen} ml × ${datos.factor} gtt/ml) ÷ ${datos.tiempoMin} min
      </p>
      <p>
        gotas/min = ${(datos.volumen * datos.factor).toFixed(1)} ÷ ${datos.tiempoMin}
        = ${datos.gotasPorMinutoExacto.toFixed(2)} → se redondea a
        <strong>${gotasPorMinuto} gotas/min</strong>
      </p>
      <p class="resultado__equivalente">Equivale a ${datos.mlPorHora.toFixed(1)} ml/hora.</p>
    `;
  }
})();
