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
    // Cargar benchmarks
    const response = await fetch('./data/benchmarks.json');
    if (!response.ok) {
      throw new Error(`Error cargando benchmarks: ${response.statusText}`);
    }
    const benchmarks = await response.json();

    // Inicializar scorer y renderer
    scorer = new NISScorer(benchmarks);
    formRenderer = new NISFormRenderer(benchmarks);

    // Renderizar formulario
    formRenderer.render('form-container', updateScores);

    // Listener para campos condicionales
    const inputs = document.querySelectorAll('.field-input');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const values = formRenderer.getFormValues();
        formRenderer.updateConditionalFields(values);
      });
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
 * Exporta los datos del formulario como JSON
 */
function exportAsJSON() {
  const values = formRenderer.getFormValues();
  const scores = scorer.getAllScores(values);

  const data = {
    timestamp: new Date().toISOString(),
    formulario: values,
    scores: scores
  };

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
    const inputs = document.querySelectorAll('.field-input');
    inputs.forEach(input => {
      if (input.type === 'radio') {
        input.checked = false;
      } else if (input.type === 'number') {
        input.value = '';
      }
    });

    updateScores();
    formRenderer.updateConditionalFields({});
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
    <button class="modal-close" aria-label="Cerrar">✕</button>
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
      <button class="modal-close" aria-label="Cerrar">✕</button>
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

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', initApp);
