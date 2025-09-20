/**
 * Jest Performance Setup for Smart TV Constraints
 * Sam (QA) - Performance testing environment configuration
 */

import { jest } from '@jest/globals'

// Performance monitoring setup for Smart TV testing
beforeEach(() => {
  // Reset performance counters
  if (global.performance && global.performance.memory) {
    global.performance.memory.usedJSHeapSize = 50 * 1024 * 1024 // 50MB baseline
  }

  // Clear performance marks and measures
  if (global.performance.clearMarks) {
    global.performance.clearMarks()
  }
  if (global.performance.clearMeasures) {
    global.performance.clearMeasures()
  }

  // Mock performance observer for advanced monitoring
  global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
  }))
})

// Performance test utilities specific to Smart TV constraints
global.performanceTestUtils = {
  // Smart TV performance limits
  CONSTRAINTS: {
    MEMORY_LIMIT_MB: 100,
    CPU_USAGE_PERCENT: 30,
    INPUT_LATENCY_MS: 150,
    VIDEO_START_TIME_MS: 3000,
    MIN_FPS: 30
  },

  // Performance measurement utilities
  measureMemoryUsage: () => {
    if (global.performance && global.performance.memory) {
      return global.performance.memory.usedJSHeapSize
    }
    return 0
  },

  measureInputLatency: async (element, inputType = 'keyboard') => {
    const startTime = performance.now()

    const measureEnd = () => {
      const endTime = performance.now()
      return endTime - startTime
    }

    if (inputType === 'keyboard') {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    }
    element.focus()

    return measureEnd()
  },

  simulateCPULoad: (duration = 1000) => {
    const start = Date.now()
    while (Date.now() - start < duration) {
      // Busy loop to simulate CPU usage
      Math.random()
    }
  },

  createPerformanceMarker: (name) => {
    const startTime = performance.now()
    return {
      end: () => performance.now() - startTime,
      mark: () => {
        if (performance.mark) {
          performance.mark(name)
        }
      }
    }
  },

  validateConstraints: (metrics) => {
    const violations = []

    if (metrics.memoryUsage > global.performanceTestUtils.CONSTRAINTS.MEMORY_LIMIT_MB * 1024 * 1024) {
      violations.push(`Memory usage exceeded: ${metrics.memoryUsage / (1024 * 1024)}MB > ${global.performanceTestUtils.CONSTRAINTS.MEMORY_LIMIT_MB}MB`)
    }

    if (metrics.inputLatency > global.performanceTestUtils.CONSTRAINTS.INPUT_LATENCY_MS) {
      violations.push(`Input latency exceeded: ${metrics.inputLatency}ms > ${global.performanceTestUtils.CONSTRAINTS.INPUT_LATENCY_MS}ms`)
    }

    if (metrics.videoStartTime > global.performanceTestUtils.CONSTRAINTS.VIDEO_START_TIME_MS) {
      violations.push(`Video start time exceeded: ${metrics.videoStartTime}ms > ${global.performanceTestUtils.CONSTRAINTS.VIDEO_START_TIME_MS}ms`)
    }

    return violations
  },

  // Mock performance monitoring for Web Component
  mockWebComponentPerformance: () => ({
    getPerformanceMetrics: jest.fn(() => ({
      memoryUsage: 45 * 1024 * 1024, // 45MB - under limit
      cpuUsage: 25, // 25% - under limit
      inputLatency: 85, // 85ms - under limit
      videoStartTime: 1200, // 1.2s - under limit
      bufferingRatio: 0.05 // 5% buffering
    })),

    optimizeForSmartTV: jest.fn(),
    optimizeForMobile: jest.fn(),
    optimizeForDesktop: jest.fn(),

    performMemoryCleanup: jest.fn(),
    throttleAnimations: jest.fn(),

    dispatchPerformanceEvent: jest.fn((type, data) => {
      const event = new CustomEvent('hls-performance', {
        detail: { type, data, timestamp: Date.now() }
      })

      // If element is available, dispatch to it
      if (typeof document !== 'undefined') {
        const player = document.querySelector('hls-video-player')
        if (player) {
          player.dispatchEvent(event)
        } else {
          document.dispatchEvent(event)
        }
      }
    })
  })
}

// Performance regression detection
global.performanceRegression = {
  baselines: new Map(),

  setBaseline: (testName, metrics) => {
    global.performanceRegression.baselines.set(testName, metrics)
  },

  checkRegression: (testName, currentMetrics, tolerancePercent = 10) => {
    const baseline = global.performanceRegression.baselines.get(testName)
    if (!baseline) {
      return { passed: true, message: 'No baseline set' }
    }

    const regressions = []

    for (const [key, baselineValue] of Object.entries(baseline)) {
      const currentValue = currentMetrics[key]
      if (currentValue && typeof currentValue === 'number' && typeof baselineValue === 'number') {
        const percentChange = ((currentValue - baselineValue) / baselineValue) * 100

        if (percentChange > tolerancePercent) {
          regressions.push(`${key}: ${percentChange.toFixed(1)}% regression (${baselineValue} → ${currentValue})`)
        }
      }
    }

    return {
      passed: regressions.length === 0,
      message: regressions.length > 0 ? `Performance regressions detected: ${regressions.join(', ')}` : 'No regressions detected'
    }
  }
}

// Mock timing APIs for consistent testing
if (!global.performance.now) {
  let now = 0
  global.performance.now = jest.fn(() => {
    now += 16.67 // Simulate 60fps timing
    return now
  })
}

// Enhanced error handling for performance tests
const originalConsoleWarn = console.warn
console.warn = jest.fn((...args) => {
  // Only warn about actual performance issues, not test warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('performance')) {
    originalConsoleWarn.call(console, ...args)
  }
})

afterEach(() => {
  // Clean up performance monitoring
  if (global.PerformanceObserver && global.PerformanceObserver.mockClear) {
    global.PerformanceObserver.mockClear()
  }
})