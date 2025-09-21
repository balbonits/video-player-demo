/**
 * Lighthouse CI Configuration for Video Player Performance Monitoring
 *
 * This configuration demonstrates how we use Lighthouse to monitor and improve
 * video streaming performance, focusing on metrics critical for Smart TV and OTT applications.
 */

module.exports = {
  ci: {
    collect: {
      // Test URLs for different player implementations
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/hls',
        'http://localhost:3000/mobile',
        'http://localhost:3000/roku',
        'http://localhost:3000/native'
      ],
      numberOfRuns: 3,
      settings: {
        // Simulate Smart TV constraints
        throttling: {
          cpuSlowdownMultiplier: 4, // Smart TV CPU constraint
          requestLatency: 150,      // TV network latency
          downloadThroughput: 10000 // 10 Mbps connection
        },
        screenEmulation: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    },

    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // Core Web Vitals - Critical for TV Experience
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Memory constraints for Smart TV
        'total-byte-weight': ['error', { maxNumericValue: 5000000 }], // 5MB max
        'dom-size': ['error', { maxNumericValue: 1500 }],

        // JavaScript performance
        'mainthread-work-breakdown': ['error', { maxNumericValue: 4000 }],
        'bootup-time': ['error', { maxNumericValue: 3000 }],

        // Network efficiency
        'uses-http2': 'error',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',

        // Accessibility for TV interfaces
        'color-contrast': 'error',
        'heading-order': 'error',
        'meta-viewport': 'error',

        // Video-specific checks
        'video-caption': 'error',
        'video-description': 'warn'
      }
    },

    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: 'lighthouse-report-%%PATHNAME%%-%%DATETIME%%.%%EXTENSION%%'
    },

    // Smart TV specific performance budgets
    budgets: [
      {
        path: '/*',
        timings: [
          { metric: 'first-contentful-paint', budget: 1800 },
          { metric: 'largest-contentful-paint', budget: 2500 },
          { metric: 'first-meaningful-paint', budget: 2000 },
          { metric: 'speed-index', budget: 3000 },
          { metric: 'interactive', budget: 5000 }
        ],
        resourceSizes: [
          { resourceType: 'script', budget: 500 }, // 500KB max JS
          { resourceType: 'total', budget: 5000 },  // 5MB total
          { resourceType: 'image', budget: 1000 },  // 1MB images
          { resourceType: 'stylesheet', budget: 100 } // 100KB CSS
        ],
        resourceCounts: [
          { resourceType: 'script', budget: 10 },
          { resourceType: 'third-party', budget: 5 }
        ]
      }
    ]
  }
};