// ============================================================
// datos-pensum.js — FABSI · TSU Enfermería
// ============================================================

const SEMESTRES_ACTIVOS = ['1', '2', '3', '4', '5']; // Todos activos

const PENSUM = {
  "1": [
    { codigo: "CSL-10112", nombre: "Psicología General", uc: 2, prelacion: "", flashId: "psicologia" },
    { codigo: "CSL-10512", nombre: "Enfermería Básica", uc: 7, prelacion: "", flashId: null },
    { codigo: "CSL-10622", nombre: "Nutrición y Dietética", uc: 2, prelacion: "", flashId: null },
    { codigo: "CSL-10214", nombre: "Morfología", uc: 4, prelacion: "", flashId: "morfologia" }
  ],
  "2": [
    { codigo: "CSL-10613", nombre: "Bioquímica", uc: 3, prelacion: "", flashId: null },
    { codigo: "CSL-10717", nombre: "Enfermería Materno Infantil I", uc: 7, prelacion: "", flashId: "materno" },
    { codigo: "CSL-10512", nombre: "Estadística Bioestadística y Epidemiología", uc: 2, prelacion: "", flashId: null },
    { codigo: "CSL-10224", nombre: "Anatomía Humana", uc: 4, prelacion: "", flashId: "anatomia" }
  ],
  "3": [
    { codigo: "CSL-10623", nombre: "Farmacología", uc: 3, prelacion: "", flashId: "farmacologia" },
    { codigo: "CSL-10812", nombre: "Microbiología y Parasitología", uc: 2, prelacion: "", flashId: "microbiologia" },
    { codigo: "CSL-10727", nombre: "Enfermería Materno Infantil II", uc: 7, prelacion: "", flashId: "materno-2" },
    { codigo: "CSL-11017", nombre: "Enfermería Médico Quirúrgico I", uc: 7, prelacion: "", flashId: "medico-quirurgico" },
    { codigo: "CSL-10922", nombre: "Ética de la Enfermería", uc: 2, prelacion: "", flashId: "etica" },
    { codigo: "CSL-10915", nombre: "Fisiología y Fisiopatología", uc: 5, prelacion: "", flashId: "fisiologia" }
  ],
  "4": [
    { codigo: "CSL-11116", nombre: "Enfermería en Salud Mental y Psiquiatría", uc: 6, prelacion: "", flashId: "salud-mental" },
    { codigo: "CSL-11027", nombre: "Enfermería Médico Quirúrgico II", uc: 7, prelacion: "", flashId: "medico-quirurgico-2" },
    { codigo: "CSL-11117", nombre: "Administración de la Atención de Enfermería", uc: 4, prelacion: "", flashId: "administracion" },
    { codigo: "CSL-11217", nombre: "Enfermería Comunitaria e Investigación Aplicada", uc: 7, prelacion: "", flashId: "comunitaria" }
  ],
  "5": [
    { codigo: "IRC-30303", nombre: "Pasantía Hospitalaria", uc: 3, prelacion: "", flashId: "pasantia" },
    { codigo: "IRC-30304", nombre: "Pasantía Comunitaria", uc: 3, prelacion: "", flashId: "pasantia" }
  ]
};

// ------------------------------------------------------------
// Herramientas clínicas por materia
// ------------------------------------------------------------
const HERRAMIENTAS_POR_MATERIA = {
  'CSL-10512': ['goteo', 'dosificacion', 'conversor', 'signos'], // Enfermería Básica
  'CSL-10622': ['nutricion'],                                     // Nutrición
  'CSL-10613': ['bioquimica', 'conversor'],                       // Bioquímica
  'CSL-10623': ['dosificacion', 'conversor'],                     // Farmacología
  'CSL-11017': ['goteo', 'dosificacion'],                         // Médico Quirúrgico I
  'CSL-11027': ['goteo', 'dosificacion'],                         // Médico Quirúrgico II
  'CSL-10717': ['materno'],                                       // Materno Infantil I
  'CSL-10727': ['materno'],                                       // Materno Infantil II
  'IRC-30303': ['goteo', 'dosificacion', 'conversor', 'signos']   // Pasantía Hospitalaria
};

const NOMBRES_HERRAMIENTAS = {
  goteo:        { icono: '💧', nombre: 'Goteo IV',                subtitulo: 'Macro y microgotero' },
  dosificacion: { icono: '💉', nombre: 'Dosificación',            subtitulo: 'Regla de tres' },
  conversor:    { icono: '🧪', nombre: 'Conversor de unidades',   subtitulo: 'Masa y volumen' },
  bioquimica:   { icono: '🩸', nombre: 'Bioquímica',              subtitulo: 'Glucosa y osmolaridad' },
  nutricion:    { icono: '⚖️', nombre: 'Nutrición',               subtitulo: 'IMC y requerimiento hídrico' },
  materno:      { icono: '🤰', nombre: 'Edad gestacional',        subtitulo: 'FUM y regla de Naegele' },
  signos:       { icono: '🩺', nombre: 'Signos Vitales',          subtitulo: 'Evaluación rápida' }
};