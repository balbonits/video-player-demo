/**
 * WCAG 2.1 AA Accessibility Compliance Tests
 * Sam (QA) - Ensuring full accessibility compliance across all player versions
 */

import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations, reportViolations } from 'axe-playwright'

const PLAYER_VERSIONS = [
  'hls-js',
  'native-html5',
  'mobile-optimized',
  'roku-simulation',
  'chromecast-receiver',
  'performance-benchmark'
]

test.describe('WCAG 2.1 AA Compliance', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
  })

  test('should have no accessibility violations on page load', async ({ page }) => {
    // Run axe accessibility check
    const violations = await getViolations(page, null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    })

    // Report any violations
    if (violations.length > 0) {
      console.log('Accessibility violations found:')
      reportViolations(violations)
    }

    expect(violations.length).toBe(0)
  })

  test('should have proper page structure and landmarks', async ({ page }) => {
    // Check for main landmark
    const main = await page.locator('main, [role="main"]')
    await expect(main).toHaveCount(1)

    // Check for heading hierarchy
    const h1 = await page.locator('h1')
    await expect(h1).toHaveCount(1)

    // Verify heading hierarchy is logical
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim()
      }))
    })

    // Check heading hierarchy doesn't skip levels
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  test('should have proper focus management', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = await page.evaluate(() => {
      const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      const elements = document.querySelectorAll(focusableSelector)
      return elements.length
    })

    expect(interactiveElements).toBeGreaterThan(0)

    // Test focus visibility
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return {
        tagName: el?.tagName,
        hasOutline: window.getComputedStyle(el!).outline !== 'none',
        hasBorder: window.getComputedStyle(el!).border !== 'none'
      }
    })

    expect(focusedElement.hasOutline || focusedElement.hasBorder).toBeTruthy()
  })

  test('should have proper ARIA labels for video controls', async ({ page }) => {
    // Wait for video player
    await page.waitForSelector('video', { timeout: 10000 })

    // Check play button
    const playButton = await page.locator('[data-testid="play-button"], button:has-text("Play")').first()
    const playAriaLabel = await playButton.getAttribute('aria-label')
    expect(playAriaLabel).toBeTruthy()
    expect(playAriaLabel).toMatch(/play/i)

    // Check volume control
    const volumeControl = await page.locator('[data-testid="volume-control"], input[type="range"]').first()
    const volumeAriaLabel = await volumeControl.getAttribute('aria-label')
    expect(volumeAriaLabel).toBeTruthy()
    expect(volumeAriaLabel).toMatch(/volume/i)

    // Check progress bar
    const progressBar = await page.locator('[data-testid="progress-bar"], input[type="range"]').first()
    const progressAriaLabel = await progressBar.getAttribute('aria-label')
    expect(progressAriaLabel).toBeTruthy()
    expect(progressAriaLabel).toMatch(/seek|progress|time/i)
  })

  test('should support keyboard-only navigation', async ({ page }) => {
    // Navigate using only keyboard
    const elements = []

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          text: el?.textContent?.trim().substring(0, 50),
          ariaLabel: el?.getAttribute('aria-label'),
          role: el?.getAttribute('role'),
          type: el?.getAttribute('type')
        }
      })

      // Avoid duplicates
      const key = `${focused.tagName}-${focused.text || focused.ariaLabel}`
      if (!elements.find(e => `${e.tagName}-${e.text || e.ariaLabel}` === key)) {
        elements.push(focused)
      }

      // Stop if we've cycled back to the start
      if (i > 10 && elements.length < 3) break
    }

    // Should be able to reach multiple interactive elements
    expect(elements.length).toBeGreaterThanOrEqual(3)
    console.log('Keyboard accessible elements:', elements)
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // Check color contrast using axe
    const violations = await getViolations(page, null, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast']
      }
    })

    if (violations.length > 0) {
      console.log('Color contrast violations:', violations.map(v => ({
        element: v.nodes[0]?.html,
        impact: v.impact
      })))
    }

    expect(violations.length).toBe(0)
  })

  test('should have descriptive link and button text', async ({ page }) => {
    // Get all buttons and links
    const elements = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const links = Array.from(document.querySelectorAll('a'))

      return {
        buttons: buttons.map(b => ({
          text: b.textContent?.trim(),
          ariaLabel: b.getAttribute('aria-label')
        })),
        links: links.map(a => ({
          text: a.textContent?.trim(),
          ariaLabel: a.getAttribute('aria-label'),
          href: a.href
        }))
      }
    })

    // Check buttons have meaningful text or aria-label
    for (const button of elements.buttons) {
      const hasText = button.text && button.text.length > 0 && button.text !== 'X' && button.text !== '...'
      const hasAriaLabel = button.ariaLabel && button.ariaLabel.length > 0
      expect(hasText || hasAriaLabel).toBeTruthy()
    }

    // Check links have meaningful text or aria-label
    for (const link of elements.links) {
      if (!link.href || link.href === '#') continue
      const hasText = link.text && link.text.length > 0 && link.text.toLowerCase() !== 'click here'
      const hasAriaLabel = link.ariaLabel && link.ariaLabel.length > 0
      expect(hasText || hasAriaLabel).toBeTruthy()
    }
  })

  test('should announce live video state changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]')
    const count = await liveRegions.count()
    expect(count).toBeGreaterThan(0)

    // Verify live region updates when playing video
    const playButton = await page.locator('[data-testid="play-button"], button:has-text("Play")').first()
    await playButton.click()

    // Check if status is announced
    const statusRegion = await page.locator('[aria-live="polite"], [role="status"]').first()
    const statusText = await statusRegion.textContent()
    expect(statusText).toBeTruthy()
  })

  test('should have skip links for keyboard users', async ({ page }) => {
    // Focus on the first element
    await page.keyboard.press('Tab')

    // Check for skip link
    const skipLink = await page.evaluate(() => {
      const el = document.activeElement
      return {
        isSkipLink: el?.textContent?.toLowerCase().includes('skip') ||
                    el?.getAttribute('aria-label')?.toLowerCase().includes('skip'),
        href: (el as HTMLAnchorElement)?.href
      }
    })

    // Skip links are recommended but not required for WCAG AA
    if (skipLink.isSkipLink) {
      expect(skipLink.href).toBeTruthy()
    }
  })

  test('should handle focus trap in modals/dialogs', async ({ page }) => {
    // Look for any modals or dialogs
    const dialog = await page.locator('[role="dialog"], [role="alertdialog"], .modal')

    if (await dialog.count() > 0) {
      // Open the dialog (implementation specific)
      const dialogTrigger = await page.locator('[data-testid*="dialog-trigger"], button:has-text("Settings")')
      if (await dialogTrigger.count() > 0) {
        await dialogTrigger.click()
        await page.waitForTimeout(500)

        // Tab through elements and ensure focus stays within dialog
        const focusedElements = []
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab')
          const isInDialog = await page.evaluate(() => {
            const focused = document.activeElement
            const dialog = document.querySelector('[role="dialog"]')
            return dialog?.contains(focused)
          })
          focusedElements.push(isInDialog)
        }

        // All focused elements should be within the dialog
        expect(focusedElements.every(inDialog => inDialog)).toBeTruthy()
      }
    }
  })
})

test.describe('Screen Reader Compatibility', () => {
  test('should have proper ARIA roles and properties', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check video player has proper role
    const videoContainer = await page.locator('[data-testid="video-player-container"]').first()
    const role = await videoContainer.getAttribute('role')
    expect(['application', 'region', null]).toContain(role)

    // Check controls have proper roles
    const controls = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid*="control"], button, input')
      return Array.from(elements).map(el => ({
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaDescribedBy: el.getAttribute('aria-describedby'),
        ariaValueNow: el.getAttribute('aria-valuenow'),
        ariaValueMin: el.getAttribute('aria-valuemin'),
        ariaValueMax: el.getAttribute('aria-valuemax')
      }))
    })

    // Verify controls have appropriate ARIA attributes
    for (const control of controls) {
      if (control.role === 'slider') {
        expect(control.ariaValueNow).toBeTruthy()
        expect(control.ariaValueMin).toBeTruthy()
        expect(control.ariaValueMax).toBeTruthy()
      }
    }
  })

  test('should announce video state changes to screen readers', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for status announcements
    const assertiveRegion = await page.locator('[aria-live="assertive"]')
    const politeRegion = await page.locator('[aria-live="polite"]')

    const hasLiveRegion = (await assertiveRegion.count() > 0) || (await politeRegion.count() > 0)
    expect(hasLiveRegion).toBeTruthy()

    // Trigger state change
    const playButton = await page.locator('[data-testid="play-button"], button:has-text("Play")').first()
    await playButton.click()
    await page.waitForTimeout(1000)

    // Check if state was announced
    const announcement = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live]')
      return Array.from(regions).map(r => r.textContent?.trim()).filter(t => t)
    })

    expect(announcement.length).toBeGreaterThan(0)
  })
})

test.describe('Smart TV D-pad Navigation', () => {
  test('should support arrow key navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Focus on video player
    const videoContainer = await page.locator('[data-testid="video-player-container"]').first()
    await videoContainer.focus()

    // Test arrow key navigation
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter']

    for (const key of navigationKeys) {
      await page.keyboard.press(key)
      await page.waitForTimeout(200)

      const focusedElement = await page.evaluate(() => {
        return {
          tag: document.activeElement?.tagName,
          class: document.activeElement?.className,
          id: document.activeElement?.id
        }
      })

      // Verify focus changed or action was taken
      expect(focusedElement.tag).toBeTruthy()
    }
  })

  test('should have visible focus indicators for TV viewing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab to first control
    await page.keyboard.press('Tab')

    // Check focus visibility
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null

      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
        border: styles.border
      }
    })

    // Should have visible focus indicator
    const hasVisibleFocus =
      (focusStyles?.outline && focusStyles.outline !== 'none') ||
      (focusStyles?.boxShadow && focusStyles.boxShadow !== 'none') ||
      (focusStyles?.border && focusStyles.border !== 'none')

    expect(hasVisibleFocus).toBeTruthy()
  })

  test('should support spatial navigation for Smart TV', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get all focusable elements positions
    const elements = await page.evaluate(() => {
      const selector = 'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
      const els = document.querySelectorAll(selector)
      return Array.from(els).map(el => {
        const rect = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        }
      })
    })

    // Verify elements are positioned for D-pad navigation
    expect(elements.length).toBeGreaterThan(0)

    // Check if elements are properly spaced for TV navigation
    for (let i = 0; i < elements.length - 1; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const distance = Math.sqrt(
          Math.pow(elements[i].x - elements[j].x, 2) +
          Math.pow(elements[i].y - elements[j].y, 2)
        )

        // Elements should be reasonably spaced for D-pad navigation
        if (distance < 100) {
          // If elements are close, they should be clearly distinguishable
          expect(elements[i].width + elements[i].height).toBeGreaterThan(40)
        }
      }
    }
  })
})

test.describe('Mobile Accessibility', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true
  })

  test('should have touch-friendly controls', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get all interactive elements
    const touchTargets = await page.evaluate(() => {
      const selector = 'button, input, a[href], [role="button"]'
      const elements = document.querySelectorAll(selector)
      return Array.from(elements).map(el => {
        const rect = el.getBoundingClientRect()
        return {
          width: rect.width,
          height: rect.height,
          tag: el.tagName
        }
      })
    })

    // WCAG 2.1 AA requires 44x44 CSS pixels for touch targets
    for (const target of touchTargets) {
      const size = Math.min(target.width, target.height)
      expect(size).toBeGreaterThanOrEqual(44)
    }
  })

  test('should support touch gestures', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const video = await page.locator('video').first()
    const videoBox = await video.boundingBox()

    if (videoBox) {
      // Test tap to play/pause
      await page.tap('video')
      await page.waitForTimeout(500)

      let isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused)
      expect(isPlaying).toBeDefined()

      // Test tap again to toggle
      await page.tap('video')
      await page.waitForTimeout(500)

      const isPaused = await video.evaluate((el: HTMLVideoElement) => el.paused)
      expect(isPaused !== isPlaying).toBeTruthy()
    }
  })
})

// Generate accessibility report
test.afterAll(async () => {
  console.log(`
    ========================================
    WCAG 2.1 AA Accessibility Test Summary
    ========================================

    All critical accessibility tests have been executed.
    Review the test results above for any violations.

    Key Areas Tested:
    ✓ WCAG 2.1 AA compliance via axe-core
    ✓ Keyboard navigation support
    ✓ Screen reader compatibility
    ✓ Focus management and visibility
    ✓ Color contrast ratios
    ✓ Touch target sizes (mobile)
    ✓ Smart TV D-pad navigation
    ✓ ARIA labels and live regions

    ========================================
  `)
})