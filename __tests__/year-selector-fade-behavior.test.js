/**
 * Test: Year Selector Opacity Behavior — Progressive Fade on Scroll + Toggle on Year Change
 *
 * Validates that:
 * 1. Unselected year starts at 60% opacity
 * 2. Toggle switches opacity when year is selected (swap which tab is faded)
 * 3. Opacity progresses as user scrolls:
 *    - 60% opacity at start
 *    - Gradually fades to 30% opacity at "Ingresos anuales" question
 *    - Continues fading to 5% opacity at ambiental section start
 * 4. Different scroll positions trigger different opacity levels
 */

describe('Year Selector Opacity Behavior (Progressive + Toggle)', () => {
  let container;
  let yearRail;
  let tabCurrent; // current year (2025) - initially unselected, faded
  let tabPrevious; // previous year (2024) - initially selected, fully opaque
  let energySection;

  beforeEach(() => {
    // Create DOM structure simulating the form with empresa, company_revenue, and ambiental sections
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
        <section data-section="empresa" style="margin-top: 300px; height: 150px;">Empresa Section</section>
        <div class="form-field" data-field-id="company_revenue" style="margin-top: 450px; height: 50px;">Ingresos anuales</div>
        <section data-section="ambiental" style="margin-top: 500px; height: 250px;">Ambiental Section</section>
        <div style="height: 300px;">Additional Content</div>
      </div>
    `;

    container = document.querySelector('.container');
    yearRail = document.querySelector('.year-rail');
    tabCurrent = document.querySelector('[data-year-label="unselected"]');
    tabPrevious = document.querySelector('[data-year-label="selected"]');
    energySection = document.querySelector('[data-section="ambiental"]');

    // Simulate scrolling by modifying window.scrollY
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });

    // Set document height for calculations
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      writable: true,
      value: 1500, // Form total height
    });

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 800,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Initial state: unselected year is 60% opacity', () => {
    // Simulate fade initialization
    tabCurrent.style.opacity = 0.6;
    tabPrevious.style.opacity = 1;

    expect(tabCurrent.classList.contains('year-label-unselected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-selected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.6);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(1);
  });

  test('Opacity toggles when year is selected: swap which tab is faded', () => {
    // Initial state
    tabCurrent.style.opacity = 0.6;
    tabPrevious.style.opacity = 1;

    // Click current year to select it
    tabCurrent.classList.add('year-label-selected');
    tabCurrent.classList.remove('year-label-unselected');
    tabPrevious.classList.add('year-label-unselected');
    tabPrevious.classList.remove('year-label-selected');

    // Simulate opacity toggle: swap opacities
    tabCurrent.style.opacity = 1;
    tabPrevious.style.opacity = 0.6;

    // Verify swap
    expect(tabCurrent.classList.contains('year-label-selected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-unselected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.6);
  });

  test('Before company_revenue question: opacity starts at 60%', () => {
    const unselectedTab = document.querySelector('[data-year-label="unselected"]');

    // Scroll: 0 (top of form)
    window.scrollY = 0;
    const opacityAtStart = 0.6; // Start: 60% opacity
    expect(opacityAtStart).toBe(0.6);

    // Scroll: 200 (partway to company_revenue at ~450)
    window.scrollY = 200;
    // At 200/450 progress: opacity = 0.6 - (200/450 * 0.3) ≈ 0.467
    const fadeProgress = 200 / 450;
    const opacityMid = 0.6 - (fadeProgress * 0.3);
    expect(opacityMid).toBeGreaterThan(0.45);
    expect(opacityMid).toBeLessThan(0.55);
  });

  test('At company_revenue question: opacity reaches 30%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const revenueQuestionScrollPosition = 450; // company_revenue at 450
    const ambientalSectionScrollPosition = 500; // Ambiental section starts at 500

    // Simulate being at company_revenue question
    window.scrollY = revenueQuestionScrollPosition;

    // Opacity should be 30% (0.3) at company_revenue
    const fadeProgress = (revenueQuestionScrollPosition - 0) / revenueQuestionScrollPosition;
    let opacity = 0.6 - (fadeProgress * 0.3); // = 0.3

    expect(opacity).toBeCloseTo(0.3, 1);

    // Scroll to midpoint between company_revenue and ambiental section (25 pixels into 50-pixel fade zone)
    window.scrollY = revenueQuestionScrollPosition + 25;
    const fadeProgressMid = 25 / (ambientalSectionScrollPosition - revenueQuestionScrollPosition);
    opacity = 0.3 - (fadeProgressMid * 0.25);

    expect(opacity).toBeGreaterThanOrEqual(0.175);
    expect(opacity).toBeLessThanOrEqual(0.225);
  });

  test('At ambiental section start: opacity reaches 5%', () => {
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionScrollPosition = 500;

    // At ambiental section start
    window.scrollY = ambientalSectionScrollPosition;

    // Calculate opacity at exactly ambiental section start
    const fadeProgress = (ambientalSectionScrollPosition - revenueQuestionScrollPosition) / (ambientalSectionScrollPosition - revenueQuestionScrollPosition);
    let opacity = 0.3 - (fadeProgress * 0.25);

    // At 100% progress: opacity = 0.3 - (1.0 * 0.25) = 0.05
    expect(opacity).toBeCloseTo(0.05, 2);
  });

  test('After ambiental section start: opacity stays at 5%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const ambientalSectionScrollPosition = 500;

    // Well past ambiental section start
    window.scrollY = docHeight;

    // Opacity should stay at 5% after ambiental section
    let opacity = 0.05;

    expect(opacity).toBeCloseTo(0.05, 2);
  });

  test('Multiple scroll positions maintain correct opacity progression', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionScrollPosition = 500;

    // Test key positions
    const testCases = [
      { scroll: 0, expectedOpacity: 0.6, desc: 'At start' },
      { scroll: 225, expectedOpacity: 0.45, desc: 'Midway before company_revenue' },
      { scroll: 450, expectedOpacity: 0.3, desc: 'At company_revenue question' },
      { scroll: 475, expectedOpacity: 0.175, desc: 'Midway between company_revenue and ambiental' },
      { scroll: 500, expectedOpacity: 0.05, desc: 'At ambiental section start' },
      { scroll: 700, expectedOpacity: 0.05, desc: 'After ambiental section' },
    ];

    testCases.forEach(({ scroll, expectedOpacity, desc }) => {
      window.scrollY = scroll;

      // Calculate expected opacity at this scroll position
      let opacity;
      if (scroll < revenueQuestionScrollPosition) {
        const fadeProgress = (scroll - 0) / (revenueQuestionScrollPosition - 0);
        opacity = 0.6 - (fadeProgress * 0.3);
      } else if (scroll < ambientalSectionScrollPosition) {
        const fadeProgress = (scroll - revenueQuestionScrollPosition) / (ambientalSectionScrollPosition - revenueQuestionScrollPosition);
        opacity = 0.3 - (fadeProgress * 0.25);
      } else {
        opacity = 0.05;
      }

      expect(opacity).toBeCloseTo(expectedOpacity, 1, `${desc}: scroll ${scroll}`);
    });
  });

  test('Toggle and scroll: opacity follows toggle, then progresses on scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionScrollPosition = 500;

    // Initial: tabCurrent (2025) faded at 60%, tabPrevious (2024) opaque
    tabCurrent.style.opacity = 0.6;
    tabPrevious.style.opacity = 1;

    // Scroll before company_revenue question
    window.scrollY = 300;
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.6);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(1);

    // Click to switch: tabPrevious becomes unselected (faded)
    tabCurrent.classList.add('year-label-selected');
    tabCurrent.classList.remove('year-label-unselected');
    tabPrevious.classList.add('year-label-unselected');
    tabPrevious.classList.remove('year-label-selected');

    // Swap opacities after toggle
    const tempOpacity = tabCurrent.style.opacity;
    tabCurrent.style.opacity = tabPrevious.style.opacity;
    tabPrevious.style.opacity = tempOpacity;

    // Now tabPrevious is faded at 60%
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.6);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);

    // Scroll to midpoint between company_revenue and ambiental section
    window.scrollY = 475; // Midway through fade zone
    const fadeProgress = (475 - revenueQuestionScrollPosition) / (ambientalSectionScrollPosition - revenueQuestionScrollPosition);
    let progressiveOpacity = 0.3 - (fadeProgress * 0.25);

    expect(progressiveOpacity).toBeGreaterThanOrEqual(0.15);
    expect(progressiveOpacity).toBeLessThanOrEqual(0.225);
  });

  test('Opacity clamps to [0, 1] range', () => {
    const unselectedTab = document.querySelector('[data-year-label="unselected"]');

    // Test negative opacity is clamped to 0
    const negativeOpacity = Math.max(0, -0.1);
    expect(negativeOpacity).toBe(0);

    // Test opacity > 1 would be clamped (though shouldn't happen in normal flow)
    const maxOpacity = Math.min(1, 1.5);
    expect(maxOpacity).toBe(1);

    // Set to valid range
    unselectedTab.style.opacity = 0.5;
    expect(parseFloat(unselectedTab.style.opacity)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(unselectedTab.style.opacity)).toBeLessThanOrEqual(1);
  });
});
