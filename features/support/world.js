const { World } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class PlaywrightWorld extends World {
  constructor(options) {
    super(options);
    this.baseURL = this.parameters.baseURL || 'http://localhost:3000';
    this.headless = this.parameters.headless !== false;
    this.browser = null;
    this.page = null;
  }
}

async function initBrowser(headless = true) {
  return chromium.launch({ headless: headless !== false });
}

module.exports = { PlaywrightWorld, initBrowser };
