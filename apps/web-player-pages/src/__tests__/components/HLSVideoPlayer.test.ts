/**
 * HLS Video Player Web Component - Comprehensive Test Specifications
 *
 * TDD Approach: Tests written FIRST to drive implementation
 * Performance Focus: Smart TV constraints (<100MB memory, <30% CPU, <150ms input)
 * Coverage Target: 95% for critical video player components
 *
 * Test Categories:
 * 1. Web Component Core Functionality
 * 2. HLS Streaming Performance
 * 3. Smart TV Performance Optimization
 * 4. NPM Package Exportability
 * 5. Accessibility Compliance
 * 6. Performance Monitoring & Metrics
 */

import { HLSVideoPlayer, PerformanceMetrics, PerformanceConfig } from '@/components/HLSVideoPlayer'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import Hls from 'hls.js'

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations)

// Mock HLS.js for controlled testing
jest.mock('hls.js', () => {
  const mockHlsInstance = {
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    levels: [
      { height: 720, bitrate: 2500000 },
      { height: 1080, bitrate: 5000000 }
    ],
    currentLevel: -1,
    config: {
      maxBufferLength: 300,
      backBufferLength: 90,
      liveSyncDurationCount: 3
    }
  }

  const HlsMock = jest.fn(() => mockHlsInstance)
  HlsMock.isSupported = jest.fn(() => true)
  HlsMock.Events = {
    MANIFEST_PARSED: 'hlsManifestParsed',
    FRAG_LOADED: 'hlsFragLoaded',
    ERROR: 'hlsError',
    LEVEL_LOADED: 'hlsLevelLoaded',
    LEVEL_SWITCHING: 'hlsLevelSwitching'
  }

  return {
    __esModule: true,
    default: HlsMock
  }
})

// Mock Performance API for memory testing
const mockPerformanceMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB initial
  totalJSHeapSize: 100 * 1024 * 1024,
  jsHeapSizeLimit: 2000 * 1024 * 1024
}

Object.defineProperty(performance, 'memory', {
  value: mockPerformanceMemory,
  writable: true,
  configurable: true
})

// Mock performance test utilities
global.performanceTestUtils = {
  CONSTRAINTS: {
    MEMORY_LIMIT_MB: 100,
    CPU_USAGE_PERCENT: 30,
    INPUT_LATENCY_MS: 150,
    VIDEO_START_TIME_MS: 3000
  },
  simulateMemoryPressure: (targetMB: number) => {
    mockPerformanceMemory.usedJSHeapSize = targetMB * 1024 * 1024
  },
  resetMetrics: () => {
    mockPerformanceMemory.usedJSHeapSize = 50 * 1024 * 1024
  }
}

// Helper function to create a mock video element with all necessary methods
function createMockVideoElement() {
  return {
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    canPlayType: jest.fn(() => ''),
    load: jest.fn(),
    currentTime: 0,
    duration: 100,
    paused: true,
    volume: 1,
    muted: false,
    playbackRate: 1,
    buffered: {
      length: 0,
      start: jest.fn(),
      end: jest.fn()
    },
    readyState: 0,
    networkState: 0,
    error: null,
    src: '',
    controls: false,
    autoplay: false,
    loop: false,
    textTracks: [],
    videoWidth: 1920,
    videoHeight: 1080
  }
}

// Register the custom element if not already registered
if (!customElements.get('hls-video-player')) {
  customElements.define('hls-video-player', HLSVideoPlayer)
}

describe('HLSVideoPlayer Web Component - TDD Specifications', () => {
  let videoPlayer: HLSVideoPlayer
  let container: HTMLElement

  beforeEach(() => {
    // Reset DOM and mocks
    document.body.innerHTML = ''
    jest.clearAllMocks()

    // Reset performance metrics
    if (global.performanceTestUtils) {
      global.performanceTestUtils.resetMetrics()
    }

    // Create fresh Web Component instance
    videoPlayer = document.createElement('hls-video-player') as HLSVideoPlayer
    container = document.createElement('div')
    container.appendChild(videoPlayer)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Create a proper mock video element for cleanup to work
    if (!(videoPlayer as any).video || !(videoPlayer as any).video.removeEventListener) {
      (videoPlayer as any).video = createMockVideoElement()
    }
    // Cleanup for memory leak prevention
    videoPlayer.disconnectedCallback?.()
    document.body.innerHTML = ''
    jest.clearAllTimers()
  })

  /**
   * TDD CATEGORY 1: Web Component Core Functionality
   * Tests fundamental Web Component behavior and lifecycle
   */
  describe('Web Component Core Functionality', () => {
    test('should be defined as custom element', () => {
      expect(customElements.get('hls-video-player')).toBeDefined()
      expect(videoPlayer).toBeInstanceOf(HTMLElement)
      expect(videoPlayer.tagName.toLowerCase()).toBe('hls-video-player')
    })

    test('should initialize Shadow DOM with encapsulation', () => {
      expect(videoPlayer.shadowRoot).toBeTruthy()
      expect(videoPlayer.shadowRoot!.mode).toBe('open')

      // Verify Shadow DOM isolation
      const video = videoPlayer.shadowRoot!.querySelector('.video-element')
      expect(video).toBeTruthy()
      expect(document.querySelector('.video-element')).toBeNull()
    })

    test('should observe reactive attributes for configuration', () => {
      const observedAttrs = HLSVideoPlayer.observedAttributes
      expect(observedAttrs).toContain('src')
      expect(observedAttrs).toContain('performance-mode')
      expect(observedAttrs).toContain('memory-limit')
      expect(observedAttrs).toContain('cpu-limit')
      expect(observedAttrs).toContain('buffer-strategy')
    })

    test('should handle attribute changes reactively', async () => {
      const spy = jest.spyOn(videoPlayer as any, 'loadVideo')

      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith('http://example.com/stream.m3u8')
      })
    })

    test('should cleanup resources on disconnect', () => {
      const hls = (videoPlayer as any).hls
      const interval = (videoPlayer as any).performanceMonitoringInterval

      videoPlayer.disconnectedCallback()

      expect(hls?.destroy).toHaveBeenCalled()
      expect(clearInterval).toHaveBeenCalledWith(interval)
    })
  })

  /**
   * TDD CATEGORY 2: HLS Streaming Performance
   * Tests HLS.js integration and streaming optimization
   */
  describe('HLS Streaming Performance', () => {
    test('should initialize HLS with performance-optimized config', async () => {
      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')
      videoPlayer.setAttribute('performance-mode', 'smartTV')

      await waitFor(() => {
        expect(Hls).toHaveBeenCalledWith(expect.objectContaining({
          enableWorker: true,
          maxBufferLength: 180, // Smart TV optimization
          backBufferLength: 60,  // Reduced for memory
          liveSyncDurationCount: 3
        }))
      })
    })

    test('should adapt HLS config per performance mode', () => {
      const configs = {
        smartTV: { maxBufferLength: 180, backBufferLength: 60 },
        mobile: { maxBufferLength: 120, backBufferLength: 30 },
        desktop: { maxBufferLength: 600, backBufferLength: 180 }
      }

      Object.entries(configs).forEach(([mode, expectedConfig]) => {
        videoPlayer.setAttribute('performance-mode', mode)
        const config = (videoPlayer as any).getHLSConfig()

        expect(config.maxBufferLength).toBe(expectedConfig.maxBufferLength)
        expect(config.backBufferLength).toBe(expectedConfig.backBufferLength)
      })
    })

    test('should track video start performance metrics', async () => {
      const startTime = performance.now()
      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')

      // Simulate HLS manifest parsed event
      const mockHls = (videoPlayer as any).hls
      const manifestCallback = mockHls.on.mock.calls.find(
        call => call[0] === 'hlsManifestParsed'
      )?.[1]

      act(() => {
        manifestCallback?.()
      })

      const metrics = videoPlayer.getPerformanceMetrics()
      expect(metrics.videoStartTime).toBeGreaterThan(0)
      expect(metrics.videoStartTime).toBeLessThan(5000) // Under 5 seconds
    })

    test('should handle HLS errors gracefully', async () => {
      const errorSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', errorSpy)

      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')

      // Simulate HLS error
      const mockHls = (videoPlayer as any).hls
      const errorCallback = mockHls.on.mock.calls.find(
        call => call[0] === 'hlsError'
      )?.[1]

      act(() => {
        errorCallback?.(null, { fatal: true, details: 'NETWORK_ERROR' })
      })

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'error',
            data: expect.objectContaining({
              error: 'NETWORK_ERROR'
            })
          })
        })
      )
    })
  })

  /**
   * TDD CATEGORY 3: Smart TV Performance Optimization
   * Tests compliance with Smart TV constraints (<100MB memory, <30% CPU, <150ms input)
   */
  describe('Smart TV Performance Optimization', () => {
    beforeEach(() => {
      videoPlayer.setAttribute('performance-mode', 'smartTV')
      videoPlayer.setAttribute('memory-limit', '100')
      videoPlayer.setAttribute('cpu-limit', '30')
    })

    test('should enforce Smart TV memory limits', () => {
      const config = (videoPlayer as any).performanceConfig
      expect(config.memoryLimit).toBeLessThanOrEqual(100)
      expect(config.cpuTarget).toBeLessThanOrEqual(30)
      expect(config.inputResponseTarget).toBeLessThanOrEqual(150)
    })

    test('should monitor memory usage and trigger cleanup', async () => {
      const cleanupSpy = jest.spyOn(videoPlayer as any, 'performMemoryCleanup')

      // Simulate high memory usage
      mockPerformanceMemory.usedJSHeapSize = 85 * 1024 * 1024 // 85MB (85% of 100MB limit)

      // Trigger memory monitoring
      const memoryCheck = setInterval(() => {
        (videoPlayer as any).setupMemoryMonitoring()
      }, 100)

      await waitFor(() => {
        expect(cleanupSpy).toHaveBeenCalled()
      }, { timeout: 1000 })

      clearInterval(memoryCheck)
    })

    test('should throttle animations to 30fps for Smart TV', () => {
      const rafSpy = jest.spyOn(window, 'requestAnimationFrame')

      // Setup CPU optimization
      ;(videoPlayer as any).setupCPUOptimization()

      // Test frame throttling
      const shadowRAF = (videoPlayer.shadowRoot as any).requestAnimationFrame
      const callback = jest.fn()

      // Should throttle to 30fps (every other frame)
      shadowRAF(callback)
      shadowRAF(callback)

      expect(rafSpy).toHaveBeenCalledTimes(1) // Only one RAF call for 30fps throttling
    })

    test('should measure input response latency under 150ms', async () => {
      const button = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement

      const startTime = performance.now()

      // Simulate keydown and focus events
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.focus(button)

      const metrics = videoPlayer.getPerformanceMetrics()
      expect(metrics.inputLatency).toBeLessThan(150) // Smart TV requirement
    })

    test('should emit performance warnings for constraint violations', async () => {
      const warningSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', warningSpy)

      // Simulate slow input response
      const button = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement

      // Mock slow response time
      jest.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(200)

      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.focus(button)

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

    test('should apply Smart TV visual optimizations', () => {
      const styles = getComputedStyle(videoPlayer)

      // Check CSS custom properties for Smart TV mode
      expect(videoPlayer.style.getPropertyValue('--button-size')).toBe('64px')
      expect(videoPlayer.style.getPropertyValue('--font-size')).toBe('18px')
      expect(videoPlayer.style.getPropertyValue('--padding')).toBe('24px')
    })
  })

  /**
   * TDD CATEGORY 4: NPM Package Exportability
   * Tests component's ability to be packaged and distributed
   */
  describe('NPM Package Exportability', () => {
    test('should export TypeScript interfaces for consumers', () => {
      expect(typeof PerformanceMetrics).toBe('object')
      expect(typeof PerformanceConfig).toBe('object')
    })

    test('should be framework-agnostic via Web Components', () => {
      // Test vanilla JavaScript usage
      const vanillaPlayer = document.createElement('hls-video-player')
      vanillaPlayer.setAttribute('src', 'http://example.com/stream.m3u8')

      expect(vanillaPlayer).toBeInstanceOf(HLSVideoPlayer)
      expect(vanillaPlayer.tagName.toLowerCase()).toBe('hls-video-player')
    })

    test('should provide programmatic API for integration', () => {
      // Public API methods
      expect(typeof videoPlayer.play).toBe('function')
      expect(typeof videoPlayer.pause).toBe('function')
      expect(typeof videoPlayer.seek).toBe('function')
      expect(typeof videoPlayer.setQuality).toBe('function')
      expect(typeof videoPlayer.getPerformanceMetrics).toBe('function')
      expect(typeof videoPlayer.optimizeForSmartTV).toBe('function')
      expect(typeof videoPlayer.optimizeForMobile).toBe('function')
    })

    test('should emit custom events for framework integration', async () => {
      const eventSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', eventSpy)

      // Trigger performance event
      ;(videoPlayer as any).dispatchPerformanceEvent('test-event', { test: true })

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'test-event',
            data: { test: true },
            performanceMode: expect.any(String)
          })
        })
      )
    })

    test('should handle bundling without HLS.js dependency conflicts', () => {
      // Test that HLS.js is imported correctly for bundling
      expect(Hls).toBeDefined()
      expect(typeof Hls.isSupported).toBe('function')
    })
  })

  /**
   * TDD CATEGORY 5: Accessibility Compliance (WCAG 2.1 AA)
   * Tests keyboard navigation, screen reader support, and ARIA compliance
   */
  describe('Accessibility Compliance', () => {
    test('should have no accessibility violations', async () => {
      const results = await axe(videoPlayer.shadowRoot!.firstElementChild as Element)
      expect(results).toHaveNoViolations()
    })

    test('should support complete keyboard navigation', async () => {
      const user = userEvent.setup()

      // Get focusable elements in Shadow DOM
      const playButton = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement
      const volumeButton = videoPlayer.shadowRoot!.querySelector('#volume') as HTMLElement
      const qualitySelect = videoPlayer.shadowRoot!.querySelector('#quality') as HTMLElement

      // Test Tab navigation
      playButton.focus()
      expect(document.activeElement).toBe(videoPlayer)
      expect(videoPlayer.shadowRoot!.activeElement).toBe(playButton)

      await user.tab()
      expect(videoPlayer.shadowRoot!.activeElement).toBe(volumeButton)

      await user.tab()
      expect(videoPlayer.shadowRoot!.activeElement).toBe(qualitySelect)
    })

    test('should handle Smart TV D-pad navigation', async () => {
      const playSpy = jest.spyOn(videoPlayer, 'play')
      const pauseSpy = jest.spyOn(videoPlayer, 'pause')

      // Simulate video element for testing
      const mockVideo = { paused: true, currentTime: 10, duration: 100 }
      ;(videoPlayer as any).video = mockVideo

      // Test spacebar/Enter for play/pause
      fireEvent.keyDown(videoPlayer, { key: ' ' })
      expect(playSpy).toHaveBeenCalled()

      // Test arrow keys for seeking
      fireEvent.keyDown(videoPlayer, { key: 'ArrowLeft' })
      expect(mockVideo.currentTime).toBe(0) // Seeked backward

      fireEvent.keyDown(videoPlayer, { key: 'ArrowRight' })
      expect(mockVideo.currentTime).toBe(10) // Seeked forward
    })

    test('should provide proper ARIA labels and roles', () => {
      const playButton = videoPlayer.shadowRoot!.querySelector('#play-pause')
      const progressBar = videoPlayer.shadowRoot!.querySelector('.progress-bar')
      const qualitySelect = videoPlayer.shadowRoot!.querySelector('#quality')

      expect(playButton?.getAttribute('aria-label')).toBe('Play video')
      expect(progressBar?.getAttribute('role')).toBe('slider')
      expect(progressBar?.getAttribute('aria-label')).toBe('Video progress')
      expect(qualitySelect?.getAttribute('aria-label')).toBe('Video quality')
    })

    test('should update ARIA states dynamically', async () => {
      const playButton = videoPlayer.shadowRoot!.querySelector('#play-pause') as HTMLElement
      const mockVideo = {
        paused: true,
        play: jest.fn(() => { mockVideo.paused = false }),
        pause: jest.fn(() => { mockVideo.paused = true })
      }
      ;(videoPlayer as any).video = mockVideo

      // Initial state
      expect(playButton.getAttribute('aria-label')).toBe('Play video')

      // After play
      fireEvent.click(playButton)
      await waitFor(() => {
        expect(playButton.getAttribute('aria-label')).toBe('Pause video')
      })
    })

    test('should support high contrast and reduced motion preferences', () => {
      const styles = videoPlayer.shadowRoot!.querySelector('style')?.textContent

      expect(styles).toContain('@media (prefers-contrast: high)')
      expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    })
  })

  /**
   * TDD CATEGORY 6: Performance Monitoring & Metrics
   * Tests real-time performance tracking and reporting
   */
  describe('Performance Monitoring & Metrics', () => {
    test('should collect comprehensive performance metrics', () => {
      const metrics = videoPlayer.getPerformanceMetrics()

      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('cpuUsage')
      expect(metrics).toHaveProperty('inputLatency')
      expect(metrics).toHaveProperty('videoStartTime')
      expect(metrics).toHaveProperty('bufferingRatio')

      expect(typeof metrics.memoryUsage).toBe('number')
      expect(typeof metrics.inputLatency).toBe('number')
    })

    test('should update performance indicator in real-time', async () => {
      const indicator = videoPlayer.shadowRoot!.querySelector('#perf-indicator') as HTMLElement

      // Start performance monitoring
      ;(videoPlayer as any).startPerformanceMonitoring()

      await waitFor(() => {
        expect(indicator.textContent).toContain('Memory:')
        expect(indicator.textContent).toContain('MB')
        expect(indicator.textContent).toContain('Input:')
        expect(indicator.textContent).toContain('ms')
      })
    })

    test('should provide color-coded performance warnings', async () => {
      const indicator = videoPlayer.shadowRoot!.querySelector('#perf-indicator') as HTMLElement

      // Simulate high memory usage (80% of limit)
      mockPerformanceMemory.usedJSHeapSize = 80 * 1024 * 1024

      ;(videoPlayer as any).updatePerformanceIndicator()

      expect(indicator.style.background).toContain('239, 68, 68') // Red warning
    })

    test('should emit performance events for external monitoring', async () => {
      const perfSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', perfSpy)

      ;(videoPlayer as any).startPerformanceMonitoring()

      await waitFor(() => {
        expect(perfSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: expect.objectContaining({
              type: 'performance-update',
              data: expect.objectContaining({
                memoryUsage: expect.any(Number),
                inputLatency: expect.any(Number)
              })
            })
          })
        )
      })
    })

    test('should calculate buffering ratio accurately', () => {
      const mockVideo = {
        buffered: {
          length: 2,
          start: (i: number) => i === 0 ? 0 : 50,
          end: (i: number) => i === 0 ? 30 : 80
        },
        currentTime: 25,
        duration: 100
      }
      ;(videoPlayer as any).video = mockVideo

      ;(videoPlayer as any).updatePerformanceMetrics()

      const metrics = videoPlayer.getPerformanceMetrics()
      // Total buffered: (30-0) + (80-50) = 60 seconds
      // Duration: 100 seconds
      // Buffering ratio: (100-60)/100 = 0.4
      expect(metrics.bufferingRatio).toBeCloseTo(0.4)
    })

    test('should handle performance monitoring cleanup', () => {
      const intervalId = 123
      ;(videoPlayer as any).performanceMonitoringInterval = intervalId

      const clearSpy = jest.spyOn(window, 'clearInterval')

      videoPlayer.disconnectedCallback()

      expect(clearSpy).toHaveBeenCalledWith(intervalId)
    })
  })

  /**
   * TDD CATEGORY 7: Integration & Edge Cases
   * Tests complex scenarios and error conditions
   */
  describe('Integration & Edge Cases', () => {
    test('should handle missing HLS support gracefully', () => {
      const originalIsSupported = Hls.isSupported
      if (Hls.isSupported && typeof Hls.isSupported === 'function' && (Hls.isSupported as any).mockReturnValue) {
        (Hls.isSupported as jest.Mock).mockReturnValue(false)
      } else {
        // If not a mock function, replace it temporarily
        Hls.isSupported = jest.fn().mockReturnValue(false)
      }

      // Mock native HLS support
      const mockVideo = { canPlayType: jest.fn(() => 'probably') }
      ;(videoPlayer as any).video = mockVideo

      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')

      expect(mockVideo.canPlayType).toHaveBeenCalledWith('application/vnd.apple.mpegurl')

      // Restore original
      Hls.isSupported = originalIsSupported
    })

    test('should handle complete HLS failure', async () => {
      const errorSpy = jest.fn()
      videoPlayer.addEventListener('hls-performance', errorSpy)

      const originalIsSupported = Hls.isSupported
      if (Hls.isSupported && typeof Hls.isSupported === 'function' && (Hls.isSupported as any).mockReturnValue) {
        (Hls.isSupported as jest.Mock).mockReturnValue(false)
      } else {
        // If not a mock function, replace it temporarily
        Hls.isSupported = jest.fn().mockReturnValue(false)
      }

      const mockVideo = { canPlayType: jest.fn(() => '') }
      ;(videoPlayer as any).video = mockVideo

      videoPlayer.setAttribute('src', 'http://example.com/stream.m3u8')

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'error',
            data: expect.objectContaining({
              error: 'HLS not supported in this browser'
            })
          })
        })
      )

      // Restore original
      Hls.isSupported = originalIsSupported
    })

    test('should maintain performance under rapid attribute changes', async () => {
      const updateSpy = jest.spyOn(videoPlayer as any, 'parseAttributes')

      // Rapid attribute changes
      for (let i = 0; i < 100; i++) {
        videoPlayer.setAttribute('memory-limit', String(100 + i))
        videoPlayer.setAttribute('cpu-limit', String(30 + i))
      }

      // Should handle gracefully without memory leaks
      const metrics = videoPlayer.getPerformanceMetrics()
      expect(metrics.memoryUsage).toBeLessThan(200 * 1024 * 1024) // Under 200MB
      expect(updateSpy).toHaveBeenCalled()
    })

    test('should work correctly when re-added to DOM', () => {
      // Remove and re-add
      videoPlayer.remove()
      document.body.appendChild(videoPlayer)

      // Should reinitialize correctly
      expect(videoPlayer.shadowRoot).toBeTruthy()
      expect(videoPlayer.shadowRoot!.querySelector('.video-element')).toBeTruthy()
    })
  })
})

/**
 * TDD LEARNING NOTES FOR JOHN:
 *
 * This comprehensive test suite demonstrates several key TDD principles:
 *
 * 1. **Tests Drive Implementation**: These tests are written BEFORE the actual implementation,
 *    defining exactly what behavior we expect from our Web Component.
 *
 * 2. **Performance-First Testing**: Every test considers Smart TV performance constraints,
 *    ensuring our implementation will meet FOX's streaming platform requirements.
 *
 * 3. **Enterprise Quality Standards**: 95% coverage target with comprehensive edge case testing
 *    demonstrates the quality standards expected at enterprise companies like FOX.
 *
 * 4. **Framework-Agnostic Design**: Web Component testing ensures the player works everywhere,
 *    which is crucial for FOX's diverse technology stack.
 *
 * 5. **Accessibility-First**: WCAG 2.1 AA compliance testing built in from the start,
 *    connecting to your experience at ADP/TBN.
 *
 * Next Steps:
 * - Run tests (they will fail - that's expected in TDD!)
 * - Implement features one test category at a time
 * - Watch tests pass as implementation becomes complete
 * - Refactor with confidence knowing tests verify behavior
 */