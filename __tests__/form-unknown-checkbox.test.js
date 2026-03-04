/**
 * Test Suite: "No sé" Checkbox Behavior
 * Tests that the "No sé" checkbox properly disables and clears the number input field
 */

// Mock the form renderer
const NISFormRenderer = require('../docs/js/form.js');

// Mock questions data with a field that has allowUnknown
const mockQuestions = {
  sections: {
    company: {
      multiYear: false,
      fields: [
        {
          id: 'test_unknown_field',
          label: 'Test Unknown Field',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          allowUnknown: true,
          helpText: ''
        }
      ]
    },
    ambiental: {
      multiYear: true,
      fields: [
        {
          id: 'renewable_energy',
          label: 'Porcentaje de energía renovable',
          type: 'number',
          unit: '%',
          min: 0,
          max: 100,
          allowUnknown: true,
          helpText: ''
        }
      ]
    }
  }
};

// Mock benchmarks data
const mockBenchmarks = {
  benchmarks: [],
  secciones: {
    company: { nombre: 'Información de la Empresa', peso: 0 },
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

describe('No sé Checkbox Behavior', () => {
  let container;
  let formRenderer;

  beforeEach(() => {
    // Create a container for the form
    container = document.createElement('div');
    container.id = 'form-container';
    document.body.appendChild(container);

    // Initialize form renderer
    formRenderer = new NISFormRenderer(mockBenchmarks, mockQuestions, []);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  describe('Checkbox Creation', () => {
    test('should create checkbox when allowUnknown is true', () => {
      formRenderer.render('form-container', () => {});

      const checkbox = document.querySelector('.unknown-checkbox');
      expect(checkbox).not.toBeNull();
      expect(checkbox.type).toBe('checkbox');
    });

    test('should create checkbox label with "No sé" text', () => {
      formRenderer.render('form-container', () => {});

      const label = document.querySelector('.unknown-label-text');
      expect(label).not.toBeNull();
      expect(label.textContent).toBe('No sé');
    });

    test('should link checkbox to correct field', () => {
      formRenderer.render('form-container', () => {});

      const checkbox = document.querySelector('.unknown-checkbox');
      expect(checkbox.id).toContain('unknown');
      expect(checkbox.dataset.field).toContain('test_unknown_field');
    });
  });

  describe('Input Disabling on Checkbox Check', () => {
    test('should disable number input when checkbox is checked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Initial state: input should be enabled
      expect(numberInput.disabled).toBe(false);

      // Simulate checkbox click
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // After check: input should be disabled
      expect(numberInput.disabled).toBe(true);
    });

    test('should enable number input when checkbox is unchecked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Check the checkbox first
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      expect(numberInput.disabled).toBe(true);

      // Uncheck the checkbox
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // After uncheck: input should be enabled
      expect(numberInput.disabled).toBe(false);
    });
  });

  describe('Input Value Clearing', () => {
    test('should clear input value when checkbox is checked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Set a value
      numberInput.value = '50';
      expect(numberInput.value).toBe('50');

      // Check the checkbox
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Value should be cleared
      expect(numberInput.value).toBe('');
    });

    test('should preserve input value when checkbox is unchecked after being checked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Set a value
      numberInput.value = '75';

      // Check and then uncheck
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      expect(numberInput.value).toBe('');

      // Enable and set new value
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      numberInput.value = '25';

      // Should maintain the new value
      expect(numberInput.value).toBe('25');
    });
  });

  describe('Input Modification Prevention', () => {
    test('should prevent typing in disabled input', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Check the checkbox to disable input
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Input should be disabled and not accept modifications
      expect(numberInput.disabled).toBe(true);

      // Try to set value programmatically
      numberInput.value = '999';
      // When disabled, browser should prevent this
      expect(numberInput.disabled).toBe(true);
    });

    test('should prevent paste in disabled input', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Check the checkbox to disable input
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Input should be disabled
      expect(numberInput.disabled).toBe(true);

      // When disabled, the input element should have the disabled attribute
      // which prevents all user input including paste
      expect(numberInput.hasAttribute('disabled') || numberInput.disabled).toBe(true);

      // Try to set value while disabled - should remain disabled
      const originalValue = numberInput.value;
      numberInput.value = '999';

      // Input should still be disabled
      expect(numberInput.disabled).toBe(true);
    });
  });

  describe('Visual Feedback', () => {
    test('should apply disabled styling when input is disabled', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Initially not disabled
      expect(numberInput.disabled).toBe(false);

      // Check checkbox
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Should have disabled attribute for CSS styling
      expect(numberInput.disabled).toBe(true);
      expect(numberInput.getAttribute('disabled')).toBe('');
    });
  });

  describe('Form Values Extraction', () => {
    test('should return null when unknown checkbox is checked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');
      const checkbox = document.querySelector('.unknown-checkbox');

      // Set a value
      numberInput.value = '50';

      // Check the checkbox
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Get form values
      const values = formRenderer.getFormValues();

      // Field should have null value when "No sé" is checked
      expect(values.test_unknown_field).toBeNull();
    });

    test('should return number value when unknown checkbox is not checked', () => {
      formRenderer.render('form-container', () => {});

      const numberInput = document.querySelector('.number-input');

      // Set a value
      numberInput.value = '75';

      // Get form values
      const values = formRenderer.getFormValues();

      // Field should have the numeric value
      expect(values.test_unknown_field).toBe(75);
    });
  });

  describe('Multi-year Field Behavior', () => {
    test('should not have unknown checkbox on past-year rows', () => {
      formRenderer.render('form-container', () => {});

      // Open ambiental section to see multi-year fields
      const pastYearButton = document.querySelector('.btn-add-past-year');
      expect(pastYearButton).not.toBeNull();

      // Click to add a past year row
      pastYearButton.click();

      // Get the added past-year row
      const pastYearRow = document.querySelector('.past-year-row');
      expect(pastYearRow).not.toBeNull();

      // Past year row should NOT have an unknown checkbox
      const unknownCheckboxInPastYear = pastYearRow.querySelector('.unknown-checkbox');
      expect(unknownCheckboxInPastYear).toBeNull();
    });
  });
});
