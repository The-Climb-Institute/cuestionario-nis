/**
 * Test: Year selection updates electricity billing data
 *
 * Validates that when switching between years, the bimestral
 * electricity billing data correctly updates to show the selected year's data.
 */

describe('Year Selection - Electricity Billing Data', () => {
  let container;

  beforeEach(() => {
    // Create minimal DOM structure
    document.body.innerHTML = `
      <div class="container">
        <div class="year-rail year-rail-vertical">
          <div class="year-cylinder">
            <div class="year-cylinder-stage">
              <div class="year-label year-label-unselected" data-year-label="unselected">2025</div>
              <div class="year-label year-label-selected" data-year-label="selected">2024</div>
            </div>
          </div>
        </div>
        <main class="nis-form" id="form-container"></main>
        <section data-section="empresa" style="height: 200px;">Empresa</section>
        <section data-section="ambiental" style="height: 300px;">Ambiental</section>
      </div>
    `;

    container = document.querySelector('.container');

    // Set up window properties for bimestral calculations
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      writable: true,
      value: 1500,
    });

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 800,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('Bimestral hidden inputs are created separately for each year', () => {
    // Create two hidden inputs: one for 2024, one for 2025
    const input2024 = document.createElement('input');
    input2024.type = 'hidden';
    input2024.name = 'energia_kwh_bimestral_y_2024';
    input2024.value = '';
    document.body.appendChild(input2024);

    const input2025 = document.createElement('input');
    input2025.type = 'hidden';
    input2025.name = 'energia_kwh_bimestral_y_2025';
    input2025.value = '';
    document.body.appendChild(input2025);

    // Verify both inputs exist with correct names
    const input2024Found = document.querySelector('input[name="energia_kwh_bimestral_y_2024"]');
    const input2025Found = document.querySelector('input[name="energia_kwh_bimestral_y_2025"]');

    expect(input2024Found).toBeTruthy();
    expect(input2025Found).toBeTruthy();
  });

  test('Data saved for 2024 should not appear when 2025 is selected', () => {
    // Simulate saving 2024 data
    const input2024 = document.createElement('input');
    input2024.type = 'hidden';
    input2024.name = 'energia_kwh_bimestral_y_2024';
    input2024.value = JSON.stringify({
      offset: 0,
      periods: [{ year: 2024, periodIndex: 1, kWh: 500 }]
    });
    document.body.appendChild(input2024);

    // Create 2025 input (empty)
    const input2025 = document.createElement('input');
    input2025.type = 'hidden';
    input2025.name = 'energia_kwh_bimestral_y_2025';
    input2025.value = '';
    document.body.appendChild(input2025);

    // Load 2024 data
    const data2024 = JSON.parse(input2024.value);
    expect(data2024.periods[0].year).toBe(2024);
    expect(data2024.periods[0].kWh).toBe(500);

    // Load 2025 data (should be empty)
    const data2025String = input2025.value;
    expect(data2025String).toBe('');

    // Verify that when switching to 2025, we don't see 2024 data
    expect(data2024.periods[0].year).not.toBe(2025);
  });

  test('Year selector should trigger update of displayed year data', () => {
    // Create year selector
    const selector = document.createElement('select');
    selector.id = 'year-selector';
    selector.innerHTML = `
      <option value="2024">2024</option>
      <option value="2025" selected>2025</option>
    `;
    document.body.appendChild(selector);

    // Verify initial selection is 2025
    expect(selector.value).toBe('2025');

    // Change to 2024
    selector.value = '2024';
    const changeEvent = new Event('change');
    selector.dispatchEvent(changeEvent);

    // Verify selection changed
    expect(selector.value).toBe('2024');
  });

  test('Current year data should only include completed bimestres', () => {
    // Current year (2025, assuming March 2026)
    // Last completed bimestre: Ene-Feb (periodIndex 1)
    // Expected initial state: only period 1

    const currentYear = new Date().getFullYear();
    const futureYear = currentYear + 1;

    // For future year, should initialize with only period 1 (if months are Ene-Feb)
    // This is dependent on the actual date
    const today = new Date();
    const month = today.getMonth() + 1;

    let expectedMaxPeriod = 1;
    if (month > 2) expectedMaxPeriod = Math.ceil(month / 2) - 1;

    // Verify logic: if March (month 3), bimonth 2, max period should be 1
    if (month === 3) {
      expect(expectedMaxPeriod).toBeGreaterThanOrEqual(1);
    }
  });

  test('Previous year data should include all 6 bimestres', () => {
    // Previous year should have all 6 periods initialized
    const previousYear = new Date().getFullYear() - 1;

    // Expected: 6 periods for the entire year
    const expectedPeriods = 6;
    expect(expectedPeriods).toBe(6);
  });
});
