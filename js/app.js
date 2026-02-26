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
 */
function highlightSectionFields(seccion, score) {
  const sectionDiv = document.querySelector(`[data-seccion="${seccion}"]`);
  if (!sectionDiv) return;

  const fields = sectionDiv.querySelectorAll('.form-field');
  fields.forEach(field => {
    const fieldId = field.getAttribute('data-field-id');
    const values = formRenderer.getFormValues();
    const hasValue = values[fieldId] !== null && values[fieldId] !== '';

    // Solo resaltar si el campo tiene valor
    if (hasValue) {
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

    itemDiv.innerHTML = `
      <span class="resumen-label">${sectionData.nombre}</span>
      <span class="resumen-value ${!score.hasData ? 'no-data' : ''}">
        ${displayValue}<span class="resumen-percent" style="${score.hasData ? '' : 'display: none;'}">%</span>
        <span class="resumen-semaforo" style="color: ${score.color};">●</span>
      </span>
    `;

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

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', initApp);
