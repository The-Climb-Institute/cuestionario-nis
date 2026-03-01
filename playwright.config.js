/** Used by E2E (Cucumber) for baseURL; server is started by start-server-and-test. */
module.exports = {
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
};
