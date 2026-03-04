/**
 * Aplicación principal - Cuestionario NIS
 * Orquesta la carga de benchmarks, renderizado de formulario, cálculo de scores
 */

let scorer;
let formRenderer;

/**
 * Inicializa la aplicación
 */
async function initApp() {
  try {
    // Cargar benchmarks, preguntas y países en paralelo
    const [benchmarksRes, questionsRes, countriesRes] = await Promise.all([
      fetch('./data/benchmarks.json'),
      fetch('./data/questions.json'),
      fetch('./data/countries.json')
    ]);
    if (!benchmarksRes.ok) {
      throw new Error(`Error cargando benchmarks: ${benchmarksRes.statusText}`);
    }
    if (!questionsRes.ok) {
      throw new Error(`Error cargando preguntas: ${questionsRes.statusText}`);
    }
    if (!countriesRes.ok) {
      throw new Error(`Error cargando países: ${countriesRes.statusText}`);
    }
    const benchmarks = await benchmarksRes.json();
    const questions = await questionsRes.json();
    const countries = await countriesRes.json();

    // Inicializar scorer y renderer
    scorer = new NISScorer(benchmarks);
    formRenderer = new NISFormRenderer(benchmarks, questions, countries);

    // Renderizar formulario
    formRenderer.render('form-container', updateScores);

    // Delegación: cualquier cambio en el formulario (incl. bloques de año añadidos después) actualiza condicionales y scores
    const formContainer = document.getElementById('form-container');
    formContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('field-input') || e.target.closest('.form-field')) {
        const values = formRenderer.getFormValues();
        formRenderer.updateConditionalFields(values);
        updateScores();
      }
    });
    formContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('field-input') || e.target.closest('.form-field')) {
        updateScores();
      }
    });

    // Listener para benchmarks
    setupBenchmarkListeners(benchmarks);

    // Calcular scores iniciales
    updateScores();

    console.log('Aplicación inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando aplicación:', error);
    document.getElementById('form-container').innerHTML = `
      <div class="error-message">
        Error al cargar la aplicación: ${error.message}
      </div>
    `;
  }
}

/**
 * Actualiza los scores y semáforos en tiempo real
 */
function updateScores() {
  const values = formRenderer.getFormValues();

  // Calcular scores
  const scores = scorer.getAllScores(values);

  // Actualizar interface
  updateSectionScores(scores);
  updateTotalScore(scores.total);
  updateResumenPanel(scores);
}

/**
 * Actualiza los scores por sección en el formulario
 */
function updateSectionScores(scores) {
  Object.keys(scores).forEach(seccion => {
    if (seccion === 'total') return;

    const score = scores[seccion];

    // Score value - mostrar "-" si no hay datos, "N%" si hay datos
    const scoreElement = document.querySelector(`[data-score-${seccion}]`);
    const percentElement = document.querySelector(`[data-percent-${seccion}]`);
    if (scoreElement) {
      scoreElement.textContent = score.hasData ? score.porcentaje : '-';
      scoreElement.parentElement.classList.toggle('no-data', !score.hasData);
    }
    if (percentElement) {
      percentElement.style.display = score.hasData ? 'inline' : 'none';
    }

    // Semaforo
    const semaforoElement = document.querySelector(`[data-semaforo-${seccion}]`);
    if (semaforoElement) {
      semaforoElement.textContent = '●';
      semaforoElement.style.color = score.color;
      semaforoElement.title = score.label;
    }

    // Resaltar los campos de la sección con el color del semáforo
    highlightSectionFields(seccion, score);
  });
}

/**
 * Resalta los campos de una sección con el color del semáforo correspondiente
 * Solo resalta campos que TIENEN BENCHMARK (tienen meta OCDE)
 */
function highlightSectionFields(seccion, score) {
  const sectionDiv = document.querySelector(`[data-seccion="${seccion}"]`);
  if (!sectionDiv) return;

  const fields = sectionDiv.querySelectorAll('.form-field');
  const values = formRenderer.getFormValues();

  fields.forEach(field => {
    const fieldId = field.getAttribute('data-field-id');
    const hasValue = values[fieldId] !== null && values[fieldId] !== '';

    // Verificar si este campo TIENE BENCHMARK (es indicador con meta OCDE)
    const hasBenchmark = scorer.benchmarks.benchmarks.some(
      b => b.id === fieldId && b.seccion === seccion
    );

    // Solo resaltar si tiene valor Y tiene benchmark
    if (hasValue && hasBenchmark) {
      field.classList.add(`highlight-${getSemaforoClass(score.color)}`);
    } else {
      field.classList.remove('highlight-green', 'highlight-yellow', 'highlight-red', 'highlight-gray');
    }
  });
}

/**
 * Convierte un color hex a clase de semáforo
 */
function getSemaforoClass(color) {
  switch (color) {
    case '#27AE60': return 'green';
    case '#F39C12': return 'yellow';
    case '#E74C3C': return 'red';
    default: return 'gray';
  }
}

/**
 * Actualiza el score total
 */
function updateTotalScore(totalScore) {
  const totalScoreDiv = document.querySelector('.total-score');
  if (totalScoreDiv) {
    totalScoreDiv.style.background = `linear-gradient(135deg, ${totalScore.color}dd 0%, ${totalScore.color} 100%)`;
    const valueElement = totalScoreDiv.querySelector('.total-score-value');
    const percentElement = totalScoreDiv.querySelector('.total-score-percent');
    valueElement.textContent = totalScore.hasData ? totalScore.porcentaje : '-';
    valueElement.classList.toggle('no-data', !totalScore.hasData);
    if (percentElement) {
      percentElement.style.display = totalScore.hasData ? 'inline' : 'none';
    }
    totalScoreDiv.querySelector('.total-score-label').textContent = totalScore.label;
  }
}

/**
 * Actualiza el panel de resumen con los scores por sección
 */
function updateResumenPanel(scores) {
  const resumenContainer = document.getElementById('resumen-scores');
  if (!resumenContainer) return;

  resumenContainer.innerHTML = '';

  Object.keys(scores).forEach(seccion => {
    if (seccion === 'total') return;

    const score = scores[seccion];
    const sectionData = scorer.benchmarks.secciones[seccion];

    const itemDiv = document.createElement('div');
    itemDiv.className = 'resumen-item';

    const displayValue = score.hasData ? score.porcentaje : '-';

    // Si hay datos y el score está en rojo, hacer clickable
    const isAttentionLevel = score.hasData && score.porcentaje < 40;
    const clickableClass = isAttentionLevel ? 'clickable' : '';
    const cursorStyle = isAttentionLevel ? 'cursor: pointer;' : '';

    itemDiv.innerHTML = `
      <span class="resumen-label">${sectionData.nombre}</span>
      <span class="resumen-value ${!score.hasData ? 'no-data' : ''}" style="${cursorStyle}">
        ${displayValue}<span class="resumen-percent" style="${score.hasData ? '' : 'display: none;'}">%</span>
        <span class="resumen-semaforo" style="color: ${score.color};">●</span>
      </span>
    `;

    // Agregar listener si está en nivel de atención
    if (isAttentionLevel) {
      itemDiv.classList.add('clickable');
      itemDiv.addEventListener('click', () => {
        openAttentionModal(seccion);
      });
    }

    resumenContainer.appendChild(itemDiv);
  });
}

/**
 * Configura los listeners para mostrar tooltips de benchmarks
 */
function setupBenchmarkListeners(benchmarks) {
  const benchmarkIndicators = document.querySelectorAll('.benchmark-indicator');

  benchmarkIndicators.forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const benchmarkId = indicator.getAttribute('data-benchmark-id');
      const benchmark = benchmarks.benchmarks.find(b => b.id === benchmarkId);

      if (!benchmark) return;

      // Remover tooltip anterior si existe
      document.querySelectorAll('.benchmark-tooltip').forEach(t => t.remove());

      // Crear tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'benchmark-tooltip';
      tooltip.innerHTML = `
        <div class="benchmark-tooltip-title">${benchmark.indicador}</div>
        <div class="benchmark-tooltip-meta">
          <strong>Meta OCDE:</strong> ${benchmark.meta} ${benchmark.unidad}
        </div>
        <div class="benchmark-tooltip-meta">
          ${benchmark.descripcion}
        </div>
        <div class="benchmark-tooltip-source">
          ${benchmark.fuente_apa}
        </div>
      `;

      // Posicionar tooltip
      indicator.parentElement.style.position = 'relative';
      indicator.parentElement.appendChild(tooltip);

      // Cerrar al hacer click fuera
      const closeTooltip = (e) => {
        if (e.target !== indicator && !tooltip.contains(e.target)) {
          tooltip.remove();
          document.removeEventListener('click', closeTooltip);
        }
      };

      setTimeout(() => {
        document.addEventListener('click', closeTooltip);
      }, 0);
    });

    // También mostrar con hover
    indicator.addEventListener('mouseenter', () => {
      const benchmarkId = indicator.getAttribute('data-benchmark-id');
      const benchmark = benchmarks.benchmarks.find(b => b.id === benchmarkId);

      if (!benchmark) return;

      const tooltip = document.createElement('div');
      tooltip.className = 'benchmark-tooltip';
      tooltip.innerHTML = `
        <div class="benchmark-tooltip-title">${benchmark.indicador}</div>
        <div class="benchmark-tooltip-meta">
          <strong>Meta:</strong> ${benchmark.meta} ${benchmark.unidad}
        </div>
        <div class="benchmark-tooltip-source">
          ${benchmark.fuente_apa}
        </div>
      `;

      indicator.parentElement.style.position = 'relative';
      indicator.parentElement.appendChild(tooltip);

      indicator.addEventListener('mouseleave', () => {
        tooltip.remove();
      });
    });
  });
}

/**
 * Construye el payload con estructura plana: indicadores como claves top-level con años como sub-claves
 */
function buildPayload(values, scores) {
  const { dataYears, annualData, ...rest } = values;

  // Collect all multi-year field IDs to exclude them from company fields
  const MULTI_YEAR_SECTIONS = ['ambiental', 'social', 'gobernanza'];
  const multiYearIds = new Set();
  MULTI_YEAR_SECTIONS.forEach(sec => {
    Object.values(annualData[sec] || {}).forEach(yearObj =>
      Object.keys(yearObj).forEach(id => multiYearIds.add(id))
    );
  });

  // Company-only fields (single values, not repeated per year)
  const companyFields = {};
  Object.keys(rest).forEach(k => {
    if (!multiYearIds.has(k)) companyFields[k] = rest[k];
  });

  // Pivot: indicator → { year: value }
  const indicators = {};
  MULTI_YEAR_SECTIONS.forEach(sec => {
    Object.entries(annualData[sec] || {}).forEach(([year, fields]) => {
      Object.entries(fields).forEach(([fieldId, value]) => {
        if (!indicators[fieldId]) indicators[fieldId] = {};
        indicators[fieldId][year] = value;
      });
    });
  });

  const payload = {
    timestamp: new Date().toISOString(),
    data_years: dataYears,
    ...companyFields,
    ...indicators,
    score_ambiental:  scores.ambiental?.porcentaje  ?? null,
    score_social:     scores.social?.porcentaje     ?? null,
    score_gobernanza: scores.gobernanza?.porcentaje ?? null,
    score_total:      scores.total?.porcentaje      ?? null
  };

  // Remove null and empty string values
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== null && v !== '')
  );
}

/**
 * Muestra error de consentimiento de privacidad
 */
function showPrivacyConsentError() {
  const existingError = document.getElementById('privacy-consent-error');
  if (existingError) existingError.remove();

  const modal = document.createElement('div');
  modal.id = 'privacy-consent-error';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  const title = document.createElement('h2');
  title.textContent = 'Consentimiento de privacidad requerido';
  title.style.cssText = 'color: #D32F2F; margin-bottom: 16px; font-size: 18px;';

  const message = document.createElement('p');
  message.textContent = 'Debe aceptar la política de privacidad para continuar con el envío del formulario.';
  message.style.cssText = 'color: #666; margin-bottom: 24px;';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Entendido';
  closeButton.style.cssText = `
    width: 100%;
    padding: 12px;
    background: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
  `;
  closeButton.onclick = () => {
    modal.remove();
    // Scroll to consent checkbox
    const consent = document.getElementById('privacy-consent');
    if (consent) consent.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

/**
 * Muestra errores de validación al usuario
 */
function showValidationErrors(errors) {
  // Create a modal-like overlay for validation errors
  const existingError = document.getElementById('validation-error-modal');
  if (existingError) existingError.remove();

  const modal = document.createElement('div');
  modal.id = 'validation-error-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  const title = document.createElement('h2');
  title.textContent = 'Formulario incompleto';
  title.style.cssText = 'color: #D32F2F; margin-bottom: 16px; font-size: 18px;';

  const message = document.createElement('p');
  message.textContent = 'Por favor, complete los siguientes campos requeridos:';
  message.style.cssText = 'color: #666; margin-bottom: 16px;';

  const errorList = document.createElement('ul');
  errorList.style.cssText = `
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
  `;

  errors.forEach(error => {
    const li = document.createElement('li');
    li.style.cssText = `
      padding: 8px 12px;
      margin-bottom: 8px;
      background: #FFEBEE;
      border-left: 4px solid #D32F2F;
      color: #C62828;
      font-size: 14px;
    `;
    li.textContent = error.error;
    errorList.appendChild(li);
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Entendido';
  closeButton.style.cssText = `
    width: 100%;
    padding: 12px;
    background: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
  `;
  closeButton.onclick = () => modal.remove();

  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(errorList);
  content.appendChild(closeButton);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Scroll to first error field if possible
  if (errors.length > 0) {
    const firstError = errors[0];
    const fieldEl = document.querySelector(`[name="${firstError.fieldId}"]`);
    if (fieldEl) {
      fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/**
 * Envía los datos del formulario a OpenFormStack.
 * Nota: si el navegador muestra un error de CORS, el POST puede haberse enviado igual;
 * la respuesta es la que se bloquea. Mostramos un mensaje claro en ese caso.
 */
async function submitToOpenFormStack() {
  try {
    // Validar consentimiento de privacidad
    const privacyConsent = document.getElementById('privacy-consent');
    if (!privacyConsent || !privacyConsent.checked) {
      showPrivacyConsentError();
      return;
    }

    // Validar que todos los campos requeridos estén completos
    const validation = formRenderer.validateForm();
    if (!validation.valid) {
      showValidationErrors(validation.errors);
      return;
    }

    const values = formRenderer.getFormValues();
    const scores = scorer.getAllScores(values);

    const data = buildPayload(values, scores);

    showSubmissionModal('enviando');

    const endpoint = 'https://openformstack.com/f/cmm3yej4l00004nan9zcn7laj';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error en servidor: ${response.statusText}`);
    }

    const result = await response.json();

    showSubmissionModal('exito', result.id || 'confirmado');
  } catch (error) {
    console.error('Error enviando formulario:', error);

    const isLikelyCors = error.name === 'TypeError' && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      (error.message && error.message.toLowerCase().includes('cors'))
    );

    if (isLikelyCors) {
      const thankYouUrl = 'https://openformstack.com/thank-you';
      window.open(thankYouUrl, '_blank', 'noopener,noreferrer');
      showSubmissionModal('exito_cors', thankYouUrl);
    } else {
      showSubmissionModal('error', error.message || 'Error al enviar');
    }
  }
}

/**
 * Exporta los datos del formulario como JSON
 */
function exportAsJSON() {
  const values = formRenderer.getFormValues();
  const scores = scorer.getAllScores(values);

  const data = buildPayload(values, scores);

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `cuestionario-nis-${new Date().getTime()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Imprime el formulario
 */
function printForm() {
  window.print();
}

/**
 * Limpia el formulario
 */
function resetForm() {
  if (confirm('¿Deseas limpiar todos los campos del formulario?')) {
    document.querySelectorAll('.field-input').forEach(input => {
      if (input.type === 'radio') {
        input.checked = false;
      } else if (input.type !== 'hidden') {
        input.value = '';
      }
    });
    document.querySelectorAll('.energy-bimestral-json').forEach(input => {
      input.value = '[]';
    });
    document.querySelectorAll('.bimestral-row').forEach(row => row.remove());

    updateScores();
    formRenderer.updateConditionalFields(formRenderer.getFormValues());
  }
}

/**
 * Abre el modal de indicadores que requieren atención
 */
function openAttentionModal(seccion) {
  const values = formRenderer.getFormValues();

  // Obtener indicadores de la sección que requieren atención
  const attentionIndicators = getIndicatorsNeedingAttention(seccion, values);

  if (attentionIndicators.length === 0) {
    alert('No hay indicadores que requieran atención en esta sección.');
    return;
  }

  // Crear modal HTML
  const modal = createAttentionModal(seccion, attentionIndicators);
  document.body.appendChild(modal);

  // Agregar listener para cerrar modal
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      modal.remove();
    }
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.parentElement) {
      modal.remove();
    }
  });
}

/**
 * Obtiene los indicadores de una sección que requieren atención (<40%)
 * IMPORTANTE: Solo considera indicadores que TIENEN BENCHMARK
 */
function getIndicatorsNeedingAttention(seccion, values) {
  const sectionResult = scorer.calculateSectionScore(seccion, values);

  // Si la sección está en verde o sin datos, no hay indicadores que requieran atención
  if (!sectionResult.hasData || sectionResult.porcentaje >= 70) {
    return [];
  }

  // Obtener SOLO benchmarks de la sección (campos con meta OCDE)
  const sectionBenchmarks = scorer.benchmarks.benchmarks.filter(
    b => b.seccion === seccion && b.id !== null
  );

  // Calcular score individual para cada indicador con benchmark
  const indicators = sectionBenchmarks.map(benchmark => {
    const value = values[benchmark.id];

    // Solo procesar si tiene valor
    if (value === null || value === '') {
      return null;
    }

    const normalized = scorer.normalizeValue(benchmark.id, value);
    const porcentaje = Math.round(normalized * 100);

    return {
      id: benchmark.id,
      indicador: benchmark.indicador,
      meta: benchmark.meta,
      unidad: benchmark.unidad,
      valor: value,
      porcentaje: porcentaje,
      benchmark: benchmark
    };
  }).filter(ind => ind !== null); // Filtrar nulos

  // Filtrar solo los que están en rojo (<40%) o amarillo (40-69%)
  return indicators.filter(ind => ind.porcentaje < 70);
}

/**
 * Crea el HTML del modal de indicadores que requieren atención
 */
function createAttentionModal(seccion, indicators) {
  const sectionData = scorer.benchmarks.secciones[seccion];

  // Agrupar por indicadores que requieren atención (rojo) vs en progreso (amarillo)
  const atencion = indicators.filter(ind => ind.porcentaje < 40);
  const progreso = indicators.filter(ind => ind.porcentaje >= 40 && ind.porcentaje < 70);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-content';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h2>Indicadores de ${sectionData.nombre}</h2>
    <button class="modal-close" aria-label="Cerrar">[X]</button>
  `;

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';

  // Sección de indicadores que requieren atención (rojo)
  if (atencion.length > 0) {
    const atencionSection = document.createElement('div');
    atencionSection.className = 'modal-section';
    atencionSection.innerHTML = `
      <h3 class="modal-section-title" style="color: var(--color-red);">
        Requiere Atención (< 40%)
      </h3>
    `;

    atencion.forEach(ind => {
      const row = createIndicatorRow(ind);
      atencionSection.appendChild(row);
    });

    body.appendChild(atencionSection);
  }

  // Sección de indicadores en progreso (amarillo)
  if (progreso.length > 0) {
    const progressSection = document.createElement('div');
    progressSection.className = 'modal-section';
    progressSection.innerHTML = `
      <h3 class="modal-section-title" style="color: var(--color-yellow);">
        En Progreso (40-69%)
      </h3>
    `;

    progreso.forEach(ind => {
      const row = createIndicatorRow(ind);
      progressSection.appendChild(row);
    });

    body.appendChild(progressSection);
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  footer.innerHTML = `
    <p style="color: var(--color-gray-dark); font-size: 12px; margin: 0;">
      Haz clic en cualquier indicador para ver más detalles
    </p>
  `;

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  return overlay;
}

/**
 * Crea una fila de indicador para el modal
 */
function createIndicatorRow(indicator) {
  const row = document.createElement('div');
  row.className = 'modal-indicator';

  const color = indicator.porcentaje < 40 ? 'var(--color-red)' : 'var(--color-yellow)';
  const benchmark = indicator.benchmark;

  let valueDisplay = '';
  if (indicator.valor === null || indicator.valor === '') {
    valueDisplay = '(Sin responder)';
  } else if (typeof indicator.valor === 'boolean' || indicator.valor === 'Sí' || indicator.valor === 'No') {
    valueDisplay = indicator.valor === true || indicator.valor === 'Sí' ? 'Sí' : 'No';
  } else {
    valueDisplay = `${indicator.valor} ${indicator.unidad}`;
  }

  const metaDisplay = `${indicator.meta} ${indicator.unidad}`;

  row.innerHTML = `
    <div class="indicator-header">
      <span class="indicator-name">${indicator.indicador}</span>
      <span class="indicator-score" style="color: ${color};">
        ${indicator.porcentaje}%
      </span>
    </div>
    <div class="indicator-comparison">
      <div class="indicator-value">
        <small>Tu respuesta:</small>
        <strong>${valueDisplay}</strong>
      </div>
      <div class="indicator-benchmark">
        <small>Meta:</small>
        <strong>${metaDisplay}</strong>
      </div>
    </div>
    <div class="indicator-source" title="${benchmark.fuente_apa}">
      <small style="color: var(--color-gray-dark); display: block; margin-top: 8px; font-style: italic;">
        📚 ${benchmark.fuente_apa.substring(0, 60)}...
      </small>
    </div>
  `;

  // Agregar click para mostrar más detalles
  row.addEventListener('click', () => {
    showBenchmarkDetail(indicator.benchmark);
  });

  return row;
}

/**
 * Muestra los detalles completos del benchmark
 */
function showBenchmarkDetail(benchmark) {
  const detailOverlay = document.createElement('div');
  detailOverlay.className = 'modal-overlay';

  const detailModal = document.createElement('div');
  detailModal.className = 'modal-content modal-detail';

  detailModal.innerHTML = `
    <div class="modal-header">
      <h2>${benchmark.indicador}</h2>
      <button class="modal-close" aria-label="Cerrar">[X]</button>
    </div>
    <div class="modal-body">
      <div class="detail-section">
        <h4>Meta</h4>
        <p><strong>${benchmark.meta} ${benchmark.unidad}</strong></p>
      </div>
      <div class="detail-section">
        <h4>Descripción</h4>
        <p>${benchmark.descripcion}</p>
      </div>
      <div class="detail-section">
        <h4>Fuente (APA 7)</h4>
        <p style="font-family: monospace; font-size: 12px; white-space: pre-wrap; background: var(--color-gray-light); padding: 12px; border-radius: 4px;">
          ${benchmark.fuente_apa}
        </p>
      </div>
    </div>
  `;

  detailModal.querySelector('.modal-close').addEventListener('click', () => {
    detailOverlay.remove();
  });

  detailOverlay.appendChild(detailModal);
  document.body.appendChild(detailOverlay);

  detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) {
      detailOverlay.remove();
    }
  });
}

/**
 * Muestra modal de estado de envío del formulario
 */
function showSubmissionModal(status, data = '') {
  // Remover modal anterior si existe
  const existingModal = document.querySelector('.submission-modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.className = 'submission-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'submission-modal';

  let content = '';
  if (status === 'enviando') {
    content = `
      <div class="submission-loading">
        <div class="spinner"></div>
        <h3>Enviando formulario...</h3>
        <p>Por favor espera mientras tus datos se envían a OpenFormStack</p>
      </div>
    `;
  } else if (status === 'exito') {
    content = `
      <div class="submission-success">
        <div class="success-icon">[OK]</div>
        <h3>¡Envío exitoso!</h3>
        <p>Tu formulario se ha guardado correctamente.</p>
        <p class="submission-id"><strong>ID de envío:</strong> ${data}</p>
        <button onclick="closeSubmissionModal()" class="btn-close">Cerrar</button>
      </div>
    `;
  } else if (status === 'exito_cors') {
    const thankYouUrl = data || 'https://openformstack.com/thank-you';
    content = `
      <div class="submission-success">
        <div class="success-icon">[OK]</div>
        <h3>Enviado</h3>
        <p>Se abrió la página de confirmación en otra pestaña.</p>
        <p style="margin-top: 0.75em; font-size: 0.9em;"><a href="${thankYouUrl}" target="_blank" rel="noopener noreferrer" class="submission-thankyou-link">Abrir si no se abrió</a></p>
        <button onclick="closeSubmissionModal()" class="btn-close">Cerrar</button>
      </div>
    `;
  } else if (status === 'error') {
    const msg = typeof data === 'object' && data !== null && data.message ? data.message : String(data);
    content = `
      <div class="submission-error">
        <div class="error-icon">[X]</div>
        <h3>Error al enviar</h3>
        <p>${msg}</p>
        <button onclick="closeSubmissionModal()" class="btn-close">Cerrar</button>
      </div>
    `;
  }

  modal.innerHTML = content;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Cierra el modal de envío
 */
function closeSubmissionModal() {
  const overlay = document.querySelector('.submission-modal-overlay');
  if (overlay) overlay.remove();
}

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', initApp);
