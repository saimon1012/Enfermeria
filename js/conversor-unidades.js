// ============================================================
// conversor-unidades.js — Módulo 1: Conversor de unidades
//
// Motor genérico: cada unidad se define por "cuántos gramos (o ml)
// equivale 1 de esa unidad". Convertir A→B siempre pasa por la
// unidad base: valorBase = valor × factor(A); resultado = valorBase ÷ factor(B).
//
// MASA (unidad base: gramos)
//   1 g  = 1 g       → factor 1
//   1 mg = 0.001 g    → factor 0.001
//   1 µg = 0.000001 g → factor 0.000001
//
// VOLUMEN (unidad base: ml)
//   1 ml = 1 ml → factor 1
//   1 cc = 1 ml → factor 1   (cc = "centímetro cúbico" = ml, por definición)
// ============================================================

(function () {
  const CATEGORIAS = {
    masa: {
      orden: ['g', 'mg', 'µg'],
      factores: { g: 1, mg: 0.001, 'µg': 0.000001 },
      porDefecto: { desde: 'g', hasta: 'mg' },
    },
    volumen: {
      orden: ['ml', 'cc'],
      factores: { ml: 1, cc: 1 },
      porDefecto: { desde: 'ml', hasta: 'cc' },
    },
  };

  // ---------- Referencias al DOM ----------
  const botonesCategoria = document.querySelectorAll('[data-categoria-conversor]');
  const inputValor = document.getElementById('input-valor-conversor');
  const selectDesde = document.getElementById('select-unidad-desde');
  const selectHasta = document.getElementById('select-unidad-hasta');
  const btnConvertir = document.getElementById('btn-convertir');
  const btnLimpiar = document.getElementById('btn-limpiar-conversor');
  const errorEl = document.getElementById('error-conversor');
  const resultadoEl = document.getElementById('resultado-conversor');
  const resultadoValorEl = document.getElementById('resultado-conversor-valor');
  const resultadoUnidadEl = document.getElementById('resultado-conversor-unidad');
  const desgloseEl = document.getElementById('desglose-conversor');

  if (!btnConvertir) return; // esta vista no está en el DOM, no hace nada

  // ---------- Helpers ----------
  // Acepta "2,5" y "2.5" (coma decimal es-VE y punto en-US).
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

  // Formatea el resultado: hasta 6 decimales, pero si es muy pequeño
  // (menos de 0.000001) recurre a notación científica para no mostrar "0".
  function formatearResultado(n) {
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    if (Math.abs(n) < 0.000001) {
      return n.toExponential(4);
    }
    return parseFloat(n.toFixed(6)).toString();
  }

  let categoriaActual = 'masa';

  // ---------- Llena los <select> "De" y "A" según la categoría activa ----------
  function poblarSelects(categoria) {
    const config = CATEGORIAS[categoria];

    // Vaciar sin innerHTML (más seguro en navegadores antiguos/WebViews).
    selectDesde.length = 0;
    selectHasta.length = 0;

    config.orden.forEach((unidad) => {
      selectDesde.appendChild(new Option(unidad, unidad));
      selectHasta.appendChild(new Option(unidad, unidad));
    });

    // Asignar por defecto, pero solo si la unidad existe en los factores.
    selectDesde.value = config.factores[config.porDefecto.desde] !== undefined
      ? config.porDefecto.desde
      : config.orden[0];
    selectHasta.value = config.factores[config.porDefecto.hasta] !== undefined
      ? config.porDefecto.hasta
      : config.orden[1] || config.orden[0];
  }

  poblarSelects(categoriaActual); // estado inicial al cargar la página

  // ---------- Toggle: Masa / Volumen ----------
  botonesCategoria.forEach((boton) => {
    boton.addEventListener('click', () => {
      categoriaActual = boton.dataset.categoriaConversor;
      botonesCategoria.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      poblarSelects(categoriaActual);
      ocultarResultadoYError();
    });
  });

  // ---------- Conversión ----------
  btnConvertir.addEventListener('click', convertir);
  btnLimpiar.addEventListener('click', limpiarConversor);

  function limpiarConversor() {
    inputValor.value = '';

    // Vuelve a la categoría "Masa" (opción por defecto)
    categoriaActual = 'masa';
    botonesCategoria.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.categoriaConversor === 'masa')));
    poblarSelects('masa');

    ocultarResultadoYError();
    inputValor.focus();
  }

  function convertir() {
    ocultarResultadoYError();

    const valor = parseNumero(inputValor.value);

    if (!Number.isFinite(valor)) {
      mostrarError('Ingresa un valor numérico.');
      return;
    }
    if (valor < 0) {
      mostrarError('El valor no puede ser negativo.');
      return;
    }

    const config = CATEGORIAS[categoriaActual];
    const unidadDesde = selectDesde.value;
    const unidadHasta = selectHasta.value;
    const factorDesde = config.factores[unidadDesde];
    const factorHasta = config.factores[unidadHasta];

    // Guarda defensiva: si por alguna razón la unidad no existe, avisar
    // en vez de calcular NaN silenciosamente.
    if (factorDesde === undefined || factorHasta === undefined) {
      mostrarError('Unidad no válida. Recarga la página e intenta de nuevo.');
      return;
    }

    const valorBase = valor * factorDesde;
    const resultado = valorBase / factorHasta;

    // Guarda defensiva: valores gigantes pueden dar Infinity.
    if (!Number.isFinite(resultado)) {
      mostrarError('El valor es demasiado grande para convertirlo.');
      return;
    }

    const resultadoFormateado = formatearResultado(resultado);

    mostrarResultado(resultadoFormateado, unidadHasta, {
      categoria: categoriaActual,
      valor,
      unidadDesde,
      unidadHasta,
      factorDesde,
      factorHasta,
    });
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

  function mostrarResultado(resultado, unidadHasta, datos) {
    resultadoValorEl.textContent = resultado;
    resultadoUnidadEl.textContent = unidadHasta;
    resultadoEl.hidden = false;

    if (datos.categoria === 'volumen') {
      // ml y cc son la misma medida: el desglose explica el concepto,
      // no una fórmula (multiplicar/dividir por 1 no enseña nada).
      desgloseEl.innerHTML = `
        <p>
          <strong>${escaparHtml(datos.valor)} ${escaparHtml(datos.unidadDesde)}</strong> equivale exactamente a
          <strong>${escaparHtml(resultado)} ${escaparHtml(datos.unidadHasta)}</strong>.
        </p>
        <p class="resultado__equivalente">
          "cc" significa centímetro cúbico, que por definición es idéntico a 1 mililitro —
          no es una conversión, son dos nombres para la misma cantidad.
        </p>
      `;
    } else {
      // Masa: sí hay un cálculo real, se muestra la fórmula con los números sustituidos.
      desgloseEl.innerHTML = `
        <p><strong>Fórmula:</strong> resultado = valor × equivalencia(origen) ÷ equivalencia(destino)</p>
        <p>
          resultado = ${escaparHtml(datos.valor)} × ${escaparHtml(datos.factorDesde)} ÷ ${escaparHtml(datos.factorHasta)}
        </p>
        <p class="resultado__equivalente">
          ${escaparHtml(datos.valor)} ${escaparHtml(datos.unidadDesde)} = ${escaparHtml(resultado)} ${escaparHtml(datos.unidadHasta)}
        </p>
      `;
    }
  }
})();
