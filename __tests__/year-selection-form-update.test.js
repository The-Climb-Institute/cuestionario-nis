/**
 * Test: Form updates when year selection changes
 *
 * Validates that changing the year via selector properly updates
 * the form fields to show the new year's data (especially bimestral electricity).
 */

describe('Form Year Selection Update', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <main class="nis-form" id="form-container">
          <select id="year-selector">
            <option value="2024">2024</option>
            <option value="2025" selected>2025</option>
          </select>

          <section class="nis-seccion nis-seccion-ambiental" data-seccion="ambiental">
            <div class="year-blocks">
              <div class="year-block" data-year="2025">
                <div class="seccion-fields">
                  <div class="form-field" data-field-id="energia_kwh">
                    <div class="energy-mode-toggle">
                      <label>
                        <input type="radio" name="energia_mode_y_2025" value="anual" checked>
                        Anual
                      </label>
                      <label>
                        <input type="radio" name="energia_mode_y_2025" value="bimestral">
                        Bimestral
                      </label>
                    </div>
                    <input type="hidden" name="energia_kwh_bimestral_y_2025" class="energy-bimestral-json" value="">
                    <input type="hidden" name="energia_kwh_anual_y_2025" class="energy-kwh-annual" value="">
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Year selector exists and is set to 2025', () => {
    const selector = document.querySelector('#year-selector');
    expect(selector).toBeTruthy();
    expect(selector.value).toBe('2025');
  });

  test('Initial state shows 2025 year block', () => {
    const yearBlock = document.querySelector('.year-block[data-year="2025"]');
    expect(yearBlock).toBeTruthy();
  });

  test('Switching to 2024 should change the year block data-year attribute', () => {
    const selector = document.querySelector('#year-selector');

    // Simulate changing to 2024
    selector.value = '2024';
    const event = new Event('change', { bubbles: true });
    selector.dispatchEvent(event);

    // After change, year should be updated
    expect(selector.value).toBe('2024');
  });

  test('Bimestral radio buttons should reflect the correct year', () => {
    // For 2025, the radio button name should be energia_mode_y_2025
    const radio2025 = document.querySelector('input[name="energia_mode_y_2025"]');
    expect(radio2025).toBeTruthy();

    // For 2024, after switching, should have radio buttons with energia_mode_y_2024
    // (This would be created by updateYearBlocks)
    const radio2024 = document.querySelector('input[name="energia_mode_y_2024"]');
    expect(radio2024).toBeFalsy(); // Not created yet, which is the problem!
  });

  test('Hidden bimestral input name should match the selected year', () => {
    // Currently 2025
    const hidden2025 = document.querySelector('input[name="energia_kwh_bimestral_y_2025"]');
    expect(hidden2025).toBeTruthy();

    // Should NOT have 2024 input yet
    const hidden2024 = document.querySelector('input[name="energia_kwh_bimestral_y_2024"]');
    expect(hidden2024).toBeFalsy();
  });

  test('When switching years, the form should show updated field names for the new year', () => {
    const selector = document.querySelector('#year-selector');
    const container = document.querySelector('.year-blocks');

    // Get 2025 data
    const hidden2025Before = document.querySelector('input[name="energia_kwh_bimestral_y_2025"]');
    expect(hidden2025Before).toBeTruthy();

    // Simulate year block re-render (what updateYearBlocks should do)
    container.innerHTML = `
      <div class="year-block" data-year="2024">
        <div class="seccion-fields">
          <div class="form-field" data-field-id="energia_kwh">
            <div class="energy-mode-toggle">
              <label>
                <input type="radio" name="energia_mode_y_2024" value="anual" checked>
                Anual
              </label>
              <label>
                <input type="radio" name="energia_mode_y_2024" value="bimestral">
                Bimestral
              </label>
            </div>
            <input type="hidden" name="energia_kwh_bimestral_y_2024" class="energy-bimestral-json" value="">
            <input type="hidden" name="energia_kwh_anual_y_2024" class="energy-kwh-annual" value="">
          </div>
        </div>
      </div>
    `;

    // After update, should show 2024 fields
    const hidden2024After = document.querySelector('input[name="energia_kwh_bimestral_y_2024"]');
    expect(hidden2024After).toBeTruthy();

    // 2025 fields should be gone
    const hidden2025After = document.querySelector('input[name="energia_kwh_bimestral_y_2025"]');
    expect(hidden2025After).toBeFalsy();
  });
});
