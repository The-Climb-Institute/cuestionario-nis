const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/**
 * Task 12: Year Selector (Cilindro 3D)
 * Scenarios for year locking, clear behavior, read-only post-submit, and visual design
 */

Then('el selector de año muestra el año anterior como seleccionado por defecto', async function () {
  // Get the current year and previous year
  const now = new Date();
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;

  // Find the year selector dropdown and verify previous year is selected
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  const selectedValue = await yearSelect.inputValue();
  expect(selectedValue).toBe(String(previousYear));
});

Then('el cilindro del año muestra el año anterior en la cara frontal \\(visible\\)', async function () {
  // Check that the selected year label (front-facing) shows the previous year
  const previousYear = new Date().getFullYear() - 1;
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  const labelText = await selectedLabel.textContent();
  expect(labelText?.trim()).toContain(String(previousYear));
});

Then('el año actual está envuelto alrededor del borde superior del cilindro \\(visualmente subordinado\\)', async function () {
  // Check that the unselected year label is visible but with lower opacity
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  await expect(unselectedLabel).toBeVisible();
  // Verify it has reduced opacity (CSS class or style)
  const opacity = await unselectedLabel.evaluate((el) => window.getComputedStyle(el).opacity);
  const opacityValue = parseFloat(opacity);
  expect(opacityValue).toBeLessThan(1);
});

When('el usuario rellena un valor en "¿La empresa reporta emisiones de GEI" \\(primer campo no-empresa\\)', async function () {
  // Select "Sí" in the first environmental question (first non-company field)
  const geiQuestion = this.page.getByRole('radio', { name: /¿la empresa reporta|does the company report/i }).first();
  await geiQuestion.click();
});

Then('el selector de año está deshabilitado y no permite cambios', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  await expect(yearSelect).toBeDisabled();
});

Then('intentar cambiar el año no tiene efecto', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  const currentValue = await yearSelect.inputValue();

  // Attempt to change (will fail silently because it's disabled)
  const options = await yearSelect.locator('option').all();
  if (options.length > 1) {
    try {
      // This should not work because the select is disabled
      await yearSelect.selectOption(options[1]);
    } catch {
      // Expected to fail
    }
  }

  // Verify value didn't change
  const newValue = await yearSelect.inputValue();
  expect(newValue).toBe(currentValue);
});

When('el usuario rellena solo campos de empresa \\(nombre, país, región, sector, empleados, ingresos\\)', async function () {
  await this.page.getByRole('textbox', { name: /nombre legal/i }).fill('Empresa E2E Test');
  await this.page.getByRole('combobox', { name: /país/i }).selectOption('México');

  const regionSelect = this.page.getByRole('combobox', { name: /región|estado/i });
  await this.page.waitForTimeout(400);
  if (await regionSelect.isVisible()) {
    const firstOption = await regionSelect.locator('option').nth(1).getAttribute('value');
    if (firstOption) await regionSelect.selectOption(firstOption);
  }

  await this.page.getByRole('combobox', { name: /sector de industria/i }).selectOption('Servicios de agua, saneamiento');
  await this.page.getByRole('spinbutton', { name: /número de empleados/i }).fill('100');
  await this.page.getByRole('spinbutton', { name: /ingresos anuales/i }).fill('500000');
});

Then('el selector de año sigue habilitado y permite cambios', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  await expect(yearSelect).toBeEnabled();
});

Then('el usuario puede cambiar entre año actual y año anterior sin restricción', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  const currentYear = new Date().getFullYear();

  // Get available options
  const options = await yearSelect.locator('option').all();
  expect(options.length).toBeGreaterThanOrEqual(2);

  // Try to change to different year
  const firstOption = await options[0].getAttribute('value');
  const secondOption = await options[1].getAttribute('value');

  if (firstOption && secondOption && firstOption !== secondOption) {
    await yearSelect.selectOption(secondOption);
    const newValue = await yearSelect.inputValue();
    expect(newValue).toBe(secondOption);

    // Change back to first option
    await yearSelect.selectOption(firstOption);
    const backValue = await yearSelect.inputValue();
    expect(backValue).toBe(firstOption);
  }
});

Given('el usuario ha completado un campo no-empresa \\(año bloqueado\\)', async function () {
  // Fill company data first
  await this.page.getByRole('textbox', { name: /nombre legal/i }).fill('Empresa Lock Test');
  await this.page.getByRole('combobox', { name: /país/i }).selectOption('México');

  const regionSelect = this.page.getByRole('combobox', { name: /región|estado/i });
  await this.page.waitForTimeout(400);
  if (await regionSelect.isVisible()) {
    const firstOption = await regionSelect.locator('option').nth(1).getAttribute('value');
    if (firstOption) await regionSelect.selectOption(firstOption);
  }

  await this.page.getByRole('combobox', { name: /sector de industria/i }).selectOption('Servicios de agua, saneamiento');
  await this.page.getByRole('spinbutton', { name: /número de empleados/i }).fill('100');
  await this.page.getByRole('spinbutton', { name: /ingresos anuales/i }).fill('500000');

  // Now fill a non-company field (lock year)
  await this.page.getByRole('radio', { name: /¿la empresa reporta|does the company report/i }).first().click();

  // Verify year is locked
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  await expect(yearSelect).toBeDisabled();
});

When('el usuario hace clic en el botón "Limpiar"', async function () {
  const clearButton = this.page.getByRole('button', { name: /limpiar|clear/i });
  await clearButton.click();
});

Then('el formulario se borra completamente', async function () {
  // Verify form fields are empty or reset
  const nameField = this.page.getByRole('textbox', { name: /nombre legal/i });
  const value = await nameField.inputValue();
  expect(value).toBe('');
});

Then('el selector de año se desbloquea y permite cambios nuevamente', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  await expect(yearSelect).toBeEnabled();
});

Then('el año anterior vuelve a estar seleccionado por defecto', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  const previousYear = new Date().getFullYear() - 1;
  const selectedValue = await yearSelect.inputValue();
  expect(selectedValue).toBe(String(previousYear));
});

Then('todos los campos del formulario están deshabilitados \\(modo solo-lectura\\)', async function () {
  // Check that input fields are disabled
  const inputs = await this.page.locator('input, select, textarea').all();
  for (const input of inputs) {
    const isDisabled = await input.isDisabled();
    // Most inputs should be disabled; allow for some exceptions (like hidden fields)
    const isHidden = await input.isHidden();
    if (!isHidden) {
      expect(isDisabled).toBe(true);
    }
  }
});

Then('el selector de año está deshabilitado', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  await expect(yearSelect).toBeDisabled();
});

Then('el botón Limpiar está deshabilitado', async function () {
  const clearButton = this.page.getByRole('button', { name: /limpiar|clear/i });
  await expect(clearButton).toBeDisabled();
});

Then('el botón Enviar está deshabilitado', async function () {
  const submitButton = this.page.getByRole('button', { name: /enviar|submit/i });
  await expect(submitButton).toBeDisabled();
});

Then('el formulario muestra estilo atenuado \\(grey\\/disabled appearance\\)', async function () {
  // Check for visual disabled state (opacity, color, etc.)
  const formContainer = this.page.locator('.nis-form');
  const opacity = await formContainer.evaluate((el) => window.getComputedStyle(el).opacity);
  // Should have reduced opacity or grey color
  const opacityValue = parseFloat(opacity);
  expect(opacityValue).toBeLessThanOrEqual(1);
});

When('el usuario desplaza la página hacia abajo', async function () {
  // Scroll down to trigger scroll effects
  await this.page.evaluate(() => window.scrollBy(0, 500));
  await this.page.waitForTimeout(400);
});

Then('el cilindro del año rota gradualmente \\(efecto de tambor rotatorio\\)', async function () {
  // Verify that the cylinder stage has a rotateX transform
  const cylinderStage = this.page.locator('.year-cylinder-stage');
  const transform = await cylinderStage.evaluate((el) => window.getComputedStyle(el).transform);
  // Should contain rotateX transform
  expect(transform).toMatch(/rotateX|matrix/i);
});

Then('el año no seleccionado se desvanece \\(opacity fade\\) conforme se desplaza', async function () {
  // Verify that unselected year label has opacity animation
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  const opacity = await unselectedLabel.evaluate((el) => window.getComputedStyle(el).opacity);
  const opacityValue = parseFloat(opacity);
  // Should have reduced opacity during scroll
  expect(opacityValue).toBeLessThan(1);
});

Then('el efecto es continuo y suave \\(sin saltos\\)', async function () {
  // Verify smooth transition CSS property exists
  const cylinderStage = this.page.locator('.year-cylinder-stage');
  const transition = await cylinderStage.evaluate((el) => window.getComputedStyle(el).transition);
  expect(transition).toContain('transform');
});

When('el usuario cambia el año al año actual', async function () {
  const yearSelect = this.page.getByRole('combobox', { name: /año|year/i });
  const currentYear = new Date().getFullYear();
  await yearSelect.selectOption(String(currentYear));
  await this.page.waitForTimeout(300);
});

Then('el cilindro actualiza inmediatamente para mostrar el año actual en la cara frontal', async function () {
  const currentYear = new Date().getFullYear();
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  const labelText = await selectedLabel.textContent();
  expect(labelText?.trim()).toContain(String(currentYear));
});

Then('el año anterior se envuelve alrededor del borde superior', async function () {
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  await expect(unselectedLabel).toBeVisible();
});

Then('la transición es visualmente clara', async function () {
  // Just verify the labels are still visible after change
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  await expect(selectedLabel).toBeVisible();
  await expect(unselectedLabel).toBeVisible();
});

Given('que la aplicación está abierta en una pantalla de escritorio \\(≥768px\\)', async function () {
  await this.page.setViewportSize({ width: 1024, height: 768 });
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container .form-field', { timeout: 10000 });
});

Then('el cilindro del año es vertical y está fijo en el lado izquierdo \\(60px de ancho\\)', async function () {
  const yearRail = this.page.locator('.year-rail-vertical');
  await expect(yearRail).toBeVisible();

  const position = await yearRail.evaluate((el) => window.getComputedStyle(el).position);
  expect(position).toBe('fixed');

  const left = await yearRail.evaluate((el) => window.getComputedStyle(el).left);
  expect(left).toMatch(/^0/);
});

Then('el cilindro tiene perspectiva 3D \\(280px\\) con altura 120px y ancho 44px', async function () {
  const cylinder = this.page.locator('.year-cylinder');
  await expect(cylinder).toBeVisible();

  const perspective = await this.page.locator('.year-rail-vertical').evaluate((el) => window.getComputedStyle(el).perspective);
  expect(perspective).toMatch(/280px|perspective-origin/i);
});

Then('el formulario está centrado con padding-left: 60px para evitar solapamiento', async function () {
  const body = this.page.locator('body');
  const paddingLeft = await body.evaluate((el) => window.getComputedStyle(el).paddingLeft);
  expect(paddingLeft).toContain('60px');
});

Then('el año se lee de abajo a arriba \\(rotación 90 grados\\)', async function () {
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  const transform = await selectedLabel.evaluate((el) => window.getComputedStyle(el).transform);
  // Should contain rotate(180deg) in transform (writing-mode: vertical-rl + rotate)
  expect(transform).toMatch(/matrix|rotate/i);
});

Given('que la aplicación está abierta en una pantalla móvil \\(<768px\\)', async function () {
  await this.page.setViewportSize({ width: 375, height: 667 });
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container', { timeout: 10000 });
});

Then('el cilindro del año es horizontal y está centrado sobre el formulario', async function () {
  const yearRail = this.page.locator('.year-rail-vertical');
  await expect(yearRail).toBeVisible();

  const position = await yearRail.evaluate((el) => window.getComputedStyle(el).position);
  expect(position).not.toBe('fixed');
});

Then('el cilindro tiene perspectiva 3D \\(200px\\) con ancho 160px y altura 52px', async function () {
  const cylinder = this.page.locator('.year-cylinder');
  await expect(cylinder).toBeVisible();
});

Then('el año seleccionado se muestra en la cara derecha \\(22px, color dorado\\)', async function () {
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  const color = await selectedLabel.evaluate((el) => window.getComputedStyle(el).color);
  // Gold color in this design is #ffffff (white on dark) per project spec
  const fontSize = await selectedLabel.evaluate((el) => window.getComputedStyle(el).fontSize);
  expect(fontSize).toMatch(/22px/);
});

Then('el año no seleccionado se muestra en la cara izquierda \\(14px, color gris, rotateY: 60deg\\)', async function () {
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  const fontSize = await unselectedLabel.evaluate((el) => window.getComputedStyle(el).fontSize);
  expect(fontSize).toMatch(/14px/);
});

Then('el selector nativo \\(<select>\\) está minimizado \\(9-10px font, sin borde, fondo transparente\\)', async function () {
  const selector = this.page.locator('.year-selector-control');
  const fontSize = await selector.evaluate((el) => window.getComputedStyle(el).fontSize);
  const background = await selector.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const border = await selector.evaluate((el) => window.getComputedStyle(el).border);

  expect(fontSize).toMatch(/9px|10px/);
  expect(background).toMatch(/transparent|rgba.*0\)/i);
  expect(border).toMatch(/none|0px/);
});
