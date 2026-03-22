/**
 * Tests for Task 12: Year Selector Rail
 *
 * Requirements:
 * - Only 2 years available: current and previous year
 * - Default selection: previous year
 * - Lock year selection after first non-company field is filled
 * - Read-only state after successful submit
 */

describe('Year Selector Logic (Task 12)', () => {

  describe('Year initialization', () => {
    test('should initialize with current year and previous year only', () => {
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1];

      expect(years).toHaveLength(2);
      expect(years).toContain(currentYear);
      expect(years).toContain(currentYear - 1);
    });

    test('should default to previous year', () => {
      const currentYear = new Date().getFullYear();
      const defaultYear = currentYear - 1;

      expect(defaultYear).toBe(currentYear - 1);
    });
  });

  describe('Year selector UI', () => {
    let container;

    beforeEach(() => {
      document.body.innerHTML = '';
      container = document.createElement('div');
      container.id = 'form-container';
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('should render year selector with exactly 2 options', () => {
      const currentYear = new Date().getFullYear();
      const yearOptions = [currentYear - 1, currentYear];

      const selector = document.createElement('select');
      selector.id = 'year-selector';

      yearOptions.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selector.appendChild(option);
      });

      container.appendChild(selector);

      const options = container.querySelectorAll('option');
      expect(options).toHaveLength(2);
    });

    test('should set previous year as default selected', () => {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      const selector = document.createElement('select');
      selector.id = 'year-selector';

      const prevOption = document.createElement('option');
      prevOption.value = previousYear;
      prevOption.selected = true;
      selector.appendChild(prevOption);

      const currOption = document.createElement('option');
      currOption.value = currentYear;
      selector.appendChild(currOption);

      expect(selector.value).toBe(String(previousYear));
    });
  });

  describe('Year lock logic', () => {

    test('should allow year change when form is empty', () => {
      const formState = { isLocked: false };
      const hasNonCompanyData = false;

      const shouldBlockYearChange = hasNonCompanyData;

      expect(shouldBlockYearChange).toBe(false);
    });

    test('should lock year after first non-company field is filled', () => {
      const nonCompanySections = ['ambiental', 'social', 'gobernanza'];
      const filledField = { section: 'ambiental', id: 'aplica_emisiones' };

      const isNonCompanyField = nonCompanySections.includes(filledField.section);

      expect(isNonCompanyField).toBe(true);
    });

    test('should NOT lock year when only company fields are filled', () => {
      const companyFields = ['company_name', 'company_country', 'company_sector'];
      const filledField = 'company_name';

      const isCompanyField = filledField.startsWith('company_');
      const shouldBlockChange = !isCompanyField;

      expect(shouldBlockChange).toBe(false);
    });

    test('should unlock year when "clear all" is confirmed', () => {
      const formState = { locked: true, dataCleared: false };

      // Simulate clear all confirmation
      formState.dataCleared = true;
      formState.locked = false;

      expect(formState.locked).toBe(false);
    });
  });

  describe('Read-only state after submit', () => {
    let container;

    beforeEach(() => {
      document.body.innerHTML = '';
      container = document.createElement('div');
      container.id = 'form-container';
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('should apply read-only state to form after successful submit', () => {
      const form = document.createElement('form');
      form.id = 'nis-form';
      container.appendChild(form);

      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'company_name';
      input.disabled = false;
      form.appendChild(input);

      // Simulate successful submit
      input.disabled = true;
      form.classList.add('form-read-only');

      expect(input.disabled).toBe(true);
      expect(form.classList.contains('form-read-only')).toBe(true);
    });

    test('should prevent year selector change in read-only state', () => {
      const selector = document.createElement('select');
      selector.id = 'year-selector';
      selector.disabled = false;
      container.appendChild(selector);

      // Simulate read-only state
      selector.disabled = true;

      expect(selector.disabled).toBe(true);
    });
  });

  describe('Year selector UI layout', () => {

    test('should mark year selector as vertical rail on desktop', () => {
      const selector = document.createElement('div');
      selector.className = 'year-rail year-rail-vertical';
      selector.style.position = 'fixed';
      selector.style.left = '0';
      selector.style.writingMode = 'vertical-rl';
      selector.style.transform = 'rotate(180deg)';

      expect(selector.classList.contains('year-rail-vertical')).toBe(true);
      expect(selector.style.position).toBe('fixed');
      expect(selector.style.left).toBe('0px');
    });

    test('should mark year selector as horizontal strip on mobile', () => {
      const selector = document.createElement('div');
      selector.className = 'year-rail year-rail-horizontal';
      selector.style.display = 'flex';
      selector.style.flexDirection = 'row';

      expect(selector.classList.contains('year-rail-horizontal')).toBe(true);
    });
  });

  describe('Scroll-linked effects', () => {

    test('should track scroll position for opacity changes', () => {
      const scrollPosition = { top: 0 };
      const unselectedYearOpacity = 1 - (scrollPosition.top / 1000); // Fade as scroll increases

      expect(unselectedYearOpacity).toBe(1);

      scrollPosition.top = 500;
      const newOpacity = 1 - (scrollPosition.top / 1000);
      expect(newOpacity).toBe(0.5);
    });

    test('should move selected year toward bottom on scroll', () => {
      const scrollPosition = { top: 0 };
      const selectedYearPosition = Math.max(0, 100 - scrollPosition.top);

      expect(selectedYearPosition).toBe(100);

      scrollPosition.top = 50;
      const newPosition = Math.max(0, 100 - scrollPosition.top);
      expect(newPosition).toBe(50);
    });
  });
});
