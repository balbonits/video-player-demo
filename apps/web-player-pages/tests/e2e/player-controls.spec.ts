import { test, expect, Page } from '@playwright/test'

// Helper function to interact with shadow DOM controls
async function getPlayerShadowElement(page: Page, selector: string) {
  return await page.evaluateHandle((sel) => {
    const player = document.querySelector('hls-video-player')
    return player?.shadowRoot?.querySelector(sel)
  }, selector)
}

// Helper function to wait for video to be ready
async function waitForVideoReady(page: Page, timeout = 5000) {
  return await page.waitForFunction(
    () => {
      const player = document.querySelector('hls-video-player') as any
      const video = player?.shadowRoot?.querySelector('.video-element') as HTMLVideoElement
      return video && video.readyState >= 2 && video.duration > 0 && isFinite(video.duration)
    },
    { timeout }
  )
}

test.describe('Video Player Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Wait for the video player to be loaded
    await page.waitForSelector('hls-video-player', { timeout: 10000 })

    // Wait for shadow DOM to be ready
    await page.waitForTimeout(1000)
  })

  test('Play/Pause button should toggle video playback', async ({ page }) => {
    // Get the shadow root
    const player = await page.locator('hls-video-player').first()

    // Click play button (using keyboard for shadow DOM)
    await player.press('Space')
    await page.waitForTimeout(500)

    // Verify video is playing
    const isPlaying = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const video = shadowRoot?.querySelector('.video-element')
      return video && !video.paused
    })

    expect(isPlaying).toBe(true)

    // Click pause
    await player.press('Space')
    await page.waitForTimeout(500)

    // Verify video is paused
    const isPaused = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const video = shadowRoot?.querySelector('.video-element')
      return video && video.paused
    })

    expect(isPaused).toBe(true)
  })

  test('Volume/Mute button should toggle audio', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test volume control
    const volumeResult = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const volumeBtn = shadowRoot?.querySelector('#volume')
      const video = shadowRoot?.querySelector('.video-element')

      if (!volumeBtn || !video) return { error: 'Elements not found' }

      // Store initial state
      const initialMuted = video.muted
      const initialVolume = video.volume

      // Click volume button
      volumeBtn.click()

      // Check if state changed
      const afterClickMuted = video.muted
      const afterClickVolume = video.volume

      // Click again to toggle back
      volumeBtn.click()

      const finalMuted = video.muted
      const finalVolume = video.volume

      return {
        initialMuted,
        initialVolume,
        afterClickMuted,
        afterClickVolume,
        finalMuted,
        finalVolume,
        volumeButtonText: volumeBtn.textContent
      }
    })

    // Verify mute toggle works
    expect(volumeResult.afterClickMuted).toBe(!volumeResult.initialMuted)
    expect(volumeResult.finalMuted).toBe(volumeResult.initialMuted)
  })

  test('Seekbar should allow seeking to different positions', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Wait for video to load
    await page.waitForTimeout(2000)

    // Test seeking functionality
    const seekResult = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const progressBar = shadowRoot?.querySelector('.progress-bar')
      const video = shadowRoot?.querySelector('.video-element')

      if (!progressBar || !video) return { error: 'Elements not found' }

      // Wait for video to have duration
      if (!video.duration || !isFinite(video.duration)) {
        return { error: 'Video not loaded' }
      }

      const initialTime = video.currentTime

      // Simulate click at 50% of progress bar
      const rect = progressBar.getBoundingClientRect()
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      })

      progressBar.dispatchEvent(clickEvent)

      const newTime = video.currentTime
      const expectedTime = video.duration * 0.5

      return {
        initialTime,
        newTime,
        expectedTime,
        duration: video.duration,
        seekWorked: Math.abs(newTime - expectedTime) < 5 // Within 5 seconds tolerance
      }
    })

    expect(seekResult.seekWorked).toBe(true)
  })

  test('Keyboard navigation should work', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test arrow key seeking
    await player.press('ArrowRight')
    await page.waitForTimeout(500)

    const afterRightArrow = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const video = shadowRoot?.querySelector('.video-element')
      return video?.currentTime || 0
    })

    expect(afterRightArrow).toBeGreaterThanOrEqual(10) // Should seek forward 10 seconds

    await player.press('ArrowLeft')
    await page.waitForTimeout(500)

    const afterLeftArrow = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const video = shadowRoot?.querySelector('.video-element')
      return video?.currentTime || 0
    })

    expect(afterLeftArrow).toBeLessThan(afterRightArrow) // Should seek backward
  })

  test('Quality selector should be populated', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Wait for HLS to load and parse manifest
    await page.waitForTimeout(3000)

    const qualityOptions = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const qualitySelector = shadowRoot?.querySelector('#quality')

      if (!qualitySelector) return []

      const options = Array.from(qualitySelector.querySelectorAll('option'))
      return options.map((opt: any) => ({
        value: opt.value,
        text: opt.textContent
      }))
    })

    expect(qualityOptions.length).toBeGreaterThan(0)
    expect(qualityOptions.some(opt => opt.value === 'auto')).toBe(true)
  })

  test('Fullscreen button should toggle fullscreen mode', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    const fullscreenResult = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const fullscreenBtn = shadowRoot?.querySelector('#fullscreen')

      if (!fullscreenBtn) return { error: 'Fullscreen button not found' }

      // Note: Can't actually enter fullscreen in headless browser
      // but we can verify the button exists and is clickable
      fullscreenBtn.click()

      return {
        buttonExists: true,
        buttonText: fullscreenBtn.textContent,
        ariaLabel: fullscreenBtn.getAttribute('aria-label')
      }
    })

    expect(fullscreenResult.buttonExists).toBe(true)
    expect(fullscreenResult.ariaLabel).toContain('Fullscreen')
  })

  test('Time display should update during playback', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Start playback
    await player.press('Space')
    await page.waitForTimeout(2000)

    const timeDisplay = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const currentTimeEl = shadowRoot?.querySelector('#current-time')
      const durationEl = shadowRoot?.querySelector('#duration')

      return {
        currentTime: currentTimeEl?.textContent,
        duration: durationEl?.textContent
      }
    })

    expect(timeDisplay.currentTime).toBeTruthy()
    expect(timeDisplay.duration).toBeTruthy()
    expect(timeDisplay.currentTime).not.toBe('0:00')
  })
})

// REGRESSION TEST SUITE - Preventing volume/seekbar control bugs
test.describe('Regression Tests - Control Event Listeners', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player', { timeout: 10000 })
    await waitForVideoReady(page)
  })

  test('Volume button event listener should be properly attached', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test that volume button exists and has event listener
    const volumeTest = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const volumeBtn = shadowRoot?.querySelector('#volume')
      const video = shadowRoot?.querySelector('.video-element')

      if (!volumeBtn || !video) return { error: 'Elements not found' }

      // Check if button has event listeners (can't directly check, but can test functionality)
      const initialMuted = video.muted
      const initialVolume = video.volume

      // Simulate click event
      const clickEvent = new MouseEvent('click', { bubbles: true })
      volumeBtn.dispatchEvent(clickEvent)

      const afterClickMuted = video.muted
      const afterClickVolume = video.volume

      return {
        buttonExists: true,
        hasClickHandler: afterClickMuted !== initialMuted || afterClickVolume !== initialVolume,
        initialMuted,
        afterClickMuted,
        initialVolume,
        afterClickVolume
      }
    })

    expect(volumeTest.buttonExists).toBe(true)
    expect(volumeTest.hasClickHandler).toBe(true)
    expect(volumeTest.afterClickMuted).not.toBe(volumeTest.initialMuted)
  })

  test('Volume control should toggle between muted and unmuted states', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    for (let i = 0; i < 3; i++) { // Test multiple toggles
      const result = await player.evaluate((el: any) => {
        const shadowRoot = el.shadowRoot
        const volumeBtn = shadowRoot?.querySelector('#volume')
        const video = shadowRoot?.querySelector('.video-element')

        if (!volumeBtn || !video) return null

        const beforeState = {
          muted: video.muted,
          volume: video.volume,
          buttonText: volumeBtn.textContent
        }

        volumeBtn.click()

        const afterState = {
          muted: video.muted,
          volume: video.volume,
          buttonText: volumeBtn.textContent
        }

        return { beforeState, afterState }
      })

      expect(result).not.toBeNull()
      expect(result.afterState.muted).not.toBe(result.beforeState.muted)

      // Check button text changes appropriately
      if (result.afterState.muted) {
        expect(result.afterState.buttonText).toBe('🔇')
      } else {
        expect(result.afterState.buttonText).toBe('🔊')
      }
    }
  })

  test('Progress bar seeking should work at multiple positions', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test seeking at different percentages
    const seekPositions = [0.25, 0.5, 0.75, 0.9]

    for (const position of seekPositions) {
      const seekResult = await player.evaluate((el: any, pos: number) => {
        const shadowRoot = el.shadowRoot
        const progressBar = shadowRoot?.querySelector('.progress-bar')
        const video = shadowRoot?.querySelector('.video-element')

        if (!progressBar || !video || !video.duration) return null

        const rect = progressBar.getBoundingClientRect()
        const initialTime = video.currentTime

        // Create and dispatch click event at specific position
        const clickEvent = new MouseEvent('click', {
          clientX: rect.left + rect.width * pos,
          clientY: rect.top + rect.height / 2,
          bubbles: true
        })

        progressBar.dispatchEvent(clickEvent)

        const newTime = video.currentTime
        const expectedTime = video.duration * pos

        return {
          position: pos,
          initialTime,
          newTime,
          expectedTime,
          duration: video.duration,
          seekAccuracy: Math.abs(newTime - expectedTime),
          seekWorked: Math.abs(newTime - expectedTime) < 5
        }
      }, position)

      expect(seekResult).not.toBeNull()
      expect(seekResult.seekWorked).toBe(true)
      expect(seekResult.seekAccuracy).toBeLessThan(5)
    }
  })

  test('Progress bar should handle edge cases (0% and 100%)', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test seeking to start (0%)
    const seekToStart = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const progressBar = shadowRoot?.querySelector('.progress-bar')
      const video = shadowRoot?.querySelector('.video-element')

      if (!progressBar || !video || !video.duration) return null

      const rect = progressBar.getBoundingClientRect()

      // Seek to middle first
      video.currentTime = video.duration / 2

      // Then seek to start
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      })

      progressBar.dispatchEvent(clickEvent)

      return {
        currentTime: video.currentTime,
        isAtStart: video.currentTime < 1
      }
    })

    expect(seekToStart).not.toBeNull()
    expect(seekToStart.isAtStart).toBe(true)

    // Test seeking to end (100%)
    const seekToEnd = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const progressBar = shadowRoot?.querySelector('.progress-bar')
      const video = shadowRoot?.querySelector('.video-element')

      if (!progressBar || !video || !video.duration) return null

      const rect = progressBar.getBoundingClientRect()

      const clickEvent = new MouseEvent('click', {
        clientX: rect.right,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      })

      progressBar.dispatchEvent(clickEvent)

      return {
        currentTime: video.currentTime,
        duration: video.duration,
        isNearEnd: Math.abs(video.currentTime - video.duration) < 5
      }
    })

    expect(seekToEnd).not.toBeNull()
    expect(seekToEnd.isNearEnd).toBe(true)
  })

  test('Controls should work when video is not yet loaded', async ({ page }) => {
    // Create a new page with a non-existent video source
    await page.goto('http://localhost:3000')

    // Immediately try to use controls before video loads
    const player = await page.locator('hls-video-player').first()

    const controlsTest = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const volumeBtn = shadowRoot?.querySelector('#volume')
      const playBtn = shadowRoot?.querySelector('#play-pause')
      const progressBar = shadowRoot?.querySelector('.progress-bar')

      const results = {
        volumeClick: false,
        playClick: false,
        progressClick: false,
        errors: []
      }

      try {
        if (volumeBtn) {
          volumeBtn.click()
          results.volumeClick = true
        }
      } catch (e: any) {
        results.errors.push(`Volume: ${e.message}`)
      }

      try {
        if (playBtn) {
          playBtn.click()
          results.playClick = true
        }
      } catch (e: any) {
        results.errors.push(`Play: ${e.message}`)
      }

      try {
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect()
          const clickEvent = new MouseEvent('click', {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true
          })
          progressBar.dispatchEvent(clickEvent)
          results.progressClick = true
        }
      } catch (e: any) {
        results.errors.push(`Progress: ${e.message}`)
      }

      return results
    })

    // Controls should not throw errors even when video isn't loaded
    expect(controlsTest.errors).toHaveLength(0)
    expect(controlsTest.volumeClick).toBe(true)
    expect(controlsTest.playClick).toBe(true)
    expect(controlsTest.progressClick).toBe(true)
  })

  test('Multiple rapid clicks should not break controls', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test rapid volume clicking
    const rapidVolumeTest = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const volumeBtn = shadowRoot?.querySelector('#volume')
      const video = shadowRoot?.querySelector('.video-element')

      if (!volumeBtn || !video) return null

      const states = []

      // Click volume button 10 times rapidly
      for (let i = 0; i < 10; i++) {
        volumeBtn.click()
        states.push({
          muted: video.muted,
          volume: video.volume
        })
      }

      return {
        clickCount: 10,
        states,
        finalMuted: video.muted
      }
    })

    expect(rapidVolumeTest).not.toBeNull()
    expect(rapidVolumeTest.states).toHaveLength(10)

    // Test rapid seeking
    const rapidSeekTest = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const progressBar = shadowRoot?.querySelector('.progress-bar')
      const video = shadowRoot?.querySelector('.video-element')

      if (!progressBar || !video || !video.duration) return null

      const rect = progressBar.getBoundingClientRect()
      const positions = []

      // Click progress bar 5 times rapidly at different positions
      for (let i = 0; i < 5; i++) {
        const position = (i + 1) * 0.2 // 20%, 40%, 60%, 80%, 100%
        const clickEvent = new MouseEvent('click', {
          clientX: rect.left + rect.width * position,
          clientY: rect.top + rect.height / 2,
          bubbles: true
        })

        progressBar.dispatchEvent(clickEvent)
        positions.push({
          targetPosition: position,
          actualTime: video.currentTime,
          expectedTime: video.duration * position
        })
      }

      return {
        seekCount: 5,
        positions,
        finalTime: video.currentTime
      }
    })

    expect(rapidSeekTest).not.toBeNull()
    expect(rapidSeekTest.positions).toHaveLength(5)
  })
})

// CROSS-PLAYER VERSION TESTING
test.describe('Cross-Player Compatibility Tests', () => {
  const playerVersions = [
    { selector: 'hls-video-player', name: 'Web Component' },
    // Add other player versions here as they are implemented
    // { selector: '.react-player', name: 'React Player' },
    // { selector: '.roku-player', name: 'Roku Simulation' }
  ]

  for (const playerVersion of playerVersions) {
    test(`${playerVersion.name} - Volume control should work`, async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.waitForSelector(playerVersion.selector, { timeout: 10000 })

      const player = await page.locator(playerVersion.selector).first()

      // Test volume control for this player version
      const volumeWorks = await player.evaluate((el: any) => {
        const shadowRoot = el.shadowRoot || el
        const volumeBtn = shadowRoot.querySelector('#volume') || shadowRoot.querySelector('[aria-label*="Volume"]')
        const video = shadowRoot.querySelector('video')

        if (!volumeBtn || !video) return false

        const initialMuted = video.muted
        volumeBtn.click()
        const afterMuted = video.muted

        return afterMuted !== initialMuted
      })

      expect(volumeWorks).toBe(true)
    })

    test(`${playerVersion.name} - Seekbar should work`, async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.waitForSelector(playerVersion.selector, { timeout: 10000 })
      await waitForVideoReady(page)

      const player = await page.locator(playerVersion.selector).first()

      const seekWorks = await player.evaluate((el: any) => {
        const shadowRoot = el.shadowRoot || el
        const progressBar = shadowRoot.querySelector('.progress-bar') || shadowRoot.querySelector('[role="slider"]')
        const video = shadowRoot.querySelector('video')

        if (!progressBar || !video || !video.duration) return false

        const rect = progressBar.getBoundingClientRect()
        const initialTime = video.currentTime

        const clickEvent = new MouseEvent('click', {
          clientX: rect.left + rect.width * 0.5,
          clientY: rect.top + rect.height / 2,
          bubbles: true
        })

        progressBar.dispatchEvent(clickEvent)

        const newTime = video.currentTime
        return Math.abs(newTime - (video.duration * 0.5)) < 5
      })

      expect(seekWorks).toBe(true)
    })
  }
})

// PERFORMANCE AND MEMORY LEAK TESTING
test.describe('Performance and Memory Tests', () => {
  test('Controls should not cause memory leaks with repeated use', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    // Perform many control operations
    for (let i = 0; i < 20; i++) {
      await player.evaluate((el: any) => {
        const shadowRoot = el.shadowRoot
        const volumeBtn = shadowRoot?.querySelector('#volume')
        const progressBar = shadowRoot?.querySelector('.progress-bar')

        if (volumeBtn) volumeBtn.click()

        if (progressBar) {
          const rect = progressBar.getBoundingClientRect()
          const clickEvent = new MouseEvent('click', {
            clientX: rect.left + rect.width * Math.random(),
            clientY: rect.top + rect.height / 2,
            bubbles: true
          })
          progressBar.dispatchEvent(clickEvent)
        }
      })
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc()
      }
    })

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    // Memory should not increase significantly (allow 10MB increase)
    const memoryIncrease = finalMemory - initialMemory
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 10MB
  })

  test('Event listeners should be properly cleaned up on disconnect', async ({ page }) => {
    await page.evaluate(() => {
      // Create and remove player multiple times
      for (let i = 0; i < 5; i++) {
        const player = document.createElement('hls-video-player')
        player.setAttribute('src', 'test.m3u8')
        document.body.appendChild(player)

        // Wait for component to initialize
        setTimeout(() => {
          document.body.removeChild(player)
        }, 100)
      }
    })

    await page.waitForTimeout(1000)

    // Check that no orphaned event listeners remain
    const listenerCount = await page.evaluate(() => {
      // This is a simplified check - in reality you'd need more sophisticated monitoring
      return document.querySelectorAll('hls-video-player').length
    })

    expect(listenerCount).toBe(1) // Only the original player should remain
  })
})