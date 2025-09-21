/**
 * Jest Configuration for Video Player Demo
 * Sam (QA) - Performance and accessibility testing configuration
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },

  // Coverage configuration for FOX quality standards
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],

  // Coverage thresholds - Sam's 90% requirement
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Critical components require higher coverage
    'src/components/VideoPlayer/**/*.{js,jsx,ts,tsx}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/components/HLSVideoPlayer.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Test timeout for performance tests
  testTimeout: 30000,


  // Global variables for performance testing
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    },
    // Smart TV performance constraints
    SMART_TV_MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
    SMART_TV_CPU_LIMIT: 30, // 30%
    SMART_TV_INPUT_LATENCY_LIMIT: 150, // 150ms
    SMART_TV_VIDEO_START_LIMIT: 3000 // 3 seconds
  },

  // Reporters for CI/CD integration
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-results/html',
      filename: 'jest-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Video Player Demo - Test Results',
      logoImgPath: undefined,
      darkTheme: false,
    }],
    ['jest-junit', {
      outputDirectory: './test-results/junit',
      outputName: 'junit.xml',
      ancestorSeparator: ' › ',
      uniqueOutputName: 'false',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      includeConsoleOutput: true
    }]
  ],

  // Coverage reporters with multiple formats
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover'
  ],

  // Coverage directory
  coverageDirectory: './coverage',

}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)