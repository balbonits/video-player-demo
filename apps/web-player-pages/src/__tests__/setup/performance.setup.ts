/**
 * Performance Testing Setup Configuration
 *
 * Configures performance monitoring, benchmarking tools, and Smart TV simulation
 * for comprehensive performance validation
 */

/**
 * Performance Testing Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Smart TV constraints
  SMART_TV: {
    MEMORY_LIMIT_MB: 100,
    CPU_LIMIT_PERCENT: 30,
    INPUT_LATENCY_MS: 150,
    STARTUP_TIME_MS: 3000,
    MIN_FPS: 30
  },

  // Mobile constraints
  MOBILE: {
    MEMORY_LIMIT_MB: 200,
    CPU_LIMIT_PERCENT: 50,
    INPUT_LATENCY_MS: 100,
    STARTUP_TIME_MS: 2000,
    MIN_FPS: 60
  },

  // Desktop constraints
  DESKTOP: {
    MEMORY_LIMIT_MB: 500,
    CPU_LIMIT_PERCENT: 70,
    INPUT_LATENCY_MS: 50,
    STARTUP_TIME_MS: 1000,
    MIN_FPS: 60
  }
} as const

/**
 * Performance Monitoring Mock for Testing
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private isMonitoring = false

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMonitoring(): void {
    this.isMonitoring = true
    this.metrics.clear()
  }

  stopMonitoring(): void {
    this.isMonitoring = false
  }

  recordMetric(name: string, value: number): void {
    if (!this.isMonitoring) return

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getMetric(name: string): number[] {
    return this.metrics.get(name) || []
  }

  getAverageMetric(name: string): number {
    const values = this.getMetric(name)
    return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0
  }

  getPeakMetric(name: string): number {
    const values = this.getMetric(name)
    return values.length > 0 ? Math.max(...values) : 0
  }

  getAllMetrics(): Record<string, number[]> {
    return Object.fromEntries(this.metrics)
  }

  reset(): void {
    this.metrics.clear()
    this.isMonitoring = false
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * Smart TV Hardware Simulation
 */
export class SmartTVSimulator {
  private originalRAF: typeof requestAnimationFrame
  private originalSetTimeout: typeof setTimeout
  private frameThrottleRatio = 2 // 30fps = every 2nd frame at 60fps

  constructor() {
    this.originalRAF = window.requestAnimationFrame.bind(window)
    this.originalSetTimeout = window.setTimeout.bind(window)
  }

  enableSmartTVMode(): void {
    this.throttleAnimations()
    this.simulateSlowerCPU()
    this.limitMemory()
  }

  disableSmartTVMode(): void {
    window.requestAnimationFrame = this.originalRAF
    window.setTimeout = this.originalSetTimeout
  }

  private throttleAnimations(): void {
    let frameCount = 0

    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frameCount++
      if (frameCount % this.frameThrottleRatio === 0) {
        return this.originalRAF(callback)
      }
      return this.originalRAF(() => {}) // Skip frame
    }
  }

  private simulateSlowerCPU(): void {
    // Add artificial delay to simulate slower CPU
    window.setTimeout = (callback: TimerHandler, delay?: number): number => {
      const slowdownFactor = 1.5 // 50% slower than normal
      const adjustedDelay = (delay || 0) * slowdownFactor
      return this.originalSetTimeout(callback, adjustedDelay)
    }
  }

  private limitMemory(): void {
    // Mock memory constraints
    if ('memory' in performance) {
      Object.defineProperty(performance.memory, 'jsHeapSizeLimit', {
        value: 100 * 1024 * 1024, // 100MB limit
        writable: true
      })
    }
  }
}

// Global Smart TV simulator instance
export const smartTVSimulator = new SmartTVSimulator()

/**
 * Performance Benchmarking Utilities
 */
export class PerformanceBenchmark {
  private startTimes: Map<string, number> = new Map()
  private endTimes: Map<string, number> = new Map()

  start(benchmarkName: string): void {
    this.startTimes.set(benchmarkName, performance.now())
    performanceMonitor.recordMetric(`${benchmarkName}_start`, performance.now())
  }

  end(benchmarkName: string): number {
    const endTime = performance.now()
    this.endTimes.set(benchmarkName, endTime)

    const startTime = this.startTimes.get(benchmarkName)
    if (!startTime) {
      throw new Error(`Benchmark '${benchmarkName}' was not started`)
    }

    const duration = endTime - startTime
    performanceMonitor.recordMetric(`${benchmarkName}_duration`, duration)
    return duration
  }

  getDuration(benchmarkName: string): number {
    const startTime = this.startTimes.get(benchmarkName)
    const endTime = this.endTimes.get(benchmarkName)

    if (!startTime || !endTime) {
      throw new Error(`Benchmark '${benchmarkName}' is incomplete`)
    }

    return endTime - startTime
  }

  reset(): void {
    this.startTimes.clear()
    this.endTimes.clear()
  }
}

// Global benchmark instance
export const benchmark = new PerformanceBenchmark()

/**
 * Memory Usage Tracker
 */
export class MemoryTracker {
  private snapshots: Array<{ timestamp: number; usage: number }> = []
  private isTracking = false
  private interval?: number

  startTracking(intervalMs = 100): void {
    this.isTracking = true
    this.snapshots = []

    this.interval = window.setInterval(() => {
      if ('memory' in performance) {
        const usage = (performance as any).memory.usedJSHeapSize
        this.snapshots.push({
          timestamp: performance.now(),
          usage
        })

        performanceMonitor.recordMetric('memory_usage_mb', usage / (1024 * 1024))
      }
    }, intervalMs)
  }

  stopTracking(): void {
    this.isTracking = false
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  getCurrentUsageMB(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024)
    }
    return 0
  }

  getPeakUsageMB(): number {
    if (this.snapshots.length === 0) return 0
    const peak = Math.max(...this.snapshots.map(s => s.usage))
    return peak / (1024 * 1024)
  }

  getMemoryGrowthMB(): number {
    if (this.snapshots.length < 2) return 0
    const initial = this.snapshots[0].usage
    const current = this.snapshots[this.snapshots.length - 1].usage
    return (current - initial) / (1024 * 1024)
  }

  getSnapshots(): Array<{ timestamp: number; usage: number }> {
    return [...this.snapshots]
  }

  reset(): void {
    this.snapshots = []
    this.stopTracking()
  }
}

// Global memory tracker instance
export const memoryTracker = new MemoryTracker()

/**
 * Input Latency Measurement
 */
export class LatencyMeasurer {
  async measureInputLatency(element: HTMLElement, inputType: 'click' | 'keydown' | 'focus'): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()

      const handler = () => {
        const endTime = performance.now()
        const latency = endTime - startTime

        performanceMonitor.recordMetric('input_latency_ms', latency)
        resolve(latency)

        element.removeEventListener('focus', handler)
        element.removeEventListener('click', handler)
        element.removeEventListener('keydown', handler)
      }

      // Set up event listeners
      element.addEventListener('focus', handler, { once: true })
      element.addEventListener('click', handler, { once: true })
      element.addEventListener('keydown', handler, { once: true })

      // Trigger the input
      if (inputType === 'click') {
        element.click()
      } else if (inputType === 'keydown') {
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        element.focus()
      } else if (inputType === 'focus') {
        element.focus()
      }
    })
  }

  async measureMultipleInputs(
    element: HTMLElement,
    inputType: 'click' | 'keydown' | 'focus',
    count: number
  ): Promise<number[]> {
    const latencies: number[] = []

    for (let i = 0; i < count; i++) {
      const latency = await this.measureInputLatency(element, inputType)
      latencies.push(latency)

      // Small delay between measurements
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    return latencies
  }

  getAverageLatency(latencies: number[]): number {
    return latencies.reduce((a, b) => a + b) / latencies.length
  }

  getMaxLatency(latencies: number[]): number {
    return Math.max(...latencies)
  }

  getMinLatency(latencies: number[]): number {
    return Math.min(...latencies)
  }
}

// Global latency measurer instance
export const latencyMeasurer = new LatencyMeasurer()

/**
 * Setup and teardown helpers for performance tests
 */
export function setupPerformanceTest(mode: 'smartTV' | 'mobile' | 'desktop' = 'smartTV'): void {
  // Reset all performance tools
  performanceMonitor.reset()
  benchmark.reset()
  memoryTracker.reset()

  // Start monitoring
  performanceMonitor.startMonitoring()
  memoryTracker.startTracking()

  // Configure for specific mode
  if (mode === 'smartTV') {
    smartTVSimulator.enableSmartTVMode()
  }
}

export function teardownPerformanceTest(): void {
  // Stop monitoring
  performanceMonitor.stopMonitoring()
  memoryTracker.stopTracking()

  // Disable simulations
  smartTVSimulator.disableSmartTVMode()

  // Force cleanup
  if (global.gc) {
    global.gc()
  }
}

/**
 * Performance assertion helpers
 */
export function expectMemoryUnder(limitMB: number): void {
  const currentUsage = memoryTracker.getCurrentUsageMB()
  expect(currentUsage).toBeLessThan(limitMB)
}

export function expectLatencyUnder(maxLatencyMs: number): void {
  const latencies = performanceMonitor.getMetric('input_latency_ms')
  if (latencies.length > 0) {
    const maxLatency = Math.max(...latencies)
    expect(maxLatency).toBeLessThan(maxLatencyMs)
  }
}

export function expectStartupTimeUnder(maxStartupMs: number): void {
  const startupTimes = performanceMonitor.getMetric('video_startup_duration')
  if (startupTimes.length > 0) {
    const avgStartup = performanceMonitor.getAverageMetric('video_startup_duration')
    expect(avgStartup).toBeLessThan(maxStartupMs)
  }
}

// Auto-setup for global performance test environment
beforeEach(() => {
  setupPerformanceTest()
})

afterEach(() => {
  teardownPerformanceTest()
})