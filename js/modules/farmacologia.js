// ============================================================
// farmacologia.js — Módulo 3b: Farmacología
//
// Contenido:
//   1) Flashcards de grupos farmacológicos (15 fichas)
//   2) Calculadora de dosis pediátrica (mg/kg/día → mg por dosis)
//      dosisDiaria = peso × mg/kg/día
//      dosisPorToma = dosisDiaria ÷ frecuencia
// ============================================================

(function () {
  const FICHAS = [
    { pregunta: 'AINE (ej. ibuprofeno)', respuesta: 'Antiinflamatorio no esteroideo. Inhibe COX-1 y COX-2 → reduce prostaglandinas. Efectos: analgesia, antipiresis, antiinflamatorio. Precaución: sangrado gástrico, nefrotoxicidad.' },
    { pregunta: 'Paracetamol (acetaminofén)', respuesta: 'Analgésico y antipirético. Mecanismo central (inhibe COX a nivel hipotalámico). Dosis máxima adulto: 4 g/día. Hepatotóxico en sobredosis.' },
    { pregunta: 'Penicilina', respuesta: 'Antibiótico betalactámico. Inhibe la síntesis de pared bacteriana. Eficaz en Gram positivos (estreptococo, estafilococo sensible). Riesgo: anafilaxia.' },
    { pregunta: 'Aminoglucósidos (ej. gentamicina)', respuesta: 'Antibióticos bactericidas. Inhiben síntesis proteica (subunidad 30S). Efectos adversos: nefrotoxicidad y ototoxicidad. Uso en Gram negativos graves.' },
    { pregunta: 'Omeprazol', respuesta: 'Inhibidor de bomba de protones (IBP). Bloquea H⁺/K⁺-ATPasa en células parietales. Uso: úlcera gástrica, ERGE, protección gástrica con AINEs.' },
    { pregunta: 'Insulina rápida (regular)', respuesta: 'Hormona hipoglucemiante. Inicio: 30 min, pico: 2–3 h, duración: 6–8 h. Única insulina administrable por vía IV. Riesgo: hipoglucemia.' },
    { pregunta: 'Metformina', respuesta: 'Antidiabético oral de primera línea en DM2. Reduce producción hepática de glucosa y mejora sensibilidad periférica. No produce hipoglucemia. Efecto adverso: acidosis láctica (raro).' },
    { pregunta: 'Furosemida (Lasix)', respuesta: 'Diurético de asa. Inhibe Na⁺/K⁺/2Cl⁻ en el asa de Henle. Efectos: diuresis potente, hipokalemia, hipovolemia. Uso: edema, ICC, HTA.' },
    { pregunta: 'Enalapril', respuesta: 'IECA (inhibidor de la enzima convertidora de angiotensina). Reduce angiotensina II → vasodilatación. Efecto adverso característico: tos seca. Uso: HTA, ICC.' },
    { pregunta: 'Atenolol', respuesta: 'Betabloqueante cardioselectivo (β1). Reduce frecuencia cardíaca y presión arterial. Uso: HTA, angina, post-IAM. Precaución: no suspender bruscamente.' },
    { pregunta: 'Morfina', respuesta: 'Analgésico opioide. Agonista de receptores μ. Efectos: analgesia potente, depresión respiratoria, miosis, estreñimiento. Antídoto: naloxona.' },
    { pregunta: 'Diazepam', respuesta: 'Benzodiacepina. Potencia la acción del GABA en receptores GABA-A. Efectos: ansiolítico, anticonvulsivante, relajante muscular. Antídoto: flumazenil.' },
    { pregunta: 'Heparina sódica', respuesta: 'Anticoagulante parenteral. Potencia la antitrombina III → inhibe trombina y factor Xa. Monitoreo: TTPa. Antídoto: sulfato de protamina.' },
    { pregunta: 'Warfarina', respuesta: 'Anticoagulante oral antagonista de vitamina K. Inhibe factores II, VII, IX, X. Monitoreo: INR. Antídoto: vitamina K (fitomenadiona).' },
    { pregunta: 'Salbutamol', respuesta: 'Agonista β2 adrenérgico de acción corta. Broncodilatador. Uso: crisis asmática, EPOC. Efecto adverso: taquicardia, temblor.' },
  ];

  let indice = 0;
  let mostrandoRespuesta = false;

  // ---------- Flashcards ----------
  const elProgreso = document.getElementById('flashcard-farma-progreso');
  const elTarjeta = document.getElementById('flashcard-farma');
  const elEtiqueta = document.getElementById('flashcard-farma-etiqueta');
  const elTexto = document.getElementById('flashcard-farma-texto');
  const elPista = document.getElementById('flashcard-farma-pista');
  const btnAnterior = document.getElementById('btn-flashcard-farma-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-farma-siguiente');

  // ---------- Dosis pediátrica ----------
  const botonesSubFarmaco = document.querySelectorAll('[data-sub-farmaco]');
  const bloquesSubFarmaco = document.querySelectorAll('[data-sub-farmaco-contenido]');

  const inputPesoPed = document.getElementById('input-peso-ped');
  const inputDosisKg = document.getElementById('input-dosis-kg');
  const botonesFrecuencia = document.querySelectorAll('[data-frecuencia]');
  const btnCalcularPed = document.getElementById('btn-calcular-dosis-ped');
  const btnLimpiarPed = document.getElementById('btn-limpiar-dosis-ped');
  const errorPed = document.getElementById('error-dosis-ped');
  const resultadoPed = document.getElementById('resultado-dosis-ped');
  const resultadoPedValor = document.getElementById('resultado-dosis-ped-valor');
  const desglosePed = document.getElementById('desglose-dosis-ped');

  let frecuencia = 3; // c/8h por defecto

  // ---------- Toggle sub-farmacología ----------
  botonesSubFarmaco.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.subFarmaco;
      botonesSubFarmaco.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      bloquesSubFarmaco.forEach((bloque) => {
        bloque.hidden = bloque.dataset.subFarmacoContenido !== sub;
      });
    });
  });

  // ---------- Frecuencia ----------
  botonesFrecuencia.forEach((btn) => {
    btn.addEventListener('click', () => {
      frecuencia = parseInt(btn.dataset.frecuencia, 10);
      botonesFrecuencia.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      ocultarPed();
    });
  });

  // ---------- Flashcards render ----------
  function renderFarma() {
    if (!elTarjeta) return;
    const ficha = FICHAS[indice];

    if (elProgreso) elProgreso.textContent = `Ficha ${indice + 1} de ${FICHAS.length}`;

    if (mostrandoRespuesta) {
      if (elEtiqueta) elEtiqueta.textContent = 'Respuesta';
      if (elTexto) elTexto.textContent = ficha.respuesta;
      if (elPista) elPista.textContent = 'Toca para ver la pregunta';
      elTarjeta.classList.add('flashcard--respuesta');
    } else {
      if (elEtiqueta) elEtiqueta.textContent = 'Pregunta';
      if (elTexto) elTexto.textContent = ficha.pregunta;
      if (elPista) elPista.textContent = 'Toca para ver la respuesta';
      elTarjeta.classList.remove('flashcard--respuesta');
    }
  }

  elTarjeta?.addEventListener('click', () => {
    mostrandoRespuesta = !mostrandoRespuesta;
    renderFarma();
  });

  btnAnterior?.addEventListener('click', () => {
    indice = (indice - 1 + FICHAS.length) % FICHAS.length;
    mostrandoRespuesta = false;
    renderFarma();
  });

  btnSiguiente?.addEventListener('click', () => {
    indice = (indice + 1) % FICHAS.length;
    mostrandoRespuesta = false;
    renderFarma();
  });

  // ---------- Dosis pediátrica ----------
  btnCalcularPed?.addEventListener('click', calcularPed);
  btnLimpiarPed?.addEventListener('click', limpiarPed);

  function limpiarPed() {
    if (inputPesoPed) inputPesoPed.value = '';
    if (inputDosisKg) inputDosisKg.value = '';
    frecuencia = 3;
    botonesFrecuencia.forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.frecuencia === '3' ? 'true' : 'false')
    );
    ocultarPed();
    inputPesoPed?.focus();
  }

  function ocultarPed() {
    if (errorPed) errorPed.hidden = true;
    if (resultadoPed) resultadoPed.hidden = true;
  }

  function calcularPed() {
    ocultarPed();
    const peso = parseFloat(inputPesoPed?.value);
    const dosisKg = parseFloat(inputDosisKg?.value);

    if (!peso || peso <= 0) {
      if (errorPed) { errorPed.textContent = 'Ingresa el peso del niño en kg.'; errorPed.hidden = false; }
      return;
    }
    if (peso > 60) {
      if (errorPed) { errorPed.textContent = 'Verifica: el peso parece alto para pediatría (máx. 60 kg).'; errorPed.hidden = false; }
      return;
    }
    if (!dosisKg || dosisKg <= 0) {
      if (errorPed) { errorPed.textContent = 'Ingresa la dosis indicada en mg/kg/día.'; errorPed.hidden = false; }
      return;
    }

    const dosisDiaria = peso * dosisKg;
    const dosisToma = dosisDiaria / frecuencia;
    const redondeado = parseFloat(dosisToma.toFixed(2));
    const intervaloTexto = { 1: 'cada 24 h', 2: 'cada 12 h', 3: 'cada 8 h', 4: 'cada 6 h' }[frecuencia];

    if (resultadoPedValor) resultadoPedValor.textContent = redondeado;
    if (resultadoPed) resultadoPed.hidden = false;

    if (desglosePed) {
      desglosePed.innerHTML = `
        <p><strong>Fórmula:</strong> dosis diaria = peso × mg/kg/día · dosis por toma = dosis diaria ÷ frecuencia</p>
        <p>Dosis diaria = ${peso} kg × ${dosisKg} mg/kg/día = ${dosisDiaria.toFixed(2)} mg/día</p>
        <p>Dosis por toma = ${dosisDiaria.toFixed(2)} ÷ ${frecuencia} = <strong>${redondeado} mg</strong> (${intervaloTexto})</p>
        <p class="resultado__equivalente">
          ⚠ Verifica siempre con la ficha técnica del medicamento y el peso real del paciente.
        </p>
      `;
    }
  }

  renderFarma();
})();
