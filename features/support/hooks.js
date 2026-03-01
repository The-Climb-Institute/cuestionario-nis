const { Before, After, setWorldConstructor } = require('@cucumber/cucumber');
const { PlaywrightWorld, initBrowser } = require('./world');

setWorldConstructor(PlaywrightWorld);

Before(async function () {
  this.browser = await initBrowser();
  this.page = await this.browser.newPage();
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});
