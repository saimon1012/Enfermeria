// ============================================================
// flashcards-morfologia.js — Módulo 2a: Flashcards de Morfología
// IDs usados en index.html: flashcard-morfo-*
// ============================================================

(function () {
  const FICHAS = [
    { pregunta: 'Plano sagital', respuesta: 'Divide el cuerpo en una mitad derecha y una mitad izquierda. Si pasa exactamente por el centro, se llama plano medio o mediosagital. Los planos paralelos a él se llaman parasagitales.' },
    { pregunta: 'Plano frontal (coronal)', respuesta: 'Divide el cuerpo en una parte anterior (ventral) y una posterior (dorsal). Se nombra indistintamente plano frontal o plano coronal: ambos nombres son válidos.' },
    { pregunta: 'Plano transversal (horizontal)', respuesta: 'Divide el cuerpo en una parte superior y una inferior; es perpendicular al eje longitudinal. También se le llama plano horizontal o axial.' },
    { pregunta: 'Eje longitudinal', respuesta: 'Va de la cabeza a los pies (eje céfalo-caudal). Es el eje alrededor del cual gira el plano transversal.' },
    { pregunta: 'Eje transversal', respuesta: 'Va de un lado a otro del cuerpo. También se llama eje laterolateral, mediolateral u horizontal. Alrededor de él ocurren la flexión y la extensión.' },
    { pregunta: 'Eje sagital (anteroposterior)', respuesta: 'Va de adelante hacia atrás del cuerpo. Es el eje alrededor del cual gira el plano frontal.' },
    { pregunta: 'Anterior / Posterior', respuesta: 'Anterior: hacia el frente del cuerpo (ventral). Posterior: hacia atrás del cuerpo (dorsal).' },
    { pregunta: 'Superior / Inferior', respuesta: 'Superior: más cerca de la cabeza (craneal). Inferior: más cerca de los pies (caudal).' },
    { pregunta: 'Medial / Lateral', respuesta: 'Medial: más cerca de la línea media del cuerpo. Lateral: más alejado de la línea media.' },
    { pregunta: 'Proximal / Distal', respuesta: 'Proximal: más cerca del punto de origen o del tronco. Distal: más alejado del tronco. Se usa sobre todo en extremidades.' },
    { pregunta: 'Cráneo', respuesta: 'Estructura ósea que protege el encéfalo; se compone de huesos craneales y faciales.' },
    { pregunta: 'Clavícula', respuesta: 'Hueso largo que conecta el esternón con la escápula; forma parte de la cintura escapular.' },
    { pregunta: 'Húmero', respuesta: 'Hueso largo único del brazo; va del hombro al codo.' },
    { pregunta: 'Radio y cúbito (ulna)', respuesta: 'Los dos huesos del antebrazo: el radio está del lado del pulgar, el cúbito del lado del meñique. "Cúbito" y "ulna" son el mismo hueso: en español se usan ambos nombres.' },
    { pregunta: 'Columna vertebral', respuesta: 'Conjunto de 33 vértebras divididas en cervicales, torácicas, lumbares, sacras y coccígeas; protege la médula espinal.' },
    { pregunta: 'Costillas', respuesta: '12 pares de huesos que forman la caja torácica y protegen el corazón y los pulmones.' },
    { pregunta: 'Fémur', respuesta: 'Hueso más largo y fuerte del cuerpo; va de la cadera a la rodilla.' },
    { pregunta: 'Tibia y peroné (fíbula)', respuesta: 'Los dos huesos de la pierna: la tibia soporta el peso, el peroné es más delgado y lateral. "Peroné" es el nombre más usado en Latinoamérica; el término oficial internacional es "fíbula".' },
  ];

  let indice = 0;
  let mostrandoRespuesta = false;

  const elProgreso   = document.getElementById('flashcard-morfo-progreso');
  const elTarjeta    = document.getElementById('flashcard-morfo');
  const elEtiqueta   = document.getElementById('flashcard-morfo-etiqueta');
  const elTexto      = document.getElementById('flashcard-morfo-texto');
  const elPista      = document.getElementById('flashcard-morfo-pista');
  const btnAnterior  = document.getElementById('btn-flashcard-morfo-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-morfo-siguiente');

  if (!elTarjeta) return;

  function render() {
    const ficha = FICHAS[indice];

    if (elProgreso) elProgreso.textContent = `Ficha ${indice + 1} de ${FICHAS.length}`;

    if (mostrandoRespuesta) {
      if (elEtiqueta) elEtiqueta.textContent = 'Respuesta';
      if (elTexto)    elTexto.textContent = ficha.respuesta;
      if (elPista)    elPista.textContent = 'Toca para ver la pregunta';
      elTarjeta.classList.add('flashcard--respuesta');
    } else {
      if (elEtiqueta) elEtiqueta.textContent = 'Pregunta';
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
