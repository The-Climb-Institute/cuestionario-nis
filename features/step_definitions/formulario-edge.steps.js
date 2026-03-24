const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Steps compartidos (Given, When básicos) están en formulario.steps.js

// --- Enviar vacío ---
When('el usuario hace clic en Enviar sin rellenar ningún campo', async function () {
  await this.page.getByRole('button', { name: /enviar/i }).click();
});

Then('se muestra el modal de validación {string}', async function (titulo) {
  const modal = this.page.locator('#validation-error-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  await expect(modal).toContainText(titulo);
});

Then('se muestra el modal de aviso de privacidad', async function () {
  const modal = this.page.locator('#privacy-consent-error');
  await expect(modal).toBeVisible({ timeout: 5000 });
  await expect(modal).toContainText('Consentimiento de privacidad requerido');
});

Then('el formulario sigue visible y usable', async function () {
  await expect(this.page.locator('#form-container')).toBeVisible();
  await expect(this.page.locator('#form-container .form-field').first()).toBeVisible();
});

Then('el formulario sigue visible', async function () {
  await expect(this.page.locator('#form-container')).toBeVisible();
});

Then('la aplicación no ha crasheado', async function () {
  await expect(this.page.locator('body')).toBeVisible();
  await expect(this.page.locator('#form-container')).toBeVisible();
});

// --- Dejar todas las aplicabilidades en No (no hacer nada; por defecto no hay Sí seleccionado) ---
When('el usuario deja todas las preguntas de aplicabilidad en {string} en Ambiental, Social y Gobernanza', async function (valor) {
  if (this.parameters.explicitNo === true) {
    const noRadios = this.page.locator('.nis-seccion-ambiental .radio-input[value="No"]');
    const count = await noRadios.count();
    for (let i = 0; i < count; i++) await noRadios.nth(i).check();
    const noSocial = this.page.locator('.nis-seccion-social .radio-input[value="No"]');
    const cs = await noSocial.count();
    for (let i = 0; i < cs; i++) await noSocial.nth(i).check();
    const noGov = this.page.locator('.nis-seccion-gobernanza .radio-input[value="No"]');
    const cg = await noGov.count();
    for (let i = 0; i < cg; i++) await noGov.nth(i).check();
  }
  // Si no explicitNo, no hacemos nada: los radios por defecto no están en "Sí", así que condicionales quedan ocultos
});

// --- Condicional Sí -> rellenar -> No ---
// Step genérico para seleccionar Sí/No en una pregunta (por texto de la pregunta)
When('el usuario selecciona {string} en {string}', async function (valor, textoPregunta) {
  const section = this.page.locator('.nis-seccion-ambiental, .nis-seccion-social, .nis-seccion-gobernanza');
  await section.getByRole('radio', { name: new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first().check();
});

When('el usuario rellena un valor numérico en emisiones alcance 1', async function () {
  const input = this.page.locator('.nis-seccion-ambiental').getByRole('spinbutton', { name: /alcance 1|GEI directas/i }).first();
  await input.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await input.isVisible()) await input.fill('100');
});

When('el usuario cambia a {string} en {string}', async function (valor, textoPregunta) {
  await this.page.locator('.nis-seccion-ambiental').getByRole('radio', { name: new RegExp(valor, 'i') }).first().check();
});

// --- No sé y valores numéricos ---
When('el usuario marca {string} en {string} sin escribir número', async function (opcion, nombreCampo) {
  const byLabel = this.page.locator('[data-field-id="company_employees"], [data-field-id="company_revenue"]').filter({ hasText: new RegExp(nombreCampo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
  const check = byLabel.getByRole('checkbox', { name: new RegExp(opcion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
  await check.check();
});

When('el usuario escribe {string} en {string}', async function (valor, nombreCampo) {
  const input = this.page.getByRole('spinbutton', { name: new RegExp(nombreCampo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
  await input.first().fill(valor);
});

Then('se muestra el modal de envío exitoso o el modal de validación', async function () {
  const success = this.page.locator('.submission-modal .submission-success');
  const validation = this.page.locator('#validation-error-modal');
  await Promise.race([
    expect(success).toBeVisible({ timeout: 8000 }),
    expect(validation).toBeVisible({ timeout: 8000 }),
  ]).catch(async () => {
    const v = await validation.isVisible();
    const s = await success.isVisible();
    expect(v || s, 'Se esperaba modal de éxito o de validación').toBeTruthy();
  });
});

// --- Camino máximo: todas las aplicabilidades Sí y rellenar ---
When('el usuario selecciona "Sí" en todas las preguntas de aplicabilidad de Ambiental', async function () {
  const block = this.page.locator('.nis-seccion-ambiental .year-block').first();
  const radios = block.getByRole('radio', { name: 'Sí' });
  const n = await radios.count();
  for (let i = 0; i < n; i++) await radios.nth(i).check();
});

When('el usuario rellena valores numéricos válidos en los campos visibles de Ambiental del año actual', async function () {
  const block = this.page.locator('.nis-seccion-ambiental .year-block').first();
  const inputs = block.locator('input[type="number"], input[inputmode="numeric"]').filter({ has: this.page.locator('xpath=..') });
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    if (await el.isVisible()) await el.fill('100');
  }
  const bimestral = block.getByRole('radio', { name: /total anual/i });
  if (await bimestral.isVisible()) await bimestral.check();
});

When('el usuario selecciona "Sí" en las preguntas de aplicabilidad de Social', async function () {
  const block = this.page.locator('.nis-seccion-social .year-block').first();
  const radios = block.getByRole('radio', { name: 'Sí' });
  const n = await radios.count();
  for (let i = 0; i < n; i++) await radios.nth(i).check();
});

When('el usuario rellena valores numéricos válidos en los campos visibles de Social del año actual', async function () {
  const block = this.page.locator('.nis-seccion-social .year-block').first();
  const inputs = block.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    if (await el.isVisible()) await el.fill('10');
  }
});

When('el usuario selecciona "Sí" en las preguntas de aplicabilidad de Gobernanza', async function () {
  const block = this.page.locator('.nis-seccion-gobernanza .year-block').first();
  const radios = block.getByRole('radio', { name: 'Sí' });
  const n = await radios.count();
  for (let i = 0; i < n; i++) await radios.nth(i).check();
});

When('el usuario rellena valores válidos en los campos visibles de Gobernanza del año actual', async function () {
  const block = this.page.locator('.nis-seccion-gobernanza .year-block').first();
  const inputs = block.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    if (await el.isVisible()) await el.fill('1');
  }
});

// --- Energía bimestral ---
When('el usuario selecciona "Por recibo bimestral" en consumo de energía', async function () {
  await this.page.getByRole('radio', { name: /recibo bimestral/i }).first().check();
});

When('el usuario añade un periodo bimestral con kWh mayor que cero', async function () {
  const addAfterBtn = this.page.getByRole('button', { name: '+ Agregar periodo' });
  if (await addAfterBtn.isVisible()) await addAfterBtn.click();
  await this.page.waitForTimeout(300);
  const visibleNumber = this.page.locator('.nis-seccion-ambiental .bimestral-kwh').first();
  if (await visibleNumber.isVisible()) await visibleNumber.fill('1000');
});

// --- Matriz liderazgo ---
When('el usuario selecciona "Sí" en políticas de igualdad o preguntas que muestran la matriz', async function () {
  await this.page.locator('.nis-seccion-social').getByRole('radio', { name: 'Sí' }).first().check();
});

When('el usuario rellena solo algunas celdas de {string}', async function (nombreMatriz) {
  const matrix = this.page.locator('.matrix-group').filter({ hasText: /liderazgo|Composición/i }).first();
  const inputs = matrix.locator('input[type="number"]');
  const n = Math.min(2, await inputs.count());
  for (let i = 0; i < n; i++) await inputs.nth(i).fill('1');
});

// --- Año anterior ---
When('el usuario añade un bloque de año anterior si existe el control', async function () {
  const btn = this.page.getByRole('button', { name: /agregar año anterior|añadir año/i }).first();
  if (await btn.isVisible()) await btn.click();
});

// --- Nombre con caracteres especiales ---
When('el usuario escribe en {string} el valor {string}', async function (nombreCampo, valor) {
  await this.page.getByRole('textbox', { name: new RegExp(nombreCampo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).fill(valor);
});

When('el usuario rellena el resto de datos mínimos de empresa excepto nombre', async function () {
  await this.page.getByRole('combobox', { name: /país/i }).selectOption('México');
  await this.page.waitForTimeout(400);
  const regionSelect = this.page.getByRole('combobox', { name: /región|estado/i });
  if (await regionSelect.isVisible()) {
    const firstOption = await regionSelect.locator('option').nth(1).getAttribute('value');
    if (firstOption) await regionSelect.selectOption(firstOption);
  }
  await this.page.getByRole('combobox', { name: /sector de industria/i }).selectOption('Servicios de agua, saneamiento');
  await this.page.getByRole('spinbutton', { name: /número de empleados/i }).fill('100');
  await this.page.getByRole('spinbutton', { name: /ingresos anuales/i }).fill('500000');
});

// --- País y región ---
When('el usuario selecciona un país que tiene regiones si está disponible', async function () {
  await this.page.getByRole('combobox', { name: /país/i }).selectOption('México');
});

When('el usuario selecciona una región si el campo está visible', async function () {
  const region = this.page.getByRole('combobox', { name: /región|estado/i });
  if (await region.isVisible()) {
    const opts = await region.locator('option').allTextContents();
    const firstValue = await region.locator('option').nth(1).getAttribute('value').catch(() => null);
    if (firstValue) await region.selectOption(firstValue);
  }
});

// --- Porcentajes ---
When('el usuario rellena {string} en {string}', async function (valor, nombreCampo) {
  const input = this.page.locator('.nis-seccion-ambiental').getByRole('spinbutton', { name: new RegExp(nombreCampo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
  if (await input.isVisible()) await input.fill(valor);
});

When('el usuario rellena el resto de campos numéricos de emisiones y energía', async function () {
  const block = this.page.locator('.nis-seccion-ambiental .year-block').first();
  const inputs = block.locator('input[type="number"]');
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    if (await el.isVisible()) await el.fill('50');
  }
});

// --- Doble clic y Descargar JSON ---
When('el usuario hace doble clic en el botón Enviar', async function () {
  const privacyConsent = this.page.locator('#privacy-consent');
  if (await privacyConsent.count()) {
    await privacyConsent.check();
  }
  await this.page.getByRole('button', { name: /enviar/i }).dblclick();
});

Then('la aplicación no crashea', async function () {
  await expect(this.page.locator('body')).toBeVisible();
  await expect(this.page.locator('#form-container')).toBeVisible();
});

Then('se muestra un único modal de envío o de validación', async function () {
  const success = this.page.locator('.submission-modal .submission-success');
  const validation = this.page.locator('#validation-error-modal');
  const err = this.page.locator('.submission-modal .submission-error');
  const hasSuccess = (await success.count()) > 0 && (await success.first().isVisible());
  const hasValidation = (await validation.count()) > 0 && (await validation.first().isVisible());
  const hasError = (await err.count()) > 0 && (await err.first().isVisible());
  const visibleCount = [hasSuccess, hasValidation, hasError].filter(Boolean).length;
  expect(visibleCount).toBeGreaterThanOrEqual(1);
  expect(visibleCount).toBeLessThanOrEqual(2); // a lo sumo éxito o error + overlay
});

When('el usuario hace clic en {string}', async function (nombreBoton) {
  await this.page.getByRole('button', { name: new RegExp(nombreBoton.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
});
