// ============================================================
// dosificacion.js — Módulo 1: Regla de tres para dosificación
//
// AMPOLLA / LÍQUIDO:
//   dosisDisponible mg ---- volumenDisponible ml
//   dosisIndicada    mg ---- ?  ml
//   ? = (dosisIndicada × volumenDisponible) ÷ dosisDisponible
//
// TABLETA:
//   dosisDisponibleTab mg ---- 1 tableta
//   dosisIndicada      mg ---- ?  tabletas
//   ? = dosisIndicada ÷ dosisDisponibleTab
// ============================================================

(function () {
  // ---------- Referencias al DOM ----------
  const botonesTipo = document.querySelectorAll('[data-tipo-dosificacion]');
  const bloqueAmpolla = document.getElementById('bloque-ampolla');
  const bloqueTableta = document.getElementById('bloque-tableta');

  const inputDosisIndicada = document.getElementById('input-dosis-indicada');
  const inputDosisDisponibleAmp = document.getElementById('input-dosis-disponible-amp');
  const inputVolumenDisponibleAmp = document.getElementById('input-volumen-disponible-amp');
  const inputDosisDisponibleTab = document.getElementById('input-dosis-disponible-tab');

  const btnCalcular = document.getElementById('btn-calcular-dosis');
  const btnLimpiar = document.getElementById('btn-limpiar-dosis');
  const errorEl = document.getElementById('error-dosis');
  const resultadoEl = document.getElementById('resultado-dosis');
  const resultadoValorEl = document.getElementById('resultado-dosis-valor');
  const resultadoUnidadEl = document.getElementById('resultado-dosis-unidad');
  const desgloseEl = document.getElementById('desglose-dosis');

  if (!btnCalcular) return; // esta vista no está en el DOM, no hace nada

  let tipoActual = 'ampolla'; // 'ampolla' | 'tableta'

  // ---------- Toggle: Ampolla / Tableta ----------
  botonesTipo.forEach((boton) => {
    boton.addEventListener('click', () => {
      tipoActual = boton.dataset.tipoDosificacion;
      botonesTipo.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));

      const esAmpolla = tipoActual === 'ampolla';
      bloqueAmpolla.hidden = !esAmpolla;
      bloqueTableta.hidden = esAmpolla;

      ocultarResultadoYError();
    });
  });

  // ---------- Cálculo principal ----------
  btnCalcular.addEventListener('click', calcularDosis);
  btnLimpiar.addEventListener('click', limpiarDosis);

  function limpiarDosis() {
    inputDosisIndicada.value = '';
    inputDosisDisponibleAmp.value = '';
    inputVolumenDisponibleAmp.value = '';
    inputDosisDisponibleTab.value = '';

    // Vuelve a "Ampolla (líquido)" (opción por defecto)
    tipoActual = 'ampolla';
    botonesTipo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tipoDosificacion === 'ampolla')));
    bloqueAmpolla.hidden = false;
    bloqueTableta.hidden = true;

    ocultarResultadoYError();
    inputDosisIndicada.focus();
  }

  function calcularDosis() {
    ocultarResultadoYError();

    const dosisIndicada = parseFloat(inputDosisIndicada.value);
    if (!dosisIndicada || dosisIndicada <= 0) {
      mostrarError('Ingresa la dosis indicada (mayor a 0).');
      return;
    }

    if (tipoActual === 'ampolla') {
      calcularAmpolla(dosisIndicada);
    } else {
      calcularTableta(dosisIndicada);
    }
  }

  function calcularAmpolla(dosisIndicada) {
    const dosisDisponible = parseFloat(inputDosisDisponibleAmp.value);
    const volumenDisponible = parseFloat(inputVolumenDisponibleAmp.value);

    if (!dosisDisponible || dosisDisponible <= 0) {
      mostrarError('Ingresa la dosis disponible del frasco (mayor a 0).');
      return;
    }
    if (!volumenDisponible || volumenDisponible <= 0) {
      mostrarError('Ingresa el volumen del frasco (mayor a 0).');
      return;
    }

    const resultadoExacto = (dosisIndicada * volumenDisponible) / dosisDisponible;
    const resultado = parseFloat(resultadoExacto.toFixed(2));

    resultadoValorEl.textContent = resultado;
    resultadoUnidadEl.textContent = 'ml a administrar';
    resultadoEl.hidden = false;

    desgloseEl.innerHTML = `
      <p><strong>Regla de tres:</strong></p>
      <p class="regla-de-tres">
        ${dosisDisponible} mg &nbsp;——&nbsp; ${volumenDisponible} ml<br>
        ${dosisIndicada} mg &nbsp;——&nbsp; ? ml
      </p>
      <p>
        ? = (${dosisIndicada} × ${volumenDisponible}) ÷ ${dosisDisponible}
        = <strong>${resultado} ml</strong>
      </p>
    `;
  }

  function calcularTableta(dosisIndicada) {
    const dosisDisponibleTab = parseFloat(inputDosisDisponibleTab.value);

    if (!dosisDisponibleTab || dosisDisponibleTab <= 0) {
      mostrarError('Ingresa la dosis por tableta (mayor a 0).');
      return;
    }

    const resultadoExacto = dosisIndicada / dosisDisponibleTab;
    const resultado = parseFloat(resultadoExacto.toFixed(2));

    resultadoValorEl.textContent = resultado;
    resultadoUnidadEl.textContent = 'tabletas';
    resultadoEl.hidden = false;

    // Nota práctica: una tableta rara vez se parte en algo distinto a
    // mitades o cuartos. Si el resultado no cae en esas fracciones,
    // se lo advertimos al estudiante en vez de sugerir un corte imposible.
    const fraccionesComunes = [0, 0.25, 0.5, 0.75, 1];
    const parteDecimal = resultadoExacto % 1;
    const esFraccionPartible = fraccionesComunes.some((f) => Math.abs(parteDecimal - f) < 0.02);

    desgloseEl.innerHTML = `
      <p><strong>Regla de tres:</strong></p>
      <p class="regla-de-tres">
        ${dosisDisponibleTab} mg &nbsp;——&nbsp; 1 tableta<br>
        ${dosisIndicada} mg &nbsp;——&nbsp; ? tabletas
      </p>
      <p>
        ? = ${dosisIndicada} ÷ ${dosisDisponibleTab} = <strong>${resultado} tabletas</strong>
      </p>
      ${
        esFraccionPartible
          ? ''
          : `<p class="resultado__equivalente">
               ⚠ Este resultado no cae en una mitad o cuarto exacto de tableta.
               Verifica con tu docente o farmacéutico antes de administrar.
             </p>`
      }
    `;
  }

  function mostrarError(mensaje) {
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  function ocultarResultadoYError() {
    errorEl.hidden = true;
    resultadoEl.hidden = true;
  }
})();
