const { Before, After, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { PlaywrightWorld, initBrowser } = require('./world');

setDefaultTimeout(15000);
setWorldConstructor(PlaywrightWorld);

Before(async function () {
  this.browser = await initBrowser(this.parameters.headless);
  this.page = await this.browser.newPage();
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});
