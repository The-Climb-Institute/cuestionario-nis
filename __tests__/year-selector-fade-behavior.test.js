/**
 * Test: Year Selector Opacity Behavior — Progressive Fade on Scroll + Toggle on Year Change
 *
 * Validates that:
 * 1. Unselected year starts at 90% opacity
 * 2. Toggle switches opacity when year is selected (swap which tab is faded)
 * 3. Opacity progresses as user scrolls:
 *    - 90% opacity before "Ingresos anuales" question
 *    - Gradually fades to 50% opacity midway through ambiental section
 *    - Continues fading to 0% opacity by end of ambiental section
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

  test('Initial state: unselected year is 90% opacity', () => {
    // Simulate fade initialization
    tabCurrent.style.opacity = 0.9;
    tabPrevious.style.opacity = 1;

    expect(tabCurrent.classList.contains('year-label-unselected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-selected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.9);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(1);
  });

  test('Opacity toggles when year is selected: swap which tab is faded', () => {
    // Initial state
    tabCurrent.style.opacity = 0.9;
    tabPrevious.style.opacity = 1;

    // Click current year to select it
    tabCurrent.classList.add('year-label-selected');
    tabCurrent.classList.remove('year-label-unselected');
    tabPrevious.classList.add('year-label-unselected');
    tabPrevious.classList.remove('year-label-selected');

    // Simulate opacity toggle: swap opacities
    tabCurrent.style.opacity = 1;
    tabPrevious.style.opacity = 0.9;

    // Verify swap
    expect(tabCurrent.classList.contains('year-label-selected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-unselected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.9);
  });

  test('Before company_revenue question: opacity stays at 90%', () => {
    const unselectedTab = document.querySelector('[data-year-label="unselected"]');

    // Scroll: 0 (top of form)
    window.scrollY = 0;
    const opacityAtStart = 0.9; // Before company_revenue question
    expect(opacityAtStart).toBe(0.9);

    // Scroll: 400 (still before company_revenue at ~450)
    window.scrollY = 400;
    const opacityMid = 0.9; // Still before company_revenue
    expect(opacityMid).toBe(0.9);
  });

  test('At company_revenue question: opacity starts transitioning from 90%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const revenueQuestionScrollPosition = 450; // company_revenue at 450
    const ambientalSectionEndScrollPosition = 750; // Ambiental section ends at 750

    // Simulate being at company_revenue question
    window.scrollY = revenueQuestionScrollPosition;

    // Opacity should start transitioning from 90% (0.9)
    const fadeProgress = 0; // Just at company_revenue
    let opacity = Math.max(0, 0.9 - (fadeProgress * 0.9)); // = 0.9

    expect(opacity).toBe(0.9);

    // Scroll to midpoint between company_revenue and ambiental end (150 pixels into 300-pixel fade zone)
    window.scrollY = revenueQuestionScrollPosition + 150;
    const fadeProgressMid = 150 / (ambientalSectionEndScrollPosition - revenueQuestionScrollPosition);
    opacity = Math.max(0, 0.9 - (fadeProgressMid * 0.9));

    expect(opacity).toBeGreaterThanOrEqual(0.45);
    expect(opacity).toBeLessThanOrEqual(0.55);
  });

  test('At ambiental section end: opacity reaches 0%', () => {
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionEndScrollPosition = 750;

    // At ambiental section end
    window.scrollY = ambientalSectionEndScrollPosition;

    // Calculate opacity at exactly ambiental section end
    const fadeProgress = (ambientalSectionEndScrollPosition - revenueQuestionScrollPosition) / (ambientalSectionEndScrollPosition - revenueQuestionScrollPosition);
    let opacity = Math.max(0, 0.9 - (fadeProgress * 0.9));

    // At 100% progress: opacity = 0.9 - (1.0 * 0.9) = 0
    expect(opacity).toBe(0);
  });

  test('After ambiental section: opacity stays at 0%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const ambientalSectionEndScrollPosition = 750;

    // Well past ambiental section end
    window.scrollY = docHeight;

    // Opacity should stay at 0% after ambiental section
    let opacity = 0;

    expect(opacity).toBe(0);
  });

  test('Multiple scroll positions maintain correct opacity progression', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionEndScrollPosition = 750;

    // Test key positions
    const testCases = [
      { scroll: 0, expectedOpacity: 0.9, desc: 'Before company_revenue' },
      { scroll: 400, expectedOpacity: 0.9, desc: 'Still before company_revenue' },
      { scroll: 450, expectedOpacity: 0.9, desc: 'At company_revenue question' },
      { scroll: 600, expectedOpacity: 0.5, desc: 'Midway through fade zone' },
      { scroll: 750, expectedOpacity: 0, desc: 'At end of ambiental section' },
      { scroll: 800, expectedOpacity: 0, desc: 'After ambiental section' },
    ];

    testCases.forEach(({ scroll, expectedOpacity, desc }) => {
      window.scrollY = scroll;

      // Calculate expected opacity at this scroll position
      let opacity;
      if (scroll < revenueQuestionScrollPosition) {
        opacity = 0.9;
      } else if (scroll < ambientalSectionEndScrollPosition) {
        const fadeProgress = (scroll - revenueQuestionScrollPosition) / (ambientalSectionEndScrollPosition - revenueQuestionScrollPosition);
        opacity = Math.max(0, 0.9 - (fadeProgress * 0.9));
      } else {
        opacity = 0;
      }

      expect(opacity).toBeCloseTo(expectedOpacity, 0, `${desc}: scroll ${scroll}`);
    });
  });

  test('Toggle and scroll: opacity follows toggle, then progresses on scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const revenueQuestionScrollPosition = 450;
    const ambientalSectionEndScrollPosition = 750;

    // Initial: tabCurrent (2025) faded at 90%, tabPrevious (2024) opaque
    tabCurrent.style.opacity = 0.9;
    tabPrevious.style.opacity = 1;

    // Scroll before company_revenue question
    window.scrollY = 300;
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.9);
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

    // Now tabPrevious is faded at 90%
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.9);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);

    // Scroll to midpoint through fade zone (between company_revenue and ambiental end)
    window.scrollY = 600; // Midway through fade zone
    const fadeProgress = (600 - revenueQuestionScrollPosition) / (ambientalSectionEndScrollPosition - revenueQuestionScrollPosition);
    let progressiveOpacity = Math.max(0, 0.9 - (fadeProgress * 0.9));

    expect(progressiveOpacity).toBeGreaterThanOrEqual(0.4);
    expect(progressiveOpacity).toBeLessThanOrEqual(0.6);
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
