// ============================================================
// flashcards-psicologia.js — Módulo 2b: Psicología General y Social
// IDs usados en index.html: flashcard-psi-*
// ============================================================

(function () {
  const FICHAS = [
    // ---------------- Mecanismos de defensa ----------------
    { categoria: 'Mecanismo de defensa', pregunta: 'Negación', respuesta: 'Rechazo inconsciente a aceptar una realidad dolorosa o amenazante. Ej.: un paciente oncológico niega su diagnóstico a pesar de las pruebas.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Proyección', respuesta: 'Atribuir a otros los propios sentimientos, impulsos o pensamientos inaceptables. Ej.: "el enfermero me odia", cuando en realidad es el paciente quien siente hostilidad.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Racionalización', respuesta: 'Justificar con argumentos lógicos (pero falsos) una conducta o sentimiento que en realidad tiene otra causa. Ej.: "no fui a la consulta porque no me dolía tanto".' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Desplazamiento', respuesta: 'Redirigir un impulso o emoción hacia un objeto o persona menos amenazante. Ej.: el paciente grita a la enfermera porque está enojado con su familia.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Regresión', respuesta: 'Retroceso a etapas evolutivas anteriores ante situaciones estresantes. Ej.: un niño hospitalizado vuelve a chuparse el dedo o a hablar como bebé.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Represión', respuesta: 'Exclusión inconsciente de la conciencia de pensamientos o recuerdos dolorosos. Es el mecanismo de defensa más básico según Freud.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Sublimación', respuesta: 'Canalizar impulsos inaceptables hacia actividades socialmente aceptadas. Ej.: un paciente con agresividad se inscribe en boxeo o arte marcial.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Formación reactiva', respuesta: 'Expresar lo opuesto a lo que realmente se siente. Ej.: una madre que rechaza inconscientemente a su hijo se muestra sobreprotectora.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Identificación', respuesta: 'Adoptar características de otra persona (generalmente admirada) para reducir la ansiedad. Ej.: el estudiante de enfermería imita el trato de su docente favorito.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Aislamiento afectivo', respuesta: 'Separar la emoción del contenido de un recuerdo o situación. Ej.: el paciente describe su cirugía con detalle técnico pero sin emoción.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Intelectualización', respuesta: 'Usar el pensamiento abstracto para evitar el contacto con la emoción dolorosa. Ej.: un familiar explica con términos médicos la muerte del paciente sin expresar tristeza.' },
    { categoria: 'Mecanismo de defensa', pregunta: 'Compensación', respuesta: 'Compensar una deficiencia real o imaginaria desarrollando otra habilidad. Ej.: un paciente con obesidad destaca en su desempeño académico.' },

    // ---------------- Etapas del duelo (Kübler-Ross) ----------------
    { categoria: 'Etapa del duelo', pregunta: '1. Negación', respuesta: 'Primera etapa del duelo (Kübler-Ross). El paciente o familiar rechaza el diagnóstico o la pérdida. Función: amortiguar el impacto emocional inicial.' },
    { categoria: 'Etapa del duelo', pregunta: '2. Ira', respuesta: 'Segunda etapa del duelo. Aparece enojo, resentimiento, a veces dirigido al personal de salud o a Dios. Función: canalizar la frustración ante la pérdida.' },
    { categoria: 'Etapa del duelo', pregunta: '3. Negociación', respuesta: 'Tercera etapa del duelo. El paciente o familiar intenta "pactar" con Dios, la vida o el personal de salud para retrasar o evitar la pérdida. Ej.: "si me porto bien, dejaré de fumar".' },
    { categoria: 'Etapa del duelo', pregunta: '4. Depresión', respuesta: 'Cuarta etapa del duelo. El paciente o familiar siente tristeza profunda, retraimiento y anticipación de la pérdida. Función: prepararse para la despedida.' },
    { categoria: 'Etapa del duelo', pregunta: '5. Aceptación', respuesta: 'Quinta etapa del duelo. El paciente o familiar acepta la pérdida con cierta calma y reorganiza su vida. No es resignación, es una integración emocional.' },
    { categoria: 'Etapa del duelo', pregunta: 'Resumen de Kübler-Ross', respuesta: 'Modelo de 5 etapas del duelo: Negación → Ira → Negociación → Depresión → Aceptación. No son lineales ni obligatorias; cada persona las vive a su ritmo y puede retroceder entre ellas.' },
  ];

  let indice = 0;
  let mostrandoRespuesta = false;

  const elProgreso   = document.getElementById('flashcard-psi-progreso');
  const elTarjeta    = document.getElementById('flashcard-psi');
  const elEtiqueta   = document.getElementById('flashcard-psi-etiqueta');
  const elTexto      = document.getElementById('flashcard-psi-texto');
  const elPista      = document.getElementById('flashcard-psi-pista');
  const btnAnterior  = document.getElementById('btn-flashcard-psi-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-psi-siguiente');

  if (!elTarjeta) return;

  function render() {
    const ficha = FICHAS[indice];

    if (elProgreso) elProgreso.textContent = `Ficha ${indice + 1} de ${FICHAS.length}`;

    if (mostrandoRespuesta) {
      if (elEtiqueta) elEtiqueta.textContent = ficha.categoria || 'Respuesta';
      if (elTexto)    elTexto.textContent = ficha.respuesta;
      if (elPista)    elPista.textContent = 'Toca para ver la pregunta';
      elTarjeta.classList.add('flashcard--respuesta');
    } else {
      if (elEtiqueta) elEtiqueta.textContent = ficha.categoria || 'Pregunta';
      if (elTexto)    elTexto.textContent = ficha.pregunta;
      if (elPista)    elPista.textContent = 'Toca para ver la respuesta';
      elTarjeta.classList.remove('flashcard--respuesta');
    }
  }

  elTarjeta.addEventListener('click', () => {
    mostrandoRespuesta = !mostrandoRespuesta;
    render();
  });

  btnAnterior?.addEventListener('click', () => {
    indice = (indice - 1 + FICHAS.length) % FICHAS.length;
    mostrandoRespuesta = false;
    render();
  });

  btnSiguiente?.addEventListener('click', () => {
    indice = (indice + 1) % FICHAS.length;
    mostrandoRespuesta = false;
    render();
  });

  render();
})();
