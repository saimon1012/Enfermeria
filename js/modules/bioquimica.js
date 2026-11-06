// ============================================================
// bioquimica.js — Módulo 3a: Bioquímica Clínica
//
// 1) Conversión de glucosa:
//    mg/dL  →  mmol/L : (mg/dL × 10) ÷ 180 = mg/dL ÷ 18
//    mmol/L →  mg/dL : mmol/L × 18
//    Factor de conversión oficial: 18,018 (usamos 18 por convención clínica)
//
// 2) Osmolaridad sérica efectiva:
//    Osm = (2 × Na⁺) + (Glucosa ÷ 18) + (BUN ÷ 2.8)
//    Referencia adulto: 275 – 295 mOsm/kg
// ============================================================

(function () {
  // ---------- Glucosa ----------
  const botonesTipoBioq = document.querySelectorAll('[data-tipo-bioq]');
  const bloqueGlucosa = document.getElementById('bloque-bioq-glucosa');
  const bloqueOsm = document.getElementById('bloque-bioq-osmolaridad');

  const botonesDirGlucosa = document.querySelectorAll('[data-dir-glucosa]');
  const inputGlucosa = document.getElementById('input-glucosa');
  const sufijoGlucosa = document.getElementById('sufijo-glucosa');
  const btnCalcularGlucosa = document.getElementById('btn-calcular-glucosa');
  const btnLimpiarGlucosa = document.getElementById('btn-limpiar-glucosa');
  const errorGlucosa = document.getElementById('error-glucosa');
  const resultadoGlucosa = document.getElementById('resultado-glucosa');
  const resultadoGlucosaValor = document.getElementById('resultado-glucosa-valor');
  const resultadoGlucosaUnidad = document.getElementById('resultado-glucosa-unidad');
  const desgloseGlucosa = document.getElementById('desglose-glucosa');

  // ---------- Osmolaridad ----------
  const inputNa = document.getElementById('input-na');
  const inputGlucosaOsm = document.getElementById('input-glucosa-osm');
  const inputBun = document.getElementById('input-bun');
  const btnCalcularOsm = document.getElementById('btn-calcular-osm');
  const btnLimpiarOsm = document.getElementById('btn-limpiar-osm');
  const errorOsm = document.getElementById('error-osm');
  const resultadoOsm = document.getElementById('resultado-osm');
  const resultadoOsmValor = document.getElementById('resultado-osm-valor');
  const desgloseOsm = document.getElementById('desglose-osm');

  if (!btnCalcularGlucosa) return; // vista no montada

  let direccionGlucosa = 'a-mmol'; // 'a-mmol' | 'a-mgdl'

  // ---------- Toggle tipo de calculadora ----------
  botonesTipoBioq.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.tipoBioq;
      botonesTipoBioq.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      if (bloqueGlucosa) bloqueGlucosa.hidden = tipo !== 'glucosa';
      if (bloqueOsm) bloqueOsm.hidden = tipo !== 'osmolaridad';
    });
  });

  // ---------- Toggle dirección glucosa ----------
  botonesDirGlucosa.forEach((btn) => {
    btn.addEventListener('click', () => {
      direccionGlucosa = btn.dataset.dirGlucosa;
      botonesDirGlucosa.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      if (sufijoGlucosa) {
        sufijoGlucosa.textContent =
          direccionGlucosa === 'a-mmol' ? 'mg/dL' : 'mmol/L';
      }
      ocultarGlucosa();
    });
  });

  btnCalcularGlucosa.addEventListener('click', calcularGlucosa);
  btnLimpiarGlucosa?.addEventListener('click', limpiarGlucosa);

  function limpiarGlucosa() {
    if (inputGlucosa) inputGlucosa.value = '';
    ocultarGlucosa();
    inputGlucosa?.focus();
  }

  function ocultarGlucosa() {
    if (errorGlucosa) errorGlucosa.hidden = true;
    if (resultadoGlucosa) resultadoGlucosa.hidden = true;
  }

  function calcularGlucosa() {
    ocultarGlucosa();
    const valor = parseFloat(inputGlucosa?.value);
    if (!valor || valor <= 0) {
      if (errorGlucosa) {
        errorGlucosa.textContent = 'Ingresa un valor mayor a 0.';
        errorGlucosa.hidden = false;
      }
      return;
    }

    let resultado, unidadSalida, formula;
    if (direccionGlucosa === 'a-mmol') {
      resultado = valor / 18;
      unidadSalida = 'mmol/L';
      formula = `mg/dL ÷ 18 = mmol/L → ${valor} ÷ 18 = ${resultado.toFixed(2)}`;
    } else {
      resultado = valor * 18;
      unidadSalida = 'mg/dL';
      formula = `mmol/L × 18 = mg/dL → ${valor} × 18 = ${resultado.toFixed(2)}`;
    }

    const redondeado = parseFloat(resultado.toFixed(2));
    if (resultadoGlucosaValor) resultadoGlucosaValor.textContent = redondeado;
    if (resultadoGlucosaUnidad) resultadoGlucosaUnidad.textContent = unidadSalida;
    if (resultadoGlucosa) resultadoGlucosa.hidden = false;

    const categoria = clasificarGlucosa(
      direccionGlucosa === 'a-mmol' ? valor : redondeado,
      direccionGlucosa === 'a-mmol' ? 'mgdl' : 'mmol'
    );

    if (desgloseGlucosa) {
      desgloseGlucosa.innerHTML = `
        <p><strong>Fórmula:</strong> ${formula}</p>
        <p class="resultado__equivalente">Clasificación (ayunas): ${categoria}</p>
        <p style="font-size: var(--fs-xs); color: var(--color-ink-muted);">
          Referencia adulto en ayunas: normal 70–100 mg/dL (3.9–5.6 mmol/L) ·
          prediabetes 100–125 mg/dL · diabetes ≥126 mg/dL.
        </p>
      `;
    }
  }

  function clasificarGlucosa(valor, unidad) {
    // Normalizamos a mg/dL para clasificar
    const mgdl = unidad === 'mmol' ? valor * 18 : valor;
    if (mgdl < 70) return 'Hipoglucemia (<70 mg/dL)';
    if (mgdl <= 100) return 'Normal (70–100 mg/dL)';
    if (mgdl <= 125) return 'Prediabetes (100–125 mg/dL)';
    return 'Diabetes (≥126 mg/dL) — requiere confirmación clínica';
  }

  // ---------- Osmolaridad ----------
  btnCalcularOsm?.addEventListener('click', calcularOsm);
  btnLimpiarOsm?.addEventListener('click', limpiarOsm);

  function limpiarOsm() {
    if (inputNa) inputNa.value = '';
    if (inputGlucosaOsm) inputGlucosaOsm.value = '';
    if (inputBun) inputBun.value = '';
    if (errorOsm) errorOsm.hidden = true;
    if (resultadoOsm) resultadoOsm.hidden = true;
    inputNa?.focus();
  }

  function calcularOsm() {
    if (errorOsm) errorOsm.hidden = true;
    if (resultadoOsm) resultadoOsm.hidden = true;

    const na = parseFloat(inputNa?.value);
    const glu = parseFloat(inputGlucosaOsm?.value);
    const bun = parseFloat(inputBun?.value);

    if (!na || na <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa el sodio (Na⁺) en mEq/L.'; errorOsm.hidden = false; }
      return;
    }
    if (!glu || glu <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa la glucosa en mg/dL.'; errorOsm.hidden = false; }
      return;
    }
    if (!bun || bun <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa el BUN en mg/dL.'; errorOsm.hidden = false; }
      return;
    }

    const osm = (2 * na) + (glu / 18) + (bun / 2.8);
    const redondeado = parseFloat(osm.toFixed(1));

    if (resultadoOsmValor) resultadoOsmValor.textContent = redondeado;
    if (resultadoOsm) resultadoOsm.hidden = false;

    let clasif = 'Normal (275–295 mOsm/kg)';
    if (osm < 275) clasif = 'Hiposmolar (<275 mOsm/kg)';
    else if (osm > 295) clasif = 'Hiperosmolar (>295 mOsm/kg)';

    if (desgloseOsm) {
      desgloseOsm.innerHTML = `
        <p><strong>Fórmula:</strong> Osm = (2 × Na⁺) + (Glucosa ÷ 18) + (BUN ÷ 2.8)</p>
        <p>Osm = (2 × ${na}) + (${glu} ÷ 18) + (${bun} ÷ 2.8)</p>
        <p>Osm = ${(2 * na).toFixed(1)} + ${(glu / 18).toFixed(2)} + ${(bun / 2.8).toFixed(2)}</p>
        <p>Osm = <strong>${redondeado} mOsm/kg</strong></p>
        <p class="resultado__equivalente">Clasificación: ${clasif}</p>
      `;
    }
  }
})();
