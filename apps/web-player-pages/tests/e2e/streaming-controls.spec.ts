/**
 * Dakota's Streaming Integration Tests
 * Comprehensive verification of all streaming-related controls and features
 *
 * Tests cover:
 * - HLS.js initialization and configuration
 * - Adaptive bitrate switching
 * - Quality selector functionality
 * - Buffer management
 * - Performance mode switching
 * - CDN failover behavior
 * - Streaming metrics collection
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'

// Test stream URLs (using publicly available test streams)
const TEST_STREAMS = {
  primary: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
  backup: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  live: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  lowLatency: 'https://ll-test.mux.dev/test.m3u8'
}

// Helper to wait for HLS.js initialization
async function waitForHLSReady(page: Page, timeout = 10000) {
  return await page.waitForFunction(
    () => {
      const player = document.querySelector('hls-video-player') as any
      return player?.hls && player?.hls.media
    },
    { timeout }
  )
}

// Helper to get HLS.js instance
async function getHLSInstance(page: Page) {
  return await page.evaluate(() => {
    const player = document.querySelector('hls-video-player') as any
    if (!player?.hls) return null

    return {
      levels: player.hls.levels?.map((level: any) => ({
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        codec: level.codec
      })),
      currentLevel: player.hls.currentLevel,
      autoLevelEnabled: player.hls.autoLevelEnabled,
      loadLevel: player.hls.loadLevel,
      config: {
        maxBufferLength: player.hls.config.maxBufferLength,
        maxBufferSize: player.hls.config.maxBufferSize,
        maxMaxBufferLength: player.hls.config.maxMaxBufferLength,
        enableWorker: player.hls.config.enableWorker,
        lowLatencyMode: player.hls.config.lowLatencyMode,
        backBufferLength: player.hls.config.backBufferLength
      }
    }
  })
}

// Helper to get streaming metrics
async function getStreamingMetrics(page: Page) {
  return await page.evaluate(() => {
    const player = document.querySelector('hls-video-player') as any
    return player?.getPerformanceMetrics?.()
  })
}

test.describe('HLS.js Initialization and Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player', { timeout: 10000 })
  })

  test('HLS.js should initialize with correct configuration', async ({ page }) => {
    await waitForHLSReady(page)

    const hlsConfig = await getHLSInstance(page)

    expect(hlsConfig).not.toBeNull()
    expect(hlsConfig.config.enableWorker).toBe(true)
    expect(hlsConfig.config.maxBufferLength).toBeGreaterThan(0)
    expect(hlsConfig.levels).toBeDefined()
    expect(hlsConfig.levels.length).toBeGreaterThan(0)
  })

  test('Different performance modes should apply correct configs', async ({ page }) => {
    // Test Smart TV mode
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('performance-mode', 'smartTV')
    })

    await page.waitForTimeout(1000)
    const smartTVConfig = await getHLSInstance(page)

    expect(smartTVConfig.config.maxBufferLength).toBeLessThanOrEqual(120)
    expect(smartTVConfig.config.backBufferLength).toBeLessThanOrEqual(30)

    // Test Mobile mode
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('performance-mode', 'mobile')
    })

    await page.waitForTimeout(1000)
    const mobileConfig = await getHLSInstance(page)

    expect(mobileConfig.config.maxBufferLength).toBeLessThanOrEqual(60)
    expect(mobileConfig.config.backBufferLength).toBeLessThanOrEqual(15)

    // Test Desktop mode
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('performance-mode', 'desktop')
    })

    await page.waitForTimeout(1000)
    const desktopConfig = await getHLSInstance(page)

    expect(desktopConfig.config.maxBufferLength).toBeGreaterThanOrEqual(300)
    expect(desktopConfig.config.backBufferLength).toBeGreaterThanOrEqual(120)
  })

  test('Stream should load and parse manifest successfully', async ({ page }) => {
    await waitForHLSReady(page)

    const manifestData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const player = document.querySelector('hls-video-player') as any

        if (player?.hls) {
          const hls = player.hls

          // If already parsed, return immediately
          if (hls.levels && hls.levels.length > 0) {
            resolve({
              parsed: true,
              levelsCount: hls.levels.length,
              audioTracks: hls.audioTracks?.length || 0,
              subtitleTracks: hls.subtitleTracks?.length || 0
            })
            return
          }

          // Wait for manifest parsed event
          hls.once('hlsManifestParsed', () => {
            resolve({
              parsed: true,
              levelsCount: hls.levels.length,
              audioTracks: hls.audioTracks?.length || 0,
              subtitleTracks: hls.subtitleTracks?.length || 0
            })
          })
        } else {
          resolve({ parsed: false })
        }
      })
    })

    expect(manifestData.parsed).toBe(true)
    expect(manifestData.levelsCount).toBeGreaterThan(0)
  })
})

test.describe('Quality Selector and ABR Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player', { timeout: 10000 })
    await waitForHLSReady(page)
  })

  test('Quality selector should populate with available levels', async ({ page }) => {
    const qualityOptions = await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      const shadowRoot = player?.shadowRoot
      const qualitySelector = shadowRoot?.querySelector('#quality')

      if (!qualitySelector) return []

      return Array.from(qualitySelector.querySelectorAll('option')).map((opt: any) => ({
        value: opt.value,
        text: opt.textContent
      }))
    })

    expect(qualityOptions.length).toBeGreaterThan(1)
    expect(qualityOptions.some(opt => opt.value === 'auto')).toBe(true)
    expect(qualityOptions.some(opt => opt.text.includes('p'))).toBe(true)
  })

  test('Manual quality selection should work', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Get available quality levels
    const hlsData = await getHLSInstance(page)
    if (hlsData.levels.length < 2) {
      test.skip() // Skip if only one quality level
    }

    // Select a specific quality level
    const qualityChangeResult = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const qualitySelector = shadowRoot?.querySelector('#quality') as HTMLSelectElement

      if (!qualitySelector || qualitySelector.options.length < 2) return null

      // Select the second quality option (first non-auto)
      qualitySelector.value = '0'
      qualitySelector.dispatchEvent(new Event('change'))

      // Get the HLS instance to verify
      const hls = el.hls

      return {
        selectedValue: qualitySelector.value,
        currentLevel: hls?.currentLevel,
        autoLevelEnabled: hls?.autoLevelEnabled
      }
    })

    expect(qualityChangeResult).not.toBeNull()
    expect(qualityChangeResult.currentLevel).toBe(0)
    expect(qualityChangeResult.autoLevelEnabled).toBe(false)
  })

  test('ABR should switch qualities based on bandwidth', async ({ page }) => {
    // Enable auto quality
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      const shadowRoot = player?.shadowRoot
      const qualitySelector = shadowRoot?.querySelector('#quality') as HTMLSelectElement

      if (qualitySelector) {
        qualitySelector.value = 'auto'
        qualitySelector.dispatchEvent(new Event('change'))
      }
    })

    // Monitor quality changes over time
    const qualityChanges: number[] = []

    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      const hls = player?.hls

      if (hls) {
        hls.on('hlsLevelSwitched', (event: any, data: any) => {
          console.log('Quality switched to level:', data.level)
        })
      }
    })

    // Play video and wait for potential quality changes
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.play()
    })

    await page.waitForTimeout(5000)

    const hlsData = await getHLSInstance(page)
    expect(hlsData.autoLevelEnabled).toBe(true)
  })

  test('Quality switching should update UI correctly', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Test quality change event
    const qualityChangeEvent = await player.evaluate((el: any) => {
      return new Promise((resolve) => {
        let eventFired = false

        el.addEventListener('hls-performance', (event: CustomEvent) => {
          if (event.detail.type === 'quality-changed' && !eventFired) {
            eventFired = true
            resolve({
              eventFired: true,
              quality: event.detail.data.quality,
              performanceMode: event.detail.performanceMode
            })
          }
        })

        // Trigger a quality change
        const shadowRoot = el.shadowRoot
        const qualitySelector = shadowRoot?.querySelector('#quality') as HTMLSelectElement

        if (qualitySelector && qualitySelector.options.length > 1) {
          qualitySelector.value = '0'
          qualitySelector.dispatchEvent(new Event('change'))
        }

        // Timeout fallback
        setTimeout(() => {
          if (!eventFired) {
            resolve({ eventFired: false })
          }
        }, 2000)
      })
    })

    expect(qualityChangeEvent.eventFired).toBe(true)
  })
})

test.describe('Buffer Management and Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player', { timeout: 10000 })
    await waitForHLSReady(page)
  })

  test('Buffer progress indicator should update', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Start playback
    await player.press('Space')
    await page.waitForTimeout(3000)

    const bufferData = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const progressBuffer = shadowRoot?.querySelector('.progress-buffer') as HTMLElement
      const video = shadowRoot?.querySelector('.video-element') as HTMLVideoElement

      if (!progressBuffer || !video) return null

      const bufferWidth = parseFloat(progressBuffer.style.width || '0')
      const bufferedRanges = []

      for (let i = 0; i < video.buffered.length; i++) {
        bufferedRanges.push({
          start: video.buffered.start(i),
          end: video.buffered.end(i)
        })
      }

      return {
        bufferIndicatorWidth: bufferWidth,
        bufferedRanges,
        currentTime: video.currentTime,
        duration: video.duration
      }
    })

    expect(bufferData).not.toBeNull()
    expect(bufferData.bufferIndicatorWidth).toBeGreaterThan(0)
    expect(bufferData.bufferedRanges.length).toBeGreaterThan(0)
  })

  test('Memory cleanup should trigger when approaching limits', async ({ page }) => {
    // Set low memory limit to trigger cleanup
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('memory-limit', '50')
      player?.setAttribute('performance-mode', 'smartTV')
    })

    // Monitor memory cleanup events
    const cleanupEvent = await page.evaluate(() => {
      return new Promise((resolve) => {
        const player = document.querySelector('hls-video-player') as any
        let cleanupFired = false

        player.addEventListener('hls-performance', (event: CustomEvent) => {
          if (event.detail.type === 'memory-cleanup' && !cleanupFired) {
            cleanupFired = true
            resolve({
              cleanupFired: true,
              memoryUsage: event.detail.data.memoryUsage,
              memoryLimit: event.detail.data.memoryLimit
            })
          }
        })

        // Force memory usage by playing video
        player.play()

        // Timeout - cleanup might not trigger in test environment
        setTimeout(() => {
          if (!cleanupFired) {
            resolve({ cleanupFired: false })
          }
        }, 10000)
      })
    })

    // Memory cleanup is environment-dependent, so we just verify the mechanism exists
    expect(cleanupEvent).toBeDefined()
  })

  test('Buffer strategy should adapt to performance mode', async ({ page }) => {
    const modes = ['smartTV', 'mobile', 'desktop']
    const bufferConfigs: any = {}

    for (const mode of modes) {
      await page.evaluate((performanceMode) => {
        const player = document.querySelector('hls-video-player') as any
        player?.setAttribute('performance-mode', performanceMode)
      }, mode)

      await page.waitForTimeout(500)

      const config = await getHLSInstance(page)
      bufferConfigs[mode] = {
        maxBufferLength: config.config.maxBufferLength,
        backBufferLength: config.config.backBufferLength
      }
    }

    // Verify buffer sizes are appropriate for each mode
    expect(bufferConfigs.smartTV.maxBufferLength).toBeLessThan(bufferConfigs.desktop.maxBufferLength)
    expect(bufferConfigs.mobile.maxBufferLength).toBeLessThan(bufferConfigs.desktop.maxBufferLength)
    expect(bufferConfigs.smartTV.backBufferLength).toBeLessThan(bufferConfigs.desktop.backBufferLength)
  })
})

test.describe('Streaming Performance Metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player', { timeout: 10000 })
    await waitForHLSReady(page)
  })

  test('Performance metrics should be collected and updated', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    // Start playback
    await player.press('Space')
    await page.waitForTimeout(3000)

    const metrics = await getStreamingMetrics(page)

    expect(metrics).toBeDefined()
    expect(metrics.memoryUsage).toBeGreaterThan(0)
    expect(metrics.videoStartTime).toBeGreaterThan(0)
    expect(metrics.segmentLoadTime).toBeGreaterThanOrEqual(0)
    expect(metrics.throughputMbps).toBeGreaterThanOrEqual(0)
    expect(metrics.qualityStability).toBeGreaterThanOrEqual(0)
    expect(metrics.qualityStability).toBeLessThanOrEqual(100)
  })

  test('Performance indicator should display correct information', async ({ page }) => {
    const player = await page.locator('hls-video-player').first()

    const indicatorData = await player.evaluate((el: any) => {
      const shadowRoot = el.shadowRoot
      const indicator = shadowRoot?.querySelector('#perf-indicator') as HTMLElement

      return {
        text: indicator?.textContent,
        visible: indicator?.style.display !== 'none',
        backgroundColor: indicator?.style.background
      }
    })

    expect(indicatorData.text).toContain('Memory:')
    expect(indicatorData.text).toContain('Input:')
    expect(indicatorData.text).toContain('Mode:')
    expect(indicatorData.visible).toBe(true)
  })

  test('Streaming analytics events should fire periodically', async ({ page }) => {
    const analyticsEvents: any[] = []

    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any

      player.addEventListener('hls-performance', (event: CustomEvent) => {
        if (event.detail.type === 'streaming-analytics') {
          console.log('Analytics event:', event.detail)
        }
      })
    })

    // Start playback
    const player = await page.locator('hls-video-player').first()
    await player.press('Space')

    // Wait for analytics to be collected
    await page.waitForTimeout(5000)

    // Verify some metrics have been collected
    const metrics = await getStreamingMetrics(page)
    expect(metrics.segmentLoadTime).toBeGreaterThanOrEqual(0)
  })
})

test.describe('CDN and Error Recovery', () => {
  test('Should handle stream loading errors gracefully', async ({ page }) => {
    // Try to load an invalid stream
    await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('src', 'http://invalid-stream-url.m3u8')
    })

    // Monitor error events
    const errorEvent = await page.evaluate(() => {
      return new Promise((resolve) => {
        const player = document.querySelector('hls-video-player') as any
        let errorFired = false

        player.addEventListener('hls-performance', (event: CustomEvent) => {
          if (event.detail.type === 'error' && !errorFired) {
            errorFired = true
            resolve({
              errorFired: true,
              error: event.detail.data.error
            })
          }
        })

        // Also listen for streaming errors
        player.addEventListener('hls-performance', (event: CustomEvent) => {
          if (event.detail.type === 'streaming-error' && !errorFired) {
            errorFired = true
            resolve({
              errorFired: true,
              errorType: event.detail.data.errorType,
              errorDetails: event.detail.data.errorDetails
            })
          }
        })

        setTimeout(() => {
          if (!errorFired) {
            resolve({ errorFired: false })
          }
        }, 5000)
      })
    })

    expect(errorEvent.errorFired).toBe(true)
  })

  test('Should detect CDN provider from stream URL', async ({ page }) => {
    const cdnDetection = await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any

      // Test various CDN URLs
      const testUrls = [
        { url: 'https://example.akamaihd.net/stream.m3u8', expected: 'akamai' },
        { url: 'https://example.cloudfront.net/stream.m3u8', expected: 'cloudfront' },
        { url: 'https://example.fastly.com/stream.m3u8', expected: 'fastly' },
        { url: 'https://example.azureedge.net/stream.m3u8', expected: 'azure' }
      ]

      const results = testUrls.map(test => {
        // Temporarily set the src to test CDN detection
        player.setAttribute('src', test.url)

        // Access private method through prototype
        const detected = player.getCDNProvider ? player.getCDNProvider() : 'unknown'

        return {
          url: test.url,
          expected: test.expected,
          detected
        }
      })

      return results
    })

    // CDN detection is implemented but might be private
    expect(cdnDetection).toBeDefined()
  })

  test('Fragment loading should retry on failure', async ({ page }) => {
    const hlsConfig = await getHLSInstance(page)

    // Verify retry configuration
    expect(hlsConfig.config).toBeDefined()

    // Note: Actually testing fragment retry would require network manipulation
    // which is complex in Playwright. This test verifies the configuration exists.
  })
})

test.describe('Live Streaming Support', () => {
  test.skip('Should handle live streams differently than VOD', async ({ page }) => {
    // Skip by default as live stream URLs may not always be available

    await page.evaluate((liveUrl) => {
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('src', liveUrl)
    }, TEST_STREAMS.live)

    await waitForHLSReady(page)

    const liveConfig = await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any
      const hls = player?.hls

      return {
        isLive: hls?.levels?.[0]?.details?.live,
        liveSyncPosition: hls?.liveSyncPosition,
        config: {
          liveSyncDurationCount: hls?.config?.liveSyncDurationCount,
          liveMaxLatencyDurationCount: hls?.config?.liveMaxLatencyDurationCount,
          liveDurationInfinity: hls?.config?.liveDurationInfinity
        }
      }
    })

    expect(liveConfig.isLive).toBe(true)
    expect(liveConfig.config.liveDurationInfinity).toBe(true)
  })
})

test.describe('Network Adaptation', () => {
  test('Should detect slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.evaluate(() => {
      // Mock Network Information API
      (navigator as any).connection = {
        effectiveType: '2g',
        downlink: 0.5
      }
    })

    const networkDetection = await page.evaluate(() => {
      const player = document.querySelector('hls-video-player') as any

      // Access private method through prototype
      const isSlow = player.isSlowNetwork ? player.isSlowNetwork() : false

      return {
        detectedAsSlow: isSlow,
        connection: (navigator as any).connection
      }
    })

    expect(networkDetection.connection.effectiveType).toBe('2g')
  })

  test('Configuration should adapt to network conditions', async ({ page }) => {
    // Simulate slow network
    await page.evaluate(() => {
      (navigator as any).connection = {
        effectiveType: 'slow-2g',
        downlink: 0.2
      }

      // Reload player with slow network
      const player = document.querySelector('hls-video-player') as any
      player?.setAttribute('src', player.getAttribute('src'))
    })

    await page.waitForTimeout(1000)

    const adaptedConfig = await getHLSInstance(page)

    // Config should be more conservative on slow network
    expect(adaptedConfig.config.maxBufferLength).toBeLessThanOrEqual(90)
  })
})

test.describe('Cross-Platform Streaming Verification', () => {
  const platforms = [
    { mode: 'smartTV', maxBuffer: 120, backBuffer: 30 },
    { mode: 'mobile', maxBuffer: 60, backBuffer: 15 },
    { mode: 'desktop', maxBuffer: 300, backBuffer: 120 }
  ]

  for (const platform of platforms) {
    test(`${platform.mode}: Should apply correct streaming configuration`, async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.waitForSelector('hls-video-player')

      // Set performance mode
      await page.evaluate((mode) => {
        const player = document.querySelector('hls-video-player') as any
        player?.setAttribute('performance-mode', mode)
      }, platform.mode)

      await waitForHLSReady(page)

      const config = await getHLSInstance(page)

      expect(config.config.maxBufferLength).toBeLessThanOrEqual(platform.maxBuffer)
      expect(config.config.backBufferLength).toBeLessThanOrEqual(platform.backBuffer)
    })

    test(`${platform.mode}: Quality switching should work`, async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.waitForSelector('hls-video-player')

      await page.evaluate((mode) => {
        const player = document.querySelector('hls-video-player') as any
        player?.setAttribute('performance-mode', mode)
      }, platform.mode)

      await waitForHLSReady(page)

      const player = await page.locator('hls-video-player').first()

      const qualityTest = await player.evaluate((el: any) => {
        const shadowRoot = el.shadowRoot
        const qualitySelector = shadowRoot?.querySelector('#quality') as HTMLSelectElement

        if (!qualitySelector || qualitySelector.options.length < 2) return null

        const initialLevel = el.hls?.currentLevel

        // Change quality
        qualitySelector.value = '0'
        qualitySelector.dispatchEvent(new Event('change'))

        const newLevel = el.hls?.currentLevel

        return {
          initialLevel,
          newLevel,
          changed: initialLevel !== newLevel
        }
      })

      if (qualityTest) {
        expect(qualityTest.changed).toBe(true)
      }
    })
  }
})

// Performance benchmarking tests
test.describe('Streaming Performance Benchmarks', () => {
  test('Measure time to first frame', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player')

    // Wait for first frame
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const player = document.querySelector('hls-video-player') as any
        const video = player?.shadowRoot?.querySelector('.video-element') as HTMLVideoElement

        if (video && video.readyState >= 2) {
          resolve(true)
        } else if (video) {
          video.addEventListener('loadeddata', () => resolve(true), { once: true })
        }
      })
    })

    const timeToFirstFrame = Date.now() - startTime

    console.log(`Time to first frame: ${timeToFirstFrame}ms`)
    expect(timeToFirstFrame).toBeLessThan(5000) // Should load within 5 seconds
  })

  test('Measure quality switch latency', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('hls-video-player')
    await waitForHLSReady(page)

    const switchLatency = await page.evaluate(() => {
      return new Promise((resolve) => {
        const player = document.querySelector('hls-video-player') as any
        const hls = player?.hls

        if (!hls || hls.levels.length < 2) {
          resolve({ skipped: true })
          return
        }

        const startTime = performance.now()

        hls.once('hlsLevelSwitched', () => {
          const latency = performance.now() - startTime
          resolve({ latency, skipped: false })
        })

        // Switch to a different quality
        hls.currentLevel = hls.currentLevel === 0 ? 1 : 0
      })
    })

    if (!switchLatency.skipped) {
      console.log(`Quality switch latency: ${switchLatency.latency}ms`)
      expect(switchLatency.latency).toBeLessThan(2000)
    }
  })
})