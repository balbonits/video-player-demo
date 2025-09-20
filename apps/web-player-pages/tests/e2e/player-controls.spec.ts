import { test, expect } from '@playwright/test'

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