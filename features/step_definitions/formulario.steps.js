const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/**
 * OpenFormStack en producción: CORS suele bloquear la lectura del cuerpo; el éxito
 * canónico en app es exito_cors (route.abort simula ese caso). El mock JSON 200 es secundario.
 * Ver documentation/planning/decisions.md DEC-04.
 */
const MOCK_SUCCESS_BODY = JSON.stringify({ id: 'e2e-mock-id' });

Given('que la aplicación está abierta', async function () {
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container .form-field', { timeout: 10000 });
});

Given('el backend está configurado para aceptar el envío', async function () {
  await this.page.route((url) => String(url).includes('openformstack.com'), (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: MOCK_SUCCESS_BODY,
    })
  );
});

Given('el backend está configurado para responder con error de servidor', async function () {
  await this.page.route((url) => String(url).includes('openformstack.com'), (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );
});

Given('el backend está configurado para simular fallo de red', async function () {
  await this.page.route((url) => String(url).includes('openformstack.com'), (route) => route.abort('failed'));
});

When('el usuario rellena los datos mínimos de empresa', async function () {
  await this.page.getByRole('textbox', { name: /nombre legal/i }).fill('Empresa E2E Test');
  await this.page.getByRole('combobox', { name: /país/i }).selectOption('México');
  // México tiene regiones; seleccionar la primera para pasar validación de campo requerido
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

When('el usuario hace clic en Enviar', async function () {
  const privacyConsent = this.page.locator('#privacy-consent');
  if (await privacyConsent.count()) {
    await privacyConsent.check();
  }
  await this.page.getByRole('button', { name: /enviar/i }).click();
});

Then('se muestra el modal de envío exitoso', async function () {
  const modal = this.page.locator('.submission-modal .submission-success');
  await expect(modal).toBeVisible({ timeout: 10000 });
  await expect(modal).toContainText('Envío exitoso');
});

Then('el modal muestra un ID de envío', async function () {
  await expect(this.page.locator('.submission-modal')).toContainText('ID de envío');
  await expect(this.page.locator('.submission-modal')).toContainText('e2e-mock-id');
});

Then('se muestra un modal de error', async function () {
  const modal = this.page.locator('.submission-modal .submission-error');
  await expect(modal).toBeVisible({ timeout: 10000 });
});

Then('se muestra el modal "Enviado" con enlace de confirmación', async function () {
  const modal = this.page.locator('.submission-modal .submission-success');
  await expect(modal).toBeVisible({ timeout: 10000 });
  await expect(modal).toContainText('Enviado');
  await expect(modal.locator('a.submission-thankyou-link, a[href*="thank-you"]')).toBeVisible();
});
