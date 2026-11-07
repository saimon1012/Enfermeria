// ============================================================
// datos-pensum.js — FABSI · TSU Enfermería
// Aquí se definen TODAS las materias y su contenido.
// ============================================================

// Semestres con contenido activo
const SEMESTRES_ACTIVOS = ['1', '2'];

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

  // ============================================================
  // SEMESTRES PENDIENTES (Descomentar cuando estén listos)
  // ============================================================
  /*
  "3": [
    { codigo: "CSL-10623", nombre: "Farmacología", uc: 3, prelacion: "", flashId: "farmacologia" },
    { codigo: "CSL-10812", nombre: "Microbiología y Parasitología", uc: 2, prelacion: "", flashId: "microbiologia" },
    { codigo: "CSL-10727", nombre: "Enfermería Materno Infantil II", uc: 7, prelacion: "", flashId: "materno" },
    { codigo: "CSL-11017", nombre: "Enfermería Médico Quirúrgico I", uc: 7, prelacion: "", flashId: null },
    { codigo: "CSL-10922", nombre: "Ética de la Enfermería", uc: 2, prelacion: "", flashId: null },
    { codigo: "CSL-10915", nombre: "Fisiología y Fisiopatología", uc: 5, prelacion: "", flashId: null }
  ],
  */
};

// Mapa de herramientas clínicas por materia
const HERRAMIENTAS_POR_MATERIA = {
  'CSL-10512': ['goteo', 'dosificacion'],
  'CSL-10622': ['nutricion'],
  'CSL-10613': ['bioquimica', 'conversor'],
  'CSL-10623': ['dosificacion', 'conversor'],
  'CSL-11017': ['goteo', 'dosificacion'],
  'CSL-11027': ['goteo', 'dosificacion'],
  'CSL-10717': ['materno'],
  'CSL-10727': ['materno'],
  'IRC-30303': ['goteo', 'dosificacion', 'conversor']
};

const NOMBRES_HERRAMIENTAS = {
  goteo:        { icono: '💧', nombre: 'Goteo IV',                subtitulo: 'Macro y microgotero' },
  dosificacion: { icono: '💉', nombre: 'Dosificación',            subtitulo: 'Regla de tres' },
  conversor:    { icono: '🧪', nombre: 'Conversor de unidades',   subtitulo: 'Masa y volumen' },
  bioquimica:   { icono: '🩸', nombre: 'Bioquímica',              subtitulo: 'Glucosa y osmolaridad' },
  nutricion:    { icono: '⚖️', nombre: 'Nutrición',               subtitulo: 'IMC y requerimiento hídrico' },
  materno:      { icono: '🤰', nombre: 'Edad gestacional',        subtitulo: 'FUM y regla de Naegele' }
};