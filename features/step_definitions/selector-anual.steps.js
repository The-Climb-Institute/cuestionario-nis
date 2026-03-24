const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

function years() {
  const currentYear = new Date().getFullYear();
  return { currentYear, previousYear: currentYear - 1 };
}

async function fillCompanyMinimum(page) {
  await page.getByRole('textbox', { name: /nombre legal/i }).fill('Empresa E2E Test');
  await page.getByRole('combobox', { name: /país/i }).selectOption('México');
  const regionSelect = page.getByRole('combobox', { name: /región|estado/i });
  await page.waitForTimeout(300);
  if (await regionSelect.isVisible()) {
    const firstOption = await regionSelect.locator('option').nth(1).getAttribute('value');
    if (firstOption) await regionSelect.selectOption(firstOption);
  }
  await page.getByRole('combobox', { name: /sector de industria/i }).selectOption('Servicios de agua, saneamiento');
  await page.getByRole('spinbutton', { name: /número de empleados/i }).fill('100');
  await page.getByRole('spinbutton', { name: /ingresos anuales/i }).fill('500000');
}

Then('el selector de año muestra el año anterior como seleccionado por defecto', async function () {
  const { previousYear } = years();
  const yearSelect = this.page.locator('#year-selector');
  await expect(yearSelect).toHaveValue(String(previousYear));
});

Then('la etiqueta de año seleccionada muestra el año anterior', async function () {
  const { previousYear } = years();
  const selectedLabel = this.page.locator('[data-year-label="selected"]');
  await expect(selectedLabel).toContainText(String(previousYear));
});

Then('la etiqueta no seleccionada muestra el año actual con opacidad menor a 1', async function () {
  const { currentYear } = years();
  const unselectedLabel = this.page.locator('[data-year-label="unselected"]');
  await expect(unselectedLabel).toContainText(String(currentYear));
  const opacity = await unselectedLabel.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
  expect(opacity).toBeLessThan(1);
});

Given('el año anterior está seleccionado', async function () {
  const { previousYear } = years();
  await expect(this.page.locator('#year-selector')).toHaveValue(String(previousYear));
});

When('el usuario rellena un valor en "¿La empresa reporta emisiones de GEI" \\(primer campo no-empresa\\)', async function () {
  await this.page.locator('.nis-seccion-ambiental').getByRole('radio', { name: /^sí$/i }).first().check();
});

Then('el selector de año está deshabilitado y no permite cambios', async function () {
  await expect(this.page.locator('#year-selector')).toBeDisabled();
});

Then('intentar cambiar el año no tiene efecto', async function () {
  const yearSelect = this.page.locator('#year-selector');
  const before = await yearSelect.inputValue();
  const options = await yearSelect.locator('option').all();
  if (options.length > 1) {
    const alt = await options[0].getAttribute('value');
    if (alt && alt !== before) {
      await yearSelect.evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, alt);
    }
  }
  const after = await yearSelect.inputValue();
  expect(after).toBe(before);
});

When('el usuario rellena solo campos de empresa \\(nombre, país, región, sector, empleados, ingresos\\)', async function () {
  await fillCompanyMinimum(this.page);
});

Then('el selector de año sigue habilitado y permite cambios', async function () {
  await expect(this.page.locator('#year-selector')).toBeEnabled();
});

Then('el usuario puede cambiar entre año actual y año anterior sin restricción', async function () {
  const { currentYear, previousYear } = years();
  const yearSelect = this.page.locator('#year-selector');
  await yearSelect.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(currentYear));
  await expect(yearSelect).toHaveValue(String(currentYear));
  await yearSelect.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(previousYear));
  await expect(yearSelect).toHaveValue(String(previousYear));
});

Then('el bloque anual visible se actualiza al año seleccionado', async function () {
  const selectedYear = await this.page.locator('#year-selector').inputValue();
  const environmentalYearBlock = this.page.locator(`.nis-seccion-ambiental .year-block[data-year="${selectedYear}"]`);
  await expect(environmentalYearBlock).toBeVisible();
});

Given('el usuario ha completado un campo no-empresa \\(año bloqueado\\)', async function () {
  await fillCompanyMinimum(this.page);
  await this.page.locator('.nis-seccion-ambiental').getByRole('radio', { name: /^sí$/i }).first().check();
});

When('el usuario hace clic en el botón "Limpiar"', async function () {
  this.page.once('dialog', (dialog) => dialog.accept());
  const clearButton = this.page.getByRole('button', { name: /limpiar/i }).first();
  await clearButton.click();
});

Then('el formulario se borra completamente', async function () {
  await expect(this.page.getByRole('textbox', { name: /nombre legal/i })).toHaveValue('');
});

Then('el selector de año se desbloquea y permite cambios nuevamente', async function () {
  await expect(this.page.locator('#year-selector')).toBeEnabled();
});

Then('el año anterior vuelve a estar seleccionado por defecto', async function () {
  const { previousYear } = years();
  await expect(this.page.locator('#year-selector')).toHaveValue(String(previousYear));
});

When('el usuario rellena valores numéricos en al menos un campo no-empresa', async function () {
  await this.page.locator('.nis-seccion-ambiental').getByRole('radio', { name: /^sí$/i }).first().check();
  const firstVisibleNumeric = this.page.locator('.nis-seccion-ambiental .year-block input[type="number"]:visible').first();
  await firstVisibleNumeric.fill('10');
});

Then('todos los campos del formulario están deshabilitados \\(modo solo-lectura\\)', async function () {
  const form = this.page.locator('form');
  await expect(form).toHaveClass(/form-read-only/);
  await expect(this.page.locator('input:visible').first()).toBeDisabled();
});

Then('el selector de año está deshabilitado', async function () {
  await expect(this.page.locator('#year-selector')).toBeDisabled();
});

Then('el formulario muestra estilo atenuado \\(grey\\/disabled appearance\\)', async function () {
  const form = this.page.locator('form');
  await expect(form).toHaveClass(/form-read-only/);
});

When('el usuario desplaza la página hacia abajo', async function () {
  const unselectedLabel = this.page.locator('.year-label-unselected');
  this.opacityBeforeScroll = await unselectedLabel.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
  await this.page.evaluate(() => window.scrollBy(0, 500));
  await this.page.waitForTimeout(350);
});

Then('el año no seleccionado se desvanece \\(opacity fade\\) conforme se desplaza', async function () {
  const unselectedLabel = this.page.locator('.year-label-unselected');
  const after = await unselectedLabel.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
  expect(after).toBeLessThanOrEqual(this.opacityBeforeScroll ?? 1);
});

When('el usuario cambia el año al año actual', async function () {
  const { currentYear } = years();
  await this.page.locator('#year-selector').evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(currentYear));
  await this.page.waitForTimeout(250);
});

Then('la etiqueta seleccionada muestra el año actual', async function () {
  const { currentYear } = years();
  await expect(this.page.locator('[data-year-label="selected"]')).toContainText(String(currentYear));
});

Given('que la aplicación está abierta en una pantalla de escritorio \\(≥768px\\)', async function () {
  await this.page.setViewportSize({ width: 1024, height: 768 });
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container .form-field', { timeout: 10000 });
});

Then('el riel de año usa posición sticky', async function () {
  const yearRail = this.page.locator('.year-rail-vertical');
  await expect(yearRail).toBeVisible();
  const position = await yearRail.evaluate((el) => window.getComputedStyle(el).position);
  expect(position).toBe('sticky');
});

Then('las etiquetas de año están visibles', async function () {
  await expect(this.page.locator('[data-year-label="selected"]')).toBeVisible();
  await expect(this.page.locator('[data-year-label="unselected"]')).toBeVisible();
});

Given('que la aplicación está abierta en una pantalla móvil \\(<768px\\)', async function () {
  await this.page.setViewportSize({ width: 375, height: 667 });
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container .form-field', { timeout: 10000 });
});

Then('el riel de año no usa posición sticky', async function () {
  const yearRail = this.page.locator('.year-rail-vertical');
  const position = await yearRail.evaluate((el) => window.getComputedStyle(el).position);
  expect(position).not.toBe('sticky');
});

Then('el selector de año sigue visible', async function () {
  await expect(this.page.locator('#year-selector')).toHaveCount(1);
});
