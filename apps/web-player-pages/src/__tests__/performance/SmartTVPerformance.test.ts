/**
 * Smart TV Performance Test Specifications
 *
 * FOX Requirement: JavaScript performance optimization for shared TV app codebase
 * Critical Constraints:
 * - Memory Usage: <100MB (hard limit for Smart TV devices)
 * - CPU Usage: <30% (shared with TV OS and other apps)
 * - Input Latency: <150ms (D-pad navigation responsiveness)
 * - Startup Time: <3 seconds (video ready to play)
 * - Frame Rate: 30fps minimum (no stuttering on TV hardware)
 *
 * Performance Testing Strategy:
 * 1. Benchmark current implementation against constraints
 * 2. Stress testing under memory pressure
 * 3. CPU profiling during video playback
 * 4. Input latency measurement across device types
 * 5. Long-running stability tests
 */

import { HLSVideoPlayer } from '@/components/HLSVideoPlayer'
import { performance } from 'perf_hooks'

/**
 * Smart TV Performance Constraints
 * Based on FOX streaming platform requirements and industry standards
 */
const SMART_TV_CONSTRAINTS = {
  MEMORY_LIMIT_MB: 100,
  CPU_USAGE_PERCENT: 30,
  INPUT_LATENCY_MS: 150,
  VIDEO_START_TIME_MS: 3000,
  MIN_FPS: 30,
  BUFFER_TIME_MS: 2000,
  QUALITY_SWITCH_TIME_MS: 1000
} as const

/**
 * Performance test utilities for accurate measurement
 */
class PerformanceTestUtils {
  private static memorySnapshots: number[] = []
  private static performanceMarks: Map<string, number> = new Map()

  static startMemoryMonitoring(): void {
    this.memorySnapshots = []
    const monitor = () => {
      if ('memory' in performance) {
        this.memorySnapshots.push((performance as any).memory.usedJSHeapSize)
      }
    }

    // Sample every 100ms for detailed memory tracking
    const interval = setInterval(monitor, 100)

    // Stop monitoring after 10 seconds
    setTimeout(() => clearInterval(interval), 10000)
  }

  static getMemoryUsageMB(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024)
    }
    return 0
  }

  static getPeakMemoryUsageMB(): number {
    return Math.max(...this.memorySnapshots) / (1024 * 1024)
  }

  static markPerformance(label: string): void {
    this.performanceMarks.set(label, performance.now())
  }

  static measurePerformance(startLabel: string, endLabel: string): number {
    const start = this.performanceMarks.get(startLabel) || 0
    const end = this.performanceMarks.get(endLabel) || 0
    return end - start
  }

  static simulateMemoryPressure(targetMB: number): void {
    // Create memory pressure for testing cleanup mechanisms
    const arrays: number[][] = []
    const currentMB = this.getMemoryUsageMB()
    const neededMB = targetMB - currentMB

    if (neededMB > 0) {
      // Allocate arrays to increase memory usage
      const arraySize = Math.floor((neededMB * 1024 * 1024) / 8) // 8 bytes per number
      for (let i = 0; i < Math.ceil(arraySize / 1000000); i++) {
        arrays.push(new Array(Math.min(1000000, arraySize - i * 1000000)).fill(0))
      }
    }
  }

  static measureInputLatency(element: HTMLElement, inputType: 'keyboard' | 'focus'): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()

      const measureEnd = () => {
        const endTime = performance.now()
        resolve(endTime - startTime)
        element.removeEventListener('focus', measureEnd)
      }

      element.addEventListener('focus', measureEnd, { once: true })

      if (inputType === 'keyboard') {
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      }
      element.focus()
    })
  }
}

describe('Smart TV Performance Constraints', () => {
  let videoPlayer: HLSVideoPlayer
  let container: HTMLElement

  beforeEach(() => {
    // Clean slate for each test
    document.body.innerHTML = ''

    videoPlayer = new HLSVideoPlayer()
    videoPlayer.setAttribute('performance-mode', 'smartTV')
    videoPlayer.setAttribute('memory-limit', '100')
    videoPlayer.setAttribute('cpu-limit', '30')

    container = document.createElement('div')
    container.appendChild(videoPlayer)
    document.body.appendChild(container)

    // Start monitoring for each test
    PerformanceTestUtils.startMemoryMonitoring()
  })

  afterEach(() => {
    videoPlayer.disconnectedCallback?.()
    document.body.innerHTML = ''

    // Force garbage collection if available
    if ('gc' in global) {
      (global as any).gc()
    }
  })

  /**
   * CONSTRAINT 1: Memory Usage <100MB
   * Tests memory efficiency and cleanup mechanisms
   */
  describe('Memory Usage Constraint (<100MB)', () => {
    test('should stay under 100MB during normal playback', async () => {
      PerformanceTestUtils.markPerformance('memory-test-start')

      // Initialize video player with HLS stream
      videoPlayer.setAttribute('src', 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8')

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 2000))

      const currentMemory = PerformanceTestUtils.getMemoryUsageMB()
      const peakMemory = PerformanceTestUtils.getPeakMemoryUsageMB()

      expect(currentMemory).toBeLessThan(SMART_TV_CONSTRAINTS.MEMORY_LIMIT_MB)
      expect(peakMemory).toBeLessThan(SMART_TV_CONSTRAINTS.MEMORY_LIMIT_MB * 1.1) // 10% buffer
    })

    test('should trigger cleanup when approaching memory limit', async () => {
      const cleanupSpy = jest.spyOn(videoPlayer as any, 'performMemoryCleanup')

      // Simulate high memory usage (85% of limit)
      PerformanceTestUtils.simulateMemoryPressure(85)

      // Trigger memory monitoring
      await new Promise(resolve => setTimeout(resolve, 6000)) // Wait for monitoring cycle

      expect(cleanupSpy).toHaveBeenCalled()
    })

    test('should reduce buffer size under memory pressure', async () => {
      const initialConfig = (videoPlayer as any).getHLSConfig()
      const initialBufferSize = initialConfig.maxBufferLength

      // Simulate memory pressure
      PerformanceTestUtils.simulateMemoryPressure(90)

      // Trigger cleanup
      ;(videoPlayer as any).performMemoryCleanup()

      const newConfig = (videoPlayer as any).getHLSConfig()
      expect(newConfig.maxBufferLength).toBeLessThan(initialBufferSize)
    })

    test('should handle memory cleanup during quality switches', async () => {
      videoPlayer.setAttribute('src', 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8')

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Switch quality multiple times to stress memory
      for (let i = 0; i < 5; i++) {
        videoPlayer.setQuality('auto')
        videoPlayer.setQuality('0')
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const finalMemory = PerformanceTestUtils.getMemoryUsageMB()
      expect(finalMemory).toBeLessThan(SMART_TV_CONSTRAINTS.MEMORY_LIMIT_MB)
    })

    test('should handle long-running playback without memory leaks', async () => {
      const initialMemory = PerformanceTestUtils.getMemoryUsageMB()

      videoPlayer.setAttribute('src', 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8')

      // Simulate 10 minutes of playback (accelerated)
      for (let i = 0; i < 100; i++) {
        // Simulate video progress events
        const video = videoPlayer.shadowRoot!.querySelector('.video-element') as HTMLVideoElement
        if (video) {
          video.dispatchEvent(new Event('timeupdate'))
          video.dispatchEvent(new Event('progress'))
        }
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      const finalMemory = PerformanceTestUtils.getMemoryUsageMB()
      const memoryGrowth = finalMemory - initialMemory

      // Memory growth should be minimal (less than 20MB over 10 minutes)
      expect(memoryGrowth).toBeLessThan(20)
    })
  })

  /**
   * CONSTRAINT 2: CPU Usage <30%
   * Tests CPU efficiency and optimization techniques
   */
  describe('CPU Usage Constraint (<30%)', () => {
    test('should throttle animations to 30fps for Smart TV', () => {
      const rafCalls: number[] = []
      const originalRAF = window.requestAnimationFrame

      window.requestAnimationFrame = jest.fn((callback) => {
        rafCalls.push(performance.now())
        return originalRAF(callback)
      })

      // Setup CPU optimization
      ;(videoPlayer as any).setupCPUOptimization()

      // Test frame throttling
      const shadowRAF = (videoPlayer.shadowRoot as any).requestAnimationFrame

      // Make multiple RAF calls
      for (let i = 0; i < 10; i++) {
        shadowRAF(() => {})
      }

      // Should throttle to roughly 30fps (every other frame)
      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(5)

      window.requestAnimationFrame = originalRAF
    })

    test('should optimize video rendering for low-power hardware', async () => {
      const video = videoPlayer.shadowRoot!.querySelector('.video-element') as HTMLVideoElement

      // Check that video is optimized for Smart TV
      expect(video.getAttribute('preload')).toBe('metadata') // Not 'auto' to save CPU
      expect(video.hasAttribute('playsinline')).toBe(true)
    })

    test('should use efficient event handling for frequent updates', async () => {
      const updateSpy = jest.spyOn(videoPlayer as any, 'updatePerformanceMetrics')

      // Start monitoring
      ;(videoPlayer as any).startPerformanceMonitoring()

      // Wait for several update cycles
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Updates should happen at reasonable intervals (not too frequent)
      expect(updateSpy).toHaveBeenCalledTimes(2) // Every 2 seconds = 2 calls in 5 seconds
    })

    test('should debounce expensive operations during interaction', async () => {
      const seekSpy = jest.spyOn(videoPlayer, 'seek')

      // Rapid seek operations (like user dragging progress bar)
      for (let i = 0; i < 10; i++) {
        const progressBar = videoPlayer.shadowRoot!.querySelector('.progress-bar') as HTMLElement
        progressBar.dispatchEvent(new MouseEvent('click', { clientX: i * 10 }))
      }

      // Should debounce rapid operations
      expect(seekSpy).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * CONSTRAINT 3: Input Latency <150ms
   * Tests responsiveness of user interactions
   */
  describe('Input Latency Constraint (<150ms)', () => {
    test('should respond to keyboard input within 150ms', async () => {
      const playButton = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement

      const latency = await PerformanceTestUtils.measureInputLatency(playButton, 'keyboard')

      expect(latency).toBeLessThan(SMART_TV_CONSTRAINTS.INPUT_LATENCY_MS)
    })

    test('should respond to focus changes within 150ms', async () => {
      const buttons = videoPlayer.shadowRoot!.querySelectorAll('.control-button')

      for (const button of Array.from(buttons)) {
        const latency = await PerformanceTestUtils.measureInputLatency(button as HTMLElement, 'focus')
        expect(latency).toBeLessThan(SMART_TV_CONSTRAINTS.INPUT_LATENCY_MS)
      }
    })

    test('should maintain responsiveness under memory pressure', async () => {
      // Create memory pressure
      PerformanceTestUtils.simulateMemoryPressure(85)

      const playButton = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement
      const latency = await PerformanceTestUtils.measureInputLatency(playButton, 'keyboard')

      // Should still be responsive even under memory pressure
      expect(latency).toBeLessThan(SMART_TV_CONSTRAINTS.INPUT_LATENCY_MS * 1.2) // 20% tolerance
    })

    test('should emit warnings for slow input responses', async () => {
      const warningSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', warningSpy)

      // Mock slow response
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(0)  // keydown time
        .mockReturnValueOnce(200) // focus time (200ms later)

      const button = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      button.focus()

      expect(warningSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'input-latency-warning',
            data: expect.objectContaining({
              responseTime: 200,
              target: 150
            })
          })
        })
      )
    })
  })

  /**
   * CONSTRAINT 4: Video Start Time <3 seconds
   * Tests video initialization performance
   */
  describe('Video Start Time Constraint (<3 seconds)', () => {
    test('should start video playback within 3 seconds', async () => {
      PerformanceTestUtils.markPerformance('video-start')

      const readyPromise = new Promise<void>((resolve) => {
        videoPlayer.addEventListener('hls-performance', (event) => {
          if ((event as CustomEvent).detail.type === 'video-ready') {
            PerformanceTestUtils.markPerformance('video-ready')
            resolve()
          }
        })
      })

      videoPlayer.setAttribute('src', 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8')

      await readyPromise

      const startTime = PerformanceTestUtils.measurePerformance('video-start', 'video-ready')
      expect(startTime).toBeLessThan(SMART_TV_CONSTRAINTS.VIDEO_START_TIME_MS)
    })

    test('should optimize HLS configuration for fast startup', () => {
      const config = (videoPlayer as any).getHLSConfig()

      // Configuration should favor fast startup
      expect(config.lowLatencyMode).toBe(false) // Compatibility over speed
      expect(config.startLevel).toBeLessThanOrEqual(2) // Don't start with highest quality
      expect(config.liveSyncDurationCount).toBeLessThan(5) // Quick sync for live streams
    })

    test('should preload only essential data for Smart TV', () => {
      const video = videoPlayer.shadowRoot!.querySelector('.video-element') as HTMLVideoElement

      // Should use minimal preloading to start quickly
      expect(video.getAttribute('preload')).toBe('metadata')
    })
  })

  /**
   * CONSTRAINT 5: Performance Monitoring Integration
   * Tests real-time performance tracking and reporting
   */
  describe('Performance Monitoring Integration', () => {
    test('should track all constraint metrics continuously', async () => {
      ;(videoPlayer as any).startPerformanceMonitoring()

      await new Promise(resolve => setTimeout(resolve, 3000))

      const metrics = videoPlayer.getPerformanceMetrics()

      expect(metrics.memoryUsage).toBeGreaterThan(0)
      expect(metrics.inputLatency).toBeGreaterThanOrEqual(0)
      expect(metrics.videoStartTime).toBeGreaterThanOrEqual(0)
    })

    test('should provide performance constraint validation', () => {
      const metrics = videoPlayer.getPerformanceMetrics()
      const memoryMB = metrics.memoryUsage / (1024 * 1024)

      // Validate against all constraints
      expect(memoryMB).toBeLessThan(SMART_TV_CONSTRAINTS.MEMORY_LIMIT_MB)
      expect(metrics.inputLatency).toBeLessThan(SMART_TV_CONSTRAINTS.INPUT_LATENCY_MS)
      expect(metrics.videoStartTime).toBeLessThan(SMART_TV_CONSTRAINTS.VIDEO_START_TIME_MS)
    })

    test('should generate performance reports for CI/CD integration', async () => {
      const reportData: any[] = []

      videoPlayer.addEventListener('hls-performance', (event) => {
        reportData.push((event as CustomEvent).detail)
      })

      ;(videoPlayer as any).startPerformanceMonitoring()
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Should have performance update events
      const updateEvents = reportData.filter(data => data.type === 'performance-update')
      expect(updateEvents.length).toBeGreaterThan(0)

      // Each event should contain constraint validation data
      updateEvents.forEach(event => {
        expect(event.data).toHaveProperty('memoryUsage')
        expect(event.data).toHaveProperty('inputLatency')
        expect(event.performanceMode).toBe('smartTV')
      })
    })

    test('should integrate with external performance monitoring tools', () => {
      // Test that performance events can be consumed by external tools
      const mockMonitoringTool = {
        trackMetric: jest.fn(),
        alertOnViolation: jest.fn()
      }

      videoPlayer.addEventListener('hls-performance', (event) => {
        const detail = (event as CustomEvent).detail
        mockMonitoringTool.trackMetric(detail.type, detail.data)

        if (detail.type.includes('warning')) {
          mockMonitoringTool.alertOnViolation(detail.data)
        }
      })

      // Trigger a performance violation
      ;(videoPlayer as any).dispatchPerformanceEvent('input-latency-warning', {
        responseTime: 200,
        target: 150
      })

      expect(mockMonitoringTool.trackMetric).toHaveBeenCalled()
      expect(mockMonitoringTool.alertOnViolation).toHaveBeenCalled()
    })
  })
})

/**
 * Performance Benchmark Tests
 * These tests establish baseline performance metrics for regression testing
 */
describe('Performance Benchmarks', () => {
  test('should establish memory usage baseline', async () => {
    const player = new HLSVideoPlayer()
    player.setAttribute('performance-mode', 'smartTV')
    document.body.appendChild(player)

    const baselineMemory = PerformanceTestUtils.getMemoryUsageMB()

    // Baseline should be well under Smart TV limits
    expect(baselineMemory).toBeLessThan(50) // 50MB baseline

    player.remove()
  })

  test('should establish input latency baseline', async () => {
    const player = new HLSVideoPlayer()
    player.setAttribute('performance-mode', 'smartTV')
    document.body.appendChild(player)

    const button = player.shadowRoot!.querySelector('#play-pause') as HTMLElement
    const baselineLatency = await PerformanceTestUtils.measureInputLatency(button, 'keyboard')

    // Baseline should be well under Smart TV limits
    expect(baselineLatency).toBeLessThan(100) // 100ms baseline

    player.remove()
  })

  test('should establish video startup baseline', async () => {
    const player = new HLSVideoPlayer()
    player.setAttribute('performance-mode', 'smartTV')
    document.body.appendChild(player)

    PerformanceTestUtils.markPerformance('baseline-start')

    const readyPromise = new Promise<void>((resolve) => {
      player.addEventListener('hls-performance', (event) => {
        if ((event as CustomEvent).detail.type === 'video-ready') {
          PerformanceTestUtils.markPerformance('baseline-ready')
          resolve()
        }
      })
    })

    player.setAttribute('src', 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8')

    await readyPromise

    const baselineStartTime = PerformanceTestUtils.measurePerformance('baseline-start', 'baseline-ready')

    // Baseline should be well under Smart TV limits
    expect(baselineStartTime).toBeLessThan(2000) // 2 second baseline

    player.remove()
  })
})

/**
 * TDD PERFORMANCE LEARNING NOTES FOR JOHN:
 *
 * This comprehensive performance test suite demonstrates enterprise-level performance testing:
 *
 * 1. **Constraint-Driven Testing**: Every test validates against specific Smart TV hardware constraints.
 *    This is how performance requirements translate to real validation at companies like FOX.
 *
 * 2. **Continuous Performance Monitoring**: Tests verify that performance tracking works in real-time,
 *    which is essential for production monitoring and alerting systems.
 *
 * 3. **Memory Management Testing**: Smart TV devices have strict memory limits. These tests ensure
 *    our player won't crash TVs or degrade the user experience.
 *
 * 4. **Input Responsiveness**: TV users expect immediate response to remote control inputs.
 *    These tests validate the user experience quality.
 *
 * 5. **Performance Regression Detection**: Baseline tests catch performance degradation during
 *    development, preventing performance regressions from reaching production.
 *
 * 6. **CI/CD Integration**: Performance events can be consumed by monitoring tools, making
 *    performance a first-class citizen in the deployment pipeline.
 *
 * This testing approach demonstrates the sophisticated performance validation required for
 * enterprise streaming platforms like FOX's Smart TV applications.
 */