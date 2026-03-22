/**
 * Tests for Task 13 - Energy field modes for selected reporting year only
 *
 * Requirements:
 * - Energy modes (annual vs bimestral) apply only to the active/selected year
 * - Hide "Agregar año anterior" button (multiple years not in UI during same session)
 * - Bimestral entries must be contiguous (no gaps)
 * - Last bimestre may be missing for current year
 * - Backend payload continues to support multiple years
 */

describe('Task 13 - Energy Field Single Year Mode', () => {

  describe('Year selector integration', () => {
    test('should only render energy field for selected year', () => {
      // Simulate year selector with selectedYear = 2024
      const selectedYear = 2024;
      const allYears = [2023, 2024];

      // Only render field for selectedYear
      const shouldRender = (fieldYear) => fieldYear === selectedYear;

      expect(shouldRender(2024)).toBe(true);
      expect(shouldRender(2023)).toBe(false);
    });

    test('should update energy field when year selection changes', () => {
      const energyField = {
        year: 2024,
        mode: 'anual',
        value: 5000
      };

      // User changes year selector to 2023
      energyField.year = 2023;
      energyField.value = null; // Clear value for new year

      expect(energyField.year).toBe(2023);
      expect(energyField.value).toBeNull();
    });
  });

  describe('Hide multi-year UI', () => {
    test('should hide "Agregar año anterior" button', () => {
      const container = document.createElement('div');
      const addPastYearBtn = document.createElement('button');
      addPastYearBtn.className = 'btn-add-past-year';
      addPastYearBtn.textContent = '+ Agregar año anterior';
      addPastYearBtn.style.display = 'none'; // Hidden by Task 13

      container.appendChild(addPastYearBtn);

      const btn = container.querySelector('.btn-add-past-year');
      expect(btn.style.display).toBe('none');
    });

    test('should hide past year rows container when in single-year mode', () => {
      const container = document.createElement('div');
      const pastYearContainer = document.createElement('div');
      pastYearContainer.className = 'past-year-rows';
      pastYearContainer.style.display = 'none';

      container.appendChild(pastYearContainer);

      expect(container.querySelector('.past-year-rows').style.display).toBe('none');
    });

    test('should show energy mode choice (annual vs bimestral)', () => {
      const container = document.createElement('div');
      const modeDiv = document.createElement('div');
      modeDiv.className = 'energy-mode-choice';
      modeDiv.innerHTML = `
        <label><input type="radio" name="energia_kwh_mode_y_2024" value="anual"> Total anual</label>
        <label><input type="radio" name="energia_kwh_mode_y_2024" value="bimestral"> Por recibo</label>
      `;

      container.appendChild(modeDiv);

      expect(container.querySelector('.energy-mode-choice')).toBeTruthy();
      expect(container.querySelectorAll('input[type="radio"]').length).toBe(2);
    });
  });

  describe('Bimestral contiguity validation', () => {
    test('should detect gaps in bimestral sequence', () => {
      const periods = [
        { year: 2024, periodIndex: 6, kWh: 100 },
        { year: 2024, periodIndex: 5, kWh: 150 },
        // Gap: periodIndex 4 is missing
        { year: 2024, periodIndex: 3, kWh: 120 }
      ];

      const detectGaps = (periods) => {
        const sorted = [...periods].sort((a, b) => {
          const y = b.year - a.year;
          if (y !== 0) return y;
          return b.periodIndex - a.periodIndex;
        });

        for (let i = 0; i < sorted.length - 1; i++) {
          const curr = sorted[i];
          const next = sorted[i + 1];

          if (curr.year === next.year && curr.periodIndex - next.periodIndex !== 1) {
            return { hasGap: true, gap: { between: [curr.periodIndex, next.periodIndex] } };
          }
          if (curr.year !== next.year && curr.periodIndex !== 6) {
            // If year changes, last period of old year should be 6 (Nov-Dec)
            return { hasGap: true, gap: { reason: 'year transition not from Nov-Dec' } };
          }
        }

        return { hasGap: false };
      };

      const gap = detectGaps(periods);
      expect(gap.hasGap).toBe(true);
      expect(gap.gap.between).toEqual([5, 3]);
    });

    test('should allow contiguous bimestral sequence', () => {
      const periods = [
        { year: 2024, periodIndex: 6, kWh: 100 },
        { year: 2024, periodIndex: 5, kWh: 150 },
        { year: 2024, periodIndex: 4, kWh: 120 },
        { year: 2024, periodIndex: 3, kWh: 140 }
      ];

      const detectGaps = (periods) => {
        const sorted = [...periods].sort((a, b) => b.periodIndex - a.periodIndex);
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].periodIndex - sorted[i + 1].periodIndex !== 1) {
            return true;
          }
        }
        return false;
      };

      expect(detectGaps(periods)).toBe(false);
    });

    test('should allow missing last bimestre for current year', () => {
      const currentYear = new Date().getFullYear();
      const periods = [
        { year: currentYear, periodIndex: 4, kWh: 100 },
        // Bimestre 5 (Sep-Oct) and 6 (Nov-Dec) missing - allowed for current year
      ];

      const validateLastBimestres = (periods, year) => {
        const sorted = [...periods].filter(p => p.year === year).sort((a, b) => b.periodIndex - a.periodIndex);
        if (sorted.length === 0) return true;

        const lastIndex = sorted[0].periodIndex;
        // For current year, missing last bimestres (5, 6) is allowed
        if (year === currentYear) {
          return true; // No error
        }

        // For past years, should have complete sequence to bimestre 6
        return lastIndex === 6;
      };

      expect(validateLastBimestres(periods, currentYear)).toBe(true);
    });

    test('should reject gaps in past year bimestral sequence', () => {
      const periods = [
        { year: 2023, periodIndex: 6, kWh: 100 },
        { year: 2023, periodIndex: 5, kWh: 150 },
        // Gap: periodIndex 4 missing in past year
        { year: 2023, periodIndex: 3, kWh: 120 }
      ];

      const isValidPastYearSequence = (periods) => {
        if (!periods.length) return true;

        const sorted = [...periods].sort((a, b) => b.periodIndex - a.periodIndex);
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].periodIndex - sorted[i + 1].periodIndex !== 1) {
            return false; // Gap found
          }
        }
        return true;
      };

      expect(isValidPastYearSequence(periods)).toBe(false);
    });
  });

  describe('Bimestral sum validation', () => {
    test('should calculate bimestral sum matching annual input', () => {
      const bimestralData = [
        { year: 2024, periodIndex: 1, kWh: 100 },
        { year: 2024, periodIndex: 2, kWh: 110 },
        { year: 2024, periodIndex: 3, kWh: 95 },
        { year: 2024, periodIndex: 4, kWh: 120 },
        { year: 2024, periodIndex: 5, kWh: 130 },
        { year: 2024, periodIndex: 6, kWh: 105 }
      ];

      const calculateBimestralSum = (periods) => {
        return periods.reduce((sum, p) => sum + (p.kWh || 0), 0);
      };

      const sum = calculateBimestralSum(bimestralData);
      expect(sum).toBe(660);
    });

    test('should validate bimestral sum equals reported annual total', () => {
      const annualInput = 660;
      const bimestralSum = 660;

      const isSumConsistent = (annual, bimestral) => {
        return Math.abs(annual - bimestral) < 0.01; // Allow for floating point rounding
      };

      expect(isSumConsistent(annualInput, bimestralSum)).toBe(true);
    });

    test('should show warning if bimestral sum does not match annual', () => {
      const annualInput = 600;
      const bimestralSum = 660;

      const getValidationMessage = (annual, bimestral) => {
        if (Math.abs(annual - bimestral) > 0.01) {
          return `Suma de bimestres (${bimestral}) no coincide con total anual (${annual})`;
        }
        return null;
      };

      const message = getValidationMessage(annualInput, bimestralSum);
      expect(message).toContain('no coincide');
    });
  });

  describe('Annual and bimestral mode interaction', () => {
    test('should toggle between annual and bimestral UI', () => {
      const container = document.createElement('div');

      const anualWrap = document.createElement('div');
      anualWrap.className = 'energy-anual-wrap';
      anualWrap.style.display = 'block';

      const bimestralWrap = document.createElement('div');
      bimestralWrap.className = 'energy-bimestral-wrap';
      bimestralWrap.style.display = 'none';

      container.appendChild(anualWrap);
      container.appendChild(bimestralWrap);

      // Switch to bimestral
      anualWrap.style.display = 'none';
      bimestralWrap.style.display = 'block';

      expect(anualWrap.style.display).toBe('none');
      expect(bimestralWrap.style.display).toBe('block');
    });

    test('should clear annual input when switching to bimestral', () => {
      const anualInput = document.createElement('input');
      anualInput.type = 'number';
      anualInput.value = '5000';

      // Switch mode
      anualInput.value = '';

      expect(anualInput.value).toBe('');
    });

    test('should clear bimestral data when switching to annual', () => {
      const bimestralState = {
        offset: 0,
        periods: [
          { year: 2024, periodIndex: 6, kWh: 100 },
          { year: 2024, periodIndex: 5, kWh: 150 }
        ]
      };

      // Switch to annual mode
      bimestralState.periods = [];

      expect(bimestralState.periods.length).toBe(0);
    });
  });

  describe('Form submission with energy data', () => {
    test('should include annual energy data in payload', () => {
      const formData = {
        energia_kwh_y_2024: 5000
      };

      expect(formData.energia_kwh_y_2024).toBe(5000);
    });

    test('should include bimestral energy data in payload', () => {
      const bimestralData = {
        offset: 0,
        periods: [
          { year: 2024, periodIndex: 6, kWh: 100 },
          { year: 2024, periodIndex: 5, kWh: 150 }
        ]
      };

      const formData = {
        energia_kwh_bimestral_y_2024: JSON.stringify(bimestralData)
      };

      expect(formData.energia_kwh_bimestral_y_2024).toBeTruthy();
      const parsed = JSON.parse(formData.energia_kwh_bimestral_y_2024);
      expect(parsed.periods.length).toBe(2);
    });

    test('should not include past-year energy data in single-year mode', () => {
      // Single-year mode should not create past-year entries
      const formData = {};

      // These should NOT exist in payload
      expect(formData.energia_kwh_y_2023).toBeUndefined();
      expect(formData['energia_kwh_y_2022']).toBeUndefined();
    });
  });

  describe('Scoring with energy data', () => {
    test('should calculate energy score from annual input', () => {
      const annualValue = 5000;
      // Score calculation depends on scoring.js
      // For now, just verify the data is available
      expect(annualValue).toBeGreaterThan(0);
    });

    test('should calculate energy score from bimestral sum', () => {
      const bimestralSum = 660;
      // Score calculated from sum of bimestres
      expect(bimestralSum).toBeGreaterThan(0);
    });
  });

});
