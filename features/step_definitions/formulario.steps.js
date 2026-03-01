const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const OPENFORMSTACK_URL = '**/openformstack.com/**';
const MOCK_SUCCESS_BODY = JSON.stringify({ id: 'e2e-mock-id' });

Given('que la aplicación está abierta', async function () {
  await this.page.goto(this.baseURL);
  await this.page.waitForSelector('#form-container .form-field', { timeout: 10000 });
});

Given('que el backend acepta el envío', async function () {
  await this.page.route(OPENFORMSTACK_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: MOCK_SUCCESS_BODY,
    })
  );
});

Given('que el backend devuelve error de servidor', async function () {
  await this.page.route(OPENFORMSTACK_URL, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );
});

Given('que el backend simula fallo de red', async function () {
  await this.page.route(OPENFORMSTACK_URL, (route) => route.abort('failed'));
});

When('el usuario rellena los datos mínimos de empresa', async function () {
  await this.page.getByRole('textbox', { name: /nombre legal/i }).fill('Empresa E2E Test');
  await this.page.getByRole('textbox', { name: /país/i }).fill('México');
  await this.page.getByRole('combobox', { name: /sector de industria/i }).selectOption('Servicios de agua, saneamiento');
  await this.page.getByRole('combobox', { name: /tamaño de la empresa/i }).selectOption('Mediana (51-250 empleados)');
});

When('el usuario hace clic en Enviar', async function () {
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
