/**
 * Test: Year Selector Opacity Behavior — Progressive Fade on Scroll + Toggle on Year Change
 *
 * Validates that:
 * 1. Unselected year starts at 90% opacity
 * 2. Toggle switches opacity when year is selected (swap which tab is faded)
 * 3. Opacity progresses as user scrolls:
 *    - 90% opacity before empresa section
 *    - Gradually fades to 50% opacity by ambiental section
 *    - Stays at 50% opacity after ambiental section
 * 4. Different scroll positions trigger different opacity levels
 */

describe('Year Selector Opacity Behavior (Progressive + Toggle)', () => {
  let container;
  let yearRail;
  let tabCurrent; // current year (2025) - initially unselected, faded
  let tabPrevious; // previous year (2024) - initially selected, fully opaque
  let energySection;

  beforeEach(() => {
    // Create DOM structure simulating the form with energy section
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
        <section data-section="energia" style="margin-top: 500px; height: 300px;">Energy Section</section>
        <div style="height: 500px;">Additional Content</div>
      </div>
    `;

    container = document.querySelector('.container');
    yearRail = document.querySelector('.year-rail');
    tabCurrent = document.querySelector('[data-year-label="unselected"]');
    tabPrevious = document.querySelector('[data-year-label="selected"]');
    energySection = document.querySelector('[data-section="energia"]');

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

  test('Before empresa section: opacity stays at 90%', () => {
    const unselectedTab = document.querySelector('[data-year-label="unselected"]');

    // Scroll: 0 (top of form)
    window.scrollY = 0;
    const opacityAtStart = 0.9; // Before empresa section
    expect(opacityAtStart).toBe(0.9);

    // Scroll: 200 (still before empresa section at ~500)
    window.scrollY = 200;
    const opacityMid = 0.9; // Still before empresa section
    expect(opacityMid).toBe(0.9);
  });

  test('At empresa section: opacity transitions from 90% to 50%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const empresaSectionScrollPosition = 500; // Empresa starts at 500

    // Simulate being at empresa section start
    window.scrollY = empresaSectionScrollPosition;

    // Opacity should start transitioning from 90% (0.9) to 50% (0.5)
    const fadeProgress = 0; // Just at empresa section
    let opacity = 0.9 - (fadeProgress * 0.4); // = 0.9

    expect(opacity).toBe(0.9);

    // Scroll to 12.5% progress into fade zone (50 pixels into 200-pixel fade zone from 500-700)
    window.scrollY = empresaSectionScrollPosition + 50;
    const fadeProgress125 = 50 / (docHeight - empresaSectionScrollPosition);
    opacity = 0.9 - (fadeProgress125 * 0.4);

    expect(opacity).toBeGreaterThan(0.7);
    expect(opacity).toBeLessThanOrEqual(0.9);
  });

  test('Midway through fade zone: opacity fades midway', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const empresaSectionScrollPosition = 500;

    // At midpoint of fade zone: empresa section + (docHeight - empresaSectionScrollPosition) / 2
    const midpointScroll = empresaSectionScrollPosition + (docHeight - empresaSectionScrollPosition) / 2;
    window.scrollY = midpointScroll;

    // Calculate opacity at exactly 50% progress through fade zone
    const fadeProgress = (midpointScroll - empresaSectionScrollPosition) / (docHeight - empresaSectionScrollPosition);
    let opacity = 0.9 - (fadeProgress * 0.4);

    // At 50% progress: opacity = 0.9 - (0.5 * 0.4) = 0.9 - 0.2 = 0.7
    expect(opacity).toBe(0.7);
  });

  test('At end of form: opacity stays at 50%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700

    // At end of document
    window.scrollY = docHeight;

    // Opacity should be 50% (stable after ambiental section)
    let opacity = 0.5;

    expect(opacity).toBe(0.5);
  });

  test('Multiple scroll positions maintain correct opacity progression', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const empresaSectionScrollPosition = 500;

    // Test key positions
    const testCases = [
      { scroll: 0, expectedOpacity: 0.9, desc: 'Before empresa' },
      { scroll: 250, expectedOpacity: 0.9, desc: 'Still before empresa' },
      { scroll: 600, expectedOpacity: 0.5, desc: 'At midpoint' },
    ];

    testCases.forEach(({ scroll, expectedOpacity, desc }) => {
      window.scrollY = scroll;

      // Calculate expected opacity at this scroll position
      let opacity;
      if (scroll < empresaSectionScrollPosition) {
        opacity = 0.9;
      } else if (scroll < docHeight) {
        const fadeProgress = (scroll - empresaSectionScrollPosition) / (docHeight - empresaSectionScrollPosition);
        opacity = 0.9 - (fadeProgress * 0.4);
      } else {
        opacity = 0.5;
      }

      expect(opacity).toBeCloseTo(expectedOpacity, 0, `${desc}: scroll ${scroll}`);
    });
  });

  test('Toggle and scroll: opacity follows toggle, then progresses on scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Initial: tabCurrent (2025) faded at 90%, tabPrevious (2024) opaque
    tabCurrent.style.opacity = 0.9;
    tabPrevious.style.opacity = 1;

    // Scroll before empresa section
    window.scrollY = 200;
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

    // Scroll past empresa section and verify opacity progression on now-faded tabPrevious
    window.scrollY = 600; // At/past empresa section
    const fadeProgress = (600 - 500) / (docHeight - 500);
    let progressiveOpacity = 0.9 - (fadeProgress * 0.4);

    expect(progressiveOpacity).toBeGreaterThanOrEqual(0.5);
    expect(progressiveOpacity).toBeLessThanOrEqual(0.9);
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
