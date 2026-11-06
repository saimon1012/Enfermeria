// ============================================================
// materno-infantil.js — Módulo 3c: Enfermería Materno Infantil I
//
// Contenido:
//   1) Flashcards de embarazo, parto y puerperio (16 fichas)
//   2) Calculadora de edad gestacional por FUM (Regla de Naegele)
//      FPP = FUM + 7 días − 3 meses + 1 año
//      EG (semanas) = días desde FUM ÷ 7
// ============================================================

(function () {
  const FICHAS = [
    { pregunta: 'Regla de Naegele', respuesta: 'Calcula la fecha probable de parto (FPP): a la FUM se le suman 7 días, se le restan 3 meses y se le suma 1 año. Ej.: FUM 10/03/2025 → FPP 17/12/2025.' },
    { pregunta: 'Trimestres del embarazo', respuesta: '1.er trimestre: semanas 1–13. 2.do trimestre: semanas 14–27. 3.er trimestre: semana 28 hasta el parto (≈40 semanas).' },
    { pregunta: 'Signos presuntivos de embarazo', respuesta: 'Amenorrea, náuseas matutinas, mastalgia, poliaquiuria, fatiga. Son subjetivos y no confirman el embarazo.' },
    { pregunta: 'Signos probables de embarazo', respuesta: 'Útero agrandado, signo de Chadwick (cianosis vaginal), signo de Hegar (reblandecimiento del istmo), test de embarazo positivo (hCG en orina o sangre).' },
    { pregunta: 'Signos positivos de embarazo', respuesta: 'Ausencia de menstruación confirmada con ecografía, actividad cardíaca fetal, movimientos fetales percibidos por el examinador. Confirman el embarazo.' },
    { pregunta: 'hCG (gonadotropina coriónica humana)', respuesta: 'Hormona producida por el trofoblasto tras la implantación. Detectable en sangre desde ~7 días post-fecundación y en orina desde ~14 días. Base de los test de embarazo.' },
    { pregunta: 'Dilatación cervical', respuesta: 'Apertura del cuello uterino medida en cm (0–10). 10 cm = dilatación completa, inicio del período expulsivo. Se evalúa junto con borramiento y estación fetal.' },
    { pregunta: 'Borramiento cervical', respuesta: 'Acortamiento del cuello uterino (0–100 %). Junto con la dilatación indica progreso del trabajo de parto. Se completa antes del período expulsivo.' },
    { pregunta: 'Periodos del parto', respuesta: '1) Dilatación (0–10 cm). 2) Expulsivo (nacimiento). 3) Alumbramiento (expulsión de placenta). 4) Puerperio inmediato (2 h post-parto, vigilancia de sangrado).' },
    { pregunta: 'Alumbramiento', respuesta: 'Tercer período del parto: expulsión de la placenta y membranas. Duración normal: 5–30 min. Signos: globo de seguridad, alargamiento del cordón, sangrado.' },
    { pregunta: 'Puerperio', respuesta: 'Período post-parto (6 semanas). Se divide en inmediato (primeras 24 h), mediato (hasta 7 días) y tardío (hasta 42 días). Vigilar loquios, involución uterina y signos de infección.' },
    { pregunta: 'Loquios', respuesta: 'Secreción vaginal post-parto. Rojos (loquios rubra) 1–3 días → rosados (serosa) 4–10 días → blancos (alba) 11–21 días. Mal olor o retorno a rubra = signo de alarma.' },
    { pregunta: 'Lactancia materna exclusiva', respuesta: 'OMS: leche materna exclusiva hasta los 6 meses, sin agua ni otros alimentos. Luego se complementa con alimentación sólida hasta los 2 años o más.' },
    { pregunta: 'Calostro', respuesta: 'Primera leche (días 1–3 post-parto). Amarillenta, rica en inmunoglobulina A (IgA), proteínas y factores inmunológicos. Esencial para el neonato.' },
    { pregunta: 'Signos de alarma en el embarazo', respuesta: 'Sangrado vaginal, dolor abdominal intenso, cefalea intensa con visión borrosa (preeclampsia), disminución de movimientos fetales, pérdida de líquido amniótico, fiebre.' },
    { pregunta: 'Preeclampsia', respuesta: 'Trastorno hipertensivo del embarazo (>20 semanas): HTA ≥140/90 + proteinuria o daño de órgano blanco. Complicación grave: eclampsia (convulsiones). Tratamiento: sulfato de magnesio.' },
  ];

  let indice = 0;
  let mostrandoRespuesta = false;

  const elProgreso = document.getElementById('flashcard-materno-progreso');
  const elTarjeta = document.getElementById('flashcard-materno');
  const elEtiqueta = document.getElementById('flashcard-materno-etiqueta');
  const elTexto = document.getElementById('flashcard-materno-texto');
  const elPista = document.getElementById('flashcard-materno-pista');
  const btnAnterior = document.getElementById('btn-flashcard-materno-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-materno-siguiente');

  // ---------- Gestación ----------
  const botonesSubMaterno = document.querySelectorAll('[data-sub-materno]');
  const bloquesSubMaterno = document.querySelectorAll('[data-sub-materno-contenido]');

  const inputFum = document.getElementById('input-fum');
  const btnCalcularFum = document.getElementById('btn-calcular-fum');
  const btnLimpiarFum = document.getElementById('btn-limpiar-fum');
  const errorFum = document.getElementById('error-fum');
  const resultadoFum = document.getElementById('resultado-fum');
  const resultadoFumValor = document.getElementById('resultado-fum-valor');
  const resultadoFumUnidad = document.getElementById('resultado-fum-unidad');
  const desgloseFum = document.getElementById('desglose-fum');

  if (!elTarjeta && !btnCalcularFum) return;

  // ---------- Toggle sub-materno ----------
  botonesSubMaterno.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.subMaterno;
      botonesSubMaterno.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      bloquesSubMaterno.forEach((bloque) => {
        bloque.hidden = bloque.dataset.subMaternoContenido !== sub;
      });
    });
  });

  function renderMaterno() {
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
    renderMaterno();
  });

  btnAnterior?.addEventListener('click', () => {
    indice = (indice - 1 + FICHAS.length) % FICHAS.length;
    mostrandoRespuesta = false;
    renderMaterno();
  });

  btnSiguiente?.addEventListener('click', () => {
    indice = (indice + 1) % FICHAS.length;
    mostrandoRespuesta = false;
    renderMaterno();
  });

  // ---------- Edad gestacional / FPP ----------
  btnCalcularFum?.addEventListener('click', calcularFum);
  btnLimpiarFum?.addEventListener('click', limpiarFum);

  function limpiarFum() {
    if (inputFum) inputFum.value = '';
    if (errorFum) errorFum.hidden = true;
    if (resultadoFum) resultadoFum.hidden = true;
    inputFum?.focus();
  }

  function calcularFum() {
    if (errorFum) errorFum.hidden = true;
    if (resultadoFum) resultadoFum.hidden = true;

    const valor = inputFum?.value;
    if (!valor) {
      if (errorFum) { errorFum.textContent = 'Selecciona la FUM.'; errorFum.hidden = false; }
      return;
    }

    const fum = new Date(valor + 'T00:00:00');
    if (isNaN(fum.getTime())) {
      if (errorFum) { errorFum.textContent = 'Fecha inválida.'; errorFum.hidden = false; }
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffDias = Math.floor((hoy - fum) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      if (errorFum) { errorFum.textContent = 'La FUM no puede ser una fecha futura.'; errorFum.hidden = false; }
      return;
    }
    if (diffDias > 320) {
      if (errorFum) { errorFum.textContent = 'La FUM indica más de 45 semanas: verifica la fecha.'; errorFum.hidden = false; }
      return;
    }

    const semanas = Math.floor(diffDias / 7);
    const diasRestantes = diffDias % 7;

    // FPP por Naegele: FUM + 7 días − 3 meses + 1 año
    const fpp = new Date(fum);
    fpp.setDate(fpp.getDate() + 7);
    fpp.setMonth(fpp.getMonth() - 3);
    fpp.setFullYear(fpp.getFullYear() + 1);

    const fppTexto = fpp.toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const diasParaFpp = Math.floor((fpp - hoy) / (1000 * 60 * 60 * 24));

    if (resultadoFumValor) resultadoFumValor.textContent = `${semanas}s ${diasRestantes}d`;
    if (resultadoFumUnidad) resultadoFumUnidad.textContent = 'edad gestacional';
    if (resultadoFum) resultadoFum.hidden = false;

    let trimestre = '1.er trimestre';
    if (semanas >= 14 && semanas <= 27) trimestre = '2.do trimestre';
    else if (semanas >= 28) trimestre = '3.er trimestre';

    if (desgloseFum) {
      desgloseFum.innerHTML = `
        <p><strong>FUM:</strong> ${fum.toLocaleDateString('es-VE')}</p>
        <p><strong>Días transcurridos:</strong> ${diffDias} días</p>
        <p><strong>Edad gestacional:</strong> ${semanas} semanas + ${diasRestantes} días (${trimestre})</p>
        <p><strong>FPP (Regla de Naegele):</strong> ${fppTexto}</p>
        <p class="resultado__equivalente">
          ${diasParaFpp > 0
            ? `Faltan aproximadamente ${diasParaFpp} días para la FPP.`
            : `La FPP ya pasó hace ${Math.abs(diasParaFpp)} días. Verifica con ecografía.`}
        </p>
      `;
    }
  }

  renderMaterno();
})();
