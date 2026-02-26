/**
 * Renderizado y gestión del formulario NIS
 * Genera 31 campos organizados en 3 secciones: Ambiental (16), Social (4), Gobernanza (11)
 */

class NISFormRenderer {
  constructor(benchmarks) {
    this.benchmarks = benchmarks;
    this.formFields = this.generateFormFields();
  }

  /**
   * Genera la estructura de campos del formulario basada en benchmarks
   * Se pueden añadir campos sin benchmark para campos informativos
   */
  generateFormFields() {
    return {
      ambiental: [
        {
          id: 'gei_alcance1',
          label: '¿Cuántas toneladas de emisiones GEI directas (alcance 1) generó la empresa?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Emisiones directas de combustión en equipos propios',
          benchmarkId: null
        },
        {
          id: 'gei_alcance2',
          label: '¿Cuántas toneladas de emisiones indirectas por electricidad (alcance 2) generó la empresa?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Emisiones de la electricidad comprada',
          benchmarkId: null
        },
        {
          id: 'energia_kwh',
          label: '¿Cuál fue el consumo total de energía en kWh este año?',
          type: 'number',
          unit: 'kWh',
          helpText: 'Consumo total de energía (todos los tipos)',
          benchmarkId: null
        },
        {
          id: 'energia_renovable',
          label: '¿Qué porcentaje de la energía usada es renovable?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark OCDE: ≥30% para 2030',
          benchmarkId: 'energia_renovable'
        },
        {
          id: 'inversion_energias_limpias',
          label: '¿Cuánto invirtió tu empresa en energías limpias este año?',
          type: 'number',
          unit: 'USD',
          helpText: 'Inversión en energías renovables e infraestructura limpia',
          benchmarkId: null
        },
        {
          id: 'agua_ingresada',
          label: '¿Cuánta agua ingresó a la operación en m³?',
          type: 'number',
          unit: 'm³',
          helpText: 'Volumen total de agua retirada de fuentes',
          benchmarkId: null
        },
        {
          id: 'agua_residual',
          label: '¿Cuánta agua residual descargan en m³?',
          type: 'number',
          unit: 'm³',
          helpText: 'Volumen de agua descargada tras uso en operaciones',
          benchmarkId: null
        },
        {
          id: 'agua_descargada_tratada',
          label: '¿Qué porcentaje del agua descargada está tratada?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark UNESCO: ≥80% tratada',
          benchmarkId: 'agua_descargada_tratada'
        },
        {
          id: 'sustancias_ozono',
          label: '¿Qué volumen de sustancias (en toneladas) que agotan la capa de ozono utilizan?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Sustancias controladas por el Protocolo de Montreal',
          benchmarkId: null
        },
        {
          id: 'residuos_totales',
          label: '¿Cuántos residuos en toneladas generaron durante el año?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Residuos totales generados en operaciones',
          benchmarkId: null
        },
        {
          id: 'residuos_reciclados',
          label: '¿Qué porcentaje de sus residuos fueron reciclados?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark PNUMA/EU: ≥50% reciclado o reutilizado',
          benchmarkId: 'residuos_reciclados'
        },
        {
          id: 'residuos_peligrosos_vol',
          label: '¿Qué volumen de residuos peligrosos en toneladas generaron?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Residuos corrosivos, reactivos, explosivos',
          benchmarkId: null
        },
        {
          id: 'mide_alcance3',
          label: '¿La empresa mide emisiones en su cadena de valor (alcance 3)?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Análisis de alcance 3 en cadena de suministro',
          benchmarkId: null
        },
        {
          id: 'reutiliza_agua',
          label: '¿Reutilizan agua tratada en procesos?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Implementación de economía circular en agua',
          benchmarkId: null
        },
        {
          id: 'estres_hidrico',
          label: '¿Operan en zonas de estrés hídrico?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Ubicación en zonas con disponibilidad limitada de agua',
          benchmarkId: null
        },
        {
          id: 'biodiversidad_sensible',
          label: '¿La empresa opera en zonas con biodiversidad sensible?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Ubicación cercana a ecosistemas críticos',
          benchmarkId: null
        }
      ],
      social: [
        {
          id: 'horas_capacitacion',
          label: '¿Cuántas horas de capacitación promedio recibió cada empleado al año?',
          type: 'number',
          unit: 'horas/empleado',
          helpText: 'Benchmark OCDE: ≥40 horas/año de formación continua',
          benchmarkId: 'horas_capacitacion'
        },
        {
          id: 'evaluacion_formal_desempeno',
          label: '¿Qué porcentaje de empleados fue evaluado formalmente en desempeño?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark: ≥80% evaluados anualmente',
          benchmarkId: 'evaluacion_formal_desempeno'
        },
        {
          id: 'tasa_accidentes',
          label: '¿Cuál fue la tasa de accidentes laborales (por cada 100 empleados)?',
          type: 'number',
          unit: 'accidentes/100',
          helpText: 'Benchmark OIT: <2.0 accidentes por 100 trabajadores',
          benchmarkId: 'tasa_accidentes'
        },
        {
          id: 'politicas_igualdad',
          label: '¿Tienen políticas formales de igualdad de oportunidades y no discriminación?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark ONU/OIT: Obligatorio en toda empresa',
          benchmarkId: 'politicas_igualdad'
        }
      ],
      gobernanza: [
        {
          id: 'sistema_gestion_riesgos',
          label: '¿Tienen un sistema formal de gestión de riesgos?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark ISO 31000: Sistema documentado y periódicamente revisado',
          benchmarkId: 'sistema_gestion_riesgos'
        },
        {
          id: 'organo_vigilancia',
          label: '¿Existe un órgano de vigilancia independiente (ej. comité de auditoría)?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Componente clave del buen gobierno corporativo',
          benchmarkId: null
        },
        {
          id: 'estrategia_sostenibilidad',
          label: '¿Tienen una estrategia de sostenibilidad formal en el negocio?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark GRI/ISO 14001: Estrategia documentada e integrada',
          benchmarkId: 'estrategia_sostenibilidad'
        },
        {
          id: 'codigo_etica',
          label: '¿Cuentan con código de ética aplicado?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark OCDE Directrices para Empresas Multinacionales',
          benchmarkId: 'codigo_etica'
        },
        {
          id: 'politicas_datos',
          label: '¿Tienen políticas de protección de datos personales y ciberseguridad?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark ISO/IEC 27001 y GDPR',
          benchmarkId: 'politicas_datos'
        },
        {
          id: 'canal_denuncias',
          label: '¿Tienen un canal de denuncias éticas (whistleblowing)?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark OCDE Anti-Bribery Convention',
          benchmarkId: 'canal_denuncias'
        },
        {
          id: 'tienen_consejo',
          label: '¿En la empresa tienen consejo de administración?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Requisito para análisis de composición y diversidad',
          benchmarkId: null
        },
        {
          id: 'composicion_consejo_hombres',
          label: 'Número de hombres en consejo de administración',
          type: 'number',
          unit: 'personas',
          helpText: 'Si no aplica, escribe 0',
          benchmarkId: null,
          conditional: 'tienen_consejo'
        },
        {
          id: 'composicion_consejo_mujeres',
          label: 'Número de mujeres en consejo de administración',
          type: 'number',
          unit: 'personas',
          helpText: 'Si no aplica, escribe 0',
          benchmarkId: null,
          conditional: 'tienen_consejo'
        },
        {
          id: 'composicion_consejo_nobinarias',
          label: 'Número de personas no binarias en consejo de administración',
          type: 'number',
          unit: 'personas',
          helpText: 'Si no aplica, escribe 0',
          benchmarkId: null,
          conditional: 'tienen_consejo'
        },
        {
          id: 'mujeres_consejo',
          label: '¿Qué porcentaje de mujeres hay en el consejo?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark OCDE Gobierno Corporativo: ≥30%',
          benchmarkId: 'mujeres_consejo',
          conditional: 'tienen_consejo'
        },
        {
          id: 'incidentes_ciberneticos',
          label: '¿Cuántos incidentes cibernéticos reportaron este año?',
          type: 'number',
          unit: 'incidentes',
          helpText: 'Incluye ataques ransomware, brechas de datos, etc.',
          benchmarkId: null
        },
        {
          id: 'incidentes_riesgo',
          label: '¿En los últimos 12 meses, cuántos incidentes de riesgo ha registrado su empresa?',
          type: 'number',
          unit: 'incidentes',
          helpText: 'Riesgos realizados que impactaron operaciones',
          benchmarkId: null
        }
      ]
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

    container.innerHTML = '';

    // Renderizar cada sección
    Object.keys(this.formFields).forEach(seccion => {
      const seccionData = this.benchmarks.secciones[seccion];
      const fields = this.formFields[seccion];

      const seccionDiv = document.createElement('div');
      seccionDiv.className = `nis-seccion nis-seccion-${seccion}`;
      seccionDiv.setAttribute('data-seccion', seccion);

      // Header de sección (sin score - se moverá al final)
      const header = document.createElement('div');
      header.className = 'seccion-header';
      header.innerHTML = `
        <h2 class="seccion-titulo">${seccionData.nombre}</h2>
        <p class="seccion-descripcion">${seccionData.descripcion}</p>
      `;
      seccionDiv.appendChild(header);

      // Contenedor de campos
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'seccion-fields';

      fields.forEach((field, index) => {
        const fieldDiv = this.renderField(field, seccion, onChangeCallback);
        fieldsContainer.appendChild(fieldDiv);
      });

      seccionDiv.appendChild(fieldsContainer);

      // Footer con score (al final de la sección)
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

      container.appendChild(seccionDiv);
    });
  }

  /**
   * Renderiza un campo individual
   * @param {object} field - Configuración del campo
   * @param {string} seccion - Sección a la que pertenece
   * @param {function} onChangeCallback - Callback
   */
  renderField(field, seccion, onChangeCallback) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';
    fieldDiv.setAttribute('data-field-id', field.id);

    if (field.conditional) {
      fieldDiv.setAttribute('data-conditional', field.conditional);
      fieldDiv.style.display = 'none';
    }

    // Label
    const label = document.createElement('label');
    label.className = 'field-label';
    label.setAttribute('for', field.id);

    // Mostrar benchmark si existe
    let benchmarkSpan = '';
    if (field.benchmarkId) {
      const benchmark = this.benchmarks.benchmarks.find(b => b.id === field.benchmarkId);
      if (benchmark) {
        benchmarkSpan = `<span class="benchmark-indicator" title="Clic para ver benchmark" data-benchmark-id="${field.benchmarkId}">📊</span>`;
      }
    }

    label.innerHTML = `${field.label} ${benchmarkSpan}`;
    fieldDiv.appendChild(label);

    // Help text
    if (field.helpText) {
      const helpText = document.createElement('small');
      helpText.className = 'field-help';
      helpText.textContent = field.helpText;
      fieldDiv.appendChild(helpText);
    }

    // Input según tipo
    let input;
    if (field.type === 'number') {
      input = document.createElement('input');
      input.type = 'number';
      input.id = field.id;
      input.name = field.id;
      input.className = 'field-input number-input';
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.unit) {
        input.placeholder = `0 ${field.unit}`;
      }
    } else if (field.type === 'radio') {
      const radioDiv = document.createElement('div');
      radioDiv.className = 'radio-group';

      field.options.forEach(option => {
        const radioLabel = document.createElement('label');
        radioLabel.className = 'radio-label';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = field.id;
        radioInput.value = option;
        radioInput.className = 'field-input radio-input';
        radioInput.id = `${field.id}-${option}`;

        radioLabel.appendChild(radioInput);
        radioLabel.appendChild(document.createTextNode(option));
        radioDiv.appendChild(radioLabel);
      });

      input = radioDiv;
    }

    if (input) {
      // Listener de cambio
      if (input instanceof HTMLInputElement) {
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
   * Extrae todos los valores del formulario
   * @returns {object} {fieldId: value, ...}
   */
  getFormValues() {
    const values = {};

    Object.keys(this.formFields).forEach(seccion => {
      this.formFields[seccion].forEach(field => {
        const input = document.querySelector(`[name="${field.id}"]`);
        if (input) {
          if (input.type === 'radio') {
            const checked = document.querySelector(`[name="${field.id}"]:checked`);
            values[field.id] = checked ? checked.value : null;
          } else if (input.type === 'number') {
            values[field.id] = input.value ? parseFloat(input.value) : null;
          } else {
            values[field.id] = input.value;
          }
        }
      });
    });

    return values;
  }

  /**
   * Muestra/oculta campos condicionales
   * @param {object} formValues - Valores actuales del formulario
   */
  updateConditionalFields(formValues) {
    const allFields = document.querySelectorAll('[data-conditional]');
    allFields.forEach(field => {
      const conditional = field.getAttribute('data-conditional');
      const value = formValues[conditional];
      field.style.display = value === 'Sí' ? 'block' : 'none';
    });
  }
}

// Exportar para uso en HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NISFormRenderer;
}
