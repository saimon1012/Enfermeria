// ============================================================
// app.js — FABSI · TSU Enfermería
// Versión: 2.0 (Arquitectura Dinámica + Traductor de IDs)
// ============================================================

(function () {
  'use strict';

  const VISTAS = ['inicio', 'pensum', 'calculadora', 'flashcards', 'herramientas', 'ajustes'];
  const STORAGE = {
    modoGuardia: 'fabsi.modoGuardia',
    semestreActual: 'fabsi.semestreActual',
    materiasUsuario: 'fabsi.materiasUsuario',
    materiasCustom: 'fabsi.materiasCustom'
  };

  // TRADUCTOR DE IDs: Conecta el ID del pensum con el que usan tus scripts
  const TRADUCTOR_FLASH_IDS = {
    'morfologia': 'morfo',
    'psicologia': 'psi',
    'anatomia': 'anatomia',
    'farmacologia': 'farma',
    'microbiologia': 'micro',
    'materno': 'materno'
  };

  // ============================================================
  // 1. NAVEGACIÓN
  // ============================================================
  function mostrarVista(nombre) {
    if (!VISTAS.includes(nombre)) nombre = 'inicio';
    VISTAS.forEach((v) => {
      const el = document.getElementById('vista-' + v);
      if (el) el.hidden = v !== nombre;
    });
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      if (item.dataset.vista === nombre) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    
    if (nombre === 'pensum') { cerrarDetalleMateria(); renderPensum(); }
    if (nombre === 'calculadora') renderCalculadora();
    if (nombre === 'flashcards') renderListaFlashcards();
    if (nombre === 'herramientas') cerrarHerramienta();
  }

  document.querySelectorAll('.bottom-nav__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarVista(item.dataset.vista);
    });
  });

  document.querySelectorAll('[data-ir-a]').forEach((card) => {
    const ir = () => mostrarVista(card.dataset.irA);
    card.addEventListener('click', ir);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); }
    });
  });

  // ============================================================
  // 2. BADGE ONLINE / OFFLINE
  // ============================================================
  function actualizarBadge() {
    const badge = document.getElementById('badge-conexion');
    if (!badge) return;
    const online = navigator.onLine;
    badge.textContent = online ? 'Online' : 'Offline';
    badge.classList.toggle('app-header__badge--online', online);
  }
  window.addEventListener('online', actualizarBadge);
  window.addEventListener('offline', actualizarBadge);
  actualizarBadge();

  // ============================================================
  // 3. MODO GUARDIA
  // ============================================================
  const toggleGuardia = document.getElementById('toggle-guardia');
  if (toggleGuardia) {
    const guardado = localStorage.getItem(STORAGE.modoGuardia) === '1';
    toggleGuardia.checked = guardado;
    document.documentElement.setAttribute('data-modo', guardado ? 'guardia' : 'normal');
    toggleGuardia.addEventListener('change', () => {
      const activo = toggleGuardia.checked;
      document.documentElement.setAttribute('data-modo', activo ? 'guardia' : 'normal');
      localStorage.setItem(STORAGE.modoGuardia, activo ? '1' : '0');
    });
  }

  // ============================================================
  // 4. SEMESTRE ACTUAL
  // ============================================================
  const selectSemestre = document.getElementById('select-semestre-actual');
  if (selectSemestre) {
    const guardado = localStorage.getItem(STORAGE.semestreActual) || '1';
    selectSemestre.value = guardado;
    selectSemestre.addEventListener('change', () => {
      localStorage.setItem(STORAGE.semestreActual, selectSemestre.value);
    });
  }
  function getSemestreActual() {
    return localStorage.getItem(STORAGE.semestreActual) || '1';
  }

  // ============================================================
  // 5. VISTA PENSUM
  // ============================================================
  let semestrePensumActivo = null;

  function renderPensum() {
    const tabs = document.getElementById('semester-tabs');
    const lista = document.getElementById('pensum-lista');
    if (!tabs || !lista) return;

    tabs.hidden = false;
    lista.hidden = false;

    const semestres = Object.keys(PENSUM).sort((a, b) => a - b);
    if (semestrePensumActivo === null) semestrePensumActivo = getSemestreActual();
    if (!PENSUM[semestrePensumActivo]) semestrePensumActivo = semestres[0];

    tabs.innerHTML = '';
    semestres.forEach((sem) => {
      const activo = SEMESTRES_ACTIVOS.includes(sem);
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.type = 'button';
      btn.textContent = `Sem ${sem}` + (activo ? '' : ' ⏳');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(sem === semestrePensumActivo));
      btn.addEventListener('click', () => {
        semestrePensumActivo = sem;
        renderPensum();
      });
      tabs.appendChild(btn);
    });

    lista.innerHTML = '';

    if (!SEMESTRES_ACTIVOS.includes(semestrePensumActivo)) {
      const aviso = document.createElement('p');
      aviso.className = 'vista__intro';
      aviso.textContent = '⏳ Este semestre estará disponible en una próxima actualización.';
      lista.appendChild(aviso);
      return;
    }

    const materias = PENSUM[semestrePensumActivo] || [];
    const grid = document.createElement('div');
    grid.className = 'card-grid';

    materias.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.innerHTML = `
        <span class="card__icono" aria-hidden="true">🩺</span>
        <div class="card__texto">
          <strong>${m.nombre}</strong>
          <small>${m.codigo} · ${m.uc} UC</small>
        </div>
      `;
      const abrir = () => abrirDetalleMateria(m, semestrePensumActivo);
      card.addEventListener('click', abrir);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
      });
      grid.appendChild(card);
    });
    lista.appendChild(grid);
  }

  // ============================================================
  // 5b. DETALLE DE MATERIA (PENSUM)
  // ============================================================
  function abrirDetalleMateria(m, semestre) {
    const tabs = document.getElementById('semester-tabs');
    const lista = document.getElementById('pensum-lista');
    if (!lista) return;
    if (tabs) tabs.hidden = true;
    lista.hidden = false;
    lista.innerHTML = '';

    const volver = document.createElement('button');
    volver.className = 'boton-secundario';
    volver.type = 'button';
    volver.textContent = '← Volver al pensum';
    volver.style.marginBottom = '12px';
    volver.style.width = '100%';
    volver.addEventListener('click', () => {
      cerrarDetalleMateria();
      renderPensum();
    });
    lista.appendChild(volver);

    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
      <h2 class="tool-card__titulo">${m.nombre}</h2>
      <p class="campo__nota">
        ${m.codigo} · ${m.uc} UC · Semestre ${semestre}
        ${m.prelacion ? ' · Prelación: ' + m.prelacion : ' · Sin prelación'}
      </p>
    `;
    lista.appendChild(card);

    const acciones = document.createElement('div');
    acciones.className = 'card-grid';

    acciones.appendChild(crearAccion(
      '🧮', 'Ver mis notas', 'Lleva el control de tus calificaciones',
      () => mostrarVista('calculadora')
    ));

    if (m.flashId) {
      acciones.appendChild(crearAccion(
        '🃏', 'Repasar con flashcards', 'Toca para estudiar',
        () => {
          mostrarVista('flashcards');
          abrirFlashcards(m.flashId);
        }
      ));
    }

    const herramientas = HERRAMIENTAS_POR_MATERIA[m.codigo] || [];
    herramientas.forEach((h) => {
      const meta = NOMBRES_HERRAMIENTAS[h];
      if (!meta) return;
      acciones.appendChild(crearAccion(
        meta.icono, meta.nombre, meta.subtitulo,
        () => {
          mostrarVista('herramientas');
          abrirHerramienta(h);
        }
      ));
    });

    if (!m.flashId && herramientas.length === 0) {
      const aviso = document.createElement('p');
      aviso.className = 'vista__intro';
      aviso.textContent = 'Aún no hay contenido adicional para esta materia.';
      lista.appendChild(acciones);
      lista.appendChild(aviso);
    } else {
      lista.appendChild(acciones);
    }

    window.scrollTo(0, 0);
  }

  function crearAccion(icono, titulo, subtitulo, onClick) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.innerHTML = `
      <span class="card__icono" aria-hidden="true">${icono}</span>
      <div class="card__texto">
        <strong>${titulo}</strong>
        <small>${subtitulo}</small>
      </div>
    `;
    card.addEventListener('click', onClick);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
    });
    return card;
  }

  function cerrarDetalleMateria() {
    const tabs = document.getElementById('semester-tabs');
    const lista = document.getElementById('pensum-lista');
    if (tabs) tabs.hidden = false;
    if (lista) lista.hidden = false;
  }

  // ============================================================
  // 6. CALCULADORA DE NOTAS (GENERAL)
  // ============================================================
  let filtroCalculadora = 'todas';

  document.querySelectorAll('[data-filtro]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filtroCalculadora = btn.dataset.filtro;
      document.querySelectorAll('[data-filtro]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      renderCalculadora();
    });
  });

  function getMateriasUsuario() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.materiasUsuario) || '{}');
    } catch { return {}; }
  }

  function renderCalculadora() {
    const lista = document.getElementById('calculadora-lista');
    if (!lista) return;

    lista.hidden = false;
    const filtros = document.querySelector('.filtros-rapidos');
    if (filtros) filtros.hidden = false;
    
    const btnAgregar = document.getElementById('btn-agregar-materia');
    if (btnAgregar) btnAgregar.parentElement.hidden = false;
    
    const detalleNotas = document.getElementById('detalle-notas');
    if (detalleNotas) detalleNotas.hidden = true;
    const formCustom = document.getElementById('form-materia-personalizada');
    if (formCustom) formCustom.hidden = true;

    const usuario = getMateriasUsuario();
    const semAct = getSemestreActual();
    const porSemestre = {};

    Object.keys(PENSUM).forEach((sem) => {
      if (!SEMESTRES_ACTIVOS.includes(sem)) return;
      porSemestre[sem] = PENSUM[sem]
        .map((m) => ({ ...m, semestre: sem, datos: usuario[m.codigo] || null }))
        .filter((m) => {
          if (filtroCalculadora === 'semestre-actual') return sem === semAct;
          if (filtroCalculadora === 'con-notas') return m.datos && m.datos.length > 0;
          return true;
        });
    });

    let customMaterias = [];
    try {
      customMaterias = JSON.parse(localStorage.getItem(STORAGE.materiasCustom) || '[]');
    } catch { customMaterias = []; }

    customMaterias.forEach(item => {
      const m = item.materia;
      const sem = item.semestre;
      const datosMateria = usuario[m.codigo] || null;
      
      if (filtroCalculadora === 'semestre-actual' && sem !== semAct) return;
      if (filtroCalculadora === 'con-notas' && (!datosMateria || datosMateria.length === 0)) return;

      if (!porSemestre[sem]) porSemestre[sem] = [];
      porSemestre[sem].push({ ...m, semestre: sem, datos: datosMateria });
    });

    lista.innerHTML = '';
    Object.keys(porSemestre).sort((a, b) => a - b).forEach((sem) => {
      const materias = porSemestre[sem];
      if (materias.length === 0 && filtroCalculadora !== 'todas') return;

      const seccion = document.createElement('div');
      seccion.className = 'semestre-seccion';
      seccion.dataset.abierto = String(sem === semAct);

      const header = document.createElement('button');
      header.className = 'semestre-seccion__header';
      header.type = 'button';
      header.innerHTML = `<span>Semestre ${sem}</span><span class="semestre-seccion__chevron">›</span>`;

      const contenido = document.createElement('div');
      contenido.className = 'semestre-seccion__contenido';
      contenido.hidden = seccion.dataset.abierto !== 'true';

      header.addEventListener('click', () => {
        seccion.dataset.abierto = seccion.dataset.abierto === 'true' ? 'false' : 'true';
        contenido.hidden = seccion.dataset.abierto !== 'true';
      });

      materias.forEach((m) => contenido.appendChild(crearFilaMateria(m)));
      seccion.appendChild(header);
      seccion.appendChild(contenido);
      lista.appendChild(seccion);
    });
  }

  function crearFilaMateria(m) {
    const fila = document.createElement('div');
    fila.className = 'materia-fila';
    fila.style.cursor = 'pointer';

    const nota = m.datos && m.datos.length > 0
      ? m.datos.reduce((acc, c) => acc + (c.nota * c.porcentaje / 100), 0)
      : null;

    let notaTxt = '—';
    let notaCls = 'materia-fila__nota--vacio';
    
    if (nota !== null) {
      notaTxt = nota.toFixed(2) + ' / 20';
      notaCls = nota >= 10 ? 'materia-fila__nota--ok' : 'materia-fila__nota--warn';
    }

    const esCustom = m.codigo && m.codigo.startsWith('CUSTOM-');

    fila.innerHTML = `
      <div class="materia-fila__info">
        <span class="materia-fila__nombre">${m.nombre}</span>
        <span class="materia-fila__meta">${m.codigo} ${m.uc ? '· ' + m.uc + ' UC' : ''}</span>
      </div>
      <span class="materia-fila__nota ${notaCls}">${notaTxt}</span>
      ${esCustom ? '<button class="btn-eliminar-materia" title="Eliminar materia" aria-label="Eliminar materia">🗑️</button>' : ''}
    `;
    
    fila.addEventListener('click', (e) => {
      if (e.target.closest('.btn-eliminar-materia')) return;
      abrirDetalleNotas(m);
    });
    
    if (esCustom) {
      const btnEliminar = fila.querySelector('.btn-eliminar-materia');
      btnEliminar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de que quieres eliminar la materia "${m.nombre}" y todas sus notas?`)) {
          eliminarMateriaCustom(m.codigo);
        }
      });
    }
    
    return fila;
  }

  function eliminarMateriaCustom(codigo) {
    const usuario = getMateriasUsuario();
    if (usuario[codigo]) {
      delete usuario[codigo];
      localStorage.setItem(STORAGE.materiasUsuario, JSON.stringify(usuario));
    }

    let customMaterias = [];
    try {
      customMaterias = JSON.parse(localStorage.getItem(STORAGE.materiasCustom) || '[]');
    } catch { customMaterias = []; }

    customMaterias = customMaterias.filter(item => item.materia.codigo !== codigo);
    localStorage.setItem(STORAGE.materiasCustom, JSON.stringify(customMaterias));

    const btnAgregar = document.getElementById('btn-agregar-materia');
    if (btnAgregar) btnAgregar.parentElement.hidden = false;

    renderCalculadora();
  }

  // ============================================================
  // 6b. DETALLE DE NOTAS (CORTES)
  // ============================================================
  let materiaActualNotas = null;

  function abrirDetalleNotas(m) {
    materiaActualNotas = m;
    
    document.getElementById('calculadora-lista').hidden = true;
    const filtros = document.querySelector('.filtros-rapidos');
    if (filtros) filtros.hidden = true;
    
    const btnAgregar = document.getElementById('btn-agregar-materia');
    if (btnAgregar) btnAgregar.parentElement.hidden = true;
    
    const panel = document.getElementById('detalle-notas');
    if (panel) panel.hidden = false;

    document.getElementById('notas-materia-nombre').textContent = m.nombre;
    document.getElementById('notas-materia-meta').textContent = `${m.codigo} ${m.uc ? '· ' + m.uc + ' UC' : ''} · Semestre ${m.semestre}`;

    const btnVolver = panel.querySelector('.volver-notas');
    const btnVolverNuevo = btnVolver.cloneNode(true);
    btnVolver.replaceWith(btnVolverNuevo);
    btnVolverNuevo.addEventListener('click', () => {
      panel.hidden = true;
      renderCalculadora();
    });

    const btnAgregarCorte = document.getElementById('btn-agregar-corte');
    const btnAgregarCorteNuevo = btnAgregarCorte.cloneNode(true);
    btnAgregarCorte.replaceWith(btnAgregarCorteNuevo);
    btnAgregarCorteNuevo.addEventListener('click', guardarNuevoCorte);

    renderCortesMateria();
  }

  function renderCortesMateria() {
    if (!materiaActualNotas) return;

    const lista = document.getElementById('notas-cortes-lista');
    const resumen = document.getElementById('resumen-materia');
    const datos = getMateriasUsuario()[materiaActualNotas.codigo] || [];
    
    const formAgregar = document.querySelector('#detalle-notas .form-materia');
    const btnAgregarCorte = document.getElementById('btn-agregar-corte');

    lista.innerHTML = '';

    if (datos.length === 0) {
      lista.innerHTML = '<p class="vista__intro">No hay cortes registrados aún.</p>';
      resumen.hidden = true;
      if (formAgregar) formAgregar.hidden = false;
      return;
    }

    let sumaPorcentajes = 0;
    let acumulado = 0;

    datos.forEach((corte, index) => {
      const fila = document.createElement('div');
      fila.className = 'corte-fila';
      fila.innerHTML = `
        <div class="corte-fila__campos">
          <span class="corte-fila__label">Corte ${index + 1}</span>
          <span style="font-family: var(--font-mono); font-size: var(--fs-sm);">${corte.nota.toFixed(1)} pts</span>
          <span style="font-size: var(--fs-xs); color: var(--color-ink-muted); margin-left: auto;">Porcentaje: ${corte.porcentaje}%</span>
        </div>
        <button class="corte-fila__eliminar" aria-label="Eliminar corte" title="Eliminar">×</button>
      `;
      
      fila.querySelector('.corte-fila__eliminar').addEventListener('click', () => {
        eliminarCorte(materiaActualNotas.codigo, index);
      });

      lista.appendChild(fila);
      
      sumaPorcentajes += corte.porcentaje;
      acumulado += corte.nota * (corte.porcentaje / 100);
    });

    resumen.hidden = false;
    
    document.getElementById('resumen-acumulado').textContent = acumulado.toFixed(2) + ' / 20';
    document.getElementById('resumen-porcentaje').textContent = sumaPorcentajes + '%';

    const faltaTxt = document.getElementById('resumen-falta-valor');
    const faltaLabel = document.getElementById('resumen-falta-texto');

    if (sumaPorcentajes >= 100) {
      faltaLabel.textContent = 'Nota final:';
      faltaTxt.textContent = acumulado >= 10 ? '¡Aprobado! 🎉' : 'Reprobado';
      faltaTxt.style.color = acumulado >= 10 ? 'var(--color-primary-dark)' : 'var(--color-accent)';
      
      if (formAgregar) formAgregar.hidden = true;
      if (btnAgregarCorte) btnAgregarCorte.hidden = true;
      
    } else {
      if (formAgregar) formAgregar.hidden = false;
      if (btnAgregarCorte) btnAgregarCorte.hidden = false;

      const porcentajeFaltante = 100 - sumaPorcentajes;
      const notaNecesaria = ((10 - acumulado) * 100) / porcentajeFaltante;
      
      if (notaNecesaria <= 0) {
        faltaLabel.textContent = '¡Ya tienes asegurado el aprobado!';
        faltaTxt.textContent = '—';
        faltaTxt.style.color = 'var(--color-primary-dark)';
      } else if (notaNecesaria > 20) {
        faltaLabel.textContent = 'Para aprobar necesitas:';
        faltaTxt.textContent = 'Imposible (más de 20)';
        faltaTxt.style.color = 'var(--color-accent)';
      } else {
        faltaLabel.textContent = `Para aprobar (10/20) te falta ${porcentajeFaltante}%:`;
        faltaTxt.textContent = notaNecesaria.toFixed(1) + ' pts';
        faltaTxt.style.color = 'var(--color-primary-dark)';
      }
    }
  }

  function guardarNuevoCorte() {
    if (!materiaActualNotas) return;

    const inputNota = document.getElementById('nuevo-corte-nota');
    const inputPorcentaje = document.getElementById('nuevo-corte-porcentaje');
    const errorEl = document.getElementById('error-corte');

    const nota = parseFloat(inputNota.value);
    const porcentaje = parseFloat(inputPorcentaje.value);

    errorEl.hidden = true;

    if (isNaN(nota) || nota < 0 || nota > 20) {
      errorEl.textContent = 'La nota debe ser entre 0 y 20.';
      errorEl.hidden = false;
      return;
    }
    if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
      errorEl.textContent = 'El porcentaje debe ser entre 1 y 100.';
      errorEl.hidden = false;
      return;
    }

    const usuario = getMateriasUsuario();
    const codigo = materiaActualNotas.codigo;
    
    if (!usuario[codigo]) usuario[codigo] = [];
    
    const porcentajeActual = usuario[codigo].reduce((acc, c) => acc + c.porcentaje, 0);
    if (porcentajeActual + porcentaje > 100) {
      errorEl.textContent = `La suma no puede pasar de 100%. (Ya has asignado ${porcentajeActual}%)`;
      errorEl.hidden = false;
      return;
    }

    usuario[codigo].push({ nota: nota, porcentaje: porcentaje });
    localStorage.setItem(STORAGE.materiasUsuario, JSON.stringify(usuario));

    inputNota.value = '';
    inputPorcentaje.value = '';
    
    renderCortesMateria(); 
  }

  function eliminarCorte(codigo, index) {
    const usuario = getMateriasUsuario();
    if (!usuario[codigo]) return;

    usuario[codigo].splice(index, 1);
    
    if (usuario[codigo].length === 0) {
      delete usuario[codigo];
    }

    localStorage.setItem(STORAGE.materiasUsuario, JSON.stringify(usuario));
    
    renderCortesMateria();
  }

  // ============================================================
  // 7. SELECTOR DE MATERIA
  // ============================================================
  const selector = document.getElementById('selector-materia');
  const selectorLista = document.getElementById('selector-lista');
  const selectorBuscar = document.getElementById('selector-buscar');
  const btnAgregarMateria = document.getElementById('btn-agregar-materia');

  if (btnAgregarMateria) {
    btnAgregarMateria.addEventListener('click', () => abrirSelector());
  }

  function abrirSelector() {
    if (!selector) return;
    selector.hidden = false;
    selectorBuscar.value = '';
    renderSelector('');
    selectorBuscar.focus();
  }
  function cerrarSelector() { if (selector) selector.hidden = true; }

  selector?.addEventListener('click', (e) => { if (e.target === selector) cerrarSelector(); });
  selectorBuscar?.addEventListener('input', () => {
    renderSelector(selectorBuscar.value.trim().toLowerCase());
  });

  function renderSelector(filtro) {
    if (!selectorLista) return;
    selectorLista.innerHTML = '';
    Object.keys(PENSUM).sort((a, b) => a - b).forEach((sem) => {
      if (!SEMESTRES_ACTIVOS.includes(sem)) return;
      PENSUM[sem].forEach((m) => {
        if (filtro && !m.nombre.toLowerCase().includes(filtro) && !m.codigo.toLowerCase().includes(filtro)) return;
        const item = document.createElement('button');
        item.className = 'selector-materia__item';
        item.type = 'button';
        item.innerHTML = `
          <span>${m.nombre}</span>
          <small style="margin-left:auto;color:var(--color-ink-muted);font-family:var(--font-mono);">Sem ${sem}</small>
        `;
        item.addEventListener('click', () => {
          cerrarSelector();
          const materiaNueva = { ...m, semestre: sem };
          abrirDetalleNotas(materiaNueva);
        });
        selectorLista.appendChild(item);
      });
    });
    
    const nueva = document.createElement('button');
    nueva.className = 'selector-materia__item selector-materia__item--nueva';
    nueva.type = 'button';
    nueva.textContent = '+ Materia personalizada';
    nueva.addEventListener('click', () => {
      cerrarSelector();
      abrirFormularioPersonalizado();
    });
    selectorLista.appendChild(nueva);
  }

  // ============================================================
  // 7b. MATERIA PERSONALIZADA
  // ============================================================
  function abrirFormularioPersonalizado() {
    const form = document.getElementById('form-materia-personalizada');
    if (!form) return;
    form.hidden = false;
    
    document.getElementById('calculadora-lista').hidden = true;
    const btnAgregar = document.getElementById('btn-agregar-materia');
    if (btnAgregar) btnAgregar.parentElement.hidden = true;

    document.getElementById('materia-custom-nombre').value = '';
    document.getElementById('error-custom').hidden = true;
  }

  function guardarMateriaPersonalizada() {
    const inputNombre = document.getElementById('materia-custom-nombre');
    const inputSemestre = document.getElementById('materia-custom-semestre');
    const errorEl = document.getElementById('error-custom');

    if (!inputNombre || !inputSemestre) return;

    const nombre = inputNombre.value.trim();
    const semestre = inputSemestre.value;

    if (!nombre) {
      if(errorEl) {
        errorEl.textContent = 'Por favor, ingresa el nombre de la materia.';
        errorEl.hidden = false;
      }
      return;
    }

    const codigo = 'CUSTOM-' + Date.now();
    const nuevaMateria = {
      codigo: codigo,
      nombre: nombre,
      uc: 0,
      prelacion: ''
    };

    let customMaterias = [];
    try {
      customMaterias = JSON.parse(localStorage.getItem(STORAGE.materiasCustom) || '[]');
    } catch { customMaterias = []; }
    
    customMaterias.push({ materia: nuevaMateria, semestre: semestre });
    localStorage.setItem(STORAGE.materiasCustom, JSON.stringify(customMaterias));

    document.getElementById('form-materia-personalizada').hidden = true;
    
    const btnAgregar = document.getElementById('btn-agregar-materia');
    if (btnAgregar) btnAgregar.parentElement.hidden = false;

    renderCalculadora();
    abrirDetalleNotas({ ...nuevaMateria, semestre: semestre });
  }

  const btnGuardarCustom = document.getElementById('btn-guardar-custom');
  if (btnGuardarCustom) {
    btnGuardarCustom.addEventListener('click', guardarMateriaPersonalizada);
  }

  const btnCancelarCustom = document.getElementById('btn-cancelar-custom');
  if (btnCancelarCustom) {
    btnCancelarCustom.addEventListener('click', () => {
      document.getElementById('form-materia-personalizada').hidden = true;
      document.getElementById('calculadora-lista').hidden = false;
      const btnAgregar = document.getElementById('btn-agregar-materia');
      if (btnAgregar) btnAgregar.parentElement.hidden = false;
      renderCalculadora();
    });
  }

    // ============================================================
  // 8. FLASHCARDS (DINÁMICAS CON LECTURA DIRECTA)
  // ============================================================
  function renderListaFlashcards() {
    const lista = document.getElementById('flashcards-lista');
    if (!lista) return;
    lista.hidden = false;
    lista.innerHTML = '';

    // Ocultar paneles
        const contenedor = document.getElementById('flash-panel-contenedor');
    if (contenedor) {
      contenedor.hidden = true; // Ocultar paneles al mostrar la lista
      contenedor.innerHTML = '';
    }

    const grid = document.createElement('div');
    grid.className = 'card-grid';

    Object.keys(PENSUM).sort((a, b) => a - b).forEach((sem) => {
      if (!SEMESTRES_ACTIVOS.includes(sem)) return;
      
      PENSUM[sem].forEach((m) => {
        if (!m.flashId) return;

        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.innerHTML = `
          <span class="card__icono" aria-hidden="true">🃏</span>
          <div class="card__texto">
            <strong>${m.nombre}</strong>
            <small>${m.codigo} · Semestre ${sem}</small>
          </div>
        `;
        const abrir = () => abrirFlashcards(m);
        card.addEventListener('click', abrir);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
        });
        grid.appendChild(card);
      });
    });

    lista.appendChild(grid);
  }

      function abrirFlashcards(materia) {
    const lista = document.getElementById('flashcards-lista');
    const contenedor = document.getElementById('flash-panel-contenedor');
    if (!lista || !contenedor) return;

    // Ocultar lista y MOSTRAR contenedor explícitamente
    lista.hidden = true;
    contenedor.hidden = false; // <-- LA CLAVE: Quitar el hidden del contenedor
    contenedor.innerHTML = ''; 

    const idScript = TRADUCTOR_FLASH_IDS[materia.flashId] || materia.flashId;
    
    const panel = document.createElement('div');
    panel.id = 'flash-panel-' + materia.flashId;
    panel.className = 'herramienta-panel';
    // NO usar panel.hidden = true aquí
    
    panel.innerHTML = `
      <button class="boton-secundario volver-flash" type="button" style="margin-bottom: 12px; width: 100%;">← Volver a materias</button>
      <div class="tool-card">
        <h2 class="tool-card__titulo">${materia.nombre}</h2>
        <p class="flashcard__progreso" id="flashcard-${idScript}-progreso">1 / 1</p>
        <button class="flashcard" id="flashcard-${idScript}" type="button">
          <span class="flashcard__etiqueta" id="flashcard-${idScript}-etiqueta">Pregunta</span>
          <span class="flashcard__texto" id="flashcard-${idScript}-texto">Cargando…</span>
          <span class="flashcard__pista" id="flashcard-${idScript}-pista">Toca para revelar</span>
        </button>
        <div class="flashcard__controles">
          <button class="boton-secundario" id="btn-flashcard-${idScript}-anterior" type="button">← Anterior</button>
          <button class="boton-secundario" id="btn-flashcard-${idScript}-siguiente" type="button">Siguiente →</button>
        </div>
      </div>
    `;
    contenedor.appendChild(panel);

    // Botón de volver: Ocultar contenedor y mostrar lista
    panel.querySelector('.volver-flash').addEventListener('click', () => {
      contenedor.hidden = true;
      lista.hidden = false;
    });

    const datos = window.FABSI_FLASHCARDS && window.FABSI_FLASHCARDS[materia.flashId];
    
    if (datos && datos.length > 0) {
      let indice = 0;
      let mostrandoRespuesta = false;

      const elTarjeta = document.getElementById('flashcard-' + idScript);
      const elEtiqueta = document.getElementById('flashcard-' + idScript + '-etiqueta');
      const elTexto = document.getElementById('flashcard-' + idScript + '-texto');
      const elPista = document.getElementById('flashcard-' + idScript + '-pista');
      const elProgreso = document.getElementById('flashcard-' + idScript + '-progreso');
      const btnAnterior = document.getElementById('btn-flashcard-' + idScript + '-anterior');
      const btnSiguiente = document.getElementById('btn-flashcard-' + idScript + '-siguiente');

      function renderFicha() {
        const ficha = datos[indice];
        elProgreso.textContent = `Ficha ${indice + 1} de ${datos.length}`;

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

      elTarjeta.addEventListener('click', () => {
        mostrandoRespuesta = !mostrandoRespuesta;
        renderFicha();
      });

      btnAnterior.addEventListener('click', () => {
        indice = (indice - 1 + datos.length) % datos.length;
        mostrandoRespuesta = false;
        renderFicha();
      });

      btnSiguiente.addEventListener('click', () => {
        indice = (indice + 1) % datos.length;
        mostrandoRespuesta = false;
        renderFicha();
      });

      renderFicha();
    } else {
      console.warn("No hay datos de flashcards para:", materia.flashId);
      document.getElementById('flashcard-' + idScript + '-texto').textContent = "No hay flashcards disponibles.";
    }
  }
  // ============================================================
  // 9. HERRAMIENTAS CLÍNICAS
  // ============================================================
  function cerrarHerramienta() {
    document.querySelectorAll('.herramienta-panel[id^="herramienta-"]').forEach((p) => (p.hidden = true));
    const grid = document.querySelector('#vista-herramientas .card-grid');
    if (grid) grid.hidden = false;
  }

  function abrirHerramienta(h) {
    const grid = document.querySelector('#vista-herramientas .card-grid');
    if (grid) grid.hidden = true;
    document.querySelectorAll('.herramienta-panel[id^="herramienta-"]').forEach((p) => (p.hidden = true));
    const panel = document.getElementById('herramienta-' + h);
    if (panel) {
      panel.hidden = false;
      if (!panel.querySelector('.volver-herramienta')) {
        const volver = document.createElement('button');
        volver.className = 'boton-secundario volver-herramienta';
        volver.type = 'button';
        volver.textContent = '← Volver a herramientas';
        volver.style.marginBottom = '12px';
        volver.addEventListener('click', cerrarHerramienta);
        panel.insertBefore(volver, panel.firstChild);
      }
    }
  }

  document.querySelectorAll('[data-herramienta]').forEach((card) => {
    card.addEventListener('click', () => abrirHerramienta(card.dataset.herramienta));
  });

   // ============================================================
  // 10. PWA: SERVICE WORKER + BANNER DE ACTUALIZACIÓN
  // ============================================================
  let swRegistration = null;
  let actualizacionPendiente = false;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((registration) => {
          swRegistration = registration;

          // Comprobar si hay actualizaciones al cargar
          registration.update().catch(() => {});

          // Si ya hay una versión esperando, mostrar banner
          if (registration.waiting) {
            mostrarBanner(registration);
          }

          // Detectar nuevas versiones
          registration.addEventListener('updatefound', () => {
            const nuevoSW = registration.installing;
            if (!nuevoSW) return;

            nuevoSW.addEventListener('statechange', () => {
              if (nuevoSW.state === 'installed' && navigator.serviceWorker.controller) {
                mostrarBanner(registration);
              }
            });
          });
        })
        .catch((err) => {
          console.warn('Service Worker no registrado:', err);
        });

      // Solo recargar si el usuario tocó "Actualizar"
      let recargando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargando) return;
        if (!actualizacionPendiente) return;
        recargando = true;
        window.location.reload();
      });

      // Comprobar actualizaciones al volver a la pestaña
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && swRegistration) {
          swRegistration.update().catch(() => {});
        }
      });
    });
  }

  function mostrarBanner(registration) {
    const banner = document.getElementById('banner-update');
    if (!banner) return;
    if (!banner.hidden) return;
    
    banner.hidden = false;

    const btnActualizar = document.getElementById('btn-actualizar');
    const btnCerrar = document.getElementById('btn-cerrar-banner');

    // Clonar para evitar listeners duplicados
    const btnActualizarNuevo = btnActualizar.cloneNode(true);
    btnActualizar.parentNode.replaceChild(btnActualizarNuevo, btnActualizar);

    const btnCerrarNuevo = btnCerrar.cloneNode(true);
    btnCerrar.parentNode.replaceChild(btnCerrarNuevo, btnCerrar);

    btnActualizarNuevo.addEventListener('click', () => {
      actualizacionPendiente = true;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });

    btnCerrarNuevo.addEventListener('click', () => {
      banner.hidden = true;
    });
  }

    // ============================================================
  // 12. FEEDBACK (FORMSPREE)
  // ============================================================
  const formFeedback = document.getElementById('form-feedback');
  if (formFeedback) {
    formFeedback.addEventListener('submit', function (e) {
      e.preventDefault(); // Evitar que la página se recargue
      
      const btnSubmit = formFeedback.querySelector('button[type="submit"]');
      const errorEl = document.getElementById('feedback-error');
      const exitoEl = document.getElementById('feedback-exito');
      
      btnSubmit.textContent = 'Enviando...';
      btnSubmit.disabled = true;
      if (errorEl) errorEl.hidden = true;
      if (exitoEl) exitoEl.hidden = true;

      const formData = new FormData(formFeedback);

      fetch(formFeedback.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          btnSubmit.textContent = 'Enviar comentario';
          btnSubmit.disabled = false;
          if (exitoEl) {
            exitoEl.hidden = false;
            setTimeout(() => { exitoEl.hidden = true; }, 5000);
          }
          formFeedback.reset();
        } else {
          throw new Error('Error al enviar');
        }
      })
      .catch(error => {
        btnSubmit.textContent = 'Enviar comentario';
        btnSubmit.disabled = false;
        if (errorEl) {
          errorEl.textContent = 'Hubo un problema al enviar. Revisa tu conexión a internet.';
          errorEl.hidden = false;
        }
      });
    });
  }

    // ============================================================
  // 13. BOTÓN DE INSTALACIÓN (PWA)
  // ============================================================
  let deferredPrompt; // Guarda el evento de instalación de Android/PC
  const btnInstalar = document.getElementById('btn-instalar-app');
  const instruccionesIOS = document.getElementById('instrucciones-ios');
  const cardInstalar = document.getElementById('card-instalar-app');

  // Detectar si ya está instalada
  function estaInstalada() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // Si ya está instalada, ocultar la tarjeta de instalación
  if (estaInstalada() && cardInstalar) {
    cardInstalar.hidden = true;
  }

  // Detectar si es iPhone/iPad
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Escuchar el evento 'beforeinstallprompt' (Android / PC)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  if (btnInstalar) {
    btnInstalar.addEventListener('click', async () => {
      // Si es iPhone, mostrar las instrucciones
      if (esIOS) {
        if (instruccionesIOS) instruccionesIOS.hidden = false;
        btnInstalar.textContent = 'Ver instrucciones arriba 👆';
        setTimeout(() => {
          if (instruccionesIOS) instruccionesIOS.hidden = true;
          btnInstalar.textContent = '📲 Instalar App';
        }, 8000); // Ocultar instrucciones a los 8 segundos
        return;
      }

      // Si es Android o PC, usar el instalador nativo
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('Usuario instaló la app');
          if (cardInstalar) cardInstalar.hidden = true;
        }
        deferredPrompt = null;
      } else {
        // Si el navegador no soporta la instalación automática
        alert('Para instalar: abre el menú del navegador (tres puntos) y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".');
      }
    });
  }

  // ============================================================
  // 11. INICIALIZACIÓN
  // ============================================================
  mostrarVista('inicio');

})();
