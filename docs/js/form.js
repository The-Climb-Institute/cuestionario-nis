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

/** Obtiene el bimestre (1-6) a partir del mes (1-12). */
function monthToBimonth(month) {
  return Math.min(6, Math.ceil(month / 2));
}

/** Sugiere el siguiente periodo bimestral. Si lastPeriod es null, usa la fecha actual. */
function getNextBimonthPeriod(lastPeriod) {
  const now = new Date();
  if (!lastPeriod || !lastPeriod.year || !lastPeriod.bimonth) {
    const year = now.getFullYear();
    const bimonth = monthToBimonth(now.getMonth() + 1);
    return { year, bimonth, label: getBimonthLabel(year, bimonth), key: `${year}-${bimonth}` };
  }
  let { year, bimonth } = lastPeriod;
  if (bimonth >= 6) {
    year += 1;
    bimonth = 1;
  } else {
    bimonth += 1;
  }
  return { year, bimonth, label: getBimonthLabel(year, bimonth), key: `${year}-${bimonth}` };
}

class NISFormRenderer {
  constructor(benchmarks, questions, countries = []) {
    this.benchmarks = benchmarks;
    this.countries = countries;
    this.formFields = this._buildFormFields(questions);
    this.MULTI_YEAR_SECTIONS = ['ambiental', 'social', 'gobernanza'];
    this.dataYears = [new Date().getFullYear()];
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
          <h3 class="instruction-title">Mensaje de Bienvenida</h3>
          <p>¡Bienvenido a nuestra encuesta sobre el programa Climb Institute! Tu participación es clave para comprender las expectativas y avances de las empresas que participan en el Programa de Aceleración. ¡Gracias por dedicar tu tiempo y experiencia!</p>

          <p>Con el presente estudio se aplicará un cuestionario diseñado para recopilar información clave sobre distintos aspectos que influyen en la gestión y desempeño de las organizaciones. El propósito es contar con datos que permitan analizar tendencias, identificar áreas de oportunidad y fortalecer las prácticas empresariales.</p>
        </div>

        <div class="instruction-block">
          <h3 class="instruction-title">Objetivo</h3>
          <p>Medir el avance e impacto de las acciones de igualdad, diversidad y sostenibilidad empresarial.</p>
        </div>

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
        this.dataYears.forEach(year => {
          yearBlocksContainer.appendChild(this.renderYearBlock(seccion, year, onChangeCallback));
        });
        seccionDiv.appendChild(yearBlocksContainer);

        const addYearRow = document.createElement('div');
        addYearRow.className = 'add-year-row';
        const select = document.createElement('select');
        select.className = 'field-input year-select-add';
        select.innerHTML = '<option value="">Agregar otro año...</option>';
        const maxYear = new Date().getFullYear();
        for (let y = maxYear; y >= maxYear - 10; y--) {
          if (this.dataYears.includes(y)) continue;
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          select.appendChild(opt);
        }
        const label = document.createElement('label');
        label.className = 'field-label';
        label.textContent = '¿Deseas agregar datos de otro año?';
        addYearRow.appendChild(label);
        addYearRow.appendChild(select);
        select.addEventListener('change', () => {
          const y = parseInt(select.value, 10);
          if (!y) return;
          this.dataYears.push(y);
          this.dataYears.sort((a, b) => b - a);
          const newBlock = this.renderYearBlock(seccion, y, onChangeCallback);
          yearBlocksContainer.insertBefore(newBlock, addYearRow);
          const optToRemove = select.querySelector(`option[value="${y}"]`);
          if (optToRemove) optToRemove.remove();
          select.value = '';
          onChangeCallback();
        });
        seccionDiv.appendChild(addYearRow);
      } else {
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'seccion-fields';
        fields.forEach(field => {
          fieldsContainer.appendChild(this.renderField(field, seccion, onChangeCallback, null));
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
      help.textContent = field.helpText;
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
    container.appendChild(anualWrap);

    const bimestralWrap = document.createElement('div');
    bimestralWrap.className = 'energy-bimestral-wrap';
    bimestralWrap.setAttribute('data-energy-mode', 'bimestral');
    bimestralWrap.style.display = 'none';
    bimestralWrap.innerHTML = '<p class="field-help">Agrega cada periodo de facturación (bimestre) y el consumo en kWh. El total anual se calculará automáticamente.</p>';
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

    const toggleMode = () => {
      const mode = document.querySelector(`[name="${modeName}"]:checked`);
      const isBimestral = mode && mode.value === 'bimestral';
      anualWrap.style.display = isBimestral ? 'none' : 'block';
      bimestralWrap.style.display = isBimestral ? 'block' : 'none';
      if (isBimestral) anualInput.removeAttribute('required');
      else anualInput.removeAttribute('required');
      onChangeCallback();
    };

    modeDiv.querySelectorAll('input').forEach(r => {
      r.addEventListener('change', toggleMode);
    });
    anualInput.addEventListener('input', onChangeCallback);

    const loadBimestralFromHidden = () => {
      try {
        const raw = hiddenBimestral.value;
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    };

    const saveBimestralToHidden = (arr) => {
      hiddenBimestral.value = JSON.stringify(arr);
      onChangeCallback();
    };

    const renderBimestralRows = (periods) => {
      bimestralList.innerHTML = '';
      periods.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'bimestral-row';
        const periodLabel = p.label != null ? p.label : getBimonthLabel(p.year, p.bimonth);
        const periodKey = p.key != null ? p.key : (p.year != null && p.bimonth != null ? `${p.year}-${p.bimonth}` : `period-${i}`);
        row.innerHTML = `
          <span class="bimestral-period">${periodLabel}</span>
          <input type="number" min="0" step="any" class="field-input number-input bimestral-kwh" data-key="${periodKey}" placeholder="kWh" value="${p.kWh != null ? p.kWh : ''}">
          <span class="field-unit">kWh</span>
          <button type="button" class="btn-remove-period" aria-label="Quitar periodo">×</button>
        `;
        row.querySelector('.bimestral-kwh').addEventListener('input', () => {
          const arr = loadBimestralFromHidden();
          const idx = arr.findIndex(x => (x.key || getBimonthLabel(x.year, x.bimonth)) === periodKey);
          const val = row.querySelector('.bimestral-kwh').value;
          const num = val === '' ? null : parseFloat(val);
          if (idx >= 0) {
            arr[idx] = { ...arr[idx], year: arr[idx].year, bimonth: arr[idx].bimonth, key: periodKey, label: periodLabel, kWh: num };
          } else {
            arr.push({ year: nextSuggested.year, bimonth: nextSuggested.bimonth, key: periodKey, label: periodLabel, kWh: num });
          }
          saveBimestralToHidden(arr);
        });
        row.querySelector('.btn-remove-period').addEventListener('click', () => {
          const arr = loadBimestralFromHidden().filter(x => (x.key || getBimonthLabel(x.year, x.bimonth)) !== periodKey);
          saveBimestralToHidden(arr);
          renderBimestralRows(arr);
        });
        bimestralList.appendChild(row);
      });
    };

    addPeriodBtn.addEventListener('click', () => {
      const periods = loadBimestralFromHidden();
      const last = periods.length ? periods[periods.length - 1] : null;
      const next = getNextBimonthPeriod(last);
      periods.push({ year: next.year, bimonth: next.bimonth, key: next.key, label: next.label, kWh: null });
      saveBimestralToHidden(periods);
      renderBimestralRows(periods);
    });

    container.addEventListener('change', (e) => {
      if (e.target.name === modeName) toggleMode();
    });

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
    yearHeader.innerHTML = `<h3 class="year-block-title">Datos año ${year}</h3>`;
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
      helpText.textContent = field.helpText;
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

        // Sync checkbox state with input
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            input.disabled = true;
            input.value = '';
          } else {
            input.disabled = false;
          }
        });
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
                  const arr = JSON.parse(hidden.value);
                  total = arr.reduce((sum, p) => sum + (Number(p.kWh) || 0), 0);
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
}

// Exportar para uso en HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NISFormRenderer;
}
