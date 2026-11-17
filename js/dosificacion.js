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
//
// NOTA: la dosis indicada y la dosis disponible SIEMPRE se ingresan
// en la misma unidad (mg o g, a elección del usuario). Internamente
// se normalizan a mg antes de calcular, así la fórmula clínica no cambia.
// ============================================================

(function () {
  // ---------- Referencias al DOM ----------
  const botonesTipo = document.querySelectorAll('[data-tipo-dosificacion]');
  const bloqueAmpolla = document.getElementById('bloque-ampolla');
  const bloqueTableta = document.getElementById('bloque-tableta');

  const botonesUnidadDosis = document.querySelectorAll('[data-unidad-dosis]');
  const sufijosDosis = document.querySelectorAll('[data-sufijo-dosis]');

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

  // ---------- Helpers ----------
  // Acepta "0,5" y "0.5" (coma decimal es-VE y punto en-US).
  // Devuelve NaN si el valor no es un número válido.
  function parseNumero(valor) {
    if (typeof valor !== 'string') return NaN;
    const limpio = valor.trim().replace(',', '.');
    if (limpio === '') return NaN;
    const n = Number(limpio);
    return Number.isFinite(n) ? n : NaN;
  }

  // Escapa texto para insertarlo de forma segura en innerHTML.
  function escaparHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  // Formatea un número para mostrarlo: hasta 2 decimales, pero si es
  // muy pequeño (menos de 0.01) muestra más decimales para no perder
  // información clínica (ej. 0.001 ml no debe mostrarse como "0").
  function formatearResultado(n) {
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    if (Math.abs(n) < 0.01) {
      return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    }
    return parseFloat(n.toFixed(2)).toString();
  }

  let tipoActual = 'ampolla'; // 'ampolla' | 'tableta'
  let unidadDosis = 'mg';     // 'mg' | 'g'

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

  // ---------- Toggle: Unidad (mg / g) ----------
  botonesUnidadDosis.forEach((boton) => {
    boton.addEventListener('click', () => {
      unidadDosis = boton.dataset.unidadDosis;
      botonesUnidadDosis.forEach((b) =>
        b.setAttribute('aria-pressed', String(b === boton))
      );
      // Cambia el sufijo visible en los 3 campos de dosis
      sufijosDosis.forEach((span) => {
        span.textContent = unidadDosis;
      });
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

    // Vuelve a "Ampolla" (opción por defecto)
    tipoActual = 'ampolla';
    botonesTipo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tipoDosificacion === 'ampolla')));
    bloqueAmpolla.hidden = false;
    bloqueTableta.hidden = true;

    // Vuelve a "mg" (opción por defecto)
    unidadDosis = 'mg';
    botonesUnidadDosis.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unidadDosis === 'mg')));
    sufijosDosis.forEach((span) => {
      span.textContent = 'mg';
    });

    ocultarResultadoYError();
    inputDosisIndicada.focus();
  }

  function calcularDosis() {
    ocultarResultadoYError();

    const dosisIndicada = parseNumero(inputDosisIndicada.value);
    if (!Number.isFinite(dosisIndicada) || dosisIndicada <= 0) {
      mostrarError('Ingresa la dosis indicada (mayor a 0).');
      return;
    }

    if (tipoActual === 'ampolla') {
      calcularAmpolla(dosisIndicada);
    } else {
      calcularTableta(dosisIndicada);
    }
  }

  // Convierte a mg el valor ingresado, según la unidad elegida.
  // (La fórmula clínica opera en mg; el usuario puede escribir en mg o g.)
  function aMg(valor) {
    return unidadDosis === 'g' ? valor * 1000 : valor;
  }

  function calcularAmpolla(dosisIndicada) {
    const dosisDisponible = parseNumero(inputDosisDisponibleAmp.value);
    const volumenDisponible = parseNumero(inputVolumenDisponibleAmp.value);

    if (!Number.isFinite(dosisDisponible) || dosisDisponible <= 0) {
      mostrarError('Ingresa la dosis disponible del frasco (mayor a 0).');
      return;
    }
    if (!Number.isFinite(volumenDisponible) || volumenDisponible <= 0) {
      mostrarError('Ingresa el volumen del frasco (mayor a 0).');
      return;
    }

    // Normalizamos ambas dosis a mg antes de aplicar la regla de tres.
    const dosisIndicadaMg = aMg(dosisIndicada);
    const dosisDisponibleMg = aMg(dosisDisponible);

    const resultadoExacto = (dosisIndicadaMg * volumenDisponible) / dosisDisponibleMg;

    if (!Number.isFinite(resultadoExacto)) {
      mostrarError('No se pudo calcular. Revisa los valores ingresados.');
      return;
    }

    // Aviso clínico: si el resultado supera el volumen del frasco,
    // probablemente el usuario confundió unidades (ej. puso 1 en vez de 1000).
    const superaFrasco = resultadoExacto > volumenDisponible;

    const resultadoFormateado = formatearResultado(resultadoExacto);

    resultadoValorEl.textContent = resultadoFormateado;
    resultadoUnidadEl.textContent = 'ml a administrar';
    resultadoEl.hidden = false;

    desgloseEl.innerHTML = `
      <p><strong>Regla de tres:</strong></p>
      <p class="regla-de-tres">
        ${escaparHtml(dosisDisponible)} ${escaparHtml(unidadDosis)} &nbsp;——&nbsp; ${escaparHtml(volumenDisponible)} ml<br>
        ${escaparHtml(dosisIndicada)} ${escaparHtml(unidadDosis)} &nbsp;——&nbsp; ? ml
      </p>
      <p>
        ? = (${escaparHtml(dosisIndicada)} × ${escaparHtml(volumenDisponible)}) ÷ ${escaparHtml(dosisDisponible)}
        = <strong>${resultadoFormateado} ml</strong>
      </p>
      ${unidadDosis === 'g' ? `
        <p class="resultado__equivalente" style="font-size: var(--fs-xs); color: var(--color-ink-muted);">
          Equivalencia usada: ${escaparHtml(dosisIndicada)} g = ${escaparHtml(dosisIndicadaMg)} mg ·
          ${escaparHtml(dosisDisponible)} g = ${escaparHtml(dosisDisponibleMg)} mg
        </p>
      ` : ''}
      ${superaFrasco ? `
        <p class="resultado__equivalente" style="color: var(--color-accent);">
          ⚠️ El resultado supera el volumen del frasco (${escaparHtml(volumenDisponible)} ml).
          Verifica las unidades: ¿la dosis disponible está en <strong>${escaparHtml(unidadDosis)}</strong>
          o en <strong>${unidadDosis === 'mg' ? 'g' : 'mg'}</strong>?
          (1 g = 1000 mg)
        </p>
      ` : ''}
    `;
  }

  function calcularTableta(dosisIndicada) {
    const dosisDisponibleTab = parseNumero(inputDosisDisponibleTab.value);

    if (!Number.isFinite(dosisDisponibleTab) || dosisDisponibleTab <= 0) {
      mostrarError('Ingresa la dosis por tableta (mayor a 0).');
      return;
    }

    // Normalizamos ambas dosis a mg antes de dividir.
    const dosisIndicadaMg = aMg(dosisIndicada);
    const dosisDisponibleTabMg = aMg(dosisDisponibleTab);

    const resultadoExacto = dosisIndicadaMg / dosisDisponibleTabMg;

    if (!Number.isFinite(resultadoExacto)) {
      mostrarError('No se pudo calcular. Revisa los valores ingresados.');
      return;
    }

    const resultadoFormateado = formatearResultado(resultadoExacto);

    resultadoValorEl.textContent = resultadoFormateado;
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
        ${escaparHtml(dosisDisponibleTab)} ${escaparHtml(unidadDosis)} &nbsp;——&nbsp; 1 tableta<br>
        ${escaparHtml(dosisIndicada)} ${escaparHtml(unidadDosis)} &nbsp;——&nbsp; ? tabletas
      </p>
      <p>
        ? = ${escaparHtml(dosisIndicada)} ÷ ${escaparHtml(dosisDisponibleTab)} = <strong>${resultadoFormateado} tabletas</strong>
      </p>
      ${unidadDosis === 'g' ? `
        <p class="resultado__equivalente" style="font-size: var(--fs-xs); color: var(--color-ink-muted);">
          Equivalencia usada: ${escaparHtml(dosisIndicada)} g = ${escaparHtml(dosisIndicadaMg)} mg ·
          ${escaparHtml(dosisDisponibleTab)} g = ${escaparHtml(dosisDisponibleTabMg)} mg
        </p>
      ` : ''}
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
    errorEl.textContent = '';
    resultadoEl.hidden = true;
    resultadoValorEl.textContent = '—';
    resultadoUnidadEl.textContent = '';
    desgloseEl.innerHTML = '';
  }
})();
