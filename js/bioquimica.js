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

  // ---------- Helpers ----------
  // Acepta "5,5" y "5.5" (coma decimal es-VE y punto en-US).
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

  // Formatea con hasta 2 decimales, pero si es muy pequeño (menos de 0.01)
  // muestra más decimales para no perder información clínica.
  function formatearResultado(n) {
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    if (Math.abs(n) < 0.01) {
      return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    }
    return parseFloat(n.toFixed(2)).toString();
  }

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

      // Limpiar desgloses al cambiar de tipo para no dejar resultados viejos.
      if (desgloseGlucosa) desgloseGlucosa.innerHTML = '';
      if (desgloseOsm) desgloseOsm.innerHTML = '';
      if (resultadoGlucosa) resultadoGlucosa.hidden = true;
      if (resultadoOsm) resultadoOsm.hidden = true;
      if (errorGlucosa) errorGlucosa.hidden = true;
      if (errorOsm) errorOsm.hidden = true;
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
    if (errorGlucosa) {
      errorGlucosa.hidden = true;
      errorGlucosa.textContent = '';
    }
    if (resultadoGlucosa) resultadoGlucosa.hidden = true;
    if (resultadoGlucosaValor) resultadoGlucosaValor.textContent = '—';
    if (resultadoGlucosaUnidad) resultadoGlucosaUnidad.textContent = '';
    if (desgloseGlucosa) desgloseGlucosa.innerHTML = '';
  }

  function calcularGlucosa() {
    ocultarGlucosa();
    const valor = parseNumero(inputGlucosa?.value);

    if (!Number.isFinite(valor) || valor <= 0) {
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

    // Guarda defensiva contra valores gigantes.
    if (!Number.isFinite(resultado)) {
      if (errorGlucosa) {
        errorGlucosa.textContent = 'El valor es demasiado grande.';
        errorGlucosa.hidden = false;
      }
      return;
    }

    const redondeado = formatearResultado(resultado);
    if (resultadoGlucosaValor) resultadoGlucosaValor.textContent = redondeado;
    if (resultadoGlucosaUnidad) resultadoGlucosaUnidad.textContent = unidadSalida;
    if (resultadoGlucosa) resultadoGlucosa.hidden = false;

    const categoria = clasificarGlucosa(
      direccionGlucosa === 'a-mmol' ? valor : Number(redondeado),
      direccionGlucosa === 'a-mmol' ? 'mgdl' : 'mmol'
    );

    if (desgloseGlucosa) {
      desgloseGlucosa.innerHTML = `
        <p><strong>Fórmula:</strong> ${escaparHtml(formula)}</p>
        <p class="resultado__equivalente">Clasificación (ayunas): ${escaparHtml(categoria)}</p>
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
    if (errorOsm) {
      errorOsm.hidden = true;
      errorOsm.textContent = '';
    }
    if (resultadoOsm) resultadoOsm.hidden = true;
    if (resultadoOsmValor) resultadoOsmValor.textContent = '—';
    if (desgloseOsm) desgloseOsm.innerHTML = '';
    inputNa?.focus();
  }

  function calcularOsm() {
    if (errorOsm) {
      errorOsm.hidden = true;
      errorOsm.textContent = '';
    }
    if (resultadoOsm) resultadoOsm.hidden = true;
    if (desgloseOsm) desgloseOsm.innerHTML = '';

    const na = parseNumero(inputNa?.value);
    const glu = parseNumero(inputGlucosaOsm?.value);
    const bun = parseNumero(inputBun?.value);

    if (!Number.isFinite(na) || na <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa el sodio (Na⁺) en mEq/L.'; errorOsm.hidden = false; }
      return;
    }
    if (!Number.isFinite(glu) || glu <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa la glucosa en mg/dL.'; errorOsm.hidden = false; }
      return;
    }
    if (!Number.isFinite(bun) || bun <= 0) {
      if (errorOsm) { errorOsm.textContent = 'Ingresa el BUN en mg/dL.'; errorOsm.hidden = false; }
      return;
    }

    const osm = (2 * na) + (glu / 18) + (bun / 2.8);

    // Guarda defensiva: valores gigantes pueden dar Infinity.
    if (!Number.isFinite(osm)) {
      if (errorOsm) {
        errorOsm.textContent = 'El valor es demasiado grande para calcularlo.';
        errorOsm.hidden = false;
      }
      return;
    }

    const redondeado = formatearResultado(osm);

    if (resultadoOsmValor) resultadoOsmValor.textContent = redondeado;
    if (resultadoOsm) resultadoOsm.hidden = false;

    let clasif = 'Normal (275–295 mOsm/kg)';
    if (osm < 275) clasif = 'Hiposmolar (<275 mOsm/kg)';
    else if (osm > 295) clasif = 'Hiperosmolar (>295 mOsm/kg)';

    if (desgloseOsm) {
      desgloseOsm.innerHTML = `
        <p><strong>Fórmula:</strong> Osm = (2 × Na⁺) + (Glucosa ÷ 18) + (BUN ÷ 2.8)</p>
        <p>Osm = (2 × ${escaparHtml(na)}) + (${escaparHtml(glu)} ÷ 18) + (${escaparHtml(bun)} ÷ 2.8)</p>
        <p>Osm = ${(2 * na).toFixed(1)} + ${(glu / 18).toFixed(2)} + ${(bun / 2.8).toFixed(2)}</p>
        <p>Osm = <strong>${escaparHtml(redondeado)} mOsm/kg</strong></p>
        <p class="resultado__equivalente">Clasificación: ${escaparHtml(clasif)}</p>
      `;
    }
  }
})();
