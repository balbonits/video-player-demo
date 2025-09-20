module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        // Performance Requirements (FOX TV App Standards)
        'categories:performance': ['error', {minScore: 0.85}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['error', {minScore: 0.90}],
        'categories:seo': ['error', {minScore: 0.90}],

        // Core Web Vitals (Smart TV Optimized)
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}],
        'first-contentful-paint': ['error', {maxNumericValue: 1800}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'total-blocking-time': ['error', {maxNumericValue: 300}],

        // Video Player Specific Metrics
        'speed-index': ['error', {maxNumericValue: 3000}],
        'interactive': ['error', {maxNumericValue: 3500}],

        // Resource Optimization
        'unused-javascript': ['warn', {maxNumericValue: 100000}],
        'unused-css-rules': ['warn', {maxNumericValue: 50000}],
        'modern-image-formats': ['warn', {}],
        'uses-optimized-images': ['warn', {}],
        'uses-text-compression': ['error', {}],

        // Accessibility (WCAG 2.1 AA Compliance)
        'color-contrast': ['error', {}],
        'heading-order': ['error', {}],
        'html-has-lang': ['error', {}],
        'image-alt': ['error', {}],
        'label': ['error', {}],
        'link-name': ['error', {}],
        'list': ['error', {}],

        // Security Headers
        'csp-xss': ['warn', {}],
        'is-on-https': ['error', {}],

        // Progressive Web App Features
        'installable-manifest': ['warn', {}],
        'splash-screen': ['warn', {}],
        'themed-omnibox': ['warn', {}],

        // Mobile Performance (Smart TV Constraints)
        'render-blocking-resources': ['warn', {}],
        'uses-responsive-images': ['error', {}],
        'efficient-animated-content': ['warn', {}]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

// Additional configuration for different environments
if (process.env.CI) {
  module.exports.ci.collect.url = [process.env.LIGHTHOUSE_URL || 'http://localhost:3000'];
}

if (process.env.NODE_ENV === 'production') {
  // Production-specific assertions (stricter requirements)
  module.exports.ci.assert.assertions['categories:performance'][1].minScore = 0.90;
  module.exports.ci.assert.assertions['largest-contentful-paint'][1].maxNumericValue = 2000;
  module.exports.ci.assert.assertions['first-contentful-paint'][1].maxNumericValue = 1500;
}