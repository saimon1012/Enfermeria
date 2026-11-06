// ============================================================
// app.js — Control de Vistas, Pensum, Modo guardia y Update SW
// ============================================================

const VISTAS = {
  inicio:             { seccion: 'vista-inicio',             titulo: 'Inicio' },
  semestres:          { seccion: 'vista-semestres',          titulo: 'Plan de Estudios' },
  practico:           { seccion: 'vista-practico',           titulo: 'Central de Prácticas' },
  teorico:            { seccion: 'vista-teorico',            titulo: 'Módulo Teórico' },
  // Vistas independientes para cada materia del 2do Semestre:
  bioquimica:         { seccion: 'vista-bioquimica',         titulo: 'Bioquímica Clínica' },
  farmacologia:       { seccion: 'vista-farmacologia',       titulo: 'Farmacología' },
  'materno-infantil': { seccion: 'vista-materno-infantil',   titulo: 'Materno Infantil I' },
  anatomia:           { seccion: 'vista-anatomia',           titulo: 'Anatomía Humana' },
  microbiologia:      { seccion: 'vista-microbiologia',      titulo: 'Microbiología y Parasitología' },
  ajustes:            { seccion: 'vista-ajustes',            titulo: 'Ajustes' },
};

const tituloEl = document.getElementById('vista-titulo');

// ------------------------------------------------------------
// Datos del pensum (Plan 2010 UNEFA) — Escalable para 1 al 5
// ------------------------------------------------------------
const DATOS_SEMESTRES = {
  1: {
    titulo: '1.er Semestre',
    desc: 'Bases biológicas, morfología y fundamentos de enfermería.',
    items: [
      { icono: '💉', texto: 'Módulo Práctico', desc: 'Goteo, dosificación y conversor de unidades.', ir: 'practico' },
      { icono: '🦴', texto: 'Módulo Teórico', desc: 'Flashcards de Morfología, Psicología y Nutrición.', ir: 'teorico' },
      { icono: '🧠', texto: 'Psicología General y Social', desc: 'Bases de la conducta y relación enfermero-paciente.', ir: 'teorico' },
    ],
  },
  2: {
    titulo: '2.do Semestre',
    desc: 'Bioquímica, farmacología fundamental, microbiología y anatomía.',
    items: [
      { icono: '🧪', texto: 'Bioquímica Clínica', desc: 'Glucosa, osmolaridad y rangos de referencia.', ir: 'teorico' },
      { icono: '💊', texto: 'Farmacología', desc: 'Grupos farmacológicos y dosis pediátrica.', ir: 'teorico' },
      { icono: '🤰', texto: 'Materno Infantil I', desc: 'Embarazo y edad gestacional (Naegele).', ir: 'teorico' },
      { icono: '🫀', texto: 'Anatomía Humana', desc: 'Sistemas anatómicos y estructuras.', ir: 'teorico' },
      { icono: '🦠', texto: 'Microbiología y Parasitología', desc: 'Microorganismos y cadenas de infección.', ir: 'teorico' },
    ],
  },
  3: {
    titulo: '3.er Semestre',
    desc: 'Enfermería medicoquirúrgica I y fisiopatología clínica.',
    items: [
      { icono: '🏥', texto: 'Enfermería Médico-Quirúrgico I', desc: 'Valoración de pacientes adultos y perioperatorio.', ir: '' },
      { icono: '🔬', texto: 'Fisiopatología', desc: 'Alteraciones funcionales del organismo humano.', ir: '' },
    ],
  },
  4: {
    titulo: '4.to Semestre',
    desc: 'Salud mental, psiquiatría y enfermería comunitaria.',
    items: [
      { icono: '🧩', texto: 'Salud Mental y Psiquiatría', desc: 'Abordaje clínico y guías de PAE.', ir: '' },
      { icono: '🏡', texto: 'Enfermería Comunitaria', desc: 'Atención primaria en salud y epidemiología.', ir: '' },
    ],
  },
  5: {
    titulo: '5.to Semestre',
    desc: 'Práctica profesional y consolidación de pasantías.',
    items: [
      { icono: '🩺', texto: 'Pasantía Hospitalaria', desc: 'Procedimientos avanzados en áreas críticas.', ir: '' },
      { icono: '🤝', texto: 'Pasantía Comunitaria', desc: 'Planes de atención integral en comunidades.', ir: '' },
    ],
  },
};

// ------------------------------------------------------------
// Control de vistas
// ------------------------------------------------------------
function mostrarVista(nombreVista) {
  const vista = VISTAS[nombreVista];
  if (!vista) return;

  document.querySelectorAll('[data-vista]').forEach((seccion) => {
    seccion.hidden = seccion.id !== vista.seccion;
  });

  if (tituloEl) tituloEl.textContent = vista.titulo;

  document.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    const esActivo = btn.dataset.irA === nombreVista;
    if (esActivo) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  window.scrollTo(0, 0);
}

// ------------------------------------------------------------
// Render dinámico de semestres (en #vista-semestres)
// ------------------------------------------------------------
function seleccionarSemestre(num) {
  num = String(num);

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.setAttribute('aria-selected', btn.dataset.semestre === num ? 'true' : 'false');
  });

  const sem = DATOS_SEMESTRES[num];
  if (!sem) return;

  const tituloSem = document.getElementById('semestre-titulo');
  const descSem = document.getElementById('semestre-desc');
  const grid = document.getElementById('semestre-contenido-grid');
  if (!grid) return;

  if (tituloSem) tituloSem.textContent = sem.titulo;
  if (descSem) descSem.textContent = sem.desc;

  grid.innerHTML = '';
  sem.items.forEach((item) => {
    const tarjeta = document.createElement(item.ir ? 'a' : 'div');
    tarjeta.className = 'card';

    if (item.ir) {
      tarjeta.href = '#';
      tarjeta.dataset.irA = item.ir;
    } else {
      tarjeta.setAttribute('aria-disabled', 'true');
      tarjeta.classList.add('card--deshabilitada');
    }

    tarjeta.innerHTML = `
      <span class="card__icono" aria-hidden="true">${item.icono}</span>
      <span class="card__texto">
        <strong>${item.texto}</strong>
        <small>${item.desc}</small>
      </span>
    `;
    grid.appendChild(tarjeta);
  });
}

// ------------------------------------------------------------
// Delegación global: tabs de semestres + navegación
// ------------------------------------------------------------
document.body.addEventListener('click', (evento) => {
  const tab = evento.target.closest('.tab-btn[data-semestre]');
  if (tab) {
    seleccionarSemestre(tab.dataset.semestre);
    return;
  }

  const nav = evento.target.closest('[data-ir-a]');
  if (!nav || nav.disabled) return;

  evento.preventDefault();

  const semestreObjetivo = nav.dataset.abrirSemestre;
  if (semestreObjetivo) seleccionarSemestre(semestreObjetivo);

  mostrarVista(nav.dataset.irA);
});

// ------------------------------------------------------------
// Indicador de conexión
// ------------------------------------------------------------
const badgeConexion = document.getElementById('estado-conexion');
function actualizarEstadoConexion() {
  if (!badgeConexion) return;
  const enLinea = navigator.onLine;
  badgeConexion.textContent = enLinea ? 'En línea' : 'Sin conexión';
  badgeConexion.classList.toggle('app-header__badge--online', enLinea);
}
window.addEventListener('online', actualizarEstadoConexion);
window.addEventListener('offline', actualizarEstadoConexion);
actualizarEstadoConexion();

// ------------------------------------------------------------
// Modo guardia (persistente)
// ------------------------------------------------------------
const CLAVE_MODO = 'fabsi:modo';
const toggleGuardia = document.getElementById('toggle-modo-guardia');

function aplicarModoGuardia(activo) {
  document.documentElement.dataset.modo = activo ? 'guardia' : '';
}

try {
  if (localStorage.getItem(CLAVE_MODO) === 'guardia') {
    aplicarModoGuardia(true);
    if (toggleGuardia) toggleGuardia.checked = true;
  }
} catch (_) { /* localStorage no disponible */ }

if (toggleGuardia) {
  toggleGuardia.addEventListener('change', (e) => {
    const activo = e.target.checked;
    aplicarModoGuardia(activo);
    try { localStorage.setItem(CLAVE_MODO, activo ? 'guardia' : ''); }
    catch (_) { /* silencioso */ }
  });
}

// ------------------------------------------------------------
// Inicialización
// ------------------------------------------------------------
seleccionarSemestre(1);
mostrarVista('inicio');
