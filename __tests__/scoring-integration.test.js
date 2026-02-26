/**
 * Integration Test: NIS Scoring with Real Code
 * Tests the actual NISScorer class from js/scoring.js with real benchmarks.json
 */

const NISScorer = require('../js/scoring.js');
const benchmarks = require('../data/benchmarks.json');

describe('NISScorer - Integration Tests with Real Benchmarks', () => {
  let scorer;

  beforeEach(() => {
    scorer = new NISScorer(benchmarks);
  });

  describe('normalizeValue with Real Benchmarks', () => {
    test('10% energía renovable → 0.1 normalized', () => {
      const result = scorer.normalizeValue('energia_renovable', 10);
      expect(result).toBe(0.1);
    });

    test('100% energía renovable → 1.0 normalized', () => {
      const result = scorer.normalizeValue('energia_renovable', 100);
      expect(result).toBe(1.0);
    });

    test('50 horas de capacitación → 1.0 (capped)', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 50);
      expect(result).toBe(1.0);
    });

    test('40 horas de capacitación → 1.0', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 40);
      expect(result).toBe(1.0);
    });

    test('20 horas de capacitación → 0.5', () => {
      const result = scorer.normalizeValue('horas_capacitacion', 20);
      expect(result).toBe(0.5);
    });

    test('null value → 0', () => {
      const result = scorer.normalizeValue('energia_renovable', null);
      expect(result).toBe(0);
    });

    test('Binary field "Sí" → 1.0 (mide_alcance3)', () => {
      const result = scorer.normalizeValue('mide_alcance3', 'Sí');
      expect(result).toBe(1.0);
    });

    test('Binary field "No" → 0.0 (mide_alcance3)', () => {
      const result = scorer.normalizeValue('mide_alcance3', 'No');
      expect(result).toBe(0.0);
    });

    test('Binary field "Sí" → 1.0 (reutiliza_agua)', () => {
      const result = scorer.normalizeValue('reutiliza_agua', 'Sí');
      expect(result).toBe(1.0);
    });

    test('Binary field "Sí" → 1.0 (organo_vigilancia)', () => {
      const result = scorer.normalizeValue('organo_vigilancia', 'Sí');
      expect(result).toBe(1.0);
    });
  });

  describe('calculateSectionScore - Ambiental', () => {
    test('Single indicator: 10% energy → 10% ambiental score', () => {
      const formValues = {
        energia_renovable: 10,
        agua_descargada_tratada: null,
        residuos_reciclados: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.porcentaje).toBe(10);
      expect(result.hasData).toBe(true);
    });

    test('Single indicator: 100% energy → 100% ambiental score', () => {
      const formValues = {
        energia_renovable: 100,
        agua_descargada_tratada: null,
        residuos_reciclados: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.porcentaje).toBe(100);
      expect(result.hasData).toBe(true);
    });

    test('Two indicators: energy 10% + water 80% → average 45% ambiental', () => {
      const formValues = {
        energia_renovable: 10,
        agua_descargada_tratada: 80,
        residuos_reciclados: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.porcentaje).toBe(45);
      expect(result.hasData).toBe(true);
    });

    test('No data → hasData false, porcentaje 0', () => {
      const formValues = {
        energia_renovable: null,
        agua_descargada_tratada: null,
        residuos_reciclados: null
      };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.hasData).toBe(false);
      expect(result.porcentaje).toBe(0);
      expect(result.label).toBe('Sin datos');
    });
  });

  describe('calculateSectionScore - Social', () => {
    test('Single indicator: 40h training → 100% social score', () => {
      const formValues = {
        horas_capacitacion: 40,
        evaluacion_formal_desempeno: null,
        tasa_accidentes: null,
        politicas_igualdad: null
      };
      const result = scorer.calculateSectionScore('social', formValues);
      expect(result.porcentaje).toBe(100);
      expect(result.hasData).toBe(true);
    });

    test('Single indicator: 20h training → 50% social score', () => {
      const formValues = {
        horas_capacitacion: 20,
        evaluacion_formal_desempeno: null,
        tasa_accidentes: null,
        politicas_igualdad: null
      };
      const result = scorer.calculateSectionScore('social', formValues);
      expect(result.porcentaje).toBe(50);
      expect(result.hasData).toBe(true);
    });
  });

  describe('Traffic Light Colors', () => {
    test('10% → Red (<40%)', () => {
      const formValues = { energia_renovable: 10 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#E74C3C');
      expect(result.label).toBe('Requiere atención');
    });

    test('50% → Yellow (40-69%)', () => {
      const formValues = { energia_renovable: 50 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#F39C12');
      expect(result.label).toBe('En progreso');
    });

    test('80% → Green (>=70%)', () => {
      const formValues = { energia_renovable: 80 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.color).toBe('#27AE60');
      expect(result.label).toBe('En cumplimiento');
    });
  });

  describe('Display Logic - hasData Flag', () => {
    test('hasData false → should display "-" not "0%"', () => {
      const formValues = { energia_renovable: null };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.hasData).toBe(false);
      expect(result.porcentaje).toBe(0);

      // Display logic: hasData ? porcentaje : '-'
      const displayValue = result.hasData ? result.porcentaje : '-';
      expect(displayValue).toBe('-');
    });

    test('hasData true → should display porcentaje', () => {
      const formValues = { energia_renovable: 10 };
      const result = scorer.calculateSectionScore('ambiental', formValues);
      expect(result.hasData).toBe(true);

      // Display logic
      const displayValue = result.hasData ? `${result.porcentaje}%` : '-';
      expect(displayValue).toBe('10%');
    });
  });

  describe('Total Weighted Score', () => {
    test('All green (80% each section) → ~80% total', () => {
      const formValues = {
        // Ambiental (40% weight) - 80%
        energia_renovable: 80,
        agua_descargada_tratada: 80,
        residuos_reciclados: 80,
        // Social (40% weight) - 80%
        horas_capacitacion: 32, // 32/40 = 0.8 = 80%
        evaluacion_formal_desempeno: 80,
        tasa_accidentes: null,
        politicas_igualdad: null,
        // Gobernanza (20% weight) - 80%
        sistema_gestion_riesgos: 'Sí',
        canal_denuncias: 'Sí',
        codigo_etica: 'Sí',
        politicas_datos: 'Sí',
        mujeres_consejo: 80
      };
      const result = scorer.calculateTotalScore(formValues);
      expect(result.hasData).toBe(true);
      expect(result.porcentaje).toBeGreaterThan(70);
      expect(result.color).toBe('#27AE60');
    });

    test('No data in any section → hasData false', () => {
      const formValues = {};
      const result = scorer.calculateTotalScore(formValues);
      expect(result.hasData).toBe(false);
      expect(result.porcentaje).toBe(0);
    });

    test('Only Ambiental answered (100%) → 100% total (weight redistribution)', () => {
      const formValues = {
        energia_renovable: 100,
        agua_descargada_tratada: null,
        residuos_reciclados: null
      };
      const result = scorer.calculateTotalScore(formValues);
      expect(result.hasData).toBe(true);
      expect(result.porcentaje).toBe(100);
      expect(result.color).toBe('#27AE60');
    });

    test('Only Ambiental answered (50%) → 50% total (weight redistribution)', () => {
      const formValues = {
        energia_renovable: 50,
        agua_descargada_tratada: null,
        residuos_reciclados: null
      };
      const result = scorer.calculateTotalScore(formValues);
      expect(result.hasData).toBe(true);
      expect(result.porcentaje).toBe(50);
      expect(result.color).toBe('#F39C12');
    });

    test('Ambiental (100%) + Social (60%) → weighted average with redistributed weights', () => {
      const formValues = {
        // Ambiental 100%
        energia_renovable: 100,
        agua_descargada_tratada: null,
        residuos_reciclados: null,
        // Social 60%
        horas_capacitacion: 24, // 24/40 = 0.6 = 60%
        evaluacion_formal_desempeno: null,
        tasa_accidentes: null,
        politicas_igualdad: null
      };
      const result = scorer.calculateTotalScore(formValues);
      expect(result.hasData).toBe(true);
      // Weights redistributed: Ambiental 0.4/(0.4+0.4) = 0.5, Social 0.4/(0.4+0.4) = 0.5
      // Total = (1.0 * 0.5) + (0.6 * 0.5) = 0.5 + 0.3 = 0.8 = 80%
      expect(result.porcentaje).toBe(80);
      expect(result.color).toBe('#27AE60');
    });
  });

  describe('Real Benchmark Field IDs', () => {
    test('All 17 benchmark IDs should exist and be accessible', () => {
      const expectedBenchmarks = [
        'horas_capacitacion',
        'tasa_accidentes',
        'evaluacion_formal_desempeno',
        'politicas_igualdad',
        'energia_renovable',
        'agua_descargada_tratada',
        'residuos_reciclados',
        'residuos_peligrosos',
        'mujeres_consejo',
        'sistema_gestion_riesgos',
        'estrategia_sostenibilidad',
        'codigo_etica',
        'politicas_datos',
        'canal_denuncias',
        'mide_alcance3',
        'reutiliza_agua',
        'organo_vigilancia'
      ];

      expectedBenchmarks.forEach(id => {
        const benchmark = benchmarks.benchmarks.find(b => b.id === id);
        expect(benchmark).toBeDefined();
        expect(benchmark.id).toBe(id);
        expect(benchmark.seccion).toBeDefined();
        expect(benchmark.meta).toBeDefined();
      });
    });
  });
});
