/**
 * Playwright Configuration for Cross-Browser Performance Testing
 * Sam (QA) - Smart TV and cross-platform performance validation
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Test timeout and retries
  timeout: 60000, // 60 seconds for performance tests
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration for CI/CD integration
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Global test configuration
  use: {
    // Base URL for testing
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Performance tracking
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Smart TV simulation settings
    viewport: { width: 1920, height: 1080 }, // Default to Smart TV resolution
    ignoreHTTPSErrors: true,

    // Performance metrics collection
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Project configurations for different platforms
  projects: [
    // Smart TV Testing (Primary FOX target)
    {
      name: 'smart-tv',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
        userAgent: 'Mozilla/5.0 (SmartTV; Tizen 4.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.146 TV Safari/537.36'
      },
      testMatch: /.*smart-tv.*\.spec\.ts/
    },

    // Desktop Chrome (Primary development target)
    {
      name: 'chrome-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: /.*smart-tv.*\.spec\.ts/
    },

    // Desktop Safari (HLS native support testing)
    {
      name: 'safari-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /.*safari.*\.spec\.ts/
    },

    // Mobile Chrome (Performance constraints testing)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // Simulate lower-end device constraints
        deviceScaleFactor: 2,
        hasTouch: true
      },
      testMatch: /.*mobile.*\.spec\.ts/
    },

    // Mobile Safari (iOS HLS testing)
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        deviceScaleFactor: 3,
        hasTouch: true
      },
      testMatch: /.*mobile.*\.spec\.ts/
    },

    // Firefox (Cross-browser compatibility)
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /.*firefox.*\.spec\.ts/
    },

    // Edge (Enterprise environment testing)
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /.*edge.*\.spec\.ts/
    },

    // Accessibility testing with screen readers
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Simulate screen reader environment
        colorScheme: 'light',
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 JAWS/2023'
        }
      },
      testMatch: /.*accessibility.*\.spec\.ts/
    }
  ],

  // Web server configuration for testing
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse existing server
    timeout: 120000,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts')
})