// ============================================================
// flashcards-morfologia.js — Módulo 2: Flashcards de Morfología
//
// Las fichas van incrustadas directamente aquí (no en un .json externo)
// a propósito: fetch() de un archivo local falla en navegadores móviles
// cuando la app se abre como file://. Cuando publiquemos la app en
// internet (Módulo 3), se puede migrar esto a /data si se prefiere
// mantener el contenido separado del código.
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

  // ---------- Estado local ----------
  let indice = 0;
  let mostrandoRespuesta = false;

  // ---------- Referencias al DOM ----------
  const elProgreso = document.getElementById('flashcard-progreso');
  const elTarjeta = document.getElementById('flashcard');
  const elEtiqueta = document.getElementById('flashcard-etiqueta');
  const elTexto = document.getElementById('flashcard-texto');
  const elPista = document.getElementById('flashcard-pista');
  const btnAnterior = document.getElementById('btn-flashcard-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-siguiente');

  if (!elTarjeta) return; // esta vista no está en el DOM, no hace nada

  function render() {
    const ficha = FICHAS[indice];
    elProgreso.textContent = `Ficha ${indice + 1} de ${FICHAS.length}`;

    if (mostrandoRespuesta) {
      elEtiqueta.textContent = 'Respuesta';
      elTexto.textContent = ficha.respuesta;
      elPista.textContent = 'Toca para ver la pregunta';
      elTarjeta.classList.add('flashcard--respuesta');
    } else {
      elEtiqueta.textContent = 'Pregunta';
      elTexto.textContent = ficha.pregunta;
      elPista.textContent = 'Toca para ver la respuesta';
      elTarjeta.classList.remove('flashcard--respuesta');
    }
  }

  // Tocar la tarjeta voltea entre pregunta y respuesta
  elTarjeta.addEventListener('click', () => {
    mostrandoRespuesta = !mostrandoRespuesta;
    render();
  });

  // Navegación circular: después de la última ficha vuelve a la primera
  btnAnterior.addEventListener('click', () => {
    indice = (indice - 1 + FICHAS.length) % FICHAS.length;
    mostrandoRespuesta = false; // cada ficha nueva empieza mostrando la pregunta
    render();
  });

  btnSiguiente.addEventListener('click', () => {
    indice = (indice + 1) % FICHAS.length;
    mostrandoRespuesta = false;
    render();
  });

  render(); // estado inicial al cargar la página
})();
