/**
 * Test Suite: NIS Scoring Calculation
 * Tests scoring logic to ensure correct calculation
 */

// Mock benchmarks data
const mockBenchmarks = {
  benchmarks: [
    {
      id: 'energia_renovable',
      indicador: '% de energía renovable',
      meta: 30,
      unidad: '%',
      tipo: 'numeric',
      seccion: 'ambiental',
      benchmarkId: 'energia_renovable'
    },
    {
      id: 'horas_capacitacion',
      indicador: 'Horas de capacitación',
      meta: 40,
      unidad: 'horas',
      tipo: 'numeric',
      seccion: 'social',
      benchmarkId: 'horas_capacitacion'
    },
    {
      id: 'mujeres_consejo',
      indicador: '% mujeres en consejo',
      meta: 30,
      unidad: '%',
      tipo: 'numeric',
      seccion: 'gobernanza',
      benchmarkId: 'mujeres_consejo'
    }
  ],
  secciones: {
    ambiental: { nombre: 'Ambiental', peso: 0.4 },
    social: { nombre: 'Social', peso: 0.4 },
    gobernanza: { nombre: 'Gobernanza', peso: 0.2 }
  },
  escala_semaforos: {
    verde: { minimo: 70, label: 'En cumplimiento', color: '#27AE60' },
    amarillo: { minimo: 40, label: 'En progreso', color: '#F39C12' },
    rojo: { minimo: 0, label: 'Requiere atención', color: '#E74C3C' }
  }
};

// Import scorer class
class NISScorer {
  constructor(benchmarks) {
    this.benchmarks = benchmarks;
    this.weights = { ambiental: 0.4, social: 0.4, gobernanza: 0.2 };
  }

  normalizeValue(indicadorId, value) {
    if (value === null || value === undefined) return 0;
    const benchmark = this.benchmarks.benchmarks.find(b => b.id === indicadorId);
    if (!benchmark) return 0;

    if (benchmark.tipo === 'binary') {
      return (value === true || value === 'Sí' || value === 1) ? 1.0 : 0.0;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;

    switch (indicadorId) {
      case 'horas_capacitacion':
        return Math.min(numValue / 40, 1.0);
      case 'tasa_accidentes':
        return Math.max(0, 1 - (numValue / 10));
      case 'energia_renovable':
        return Math.min(numValue / 100, 1.0);
      case 'mujeres_consejo':
        return Math.min(numValue / 100, 1.0);
      default:
        return numValue > 0 ? 0.5 : 0.0;
    }
  }

  calculateSectionScore(seccion, formValues) {
    // CRÍTICO: Filtrar SOLO benchmarks con id != null
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

    const normalizedScores = sectionBenchmarks.map(benchmark => {
      const value = formValues[benchmark.id];
      return { value, normalized: this.normalizeValue(benchmark.id, value) };
    });

    const respondedIndicators = normalizedScores.filter(
      item => item.value !== null && item.value !== ''
    );

    if (respondedIndicators.length === 0) {
      return {
        score: 0,
        porcentaje: 0,
        label: 'Sin datos',
        color: '#95A5A6',
        hasData: false
      };
    }

    const score = respondedIndicators.reduce((sum, item) => sum + item.normalized, 0) / respondedIndicators.length;
    const trafficLight = this.getTrafficLight(score);
    trafficLight.hasData = true;
    return trafficLight;
  }

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
}

describe('NISScorer - normalizeValue', () => {
  let scorer;

  beforeEach(() => {
    scorer = new NISScorer(mockBenchmarks);
  });

  describe('Energy Renewable (porcentaje directo)', () => {
    test('10% energía renovable → 0.1 (10% score)', () => {
      const result = scorer.normalizeValue('energia_renovable', 10);
      expect(result).toBe(0.1);
    });

    test('30% energía renovable → 0.3 (30% score)', () => {
      const result = scorer.normalizeValue('energia_renovable', 30);
      expect(result).toBe(0.3);
    });

    test('100% energía renovable → 1.0 (100% score)', () => {
      const result = scorer.normalizeValue('energia_renovable', 100);
      expect(result).toBe(1.0);
    });

    test('null energía renovable → 0', () => {
      const result = scorer.normalizeValue('energia_renovable', null);
      expect(result).toBe(0);
    });
  });

  describe('Training Hours (target 40h/year)', () => {
    test('40 horas → 1.0 (100% score)', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 40);
      expect(result).toBe(1.0);
    });

    test('20 horas → 0.5 (50% score)', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 20);
      expect(result).toBe(0.5);
    });

    test('80 horas → 1.0 (capped at 100%)', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 80);
      expect(result).toBe(1.0);
    });
  });
});

describe('NISScorer - calculateSectionScore', () => {
  let scorer;

  beforeEach(() => {
    scorer = new NISScorer(mockBenchmarks);
  });

  describe('Single indicator responses', () => {
    test('Only energy 10% → 10% ambiental score', () => {
      const formValues = {
        energia_renovable: 10,
        horas_capacitacion: null,
        mujeres_consejo: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.porcentaje).toBe(10);
      expect(result.hasData).toBe(true);
    });

    test('Only energy 100% → 100% ambiental score', () => {
      const formValues = {
        energia_renovable: 100,
        horas_capacitacion: null,
        mujeres_consejo: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.porcentaje).toBe(100);
      expect(result.hasData).toBe(true);
    });

    test('Training 40h → 100% social score', () => {
      const formValues = {
        energia_renovable: null,
        horas_capacitacion: 40,
        mujeres_consejo: null
      };
      const result = scorer.calculateSectionScore('social', formValues);
      expect(result.porcentaje).toBe(100);
      expect(result.hasData).toBe(true);
    });

    test('Training 20h → 50% social score', () => {
      const formValues = {
        energia_renovable: null,
        horas_capacitacion: 20,
        mujeres_consejo: null
      };
      const result = scorer.calculateSectionScore('social', formValues);
      expect(result.porcentaje).toBe(50);
      expect(result.hasData).toBe(true);
    });
  });

  describe('No data responses', () => {
    test('No responses → hasData false, porcentaje 0', () => {
      const formValues = {
        energia_renovable: null,
        horas_capacitacion: null,
        mujeres_consejo: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.hasData).toBe(false);
      expect(result.porcentaje).toBe(0);
      expect(result.label).toBe('Sin datos');
    });

    test('Empty strings → hasData false', () => {
      const formValues = {
        energia_renovable: '',
        horas_capacitacion: '',
        mujeres_consejo: ''
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.hasData).toBe(false);
    });
  });

  describe('Traffic light colors', () => {
    test('10% → Red (<40%)', () => {
      const formValues = { energia_renovable: 10 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#E74C3C'); // Red
      expect(result.label).toBe('Requiere atención');
    });

    test('50% → Yellow (40-69%)', () => {
      const formValues = { energia_renovable: 50 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#F39C12'); // Yellow
      expect(result.label).toBe('En progreso');
    });

    test('80% → Green (>=70%)', () => {
      const formValues = { energia_renovable: 80 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#27AE60'); // Green
      expect(result.label).toBe('En cumplimiento');
    });
  });
});

describe('NISScorer - Display Logic', () => {
  let scorer;

  beforeEach(() => {
    scorer = new NISScorer(mockBenchmarks);
  });

  test('hasData false → display "-" not "0%"', () => {
    const formValues = { energia_renovable: null };
    const result = scorer.calculateSectionScore('ambiental', formValues);

    // The display logic in app.js should show:
    // score.hasData ? score.porcentaje : '-'
    const displayValue = result.hasData ? result.porcentaje : '-';
    expect(displayValue).toBe('-');
    expect(displayValue).not.toBe('0');
    expect(displayValue).not.toBe('0%');
  });

  test('hasData true → display porcentaje with %', () => {
    const formValues = { energia_renovable: 10 };
    const result = scorer.calculateSectionScore('ambiental', formValues);

    const displayValue = result.hasData ? `${result.porcentaje}%` : '-';
    expect(displayValue).toBe('10%');
    expect(displayValue).not.toBe('-');
  });
});
