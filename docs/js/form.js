/**
 * Renderizado y gestión del formulario NIS
 * Secciones: Empresa, Ambiental (con preguntas de aplicabilidad), Social, Gobernanza.
 * Las preguntas que no aplican se ocultan mediante preguntas tipo "¿Aplica X?" (Sí/No).
 * Soporta múltiples años de datos y, para consumo eléctrico, total anual o ingreso bimestral (recibo).
 */

/** Bimestres de facturación (México): 1=Ene-Feb, 2=Mar-Abr, 3=May-Jun, 4=Jul-Ago, 5=Sep-Oct, 6=Nov-Dic */
const BIMESES = [
  { index: 1, label: 'Ene-Feb' }, { index: 2, label: 'Mar-Abr' }, { index: 3, label: 'May-Jun' },
  { index: 4, label: 'Jul-Ago' }, { index: 5, label: 'Sep-Oct' }, { index: 6, label: 'Nov-Dic' }
];

function getBimonthLabel(year, bimonthIndex) {
  const b = BIMESES.find(x => x.index === bimonthIndex);
  return b ? `${b.label} ${year}` : '';
}

/**
 * Calendar (year, bimonth) shown for a stored slot (year, periodIndex) with UI offset.
 * Offset rotates labels via periodIndexToBimonth; the year in the label must follow
 * real calendar time (e.g. first slot Ene-Feb 2026 with offset showing Nov-Dic is Nov-Dic 2025).
 */
function getBimestralDisplayCalendar(year, periodIndex, offset) {
  const o = (offset != null && !isNaN(offset)) ? (((offset % 6) + 6) % 6) : 0;
  const k = (6 - o) % 6;
  const d = new Date(year, (periodIndex - 1) * 2, 1);
  d.setMonth(d.getMonth() - k * 2);
  return {
    year: d.getFullYear(),
    bimonth: monthToBimonth(d.getMonth() + 1)
  };
}

/** Obtiene el bimestre (1-6) a partir del mes (1-12). */
function monthToBimonth(month) {
  return Math.min(6, Math.ceil(month / 2));
}

/** Bimonth (1-6) from period index (1-6) and offset (0-5). Offset shifts which calendar bimonth "slot 1" is. */
function periodIndexToBimonth(periodIndex, offset) {
  const o = (offset != null && !isNaN(offset)) ? (offset % 6) : 0;
  return ((o + (periodIndex != null ? periodIndex : 1) - 1) % 6) + 1;
}

/** Current date minus 2 months → (year, periodIndex) for initial bimestral row. periodIndex 1-6. */
function getInitialBimestralPeriod() {
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  const year = d.getFullYear();
  const periodIndex = monthToBimonth(d.getMonth() + 1);
  return { year, periodIndex };
}

/** Previous (year, periodIndex) before the given one (chronological order). */
function getPreviousPeriodSlot(year, periodIndex) {
  if (year == null || periodIndex == null) return null;
  if (periodIndex > 1) return { year, periodIndex: periodIndex - 1 };
  return { year: year - 1, periodIndex: 6 };
}

/** Period (year, periodIndex) is in the future given current date (for validation). */
function isFuturePeriodSlot(year, periodIndex, offset) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentBimonth = monthToBimonth(now.getMonth() + 1);
  const { year: dispYear, bimonth } = getBimestralDisplayCalendar(year, periodIndex, offset);
  return dispYear > currentYear || (dispYear === currentYear && bimonth > currentBimonth);
}

/** Ordena periodos por año y periodIndex (ascendente). */
function sortBimestralBySlot(periods) {
  return [...periods].sort((a, b) => {
    const y = (a.year != null ? a.year : 0) - (b.year != null ? b.year : 0);
    if (y !== 0) return y;
    return (a.periodIndex != null ? a.periodIndex : 0) - (b.periodIndex != null ? b.periodIndex : 0);
  });
}

/**
 * Task 13: Validates bimestral periods for contiguity (no gaps).
 * - For past years: must be contiguous from first to last bimestre
 * - For current year: allowed to have missing last bimestres (5, 6 may be missing)
 * Returns { valid: boolean, error?: string }
 */
function validateBimestralContiguity(periods) {
  if (!periods || periods.length === 0) {
    return { valid: true }; // Empty is valid
  }

  // Group periods by year
  const byYear = {};
  periods.forEach(p => {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p.periodIndex);
  });

  const currentYear = new Date().getFullYear();

  // Check each year
  for (const [yearStr, indices] of Object.entries(byYear)) {
    const year = parseInt(yearStr, 10);
    const sorted = [...new Set(indices)].sort((a, b) => b - a); // Descending order

    // For each pair of consecutive periods, check for gaps
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];

      if (curr - next !== 1) {
        // Gap found
        return {
          valid: false,
          error: `Bimestres no contiguos en año ${year}: falta bimestre ${next + 1}`
        };
      }
    }

    // For past years, must have bimestre 6 (Nov-Dec)
    if (year < currentYear && !sorted.includes(6)) {
      return {
        valid: false,
        error: `Año ${year} (pasado) debe incluir bimestre 6 (Nov-Dic)`
      };
    }

    // For current year, allow missing last bimestres (5, 6)
    // Already validated contiguity above
  }

  return { valid: true };
}

/**
 * Task 13: Calculates the sum of bimestral kWh values.
 */
function calculateBimestralSum(periods) {
  return periods.reduce((sum, p) => sum + (p.kWh || 0), 0);
}

/** Turn https://... segments in help copy into real links (rest stays plain text). */
function appendHelpTextWithAutoLinks(container, text) {
  if (!text) return;
  const raw = String(text);
  const re = /https:\/\/[^\s<>"']+/gi;
  let lastIndex = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > lastIndex) {
      container.appendChild(document.createTextNode(raw.slice(lastIndex, m.index)));
    }
    const url = m[0];
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'field-help-link';
    container.appendChild(a);
    lastIndex = m.index + url.length;
  }
  if (lastIndex < raw.length) {
    container.appendChild(document.createTextNode(raw.slice(lastIndex)));
  }
}

class NISFormRenderer {
  constructor(benchmarks, questions, countries = []) {
    this.benchmarks = benchmarks;
    this.countries = countries;
    this.formFields = this._buildFormFields(questions);
    this.MULTI_YEAR_SECTIONS = ['ambiental', 'social', 'gobernanza'];

    // Task 12: Initialize with exactly 2 years (previous + current), select previous by default
    const currentYear = new Date().getFullYear();
    this.dataYears = [currentYear - 1, currentYear]; // [previous, current]
    this.selectedYear = currentYear - 1; // Default selection: previous year
    this.yearLocked = false; // Lock after first non-company field is filled
    this.isReadOnly = false; // Read-only state after successful submit
    this.scrollListenerId = null; // Track scroll listener for cleanup
  }

  /**
   * Construye la estructura de campos a partir del JSON de preguntas
   */
  _buildFormFields(questions) {
    const result = {};
    Object.keys(questions.sections).forEach(key => {
      result[key] = questions.sections[key].fields;
    });
    return result;
  }

  /**
   * Actualiza las opciones de región basadas en el país seleccionado
   */
  _updateRegionOptions(countryName, regionSelect, nameSuffix = '') {
    // Limpiar opciones existentes
    regionSelect.innerHTML = '';

    // Agregar opción vacía
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Seleccionar...';
    regionSelect.appendChild(emptyOption);

    if (!countryName) {
      regionSelect.disabled = true;
      regionSelect.removeAttribute('required');
      return;
    }

    // Encontrar el país en los datos
    const country = this.countries.find(c => c.name === countryName);
    if (country && country.states && country.states.length > 0) {
      country.states.forEach(state => {
        const optionElement = document.createElement('option');
        optionElement.value = state.name;
        optionElement.textContent = state.name;
        regionSelect.appendChild(optionElement);
      });
      regionSelect.disabled = false;
      regionSelect.required = true;
    } else {
      regionSelect.disabled = true;
      regionSelect.removeAttribute('required');
    }
  }

  /**
   * Task 12: Create a wrapped onChange callback that tracks non-company field changes
   */
  createChangeCallback(onChangeCallback = () => {}) {
    return (e) => {
      // Only process events from form fields, not buttons or other elements
      if (!e || !e.target || e.target.type === 'button') {
        return;
      }

      // Call original callback
      onChangeCallback(e);

      // Task 12: Check if a non-company field was just filled (triggers year lock)
      const field = e.target;
      const seccion = field.closest('[data-seccion]')?.getAttribute('data-seccion');
      const hasValue = field.value && field.value.trim && field.value.trim().length > 0;

      if (seccion && hasValue && this.isNonCompanySection(seccion) && !this.yearLocked) {
        this.setYearLocked(true);
      }
    };
  }

  /**
   * Renderiza la estructura HTML del formulario en un contenedor
   * @param {string} containerId - ID del div donde renderizar
   * @param {function} onChangeCallback - Callback cuando cambia algún valor
   */
  render(containerId, onChangeCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Contenedor con ID "${containerId}" no encontrado`);
      return;
    }

    // Task 12: Wrap the onChange callback to track non-company field changes
    const wrappedCallback = this.createChangeCallback(onChangeCallback);

    container.innerHTML = '';

    // Renderizar sección de instrucciones
    const instructionsDiv = document.createElement('div');
    instructionsDiv.className = 'nis-instructions';
    instructionsDiv.innerHTML = `
      <div class="instructions-header">
        <h2>CLIMB INSTITUTE: CUESTIONARIO NIS</h2>
        <p class="instructions-subtitle">Sostenibilidad, Equidad y Reputación Corporativa</p>
      </div>

      <div class="instructions-content">

        <div class="instruction-block">
          <h3 class="instruction-title">Instrucciones</h3>
          <p>Llenar todos los campos del cuestionario. Para pasar a la siguiente sección, tienes que responder todos los campos requeridos. Los campos marcados con <span class="required-indicator">*</span> son obligatorios.</p>
          <p>Si desconoces un dato o no es aplicable a tu empresa, puedes dejar en blanco los campos opcionales.</p>
        </div>

        <div class="instruction-block">
          <h3 class="instruction-title">Nota Importante: Valores Financieros en USD</h3>
          <p>Todas las preguntas financieras en esta encuesta están expresadas en dólares estadounidenses (USD) para facilitar la comparación entre países. Si tu empresa opera en otra moneda local, por favor convierte tus valores a USD utilizando el tipo de cambio oficial vigente en tu país el día de hoy.</p>
          <p><strong>Ejemplo:</strong> Si el tipo de cambio de hoy es 18.50 MXN/USD y tu cifra local es de 185,000 MXN, deberás reportar 10,000 USD.</p>
        </div>

        <div class="instruction-block">
          <h3 class="instruction-title">Aviso de Privacidad</h3>
          <p>En cumplimiento de los principios éticos de investigación y de las disposiciones de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, los datos se tratarán de forma confidencial y anónima, utilizándose únicamente con fines de investigación. La información recolectada no será compartida con terceros sin autorización expresa. Se aplican las medidas necesarias para resguardar la seguridad de la base de datos.</p>
        </div>
      </div>

      <div class="instructions-footer">
        <p>Para comenzar, por favor proporciona la información de tu empresa en la primera sección.</p>
      </div>
    `;
    container.appendChild(instructionsDiv);

    // Task 12: Render year selector rail with scroll effect elements
    const yearRailDiv = document.createElement('div');
    yearRailDiv.className = 'year-rail year-rail-vertical';
    yearRailDiv.id = 'year-rail';

    // Create unselected year label (for scroll fade effect)
    const unselectedDiv = document.createElement('div');
    unselectedDiv.className = 'year-label year-label-unselected';
    unselectedDiv.setAttribute('data-year-label', 'unselected');
    unselectedDiv.textContent = String(this.dataYears[1]); // Current year

    // Create selected year label (for scroll position effect)
    const selectedDiv = document.createElement('div');
    selectedDiv.className = 'year-label year-label-selected';
    selectedDiv.setAttribute('data-year-label', 'selected');
    selectedDiv.textContent = String(this.selectedYear);

    // Task 12 Phase 3: Wrap year labels in cylinder stage
    const cylinderWrapperDiv = document.createElement('div');
    cylinderWrapperDiv.className = 'year-cylinder';

    const cylinderStageDiv = document.createElement('div');
    cylinderStageDiv.className = 'year-cylinder-stage';

    cylinderStageDiv.appendChild(unselectedDiv);
    cylinderStageDiv.appendChild(selectedDiv);
    cylinderWrapperDiv.appendChild(cylinderStageDiv);
    yearRailDiv.appendChild(cylinderWrapperDiv);

    // Create selector container (outside the 3D stage)
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'year-selector-container';

    const label = document.createElement('label');
    label.htmlFor = 'year-selector';
    label.className = 'year-selector-label';
    label.textContent = 'Año';

    const selector = document.createElement('select');
    selector.id = 'year-selector';
    selector.className = 'year-selector-control';
    this.dataYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.selected = year === this.selectedYear;
      option.textContent = year;
      selector.appendChild(option);
    });

    selectorContainer.appendChild(label);
    selectorContainer.appendChild(selector);

    yearRailDiv.appendChild(selectorContainer);

    // Task 12: Insert year rail as first child of grid container (left column)
    const gridContainer = container.parentElement;
    gridContainer.insertBefore(yearRailDiv, gridContainer.firstChild);

    // Task 12: Set up year selector event listener
    const yearSelector = document.getElementById('year-selector');
    if (yearSelector) {
      yearSelector.addEventListener('change', (e) => {
        const newYear = parseInt(e.target.value);
        if (!this.setSelectedYear(newYear)) {
          // Revert selection if year change was blocked (locked)
          e.target.value = this.selectedYear;
        } else {
          // Update selected year label for scroll effects
          const selectedLabel = document.querySelector('[data-year-label="selected"]');
          if (selectedLabel) {
            selectedLabel.textContent = newYear;
          }
        }
      });
    }

    // Task 12 Phase 2: Initialize scroll effects
    this.initializeScrollEffects();

    // Renderizar cada sección
    Object.keys(this.formFields).forEach(seccion => {
      const seccionData = this.benchmarks.secciones[seccion];
      const fields = this.formFields[seccion];
      const isMultiYear = this.MULTI_YEAR_SECTIONS.includes(seccion);

      const seccionDiv = document.createElement('div');
      seccionDiv.className = `nis-seccion nis-seccion-${seccion}`;
      seccionDiv.setAttribute('data-seccion', seccion);

      const header = document.createElement('div');
      header.className = 'seccion-header';
      header.innerHTML = `
        <h2 class="seccion-titulo">${seccionData.nombre}</h2>
        <p class="seccion-descripcion">${seccionData.descripcion}</p>
      `;
      seccionDiv.appendChild(header);

      if (isMultiYear) {
        const yearBlocksContainer = document.createElement('div');
        yearBlocksContainer.className = 'year-blocks';
        // Task 13: Only render year block for the selected year (single-year mode)
        yearBlocksContainer.appendChild(this.renderYearBlock(seccion, this.selectedYear, wrappedCallback));
        seccionDiv.appendChild(yearBlocksContainer);
      } else {
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'seccion-fields';
        fields.forEach(field => {
          fieldsContainer.appendChild(this.renderField(field, seccion, wrappedCallback, null));
        });
        seccionDiv.appendChild(fieldsContainer);
      }

      if (seccion !== 'company') {
        const footer = document.createElement('div');
        footer.className = 'seccion-footer';
        footer.innerHTML = `
          <div class="seccion-score">
            <span class="score-label">Score:</span>
            <span class="score-value" data-score-${seccion}>-</span>
            <span class="score-percent" data-percent-${seccion}>%</span>
            <span class="score-semaforo" data-semaforo-${seccion}>●</span>
          </div>
        `;
        seccionDiv.appendChild(footer);
      }

      container.appendChild(seccionDiv);
    });

    // Task 12: Add footer with copyright legend
    const footerDiv = document.createElement('footer');
    footerDiv.className = 'form-footer';
    footerDiv.innerHTML = `
      <p class="footer-copyright">Todos los derechos reservados. Prohibida la reproducción total o parcial de este sitio.</p>
    `;
    container.appendChild(footerDiv);
  }

  /**
   * Renderiza el campo de consumo de energía con opción total anual o bimestral (recibo).
   */
  renderEnergyField(field, seccion, year, fieldName, onChangeCallback) {
    const fieldId = fieldName;
    const container = document.createElement('div');
    container.className = 'form-field form-field-energy';
    container.setAttribute('data-field-id', 'energia_kwh');
    container.setAttribute('data-year', year);

    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    container.appendChild(label);
    if (field.helpText) {
      const help = document.createElement('small');
      help.className = 'field-help';
      appendHelpTextWithAutoLinks(help, field.helpText);
      container.appendChild(help);
    }

    const modeName = `energia_kwh_mode_y_${year}`;
    const modeDiv = document.createElement('div');
    modeDiv.className = 'energy-mode-choice';
    modeDiv.innerHTML = `
      <label class="radio-label"><input type="radio" name="${modeName}" value="anual" class="field-input"> Total anual (kWh)</label>
      <label class="radio-label"><input type="radio" name="${modeName}" value="bimestral" class="field-input"> Por recibo bimestral</label>
    `;
    container.appendChild(modeDiv);

    const anualWrap = document.createElement('div');
    anualWrap.className = 'energy-anual-wrap';
    anualWrap.setAttribute('data-energy-mode', 'anual');
    const anualInput = document.createElement('input');
    anualInput.type = 'number';
    anualInput.name = fieldName;
    anualInput.id = fieldId;
    anualInput.className = 'field-input number-input';
    anualInput.placeholder = '0 kWh';
    anualWrap.appendChild(anualInput);
    const anualUnit = document.createElement('span');
    anualUnit.className = 'field-unit';
    anualUnit.textContent = 'kWh';
    anualWrap.appendChild(anualUnit);

    const pastYearContainer = document.createElement('div');
    pastYearContainer.className = 'past-year-rows';
    pastYearContainer.setAttribute('data-field-id', 'energia_kwh');
    // Task 13: Hide multi-year UI (only single selected year in UI)
    pastYearContainer.style.display = 'none';
    const addPastYearBtn = document.createElement('button');
    addPastYearBtn.type = 'button';
    addPastYearBtn.className = 'btn-add-past-year';
    addPastYearBtn.textContent = '+ Agregar año anterior';
    addPastYearBtn.style.display = 'none'; // Task 13: Hide in single-year mode
    let pastYearCount = 0;
    const handleAddPastYearEnergy = () => {
      const currentYear = new Date().getFullYear();
      pastYearCount++;
      const row = document.createElement('div');
      row.className = 'past-year-row';
      row.id = `past-year-row-energia_kwh-${pastYearCount}`;
      const yearSelect = document.createElement('select');
      yearSelect.className = 'past-year-select';
      const optPlaceholder = document.createElement('option');
      optPlaceholder.value = '';
      optPlaceholder.textContent = 'Año...';
      yearSelect.appendChild(optPlaceholder);
      for (let y = currentYear - 1; y >= currentYear - 10; y--) {
        if (y === year) continue;
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      }
      const pastInput = document.createElement('input');
      pastInput.type = 'number';
      pastInput.className = 'past-year-input field-input number-input';
      pastInput.placeholder = '0 kWh';
      pastInput.setAttribute('data-extra-year-field', 'energia_kwh');
      yearSelect.addEventListener('change', () => {
        pastInput.setAttribute('data-extra-year', yearSelect.value);
        if (yearSelect.value) {
          pastInput.name = `energia_kwh_y_${yearSelect.value}`;
        } else {
          pastInput.removeAttribute('name');
        }
        pastYearContainer.querySelectorAll('.past-year-row').forEach(r => {
          const sel = r.querySelector('.past-year-select');
          if (!sel) return;
          const usedByOthers = new Set();
          pastYearContainer.querySelectorAll('.past-year-row').forEach(other => {
            if (other === r) return;
            const otherSel = other.querySelector('.past-year-select');
            if (otherSel && otherSel.value) usedByOthers.add(otherSel.value);
          });
          Array.from(sel.options).forEach(opt => {
            opt.disabled = opt.value !== '' && usedByOthers.has(opt.value);
          });
        });
        onChangeCallback();
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete-past-year';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Eliminar este año';
      deleteBtn.addEventListener('click', () => {
        row.remove();
        onChangeCallback();
      });
      pastInput.addEventListener('input', onChangeCallback);
      row.appendChild(yearSelect);
      row.appendChild(pastInput);
      row.appendChild(deleteBtn);
      let nextYear = currentYear - 2;
      const allPastRows = pastYearContainer.querySelectorAll('.past-year-row');
      if (allPastRows.length > 0) {
        let minYear = currentYear;
        allPastRows.forEach(r => {
          const sel = r.querySelector('.past-year-select');
          if (sel && sel.value) {
            const y = parseInt(sel.value, 10);
            if (y < minYear) minYear = y;
          }
        });
        nextYear = minYear - 1;
      }
      if (nextYear === year) nextYear = year - 1;
      if (yearSelect.querySelector(`option[value="${nextYear}"]`)) {
        yearSelect.value = nextYear;
      }
      yearSelect.dispatchEvent(new Event('change'));
      pastYearContainer.insertBefore(row, addPastYearBtn);
      onChangeCallback();
    };
    addPastYearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAddPastYearEnergy();
    });
    pastYearContainer.appendChild(addPastYearBtn);
    anualWrap.appendChild(pastYearContainer);

    container.appendChild(anualWrap);

    const bimestralWrap = document.createElement('div');
    bimestralWrap.className = 'energy-bimestral-wrap';
    bimestralWrap.setAttribute('data-energy-mode', 'bimestral');
    bimestralWrap.style.display = 'none';
    bimestralWrap.innerHTML = '<p class="field-help">El primer periodo se ajusta con las flechas. Agrega periodos anteriores (bimestres previos) con el botón.</p>';
    const offsetWrap = document.createElement('div');
    offsetWrap.className = 'energy-bimestral-offset-wrap';
    const offsetLabel = document.createElement('span');
    offsetLabel.className = 'energy-bimestral-offset-label';
    offsetLabel.setAttribute('aria-live', 'polite');
    const offsetPrevBtn = document.createElement('button');
    offsetPrevBtn.type = 'button';
    offsetPrevBtn.className = 'btn-offset-prev';
    offsetPrevBtn.setAttribute('aria-label', 'Un bimestre atrás');
    offsetPrevBtn.textContent = '←';
    const offsetNextBtn = document.createElement('button');
    offsetNextBtn.type = 'button';
    offsetNextBtn.className = 'btn-offset-next';
    offsetNextBtn.setAttribute('aria-label', 'Un bimestre adelante');
    offsetNextBtn.textContent = '→';
    offsetWrap.appendChild(offsetPrevBtn);
    offsetWrap.appendChild(offsetLabel);
    offsetWrap.appendChild(offsetNextBtn);
    bimestralWrap.appendChild(offsetWrap);
    const bimestralList = document.createElement('div');
    bimestralList.className = 'energy-bimestral-list';
    bimestralWrap.appendChild(bimestralList);
    const addPeriodBtn = document.createElement('button');
    addPeriodBtn.type = 'button';
    addPeriodBtn.className = 'btn-add-period';
    addPeriodBtn.textContent = '+ Agregar periodo';
    bimestralWrap.appendChild(addPeriodBtn);
    const hiddenBimestral = document.createElement('input');
    hiddenBimestral.type = 'hidden';
    hiddenBimestral.name = `energia_kwh_bimestral_y_${year}`;
    hiddenBimestral.className = 'energy-bimestral-json';
    bimestralWrap.appendChild(hiddenBimestral);
    container.appendChild(bimestralWrap);

    const DEFAULT_OFFSET = 0;
    const loadBimestralState = () => {
      try {
        const raw = hiddenBimestral.value;
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map(p => ({
            year: p.year,
            periodIndex: p.periodIndex != null ? p.periodIndex : p.bimonth,
            kWh: p.kWh
          })).filter(p => p.year != null && (p.periodIndex != null || p.bimonth != null));
          return { offset: DEFAULT_OFFSET, periods: sortBimestralBySlot(migrated) };
        }
        const periods = (parsed.periods || []).map(p => ({
          year: p.year,
          periodIndex: p.periodIndex != null ? p.periodIndex : p.bimonth,
          kWh: p.kWh
        })).filter(p => p.year != null);
        return { offset: (parsed.offset != null && !isNaN(parsed.offset)) ? (parsed.offset % 6) : DEFAULT_OFFSET, periods: sortBimestralBySlot(periods) };
      } catch (e) {
        return null;
      }
    };

    const getInitialState = () => {
      const currentYear = new Date().getFullYear();
      if (year < currentYear) {
        // Previous year: pre-load all 6 bimestres
        return {
          offset: 0,
          periods: [1, 2, 3, 4, 5, 6].map(periodIndex => ({ year, periodIndex, kWh: null }))
        };
      } else {
        // Current year: load only completed bimestres (up to 2 months ago)
        const init = getInitialBimestralPeriod();
        const maxPeriod = (init.year === year) ? init.periodIndex : 6;
        const periods = [];
        for (let p = 1; p <= maxPeriod; p++) {
          periods.push({ year, periodIndex: p, kWh: null });
        }
        return { offset: 0, periods };
      }
    };

    const saveBimestralState = (state) => {
      hiddenBimestral.value = JSON.stringify(state);
      onChangeCallback();
    };

    const updateOffsetLabel = (offset) => {
      const bimonth = periodIndexToBimonth(1, offset);
      const b = BIMESES.find(x => x.index === bimonth);
      offsetLabel.textContent = b ? `Último bimestre: ${b.label}` : '';
    };

    const renderBimestralRows = (state) => {
      if (!state) state = getInitialState();
      const { offset, periods } = state;
      const sorted = sortBimestralBySlot(periods).reverse();
      updateOffsetLabel(offset);
      bimestralList.innerHTML = '';
      sorted.forEach((p, i) => {
        const { year: labelYear, bimonth } = getBimestralDisplayCalendar(p.year, p.periodIndex, offset);
        const periodLabel = getBimonthLabel(labelYear, bimonth);
        const slotKey = `${p.year}-${p.periodIndex}`;
        const row = document.createElement('div');
        row.className = 'bimestral-row';
        row.innerHTML = `
          <span class="bimestral-period">${periodLabel}</span>
          <input type="number" min="0" step="any" class="field-input number-input bimestral-kwh" data-slot="${slotKey}" placeholder="kWh" value="${p.kWh != null ? p.kWh : ''}">
          <span class="field-unit">kWh</span>
          <button type="button" class="btn-remove-period" aria-label="Quitar periodo">×</button>
        `;
        row.querySelector('.bimestral-kwh').addEventListener('input', () => {
          const s = loadBimestralState() || getInitialState();
          const idx = s.periods.findIndex(x => `${x.year}-${x.periodIndex}` === slotKey);
          const num = row.querySelector('.bimestral-kwh').value === '' ? null : parseFloat(row.querySelector('.bimestral-kwh').value);
          if (idx >= 0) s.periods[idx] = { ...s.periods[idx], kWh: num };
          else s.periods.push({ year: p.year, periodIndex: p.periodIndex, kWh: num });
          saveBimestralState(s);
        });
        row.querySelector('.btn-remove-period').addEventListener('click', () => {
          const s = loadBimestralState() || getInitialState();
          s.periods = s.periods.filter(x => `${x.year}-${x.periodIndex}` !== slotKey);
          if (s.periods.length === 0) s.periods = [getInitialBimestralPeriod()].map(r => ({ ...r, kWh: null }));
          saveBimestralState(s);
          renderBimestralRows(loadBimestralState());
        });
        bimestralList.appendChild(row);
      });
    };

    // Helper: Calculate the maximum allowed offset based on year and current date
    // For previous year: allow full offset range (0-5) to access all bimestres
    // For current year: cap based on today's date to prevent future period offsetting
    const getMaxOffsetForToday = () => {
      const currentYear = new Date().getFullYear();
      if (year < currentYear) {
        // Previous year: all offset positions valid (0-5)
        return 5;
      }
      // Current year: cap at last completed bimonth - 1
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12

      // Find current bimonth: 1=Ene-Feb, 2=Mar-Apr, 3=May-Jun, 4=Jul-Ago, 5=Sep-Oct, 6=Nov-Dic
      let currentBimonth = 1;
      if (currentMonth <= 2) currentBimonth = 1;
      else if (currentMonth <= 4) currentBimonth = 2;
      else if (currentMonth <= 6) currentBimonth = 3;
      else if (currentMonth <= 8) currentBimonth = 4;
      else if (currentMonth <= 10) currentBimonth = 5;
      else currentBimonth = 6;

      // Allow looking back only 1 bimonth (2 months) from current date
      return Math.max(0, currentBimonth - 1);
    };

    offsetPrevBtn.addEventListener('click', () => {
      const s = loadBimestralState() || getInitialState();
      // Only allow going backwards if current offset is not already at minimum (0)
      if (s.offset > 0) {
        s.offset = s.offset - 1;
        saveBimestralState(s);
        renderBimestralRows(s);
      }
    });

    offsetNextBtn.addEventListener('click', () => {
      const s = loadBimestralState() || getInitialState();
      const maxOffset = getMaxOffsetForToday();
      // Only allow going forward if within allowed range
      if (s.offset < maxOffset) {
        s.offset = s.offset + 1;
        saveBimestralState(s);
        renderBimestralRows(s);
      }
    });

    addPeriodBtn.addEventListener('click', () => {
      const s = loadBimestralState() || getInitialState();
      const first = s.periods.length ? sortBimestralBySlot(s.periods)[0] : null;
      const prev = first ? getPreviousPeriodSlot(first.year, first.periodIndex) : null;
      if (!prev) {
        alert('No hay periodo anterior al primero.');
        return;
      }
      if (isFuturePeriodSlot(prev.year, prev.periodIndex, s.offset)) {
        alert('No se puede agregar periodos futuros.');
        return;
      }
      s.periods = [{ year: prev.year, periodIndex: prev.periodIndex, kWh: null }, ...s.periods];
      // Task 13: Validate bimestral contiguity
      const validation = validateBimestralContiguity(s.periods);
      if (!validation.valid) {
        alert(`Validación: ${validation.error}`);
        return; // Don't add period if validation fails
      }
      saveBimestralState(s);
      renderBimestralRows(s);
    });

    const toggleMode = () => {
      const mode = document.querySelector(`[name="${modeName}"]:checked`);
      const isBimestral = mode && mode.value === 'bimestral';
      anualWrap.style.display = isBimestral ? 'none' : 'block';
      bimestralWrap.style.display = isBimestral ? 'block' : 'none';
      if (isBimestral) {
        anualInput.removeAttribute('required');
        const state = loadBimestralState();
        if (!state || !state.periods || state.periods.length === 0) {
          const init = getInitialState();
          saveBimestralState(init);
          renderBimestralRows(init);
        } else {
          renderBimestralRows(state);
        }
      } else {
        anualInput.removeAttribute('required');
      }
      onChangeCallback();
    };

    modeDiv.querySelectorAll('input').forEach(r => {
      r.addEventListener('change', toggleMode);
    });
    anualInput.addEventListener('input', onChangeCallback);

    container.addEventListener('change', (e) => {
      if (e.target.name === modeName) toggleMode();
    });

    return container;
  }

  /**
   * Task 15: Renderiza el campo RFC con lógica condicional requerida para México
   * RFC es requerido solo cuando el país seleccionado es México (code2 === "MX")
   */
  renderRFCField(field, seccion, fieldName, fieldId, onChangeCallback) {
    const container = document.createElement('div');
    container.className = 'form-field';
    container.setAttribute('data-field-id', 'company_rfc');

    const label = document.createElement('label');
    label.className = 'field-label';
    label.setAttribute('for', fieldId);
    label.innerHTML = field.label;
    container.appendChild(label);

    if (field.helpText) {
      const help = document.createElement('small');
      help.className = 'field-help';
      appendHelpTextWithAutoLinks(help, field.helpText);
      container.appendChild(help);
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.id = fieldId;
    input.name = fieldName;
    input.className = 'field-input text-input';
    input.placeholder = 'Ejemplo: ABC123456XYZ0';
    input.setAttribute('data-field-type', 'rfc');
    container.appendChild(input);

    // Task 15: Update required status when country changes
    const updateRFCRequirement = () => {
      const countrySelect = document.querySelector('[name="company_country"]');
      if (!countrySelect) return;

      // Get the selected country option to check code2 attribute
      const selectedOption = countrySelect.options[countrySelect.selectedIndex];
      const countryCode = selectedOption?.getAttribute('data-code2') || selectedOption?.value;

      const isMexico = countryCode === 'MX';

      // Update input required attribute
      if (isMexico) {
        input.required = true;
        // Update label to show required indicator if not already present
        if (!label.querySelector('.required-indicator')) {
          const requiredSpan = document.createElement('span');
          requiredSpan.className = 'required-indicator';
          requiredSpan.title = 'Campo requerido';
          requiredSpan.textContent = '*';
          label.appendChild(requiredSpan);
        }
      } else {
        input.required = false;
        // Remove required indicator
        const requiredSpan = label.querySelector('.required-indicator');
        if (requiredSpan) requiredSpan.remove();
      }

      onChangeCallback();
    };

    // Listen for country changes
    const countrySelect = document.querySelector('[name="company_country"]');
    if (countrySelect) {
      countrySelect.addEventListener('change', updateRFCRequirement);
      // Set initial state
      updateRFCRequirement();
    }

    // Task 15: RFC validation on input
    input.addEventListener('change', () => {
      const value = input.value.trim();
      if (!value) return; // Empty is OK if not required

      // Validate RFC format
      const rfcRegex = /^[A-ZÑ&]{6}\d{6}[0-9A-Z]$/;
      const normalized = value.toUpperCase().replace(/\s+/g, '');

      if (!rfcRegex.test(normalized)) {
        input.setCustomValidity('RFC debe tener formato válido (13 caracteres: 6 letras + 6 dígitos + 1 carácter)');
      } else {
        input.setCustomValidity('');
        // Update value to normalized form
        input.value = normalized;
      }
    });

    input.addEventListener('input', onChangeCallback);

    return container;
  }

  /**
   * Renderiza el bloque de campos para un año en una sección multi-año.
   */
  renderYearBlock(seccion, year, onChangeCallback) {
    const block = document.createElement('div');
    block.className = 'year-block';
    block.setAttribute('data-year', year);

    const yearHeader = document.createElement('div');
    yearHeader.className = 'year-block-header';
    yearHeader.innerHTML = `<h3 class="year-block-title" style="display: none;">Datos año ${year}</h3>`;
    block.appendChild(yearHeader);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'seccion-fields';
    this.formFields[seccion].forEach(field => {
      fieldsContainer.appendChild(this.renderField(field, seccion, onChangeCallback, year));
    });
    block.appendChild(fieldsContainer);
    return block;
  }

  /**
   * Renderiza un campo individual
   * @param {object} field - Configuración del campo
   * @param {string} seccion - Sección a la que pertenece
   * @param {function} onChangeCallback - Callback
   * @param {number|null} year - Si es sección multi-año, año del bloque; si no, null
   */
  renderField(field, seccion, onChangeCallback, year) {
    const nameSuffix = year != null ? `_y_${year}` : '';
    const fieldName = field.id + nameSuffix;
    const fieldId = field.id + nameSuffix;

    if (field.type === 'matrix') {
      return this.renderMatrixField(field, seccion, onChangeCallback, year);
    }

    if (field.id === 'energia_kwh' && year != null) {
      return this.renderEnergyField(field, seccion, year, fieldName, onChangeCallback);
    }

    // Task 15: RFC field with conditional required logic for Mexico (code2 === "MX")
    if (field.id === 'company_rfc') {
      return this.renderRFCField(field, seccion, fieldName, fieldId, onChangeCallback);
    }

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';
    fieldDiv.setAttribute('data-field-id', field.id);
    if (year != null) fieldDiv.setAttribute('data-year', year);

    if (field.conditional) {
      const condName = field.conditional + nameSuffix;
      fieldDiv.setAttribute('data-conditional', condName);
      fieldDiv.style.display = 'none';
    }

    const label = document.createElement('label');
    label.className = 'field-label';
    label.setAttribute('for', fieldId);
    let requiredSpan = '';
    if (field.required) {
      requiredSpan = `<span class="required-indicator" title="Campo requerido">*</span>`;
    }
    label.innerHTML = `${field.label} ${requiredSpan}`;
    fieldDiv.appendChild(label);

    if (field.helpText) {
      const helpText = document.createElement('small');
      helpText.className = 'field-help';
      appendHelpTextWithAutoLinks(helpText, field.helpText);
      fieldDiv.appendChild(helpText);
    }

    let input;
    if (field.type === 'text') {
      input = document.createElement('input');
      input.type = 'text';
      input.id = fieldId;
      input.name = fieldName;
      input.className = 'field-input text-input';
      if (field.required) input.required = true;
      input.placeholder = field.helpText || '';
    } else if (field.type === 'number') {
      // Create wrapper for number input with optional unknown checkbox
      const wrapper = document.createElement('div');
      wrapper.className = 'number-field-wrapper';

      input = document.createElement('input');
      input.type = 'number';
      input.id = fieldId;
      input.name = fieldName;
      input.className = 'field-input number-input';
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.unit) {
        input.placeholder = `0 ${field.unit}`;
      }
      if (field.required) input.required = true;

      wrapper.appendChild(input);

      // Add "No sé" checkbox if allowUnknown is true
      if (field.allowUnknown) {
        const checkboxContainer = document.createElement('label');
        checkboxContainer.className = 'unknown-checkbox-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'unknown-checkbox';
        checkbox.id = fieldId + '-unknown';
        checkbox.dataset.field = fieldId;

        const label = document.createElement('span');
        label.textContent = 'No sé';
        label.className = 'unknown-label-text';

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        wrapper.appendChild(checkboxContainer);

        // Sync checkbox state with input - explicitly capture input reference
        const numberInput = input; // Capture input reference in local variable
        checkbox.addEventListener('change', (event) => {
          if (event.target.checked) {
            numberInput.disabled = true;
            numberInput.value = '';
          } else {
            numberInput.disabled = false;
          }
        });

        // Also handle direct checkbox state changes (for cases where checked is set programmatically)
        checkbox.addEventListener('click', (event) => {
          setTimeout(() => {
            if (checkbox.checked) {
              numberInput.disabled = true;
              numberInput.value = '';
            } else {
              numberInput.disabled = false;
            }
          }, 0);
        });
      }

      // Add per-field past-year controls for multi-year sections
      if (year != null && this.MULTI_YEAR_SECTIONS.includes(seccion)) {
        const pastYearContainer = document.createElement('div');
        pastYearContainer.className = 'past-year-rows';
        pastYearContainer.setAttribute('data-field-id', field.id);

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn-add-past-year';
        addButton.textContent = '+ Agregar año anterior';

        let pastYearCount = 0;

        const handleAddPastYear = () => {
          const currentYear = new Date().getFullYear();
          pastYearCount++;
          const rowId = `past-year-row-${field.id}-${pastYearCount}`;

          // Find the minimum year already selected to decrement from it
          // Start from currentYear - 2 since main year block is currentYear - 1
          let nextYear = currentYear - 2;
          const allPastRows = pastYearContainer.querySelectorAll('.past-year-row');
          if (allPastRows.length > 0) {
            let minYear = currentYear;
            allPastRows.forEach(row => {
              const sel = row.querySelector('.past-year-select');
              if (sel && sel.value) {
                const yearVal = parseInt(sel.value, 10);
                if (yearVal < minYear) minYear = yearVal;
              }
            });
            nextYear = minYear - 1;
          }

          // Create year selector
          const yearSelect = document.createElement('select');
          yearSelect.className = 'past-year-select';
          const selectLabel = document.createElement('option');
          selectLabel.value = '';
          selectLabel.textContent = 'Año...';
          yearSelect.appendChild(selectLabel);

          // Populate year options: currentYear - 1 down to currentYear - 10
          for (let y = currentYear - 1; y >= currentYear - 10; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
          }

          // Create number input for the past year value
          const pastInput = document.createElement('input');
          pastInput.type = 'number';
          pastInput.className = 'past-year-input field-input number-input';
          pastInput.placeholder = '0';
          if (field.min !== undefined) pastInput.min = field.min;
          if (field.max !== undefined) pastInput.max = field.max;

          // When year is selected, set the input's data-extra-year attribute
          yearSelect.addEventListener('change', () => {
            pastInput.setAttribute('data-extra-year', yearSelect.value);
            pastInput.setAttribute('data-extra-year-field', field.id);

            // Update name attribute when year changes
            if (yearSelect.value) {
              pastInput.name = `${field.id}_y_${yearSelect.value}`;
            } else {
              pastInput.removeAttribute('name');
            }

            // Disable already-used years
            const usedYears = new Set();
            const allRows = pastYearContainer.querySelectorAll('.past-year-row');
            allRows.forEach(row => {
              const sel = row.querySelector('.past-year-select');
              if (sel && sel.value) usedYears.add(sel.value);
            });
            Array.from(yearSelect.options).forEach(opt => {
              opt.disabled = usedYears.has(opt.value);
            });
          });

          // Create delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.type = 'button';
          deleteBtn.className = 'btn-delete-past-year';
          deleteBtn.innerHTML = '&times;';
          deleteBtn.title = 'Eliminar este año';
          deleteBtn.addEventListener('click', () => {
            row.remove();
            onChangeCallback();
          });

          // Create row container
          const row = document.createElement('div');
          row.className = 'past-year-row';
          row.id = rowId;
          row.appendChild(yearSelect);
          row.appendChild(pastInput);
          row.appendChild(deleteBtn);

          // Auto-set year to calculated nextYear and trigger change event
          yearSelect.value = nextYear;
          yearSelect.dispatchEvent(new Event('change'));

          pastYearContainer.insertBefore(row, addButton);
          onChangeCallback();
        };

        addButton.addEventListener('click', (e) => {
          e.preventDefault();
          handleAddPastYear();
        });

        pastYearContainer.appendChild(addButton);
        wrapper.appendChild(pastYearContainer);
      }

      input = wrapper;
    } else if (field.type === 'select') {
      input = document.createElement('select');
      input.id = fieldId;
      input.name = fieldName;
      input.className = 'field-input select-input';
      if (field.required) input.required = true;
      if (field.dataSource) {
        input.setAttribute('data-source', field.dataSource);
        if (field.dataSourceParent) {
          input.setAttribute('data-parent', field.dataSourceParent + nameSuffix);
        }
      }

      if (field.required) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Seleccionar...';
        input.appendChild(emptyOption);
      }

      // Populate options from dataSource or field.options
      if (field.dataSource === 'countries') {
        this.countries.forEach(country => {
          const optionElement = document.createElement('option');
          optionElement.value = country.name;
          optionElement.textContent = country.name;
          input.appendChild(optionElement);
        });
      } else if (field.dataSource === 'regions') {
        // Regions will be populated dynamically when country changes
        input.setAttribute('data-placeholder', 'Selecciona primero un país');
        input.disabled = true;
      } else if (field.options) {
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          input.appendChild(optionElement);
        });
      }

      // Add listener for country change to update regions
      if (field.id === 'company_country') {
        input.addEventListener('change', () => {
          const regionSelect = document.querySelector(`[name="company_region${nameSuffix}"]`);
          if (regionSelect) {
            this._updateRegionOptions(input.value, regionSelect, nameSuffix);
          }
          onChangeCallback();
        });
      } else {
        input.addEventListener('change', () => onChangeCallback());
      }
    } else if (field.type === 'boolean') {
      const radioDiv = document.createElement('div');
      radioDiv.className = 'radio-group';

      [['Sí', 'Sí'], ['No', 'No']].forEach(([label, val]) => {
        const radioLabel = document.createElement('label');
        radioLabel.className = 'radio-label';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = fieldName;
        radioInput.value = val;
        radioInput.className = 'field-input radio-input';
        radioInput.id = `${fieldId}-${val}`;

        radioLabel.appendChild(radioInput);
        radioLabel.appendChild(document.createTextNode(label));
        radioDiv.appendChild(radioLabel);
      });

      input = radioDiv;
    } else if (field.type === 'radio') {
      const radioDiv = document.createElement('div');
      radioDiv.className = 'radio-group';

      field.options.forEach(option => {
        const radioLabel = document.createElement('label');
        radioLabel.className = 'radio-label';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = fieldName;
        radioInput.value = option;
        radioInput.className = 'field-input radio-input';
        radioInput.id = `${fieldId}-${option}`;

        radioLabel.appendChild(radioInput);
        radioLabel.appendChild(document.createTextNode(option));
        radioDiv.appendChild(radioLabel);
      });

      input = radioDiv;
    }

    if (input) {
      // Listener de cambio
      if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
        input.addEventListener('change', () => onChangeCallback());
        input.addEventListener('input', () => onChangeCallback());
      } else if (input.classList.contains('radio-group')) {
        const radioInputs = input.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(r => {
          r.addEventListener('change', () => onChangeCallback());
        });
      }
      fieldDiv.appendChild(input);
    }

    // Unit label si existe
    if (field.unit && field.type === 'number') {
      const unitLabel = document.createElement('span');
      unitLabel.className = 'field-unit';
      unitLabel.textContent = field.unit;
      fieldDiv.appendChild(unitLabel);
    }

    return fieldDiv;
  }

  /**
   * Renderiza un campo de tipo matriz (tabla con filas y columnas).
   * @param {object} field - Definición del campo matrix
   * @param {string} seccion - Sección actual
   * @param {function} onChangeCallback - Callback de cambios
   * @param {number|null} year - Año (si aplica)
   * @returns {HTMLElement} Elemento del campo matriz
   */
  renderMatrixField(field, seccion, onChangeCallback, year) {
    const nameSuffix = year != null ? `_y_${year}` : '';

    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-field matrix-group';
    groupDiv.setAttribute('data-field-id', field.id);
    if (year != null) groupDiv.setAttribute('data-year', year);

    if (field.conditional) {
      groupDiv.setAttribute('data-conditional', field.conditional + nameSuffix);
      groupDiv.style.display = 'none';
    }

    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    groupDiv.appendChild(label);

    const table = document.createElement('table');
    table.className = 'matrix-table';

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // empty corner
    field.columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Data rows
    const tbody = document.createElement('tbody');
    field.rows.forEach(row => {
      const tr = document.createElement('tr');
      const labelTd = document.createElement('td');
      labelTd.className = 'matrix-row-label';
      labelTd.textContent = row.label;
      tr.appendChild(labelTd);

      row.ids.forEach(id => {
        const td = document.createElement('td');
        const inputName = id + nameSuffix;
        const input = document.createElement('input');
        input.type = field.inputType || 'number';
        input.name = inputName;
        input.id = inputName;
        input.className = 'field-input number-input matrix-cell-input';
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        input.placeholder = '0';
        input.addEventListener('change', () => onChangeCallback());
        input.addEventListener('input', () => onChangeCallback());
        td.appendChild(input);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    groupDiv.appendChild(table);

    if (field.unit) {
      const unitSpan = document.createElement('span');
      unitSpan.className = 'field-unit';
      unitSpan.textContent = field.unit;
      groupDiv.appendChild(unitSpan);
    }

    return groupDiv;
  }

  /**
   * Task 12: Set the selected reporting year
   * @param {number} year
   * @returns {boolean} true if year was changed, false if locked or invalid
   */
  setSelectedYear(year) {
    if (this.yearLocked) {
      console.warn(`Year selection is locked. Clear form data to change year.`);
      return false;
    }
    if (!this.dataYears.includes(year)) {
      console.warn(`Year ${year} not available. Choose from: ${this.dataYears.join(', ')}`);
      return false;
    }
    this.selectedYear = year;
    return true;
  }

  /**
   * Task 12: Check if a section is a non-company section (triggers year lock when filled)
   */
  isNonCompanySection(seccion) {
    return this.MULTI_YEAR_SECTIONS.includes(seccion);
  }

  /**
   * Task 12: Lock/unlock year selection
   * @param {boolean} locked
   */
  setYearLocked(locked) {
    this.yearLocked = locked;
    const selector = document.getElementById('year-selector');
    if (selector) {
      selector.disabled = locked || this.isReadOnly;
    }
  }

  /**
   * Task 12: Set form to read-only state (after successful submit)
   * @param {boolean} readOnly
   */
  setReadOnly(readOnly) {
    this.isReadOnly = readOnly;
    const form = document.querySelector('form');
    if (form) {
      form.classList.toggle('form-read-only', readOnly);
    }
    const selector = document.getElementById('year-selector');
    if (selector) {
      selector.disabled = readOnly || this.yearLocked;
    }
    // Disable all form fields
    const fields = form?.querySelectorAll('input, select, textarea');
    fields?.forEach(field => {
      field.disabled = readOnly;
    });
  }

  /**
   * Task 12 Phase 2: Initialize year selector as clickable tabs (no scroll effect)
   * Both years visible side-by-side; click to switch between them
   */
  initializeScrollEffects() {
    const tabA = document.querySelector('[data-year-label="unselected"]'); // current year
    const tabB = document.querySelector('[data-year-label="selected"]');   // previous year (selected by default)

    if (!tabA || !tabB) return;

    // Years are captured from dataYears (not from textContent, which never changes)
    const yearA = this.dataYears[1]; // current year shown in tabA
    const yearB = this.dataYears[0]; // previous year shown in tabB

    const attachHandler = (clickedTab, otherTab, yearForClickedTab) => {
      clickedTab.style.cursor = 'pointer';
      clickedTab.addEventListener('click', (e) => {
        e.preventDefault();
        // If already selected, do nothing
        if (clickedTab.classList.contains('year-label-selected')) return;
        // Check lock
        if (this.yearLocked) {
          alert('No puede cambiar el año mientras hay datos completados.');
          return;
        }
        // Update form state and select control
        this.setSelectedYear(yearForClickedTab);
        const selector = document.getElementById('year-selector');
        if (selector) {
          selector.value = yearForClickedTab;
        }
        // Swap classes and update fade
        clickedTab.classList.remove('year-label-unselected');
        clickedTab.classList.add('year-label-selected');
        otherTab.classList.remove('year-label-selected');
        otherTab.classList.add('year-label-unselected');
        // Reset selected tab to full opacity, then apply fade to newly unselected
        clickedTab.style.opacity = 1;
        // Toggle fade: newly unselected tab gets faded based on current scroll
        handleScrollFade();
      });
    };

    // Helper: Calculate and apply fade based on scroll position
    const handleScrollFade = () => {
      const unselectedTab = document.querySelector('.year-label-unselected');
      if (!unselectedTab) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Find "Ingresos anuales" question (company_revenue) as fade pivot point
      const revenueQuestionField = document.querySelector('[data-field-id="company_revenue"]');
      const revenueQuestionTop = revenueQuestionField
        ? revenueQuestionField.getBoundingClientRect().top + scrollTop
        : docHeight * 0.15;

      // Find start of ambiental section (first time-sensitive data)
      const ambientalSection = document.querySelector('[data-section="ambiental"]');
      const ambientalSectionTop = ambientalSection
        ? ambientalSection.getBoundingClientRect().top + scrollTop
        : docHeight * 0.65;

      // Calculate opacity progression:
      // 60% at start → 30% at "Ingresos anuales" → 5% at ambiental section start
      let fadeOpacity = 0.6; // Default: 60% opacity

      if (scrollTop < revenueQuestionTop) {
        // Before "Ingresos anuales": fade from 60% to 30%
        const fadeStart = 0;
        const fadeEnd = revenueQuestionTop;
        const fadeProgress = (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        fadeOpacity = 0.6 - (fadeProgress * 0.3); // 0.6 to 0.3
      } else if (scrollTop < ambientalSectionTop) {
        // From "Ingresos anuales" to ambiental section: fade from 30% to 5%
        const fadeStart = revenueQuestionTop;
        const fadeEnd = ambientalSectionTop;
        const fadeProgress = (scrollTop - fadeStart) / (fadeEnd - fadeStart);
        fadeOpacity = 0.3 - (fadeProgress * 0.25); // 0.3 to 0.05
      } else {
        // At/after ambiental section: stay at 5% opacity
        fadeOpacity = 0.05;
      }

      unselectedTab.style.opacity = Math.max(0, fadeOpacity);
    };

    // Attach handlers to both tabs so either can be clicked
    attachHandler(tabA, tabB, yearA);
    attachHandler(tabB, tabA, yearB);

    // Initial opacity: tabA (current year) is unselected initially - 60% opacity
    tabA.style.opacity = 0.6;

    // Add scroll listener for progressive fade
    window.addEventListener('scroll', handleScrollFade);
  }

  /**
   * Task 12 Phase 3: Clear form data and unlock year
   */
  clearFormData() {
    // Show confirmation dialog
    const confirmed = window.confirm(
      '¿Está seguro que desea limpiar todos los datos del formulario?\n\nEsta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    // Clear all form fields
    const form = document.querySelector('form');
    if (form) {
      // Clear text inputs
      form.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
      });

      // Clear selects
      form.querySelectorAll('select').forEach(select => {
        select.value = '';
      });

      // Clear checkboxes and radios
      form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        input.checked = false;
      });

      // Clear textareas
      form.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = '';
      });
    }

    // Unlock year selection
    this.setYearLocked(false);

    // Show success message
    alert('Formulario limpiado. Ahora puede cambiar el año de reporte.');
  }

  /**
   * Adds a new year to the form data
   */
  addDataYear(year) {
    if (!year || this.dataYears.includes(year)) return;
    this.dataYears.push(year);
    this.dataYears.sort((a, b) => b - a);
  }

  /**
   * Extrae todos los valores del formulario.
   * Con multi-año: devuelve datos por año (annualData) y un objeto plano para el año primario (scoring).
   * @returns {object} { fieldId: value, ... flatPrimary; dataYears; annualData }
   */
  getFormValues() {
    const company = {};
    this.formFields.company.forEach(field => {
      const input = document.querySelector(`[name="${field.id}"]`);
      if (input) {
        if (input.type === 'radio') {
          const checked = document.querySelector(`[name="${field.id}"]:checked`);
          company[field.id] = checked ? (checked.value || null) : null;
        } else if (input.type === 'number') {
          // Check for "No sé" checkbox in parent wrapper
          const wrapper = input.parentElement;
          const unknownCheckbox = wrapper?.querySelector('.unknown-checkbox');
          if (unknownCheckbox?.checked) {
            company[field.id] = null;
          } else {
            company[field.id] = input.value ? parseFloat(input.value) : null;
          }
        } else {
          company[field.id] = input.value || null;
        }
      }
    });

    let dataYears = [];
    const annualData = { ambiental: {}, social: {}, gobernanza: {} };

    this.MULTI_YEAR_SECTIONS.forEach(seccion => {
      const blocks = document.querySelectorAll(`.nis-seccion-${seccion} .year-block`);
      blocks.forEach(block => {
        const year = parseInt(block.getAttribute('data-year'), 10);
        if (isNaN(year)) return;
        if (!dataYears.includes(year)) dataYears.push(year);
        const yearData = {};
        this.formFields[seccion].forEach(field => {
          const name = field.id + '_y_'+ year;
          if (field.id === 'energia_kwh') {
            const modeInput = document.querySelector(`[name="energia_kwh_mode_y_${year}"]:checked`);
            const mode = modeInput ? modeInput.value : 'anual';
            if (mode === 'bimestral') {
              const hidden = document.querySelector(`[name="energia_kwh_bimestral_y_${year}"]`);
              let total = null;
              if (hidden && hidden.value) {
                try {
                  const parsed = JSON.parse(hidden.value);
                  const periods = Array.isArray(parsed) ? parsed : (parsed.periods || []);
                  total = periods.reduce((sum, p) => sum + (Number(p.kWh) || 0), 0);
                  if (total === 0) total = null;
                } catch (e) {}
              }
              yearData[field.id] = total;
            } else {
              const input = document.querySelector(`[name="${name}"]`);
              yearData[field.id] = input && input.value ? parseFloat(input.value) : null;
            }
          } else if (field.type === 'matrix') {
            field.rows.forEach(row => {
              row.ids.forEach(id => {
                const matrixName = id + '_y_' + year;
                const input = document.querySelector(`[name="${matrixName}"]`);
                if (input) yearData[id] = input.value ? parseFloat(input.value) : null;
              });
            });
          } else {
            const input = document.querySelector(`[name="${name}"]`);
            if (!input) return;
            if (input.type === 'radio') {
              const checked = document.querySelector(`[name="${name}"]:checked`);
              yearData[field.id] = checked ? (checked.value || null) : null;
            } else if (input.type === 'number') {
              // Check for "No sé" checkbox in parent wrapper
              const wrapper = input.parentElement;
              const unknownCheckbox = wrapper?.querySelector('.unknown-checkbox');
              if (unknownCheckbox?.checked) {
                yearData[field.id] = null;
              } else {
                yearData[field.id] = input.value ? parseFloat(input.value) : null;
              }
            } else {
              yearData[field.id] = input.value || null;
            }
          }
        });
        annualData[seccion][year] = yearData;
      });

      // Collect extra past-year inputs for this section
      const extraInputs = document.querySelectorAll(
        `.nis-seccion-${seccion} [data-extra-year-field]`
      );
      extraInputs.forEach(input => {
        const fieldId = input.dataset.extraYearField;
        const yearStr = input.dataset.extraYear;
        if (!yearStr) return; // Year not yet selected
        const year = parseInt(yearStr, 10);
        if (isNaN(year)) return;
        if (fieldId === 'energia_kwh') {
          const block = input.closest('.year-block');
          if (!block) return;
          const blockYear = block.getAttribute('data-year');
          const modeInput = document.querySelector(`[name="energia_kwh_mode_y_${blockYear}"]:checked`);
          if (!modeInput || modeInput.value !== 'anual') return;
        }
        if (!annualData[seccion][year]) annualData[seccion][year] = {};
        const unknownCheckbox = input.parentElement?.querySelector('.unknown-checkbox');
        if (unknownCheckbox?.checked) {
          annualData[seccion][year][fieldId] = null;
        } else {
          annualData[seccion][year][fieldId] = input.value ? parseFloat(input.value) : null;
        }
        if (!dataYears.includes(year)) dataYears.push(year);
      });
    });

    dataYears = dataYears.length ? dataYears.sort((a, b) => b - a) : [new Date().getFullYear()];
    const primaryYear = dataYears[0];

    const flatPrimary = { ...company };
    this.MULTI_YEAR_SECTIONS.forEach(seccion => {
      if (annualData[seccion][primaryYear]) {
        Object.assign(flatPrimary, annualData[seccion][primaryYear]);
      }
    });

    return {
      ...flatPrimary,
      dataYears,
      annualData
    };
  }

  /**
   * Muestra/oculta campos condicionales según la respuesta a la pregunta de aplicabilidad.
   * Soporta bloques por año: usa annualData cuando existe.
   */
  updateConditionalFields(formValues) {
    const allFields = document.querySelectorAll('[data-conditional]');
    allFields.forEach(fieldEl => {
      const conditional = fieldEl.getAttribute('data-conditional');
      const fieldId = fieldEl.getAttribute('data-field-id');
      const yearBlock = fieldEl.closest('.year-block');
      const year = yearBlock ? parseInt(yearBlock.getAttribute('data-year'), 10) : null;
      let value;
      if (year != null && formValues.annualData && formValues.annualData.ambiental && formValues.annualData.ambiental[year]) {
        const baseName = conditional.replace(/_y_\d+$/, '');
        value = formValues.annualData.ambiental[year][baseName];
      } else {
        value = formValues[conditional] != null ? formValues[conditional] : formValues[conditional.replace(/_y_\d+$/, '')];
      }
      // Region/state field: show when parent (country) has any value; others: show when "Sí"
      const isRegionField = fieldEl.querySelector('select[data-source="regions"]');
      const show = isRegionField ? (value != null && value !== '') : value === 'Sí';

      if (show) {
        fieldEl.style.display = 'block';
      } else {
        fieldEl.style.display = 'none';
        if (fieldEl.classList.contains('matrix-group')) {
          fieldEl.querySelectorAll('input').forEach(inp => { inp.value = ''; });
        } else {
          const namePrefix = fieldId + (year != null ? '_y_' + year : '');
          document.querySelectorAll(`[name="${namePrefix}"], [name^="${namePrefix}_"]`).forEach(input => {
            if (input.type === 'radio') {
              input.checked = false;
            } else if (input.type !== 'hidden') {
              input.value = '';
            }
          });
        }
      }
    });
  }

  /**
   * Valida que todos los campos visibles y requeridos tengan valores válidos.
   * Retorna un objeto { valid: boolean, errors: Array<{fieldId, label, error}> }
   */
  validateForm() {
    const errors = [];

    // Validar campos de empresa
    this.formFields.company.forEach(field => {
      if (!field.required) return;

      const input = document.querySelector(`[name="${field.id}"]`);
      if (!input) return;

      const { isValid } = this._getFieldValueAndValidity(input, field);
      if (!isValid) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          error: `${field.label} es requerido`
        });
      }
    });

    // Validar campos multi-año (ambiental, social, gobernanza)
    this.MULTI_YEAR_SECTIONS.forEach(seccion => {
      const blocks = document.querySelectorAll(`.nis-seccion-${seccion} .year-block`);
      blocks.forEach(block => {
        const year = parseInt(block.getAttribute('data-year'), 10);
        if (isNaN(year)) return;

        this.formFields[seccion].forEach(field => {
          if (!field.required) return;

          // Check if field is hidden by conditional
          const fieldEl = block.querySelector(`[data-field-id="${field.id}"]`);
          if (!fieldEl || fieldEl.style.display === 'none') return;

          const name = field.id + '_y_' + year;
          let isValid = false;

          if (field.type === 'matrix') {
            // Validate matrix field - at least one sub-field must be valid
            field.rows.forEach(row => {
              row.ids.forEach(id => {
                const input = document.querySelector(`[name="${id}_y_${year}"]`);
                if (input) {
                  const validity = this._getFieldValueAndValidity(input, { allowUnknown: true });
                  if (validity.isValid) {
                    isValid = true;
                  }
                }
              });
            });
          } else if (field.id === 'energia_kwh') {
            // Special handling for energia_kwh with bimestral mode
            const modeInput = document.querySelector(`[name="energia_kwh_mode_y_${year}"]:checked`);
            const mode = modeInput ? modeInput.value : 'anual';
            if (mode === 'bimestral') {
              const hidden = document.querySelector(`[name="energia_kwh_bimestral_y_${year}"]`);
              if (hidden && hidden.value) {
                try {
                  const parsed = JSON.parse(hidden.value);
                  const periods = Array.isArray(parsed) ? parsed : (parsed.periods || []);
                  const total = periods.reduce((sum, p) => sum + (Number(p.kWh) || 0), 0);
                  isValid = total > 0;
                } catch (e) {}
              }
            } else {
              const input = document.querySelector(`[name="${name}"]`);
              if (input) {
                const validity = this._getFieldValueAndValidity(input, field);
                isValid = validity.isValid;
              }
            }
          } else {
            const input = document.querySelector(`[name="${name}"]`);
            if (input) {
              const validity = this._getFieldValueAndValidity(input, field);
              isValid = validity.isValid;
            }
          }

          if (!isValid) {
            errors.push({
              fieldId: field.id,
              label: field.label,
              year,
              error: `${field.label} (${year}) es requerido`
            });
          }
        });

        // Validate extra past-year inputs
        const extraInputs = block.querySelectorAll('[data-extra-year-field]');
        extraInputs.forEach(input => {
          const fieldId = input.dataset.extraYearField;
          const yearStr = input.dataset.extraYear;
          if (!yearStr) return;

          // Find the corresponding field definition
          const fieldDef = this.formFields[seccion].find(f => f.id === fieldId);
          if (!fieldDef || !fieldDef.required) return;

          const validity = this._getFieldValueAndValidity(input, fieldDef);
          if (!validity.isValid) {
            errors.push({
              fieldId,
              label: fieldDef.label,
              year: yearStr,
              error: `${fieldDef.label} (${yearStr}) es requerido`
            });
          }
        });
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene el valor de un campo input y su estado de validez
   * Retorna { value, isValid, isUnknown }
   */
  _getFieldValueAndValidity(input, field) {
    if (input.type === 'radio') {
      const checked = document.querySelector(`[name="${input.name}"]:checked`);
      const value = checked ? (checked.value || null) : null;
      return { value, isValid: value !== null, isUnknown: false };
    } else if (input.type === 'checkbox') {
      const value = input.checked ? input.value : null;
      return { value, isValid: value !== null, isUnknown: false };
    } else if (input.type === 'number') {
      // Check for "No sé" checkbox in parent wrapper
      const wrapper = input.parentElement;
      const unknownCheckbox = wrapper?.querySelector('.unknown-checkbox');
      const isUnknown = field?.allowUnknown && unknownCheckbox?.checked;
      const hasValue = input.value && !isNaN(parseFloat(input.value));
      const value = hasValue ? parseFloat(input.value) : null;

      // Valid if: has numeric value OR "No sé" is checked
      const isValid = hasValue || isUnknown;
      return { value, isValid, isUnknown };
    } else {
      const value = input.value || null;
      return { value, isValid: value !== null, isUnknown: false };
    }
  }

  /**
   * Obtiene el valor de un campo input (para compatibilidad)
   */
  _getFieldValue(input, field) {
    const { value } = this._getFieldValueAndValidity(input, field);
    return value;
  }

  /**
   * Valida si un valor es válido para un campo
   * Para campos con allowUnknown, null es válido solo si "No sé" está marcado
   * Para otros campos, debe haber un valor
   */
  _isValidValue(value, field) {
    return value !== null && value !== '';
  }
}

// Exportar para uso en HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NISFormRenderer;
  module.exports.getBimestralDisplayCalendar = getBimestralDisplayCalendar;
  module.exports.periodIndexToBimonth = periodIndexToBimonth;
}
