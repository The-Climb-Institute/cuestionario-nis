/**
 * Lógica de scoring para NIS (Normas de Información de Sostenibilidad)
 * Calcula scores normalizados (0-100%) por sección y total ponderado
 * Pesos: Ambiental 40%, Social 40%, Gobernanza 20%
 */

class NISScorer {
  constructor(benchmarks) {
    this.benchmarks = benchmarks;
    this.weights = {
      ambiental: 0.4,
      social: 0.4,
      gobernanza: 0.2
    };
  }

  /**
   * Normaliza un valor numérico según el indicador
   * @param {string} indicadorId - ID del indicador del benchmark
   * @param {number} value - Valor ingresado por el usuario
   * @returns {number} Score normalizado (0-1)
   */
  normalizeValue(indicadorId, value) {
    if (value === null || value === undefined) {
      return 0;
    }

    const benchmark = this.benchmarks.benchmarks.find(b => b.id === indicadorId);
    if (!benchmark) {
      return 0;
    }

    // Manejo de valores booleanos (Sí/No)
    if (benchmark.tipo === 'binary') {
      return (value === true || value === 'Sí' || value === 1) ? 1.0 : 0.0;
    }

    // Manejo de valores numéricos con normalización específica por indicador
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 0;
    }

    // Normalización por tipo de indicador
    switch (indicadorId) {
      // Horas de capacitación: min(value / 40, 1.0) — meta 40h/año
      case 'horas_capacitacion':
        return Math.min(numValue / 40, 1.0);

      // Tasa de accidentes: inverse scale — meta < 2.0
      case 'tasa_accidentes':
        // max(0, 1 - value/10) — a mayor accidentes, menor score
        return Math.max(0, 1 - (numValue / 10));

      // Evaluación formal: porcentaje directo (0-100%)
      case 'evaluacion_formal_desempeno':
        return Math.min(numValue / 100, 1.0);

      // Energía renovable: porcentaje directo
      case 'energia_renovable':
        return Math.min(numValue / 100, 1.0);

      // Agua tratada: porcentaje directo
      case 'agua_descargada_tratada':
        return Math.min(numValue / 100, 1.0);

      // Residuos reciclados: porcentaje directo
      case 'residuos_reciclados':
        return Math.min(numValue / 100, 1.0);

      // Mujeres en consejo: porcentaje directo
      case 'mujeres_consejo':
        return Math.min(numValue / 100, 1.0);

      // Por defecto: si es positivo, cuenta como implementado (0.5), si está "Lo implementando" = 1.0
      default:
        return numValue > 0 ? 0.5 : 0.0;
    }
  }

  /**
   * Calcula el score de una sección completa
   * IMPORTANTE: Solo cuenta indicadores que TIENEN BENCHMARK (benchmarkId != null)
   * Los campos informativos sin meta OCDE no se cuentan en el score
   * @param {string} seccion - 'ambiental', 'social' o 'gobernanza'
   * @param {object} formValues - Valores del formulario {indicadorId: value, ...}
   * @returns {object} {score: 0-1, porcentaje: 0-100, label, color, hasData: boolean}
   */
  calculateSectionScore(seccion, formValues) {
    // CRÍTICO: Filtrar SOLO benchmarks con benchmarkId (descartar campos informativos)
    const sectionBenchmarks = this.benchmarks.benchmarks.filter(
      b => b.seccion === seccion && b.id !== null
    );

    if (sectionBenchmarks.length === 0) {
      return {
        score: 0,
        porcentaje: 0,
        label: 'Sin datos',
        color: '#95A5A6',
        hasData: false
      };
    }

    // Normalizar solo indicadores con benchmark
    const normalizedScores = sectionBenchmarks.map(benchmark => {
      const value = formValues[benchmark.id];
      return { value, normalized: this.normalizeValue(benchmark.id, value) };
    });

    // Filtrar solo los indicadores que tienen valor (no nulos ni undefined)
    const respondedIndicators = normalizedScores.filter(item => item.value != null && item.value !== '');

    // Si no hay respuestas en campos con benchmark, retornar "Sin datos"
    if (respondedIndicators.length === 0) {
      return {
        score: 0,
        porcentaje: 0,
        label: 'Sin datos',
        color: '#95A5A6',
        hasData: false
      };
    }

    // Promediar solo los scores respondidos (con benchmarks)
    const score = respondedIndicators.reduce((sum, item) => sum + item.normalized, 0) / respondedIndicators.length;

    const trafficLight = this.getTrafficLight(score);
    trafficLight.hasData = true;
    return trafficLight;
  }

  /**
   * Calcula el score total ponderado de todas las secciones
   * @param {object} formValues - Valores del formulario
   * @returns {object} {score: 0-1, porcentaje: 0-100, label, color, hasData}
   */
  calculateTotalScore(formValues) {
    const sectionResults = {
      ambiental: this.calculateSectionScore('ambiental', formValues),
      social: this.calculateSectionScore('social', formValues),
      gobernanza: this.calculateSectionScore('gobernanza', formValues)
    };

    const sectionsScores = {
      ambiental: sectionResults.ambiental.score,
      social: sectionResults.social.score,
      gobernanza: sectionResults.gobernanza.score
    };

    // Verificar si hay al menos un dato respondido
    const hasAnyData = sectionResults.ambiental.hasData || sectionResults.social.hasData || sectionResults.gobernanza.hasData;

    // Si no hay datos, retornar "Sin datos"
    if (!hasAnyData) {
      return {
        score: 0,
        porcentaje: 0,
        label: 'Sin datos',
        color: '#95A5A6',
        hasData: false
      };
    }

    // Calcular ponderado
    const totalScore =
      (sectionsScores.ambiental * this.weights.ambiental) +
      (sectionsScores.social * this.weights.social) +
      (sectionsScores.gobernanza * this.weights.gobernanza);

    const trafficLight = this.getTrafficLight(totalScore);
    trafficLight.hasData = true;
    return trafficLight;
  }

  /**
   * Obtiene el indicador de semáforo y etiqueta basado en el score
   * @param {number} score - Score normalizado (0-1)
   * @returns {object} {score, porcentaje, label, color}
   */
  getTrafficLight(score) {
    const porcentaje = Math.round(score * 100);
    const escala = this.benchmarks.escala_semaforos;

    let trafficLight;
    if (porcentaje >= escala.verde.minimo) {
      trafficLight = escala.verde;
    } else if (porcentaje >= escala.amarillo.minimo) {
      trafficLight = escala.amarillo;
    } else {
      trafficLight = escala.rojo;
    }

    return {
      score: score,
      porcentaje: porcentaje,
      label: trafficLight.label,
      color: trafficLight.color
    };
  }

  /**
   * Obtiene todos los scores (por sección + total)
   * @param {object} formValues - Valores del formulario
   * @returns {object} Objeto con scores de cada sección y total
   */
  getAllScores(formValues) {
    return {
      ambiental: this.calculateSectionScore('ambiental', formValues),
      social: this.calculateSectionScore('social', formValues),
      gobernanza: this.calculateSectionScore('gobernanza', formValues),
      total: this.calculateTotalScore(formValues)
    };
  }

  /**
   * Obtiene la información de benchmark para un indicador
   * @param {string} indicadorId - ID del indicador
   * @returns {object} Benchmark completo con cita APA
   */
  getBenchmarkInfo(indicadorId) {
    return this.benchmarks.benchmarks.find(b => b.id === indicadorId) || null;
  }

  /**
   * Valida si un valor cumple con el benchmark
   * @param {string} indicadorId - ID del indicador
   * @param {*} value - Valor a validar
   * @returns {boolean} true si cumple, false si no
   */
  meetsTarget(indicadorId, value) {
    const benchmark = this.getBenchmarkInfo(indicadorId);
    if (!benchmark) return false;

    const normalized = this.normalizeValue(indicadorId, value);
    // Se considera cumplimiento si alcanza 80% o más
    return normalized >= 0.8;
  }
}

// Exportar para uso en HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NISScorer;
}
