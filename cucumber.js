module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
    worldParameters: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      headless: process.env.HEADLESS !== 'false' && process.env.SHOW_BROWSER !== '1',
    },
    format: process.env.CI ? ['progress'] : ['progress', 'html:report.html'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};
