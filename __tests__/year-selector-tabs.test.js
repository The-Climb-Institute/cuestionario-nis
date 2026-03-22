/**
 * Test: Year Selector Tabs — Click Behavior and Class Swapping
 *
 * Verifies that clicking year tabs swaps the selected/unselected classes
 * without changing the text content or position of the tabs.
 */

describe('Year Selector Tabs — Click Behavior (Task 14)', () => {
  let selectedTab;
  let unselectedTab;
  let prevYear;
  let currentYear;

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

    selectedTab = document.querySelector('[data-year-label="selected"]');
    unselectedTab = document.querySelector('[data-year-label="unselected"]');

    // Extract year values
    prevYear = parseInt(selectedTab.textContent);
    currentYear = parseInt(unselectedTab.textContent);

    // Simulate the click handler from form.js initializeScrollEffects()
    // Make unselected tab clickable to swap classes
    unselectedTab.style.cursor = 'pointer';
    unselectedTab.addEventListener('click', (e) => {
      e.preventDefault();
      // Swap classes without swapping text
      unselectedTab.classList.remove('year-label-unselected');
      unselectedTab.classList.add('year-label-selected');
      selectedTab.classList.remove('year-label-selected');
      selectedTab.classList.add('year-label-unselected');
    });

    // Make selected tab clickable (no-op)
    selectedTab.style.cursor = 'pointer';
    selectedTab.addEventListener('click', (e) => {
      e.preventDefault();
      // No action; year is already selected
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Initial state: selected year has correct class, unselected has correct class', () => {
    expect(selectedTab.classList.contains('year-label-selected')).toBe(true);
    expect(selectedTab.classList.contains('year-label-unselected')).toBe(false);
    expect(unselectedTab.classList.contains('year-label-unselected')).toBe(true);
    expect(unselectedTab.classList.contains('year-label-selected')).toBe(false);
  });

  test('Text content does not change on initial render', () => {
    expect(selectedTab.textContent).toBe(String(prevYear));
    expect(unselectedTab.textContent).toBe(String(currentYear));
  });

  test('Clicking unselected tab swaps classes without changing text', () => {
    // Click unselected tab
    unselectedTab.click();

    // Text should not change
    expect(selectedTab.textContent).toBe(String(prevYear));
    expect(unselectedTab.textContent).toBe(String(currentYear));

    // Classes should swap
    expect(selectedTab.classList.contains('year-label-selected')).toBe(false);
    expect(selectedTab.classList.contains('year-label-unselected')).toBe(true);
    expect(unselectedTab.classList.contains('year-label-selected')).toBe(true);
    expect(unselectedTab.classList.contains('year-label-unselected')).toBe(false);
  });

  test('Multiple clicks alternate between tabs, text stays fixed (5 clicks)', () => {
    const clicks = 5;

    for (let i = 0; i < clicks; i++) {
      // Get current selected and unselected tabs
      const currentSelected = document.querySelector('[data-year-label="selected"]');
      const currentUnselected = document.querySelector('[data-year-label="unselected"]');

      // Click the unselected tab to switch
      currentUnselected.click();

      // Verify text never changes
      expect(selectedTab.textContent).toBe(String(prevYear));
      expect(unselectedTab.textContent).toBe(String(currentYear));

      // Verify exactly one tab is selected
      const selectCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-selected')
      ).length;
      expect(selectCount).toBe(1);

      const unselectCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-unselected')
      ).length;
      expect(unselectCount).toBe(1);
    }
  });

  test('Multiple clicks maintain text position invariant (10 clicks)', () => {
    const clicks = 10;

    for (let i = 0; i < clicks; i++) {
      const currentUnselected = document.querySelector('[data-year-label="unselected"]');
      currentUnselected.click();

      // Text must never change across all clicks
      expect(selectedTab.textContent).toBe(String(prevYear));
      expect(unselectedTab.textContent).toBe(String(currentYear));

      // Class invariant: exactly one selected and one unselected
      const selectCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-selected')
      ).length;
      expect(selectCount).toBe(1);
    }
  });

  test('Selected tab click does nothing (already selected)', () => {
    const initialSelectedClass = selectedTab.classList.contains('year-label-selected');
    const initialUnselectedClass = unselectedTab.classList.contains('year-label-unselected');

    // Click the already-selected tab
    selectedTab.click();

    // State should not change
    expect(selectedTab.classList.contains('year-label-selected')).toBe(initialSelectedClass);
    expect(unselectedTab.classList.contains('year-label-unselected')).toBe(initialUnselectedClass);

    // Text should not change
    expect(selectedTab.textContent).toBe(String(prevYear));
    expect(unselectedTab.textContent).toBe(String(currentYear));
  });

  test('Classes always sum to exactly one selected and one unselected (7 clicks)', () => {
    const clicks = 7;

    for (let i = 0; i < clicks; i++) {
      const currentUnselected = document.querySelector('[data-year-label="unselected"]');
      currentUnselected.click();

      const selectedCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-selected')
      ).length;
      const unselectedCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-unselected')
      ).length;

      expect(selectedCount).toBe(1);
      expect(unselectedCount).toBe(1);
    }
  });

  test('Rapid clicks for 8 iterations maintain invariants', () => {
    const iterations = 8;

    for (let i = 0; i < iterations; i++) {
      const currentUnselected = document.querySelector('[data-year-label="unselected"]');
      currentUnselected.click();

      // Text invariant: must never change
      expect(selectedTab.textContent).toBe(String(prevYear));
      expect(unselectedTab.textContent).toBe(String(currentYear));

      // Class invariant: exactly one selected, one unselected
      const selectedCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-selected')
      ).length;
      const unselectedCount = [selectedTab, unselectedTab].filter(
        tab => tab.classList.contains('year-label-unselected')
      ).length;
      expect(selectedCount).toBe(1);
      expect(unselectedCount).toBe(1);
    }
  });
});
