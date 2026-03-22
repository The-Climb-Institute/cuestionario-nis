/**
 * Regression: bimestral row labels must use calendar year when offset rotates the label
 * (see documentation/planning/bugs/BUG-bimestral-offset-year-label.md).
 */

const {
  getBimestralDisplayCalendar,
  periodIndexToBimonth
} = require('../docs/js/form.js');

describe('getBimestralDisplayCalendar', () => {
  test('matches periodIndexToBimonth for all slots and offsets', () => {
    for (let year = 2024; year <= 2027; year++) {
      for (let periodIndex = 1; periodIndex <= 6; periodIndex++) {
        for (let offset = 0; offset < 6; offset++) {
          const { bimonth } = getBimestralDisplayCalendar(year, periodIndex, offset);
          const expectedB = periodIndexToBimonth(periodIndex, offset);
          expect(bimonth).toBe(expectedB);
        }
      }
    }
  });

  test('Nov-Dic for first slot of 2026 with offset 5 is year 2025 (user-reported case)', () => {
    const { year, bimonth } = getBimestralDisplayCalendar(2026, 1, 5);
    expect(bimonth).toBe(6);
    expect(year).toBe(2025);
  });

  test('offset 0 keeps same calendar year as slot', () => {
    const { year, bimonth } = getBimestralDisplayCalendar(2025, 6, 0);
    expect(year).toBe(2025);
    expect(bimonth).toBe(6);
  });
});
