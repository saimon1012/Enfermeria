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

  let categoriaActual = 'masa';

  // ---------- Llena los <select> "De" y "A" según la categoría activa ----------
  function poblarSelects(categoria) {
    const config = CATEGORIAS[categoria];
    selectDesde.innerHTML = '';
    selectHasta.innerHTML = '';

    config.orden.forEach((unidad) => {
      selectDesde.appendChild(new Option(unidad, unidad));
      selectHasta.appendChild(new Option(unidad, unidad));
    });

    selectDesde.value = config.porDefecto.desde;
    selectHasta.value = config.porDefecto.hasta;
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

    const valor = parseFloat(inputValor.value);

    if (inputValor.value.trim() === '' || Number.isNaN(valor)) {
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

    const valorBase = valor * factorDesde;
    const resultado = valorBase / factorHasta;

    // Redondeo a 6 decimales y recorte de ceros sobrantes (ej. 5.000000 → 5)
    const resultadoFormateado = parseFloat(resultado.toFixed(6));

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
    resultadoEl.hidden = true;
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
          <strong>${datos.valor} ${datos.unidadDesde}</strong> equivale exactamente a
          <strong>${resultado} ${datos.unidadHasta}</strong>.
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
          resultado = ${datos.valor} × ${datos.factorDesde} ÷ ${datos.factorHasta}
        </p>
        <p class="resultado__equivalente">
          ${datos.valor} ${datos.unidadDesde} = ${resultado} ${datos.unidadHasta}
        </p>
      `;
    }
  }
})();
