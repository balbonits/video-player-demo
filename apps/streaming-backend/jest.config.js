/**
 * Jest Configuration for Video Streaming Backend
 * Sam (QA) - Enterprise-level backend testing configuration
 */

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server.js',
    'api/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Sam's 90% requirement with higher standards for critical streaming components
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Streaming endpoints require near-perfect coverage
    'server.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  verbose: true,
  testTimeout: 15000,

  // Enhanced reporting for CI/CD integration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results/junit',
      outputName: 'junit.xml',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],

  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover'
  ],

  // Setup files for backend testing
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Global test configuration for streaming
  globals: {
    STREAMING_TEST_TIMEOUT: 30000,
    HLS_SEGMENT_TIMEOUT: 10000,
    CORS_TEST_ORIGINS: ['http://localhost:3000', 'https://vercel.app']
  }
};