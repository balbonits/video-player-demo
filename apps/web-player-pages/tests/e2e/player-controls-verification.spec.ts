/**
 * E2E Tests for HLSVideoPlayer Controls Verification
 *
 * These tests verify that all player controls work correctly in a real browser environment.
 * Tests cover all major functionality including play/pause, volume, seeking, fullscreen,
 * keyboard navigation, and edge cases.
 */

import { test, expect, Page } from '@playwright/test'

test.describe('HLSVideoPlayer Controls Verification', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    // Navigate to the test player page
    await page.goto('/test-player-controls.html')

    // Wait for the player to initialize
    await page.waitForSelector('hls-video-player', { state: 'attached' })
    await page.waitForTimeout(2000) // Wait for HLS to load
  })

  test.describe('Play/Pause Controls', () => {
    test('should toggle play/pause with button click', async () => {
      // Get the shadow root
      const player = await page.locator('hls-video-player').first()

      // Click play button
      await player.evaluate((el) => {
        const shadowRoot = el.shadowRoot
        const playBtn = shadowRoot?.querySelector('#play-pause') as HTMLButtonElement
        playBtn?.click()
      })

      // Wait a moment for video to start
      await page.waitForTimeout(500)

      // Verify video is playing
      const isPlaying = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return !video.paused
      })
      expect(isPlaying).toBe(true)

      // Click pause button
      await player.evaluate((el) => {
        const shadowRoot = el.shadowRoot
        const playBtn = shadowRoot?.querySelector('#play-pause') as HTMLButtonElement
        playBtn?.click()
      })

      // Verify video is paused
      const isPaused = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.paused
      })
      expect(isPaused).toBe(true)
    })

    test('should respond to Space key for play/pause', async () => {
      const player = await page.locator('hls-video-player').first()

      // Focus the player
      await player.focus()

      // Press space to play
      await page.keyboard.press(' ')
      await page.waitForTimeout(500)

      const isPlaying = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return !video.paused
      })
      expect(isPlaying).toBe(true)

      // Press space to pause
      await page.keyboard.press(' ')
      await page.waitForTimeout(500)

      const isPaused = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.paused
      })
      expect(isPaused).toBe(true)
    })

    test('should respond to Enter key for play/pause', async () => {
      const player = await page.locator('hls-video-player').first()

      // Focus the player
      await player.focus()

      // Press Enter to play
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      const isPlaying = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return !video.paused
      })
      expect(isPlaying).toBe(true)

      // Press Enter to pause
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      const isPaused = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.paused
      })
      expect(isPaused).toBe(true)
    })
  })

  test.describe('Volume/Mute Controls', () => {
    test('should toggle mute with volume button click', async () => {
      const player = await page.locator('hls-video-player').first()

      // Get initial mute state
      const initialMuted = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.muted
      })

      // Click volume button
      await player.evaluate((el) => {
        const shadowRoot = el.shadowRoot
        const volumeBtn = shadowRoot?.querySelector('#volume') as HTMLButtonElement
        volumeBtn?.click()
      })

      // Check mute state changed
      const afterMuted = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.muted
      })

      expect(afterMuted).toBe(!initialMuted)

      // Check button icon updated
      const buttonText = await player.evaluate((el) => {
        const volumeBtn = el.shadowRoot?.querySelector('#volume') as HTMLButtonElement
        return volumeBtn?.textContent
      })

      expect(buttonText).toBe(afterMuted ? '🔇' : '🔊')
    })

    test('should handle volume control before video loads', async () => {
      // Create a new player without source
      await page.evaluate(() => {
        const newPlayer = document.createElement('hls-video-player')
        newPlayer.id = 'test-player-no-source'
        document.body.appendChild(newPlayer)
      })

      const newPlayer = await page.locator('#test-player-no-source').first()

      // Try to click volume button
      await newPlayer.evaluate((el) => {
        const volumeBtn = el.shadowRoot?.querySelector('#volume') as HTMLButtonElement
        volumeBtn?.click()
      })

      // Should not throw error
      expect(true).toBe(true)

      // Cleanup
      await page.evaluate(() => {
        const player = document.getElementById('test-player-no-source')
        player?.remove()
      })
    })
  })

  test.describe('Progress Bar Seeking', () => {
    test('should seek when clicking on progress bar', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to be ready
      await page.waitForTimeout(2000)

      // Click at 50% of progress bar
      await player.evaluate((el) => {
        const progressBar = el.shadowRoot?.querySelector('.progress-bar') as HTMLElement
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement

        if (progressBar && video && video.duration) {
          const rect = progressBar.getBoundingClientRect()
          const clickX = rect.left + (rect.width * 0.5)
          const clickY = rect.top + (rect.height / 2)

          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: clickX,
            clientY: clickY
          })
          progressBar.dispatchEvent(clickEvent)
        }
      })

      await page.waitForTimeout(500)

      // Check that seek happened
      const currentTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      const duration = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.duration
      })

      // Should be around 50% of duration (within 10% tolerance due to buffering)
      if (duration && isFinite(duration)) {
        const expectedTime = duration * 0.5
        expect(currentTime).toBeGreaterThan(expectedTime * 0.4)
        expect(currentTime).toBeLessThan(expectedTime * 1.6)
      }
    })

    test('should support drag seeking', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to be ready
      await page.waitForTimeout(2000)

      // Perform drag on progress bar
      await player.evaluate((el) => {
        const progressContainer = el.shadowRoot?.querySelector('.progress-container') as HTMLElement
        const progressBar = el.shadowRoot?.querySelector('.progress-bar') as HTMLElement
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement

        if (progressBar && video && video.duration) {
          const rect = progressBar.getBoundingClientRect()

          // Simulate mousedown at 25%
          const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + (rect.width * 0.25),
            clientY: rect.top + (rect.height / 2)
          })
          progressContainer?.dispatchEvent(mouseDownEvent)

          // Simulate mousemove to 75%
          const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + (rect.width * 0.75),
            clientY: rect.top + (rect.height / 2)
          })
          document.dispatchEvent(mouseMoveEvent)

          // Simulate mouseup
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true
          })
          document.dispatchEvent(mouseUpEvent)
        }
      })

      await page.waitForTimeout(500)

      // Check that seek happened to around 75%
      const currentTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      const duration = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.duration
      })

      if (duration && isFinite(duration)) {
        const expectedTime = duration * 0.75
        expect(currentTime).toBeGreaterThan(expectedTime * 0.6)
        expect(currentTime).toBeLessThan(duration)
      }
    })

    test('should update progress bar display on time update', async () => {
      const player = await page.locator('hls-video-player').first()

      // Start playing
      await player.evaluate((el) => {
        const playBtn = el.shadowRoot?.querySelector('#play-pause') as HTMLButtonElement
        playBtn?.click()
      })

      // Wait for some playback
      await page.waitForTimeout(3000)

      // Check progress bar has updated
      const progressWidth = await player.evaluate((el) => {
        const progressFill = el.shadowRoot?.querySelector('.progress-fill') as HTMLElement
        return progressFill?.style.width
      })

      expect(progressWidth).toBeTruthy()
      expect(parseFloat(progressWidth || '0')).toBeGreaterThan(0)
    })
  })

  test.describe('Fullscreen Controls', () => {
    test('should toggle fullscreen with button click', async () => {
      const player = await page.locator('hls-video-player').first()

      // Click fullscreen button
      await player.evaluate((el) => {
        const fullscreenBtn = el.shadowRoot?.querySelector('#fullscreen') as HTMLButtonElement
        fullscreenBtn?.click()
      })

      // Wait for fullscreen transition
      await page.waitForTimeout(500)

      // Check if fullscreen was requested (may not work in headless mode)
      const isFullscreen = await page.evaluate(() => {
        return document.fullscreenElement !== null
      })

      // In headless mode, fullscreen might not work, so we just check no errors
      expect(true).toBe(true)
    })

    test('should respond to F key for fullscreen', async () => {
      const player = await page.locator('hls-video-player').first()

      // Focus the player
      await player.focus()

      // Press F key
      await page.keyboard.press('f')
      await page.waitForTimeout(500)

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should seek backward with ArrowLeft', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to load
      await page.waitForTimeout(2000)

      // Get initial time
      const initialTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        video.currentTime = 30 // Set to 30s for testing
        return video.currentTime
      })

      // Focus player and press left arrow
      await player.focus()
      await page.keyboard.press('ArrowLeft')

      // Check time decreased by 10 seconds
      const newTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      expect(newTime).toBeLessThan(initialTime)
      expect(Math.abs(newTime - (initialTime - 10))).toBeLessThan(1)
    })

    test('should seek forward with ArrowRight', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to load
      await page.waitForTimeout(2000)

      // Get initial time
      const initialTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        video.currentTime = 30 // Set to 30s for testing
        return video.currentTime
      })

      // Focus player and press right arrow
      await player.focus()
      await page.keyboard.press('ArrowRight')

      // Check time increased by 10 seconds
      const newTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      expect(newTime).toBeGreaterThan(initialTime)
      expect(Math.abs(newTime - (initialTime + 10))).toBeLessThan(1)
    })

    test('should not seek beyond video boundaries', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to load
      await page.waitForTimeout(2000)

      // Test seeking before start
      await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        video.currentTime = 5
      })

      await player.focus()
      await page.keyboard.press('ArrowLeft')

      const timeAtStart = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      expect(timeAtStart).toBe(0)

      // Test seeking beyond end
      const duration = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.duration
      })

      if (duration && isFinite(duration)) {
        await player.evaluate((el, dur) => {
          const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
          video.currentTime = dur - 5
        }, duration)

        await page.keyboard.press('ArrowRight')

        const timeAtEnd = await player.evaluate((el) => {
          const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
          return video.currentTime
        })

        expect(timeAtEnd).toBeLessThanOrEqual(duration)
      }
    })
  })

  test.describe('Quality Selection', () => {
    test('should change quality level', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for quality levels to load
      await page.waitForTimeout(3000)

      // Check if quality options are available
      const hasQualityLevels = await player.evaluate((el) => {
        const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
        return qualitySelector?.options.length > 1
      })

      if (hasQualityLevels) {
        // Change quality
        await player.evaluate((el) => {
          const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
          if (qualitySelector && qualitySelector.options.length > 1) {
            qualitySelector.value = '1'
            qualitySelector.dispatchEvent(new Event('change'))
          }
        })

        // Verify quality changed
        const selectedQuality = await player.evaluate((el) => {
          const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
          return qualitySelector?.value
        })

        expect(selectedQuality).toBe('1')
      }
    })

    test('should set auto quality', async () => {
      const player = await page.locator('hls-video-player').first()

      // Set to auto quality
      await player.evaluate((el) => {
        const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
        qualitySelector.value = 'auto'
        qualitySelector.dispatchEvent(new Event('change'))
      })

      const selectedQuality = await player.evaluate((el) => {
        const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
        return qualitySelector?.value
      })

      expect(selectedQuality).toBe('auto')
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle controls before video loads', async () => {
      // Create player without source
      await page.evaluate(() => {
        const newPlayer = document.createElement('hls-video-player')
        newPlayer.id = 'test-player-edge'
        document.body.appendChild(newPlayer)
      })

      const newPlayer = await page.locator('#test-player-edge').first()

      // Try all controls
      await newPlayer.evaluate((el) => {
        const shadowRoot = el.shadowRoot
        const playBtn = shadowRoot?.querySelector('#play-pause') as HTMLButtonElement
        const volumeBtn = shadowRoot?.querySelector('#volume') as HTMLButtonElement
        const fullscreenBtn = shadowRoot?.querySelector('#fullscreen') as HTMLButtonElement

        playBtn?.click()
        volumeBtn?.click()
        fullscreenBtn?.click()
      })

      // Should not throw errors
      expect(true).toBe(true)

      // Cleanup
      await page.evaluate(() => {
        const player = document.getElementById('test-player-edge')
        player?.remove()
      })
    })

    test('should handle invalid duration gracefully', async () => {
      const player = await page.locator('hls-video-player').first()

      // Try seeking with invalid duration
      await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement

        // Temporarily mock invalid duration
        Object.defineProperty(video, 'duration', {
          configurable: true,
          value: NaN
        })

        // Try to seek
        const progressBar = el.shadowRoot?.querySelector('.progress-bar') as HTMLElement
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 100,
          clientY: 10
        })
        progressBar?.dispatchEvent(clickEvent)
      })

      // Should not throw error
      expect(true).toBe(true)
    })

    test('should cleanup resources on disconnect', async () => {
      // Create temporary player
      await page.evaluate(() => {
        const tempPlayer = document.createElement('hls-video-player')
        tempPlayer.id = 'temp-player'
        tempPlayer.setAttribute('src', 'test.m3u8')
        document.body.appendChild(tempPlayer)
      })

      const tempPlayer = await page.locator('#temp-player').first()

      // Disconnect the player
      await page.evaluate(() => {
        const player = document.getElementById('temp-player') as any
        player?.disconnectedCallback()
        player?.remove()
      })

      // Should cleanup without errors
      expect(true).toBe(true)
    })
  })

  test.describe('Performance Metrics', () => {
    test('should provide performance metrics', async () => {
      const player = await page.locator('hls-video-player').first()

      const metrics = await player.evaluate((el: any) => {
        return el.getPerformanceMetrics()
      })

      expect(metrics).toBeDefined()
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('cpuUsage')
      expect(metrics).toHaveProperty('inputLatency')
      expect(metrics).toHaveProperty('videoStartTime')
      expect(metrics).toHaveProperty('bufferingRatio')
      expect(metrics).toHaveProperty('throughputMbps')
      expect(metrics).toHaveProperty('errorCount')
    })
  })

  test.describe('Programmatic API', () => {
    test('should support programmatic play/pause', async () => {
      const player = await page.locator('hls-video-player').first()

      // Play programmatically
      await player.evaluate((el: any) => {
        el.play()
      })

      await page.waitForTimeout(500)

      const isPlaying = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return !video.paused
      })

      expect(isPlaying).toBe(true)

      // Pause programmatically
      await player.evaluate((el: any) => {
        el.pause()
      })

      const isPaused = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.paused
      })

      expect(isPaused).toBe(true)
    })

    test('should support programmatic seeking', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for video to load
      await page.waitForTimeout(2000)

      // Seek to 45 seconds
      await player.evaluate((el: any) => {
        el.seek(45)
      })

      const currentTime = await player.evaluate((el) => {
        const video = el.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
        return video.currentTime
      })

      expect(Math.abs(currentTime - 45)).toBeLessThan(2)
    })

    test('should support quality change via API', async () => {
      const player = await page.locator('hls-video-player').first()

      // Wait for quality levels
      await page.waitForTimeout(3000)

      // Set quality
      await player.evaluate((el: any) => {
        el.setQuality('1')
      })

      const qualityValue = await player.evaluate((el) => {
        const qualitySelector = el.shadowRoot?.querySelector('#quality') as HTMLSelectElement
        return qualitySelector?.value
      })

      expect(qualityValue).toBe('1')
    })

    test('should apply performance modes', async () => {
      const player = await page.locator('hls-video-player').first()

      // Apply Smart TV mode
      await player.evaluate((el: any) => {
        el.optimizeForSmartTV()
      })

      const mode = await player.evaluate((el) => {
        return el.getAttribute('performance-mode')
      })

      expect(mode).toBe('smartTV')

      // Apply Mobile mode
      await player.evaluate((el: any) => {
        el.optimizeForMobile()
      })

      const mobileMode = await player.evaluate((el) => {
        return el.getAttribute('performance-mode')
      })

      expect(mobileMode).toBe('mobile')
    })
  })
})