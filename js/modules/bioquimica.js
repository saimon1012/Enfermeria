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
      botonesDirGlucosa.forEach((b
