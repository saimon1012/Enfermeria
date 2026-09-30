// ============================================================
// calculadoras-nutricion.js — Módulo 2: Nutrición y Dietética
//
// ADULTO (18+):
//   IMC = peso(kg) ÷ estatura(m)²
//   Categorías OMS: <18.5 bajo peso · 18.5–24.9 normal · 25–29.9 sobrepeso
//                   30–34.9 obesidad I · 35–39.9 obesidad II · ≥40 obesidad III
//   Requerimiento hídrico basal: 30 a 35 ml por kg al día (estimación simple)
//
// NIÑO:
//   No se calcula IMC (requiere percentiles por edad y sexo).
//   Requerimiento hídrico por Holliday-Segar (mantenimiento):
//     primeros 10 kg  → 100 ml/kg
//     siguientes 10 kg → 50 ml/kg
//     cada kg sobre 20 → 20 ml/kg
//
// Todo es referencia educativa; no reemplaza la indicación médica.
// ============================================================

(function () {
  // ---------- Referencias al DOM ----------
  const botonesGrupo = document.querySelectorAll('[data-grupo-nutri]');
  const inputPeso = document.getElementById('input-peso-nutri');
  const inputEstatura = document.getElementById('input-estatura-nutri');
  const campoEstatura = document.getElementById('campo-estatura-nutri');
  const notaNino = document.getElementById('nota-nino-nutri');
  const btnCalcular = document.getElementById('btn-calcular-nutri');
  const btnLimpiar = document.getElementById('btn-limpiar-nutri');
  const errorEl = document.getElementById('error-nutri');

  const resultadoImc = document.getElementById('resultado-imc');
  const imcValorEl = document.getElementById('resultado-imc-valor');
  const desgloseImc = document.getElementById('desglose-imc');

  const resultadoHidrico = document.getElementById('resultado-hidrico');
  const hidricoValorEl = document.getElementById('resultado-hidrico-valor');
  const desgloseHidrico = document.getElementById('desglose-hidrico');

  if (!btnCalcular) return; // esta vista no está en el DOM, no hace nada

  let grupo = 'adulto'; // 'adulto' | 'nino'

  // ---------- Toggle: Adulto / Niño ----------
  botonesGrupo.forEach((boton) => {
    boton.addEventListener('click', () => {
      grupo = boton.dataset.grupoNutri;
      botonesGrupo.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));

      const esAdulto = grupo === 'adulto';
      campoEstatura.hidden = !esAdulto; // niño: no se usa estatura
      notaNino.hidden = esAdulto;

      ocultarTodo();
    });
  });

  btnCalcular.addEventListener('click', calcular);
  btnLimpiar.addEventListener('click', limpiarNutricion);

  function limpiarNutricion() {
    inputPeso.value = '';
    inputEstatura.value = '';

    // Vuelve a "Adulto" (opción por defecto)
    grupo = 'adulto';
    botonesGrupo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grupoNutri === 'adulto')));
    campoEstatura.hidden = false;
    notaNino.hidden = true;

    ocultarTodo();
    inputPeso.focus();
  }

  function calcular() {
    ocultarTodo();

    const peso = parseFloat(inputPeso.value);
    if (!peso || peso <= 0) {
      mostrarError('Ingresa el peso en kg (mayor a 0).');
      return;
    }
    if (peso > 400) {
      mostrarError('El peso parece demasiado alto. Verifica que esté en kilogramos.');
      return;
    }

    if (grupo === 'adulto') {
      const estatura = parseFloat(inputEstatura.value);
      if (!estatura || estatura <= 0) {
        mostrarError('Ingresa la estatura en cm (mayor a 0).');
        return;
      }
      if (estatura < 100 || estatura > 250) {
        mostrarError('La estatura debe estar en centímetros (ej. 170).');
        return;
      }
      calcularImc(peso, estatura);
      calcularHidricoAdulto(peso);
    } else {
      calcularHidricoNino(peso);
    }
  }

  // ---------- IMC (adulto) ----------
  function categoriaImc(imc) {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidad grado I';
    if (imc < 40) return 'Obesidad grado II';
    return 'Obesidad grado III';
  }

  function calcularImc(peso, estaturaCm) {
    const estaturaM = estaturaCm / 100;
    const imc = peso / (estaturaM * estaturaM);
    const imcRedondeado = imc.toFixed(1);

    imcValorEl.textContent = imcRedondeado;
    resultadoImc.hidden = false;

    desgloseImc.innerHTML = `
      <p><strong>Fórmula:</strong> IMC = peso (kg) ÷ estatura (m)²</p>
      <p>Estatura: ${estaturaCm} cm ÷ 100 = ${estaturaM} m</p>
      <p>IMC = ${peso} ÷ (${estaturaM} × ${estaturaM}) = ${peso} ÷ ${(estaturaM * estaturaM).toFixed(4)} = ${imcRedondeado}</p>
      <p class="resultado__equivalente">Clasificación OMS: ${categoriaImc(imc)}</p>
    `;
  }

  // ---------- Requerimiento hídrico: adulto ----------
  function calcularHidricoAdulto(peso) {
    const minimo = Math.round(peso * 30);
    const maximo = Math.round(peso * 35);

    hidricoValorEl.textContent = `${minimo} – ${maximo}`;
    resultadoHidrico.hidden = false;

    desgloseHidrico.innerHTML = `
      <p><strong>Estimación adulto:</strong> 30 a 35 ml por kg de peso al día</p>
      <p>Mínimo: ${peso} kg × 30 ml = ${minimo} ml</p>
      <p>Máximo: ${peso} kg × 35 ml = ${maximo} ml</p>
      <p class="resultado__equivalente">
        Equivale a ${(minimo / 1000).toFixed(2)} – ${(maximo / 1000).toFixed(2)} litros al día.
      </p>
    `;
  }

  // ---------- Requerimiento hídrico: niño (Holliday-Segar) ----------
  function calcularHidricoNino(peso) {
    // Cada tramo se acumula y se guarda su línea de explicación
    const pasos = [];
    let total = 0;

    const tramo1 = Math.min(peso, 10);
    total += tramo1 * 100;
    pasos.push(`Primeros 10 kg: ${tramo1} kg × 100 ml = ${tramo1 * 100} ml`);

    if (peso > 10) {
      const tramo2 = Math.min(peso - 10, 10);
      total += tramo2 * 50;
      pasos.push(`Siguientes 10 kg: ${tramo2} kg × 50 ml = ${tramo2 * 50} ml`);
    }
    if (peso > 20) {
      const tramo3 = peso - 20;
      total += tramo3 * 20;
      pasos.push(`Kg sobre 20: ${tramo3} kg × 20 ml = ${tramo3 * 20} ml`);
    }

    const totalRedondeado = Math.round(total);
    const mlPorHora = (total / 24).toFixed(1);

    hidricoValorEl.textContent = totalRedondeado;
    resultadoHidrico.hidden = false;

    desgloseHidrico.innerHTML = `
      <p><strong>Método Holliday-Segar</strong> (mantenimiento en niños)</p>
      ${pasos.map((p) => `<p>${p}</p>`).join('')}
      <p>Total = ${totalRedondeado} ml/día</p>
      <p class="resultado__equivalente">Equivale a ${mlPorHora} ml/hora (÷ 24 h).</p>
      <p>Nota: en recién nacidos el requerimiento es distinto; este método no aplica.</p>
    `;
  }

  function mostrarError(mensaje) {
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  function ocultarTodo() {
    errorEl.hidden = true;
    resultadoImc.hidden = true;
    resultadoHidrico.hidden = true;
  }
})();
