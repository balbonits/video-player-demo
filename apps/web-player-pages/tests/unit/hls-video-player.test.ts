/**
 * Unit tests for HLSVideoPlayer Web Component
 * Focus on event listener attachment and control functionality
 */

import '@testing-library/jest-dom'

// Mock HLS.js
const mockHls = {
  isSupported: jest.fn(() => true),
  Events: {
    MANIFEST_PARSED: 'hlsManifestParsed',
    FRAG_LOADING: 'hlsFragLoading',
    FRAG_LOADED: 'hlsFragLoaded',
    LEVEL_SWITCHED: 'hlsLevelSwitched',
    ERROR: 'hlsError'
  },
  loadSource: jest.fn(),
  attachMedia: jest.fn(),
  on: jest.fn(),
  destroy: jest.fn(),
  levels: [],
  currentLevel: -1,
  config: {}
}

jest.mock('hls.js', () => ({
  __esModule: true,
  default: jest.fn(() => mockHls)
}))

// Import after mocking
import { HLSVideoPlayer } from '../../src/components/HLSVideoPlayer'

describe('HLSVideoPlayer - Event Listener Attachment', () => {
  let player: HLSVideoPlayer
  let shadowRoot: ShadowRoot

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = ''

    // Create player instance
    player = document.createElement('hls-video-player') as HLSVideoPlayer
    player.setAttribute('src', 'test.m3u8')
    document.body.appendChild(player)

    // Get shadow root
    shadowRoot = player.shadowRoot!
  })

  afterEach(() => {
    // Clean up
    if (player && player.parentNode) {
      player.parentNode.removeChild(player)
    }
    jest.clearAllMocks()
  })

  describe('Control Button Event Listeners', () => {
    test('Volume button should have click event listener attached', () => {
      const volumeBtn = shadowRoot.getElementById('volume')
      expect(volumeBtn).toBeTruthy()

      // Get video element
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Test that clicking volume button changes muted state
      const initialMuted = video.muted
      volumeBtn?.click()
      expect(video.muted).not.toBe(initialMuted)

      // Click again to toggle back
      volumeBtn?.click()
      expect(video.muted).toBe(initialMuted)
    })

    test('Play/pause button should have click event listener attached', () => {
      const playPauseBtn = shadowRoot.getElementById('play-pause')
      expect(playPauseBtn).toBeTruthy()

      // Get video element
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Mock play/pause methods
      const playMock = jest.spyOn(video, 'play').mockResolvedValue()
      const pauseMock = jest.spyOn(video, 'pause').mockImplementation()

      // Test play
      Object.defineProperty(video, 'paused', { value: true, writable: true })
      playPauseBtn?.click()
      expect(playMock).toHaveBeenCalled()

      // Test pause
      Object.defineProperty(video, 'paused', { value: false, writable: true })
      playPauseBtn?.click()
      expect(pauseMock).toHaveBeenCalled()
    })

    test('Progress bar should have click event listener for seeking', () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement
      expect(progressBar).toBeTruthy()

      // Get video element
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Mock video duration and current time
      Object.defineProperty(video, 'duration', { value: 100, writable: true })
      Object.defineProperty(video, 'currentTime', { value: 0, writable: true })

      // Create mock click event at 50% position
      const rect = progressBar.getBoundingClientRect()
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      })

      // Dispatch event and check if currentTime changed
      progressBar.dispatchEvent(clickEvent)
      expect(video.currentTime).toBeCloseTo(50, 1)
    })

    test('Quality selector should have change event listener', () => {
      const qualitySelector = shadowRoot.getElementById('quality') as HTMLSelectElement
      expect(qualitySelector).toBeTruthy()

      // Mock HLS instance on player
      ;(player as any).hls = mockHls

      // Add mock quality levels
      mockHls.levels = [
        { height: 720, bitrate: 2000000 },
        { height: 480, bitrate: 1000000 },
        { height: 360, bitrate: 500000 }
      ] as any

      // Update quality selector
      ;(player as any).updateQualitySelector()

      // Test change event
      qualitySelector.value = '1'
      const changeEvent = new Event('change')
      qualitySelector.dispatchEvent(changeEvent)

      expect(mockHls.currentLevel).toBe(1)
    })

    test('Fullscreen button should have click event listener', () => {
      const fullscreenBtn = shadowRoot.getElementById('fullscreen')
      expect(fullscreenBtn).toBeTruthy()

      // Mock fullscreen API
      const requestFullscreenMock = jest.spyOn(player, 'requestFullscreen').mockResolvedValue()
      const exitFullscreenMock = jest.spyOn(document, 'exitFullscreen').mockResolvedValue()

      // Test enter fullscreen
      Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true })
      fullscreenBtn?.click()
      expect(requestFullscreenMock).toHaveBeenCalled()

      // Test exit fullscreen
      Object.defineProperty(document, 'fullscreenElement', { value: player, writable: true })
      fullscreenBtn?.click()
      expect(exitFullscreenMock).toHaveBeenCalled()
    })
  })

  describe('Video Event Listeners', () => {
    test('Video play event should update button state', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      const playPauseBtn = shadowRoot.getElementById('play-pause')

      expect(video).toBeTruthy()
      expect(playPauseBtn).toBeTruthy()

      // Trigger play event
      video.dispatchEvent(new Event('play'))

      expect(playPauseBtn?.textContent).toBe('⏸️')
      expect(playPauseBtn?.getAttribute('aria-label')).toBe('Pause video')
    })

    test('Video pause event should update button state', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      const playPauseBtn = shadowRoot.getElementById('play-pause')

      expect(video).toBeTruthy()
      expect(playPauseBtn).toBeTruthy()

      // Trigger pause event
      video.dispatchEvent(new Event('pause'))

      expect(playPauseBtn?.textContent).toBe('▶️')
      expect(playPauseBtn?.getAttribute('aria-label')).toBe('Play video')
    })

    test('Video timeupdate event should update time display', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      const currentTimeEl = shadowRoot.getElementById('current-time')
      const durationEl = shadowRoot.getElementById('duration')

      expect(video).toBeTruthy()
      expect(currentTimeEl).toBeTruthy()
      expect(durationEl).toBeTruthy()

      // Set video properties
      Object.defineProperty(video, 'currentTime', { value: 65.5, writable: true })
      Object.defineProperty(video, 'duration', { value: 120, writable: true })

      // Trigger timeupdate event
      video.dispatchEvent(new Event('timeupdate'))

      expect(currentTimeEl?.textContent).toBe('1:05')
      expect(durationEl?.textContent).toBe('2:00')
    })

    test('Video timeupdate event should update progress bar', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      const progressFill = shadowRoot.querySelector('.progress-fill') as HTMLElement
      const progressBuffer = shadowRoot.querySelector('.progress-buffer') as HTMLElement

      expect(video).toBeTruthy()
      expect(progressFill).toBeTruthy()
      expect(progressBuffer).toBeTruthy()

      // Set video properties
      Object.defineProperty(video, 'currentTime', { value: 30, writable: true })
      Object.defineProperty(video, 'duration', { value: 100, writable: true })

      // Mock buffered ranges
      Object.defineProperty(video, 'buffered', {
        value: {
          length: 1,
          start: jest.fn(() => 0),
          end: jest.fn(() => 50)
        },
        writable: true
      })

      // Trigger timeupdate event
      video.dispatchEvent(new Event('timeupdate'))

      expect(progressFill.style.width).toBe('30%')
      expect(progressBuffer.style.width).toBe('50%')
    })
  })

  describe('Keyboard Event Listeners', () => {
    test('Space key should toggle play/pause', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Mock play/pause methods
      const playMock = jest.spyOn(video, 'play').mockResolvedValue()
      const pauseMock = jest.spyOn(video, 'pause').mockImplementation()

      // Test play with space
      Object.defineProperty(video, 'paused', { value: true, writable: true })
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
      player.dispatchEvent(spaceEvent)
      expect(playMock).toHaveBeenCalled()

      // Test pause with space
      Object.defineProperty(video, 'paused', { value: false, writable: true })
      player.dispatchEvent(spaceEvent)
      expect(pauseMock).toHaveBeenCalled()
    })

    test('Arrow keys should seek forward/backward', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Set video properties
      Object.defineProperty(video, 'currentTime', { value: 50, writable: true })
      Object.defineProperty(video, 'duration', { value: 100, writable: true })

      // Test right arrow (forward 10s)
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      player.dispatchEvent(rightEvent)
      expect(video.currentTime).toBe(60)

      // Test left arrow (backward 10s)
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      player.dispatchEvent(leftEvent)
      expect(video.currentTime).toBe(50)
    })

    test('F key should toggle fullscreen', () => {
      const requestFullscreenMock = jest.spyOn(player, 'requestFullscreen').mockResolvedValue()
      const exitFullscreenMock = jest.spyOn(document, 'exitFullscreen').mockResolvedValue()

      // Test enter fullscreen
      Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true })
      const fEvent = new KeyboardEvent('keydown', { key: 'f' })
      player.dispatchEvent(fEvent)
      expect(requestFullscreenMock).toHaveBeenCalled()

      // Test exit fullscreen
      Object.defineProperty(document, 'fullscreenElement', { value: player, writable: true })
      player.dispatchEvent(fEvent)
      expect(exitFullscreenMock).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('Controls should not throw errors when video is null', () => {
      // Remove video element
      const video = shadowRoot.querySelector('.video-element')
      if (video) {
        video.remove()
      }

      const volumeBtn = shadowRoot.getElementById('volume')
      const playPauseBtn = shadowRoot.getElementById('play-pause')
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement

      // These should not throw errors
      expect(() => volumeBtn?.click()).not.toThrow()
      expect(() => playPauseBtn?.click()).not.toThrow()
      expect(() => {
        const clickEvent = new MouseEvent('click', {
          clientX: 100,
          clientY: 50,
          bubbles: true
        })
        progressBar?.dispatchEvent(clickEvent)
      }).not.toThrow()
    })

    test('Progress bar should handle NaN duration gracefully', () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

      expect(progressBar).toBeTruthy()
      expect(video).toBeTruthy()

      // Set invalid duration
      Object.defineProperty(video, 'duration', { value: NaN, writable: true })
      Object.defineProperty(video, 'currentTime', { value: 0, writable: true })

      const rect = progressBar.getBoundingClientRect()
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      })

      // Should not change currentTime when duration is NaN
      progressBar.dispatchEvent(clickEvent)
      expect(video.currentTime).toBe(0)
    })

    test('Volume button should handle edge cases', () => {
      const volumeBtn = shadowRoot.getElementById('volume')
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

      expect(volumeBtn).toBeTruthy()
      expect(video).toBeTruthy()

      // Test when volume is 0 but not muted
      video.muted = false
      video.volume = 0
      volumeBtn?.click()
      expect(video.muted).toBe(false)
      expect(video.volume).toBe(1)

      // Test when already at max volume
      video.muted = false
      video.volume = 1
      volumeBtn?.click()
      expect(video.muted).toBe(true)
    })

    test('Event listeners should be removed on disconnect', () => {
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
      expect(video).toBeTruthy()

      // Spy on removeEventListener
      const removeListenerSpy = jest.spyOn(video, 'removeEventListener')
      const playerRemoveListenerSpy = jest.spyOn(player, 'removeEventListener')

      // Disconnect the component
      player.remove()

      // Check that cleanup occurred
      expect(removeListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
      expect(playerRemoveListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Performance and Memory Management', () => {
    test('Multiple event triggers should not accumulate listeners', () => {
      const volumeBtn = shadowRoot.getElementById('volume')
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

      expect(volumeBtn).toBeTruthy()
      expect(video).toBeTruthy()

      // Track initial state
      const initialMuted = video.muted

      // Click multiple times
      for (let i = 0; i < 10; i++) {
        volumeBtn?.click()
      }

      // Should toggle correctly (10 clicks = same as initial state)
      expect(video.muted).toBe(initialMuted)
    })

    test('Rapid seeking should not break progress bar', () => {
      const progressBar = shadowRoot.querySelector('.progress-bar') as HTMLElement
      const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

      expect(progressBar).toBeTruthy()
      expect(video).toBeTruthy()

      Object.defineProperty(video, 'duration', { value: 100, writable: true })
      Object.defineProperty(video, 'currentTime', { value: 0, writable: true })

      const rect = progressBar.getBoundingClientRect()

      // Perform rapid seeks
      const positions = [0.1, 0.3, 0.5, 0.7, 0.9]
      positions.forEach(pos => {
        const clickEvent = new MouseEvent('click', {
          clientX: rect.left + rect.width * pos,
          clientY: rect.top + rect.height / 2,
          bubbles: true
        })
        progressBar.dispatchEvent(clickEvent)
        expect(video.currentTime).toBeCloseTo(100 * pos, 1)
      })
    })
  })
})

describe('HLSVideoPlayer - Control State Management', () => {
  let player: HLSVideoPlayer
  let shadowRoot: ShadowRoot

  beforeEach(() => {
    document.body.innerHTML = ''
    player = document.createElement('hls-video-player') as HLSVideoPlayer
    document.body.appendChild(player)
    shadowRoot = player.shadowRoot!
  })

  afterEach(() => {
    if (player && player.parentNode) {
      player.parentNode.removeChild(player)
    }
    jest.clearAllMocks()
  })

  test('Volume button text should reflect mute state', () => {
    const volumeBtn = shadowRoot.getElementById('volume')
    const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

    expect(volumeBtn).toBeTruthy()
    expect(video).toBeTruthy()

    // Start unmuted
    video.muted = false
    volumeBtn?.click()
    expect(volumeBtn?.textContent).toBe('🔇')
    expect(volumeBtn?.getAttribute('aria-label')).toBe('Unmute volume')

    // Click to unmute
    volumeBtn?.click()
    expect(volumeBtn?.textContent).toBe('🔊')
    expect(volumeBtn?.getAttribute('aria-label')).toBe('Mute volume')
  })

  test('Play button should reflect playback state', () => {
    const playPauseBtn = shadowRoot.getElementById('play-pause')
    const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement

    expect(playPauseBtn).toBeTruthy()
    expect(video).toBeTruthy()

    // Initial state (paused)
    video.dispatchEvent(new Event('pause'))
    expect(playPauseBtn?.textContent).toBe('▶️')
    expect(playPauseBtn?.getAttribute('aria-label')).toBe('Play video')

    // Playing state
    video.dispatchEvent(new Event('play'))
    expect(playPauseBtn?.textContent).toBe('⏸️')
    expect(playPauseBtn?.getAttribute('aria-label')).toBe('Pause video')
  })

  test('Time display should format correctly', () => {
    const video = shadowRoot.querySelector('.video-element') as HTMLVideoElement
    const currentTimeEl = shadowRoot.getElementById('current-time')
    const durationEl = shadowRoot.getElementById('duration')

    expect(video).toBeTruthy()

    // Test various time formats
    const testCases = [
      { currentTime: 0, duration: 0, expectedCurrent: '0:00', expectedDuration: '0:00' },
      { currentTime: 59, duration: 120, expectedCurrent: '0:59', expectedDuration: '2:00' },
      { currentTime: 61, duration: 3661, expectedCurrent: '1:01', expectedDuration: '61:01' },
      { currentTime: 3599, duration: 3600, expectedCurrent: '59:59', expectedDuration: '60:00' }
    ]

    testCases.forEach(({ currentTime, duration, expectedCurrent, expectedDuration }) => {
      Object.defineProperty(video, 'currentTime', { value: currentTime, writable: true })
      Object.defineProperty(video, 'duration', { value: duration, writable: true })

      video.dispatchEvent(new Event('timeupdate'))

      expect(currentTimeEl?.textContent).toBe(expectedCurrent)
      expect(durationEl?.textContent).toBe(expectedDuration)
    })
  })
})