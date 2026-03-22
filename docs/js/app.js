/**
 * Aplicación principal - Cuestionario NIS
 * Orquesta la carga de benchmarks, renderizado de formulario, cálculo de scores
 */

let scorer;
let formRenderer;
let scoresRevealed = false;  // Scores hidden until confirmed submit (DEC-03)

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
  if (!scoresRevealed) return;  // Do not display scores before confirmed submit (DEC-03)

  Object.keys(scores).forEach(seccion => {
    if (seccion === 'total') return;

    const score = scores[seccion];

    // Make section score visible
    const scoreContainer = document.querySelector(`[data-score-${seccion}]`)?.parentElement;
    if (scoreContainer) {
      scoreContainer.classList.add('revealed');
    }

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
  });
}

/**
 * Actualiza el score total
 */
function updateTotalScore(totalScore) {
  if (!scoresRevealed) return;  // Do not display scores before confirmed submit (DEC-03)

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
  if (!scoresRevealed) return;  // Do not display scores before confirmed submit (DEC-03)

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
 * Revela los scores después de confirmación de envío exitoso (DEC-03)
 * Llamado desde ambas ramas de éxito: exito_cors y exito
 */
function revealScoresAfterSubmit() {
  scoresRevealed = true;
  const totalScoreEl = document.querySelector('.total-score');
  if (totalScoreEl) totalScoreEl.removeAttribute('hidden');
  updateScores();      // Ahora sin protección — pinta sidebar + footers
  showScoreModal();    // Modal con desglose completo
}

/**
 * Muestra modal con desglose completo de scores post-envío (DEC-03)
 * Modal centrado con score total + desglose por sección (Ambiental, Social, Gobernanza)
 */
function showScoreModal() {
  const values = formRenderer.getFormValues();
  const scores = scorer.getAllScores(values);

  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.style.maxWidth = '500px';

  // Header con título
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h2 style="margin: 0; color: var(--color-dark);">Resultados de Evaluación</h2>
    <button class="modal-close" style="font-size: 24px; cursor: pointer; background: none; border: none;">×</button>
  `;

  // Body con desglose
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.padding = 'var(--spacing-lg)';

  // Score total
  const totalScore = scores.total;
  const totalDiv = document.createElement('div');
  totalDiv.style.textAlign = 'center';
  totalDiv.style.marginBottom = 'var(--spacing-lg)';
  totalDiv.style.paddingBottom = 'var(--spacing-lg)';
  totalDiv.style.borderBottom = '1px solid var(--color-gray-light)';
  totalDiv.innerHTML = `
    <div style="font-size: 48px; font-weight: bold; color: ${totalScore.color}; margin-bottom: 8px;">
      ${totalScore.porcentaje}%
    </div>
    <div style="font-size: 18px; font-weight: 600; color: var(--color-dark);">
      ${totalScore.label}
    </div>
    <div style="font-size: 14px; color: var(--color-gray-dark); margin-top: 4px;">
      Score Total NIS
    </div>
  `;
  body.appendChild(totalDiv);

  // Desglose por sección
  const secciones = ['ambiental', 'social', 'gobernanza'];
  secciones.forEach(seccion => {
    const sectionScore = scores[seccion];
    if (!sectionScore) return;

    const sectionDiv = document.createElement('div');
    sectionDiv.style.display = 'flex';
    sectionDiv.style.alignItems = 'center';
    sectionDiv.style.justifyContent = 'space-between';
    sectionDiv.style.marginBottom = 'var(--spacing-md)';
    sectionDiv.style.padding = 'var(--spacing-sm)';
    sectionDiv.style.backgroundColor = 'var(--color-gray-light)';
    sectionDiv.style.borderRadius = '4px';

    const sectionName = scorer.benchmarks.secciones[seccion]?.nombre || seccion;
    const displayValue = sectionScore.hasData ? `${sectionScore.porcentaje}%` : '—';

    sectionDiv.innerHTML = `
      <div style="font-weight: 600; color: var(--color-dark);">${sectionName}</div>
      <div style="font-size: 18px; font-weight: bold; color: ${sectionScore.color};">
        ${displayValue}
      </div>
    `;
    body.appendChild(sectionDiv);
  });

  // Footer con botón cerrar
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  footer.style.marginTop = 'var(--spacing-lg)';
  footer.style.textAlign = 'center';
  footer.innerHTML = `
    <button class="modal-close-btn" style="
      padding: 10px 24px;
      background: var(--color-dark);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    ">Cerrar</button>
  `;

  // Armar modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Remover overlay existente si la hay
  const existingOverlay = document.querySelector('.modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  // Agregar al DOM
  document.body.appendChild(overlay);

  // Wiring: cerrar modal
  const closeButtons = overlay.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.remove();
    });
  });

  // Click en overlay (no en modal) cierra
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
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
 *
 * En producción, lo habitual es que el navegador no pueda leer el cuerpo de la respuesta
 * por CORS: falla response.json() aunque el POST se haya aceptado. El flujo canónico de
 * "envío confirmado" para el usuario es entonces showSubmissionModal('exito_cors', ...).
 * La rama 'exito' tras JSON legible es secundaria (p. ej. mocks en pruebas o futuro proxy).
 * Ver documentation/planning/decisions.md DEC-04.
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
    revealScoresAfterSubmit();  // Show scores post-submit (DEC-03)
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
    revealScoresAfterSubmit();  // Show scores post-submit (DEC-03) — canonical production path
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
