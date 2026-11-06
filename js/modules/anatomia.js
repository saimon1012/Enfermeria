// ============================================================
// anatomia.js — Módulo 3d: Anatomía Humana (2° semestre)
// Flashcards de sistemas anatómicos.
// Complementa Morfología (1° semestre) con enfoque sistémico.
// ============================================================

(function () {
  const FICHAS = [
    { pregunta: 'Sistema cardiovascular — corazón', respuesta: 'Órgano muscular hueco de 4 cavidades (2 aurículas, 2 ventrículos). Bombea ~5 L/min en reposo. Arteria aorta: mayor del cuerpo. Vena cava: retorno venoso.' },
    { pregunta: 'Circulación mayor (sistémica)', respuesta: 'Ventrículo izquierdo → aorta → tejidos → venas cavas → aurícula derecha. Transporta O₂ y nutrientes a todo el cuerpo.' },
    { pregunta: 'Circulación menor (pulmonar)', respuesta: 'Ventrículo derecho → arteria pulmonar → pulmones → venas pulmonares → aurícula izquierda. Intercambio gaseoso.' },
    { pregunta: 'Sistema respiratorio — vías', respuesta: 'Superiores: nariz, faringe, laringe. Inferiores: tráquea, bronquios, bronquiolos, alvéolos. Función: conducción y hematosis (intercambio gaseoso).' },
    { pregunta: 'Alvéolos pulmonares', respuesta: 'Sacos terminales donde ocurre el intercambio gaseoso (O₂/CO₂). Adulto tiene ~300 millones. Superficie total: ~70 m².' },
    { pregunta: 'Sistema digestivo — tubo', respuesta: 'Boca → faringe → esófago → estómago → intestino delgado → intestino grueso → recto → ano. Glándulas anexas: hígado, páncreas, vesícula.' },
    { pregunta: 'Intestino delgado', respuesta: 'Porción más larga (~6–7 m). Porciones: duodeno, yeyuno, íleon. Función: absorción de nutrientes mediante vellosidades intestinales.' },
    { pregunta: 'Hígado', respuesta: 'Glándula más grande del cuerpo (~1.5 kg). Funciones: metabolismo, detoxificación, producción de bilis, almacenamiento de glucógeno, síntesis de proteínas.' },
    { pregunta: 'Sistema renal — nefrona', respuesta: 'Unidad funcional del riñón (~1 millón por riñón). Componentes: corpúsculo de Malpighi + túbulos (proximal, asa de Henle, distal, colector). Función: filtración, reabsorción, secreción.' },
    { pregunta: 'Sistema nervioso central', respuesta: 'Encéfalo + médula espinal. Encéfalo: cerebro, cerebelo, tronco encefálico. Función: integración, coordinación, control de funciones vitales.' },
    { pregunta: 'Sistema nervioso periférico', respuesta: 'Nervios craneales (12 pares) y espinales (31 pares). Se divide en somático (voluntario) y autónomo (simpático y parasimpático).' },
    { pregunta: 'Sistema endocrino — hipófisis', respuesta: 'Glándula maestra. Adenohipófisis: GH, TSH, ACTH, FSH, LH, prolactina. Neurohipófisis: ADH, oxitocina. Regula otras glándulas.' },
    { pregunta: 'Tiroides', respuesta: 'Glándula en el cuello. Produce T3 y T4 (metabolismo) y calcitonina (reduce calcio sanguíneo). Regulada por TSH hipofisaria.' },
    { pregunta: 'Sistema osteoarticular', respuesta: 'Huesos (206 en adulto), articulaciones y ligamentos. Funciones: soporte, protección, movimiento, hematopoyesis, reserva de calcio y fósforo.' },
    { pregunta: 'Sistema muscular', respuesta: 'Tipos: esquelético (voluntario, estriado), liso (involuntario, vísceras), cardíaco (involuntario, estriado). Función: movimiento, postura, producción de calor.' },
    { pregunta: 'Sistema inmunológico', respuesta: 'Órganos: timo, bazo, ganglios linfáticos, médula ósea. Células: linfocitos T (inmunidad celular), B (humoral, anticuerpos), macrófagos (fagocitosis).' },
    { pregunta: 'Sistema tegumentario', respuesta: 'Piel + anexos (pelo, uñas, glándulas). Capas: epidermis, dermis, hipodermis. Funciones: protección, termorregulación, sensación, síntesis de vitamina D.' },
  ];

  let indice = 0;
  let mostrandoRespuesta = false;

  const elProgreso = document.getElementById('flashcard-anatomia-progreso');
  const elTarjeta = document.getElementById('flashcard-anatomia');
  const elEtiqueta = document.getElementById('flashcard-anatomia-etiqueta');
  const elTexto = document.getElementById('flashcard-anatomia-texto');
  const elPista = document.getElementById('flashcard-anatomia-pista');
  const btnAnterior = document.getElementById('btn-flashcard-anatomia-anterior');
  const btnSiguiente = document.getElementById('btn-flashcard-anatomia-siguiente');

  if (!elTarjeta) return;

  function render() {
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
