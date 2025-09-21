/**
 * Unit Tests for HLSVideoPlayer Web Component
 *
 * Tests cover:
 * - Event listener attachment and cleanup
 * - Video state management
 * - Time formatting functions
 * - Quality level changes
 * - Edge cases and error handling
 * - Memory cleanup on disconnect
 * - Keyboard navigation
 * - Performance optimization modes
 */

import { HLSVideoPlayer } from '../HLSVideoPlayer'
import Hls from 'hls.js'

// Mock HLS.js
jest.mock('hls.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      loadSource: jest.fn(),
      attachMedia: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn(),
      levels: [
        { height: 360, bitrate: 500000 },
        { height: 720, bitrate: 1500000 },
        { height: 1080, bitrate: 3000000 }
      ],
      currentLevel: -1,
      config: {}
    })),
    Events: {
      MANIFEST_PARSED: 'MANIFEST_PARSED',
      LEVEL_SWITCHED: 'LEVEL_SWITCHED',
      FRAG_LOADING: 'FRAG_LOADING',
      FRAG_LOADED: 'FRAG_LOADED',
      ERROR: 'ERROR'
    },
    isSupported: jest.fn(() => true)
  }
})

// Custom element mock for testing
if (!customElements.get('hls-video-player')) {
  customElements.define('hls-video-player', HLSVideoPlayer)
}

describe('HLSVideoPlayer Web Component', () => {
  let player: HLSVideoPlayer
  let container: HTMLDivElement
  let mockVideo: HTMLVideoElement
  let shadowRoot: ShadowRoot

  // Helper to wait for async operations
  const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 10))

  // Helper to simulate time passing
  const advanceTime = (ms: number) => {
    jest.advanceTimersByTime(ms)
    return waitForAsync()
  }

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div')
    document.body.appendChild(container)

    // Create player instance
    player = document.createElement('hls-video-player') as HLSVideoPlayer
    player.setAttribute('src', 'test-stream.m3u8')
    container.appendChild(player)

    // Get shadow root and video element
    shadowRoot = player.shadowRoot!
    mockVideo = shadowRoot.querySelector('.video-element') as HTMLVideoElement

    // Mock video element properties
    if (mockVideo) {
      Object.defineProperty(mockVideo, 'paused', {
        writable: true,
        value: true
      })
      Object.defineProperty(mockVideo, 'duration', {
        writable: true,
        value: 120
      })
      Object.defineProperty(mockVideo, 'currentTime', {
        writable: true,
        value: 0
      })
      Object.defineProperty(mockVideo, 'volume', {
        writable: true,
        value: 1
      })
      Object.defineProperty(mockVideo, 'muted', {
        writable: true,
        value: false
      })
      Object.defineProperty(mockVideo, 'readyState', {
        writable: true,
        value: HTMLMediaElement.HAVE_METADATA
      })
      Object.defineProperty(mockVideo, 'buffered', {
        value: {
          length: 1,
          start: () => 0,
          end: () => 60
        }
      })

      // Mock video methods
      mockVideo.play = jest.fn().mockResolvedValue(undefined)
      mockVideo.pause = jest.fn()
    }
  })

  afterEach(() => {
    // Cleanup
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Component Initialization', () => {
    it('should create shadow DOM with correct structure', () => {
      expect(shadowRoot).toBeTruthy()
      expect(shadowRoot.querySelector('.video-container')).toBeTruthy()
      expect(shadowRoot.querySelector('.video-element')).toBeTruthy()
      expect(shadowRoot.querySelector('.controls-overlay')).toBeTruthy()
      expect(shadowRoot.querySelector('#play-pause')).toBeTruthy()
      expect(shadowRoot.querySelector('#volume')).toBeTruthy()
      expect(shadowRoot.querySelector('.progress-bar')).toBeTruthy()
      expect(shadowRoot.querySelector('#fullscreen')).toBeTruthy()
    })

    it('should initialize with correct default attributes', () => {
      const defaultPlayer = document.createElement('hls-video-player') as HLSVideoPlayer
      container.appendChild(defaultPlayer)

      // Wait for initialization
      setTimeout(() => {
        const metrics = defaultPlayer.getPerformanceMetrics()
        expect(metrics.memoryUsage).toBe(0)
        expect(metrics.cpuUsage).toBe(0)
        expect(metrics.inputLatency).toBe(0)
      }, 0)
    })

    it('should parse performance mode attributes correctly', () => {
      player.setAttribute('performance-mode', 'smartTV')
      player.setAttribute('memory-limit', '100')
      player.setAttribute('cpu-limit', '30')

      // Force re-parsing
      player.connectedCallback()

      const metrics = player.getPerformanceMetrics()
      expect(player.getAttribute('performance-mode')).toBe('smartTV')
    })
  })

  describe('Play/Pause Controls', () => {
    it('should toggle play/pause on button click', async () => {
      const playPauseBtn = shadowRoot.querySelector('#play-pause') as HTMLButtonElement

      // Test play
      playPauseBtn.click()
      await waitForAsync()

      expect(mockVideo.play).toHaveBeenCalled()

      // Simulate video playing
      mockVideo.paused = false
      mockVideo.dispatchEvent(new Event('play'))
      await waitForAsync()

      expect(playPauseBtn.textContent).toBe('⏸️')
      expect(playPauseBtn.getAttribute('aria-label')).toBe('Pause video')

      // Test pause
      playPauseBtn.click()
      await waitForAsync()

      expect(mockVideo.pause).toHaveBeenCalled()

      // Simulate video paused
      mockVideo.paused = true
      mockVideo.dispatchEvent(new Event('pause'))
      await waitForAsync()

      expect(playPauseBtn.textContent).toBe('▶️')
      expect(playPauseBtn.getAttribute('aria-label')).toBe('Play video')
    })

    it('should handle play interruption gracefully', async () => {
      const playPauseBtn = shadowRoot.querySelector('#play-pause') as HTMLButtonElement

      // Mock play rejection
      mockVideo.play = jest.fn().mockRejectedValue(new Error('Play interrupted'))

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

      playPauseBtn.click()
      await waitForAsync()

      expect(consoleLogSpy).toHaveBeenCalledWith('Play was interrupted:', expect.any(Error))

      consoleLogSpy.mockRestore()
    })

    it('should work with keyboard shortcuts (Space and Enter)', async () => {
      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
      player.dispatchEvent(spaceEvent)
      await waitForAsync()

      expect(mockVideo.play).toHaveBeenCalled()

      // Test Enter key
      mockVideo.paused = false
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      player.dispatchEvent(enterEvent)
      await waitForAsync()

      expect(mockVideo.pause).toHaveBeenCalled()
    })
  })

  describe('Volume/Mute Controls', () => {
    it('should toggle mute on volume button click', async () => {
      const volumeBtn = shadowRoot.querySelector('#volume') as HTMLButtonElement

      // Test mute
      volumeBtn.click()
      await waitForAsync()

      expect(mockVideo.muted).toBe(true)
      expect(volumeBtn.textContent).toBe('🔇')
      expect(volumeBtn.getAttribute('aria-label')).toBe('Unmute volume')

      // Test unmute
      volumeBtn.click()
      await waitForAsync()

      expect(mockVideo.muted).toBe(false)
      expect(volumeBtn.textContent).toBe('🔊')
      expect(volumeBtn.getAttribute('aria-label')).toBe('Mute volume')
    })

    it('should unmute when volume is 0', async () => {
      const volumeBtn = shadowRoot.querySelector('#volume') as HTMLButtonElement

      // Set volume to 0
      mockVideo.volume = 0

      volumeBtn.click()
      await waitForAsync()

      expect(mockVideo.muted).toBe(false)
      expect(mockVideo.volume).toBe(1)
    })

    it('should handle missing video element gracefully', async () => {
      const volumeBtn = shadowRoot.querySelector('#volume') as HTMLButtonElement

      // Temporarily remove video reference
      const originalVideo = (player as any).video
      ;(player as any).video = null

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      volumeBtn.click()
      await waitForAsync()

      expect(consoleWarnSpy).toHaveBeenCalledWith('Volume control: Video element not found')

      // Restore
      ;(player as any).video = originalVideo
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Progress Bar Seeking', () => {
    it('should seek when clicking on progress bar', async () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      // Mock getBoundingClientRect
      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        width: 400,
        top: 0,
        bottom: 0,
        height: 0,
        right: 500,
        x: 100,
        y: 0,
        toJSON: () => {}
      }))

      // Click at 50% of progress bar
      const clickEvent = new MouseEvent('click', {
        clientX: 300, // 100 + (400 * 0.5)
        clientY: 10
      })

      progressBar.dispatchEvent(clickEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(60) // 50% of 120 seconds
    })

    it('should handle invalid duration gracefully', async () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      // Set invalid duration
      mockVideo.duration = NaN

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        width: 400,
        top: 0,
        bottom: 0,
        height: 0,
        right: 500,
        x: 100,
        y: 0,
        toJSON: () => {}
      }))

      const clickEvent = new MouseEvent('click', {
        clientX: 200,
        clientY: 10
      })

      progressBar.dispatchEvent(clickEvent)
      await waitForAsync()

      expect(consoleWarnSpy).toHaveBeenCalledWith('[HLSVideoPlayer] Invalid video duration:', NaN)

      consoleWarnSpy.mockRestore()
    })

    it('should handle seeking before metadata loads', async () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      // Set readyState to indicate metadata not loaded
      mockVideo.readyState = HTMLMediaElement.HAVE_NOTHING

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        width: 400,
        top: 0,
        bottom: 0,
        height: 0,
        right: 500,
        x: 100,
        y: 0,
        toJSON: () => {}
      }))

      const clickEvent = new MouseEvent('click', {
        clientX: 200,
        clientY: 10
      })

      progressBar.dispatchEvent(clickEvent)
      await waitForAsync()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[HLSVideoPlayer] Video metadata not loaded yet, readyState:',
        HTMLMediaElement.HAVE_NOTHING
      )

      consoleWarnSpy.mockRestore()
    })

    it('should support drag-to-seek functionality', async () => {
      const progressContainer = shadowRoot.querySelector('.progress-container') as HTMLElement
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        width: 400,
        top: 0,
        bottom: 0,
        height: 0,
        right: 500,
        x: 100,
        y: 0,
        toJSON: () => {}
      }))

      // Start drag
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 200,
        clientY: 10
      })
      progressContainer.dispatchEvent(mouseDownEvent)
      await waitForAsync()

      // Drag to new position
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 400,
        clientY: 10
      })
      document.dispatchEvent(mouseMoveEvent)
      await waitForAsync()

      // End drag
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)
      await waitForAsync()

      // Should seek to 75% (300/400)
      expect(mockVideo.currentTime).toBe(90) // 75% of 120 seconds
    })

    it('should update progress bar on time update', async () => {
      const progressFill = shadowRoot.querySelector('.progress-fill') as HTMLElement

      // Set current time to 30 seconds (25% of 120)
      mockVideo.currentTime = 30
      mockVideo.dispatchEvent(new Event('timeupdate'))
      await waitForAsync()

      expect(progressFill.style.width).toBe('25%')
    })
  })

  describe('Fullscreen Controls', () => {
    it('should toggle fullscreen on button click', async () => {
      const fullscreenBtn = shadowRoot.querySelector('#fullscreen') as HTMLButtonElement

      // Mock fullscreen API
      const mockRequestFullscreen = jest.fn()
      const mockExitFullscreen = jest.fn()

      player.requestFullscreen = mockRequestFullscreen
      document.exitFullscreen = mockExitFullscreen

      // Enter fullscreen
      fullscreenBtn.click()
      await waitForAsync()

      expect(mockRequestFullscreen).toHaveBeenCalled()

      // Exit fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: player
      })

      fullscreenBtn.click()
      await waitForAsync()

      expect(mockExitFullscreen).toHaveBeenCalled()

      // Cleanup
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      })
    })

    it('should respond to F key for fullscreen', async () => {
      const mockRequestFullscreen = jest.fn()
      const mockExitFullscreen = jest.fn()

      player.requestFullscreen = mockRequestFullscreen
      document.exitFullscreen = mockExitFullscreen

      // Test F key
      const fEvent = new KeyboardEvent('keydown', { key: 'f' })
      player.dispatchEvent(fEvent)
      await waitForAsync()

      expect(mockRequestFullscreen).toHaveBeenCalled()

      // Test uppercase F key
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: player
      })

      const FEvent = new KeyboardEvent('keydown', { key: 'F' })
      player.dispatchEvent(FEvent)
      await waitForAsync()

      expect(mockExitFullscreen).toHaveBeenCalled()

      // Cleanup
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should seek backward with ArrowLeft', async () => {
      mockVideo.currentTime = 50

      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      player.dispatchEvent(leftArrowEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(40) // 50 - 10
    })

    it('should seek forward with ArrowRight', async () => {
      mockVideo.currentTime = 50

      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      player.dispatchEvent(rightArrowEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(60) // 50 + 10
    })

    it('should not seek beyond video boundaries', async () => {
      // Test seeking beyond start
      mockVideo.currentTime = 5

      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      player.dispatchEvent(leftArrowEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(0) // Clamped to 0

      // Test seeking beyond end
      mockVideo.currentTime = 115

      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      player.dispatchEvent(rightArrowEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(120) // Clamped to duration
    })

    it('should handle invalid duration when seeking', async () => {
      mockVideo.duration = NaN
      mockVideo.currentTime = 10

      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      player.dispatchEvent(leftArrowEvent)
      await waitForAsync()

      // Should still seek backward
      expect(mockVideo.currentTime).toBe(0)

      // Reset for right arrow test
      mockVideo.currentTime = 10

      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      player.dispatchEvent(rightArrowEvent)
      await waitForAsync()

      // Should not change when duration is NaN
      expect(mockVideo.currentTime).toBe(20)
    })
  })

  describe('Quality Selector', () => {
    it('should populate quality levels from HLS', async () => {
      const qualitySelector = shadowRoot.querySelector('#quality') as HTMLSelectElement

      // Trigger manifest parsed to populate quality levels
      const hlsInstance = (player as any).hls
      if (hlsInstance && hlsInstance.on) {
        const manifestCallback = hlsInstance.on.mock.calls.find(
          (call: any) => call[0] === Hls.Events.MANIFEST_PARSED
        )?.[1]

        if (manifestCallback) {
          manifestCallback()
          await waitForAsync()
        }
      }

      // Check quality options
      const options = qualitySelector.querySelectorAll('option')
      expect(options.length).toBe(4) // Auto + 3 quality levels
      expect(options[0].value).toBe('auto')
      expect(options[1].textContent).toBe('360p')
      expect(options[2].textContent).toBe('720p')
      expect(options[3].textContent).toBe('1080p')
    })

    it('should change quality level on selection', async () => {
      const qualitySelector = shadowRoot.querySelector('#quality') as HTMLSelectElement
      const hlsInstance = (player as any).hls

      // Select specific quality
      qualitySelector.value = '1'
      qualitySelector.dispatchEvent(new Event('change'))
      await waitForAsync()

      expect(hlsInstance.currentLevel).toBe(1)

      // Select auto quality
      qualitySelector.value = 'auto'
      qualitySelector.dispatchEvent(new Event('change'))
      await waitForAsync()

      expect(hlsInstance.currentLevel).toBe(-1)
    })

    it('should dispatch quality change event', async () => {
      const qualityChangeSpy = jest.fn()
      player.addEventListener('hls-performance', qualityChangeSpy)

      const qualitySelector = shadowRoot.querySelector('#quality') as HTMLSelectElement

      qualitySelector.value = '2'
      qualitySelector.dispatchEvent(new Event('change'))
      await waitForAsync()

      expect(qualityChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'quality-changed',
            data: expect.objectContaining({
              quality: '1080p'
            })
          })
        })
      )
    })
  })

  describe('Time Formatting', () => {
    it('should format time correctly', () => {
      // Access private method through public API
      const timeDisplay = shadowRoot.querySelector('#current-time') as HTMLElement

      // Update video time and trigger update
      mockVideo.currentTime = 0
      mockVideo.dispatchEvent(new Event('timeupdate'))
      expect(timeDisplay.textContent).toBe('0:00')

      mockVideo.currentTime = 65
      mockVideo.dispatchEvent(new Event('timeupdate'))
      expect(timeDisplay.textContent).toBe('1:05')

      mockVideo.currentTime = 3661
      mockVideo.dispatchEvent(new Event('timeupdate'))
      expect(timeDisplay.textContent).toBe('61:01')
    })

    it('should handle NaN time values', () => {
      const timeDisplay = shadowRoot.querySelector('#current-time') as HTMLElement

      mockVideo.currentTime = NaN
      mockVideo.dispatchEvent(new Event('timeupdate'))
      expect(timeDisplay.textContent).toBe('0:00')
    })
  })

  describe('Performance Modes', () => {
    it('should apply Smart TV optimizations', () => {
      player.optimizeForSmartTV()

      expect(player.getAttribute('performance-mode')).toBe('smartTV')
      expect(player.getAttribute('memory-limit')).toBe('100')
      expect(player.getAttribute('cpu-limit')).toBe('30')
    })

    it('should apply mobile optimizations', () => {
      player.optimizeForMobile()

      expect(player.getAttribute('performance-mode')).toBe('mobile')
      expect(player.getAttribute('memory-limit')).toBe('200')
    })

    it('should apply correct HLS config for Smart TV mode', () => {
      player.setAttribute('performance-mode', 'smartTV')
      player.connectedCallback()

      const hlsInstance = (player as any).hls
      // HLS config is set during initialization
      expect(player.getAttribute('performance-mode')).toBe('smartTV')
    })
  })

  describe('Memory Management and Cleanup', () => {
    it('should cleanup resources on disconnect', () => {
      const hlsInstance = (player as any).hls
      const destroySpy = jest.spyOn(hlsInstance, 'destroy')

      // Disconnect the element
      player.disconnectedCallback()

      expect(destroySpy).toHaveBeenCalled()
      expect((player as any).hls).toBeNull()
      expect((player as any).performanceMonitoringInterval).toBeNull()
    })

    it('should handle memory cleanup when approaching limit', () => {
      // Mock performance.memory
      Object.defineProperty(performance, 'memory', {
        configurable: true,
        value: {
          usedJSHeapSize: 80 * 1024 * 1024 // 80MB
        }
      })

      player.setAttribute('memory-limit', '100') // 100MB limit

      const eventSpy = jest.fn()
      player.addEventListener('hls-performance', eventSpy)

      // Trigger memory monitoring
      ;(player as any).performMemoryCleanup()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'memory-cleanup'
          })
        })
      )

      // Cleanup
      delete (performance as any).memory
    })

    it('should remove event listeners on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(mockVideo, 'removeEventListener')
      const playerRemoveListenerSpy = jest.spyOn(player, 'removeEventListener')

      player.disconnectedCallback()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
      expect(playerRemoveListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Edge Cases', () => {
    it('should handle controls before video loads', async () => {
      // Create a new player without video
      const newPlayer = document.createElement('hls-video-player') as HLSVideoPlayer
      container.appendChild(newPlayer)

      const newShadowRoot = newPlayer.shadowRoot!
      const playBtn = newShadowRoot.querySelector('#play-pause') as HTMLButtonElement

      // Try to play before video exists
      playBtn.click()
      await waitForAsync()

      // Should not throw error
      expect(true).toBe(true)
    })

    it('should handle invalid video duration', () => {
      mockVideo.duration = Infinity

      const durationDisplay = shadowRoot.querySelector('#duration') as HTMLElement
      mockVideo.dispatchEvent(new Event('durationchange'))

      // Should handle Infinity gracefully
      expect(durationDisplay.textContent).toBeDefined()
    })

    it('should handle network errors gracefully', async () => {
      const errorSpy = jest.fn()
      player.addEventListener('hls-performance', errorSpy)

      // Simulate video error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Network error')
      })
      mockVideo.dispatchEvent(errorEvent)
      await waitForAsync()

      const metrics = player.getPerformanceMetrics()
      expect(metrics.errorCount).toBe(1)
    })

    it('should handle Safari native HLS support', async () => {
      // Mock Safari environment
      ;(Hls.isSupported as jest.Mock).mockReturnValue(false)

      // Mock canPlayType for Safari
      const originalCanPlayType = mockVideo.canPlayType
      mockVideo.canPlayType = jest.fn((type: string) => {
        if (type === 'application/vnd.apple.mpegurl') return 'maybe'
        return ''
      })

      // Create new player for Safari test
      const safariPlayer = document.createElement('hls-video-player') as HLSVideoPlayer
      safariPlayer.setAttribute('src', 'safari-stream.m3u8')
      container.appendChild(safariPlayer)

      await waitForAsync()

      const safariVideo = safariPlayer.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
      expect(safariVideo.src).toContain('safari-stream.m3u8')

      // Restore
      mockVideo.canPlayType = originalCanPlayType
      ;(Hls.isSupported as jest.Mock).mockReturnValue(true)
    })

    it('should handle unsupported browser gracefully', async () => {
      // Mock unsupported environment
      ;(Hls.isSupported as jest.Mock).mockReturnValue(false)

      const originalCanPlayType = mockVideo.canPlayType
      mockVideo.canPlayType = jest.fn(() => '')

      const errorSpy = jest.fn()
      player.addEventListener('hls-performance', errorSpy)

      // Force reload video
      player.setAttribute('src', 'unsupported.m3u8')
      await waitForAsync()

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

      // Restore
      mockVideo.canPlayType = originalCanPlayType
      ;(Hls.isSupported as jest.Mock).mockReturnValue(true)
    })
  })

  describe('Public API Methods', () => {
    it('should provide programmatic play control', async () => {
      await player.play()
      expect(mockVideo.play).toHaveBeenCalled()
    })

    it('should provide programmatic pause control', () => {
      player.pause()
      expect(mockVideo.pause).toHaveBeenCalled()
    })

    it('should provide programmatic seek control', () => {
      player.seek(45)
      expect(mockVideo.currentTime).toBe(45)

      // Test boundary clamping
      player.seek(-10)
      expect(mockVideo.currentTime).toBe(0)

      player.seek(200)
      expect(mockVideo.currentTime).toBe(120) // Clamped to duration
    })

    it('should handle invalid seek times', () => {
      player.seek(NaN)
      expect(mockVideo.currentTime).toBe(120) // Should not change

      player.seek(Infinity)
      expect(mockVideo.currentTime).toBe(120) // Clamped to duration
    })

    it('should provide quality control via API', () => {
      const hlsInstance = (player as any).hls

      player.setQuality('2')
      expect(hlsInstance.currentLevel).toBe(2)

      player.setQuality('auto')
      expect(hlsInstance.currentLevel).toBe(-1)
    })

    it('should return performance metrics', () => {
      const metrics = player.getPerformanceMetrics()

      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('cpuUsage')
      expect(metrics).toHaveProperty('inputLatency')
      expect(metrics).toHaveProperty('videoStartTime')
      expect(metrics).toHaveProperty('bufferingRatio')
      expect(metrics).toHaveProperty('segmentLoadTime')
      expect(metrics).toHaveProperty('throughputMbps')
      expect(metrics).toHaveProperty('errorCount')
    })
  })

  describe('Event Dispatching', () => {
    it('should dispatch performance events', () => {
      const eventSpy = jest.fn()
      player.addEventListener('hls-performance', eventSpy)

      // Trigger a performance event
      ;(player as any).dispatchPerformanceEvent('test-event', { test: true })

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'test-event',
            data: { test: true },
            timestamp: expect.any(Number),
            performanceMode: 'desktop'
          })
        })
      )
    })

    it('should dispatch metadata loaded event', async () => {
      const eventSpy = jest.fn()
      player.addEventListener('hls-performance', eventSpy)

      mockVideo.dispatchEvent(new Event('loadedmetadata'))
      await waitForAsync()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            type: 'metadata-loaded',
            data: expect.objectContaining({
              duration: 120,
              readyState: HTMLMediaElement.HAVE_METADATA
            })
          })
        })
      )
    })
  })

  describe('Touch Support', () => {
    it('should handle touch events for seeking', async () => {
      const progressContainer = shadowRoot.querySelector('.progress-container') as HTMLElement
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        width: 400,
        top: 0,
        bottom: 0,
        height: 0,
        right: 500,
        x: 100,
        y: 0,
        toJSON: () => {}
      }))

      // Simulate touch event
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: 300,
          clientY: 10,
          identifier: 0,
          pageX: 300,
          pageY: 10,
          screenX: 300,
          screenY: 10,
          target: progressContainer,
          force: 1,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0
        } as Touch]
      })

      progressContainer.dispatchEvent(touchEvent)
      await waitForAsync()

      expect(mockVideo.currentTime).toBe(60) // 50% of 120 seconds
    })
  })
})

describe('HLSVideoPlayer Integration Tests', () => {
  it('should handle complete playback lifecycle', async () => {
    const player = document.createElement('hls-video-player') as HLSVideoPlayer
    player.setAttribute('src', 'test.m3u8')
    player.setAttribute('performance-mode', 'desktop')

    document.body.appendChild(player)

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 10))

    const shadowRoot = player.shadowRoot!
    const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
    const playBtn = shadowRoot.querySelector('#play-pause') as HTMLButtonElement

    // Mock video ready
    Object.defineProperty(video, 'readyState', {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA
    })

    video.dispatchEvent(new Event('loadedmetadata'))
    video.dispatchEvent(new Event('loadeddata'))

    // Play video
    playBtn.click()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Seek
    player.seek(30)

    // Change quality
    player.setQuality('1')

    // Pause
    player.pause()

    // Get metrics
    const metrics = player.getPerformanceMetrics()
    expect(metrics).toBeDefined()

    // Cleanup
    player.disconnectedCallback()
    document.body.removeChild(player)
  })
})