/**
 * Debug Test: Understand Benchmark Structure
 * Identifies which benchmarks exist in each section
 */

const NISScorer = require('../js/scoring.js');
const benchmarks = require('../data/benchmarks.json');

describe('Debug: Benchmark Structure', () => {
  let scorer;

  beforeEach(() => {
    scorer = new NISScorer(benchmarks);
  });

  test('List all benchmarks by section', () => {
    console.log('\n=== ALL BENCHMARKS ===');
    console.log(JSON.stringify(benchmarks.benchmarks, null, 2));

    const sections = ['ambiental', 'social', 'gobernanza'];
    sections.forEach(seccion => {
      const sectionBenchmarks = benchmarks.benchmarks.filter(
        b => b.seccion === seccion && b.id !== null
      );
      console.log(`\n${seccion}: ${sectionBenchmarks.length} benchmarks`);
      sectionBenchmarks.forEach(b => {
        console.log(`  - ${b.id}: ${b.indicador}`);
      });
    });
  });

  test('Test calculateSectionScore with debug logging', () => {
    const formValues = {
      energia_renovable: 10
    };

    console.log('\n=== DEBUG: energia_renovable = 10 ===');

    // Manually trace the calculation
    const sectionBenchmarks = benchmarks.benchmarks.filter(
      b => b.seccion === 'ambiental' && b.id !== null
    );

    console.log(`Ambiental benchmarks: ${sectionBenchmarks.length}`);
    sectionBenchmarks.forEach(b => {
      console.log(`  - ${b.id}`);
    });

    const normalizedScores = sectionBenchmarks.map(benchmark => {
      const value = formValues[benchmark.id];
      const normalized = scorer.normalizeValue(benchmark.id, value);
      console.log(`  normalizeValue('${benchmark.id}', ${value}) = ${normalized}`);
      return { value, normalized };
    });

    const respondedIndicators = normalizedScores.filter(
      item => item.value !== null && item.value !== ''
    );

    console.log(`Responded indicators: ${respondedIndicators.length}`);
    respondedIndicators.forEach((item, i) => {
      console.log(`  [${i}] value=${item.value}, normalized=${item.normalized}`);
    });

    const score = respondedIndicators.reduce((sum, item) => sum + item.normalized, 0) / respondedIndicators.length;
    console.log(`Average score: ${respondedIndicators.reduce((sum, item) => sum + item.normalized, 0)} / ${respondedIndicators.length} = ${score}`);
    console.log(`Porcentaje: ${Math.round(score * 100)}`);

    // Compare with actual function
    const result = scorer.calculateSectionScore('ambiental', formValues);
    console.log(`\nActual result: porcentaje=${result.porcentaje}, hasData=${result.hasData}`);
  });
});
