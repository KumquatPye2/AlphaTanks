module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    '!test-setup.js',
    '!jest.config.js',
    '!serve.py',
    '!read_pdf.py'
  ],
  verbose: true,
  testTimeout: 10000
};
