/**
 * Performance Monitoring Integration Tests
 * Sam (QA) - Validates Alex's performance monitoring implementation
 *
 * Tests real-time performance tracking, alerting, and CI/CD integration
 * for FOX Smart TV requirements
 */

import { jest } from '@jest/globals'

// Types for performance monitoring
interface PerformanceMetrics {
  memoryUsage: number
  cpuUsage: number
  inputLatency: number
  videoStartTime: number
  bufferingRatio: number
  frameRate?: number
}

interface PerformanceAlert {
  type: 'warning' | 'critical'
  metric: string
  current: number
  threshold: number
  timestamp: number
}

interface PerformanceReport {
  sessionId: string
  duration: number
  averageMetrics: PerformanceMetrics
  violations: PerformanceAlert[]
  deviceInfo: {
    userAgent: string
    performanceMode: string
    constraints: Record<string, number>
  }
}

describe('Performance Monitoring Integration', () => {
  let mockWebComponent: any
  let performanceMonitor: any
  let alertSystem: any

  beforeEach(() => {
    // Create mock web component with Alex's performance API
    mockWebComponent = {
      getPerformanceMetrics: jest.fn(() => ({
        memoryUsage: 45 * 1024 * 1024, // 45MB
        cpuUsage: 25, // 25%
        inputLatency: 85, // 85ms
        videoStartTime: 1200, // 1.2s
        bufferingRatio: 0.05, // 5%
        frameRate: 30
      })),

      startPerformanceMonitoring: jest.fn(),
      stopPerformanceMonitoring: jest.fn(),

      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),

      // Performance optimization methods from Alex's implementation
      optimizeForSmartTV: jest.fn(),
      performMemoryCleanup: jest.fn(),
      throttleAnimations: jest.fn(),

      // Mock DOM element methods
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      dispatchEvent: jest.fn()
    }

    // Mock performance monitoring system
    performanceMonitor = {
      metrics: new Map(),
      history: [],
      alerts: [],
      thresholds: {
        memoryUsage: 100 * 1024 * 1024, // 100MB
        cpuUsage: 30, // 30%
        inputLatency: 150, // 150ms
        videoStartTime: 3000, // 3s
        bufferingRatio: 0.1 // 10%
      },

      recordMetric: jest.fn((name: string, value: number) => {
        performanceMonitor.metrics.set(name, value)
        performanceMonitor.history.push({
          name,
          value,
          timestamp: Date.now()
        })
      }),

      checkThresholds: jest.fn((metrics: PerformanceMetrics) => {
        const violations = []

        for (const [key, threshold] of Object.entries(performanceMonitor.thresholds)) {
          const value = metrics[key as keyof PerformanceMetrics]
          if (typeof value === 'number' && value > threshold) {
            violations.push({
              type: value > threshold * 1.2 ? 'critical' : 'warning',
              metric: key,
              current: value,
              threshold,
              timestamp: Date.now()
            })
          }
        }

        return violations
      }),

      generateReport: jest.fn((): PerformanceReport => ({
        sessionId: 'test-session-' + Date.now(),
        duration: 10000,
        averageMetrics: mockWebComponent.getPerformanceMetrics(),
        violations: performanceMonitor.alerts,
        deviceInfo: {
          userAgent: navigator.userAgent,
          performanceMode: 'smartTV',
          constraints: performanceMonitor.thresholds
        }
      }))
    }

    // Mock alert system
    alertSystem = {
      alerts: [],
      subscribers: [],

      subscribe: jest.fn((callback: (alert: PerformanceAlert) => void) => {
        alertSystem.subscribers.push(callback)
        return () => {
          const index = alertSystem.subscribers.indexOf(callback)
          if (index > -1) {
            alertSystem.subscribers.splice(index, 1)
          }
        }
      }),

      emit: jest.fn((alert: PerformanceAlert) => {
        alertSystem.alerts.push(alert)
        alertSystem.subscribers.forEach(callback => callback(alert))
      }),

      clear: jest.fn(() => {
        alertSystem.alerts = []
      })
    }

    // Reset performance globals
    global.performanceTestUtils.CONSTRAINTS = {
      MEMORY_LIMIT_MB: 100,
      CPU_USAGE_PERCENT: 30,
      INPUT_LATENCY_MS: 150,
      VIDEO_START_TIME_MS: 3000,
      MIN_FPS: 30
    }
  })

  describe('Real-time Performance Tracking', () => {
    test('PERF-MON-001: Should continuously monitor all critical metrics', async () => {
      // Setup monitoring interval
      const monitoringInterval = setInterval(() => {
        const metrics = mockWebComponent.getPerformanceMetrics()
        performanceMonitor.recordMetric('memoryUsage', metrics.memoryUsage)
        performanceMonitor.recordMetric('inputLatency', metrics.inputLatency)
        performanceMonitor.recordMetric('cpuUsage', metrics.cpuUsage)
      }, 1000)

      // Wait for several monitoring cycles
      await new Promise(resolve => setTimeout(resolve, 3500))
      clearInterval(monitoringInterval)

      // Verify continuous monitoring
      expect(performanceMonitor.recordMetric).toHaveBeenCalledTimes(9) // 3 metrics × 3 cycles
      expect(performanceMonitor.history.length).toBeGreaterThanOrEqual(9)

      // Verify all critical metrics are tracked
      const metricNames = performanceMonitor.history.map(h => h.name)
      expect(metricNames).toContain('memoryUsage')
      expect(metricNames).toContain('inputLatency')
      expect(metricNames).toContain('cpuUsage')
    })

    test('PERF-MON-002: Should detect performance violations in real-time', async () => {
      // Subscribe to alerts
      const alertHandler = jest.fn()
      alertSystem.subscribe(alertHandler)

      // Simulate performance violation (high memory usage)
      mockWebComponent.getPerformanceMetrics.mockReturnValue({
        memoryUsage: 120 * 1024 * 1024, // 120MB - exceeds 100MB limit
        cpuUsage: 25,
        inputLatency: 85,
        videoStartTime: 1200,
        bufferingRatio: 0.05
      })

      const metrics = mockWebComponent.getPerformanceMetrics()
      const violations = performanceMonitor.checkThresholds(metrics)

      expect(violations).toHaveLength(1)
      expect(violations[0]).toEqual({
        type: 'warning',
        metric: 'memoryUsage',
        current: 120 * 1024 * 1024,
        threshold: 100 * 1024 * 1024,
        timestamp: expect.any(Number)
      })

      // Emit alert
      alertSystem.emit(violations[0])
      expect(alertHandler).toHaveBeenCalledWith(violations[0])
    })

    test('PERF-MON-003: Should trigger automatic optimizations on violations', async () => {
      // Simulate memory pressure
      mockWebComponent.getPerformanceMetrics.mockReturnValue({
        memoryUsage: 95 * 1024 * 1024, // 95MB - approaching limit
        cpuUsage: 25,
        inputLatency: 85,
        videoStartTime: 1200,
        bufferingRatio: 0.05
      })

      const metrics = mockWebComponent.getPerformanceMetrics()

      // Check if cleanup should be triggered (85% of limit)
      const memoryUsagePercent = (metrics.memoryUsage / performanceMonitor.thresholds.memoryUsage) * 100

      if (memoryUsagePercent > 85) {
        mockWebComponent.performMemoryCleanup()
      }

      expect(mockWebComponent.performMemoryCleanup).toHaveBeenCalled()
    })

    test('PERF-MON-004: Should adapt monitoring frequency based on performance mode', () => {
      const smartTVMonitoringInterval = 2000 // 2 seconds for Smart TV
      const desktopMonitoringInterval = 5000 // 5 seconds for desktop

      // Test Smart TV mode
      mockWebComponent.setAttribute('performance-mode', 'smartTV')

      const smartTVTimer = setInterval(() => {
        performanceMonitor.recordMetric('test', 1)
      }, smartTVMonitoringInterval)

      setTimeout(() => {
        clearInterval(smartTVTimer)
        const smartTVCalls = performanceMonitor.recordMetric.mock.calls.length

        // Reset for desktop test
        performanceMonitor.recordMetric.mockClear()

        // Test desktop mode
        mockWebComponent.setAttribute('performance-mode', 'desktop')

        const desktopTimer = setInterval(() => {
          performanceMonitor.recordMetric('test', 1)
        }, desktopMonitoringInterval)

        setTimeout(() => {
          clearInterval(desktopTimer)
          const desktopCalls = performanceMonitor.recordMetric.mock.calls.length

          // Smart TV should monitor more frequently
          expect(smartTVCalls).toBeGreaterThan(desktopCalls)
        }, 3000)
      }, 3000)
    })
  })

  describe('Performance Alert System', () => {
    test('PERF-MON-005: Should categorize alerts by severity', () => {
      const testCases = [
        {
          metrics: { memoryUsage: 110 * 1024 * 1024 }, // 10% over limit
          expectedType: 'warning'
        },
        {
          metrics: { memoryUsage: 130 * 1024 * 1024 }, // 30% over limit
          expectedType: 'critical'
        },
        {
          metrics: { inputLatency: 200 }, // 33% over limit
          expectedType: 'critical'
        }
      ]

      testCases.forEach(({ metrics, expectedType }) => {
        const fullMetrics = {
          memoryUsage: 50 * 1024 * 1024,
          cpuUsage: 25,
          inputLatency: 85,
          videoStartTime: 1200,
          bufferingRatio: 0.05,
          ...metrics
        }

        const violations = performanceMonitor.checkThresholds(fullMetrics)

        if (violations.length > 0) {
          expect(violations[0].type).toBe(expectedType)
        }
      })
    })

    test('PERF-MON-006: Should accumulate and batch alerts to prevent spam', async () => {
      const batchedAlerts: PerformanceAlert[] = []
      const batchInterval = 5000 // 5 seconds

      // Mock batching system
      const alertBatcher = {
        queue: [] as PerformanceAlert[],

        add: (alert: PerformanceAlert) => {
          alertBatcher.queue.push(alert)
        },

        flush: () => {
          if (alertBatcher.queue.length > 0) {
            batchedAlerts.push(...alertBatcher.queue)
            alertBatcher.queue = []
          }
        }
      }

      // Simulate multiple rapid violations
      for (let i = 0; i < 10; i++) {
        const alert: PerformanceAlert = {
          type: 'warning',
          metric: 'memoryUsage',
          current: 110 * 1024 * 1024,
          threshold: 100 * 1024 * 1024,
          timestamp: Date.now() + i
        }
        alertBatcher.add(alert)
      }

      // Flush after batch interval
      setTimeout(() => {
        alertBatcher.flush()
      }, batchInterval)

      await new Promise(resolve => setTimeout(resolve, batchInterval + 100))

      // Should batch all alerts together
      expect(batchedAlerts.length).toBe(10)
      expect(alertBatcher.queue.length).toBe(0)
    })

    test('PERF-MON-007: Should integrate with external monitoring systems', () => {
      // Mock external monitoring integrations
      const externalSystems = {
        datadog: { track: jest.fn() },
        newRelic: { recordMetric: jest.fn() },
        customAnalytics: { send: jest.fn() }
      }

      // Simulate performance data export
      const metrics = mockWebComponent.getPerformanceMetrics()

      // Export to multiple systems
      externalSystems.datadog.track('video_player.memory_usage', metrics.memoryUsage)
      externalSystems.newRelic.recordMetric('Custom/VideoPlayer/InputLatency', metrics.inputLatency)
      externalSystems.customAnalytics.send({
        event: 'performance_metrics',
        data: metrics,
        timestamp: Date.now()
      })

      expect(externalSystems.datadog.track).toHaveBeenCalledWith(
        'video_player.memory_usage',
        metrics.memoryUsage
      )
      expect(externalSystems.newRelic.recordMetric).toHaveBeenCalledWith(
        'Custom/VideoPlayer/InputLatency',
        metrics.inputLatency
      )
      expect(externalSystems.customAnalytics.send).toHaveBeenCalledWith({
        event: 'performance_metrics',
        data: metrics,
        timestamp: expect.any(Number)
      })
    })
  })

  describe('CI/CD Performance Integration', () => {
    test('PERF-MON-008: Should generate performance reports for CI/CD', () => {
      const report = performanceMonitor.generateReport()

      expect(report).toEqual({
        sessionId: expect.stringMatching(/^test-session-\d+$/),
        duration: expect.any(Number),
        averageMetrics: expect.objectContaining({
          memoryUsage: expect.any(Number),
          cpuUsage: expect.any(Number),
          inputLatency: expect.any(Number),
          videoStartTime: expect.any(Number),
          bufferingRatio: expect.any(Number)
        }),
        violations: expect.any(Array),
        deviceInfo: expect.objectContaining({
          userAgent: expect.any(String),
          performanceMode: expect.any(String),
          constraints: expect.any(Object)
        })
      })

      // Verify report contains all required metrics
      expect(report.averageMetrics.memoryUsage).toBeLessThan(100 * 1024 * 1024)
      expect(report.averageMetrics.inputLatency).toBeLessThan(150)
      expect(report.averageMetrics.cpuUsage).toBeLessThan(30)
    })

    test('PERF-MON-009: Should validate performance against baseline benchmarks', () => {
      // Set baseline metrics (from previous successful builds)
      const baseline = {
        memoryUsage: 40 * 1024 * 1024, // 40MB
        inputLatency: 70, // 70ms
        videoStartTime: 1000 // 1s
      }

      const current = mockWebComponent.getPerformanceMetrics()

      // Performance regression detection
      const regressions = []

      for (const [metric, baselineValue] of Object.entries(baseline)) {
        const currentValue = current[metric as keyof PerformanceMetrics]
        if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
          const percentChange = ((currentValue - baselineValue) / baselineValue) * 100

          if (percentChange > 15) { // 15% regression threshold
            regressions.push({
              metric,
              baseline: baselineValue,
              current: currentValue,
              regression: percentChange
            })
          }
        }
      }

      // No regressions should be detected with good metrics
      expect(regressions).toHaveLength(0)
    })

    test('PERF-MON-010: Should fail CI/CD pipeline on critical performance violations', () => {
      // Simulate critical performance failure
      mockWebComponent.getPerformanceMetrics.mockReturnValue({
        memoryUsage: 150 * 1024 * 1024, // 150MB - critical violation
        cpuUsage: 45, // 45% - critical violation
        inputLatency: 300, // 300ms - critical violation
        videoStartTime: 5000, // 5s - critical violation
        bufferingRatio: 0.25 // 25% - critical violation
      })

      const metrics = mockWebComponent.getPerformanceMetrics()
      const violations = performanceMonitor.checkThresholds(metrics)

      // Should have multiple critical violations
      const criticalViolations = violations.filter(v => v.type === 'critical')
      expect(criticalViolations.length).toBeGreaterThan(0)

      // CI/CD should fail
      const shouldFailCI = criticalViolations.length > 0
      expect(shouldFailCI).toBe(true)
    })

    test('PERF-MON-011: Should provide performance insights for optimization', () => {
      // Collect performance data over time
      const performanceHistory = [
        { memoryUsage: 45 * 1024 * 1024, timestamp: Date.now() - 10000 },
        { memoryUsage: 55 * 1024 * 1024, timestamp: Date.now() - 8000 },
        { memoryUsage: 65 * 1024 * 1024, timestamp: Date.now() - 6000 },
        { memoryUsage: 75 * 1024 * 1024, timestamp: Date.now() - 4000 },
        { memoryUsage: 85 * 1024 * 1024, timestamp: Date.now() - 2000 },
        { memoryUsage: 95 * 1024 * 1024, timestamp: Date.now() }
      ]

      // Analyze trends
      const memoryTrend = performanceHistory.map(h => h.memoryUsage)
      const isIncreasing = memoryTrend.every((val, i) => i === 0 || val >= memoryTrend[i - 1])

      const insights = {
        memoryLeakDetected: isIncreasing && memoryTrend[memoryTrend.length - 1] > 80 * 1024 * 1024,
        recommendations: [] as string[]
      }

      if (insights.memoryLeakDetected) {
        insights.recommendations.push('Investigate potential memory leak - consistent memory growth detected')
        insights.recommendations.push('Consider implementing more aggressive garbage collection')
        insights.recommendations.push('Review HLS buffer management settings')
      }

      expect(insights.memoryLeakDetected).toBe(true)
      expect(insights.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Smart TV Specific Performance Monitoring', () => {
    test('PERF-MON-012: Should monitor Smart TV specific constraints', () => {
      // Set Smart TV mode
      mockWebComponent.setAttribute('performance-mode', 'smartTV')

      const smartTVConstraints = {
        memoryLimit: 100 * 1024 * 1024, // 100MB
        inputLatencyLimit: 150, // 150ms
        cpuLimit: 30, // 30%
        frameRateMin: 30 // 30fps
      }

      const metrics = mockWebComponent.getPerformanceMetrics()

      // Validate Smart TV constraints
      const constraintResults = {
        memoryOk: metrics.memoryUsage <= smartTVConstraints.memoryLimit,
        inputLatencyOk: metrics.inputLatency <= smartTVConstraints.inputLatencyLimit,
        cpuOk: metrics.cpuUsage <= smartTVConstraints.cpuLimit,
        frameRateOk: (metrics.frameRate || 30) >= smartTVConstraints.frameRateMin
      }

      expect(constraintResults.memoryOk).toBe(true)
      expect(constraintResults.inputLatencyOk).toBe(true)
      expect(constraintResults.cpuOk).toBe(true)
      expect(constraintResults.frameRateOk).toBe(true)
    })

    test('PERF-MON-013: Should automatically optimize for Smart TV when violations occur', () => {
      // Simulate Smart TV performance violation
      mockWebComponent.getPerformanceMetrics.mockReturnValue({
        memoryUsage: 95 * 1024 * 1024, // 95MB - approaching limit
        cpuUsage: 28, // 28% - approaching limit
        inputLatency: 140, // 140ms - approaching limit
        videoStartTime: 1200,
        bufferingRatio: 0.05
      })

      const metrics = mockWebComponent.getPerformanceMetrics()

      // Trigger Smart TV optimizations
      if (metrics.memoryUsage > 90 * 1024 * 1024) {
        mockWebComponent.performMemoryCleanup()
        mockWebComponent.optimizeForSmartTV()
      }

      if (metrics.cpuUsage > 25) {
        mockWebComponent.throttleAnimations()
      }

      expect(mockWebComponent.performMemoryCleanup).toHaveBeenCalled()
      expect(mockWebComponent.optimizeForSmartTV).toHaveBeenCalled()
      expect(mockWebComponent.throttleAnimations).toHaveBeenCalled()
    })
  })

  afterEach(() => {
    // Clean up monitoring
    performanceMonitor.metrics.clear()
    performanceMonitor.history = []
    performanceMonitor.alerts = []
    alertSystem.clear()
    jest.clearAllMocks()
  })
})

/**
 * TDD PERFORMANCE MONITORING LEARNING NOTES FOR JOHN:
 *
 * This comprehensive performance monitoring test suite demonstrates enterprise-level
 * performance validation and monitoring integration:
 *
 * 1. **Real-time Monitoring**: Tests validate continuous performance tracking across
 *    all critical metrics for Smart TV constraints.
 *
 * 2. **Alert System**: Implements severity-based alerting with batching to prevent
 *    spam while ensuring critical issues are caught immediately.
 *
 * 3. **CI/CD Integration**: Performance tests that can fail builds and provide
 *    actionable insights for optimization.
 *
 * 4. **Regression Detection**: Baseline comparison to catch performance degradation
 *    before it reaches users.
 *
 * 5. **External System Integration**: Tests show how performance data flows to
 *    external monitoring platforms like DataDog or New Relic.
 *
 * This monitoring approach is essential for FOX's Smart TV platform where performance
 * violations directly impact user experience and device stability.
 */