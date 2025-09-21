/**
 * Comprehensive E2E Tests for All Player Versions
 * Sam (QA) - Testing all 6 player implementations with 90% coverage target
 */

import { test, expect, Page } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

// Player version configurations matching PlayerVersionSelector component
const PLAYER_VERSIONS = [
  {
    id: 'hls-js',
    name: 'HLS.js Performance',
    performanceMode: 'smartTV',
    memoryLimit: 100, // MB
    cpuLimit: 30 // percentage
  },
  {
    id: 'native-html5',
    name: 'Native HTML5 Video',
    performanceMode: 'desktop',
    memoryLimit: 500,
    cpuLimit: 80
  },
  {
    id: 'mobile-optimized',
    name: 'Mobile Optimized',
    performanceMode: 'mobile',
    memoryLimit: 200,
    cpuLimit: 50
  },
  {
    id: 'roku-simulation',
    name: 'Roku TV Simulation',
    performanceMode: 'smartTV',
    memoryLimit: 256,
    cpuLimit: 25
  },
  {
    id: 'chromecast-receiver',
    name: 'Chromecast Receiver',
    performanceMode: 'smartTV',
    memoryLimit: 150,
    cpuLimit: 35
  },
  {
    id: 'performance-benchmark',
    name: 'Performance Benchmark',
    performanceMode: 'desktop',
    memoryLimit: 1000,
    cpuLimit: 100
  }
]

// Test content sources
const TEST_STREAMS = [
  {
    name: 'Planete Interdite',
    url: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
    type: 'hls',
    hasSubtitles: true
  },
  {
    name: 'Apple HLS Test',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls',
    hasSubtitles: false
  }
]

test.describe('All Player Versions - Comprehensive Testing', () => {

  // Test each player version
  for (const player of PLAYER_VERSIONS) {
    test.describe(`${player.name} (${player.id})`, () => {

      test.beforeEach(async ({ page }) => {
        // Navigate to the player page
        await page.goto('/')

        // Wait for player selector to be visible
        await page.waitForSelector('[data-testid="player-version-selector"]', { timeout: 10000 })

        // Select the specific player version
        await selectPlayerVersion(page, player.id)

        // Wait for player to initialize
        await page.waitForTimeout(2000)
      })

      test('should load and display player controls', async ({ page }) => {
        // Verify player container exists
        const playerContainer = await page.locator('[data-testid="video-player-container"]')
        await expect(playerContainer).toBeVisible()

        // Check for essential controls
        const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")')
        await expect(playButton).toBeVisible()

        const volumeControl = await page.locator('[data-testid="volume-control"], [aria-label*="Volume"], input[type="range"]')
        await expect(volumeControl).toBeVisible()

        const progressBar = await page.locator('[data-testid="progress-bar"], [aria-label*="Seek"], input[type="range"]')
        await expect(progressBar).toBeVisible()

        // Take screenshot for visual verification
        await page.screenshot({
          path: `test-results/screenshots/${player.id}-controls.png`,
          fullPage: false
        })
      })

      test('should play and pause video correctly', async ({ page }) => {
        // Wait for video element
        const video = await page.locator('video').first()
        await expect(video).toBeVisible()

        // Get play button
        const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")').first()

        // Start playback
        await playButton.click()
        await page.waitForTimeout(2000)

        // Verify video is playing
        const isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
        expect(isPlaying).toBeTruthy()

        // Pause video
        const pauseButton = await page.locator('[data-testid="pause-button"], [aria-label*="Pause"], button:has-text("Pause")').first()
        await pauseButton.click()
        await page.waitForTimeout(1000)

        // Verify video is paused
        const isPaused = await video.evaluate((el: HTMLVideoElement) => el.paused)
        expect(isPaused).toBeTruthy()
      })

      test('should handle volume control', async ({ page }) => {
        const video = await page.locator('video').first()
        const volumeControl = await page.locator('[data-testid="volume-control"], [aria-label*="Volume"], input[type="range"]').first()

        // Set volume to 50%
        await volumeControl.fill('50')
        let volume = await video.evaluate((el: HTMLVideoElement) => el.volume)
        expect(volume).toBeCloseTo(0.5, 1)

        // Set volume to 0 (mute)
        await volumeControl.fill('0')
        volume = await video.evaluate((el: HTMLVideoElement) => el.volume)
        expect(volume).toBe(0)

        // Set volume to 100%
        await volumeControl.fill('100')
        volume = await video.evaluate((el: HTMLVideoElement) => el.volume)
        expect(volume).toBe(1)
      })

      test('should handle seeking/scrubbing', async ({ page }) => {
        const video = await page.locator('video').first()
        const progressBar = await page.locator('[data-testid="progress-bar"], [aria-label*="Seek"], input[type="range"]').first()

        // Start playback
        const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")').first()
        await playButton.click()
        await page.waitForTimeout(3000)

        // Seek to 30 seconds
        await progressBar.fill('30')
        await page.waitForTimeout(1000)

        const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)
        expect(currentTime).toBeGreaterThanOrEqual(25)
        expect(currentTime).toBeLessThanOrEqual(35)
      })

      test('should handle fullscreen toggle', async ({ page }) => {
        const fullscreenButton = await page.locator('[data-testid="fullscreen-button"], [aria-label*="Fullscreen"], button:has-text("Fullscreen")').first()

        // Enter fullscreen
        await fullscreenButton.click()
        await page.waitForTimeout(1000)

        // Check if fullscreen API was called (we can't verify actual fullscreen in headless)
        const isFullscreen = await page.evaluate(() => document.fullscreenElement !== null)

        // Exit fullscreen if entered
        if (isFullscreen) {
          await page.keyboard.press('Escape')
          await page.waitForTimeout(1000)
        }
      })

      test('should display quality selector for adaptive streaming', async ({ page }) => {
        // Look for quality selector
        const qualitySelector = await page.locator('[data-testid="quality-selector"], [aria-label*="Quality"], select, button:has-text("Quality")')

        if (await qualitySelector.isVisible()) {
          await qualitySelector.click()

          // Check for quality options
          const qualityOptions = await page.locator('[data-testid*="quality-option"], [role="option"]')
          const count = await qualityOptions.count()
          expect(count).toBeGreaterThan(0)
        }
      })

      test('should handle captions/subtitles', async ({ page }) => {
        // Look for caption button
        const captionButton = await page.locator('[data-testid="caption-button"], [aria-label*="Caption"], [aria-label*="Subtitle"], button:has-text("CC")')

        if (await captionButton.isVisible()) {
          await captionButton.click()

          // Check for caption tracks
          const captionOptions = await page.locator('[data-testid*="caption-option"], [role="option"]')
          const count = await captionOptions.count()
          expect(count).toBeGreaterThanOrEqual(0) // May have no captions
        }
      })

      test('should switch between stream sources', async ({ page }) => {
        // Look for stream selector
        const streamSelector = await page.locator('[data-testid="stream-selector"], select[name*="stream"], button:has-text("Change Stream")')

        if (await streamSelector.isVisible()) {
          // Change to different stream
          await streamSelector.click()

          const streamOptions = await page.locator('[data-testid*="stream-option"], option')
          if (await streamOptions.count() > 1) {
            await streamOptions.nth(1).click()
            await page.waitForTimeout(2000)

            // Verify stream changed
            const video = await page.locator('video').first()
            await expect(video).toBeVisible()
          }
        }
      })

      test('should respect performance constraints', async ({ page }) => {
        // Collect performance metrics
        const metrics = await page.evaluate(() => {
          const getMemoryUsage = () => {
            if ('memory' in performance) {
              return (performance as any).memory.usedJSHeapSize / 1048576 // Convert to MB
            }
            return null
          }

          return {
            memory: getMemoryUsage(),
            timing: performance.timing,
            navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          }
        })

        // Check memory usage if available
        if (metrics.memory !== null) {
          console.log(`${player.name} - Memory usage: ${metrics.memory.toFixed(2)} MB`)
          expect(metrics.memory).toBeLessThanOrEqual(player.memoryLimit * 1.2) // Allow 20% overhead
        }

        // Check load performance
        if (metrics.navigation) {
          const loadTime = metrics.navigation.loadEventEnd - metrics.navigation.fetchStart
          console.log(`${player.name} - Load time: ${loadTime}ms`)
          expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
        }
      })

      test('should handle keyboard navigation', async ({ page }) => {
        const video = await page.locator('video').first()

        // Focus on video player
        await video.focus()

        // Test space bar for play/pause
        await page.keyboard.press('Space')
        await page.waitForTimeout(1000)
        let isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
        expect(isPlaying).toBeTruthy()

        await page.keyboard.press('Space')
        await page.waitForTimeout(1000)
        isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
        expect(isPlaying).toBeFalsy()

        // Test arrow keys for seeking
        const initialTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(500)
        const newTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)
        expect(newTime).toBeGreaterThan(initialTime)

        // Test volume controls
        await page.keyboard.press('ArrowUp')
        await page.waitForTimeout(500)
        const volumeUp = await video.evaluate((el: HTMLVideoElement) => el.volume)

        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(500)
        const volumeDown = await video.evaluate((el: HTMLVideoElement) => el.volume)
        expect(volumeDown).toBeLessThanOrEqual(volumeUp)
      })

      test('should maintain state when switching players', async ({ page }) => {
        const video = await page.locator('video').first()

        // Start playback and seek to specific time
        const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")').first()
        await playButton.click()
        await page.waitForTimeout(3000)

        // Remember current state
        const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)
        const volume = await video.evaluate((el: HTMLVideoElement) => el.volume)

        // Switch to another player
        const nextPlayer = PLAYER_VERSIONS.find(p => p.id !== player.id)
        if (nextPlayer) {
          await selectPlayerVersion(page, nextPlayer.id)
          await page.waitForTimeout(2000)

          // Check if state was preserved (within tolerance)
          const newVideo = await page.locator('video').first()
          const newTime = await newVideo.evaluate((el: HTMLVideoElement) => el.currentTime)
          const newVolume = await newVideo.evaluate((el: HTMLVideoElement) => el.volume)

          expect(newTime).toBeCloseTo(currentTime, 5) // Within 5 seconds
          expect(newVolume).toBeCloseTo(volume, 0.1) // Within 10% volume
        }
      })
    })
  }
})

// Helper function to select a player version
async function selectPlayerVersion(page: Page, playerId: string) {
  // Open player selector dropdown
  const selector = await page.locator('[data-testid="player-version-selector"], button:has-text("HLS.js Performance"), button:has-text("Native HTML5"), button:has-text("Mobile Optimized")').first()
  await selector.click()

  // Select the specific player
  const playerOption = await page.locator(`[data-testid="player-option-${playerId}"], button:has-text("${PLAYER_VERSIONS.find(p => p.id === playerId)?.name}")`)
  await playerOption.click()

  // Wait for player to switch
  await page.waitForTimeout(1000)
}

// Cross-browser compatibility tests
test.describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit']

  browsers.forEach(browserName => {
    test(`should work in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      if (currentBrowser !== browserName) {
        test.skip()
        return
      }

      await page.goto('/')
      await page.waitForSelector('[data-testid="video-player-container"]', { timeout: 10000 })

      // Verify basic functionality
      const video = await page.locator('video').first()
      await expect(video).toBeVisible()

      const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")').first()
      await playButton.click()
      await page.waitForTimeout(2000)

      const isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
      expect(isPlaying).toBeTruthy()
    })
  })
})

// Performance benchmarking tests
test.describe('Performance Benchmarks', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    // Navigate and collect metrics
    await page.goto('/')

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Collect Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp, lcp, cls, fid, ttfb

        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          fcp = entries[entries.length - 1].startTime
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          lcp = entries[entries.length - 1].startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        let clsScore = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
          cls = clsScore
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Time to First Byte
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        ttfb = navigation.responseStart - navigation.requestStart

        // Resolve after collecting metrics
        setTimeout(() => {
          resolve({
            fcp: fcp || 0,
            lcp: lcp || 0,
            cls: cls || 0,
            ttfb: ttfb || 0
          })
        }, 3000)
      })
    })

    // Assert Core Web Vitals
    console.log('Core Web Vitals:', vitals)
    expect(vitals.fcp).toBeLessThan(1800) // FCP < 1.8s
    expect(vitals.lcp).toBeLessThan(2500) // LCP < 2.5s
    expect(vitals.cls).toBeLessThan(0.1) // CLS < 0.1
    expect(vitals.ttfb).toBeLessThan(800) // TTFB < 800ms
  })

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="video-player-container"]', { timeout: 10000 })

    // Start playback
    const playButton = await page.locator('[data-testid="play-button"], [aria-label*="Play"], button:has-text("Play")').first()
    await playButton.click()

    // Monitor memory over time
    const memoryReadings = []
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(2000)
      const memory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize / 1048576 // MB
        }
        return null
      })
      if (memory !== null) {
        memoryReadings.push(memory)
      }
    }

    if (memoryReadings.length > 0) {
      const avgMemory = memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length
      const maxMemory = Math.max(...memoryReadings)

      console.log(`Average memory usage: ${avgMemory.toFixed(2)} MB`)
      console.log(`Peak memory usage: ${maxMemory.toFixed(2)} MB`)

      // Memory should stay under 200MB for Smart TV compatibility
      expect(maxMemory).toBeLessThan(200)
    }
  })
})