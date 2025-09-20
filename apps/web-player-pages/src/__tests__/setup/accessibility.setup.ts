/**
 * Accessibility Testing Setup Configuration
 *
 * WCAG 2.1 AA compliance testing setup with axe-core integration
 * Configures screen reader simulation, keyboard navigation testing,
 * and accessibility assertion helpers
 */

import { axe, configureAxe } from 'jest-axe'

/**
 * Configure axe-core for comprehensive accessibility testing
 */
configureAxe({
  // WCAG 2.1 AA compliance rules
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-trap': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: false }, // Not applicable for components
    'region': { enabled: true },

    // Video player specific rules
    'video-caption': { enabled: true },
    'audio-caption': { enabled: true },
    'media-has-caption': { enabled: true },

    // Interactive element rules
    'interactive-supports-focus': { enabled: true },
    'focus-trap-implements-keyboard-nav': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },

    // Disable rules not applicable to video player components
    'html-has-lang': { enabled: false },
    'landmark-unique': { enabled: false }
  },

  // Configure for video player component testing
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],

  // Custom checks for video player accessibility
  checks: [
    {
      id: 'video-controls-accessible',
      evaluate: (node: any) => {
        // Check if video controls are keyboard accessible
        const controls = node.querySelectorAll('button, [role="button"], [role="slider"]')
        return Array.from(controls).every((control: any) => {
          return control.hasAttribute('tabindex') || control.tabIndex >= 0
        })
      },
      metadata: {
        impact: 'serious',
        messages: {
          pass: 'Video controls are keyboard accessible',
          fail: 'Video controls must be keyboard accessible'
        }
      }
    }
  ]
})

/**
 * Screen Reader Simulation for Testing
 */
export class ScreenReaderSimulator {
  private announcements: string[] = []
  private isActive = false

  activate(): void {
    this.isActive = true
    this.announcements = []

    // Mock screen reader announcements
    this.mockAriaLive()
    this.mockAriaLabel()
    this.mockRoleAnnouncements()
  }

  deactivate(): void {
    this.isActive = false
    this.announcements = []
  }

  getAnnouncements(): string[] {
    return [...this.announcements]
  }

  getLastAnnouncement(): string | null {
    return this.announcements.length > 0 ? this.announcements[this.announcements.length - 1] : null
  }

  clearAnnouncements(): void {
    this.announcements = []
  }

  private mockAriaLive(): void {
    // Monitor aria-live regions for announcements
    const observer = new MutationObserver((mutations) => {
      if (!this.isActive) return

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target as Element
          if (target.getAttribute?.('aria-live') || target.closest?.('[aria-live]')) {
            const text = target.textContent?.trim()
            if (text) {
              this.announcements.push(`ARIA-LIVE: ${text}`)
            }
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  private mockAriaLabel(): void {
    // Mock focus events to announce aria-label
    document.addEventListener('focusin', (event) => {
      if (!this.isActive) return

      const target = event.target as Element
      const label = target.getAttribute('aria-label') ||
                   target.getAttribute('aria-labelledby') ||
                   target.getAttribute('title') ||
                   target.textContent

      if (label?.trim()) {
        this.announcements.push(`FOCUS: ${label.trim()}`)
      }
    })
  }

  private mockRoleAnnouncements(): void {
    // Announce role changes and button states
    document.addEventListener('click', (event) => {
      if (!this.isActive) return

      const target = event.target as Element
      const role = target.getAttribute('role') || target.tagName.toLowerCase()
      const pressed = target.getAttribute('aria-pressed')
      const expanded = target.getAttribute('aria-expanded')

      let announcement = `ACTIVATE: ${role}`

      if (pressed) {
        announcement += `, ${pressed === 'true' ? 'pressed' : 'not pressed'}`
      }

      if (expanded) {
        announcement += `, ${expanded === 'true' ? 'expanded' : 'collapsed'}`
      }

      this.announcements.push(announcement)
    })
  }
}

// Global screen reader simulator
export const screenReader = new ScreenReaderSimulator()

/**
 * Keyboard Navigation Testing Utilities
 */
export class KeyboardNavigationTester {
  private focusableElements: HTMLElement[] = []
  private currentFocusIndex = -1

  findFocusableElements(container: Element): HTMLElement[] {
    const focusableSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="slider"]',
      '[role="menuitem"]',
      'video[controls]'
    ].join(', ')

    this.focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]

    return this.focusableElements
  }

  async testTabOrder(container: Element): Promise<HTMLElement[]> {
    this.findFocusableElements(container)
    const tabOrder: HTMLElement[] = []

    // Simulate tab navigation
    for (let i = 0; i < this.focusableElements.length; i++) {
      const element = this.focusableElements[i]

      // Focus the element
      element.focus()
      await new Promise(resolve => setTimeout(resolve, 10))

      // Check if it received focus
      if (document.activeElement === element) {
        tabOrder.push(element)
      }
    }

    return tabOrder
  }

  async testArrowKeyNavigation(container: Element, direction: 'horizontal' | 'vertical' = 'horizontal'): Promise<boolean> {
    this.findFocusableElements(container)

    if (this.focusableElements.length < 2) {
      return true // Not applicable
    }

    // Start with first element
    this.focusableElements[0].focus()
    let currentElement = document.activeElement as HTMLElement

    const keyCode = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

    // Test arrow key navigation
    for (let i = 1; i < this.focusableElements.length; i++) {
      // Dispatch arrow key event
      currentElement.dispatchEvent(new KeyboardEvent('keydown', {
        key: keyCode,
        bubbles: true
      }))

      await new Promise(resolve => setTimeout(resolve, 10))

      const newActiveElement = document.activeElement as HTMLElement

      // Check if focus moved
      if (newActiveElement === currentElement) {
        return false // Arrow key navigation not working
      }

      currentElement = newActiveElement
    }

    return true
  }

  async testEscapeKey(container: Element): Promise<boolean> {
    // Test escape key handling (should close modals, exit fullscreen, etc.)
    const escapeHandled = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000)

      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          clearTimeout(timeout)
          resolve(true)
          document.removeEventListener('keydown', handler)
        }
      }

      document.addEventListener('keydown', handler)
    })

    // Focus container and press escape
    if (container instanceof HTMLElement) {
      container.focus()
    }

    container.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true
    }))

    return escapeHandled
  }

  async testSpaceAndEnterActivation(element: HTMLElement): Promise<{ space: boolean; enter: boolean }> {
    const results = { space: false, enter: false }

    // Test Space key activation
    const spacePromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 500)

      const handler = () => {
        clearTimeout(timeout)
        resolve(true)
        element.removeEventListener('click', handler)
      }

      element.addEventListener('click', handler)
    })

    element.focus()
    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true
    }))

    results.space = await spacePromise

    // Test Enter key activation
    const enterPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 500)

      const handler = () => {
        clearTimeout(timeout)
        resolve(true)
        element.removeEventListener('click', handler)
      }

      element.addEventListener('click', handler)
    })

    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true
    }))

    results.enter = await enterPromise

    return results
  }
}

// Global keyboard navigation tester
export const keyboardTester = new KeyboardNavigationTester()

/**
 * Color Contrast Testing
 */
export class ContrastTester {
  calculateContrast(foreground: string, background: string): number {
    // Simplified contrast calculation (real implementation would use WCAG formula)
    const fgLuminance = this.getLuminance(foreground)
    const bgLuminance = this.getLuminance(background)

    const lighter = Math.max(fgLuminance, bgLuminance)
    const darker = Math.min(fgLuminance, bgLuminance)

    return (lighter + 0.05) / (darker + 0.05)
  }

  private getLuminance(color: string): number {
    // Simplified luminance calculation
    // Real implementation would parse RGB values and apply gamma correction
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  testWCAGCompliance(contrast: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const thresholds = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    }

    return contrast >= thresholds[level][size]
  }
}

// Global contrast tester
export const contrastTester = new ContrastTester()

/**
 * Accessibility Assertion Helpers
 */
export async function expectAccessible(element: Element): Promise<void> {
  const results = await axe(element)
  expect(results).toHaveNoViolations()
}

export function expectKeyboardAccessible(element: Element): void {
  const focusableElements = keyboardTester.findFocusableElements(element)
  expect(focusableElements.length).toBeGreaterThan(0)

  focusableElements.forEach(el => {
    expect(el.tabIndex).toBeGreaterThanOrEqual(0)
  })
}

export function expectScreenReaderAnnouncement(expectedText: string): void {
  const announcements = screenReader.getAnnouncements()
  expect(announcements.some(announcement =>
    announcement.toLowerCase().includes(expectedText.toLowerCase())
  )).toBe(true)
}

export function expectProperAriaLabels(element: Element): void {
  const interactiveElements = element.querySelectorAll('button, [role="button"], input, select, [role="slider"]')

  interactiveElements.forEach(el => {
    const hasLabel = el.hasAttribute('aria-label') ||
                    el.hasAttribute('aria-labelledby') ||
                    el.hasAttribute('title') ||
                    el.textContent?.trim()

    expect(hasLabel).toBe(true)
  })
}

export function expectHighContrast(element: Element): void {
  const styles = getComputedStyle(element)
  const color = styles.color
  const backgroundColor = styles.backgroundColor

  if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
    const contrast = contrastTester.calculateContrast(color, backgroundColor)
    expect(contrastTester.testWCAGCompliance(contrast, 'AA')).toBe(true)
  }
}

/**
 * Smart TV Accessibility Configuration
 */
export function configureSmartTVAccessibility(): void {
  // Configure larger focus indicators for TV viewing distance
  const style = document.createElement('style')
  style.textContent = `
    *:focus {
      outline: 4px solid #0066cc !important;
      outline-offset: 4px !important;
    }

    .control-button:focus {
      transform: scale(1.1) !important;
      box-shadow: 0 0 0 4px #0066cc !important;
    }

    @media (prefers-reduced-motion: no-preference) {
      *:focus {
        transition: all 0.2s ease !important;
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Setup and teardown for accessibility tests
 */
export function setupAccessibilityTest(): void {
  screenReader.activate()
  configureSmartTVAccessibility()
}

export function teardownAccessibilityTest(): void {
  screenReader.deactivate()

  // Remove accessibility styles
  const styles = document.querySelectorAll('style')
  styles.forEach(style => {
    if (style.textContent?.includes('*:focus')) {
      style.remove()
    }
  })
}

// Auto-setup for accessibility testing
beforeEach(() => {
  setupAccessibilityTest()
})

afterEach(() => {
  teardownAccessibilityTest()
})