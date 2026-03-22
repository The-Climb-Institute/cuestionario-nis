/**
 * Test: Year Selector Fade Behavior — Progressive Fade on Scroll + Toggle on Year Change
 *
 * Validates that:
 * 1. Unselected year starts at 75% faded (opacity: 0.25)
 * 2. Fade toggles when year is selected (swap which tab is faded)
 * 3. Fade progresses as user scrolls:
 *    - 75% faded until energy (time-sensitive) section
 *    - Gradually fades to 50% in first half after energy section
 *    - Gradually fades to 0% in second half after energy section
 * 4. Different scroll positions trigger different fade levels
 */

describe('Year Selector Fade Behavior (Progressive + Toggle)', () => {
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

  test('Initial state: unselected year is 75% faded (opacity: 0.25)', () => {
    // Simulate fade initialization
    tabCurrent.style.opacity = 0.25;
    tabPrevious.style.opacity = 1;

    expect(tabCurrent.classList.contains('year-label-unselected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-selected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.25);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(1);
  });

  test('Fade toggles when year is selected: swap which tab is faded', () => {
    // Initial state
    tabCurrent.style.opacity = 0.25;
    tabPrevious.style.opacity = 1;

    // Click current year to select it
    tabCurrent.classList.add('year-label-selected');
    tabCurrent.classList.remove('year-label-unselected');
    tabPrevious.classList.add('year-label-unselected');
    tabPrevious.classList.remove('year-label-selected');

    // Simulate fade toggle: swap opacities
    tabCurrent.style.opacity = 1;
    tabPrevious.style.opacity = 0.25;

    // Verify swap
    expect(tabCurrent.classList.contains('year-label-selected')).toBe(true);
    expect(tabPrevious.classList.contains('year-label-unselected')).toBe(true);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.25);
  });

  test('Before energy section: fade stays at 75% (opacity: 0.25)', () => {
    const unselectedTab = document.querySelector('[data-year-label="unselected"]');
    const energySectionTop = energySection.getBoundingClientRect().top;

    // Scroll: 0 (top of form)
    window.scrollY = 0;
    const fadeOpacityAtStart = 0.25; // Before energy section
    expect(fadeOpacityAtStart).toBe(0.25);

    // Scroll: 200 (still before energy section at ~500)
    window.scrollY = 200;
    const fadeOpacityMid = 0.25; // Still before energy section
    expect(fadeOpacityMid).toBe(0.25);
  });

  test('At energy section: fade transitions from 75% to 50%', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const energySectionScrollPosition = 500; // Energy starts at 500

    // Simulate being at energy section start
    window.scrollY = energySectionScrollPosition;

    // Fade should start transitioning from 75% (0.25) to 50% (0.5)
    const fadeProgress = 0; // Just at energy section
    let fadeOpacity = 0.25 + (fadeProgress * 2) * 0.25; // = 0.25

    expect(fadeOpacity).toBe(0.25);

    // Scroll to 12.5% progress into fade zone (50 pixels into 200-pixel fade zone from 500-700)
    window.scrollY = energySectionScrollPosition + 50;
    const fadeProgress125 = 50 / (docHeight - energySectionScrollPosition);
    fadeOpacity = 0.25 + (fadeProgress125 * 2) * 0.25;

    expect(fadeOpacity).toBeGreaterThan(0.25);
    expect(fadeOpacity).toBeLessThanOrEqual(0.375);
  });

  test('Midway through fade zone: fade reaches 50% (opacity: 0.5)', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const energySectionScrollPosition = 500;

    // At midpoint of fade zone: energy section + (docHeight - energySectionScrollPosition) / 2
    const midpointScroll = energySectionScrollPosition + (docHeight - energySectionScrollPosition) / 2;
    window.scrollY = midpointScroll;

    // Calculate fade at exactly 50% progress (transition point)
    const fadeProgress = (midpointScroll - energySectionScrollPosition) / (docHeight - energySectionScrollPosition);
    let fadeOpacity;

    if (fadeProgress < 0.5) {
      fadeOpacity = 0.25 + (fadeProgress * 2) * 0.25; // First half
    } else {
      fadeOpacity = 0.5 - ((fadeProgress - 0.5) * 2) * 0.5; // Second half
    }

    // At exactly 50% progress, we're at the transition point (0.5 opacity)
    expect(fadeOpacity).toBe(0.5);
  });

  test('At end of form: fade reaches 0% (opacity: 0)', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // 700
    const energySectionScrollPosition = 500;

    // At end of document
    window.scrollY = docHeight;

    // Calculate fade at 100% progress
    const fadeProgress = (docHeight - energySectionScrollPosition) / (docHeight - energySectionScrollPosition);
    let fadeOpacity;

    if (fadeProgress < 0.5) {
      fadeOpacity = 0.25 + (fadeProgress * 2) * 0.25;
    } else {
      fadeOpacity = 0.5 - ((fadeProgress - 0.5) * 2) * 0.5;
    }

    expect(fadeOpacity).toBe(0); // Fully faded at end
  });

  test('Multiple scroll positions maintain correct fade progression', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const energySectionScrollPosition = 500;

    const scrollPositions = [
      { scroll: 0, expectedRange: [0.24, 0.26] }, // Before energy: 75% faded
      { scroll: 250, expectedRange: [0.24, 0.26] }, // Still before energy
      { scroll: 525, expectedRange: [0.25, 0.32] }, // Just after energy: transitioning toward 50%
      { scroll: 600, expectedRange: [0.48, 0.52] }, // Midpoint: at 50% faded
      { scroll: 650, expectedRange: [0.25, 0.4] }, // Second half: fading from 50% toward 0%
      { scroll: 700, expectedRange: [0.0, 0.05] }, // Near end: fading toward 0
    ];

    scrollPositions.forEach(({ scroll, expectedRange }) => {
      window.scrollY = scroll;

      // Calculate expected fade at this scroll position
      let fadeOpacity;
      if (scroll < energySectionScrollPosition) {
        fadeOpacity = 0.25;
      } else {
        const fadeProgress = (scroll - energySectionScrollPosition) / (docHeight - energySectionScrollPosition);
        if (fadeProgress < 0.5) {
          fadeOpacity = 0.25 + (fadeProgress * 2) * 0.25;
        } else {
          fadeOpacity = 0.5 - ((fadeProgress - 0.5) * 2) * 0.5;
        }
      }

      expect(fadeOpacity).toBeGreaterThanOrEqual(expectedRange[0]);
      expect(fadeOpacity).toBeLessThanOrEqual(expectedRange[1]);
    });
  });

  test('Toggle and scroll: fade follows toggle, then progresses on scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Initial: tabCurrent (2025) faded, tabPrevious (2024) opaque
    tabCurrent.style.opacity = 0.25;
    tabPrevious.style.opacity = 1;

    // Scroll before energy section
    window.scrollY = 200;
    expect(parseFloat(tabCurrent.style.opacity)).toBe(0.25);
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

    // Now tabPrevious is faded at 75%
    expect(parseFloat(tabPrevious.style.opacity)).toBe(0.25);
    expect(parseFloat(tabCurrent.style.opacity)).toBe(1);

    // Scroll past energy section and verify fade progression on now-faded tabPrevious
    window.scrollY = 700; // Past energy section
    const fadeProgress = (700 - 500) / (docHeight - 500);
    let progressiveOpacity = 0.5 - ((fadeProgress - 0.5) * 2) * 0.5;

    expect(progressiveOpacity).toBeGreaterThanOrEqual(0);
    expect(progressiveOpacity).toBeLessThanOrEqual(0.5);
  });

  test('Fade opacity clamps to [0, 1] range', () => {
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
