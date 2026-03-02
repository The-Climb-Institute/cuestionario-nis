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
  constructor(benchmarks) {
    this.benchmarks = benchmarks;
    this.formFields = this.generateFormFields();
    this.MULTI_YEAR_SECTIONS = ['ambiental', 'social', 'gobernanza'];
    this.dataYears = [new Date().getFullYear()];
  }

  /**
   * Genera la estructura de campos del formulario basada en benchmarks
   * Se pueden añadir campos sin benchmark para campos informativos
   */
  generateFormFields() {
    return {
      company: [
        {
          id: 'company_name',
          label: 'Nombre legal de la empresa',
          type: 'text',
          required: true,
          helpText: 'Nombre oficial registrado',
          benchmarkId: null
        },
        {
          id: 'company_country',
          label: 'País / Región',
          type: 'text',
          required: true,
          helpText: 'País donde opera la empresa',
          benchmarkId: null
        },
        {
          id: 'company_sector',
          label: 'Sector de industria',
          type: 'select',
          required: true,
          options: [
            'Agricultura, ganadería, pesca',
            'Minería y canteras',
            'Manufactura',
            'Servicios de agua, saneamiento',
            'Construcción',
            'Comercio, venta',
            'Transporte y logística',
            'Hospedaje y alimentación',
            'Información y comunicación',
            'Finanzas y seguros',
            'Inmuebles',
            'Actividades profesionales',
            'Administración pública',
            'Educación',
            'Salud',
            'Artes y entretenimiento',
            'Otros servicios'
          ],
          helpText: 'Categoría principal de negocio',
          benchmarkId: null
        },
        {
          id: 'company_size',
          label: 'Tamaño de la empresa',
          type: 'select',
          required: true,
          options: [
            'Micro (1-10 empleados)',
            'Pequeña (11-50 empleados)',
            'Mediana (51-250 empleados)',
            'Grande (251-1000 empleados)',
            'Empresa (1000+ empleados)'
          ],
          helpText: 'Clasificación por número de empleados',
          benchmarkId: null
        },
        {
          id: 'company_employees',
          label: 'Número de empleados',
          type: 'number',
          required: true,
          unit: 'personas',
          helpText: 'Cantidad total de empleados',
          benchmarkId: null
        },
        {
          id: 'company_revenue',
          label: 'Ingresos anuales',
          type: 'number',
          required: true,
          unit: 'USD',
          helpText: 'Ingresos brutos anuales aproximados',
          benchmarkId: null
        }
      ],
      ambiental: [
        // --- Aplicabilidad: Emisiones y energía ---
        {
          id: 'aplica_emisiones_energia',
          label: '¿La empresa reporta emisiones de GEI (alcance 1 o 2) o tiene consumo de energía relevante para reportar?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Si no aplica (p. ej. no hay combustión propia ni datos de electricidad), seleccione No; se omitirán las preguntas siguientes de emisiones y energía.',
          benchmarkId: null
        },
        {
          id: 'gei_alcance1',
          label: '¿Cuántas toneladas de emisiones GEI directas (alcance 1) generó la empresa?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Se incluye las emisiones de logística, transporte, etc.',
          benchmarkId: null,
          conditional: 'aplica_emisiones_energia'
        },
        {
          id: 'gei_alcance2',
          label: '¿Cuántas toneladas de emisiones indirectas por electricidad (alcance 2) generó la empresa?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Emisiones en planta y oficinas administrativas',
          benchmarkId: null,
          conditional: 'aplica_emisiones_energia'
        },
        {
          id: 'energia_kwh',
          label: '¿Cuál fue el consumo total de energía en kWh este año?',
          type: 'number',
          unit: 'kWh',
          helpText: 'Consumo en planta y oficinas',
          benchmarkId: null,
          conditional: 'aplica_emisiones_energia'
        },
        {
          id: 'energia_renovable',
          label: '¿Qué porcentaje de la energía usada es renovable?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark OCDE: ≥30% para 2030',
          benchmarkId: 'energia_renovable',
          conditional: 'aplica_emisiones_energia'
        },
        {
          id: 'inversion_energias_limpias',
          label: '¿Cuánto invirtió tu empresa en energías limpias este año?',
          type: 'number',
          unit: 'USD',
          helpText: 'Inversión en energías renovables e infraestructura limpia',
          benchmarkId: null,
          conditional: 'aplica_emisiones_energia'
        },
        // --- Aplicabilidad: Agua ---
        {
          id: 'aplica_agua',
          label: '¿La empresa utiliza o descarga agua en sus operaciones?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Si no aplica (p. ej. solo oficina sin uso operativo de agua), seleccione No; se omitirán las preguntas siguientes de agua.',
          benchmarkId: null
        },
        {
          id: 'agua_ingresada',
          label: '¿Cuánta agua ingresó a la operación en m³?',
          type: 'number',
          unit: 'm³',
          helpText: 'Volumen total de agua retirada de fuentes',
          benchmarkId: null,
          conditional: 'aplica_agua'
        },
        {
          id: 'agua_residual',
          label: '¿Cuánta agua residual descargan en m³?',
          type: 'number',
          unit: 'm³',
          helpText: 'Volumen de agua descargada tras uso en operaciones',
          benchmarkId: null,
          conditional: 'aplica_agua'
        },
        {
          id: 'agua_descargada_tratada',
          label: '¿Qué porcentaje del agua descargada está tratada?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark UNESCO: ≥80% tratada',
          benchmarkId: 'agua_descargada_tratada',
          conditional: 'aplica_agua'
        },
        {
          id: 'reutiliza_agua',
          label: '¿Reutilizan agua tratada en procesos?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Implementación de economía circular en agua',
          benchmarkId: 'reutiliza_agua',
          conditional: 'aplica_agua'
        },
        // --- Sustancias ozono (solo si aplica) ---
        {
          id: 'aplica_sustancias_ozono',
          label: '¿La empresa utiliza sustancias que agotan la capa de ozono (Protocolo de Montreal)?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Refrigerantes, disolventes u otras sustancias controladas. Si no utiliza ninguna, seleccione No; se omitirá la pregunta de volumen.',
          benchmarkId: null
        },
        {
          id: 'sustancias_ozono',
          label: '¿Qué volumen de sustancias (en toneladas) que agotan la capa de ozono utilizan?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Sustancias controladas por el Protocolo de Montreal',
          benchmarkId: null,
          conditional: 'aplica_sustancias_ozono'
        },
        // --- Aplicabilidad: Residuos ---
        {
          id: 'aplica_residuos',
          label: '¿La empresa genera residuos (sólidos o peligrosos) en sus operaciones?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Si no genera residuos significativos para reportar, seleccione No; se omitirán las preguntas siguientes de residuos.',
          benchmarkId: null
        },
        {
          id: 'residuos_totales',
          label: '¿Cuántos residuos en toneladas generaron durante el año?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Una persona genera aproximadamente 0,36 a 0,45 toneladas al año; puede multiplicar por el número de empleados.',
          benchmarkId: null,
          conditional: 'aplica_residuos'
        },
        {
          id: 'residuos_reciclados',
          label: '¿Qué porcentaje de sus residuos fueron reciclados?',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          helpText: 'Benchmark PNUMA/EU: ≥50% reciclado o reutilizado',
          benchmarkId: 'residuos_reciclados',
          conditional: 'aplica_residuos'
        },
        {
          id: 'residuos_peligrosos_vol',
          label: '¿Qué volumen de residuos peligrosos en toneladas generaron?',
          type: 'number',
          unit: 'toneladas',
          helpText: 'Residuos con características corrosivas, reactivas, explosivas.',
          benchmarkId: null,
          conditional: 'aplica_residuos'
        },
        {
          id: 'residuos_peligrosos',
          label: '¿Tienen protocolo formal de gestión de residuos peligrosos?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark Convenio de Basilea: protocolo documentado requerido',
          benchmarkId: 'residuos_peligrosos',
          conditional: 'aplica_residuos'
        },
        {
          id: 'mide_alcance3',
          label: '¿La empresa mide emisiones en su cadena de valor (alcance 3)?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Análisis de alcance 3 en cadena de suministro',
          benchmarkId: 'mide_alcance3'
        },
        {
          id: 'estres_hidrico',
          label: '¿Operan en zonas de estrés hídrico?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'CDMX es zona de estrés hídrico. Mapa oficial: https://smn.conagua.gob.mx/es/climatologia/monitor-de-sequia/monitor-de-sequia-en-mexico',
          benchmarkId: null
        },
        {
          id: 'biodiversidad_sensible',
          label: '¿La empresa opera en zonas con biodiversidad sensible?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Ubicación en zonas con biodiversidad sensible.',
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
          label: '¿Tienen políticas de igualdad de oportunidades y no discriminación?',
          type: 'radio',
          options: ['Sí', 'No'],
          helpText: 'Benchmark ONU/OIT: obligatorio en toda empresa.',
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
          benchmarkId: 'organo_vigilancia'
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
          helpText: 'Si No, se pasa a la siguiente sección.',
          benchmarkId: null
        },
        {
          id: 'composicion_consejo_mujeres',
          label: 'Número de mujeres',
          type: 'number',
          unit: 'personas',
          helpText: 'Composición del consejo de administración.',
          benchmarkId: null,
          conditional: 'tienen_consejo'
        },
        {
          id: 'composicion_consejo_hombres',
          label: 'Número de hombres',
          type: 'number',
          unit: 'personas',
          helpText: 'Composición del consejo de administración.',
          benchmarkId: null,
          conditional: 'tienen_consejo'
        },
        {
          id: 'composicion_consejo_nobinarias',
          label: 'Número de personas no binarias',
          type: 'number',
          unit: 'personas',
          helpText: 'Composición del consejo de administración.',
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
          helpText: 'Benchmark OCDE Gobierno Corporativo: ≥30%.',
          benchmarkId: 'mujeres_consejo',
          conditional: 'tienen_consejo'
        },
        {
          id: 'incidentes_ciberneticos',
          label: '¿Cuántos incidentes cibernéticos reportaron este año?',
          type: 'number',
          unit: 'incidentes',
          helpText: 'Un incidente cibernético ocurre cuando alguien accede, altera o interrumpe sistemas o datos sin autorización. Ejemplos: ransomware, phishing, virus, fugas de información, accesos no autorizados, errores humanos.',
          benchmarkId: null
        },
        {
          id: 'incidentes_riesgo',
          label: '¿En los últimos 12 meses, cuántos incidentes de riesgo ha registrado su empresa?',
          type: 'number',
          unit: 'incidentes',
          helpText: 'Un incidente de riesgo son situaciones que ponen en riesgo a las personas o a la empresa. Es cualquier evento inesperado que afecta o podría afectar el buen funcionamiento, la reputación o el cumplimiento de la empresa.',
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
          <p>Si desconoces un dato o no es aplicable a tu empresa, puedes dejar en blanco los campos opcionales o seleccionar "No disponible" donde se indique.</p>
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
    } else if (field.type === 'select') {
      input = document.createElement('select');
      input.id = fieldId;
      input.name = fieldName;
      input.className = 'field-input select-input';
      if (field.required) input.required = true;

      if (field.required) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Seleccionar...';
        input.appendChild(emptyOption);
      }

      if (field.options) {
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          input.appendChild(optionElement);
        });
      }
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
          company[field.id] = checked ? checked.value : null;
        } else if (input.type === 'number') {
          company[field.id] = input.value ? parseFloat(input.value) : null;
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
          } else {
            const input = document.querySelector(`[name="${name}"]`);
            if (!input) return;
            if (input.type === 'radio') {
              const checked = document.querySelector(`[name="${name}"]:checked`);
              yearData[field.id] = checked ? checked.value : null;
            } else if (input.type === 'number') {
              yearData[field.id] = input.value ? parseFloat(input.value) : null;
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
      const show = value === 'Sí';

      if (show) {
        fieldEl.style.display = 'block';
      } else {
        fieldEl.style.display = 'none';
        const namePrefix = fieldId + (year != null ? '_y_' + year : '');
        document.querySelectorAll(`[name="${namePrefix}"], [name^="${namePrefix}_"]`).forEach(input => {
          if (input.type === 'radio') {
            input.checked = false;
          } else if (input.type !== 'hidden') {
            input.value = '';
          }
        });
      }
    });
  }
}

// Exportar para uso en HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NISFormRenderer;
}
