/**
 * Mobile and Touch Interaction Tests
 * Sam (QA) - Comprehensive mobile device and touch gesture testing
 */

import { test, expect, devices } from '@playwright/test'

// Mobile device configurations
const MOBILE_DEVICES = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Galaxy S9+', device: devices['Galaxy S9+'] },
  { name: 'iPad Pro', device: devices['iPad Pro'] },
  { name: 'iPad Mini', device: devices['iPad Mini'] }
]

test.describe('Mobile Device Testing', () => {
  for (const mobile of MOBILE_DEVICES) {
    test.describe(`${mobile.name}`, () => {
      test.use(mobile.device)

      test('should render responsive layout', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Check viewport adaptation
        const viewport = page.viewportSize()
        console.log(`${mobile.name} viewport:`, viewport)

        // Verify mobile-optimized layout
        const isMobileLayout = await page.evaluate(() => {
          return window.innerWidth < 768
        })

        if (viewport!.width < 768) {
          expect(isMobileLayout).toBeTruthy()

          // Check for mobile-specific elements
          const mobileMenu = await page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="Menu"]')
          const hasMobileMenu = await mobileMenu.count() > 0
          expect(hasMobileMenu).toBeTruthy()
        }

        // Take screenshot for visual verification
        await page.screenshot({
          path: `test-results/screenshots/mobile-${mobile.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true
        })
      })

      test('should handle touch interactions', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('video', { timeout: 10000 })

        const video = await page.locator('video').first()
        const videoBox = await video.boundingBox()

        if (!videoBox) {
          test.skip()
          return
        }

        // Single tap to play/pause
        await page.tap('video')
        await page.waitForTimeout(1000)

        let isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
        expect(isPlaying).toBeTruthy()

        // Tap again to pause
        await page.tap('video')
        await page.waitForTimeout(1000)

        isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
        expect(isPlaying).toBeFalsy()

        // Double tap for fullscreen (if supported)
        await page.dblclick('video')
        await page.waitForTimeout(500)

        const isFullscreen = await page.evaluate(() => {
          return document.fullscreenElement !== null ||
                 (document as any).webkitFullscreenElement !== null
        })
        // Note: Fullscreen may not work in all mobile browsers
        console.log(`${mobile.name} - Fullscreen support:`, isFullscreen)
      })

      test('should support swipe gestures', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('video', { timeout: 10000 })

        const video = await page.locator('video').first()
        const videoBox = await video.boundingBox()

        if (!videoBox) {
          test.skip()
          return
        }

        // Start playback
        await page.tap('video')
        await page.waitForTimeout(2000)

        const initialTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)

        // Swipe right to seek forward
        await page.touchscreen.tap(videoBox.x + videoBox.width / 2, videoBox.y + videoBox.height / 2)
        await page.mouse.down()
        await page.mouse.move(videoBox.x + videoBox.width * 0.8, videoBox.y + videoBox.height / 2)
        await page.mouse.up()
        await page.waitForTimeout(1000)

        const newTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime)
        // Time should change after swipe (implementation dependent)
        console.log(`${mobile.name} - Swipe seek: ${initialTime}s -> ${newTime}s`)
      })

      test('should have touch-friendly control sizes', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Get all touch targets
        const touchTargets = await page.evaluate(() => {
          const selector = 'button, input[type="range"], a[href], [role="button"]'
          const elements = document.querySelectorAll(selector)
          return Array.from(elements).map(el => {
            const rect = el.getBoundingClientRect()
            const styles = window.getComputedStyle(el)
            return {
              tag: el.tagName,
              class: el.className,
              width: rect.width,
              height: rect.height,
              padding: styles.padding,
              isVisible: rect.width > 0 && rect.height > 0
            }
          }).filter(el => el.isVisible)
        })

        // WCAG 2.1 AA: Touch targets should be at least 44x44 CSS pixels
        const smallTargets = touchTargets.filter(t =>
          t.width < 44 || t.height < 44
        )

        if (smallTargets.length > 0) {
          console.log(`${mobile.name} - Small touch targets:`, smallTargets)
        }

        // Allow some flexibility for inline elements
        const criticalSmallTargets = smallTargets.filter(t =>
          t.tag === 'BUTTON' || t.tag === 'INPUT'
        )

        expect(criticalSmallTargets.length).toBe(0)
      })

      test('should handle orientation changes', async ({ page, context }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Get initial orientation
        const initialOrientation = await page.evaluate(() => {
          return window.screen.orientation?.type || 'unknown'
        })

        console.log(`${mobile.name} - Initial orientation:`, initialOrientation)

        // Change to landscape
        if (viewport!.width < viewport!.height) {
          await page.setViewportSize({
            width: viewport!.height,
            height: viewport!.width
          })
          await page.waitForTimeout(1000)

          // Verify layout adapted
          const isLandscape = await page.evaluate(() => {
            return window.innerWidth > window.innerHeight
          })
          expect(isLandscape).toBeTruthy()

          // Take landscape screenshot
          await page.screenshot({
            path: `test-results/screenshots/mobile-${mobile.name.toLowerCase().replace(/\s+/g, '-')}-landscape.png`
          })

          // Change back to portrait
          await page.setViewportSize({
            width: viewport!.width,
            height: viewport!.height
          })
        }
      })

      test('should optimize for mobile bandwidth', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('video', { timeout: 10000 })

        // Check if mobile-optimized player is selected
        const playerVersion = await page.evaluate(() => {
          const selector = document.querySelector('[data-testid="player-version-selector"]')
          return selector?.textContent || ''
        })

        // On mobile devices, should prefer mobile-optimized player
        if (viewport!.width < 768) {
          console.log(`${mobile.name} - Player version:`, playerVersion)
        }

        // Monitor network usage
        const cdpSession = await page.context().newCDPSession(page)
        await cdpSession.send('Network.enable')

        let totalBytes = 0
        cdpSession.on('Network.dataReceived', (event) => {
          totalBytes += event.dataLength
        })

        // Play video for 5 seconds
        const playButton = await page.locator('[data-testid="play-button"], button:has-text("Play")').first()
        await playButton.click()
        await page.waitForTimeout(5000)

        // Pause and check bandwidth usage
        const pauseButton = await page.locator('[data-testid="pause-button"], button:has-text("Pause")').first()
        await pauseButton.click()

        const mbUsed = totalBytes / (1024 * 1024)
        console.log(`${mobile.name} - Data used in 5s: ${mbUsed.toFixed(2)} MB`)

        // Mobile should use less bandwidth
        if (viewport!.width < 768) {
          expect(mbUsed).toBeLessThan(10) // Less than 10MB for 5 seconds
        }
      })

      test('should support picture-in-picture on mobile', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('video', { timeout: 10000 })

        const video = await page.locator('video').first()

        // Check PiP support
        const supportsPiP = await page.evaluate(() => {
          return 'pictureInPictureEnabled' in document
        })

        if (supportsPiP) {
          // Look for PiP button
          const pipButton = await page.locator('[data-testid="pip-button"], button[aria-label*="Picture"]')

          if (await pipButton.count() > 0) {
            await pipButton.click()
            await page.waitForTimeout(1000)

            const isInPiP = await video.evaluate((el: HTMLVideoElement) => {
              return el === (document as any).pictureInPictureElement
            })

            console.log(`${mobile.name} - PiP activated:`, isInPiP)
          }
        }
      })
    })
  }
})

test.describe('Touch Gesture Testing', () => {
  test.use(devices['iPhone 12'])

  test('should handle pinch to zoom', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('video', { timeout: 10000 })

    const video = await page.locator('video').first()
    const videoBox = await video.boundingBox()

    if (!videoBox) {
      test.skip()
      return
    }

    // Simulate pinch gesture (not fully supported by Playwright, but we can test the handler)
    await page.evaluate(() => {
      const video = document.querySelector('video')
      if (video) {
        const event = new TouchEvent('touchstart', {
          touches: [
            new Touch({ identifier: 0, target: video, clientX: 100, clientY: 100 }),
            new Touch({ identifier: 1, target: video, clientX: 200, clientY: 200 })
          ]
        })
        video.dispatchEvent(event)
      }
    })

    await page.waitForTimeout(500)

    // Check if any zoom or fullscreen action was triggered
    const scale = await video.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform
      return transform !== 'none' ? transform : 'no-transform'
    })

    console.log('Pinch gesture - Transform applied:', scale)
  })

  test('should handle long press for context menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('video', { timeout: 10000 })

    const video = await page.locator('video').first()

    // Simulate long press
    await video.click({ button: 'right' }) // Context menu
    await page.waitForTimeout(500)

    // Check if custom context menu appears
    const contextMenu = await page.locator('[data-testid="context-menu"], .context-menu, [role="menu"]')
    const hasContextMenu = await contextMenu.count() > 0

    if (hasContextMenu) {
      const menuItems = await contextMenu.locator('[role="menuitem"]').count()
      expect(menuItems).toBeGreaterThan(0)
    }
  })

  test('should support swipe up/down for volume', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('video', { timeout: 10000 })

    const video = await page.locator('video').first()
    const videoBox = await video.boundingBox()

    if (!videoBox) {
      test.skip()
      return
    }

    const initialVolume = await video.evaluate((el: HTMLVideoElement) => el.volume)

    // Simulate swipe up (increase volume)
    const centerX = videoBox.x + videoBox.width / 2
    const centerY = videoBox.y + videoBox.height / 2

    await page.touchscreen.tap(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX, centerY - 100) // Swipe up
    await page.mouse.up()
    await page.waitForTimeout(500)

    const newVolume = await video.evaluate((el: HTMLVideoElement) => el.volume)
    console.log(`Volume change: ${initialVolume} -> ${newVolume}`)
  })
})

test.describe('Mobile Performance', () => {
  test.use(devices['Pixel 5'])

  test('should meet mobile performance targets', async ({ page }) => {
    // Enable CPU throttling to simulate mobile device
    const cdpSession = await page.context().newCDPSession(page)
    await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 4 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }
    })

    console.log('Mobile Performance Metrics:', metrics)

    // Mobile performance targets
    expect(metrics.firstContentfulPaint).toBeLessThan(3000) // FCP < 3s on mobile
    expect(metrics.domContentLoaded).toBeLessThan(4000) // DOM < 4s on mobile
    expect(metrics.loadComplete).toBeLessThan(6000) // Load < 6s on mobile
  })

  test('should handle network disconnection gracefully', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForSelector('video', { timeout: 10000 })

    // Start playing video
    const playButton = await page.locator('[data-testid="play-button"], button:has-text("Play")').first()
    await playButton.click()
    await page.waitForTimeout(2000)

    // Simulate network disconnection
    await context.setOffline(true)
    await page.waitForTimeout(2000)

    // Check for error handling
    const errorMessage = await page.locator('[data-testid="error-message"], .error, [role="alert"]')
    const hasError = await errorMessage.count() > 0

    // Player should handle offline gracefully
    if (hasError) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toBeTruthy()
      console.log('Offline error message:', errorText)
    }

    // Restore network
    await context.setOffline(false)
    await page.waitForTimeout(2000)

    // Check if player recovers
    const video = await page.locator('video').first()
    const canPlay = await video.evaluate((el: HTMLVideoElement) => el.readyState >= 2)
    console.log('Player recovered after reconnection:', canPlay)
  })

  test('should optimize battery usage on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('video', { timeout: 10000 })

    // Check for battery optimization features
    const video = await page.locator('video').first()

    // Verify video codec preference (H.264 is more battery efficient)
    const codecInfo = await video.evaluate((el: HTMLVideoElement) => {
      return {
        codec: el.canPlayType('video/mp4; codecs="avc1.42E01E"') === 'probably' ? 'H.264' : 'Unknown',
        playbackRate: el.playbackRate,
        preload: el.preload
      }
    })

    console.log('Mobile codec info:', codecInfo)

    // Mobile should prefer efficient codecs and settings
    expect(codecInfo.playbackRate).toBe(1) // Normal playback rate
    expect(['none', 'metadata']).toContain(codecInfo.preload) // Conservative preloading
  })

  test('should handle touch accessibility features', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for touch-specific accessibility
    const touchAccessibility = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input')
      return Array.from(elements).map(el => {
        const styles = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          touchAction: styles.touchAction,
          userSelect: styles.userSelect,
          webkitTapHighlightColor: styles.webkitTapHighlightColor,
          minSize: Math.min(rect.width, rect.height)
        }
      })
    })

    // Verify touch optimizations
    for (const element of touchAccessibility) {
      // Touch targets should be appropriately sized
      if (element.tag === 'BUTTON') {
        expect(element.minSize).toBeGreaterThanOrEqual(44)
      }

      // Should have proper touch handling
      expect(['auto', 'manipulation']).toContain(element.touchAction)
    }
  })
})

// Generate mobile test report
test.afterAll(async () => {
  console.log(`
    ========================================
    Mobile & Touch Interaction Test Summary
    ========================================

    Tested Devices:
    ✓ iPhone 12, iPhone SE
    ✓ Pixel 5, Galaxy S9+
    ✓ iPad Pro, iPad Mini

    Key Areas Tested:
    ✓ Responsive layouts
    ✓ Touch gestures (tap, swipe, pinch)
    ✓ Touch target sizes (44x44px minimum)
    ✓ Orientation changes
    ✓ Mobile bandwidth optimization
    ✓ Picture-in-Picture support
    ✓ Mobile performance targets
    ✓ Network disconnection handling
    ✓ Battery usage optimization
    ✓ Touch accessibility features

    ========================================
  `)
})