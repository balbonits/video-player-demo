/**
 * Smart TV D-pad Navigation Tests
 * Sam (QA) - Comprehensive testing for TV remote control navigation
 *
 * FOX Requirement: Web video players optimized for Smart TV D-pad navigation
 * Performance Targets: <150ms input latency, proper focus management
 */

import { test, expect, Page } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

// Smart TV specific key mappings
const SMART_TV_KEYS = {
  DPAD_UP: 'ArrowUp',
  DPAD_DOWN: 'ArrowDown',
  DPAD_LEFT: 'ArrowLeft',
  DPAD_RIGHT: 'ArrowRight',
  DPAD_CENTER: 'Enter',
  BACK: 'Escape',
  HOME: 'F1',
  MENU: 'F2',
  PLAY_PAUSE: 'Space',
  VOLUME_UP: 'VolumeUp',
  VOLUME_DOWN: 'VolumeDown',
  MUTE: 'VolumeMute'
} as const

// Performance thresholds for Smart TV navigation
const PERFORMANCE_THRESHOLDS = {
  INPUT_LATENCY_MS: 150,
  FOCUS_TRANSITION_MS: 100,
  VIDEO_START_MS: 3000,
  MEMORY_LIMIT_MB: 100,
  CPU_USAGE_PERCENT: 30
} as const

class SmartTVNavigationHelper {
  constructor(private page: Page) {}

  /**
   * Simulate Smart TV D-pad navigation with latency measurement
   */
  async navigateWithDPad(direction: keyof typeof SMART_TV_KEYS, expectFocusChange = true) {
    const startTime = Date.now()

    // Get currently focused element
    const beforeFocus = await this.page.evaluate(() => document.activeElement?.tagName)

    // Send D-pad key
    await this.page.keyboard.press(SMART_TV_KEYS[direction])

    // Wait for focus change if expected
    if (expectFocusChange) {
      await this.page.waitForFunction(
        (prevTag) => document.activeElement?.tagName !== prevTag,
        beforeFocus,
        { timeout: PERFORMANCE_THRESHOLDS.INPUT_LATENCY_MS }
      )
    }

    const latency = Date.now() - startTime
    expect(latency).toBeLessThan(PERFORMANCE_THRESHOLDS.INPUT_LATENCY_MS)

    return latency
  }

  /**
   * Get all focusable elements in DOM order
   */
  async getFocusableElements() {
    return await this.page.evaluate(() => {
      const focusableSelectors = [
        'button:not([disabled]):not([tabindex="-1"])',
        'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        'a[href]:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]:not([tabindex="-1"])',
        'video:not([tabindex="-1"])',
        'audio:not([tabindex="-1"])'
      ]

      const elements = Array.from(document.querySelectorAll(focusableSelectors.join(', ')))
      return elements.map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        'aria-label': el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        tabIndex: el.tabIndex,
        boundingBox: el.getBoundingClientRect()
      }))
    })
  }

  /**
   * Test spatial navigation logic
   */
  async testSpatialNavigation() {
    const focusableElements = await this.getFocusableElements()

    // Navigate through all focusable elements
    for (let i = 0; i < focusableElements.length; i++) {
      const latency = await this.navigateWithDPad('DPAD_RIGHT', i < focusableElements.length - 1)

      // Verify focus indicator is visible
      const focusedElement = await this.page.evaluate(() => {
        const el = document.activeElement
        const styles = window.getComputedStyle(el as Element)
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          backgroundColor: styles.backgroundColor,
          border: styles.border
        }
      })

      // Assert that focus is visually indicated
      expect(
        focusedElement.outline !== 'none' ||
        focusedElement.boxShadow !== 'none' ||
        focusedElement.border.includes('rgb')
      ).toBeTruthy()
    }
  }

  /**
   * Measure memory usage for Smart TV constraints
   */
  async measureMemoryUsage() {
    const memoryInfo = await this.page.evaluate(() => {
      // @ts-ignore - performance.memory is available in Chrome
      return (window as any).performance.memory ? {
        usedJSHeapSize: (window as any).performance.memory.usedJSHeapSize,
        totalJSHeapSize: (window as any).performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: (window as any).performance.memory.jsHeapSizeLimit
      } : null
    })

    if (memoryInfo) {
      const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024
      expect(usedMB).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT_MB)
      return usedMB
    }

    return 0
  }
}

test.describe('Smart TV D-pad Navigation', () => {
  let helper: SmartTVNavigationHelper

  test.beforeEach(async ({ page }) => {
    helper = new SmartTVNavigationHelper(page)

    // Set Smart TV viewport and user agent
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (SmartTV; Tizen 4.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.146 TV Safari/537.36'
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Inject accessibility testing
    await injectAxe(page)
  })

  test('should support full keyboard navigation through video player', async ({ page }) => {
    // Navigate to video player section
    await page.getByTestId('video-player-section').waitFor()

    // Test spatial navigation through all controls
    await helper.testSpatialNavigation()
  })

  test('should handle video player controls with D-pad', async ({ page }) => {
    const video = page.getByTestId('video-element')
    await video.waitFor()

    // Navigate to play button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Assuming play button is second focusable element

    const playButton = page.getByTestId('play-pause-button')
    await expect(playButton).toBeFocused()

    // Test play/pause with Enter key (D-pad center)
    const startTime = Date.now()
    await helper.navigateWithDPad('DPAD_CENTER', false)

    // Verify video starts playing within performance threshold
    await expect(video).toHaveAttribute('data-playing', 'true', {
      timeout: PERFORMANCE_THRESHOLDS.VIDEO_START_MS
    })

    const videoStartLatency = Date.now() - startTime
    expect(videoStartLatency).toBeLessThan(PERFORMANCE_THRESHOLDS.VIDEO_START_MS)
  })

  test('should navigate volume controls with D-pad', async ({ page }) => {
    // Navigate to volume controls
    await page.getByTestId('volume-controls').waitFor()

    // Test volume up/down navigation
    const volumeSlider = page.getByTestId('volume-slider')
    await volumeSlider.focus()

    // Test volume increase
    await helper.navigateWithDPad('DPAD_UP', false)
    const volumeAfterIncrease = await page.evaluate(() => {
      const video = document.querySelector('[data-testid="video-element"]') as HTMLVideoElement
      return video?.volume
    })

    // Test volume decrease
    await helper.navigateWithDPad('DPAD_DOWN', false)
    const volumeAfterDecrease = await page.evaluate(() => {
      const video = document.querySelector('[data-testid="video-element"]') as HTMLVideoElement
      return video?.volume
    })

    expect(volumeAfterDecrease).toBeLessThan(volumeAfterIncrease!)
  })

  test('should handle quality selection with D-pad navigation', async ({ page }) => {
    // Navigate to quality settings
    const qualityButton = page.getByTestId('quality-button')
    await qualityButton.waitFor()
    await qualityButton.focus()

    // Open quality menu
    await helper.navigateWithDPad('DPAD_CENTER', false)

    // Verify quality menu is open
    const qualityMenu = page.getByTestId('quality-menu')
    await expect(qualityMenu).toBeVisible()

    // Navigate through quality options
    const qualityOptions = await page.getByTestId('quality-option').all()

    for (let i = 0; i < qualityOptions.length; i++) {
      if (i > 0) {
        await helper.navigateWithDPad('DPAD_DOWN', true)
      }

      // Verify current option is focused
      const focusedOption = qualityOptions[i]
      await expect(focusedOption).toBeFocused()
    }

    // Select a quality option
    await helper.navigateWithDPad('DPAD_CENTER', false)

    // Verify menu closes and quality changes
    await expect(qualityMenu).toBeHidden()
  })

  test('should maintain focus visibility with high contrast', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })

    // Navigate through all focusable elements
    const focusableElements = await helper.getFocusableElements()

    for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
      await helper.navigateWithDPad('DPAD_RIGHT', i < focusableElements.length - 1)

      // Check focus visibility with high contrast
      const focusStyles = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        }
      })

      // Assert focus is visible in high contrast
      expect(
        focusStyles.outline !== 'none' ||
        focusStyles.boxShadow !== 'none'
      ).toBeTruthy()
    }
  })

  test('should handle accessibility with screen reader compatibility', async ({ page }) => {
    // Test ARIA labels and roles for D-pad navigation
    const videoPlayer = page.getByTestId('video-player')
    await videoPlayer.waitFor()

    // Verify all interactive elements have proper ARIA attributes
    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, input, [role="button"], [role="slider"]')
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
        title: el.getAttribute('title')
      }))
    })

    // Every interactive element should have a label
    interactiveElements.forEach(element => {
      expect(
        element.ariaLabel ||
        element.ariaLabelledBy ||
        element.title
      ).toBeTruthy()
    })

    // Run accessibility check
    await checkA11y(page, null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    })
  })

  test('should meet Smart TV performance constraints', async ({ page }) => {
    // Measure initial memory usage
    const initialMemory = await helper.measureMemoryUsage()

    // Perform intensive navigation sequence
    for (let i = 0; i < 50; i++) {
      await helper.navigateWithDPad('DPAD_RIGHT', false)
      await page.waitForTimeout(10) // Minimal delay
    }

    // Measure memory after navigation
    const finalMemory = await helper.measureMemoryUsage()

    // Memory should not increase significantly
    expect(finalMemory - initialMemory).toBeLessThan(10) // 10MB tolerance

    // Test CPU performance (simulated through timing)
    const startTime = Date.now()
    const iterations = 20

    for (let i = 0; i < iterations; i++) {
      await helper.navigateWithDPad('DPAD_DOWN', false)
      await helper.navigateWithDPad('DPAD_UP', false)
    }

    const totalTime = Date.now() - startTime
    const averageIterationTime = totalTime / iterations

    // Each navigation pair should complete quickly
    expect(averageIterationTime).toBeLessThan(100) // 100ms per iteration
  })

  test('should support escape/back navigation', async ({ page }) => {
    // Open a modal or menu
    const settingsButton = page.getByTestId('settings-button')
    await settingsButton.waitFor()
    await settingsButton.focus()
    await helper.navigateWithDPad('DPAD_CENTER', false)

    // Verify settings panel is open
    const settingsPanel = page.getByTestId('settings-panel')
    await expect(settingsPanel).toBeVisible()

    // Use back/escape key to close
    await helper.navigateWithDPad('BACK', false)

    // Verify panel closes and focus returns to settings button
    await expect(settingsPanel).toBeHidden()
    await expect(settingsButton).toBeFocused()
  })

  test('should handle video seeking with arrow keys', async ({ page }) => {
    const video = page.getByTestId('video-element')
    await video.waitFor()

    // Start video playback
    const playButton = page.getByTestId('play-pause-button')
    await playButton.focus()
    await helper.navigateWithDPad('DPAD_CENTER', false)

    // Wait for video to start
    await expect(video).toHaveAttribute('data-playing', 'true')

    // Test seeking with left/right arrows
    const initialTime = await page.evaluate(() => {
      const video = document.querySelector('[data-testid="video-element"]') as HTMLVideoElement
      return video.currentTime
    })

    // Seek forward
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    const timeAfterSeekForward = await page.evaluate(() => {
      const video = document.querySelector('[data-testid="video-element"]') as HTMLVideoElement
      return video.currentTime
    })

    expect(timeAfterSeekForward).toBeGreaterThan(initialTime)

    // Seek backward
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(100)

    const timeAfterSeekBackward = await page.evaluate(() => {
      const video = document.querySelector('[data-testid="video-element"]') as HTMLVideoElement
      return video.currentTime
    })

    expect(timeAfterSeekBackward).toBeLessThan(timeAfterSeekForward)
  })
})

test.describe('Smart TV Platform Simulation', () => {
  test('should work on Roku platform simulation', async ({ page }) => {
    // Set Roku-specific user agent and constraints
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Roku/DVP-9.10 (9.1.0.4111) SmartTV/9.10'
    })

    await page.goto('/')

    // Test basic functionality on Roku constraints
    const helper = new SmartTVNavigationHelper(page)
    await helper.measureMemoryUsage()

    // Test video playback
    const video = page.getByTestId('video-element')
    await video.waitFor()

    const playButton = page.getByTestId('play-pause-button')
    await playButton.click()

    await expect(video).toHaveAttribute('data-playing', 'true', { timeout: 5000 })
  })

  test('should work on Samsung Tizen simulation', async ({ page }) => {
    // Set Tizen-specific user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (SmartTV; Tizen 4.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.146 TV Safari/537.36'
    })

    await page.goto('/')

    // Test D-pad navigation on Tizen
    const helper = new SmartTVNavigationHelper(page)
    await helper.testSpatialNavigation()
  })

  test('should work on Vizio SmartCast simulation', async ({ page }) => {
    // Set Vizio-specific user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Linux; SmartCast) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    })

    await page.goto('/')

    // Test memory constraints specific to Vizio
    const helper = new SmartTVNavigationHelper(page)
    const memoryUsage = await helper.measureMemoryUsage()

    // Vizio has stricter memory constraints
    expect(memoryUsage).toBeLessThan(80) // 80MB limit for Vizio
  })
})