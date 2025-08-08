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
  testTimeout: 10000,
  
  // Additional Jest configuration for better canvas/DOM support
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously'
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests to avoid state leakage
  resetModules: true
};
