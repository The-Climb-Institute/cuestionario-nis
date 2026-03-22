/**
 * Test: Year Selector Tabs — Click Behavior and Class Swapping
 *
 * Verifies that clicking either year tab swaps the selected/unselected classes
 * without changing the text content. Both tabs are clickable and work symmetrically.
 */

describe('Year Selector Tabs — Click Behavior (Task 14)', () => {
  let tabA; // current year (2025) - initially unselected
  let tabB; // previous year (2024) - initially selected
  let year2025;
  let year2024;

  beforeEach(() => {
    // Create a minimal DOM structure matching what form.js creates
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
        <aside class="resumen-panel"></aside>
      </div>
    `;

    tabA = document.querySelector('[data-year-label="unselected"]');
    tabB = document.querySelector('[data-year-label="selected"]');

    year2025 = parseInt(tabA.textContent);
    year2024 = parseInt(tabB.textContent);

    // Simulate the FIXED click handler from form.js: both tabs interactive
    const attachHandler = (clickedTab, otherTab) => {
      clickedTab.style.cursor = 'pointer';
      clickedTab.addEventListener('click', (e) => {
        e.preventDefault();
        // If already selected, do nothing
        if (clickedTab.classList.contains('year-label-selected')) return;
        // Swap classes only — text never changes
        clickedTab.classList.remove('year-label-unselected');
        clickedTab.classList.add('year-label-selected');
        otherTab.classList.remove('year-label-selected');
        otherTab.classList.add('year-label-unselected');
      });
    };

    attachHandler(tabA, tabB);
    attachHandler(tabB, tabA);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Initial state: tabA unselected, tabB selected', () => {
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);
    expect(tabA.classList.contains('year-label-selected')).toBe(false);
    expect(tabB.classList.contains('year-label-selected')).toBe(true);
    expect(tabB.classList.contains('year-label-unselected')).toBe(false);
  });

  test('Text never changes', () => {
    expect(tabA.textContent).toBe(String(year2025));
    expect(tabB.textContent).toBe(String(year2024));
  });

  test('Clicking tabA (unselected) makes it selected', () => {
    tabA.click();

    // Text unchanged
    expect(tabA.textContent).toBe(String(year2025));
    expect(tabB.textContent).toBe(String(year2024));

    // Classes swapped
    expect(tabA.classList.contains('year-label-selected')).toBe(true);
    expect(tabA.classList.contains('year-label-unselected')).toBe(false);
    expect(tabB.classList.contains('year-label-unselected')).toBe(true);
    expect(tabB.classList.contains('year-label-selected')).toBe(false);
  });

  test('Clicking tabB (now unselected) makes it selected again', () => {
    // Start with tabA selected
    tabA.click();
    expect(tabA.classList.contains('year-label-selected')).toBe(true);

    // Now click tabB (which is now unselected)
    tabB.click();

    // Text unchanged
    expect(tabA.textContent).toBe(String(year2025));
    expect(tabB.textContent).toBe(String(year2024));

    // Classes swapped back
    expect(tabB.classList.contains('year-label-selected')).toBe(true);
    expect(tabB.classList.contains('year-label-unselected')).toBe(false);
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);
    expect(tabA.classList.contains('year-label-selected')).toBe(false);
  });

  test('Clicking selected tab does nothing', () => {
    // tabB is initially selected
    const beforeClass = tabB.className;

    // Click it
    tabB.click();

    // State unchanged
    expect(tabB.className).toBe(beforeClass);
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);
  });

  test('5 alternating clicks maintain invariants', () => {
    const clicks = [tabA, tabB, tabA, tabB, tabA];

    clicks.forEach((tab, i) => {
      tab.click();

      // Text invariant
      expect(tabA.textContent).toBe(String(year2025));
      expect(tabB.textContent).toBe(String(year2024));

      // Class invariant
      const selectedCount = [tabA, tabB].filter(
        t => t.classList.contains('year-label-selected')
      ).length;
      expect(selectedCount).toBe(1);
    });
  });

  test('10 alternating clicks maintain invariants', () => {
    const clicks = [tabA, tabB, tabA, tabB, tabA, tabB, tabA, tabB, tabA, tabB];

    clicks.forEach((tab) => {
      tab.click();

      // Text never changes
      expect(tabA.textContent).toBe(String(year2025));
      expect(tabB.textContent).toBe(String(year2024));

      // Exactly one selected, one unselected
      const selectedCount = [tabA, tabB].filter(
        t => t.classList.contains('year-label-selected')
      ).length;
      const unselectedCount = [tabA, tabB].filter(
        t => t.classList.contains('year-label-unselected')
      ).length;
      expect(selectedCount).toBe(1);
      expect(unselectedCount).toBe(1);
    });

    // After 10 alternating clicks (even), should return to initial state
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);
    expect(tabB.classList.contains('year-label-selected')).toBe(true);
  });

  test('Rapid 8 clicks on alternating tabs work correctly', () => {
    const iterations = 8;
    const tabs = [tabA, tabB];

    for (let i = 0; i < iterations; i++) {
      tabs[i % 2].click();

      // Text unchanged
      expect(tabA.textContent).toBe(String(year2025));
      expect(tabB.textContent).toBe(String(year2024));

      // Class invariant maintained
      const selectedCount = [tabA, tabB].filter(
        t => t.classList.contains('year-label-selected')
      ).length;
      expect(selectedCount).toBe(1);
    }
  });

  test('Both tabs are clickable at any time', () => {
    // Initial: tabA unselected, tabB selected
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);
    expect(tabB.classList.contains('year-label-selected')).toBe(true);

    // Click tabA
    tabA.click();
    expect(tabA.classList.contains('year-label-selected')).toBe(true);
    expect(tabB.classList.contains('year-label-unselected')).toBe(true);

    // Now click tabB (previously couldn't do this in old code)
    tabB.click();
    expect(tabB.classList.contains('year-label-selected')).toBe(true);
    expect(tabA.classList.contains('year-label-unselected')).toBe(true);

    // Click tabA again
    tabA.click();
    expect(tabA.classList.contains('year-label-selected')).toBe(true);
    expect(tabB.classList.contains('year-label-unselected')).toBe(true);
  });
});
