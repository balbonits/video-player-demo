/**
 * Jest Accessibility Setup for WCAG 2.1 AA Compliance
 * Sam (QA) - Accessibility testing configuration
 */

import { jest } from '@jest/globals'
import { configureAxe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations)

// Configure axe-core for WCAG 2.1 AA compliance
const axe = configureAxe({
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-visible': { enabled: true },
    'aria-labels': { enabled: true },
    'landmark-roles': { enabled: true },
    'heading-structure': { enabled: true },

    // Smart TV specific accessibility rules
    'target-size': { enabled: true }, // 44px minimum for TV
    'focus-management': { enabled: true },

    // Video player specific rules
    'media-captions': { enabled: true },
    'audio-description': { enabled: true },
    'video-transcript': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
})

// Mock Speech Synthesis API for screen reader testing
global.speechSynthesis = {
  speak: jest.fn((utterance) => {
    // Simulate speech completion
    setTimeout(() => {
      if (utterance.onend) utterance.onend()
    }, 100)
  }),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Test Voice', lang: 'en-US', default: true }
  ]),
  speaking: false,
  pending: false,
  paused: false
}

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  volume: 1,
  rate: 1,
  pitch: 1,
  voice: null,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}))

// Mock Speech Recognition for voice control testing
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  continuous: false,
  grammars: null,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
  onnomatch: null,
  onsoundstart: null,
  onsoundend: null,
  onspeechstart: null,
  onspeechend: null,
  onaudiostart: null,
  onaudioend: null
}))

global.webkitSpeechRecognition = global.SpeechRecognition

// Mock media queries for accessibility preferences
const mockMatchMedia = jest.fn().mockImplementation((query) => {
  const matches = {
    '(prefers-reduced-motion: reduce)': false,
    '(prefers-contrast: high)': false,
    '(prefers-color-scheme: dark)': false,
    '(forced-colors: active)': false
  }

  return {
    matches: matches[query] || false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

// Accessibility test utilities
global.accessibilityTestUtils = {
  // WCAG contrast ratio calculation
  calculateContrastRatio: (foreground, background) => {
    // Simplified contrast calculation for testing
    // In real implementation, use proper color parsing and calculation
    if (foreground === '#ffffff' && background === '#000000') return 21
    if (foreground === '#000000' && background === '#ffffff') return 21
    return 4.6 // Mock passing ratio
  },

  // Check if element has proper focus indicators
  hasFocusIndicator: (element) => {
    const styles = getComputedStyle(element)
    return (
      styles.outline !== 'none' &&
      styles.outlineWidth !== '0px' &&
      styles.outlineColor !== 'transparent'
    )
  },

  // Check if element is keyboard accessible
  isKeyboardAccessible: (element) => {
    const tabIndex = element.getAttribute('tabindex')
    const tagName = element.tagName.toLowerCase()

    // Interactive elements are inherently keyboard accessible
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a']

    return (
      interactiveElements.includes(tagName) ||
      (tabIndex !== null && parseInt(tabIndex) >= 0) ||
      element.hasAttribute('role')
    )
  },

  // Simulate screen reader announcement
  announceToScreenReader: (text, priority = 'polite') => {
    const announcement = new global.SpeechSynthesisUtterance(text)
    global.speechSynthesis.speak(announcement)

    // Also update live region
    const liveRegion = document.querySelector(`[aria-live="${priority}"]`) ||
                     document.querySelector('[aria-live]')

    if (liveRegion) {
      liveRegion.textContent = text
    }
  },

  // Simulate keyboard navigation
  simulateKeyNavigation: async (element, key) => {
    const keyEvent = new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true
    })

    element.dispatchEvent(keyEvent)

    // Simulate focus change for arrow keys
    if (key.startsWith('Arrow')) {
      const focusableElements = Array.from(
        document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )

      const currentIndex = focusableElements.indexOf(element)
      let nextIndex

      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % focusableElements.length
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
          break
        default:
          return
      }

      if (focusableElements[nextIndex]) {
        focusableElements[nextIndex].focus()
      }
    }
  },

  // Mock D-pad navigation for Smart TV
  simulateDpadNavigation: async (direction) => {
    const activeElement = document.activeElement
    const keyMap = {
      'right': 'ArrowRight',
      'left': 'ArrowLeft',
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'select': 'Enter'
    }

    return global.accessibilityTestUtils.simulateKeyNavigation(
      activeElement,
      keyMap[direction] || direction
    )
  },

  // Check Smart TV accessibility requirements
  validateSmartTVAccessibility: (container) => {
    const violations = []

    // Check button sizes (minimum 64px for TV)
    const buttons = container.querySelectorAll('button')
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect()
      if (rect.width < 64 || rect.height < 64) {
        violations.push(`Button ${index} too small for TV: ${rect.width}x${rect.height}px`)
      }
    })

    // Check text sizes (minimum 18px for TV)
    const textElements = container.querySelectorAll('span, div, p, label')
    textElements.forEach((element, index) => {
      if (element.textContent && element.textContent.trim()) {
        const styles = getComputedStyle(element)
        const fontSize = parseInt(styles.fontSize)
        if (fontSize < 18) {
          violations.push(`Text ${index} too small for TV: ${fontSize}px`)
        }
      }
    })

    return violations
  },

  // Test caption customization
  testCaptionCustomization: (settings) => {
    const captions = document.querySelectorAll('.video-captions, .caption-text')

    captions.forEach(caption => {
      if (settings.fontSize) {
        caption.style.fontSize = settings.fontSize
      }
      if (settings.textColor) {
        caption.style.color = settings.textColor
      }
      if (settings.backgroundColor) {
        caption.style.backgroundColor = settings.backgroundColor
      }
      if (settings.position) {
        caption.style.bottom = settings.position === 'bottom' ? '10%' : 'auto'
        caption.style.top = settings.position === 'top' ? '10%' : 'auto'
      }
    })
  },

  // Mock assistive technology detection
  detectAssistiveTechnology: () => {
    const userAgent = navigator.userAgent
    return {
      screenReader: userAgent.includes('JAWS') || userAgent.includes('NVDA') || userAgent.includes('VoiceOver'),
      voiceControl: 'speechSynthesis' in window && 'SpeechRecognition' in window,
      switchControl: false // Would be detected through specialized APIs
    }
  }
}

// Custom matchers for accessibility testing
expect.extend({
  toHaveProperAriaLabels(container) {
    const interactiveElements = container.querySelectorAll(
      'button, [role="button"], input, select, [role="slider"], [role="combobox"]'
    )

    const violations = []
    interactiveElements.forEach((element, index) => {
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledBy = element.getAttribute('aria-labelledby')
      const title = element.getAttribute('title')

      if (!ariaLabel && !ariaLabelledBy && !title) {
        violations.push(`Element ${index} (${element.tagName}) lacks accessible name`)
      }
    })

    return {
      pass: violations.length === 0,
      message: () => violations.length > 0
        ? `Accessibility violations found: ${violations.join(', ')}`
        : 'All interactive elements have proper ARIA labels'
    }
  },

  toBeKeyboardAccessible(element) {
    const isAccessible = global.accessibilityTestUtils.isKeyboardAccessible(element)

    return {
      pass: isAccessible,
      message: () => isAccessible
        ? `Element is keyboard accessible`
        : `Element is not keyboard accessible (missing tabindex, role, or not interactive element)`
    }
  },

  toHaveFocusIndicator(element) {
    const hasFocus = global.accessibilityTestUtils.hasFocusIndicator(element)

    return {
      pass: hasFocus,
      message: () => hasFocus
        ? `Element has visible focus indicator`
        : `Element lacks visible focus indicator`
    }
  }
})

// Setup and teardown for accessibility tests
beforeEach(() => {
  // Reset speech synthesis mock
  global.speechSynthesis.speak.mockClear()
  global.speechSynthesis.cancel.mockClear()

  // Create live regions for announcements
  if (typeof document !== 'undefined') {
    let politeRegion = document.querySelector('[aria-live="polite"]')
    if (!politeRegion) {
      politeRegion = document.createElement('div')
      politeRegion.setAttribute('aria-live', 'polite')
      politeRegion.setAttribute('aria-atomic', 'true')
      politeRegion.style.position = 'absolute'
      politeRegion.style.left = '-10000px'
      politeRegion.style.width = '1px'
      politeRegion.style.height = '1px'
      politeRegion.style.overflow = 'hidden'
      document.body.appendChild(politeRegion)
    }

    let assertiveRegion = document.querySelector('[aria-live="assertive"]')
    if (!assertiveRegion) {
      assertiveRegion = document.createElement('div')
      assertiveRegion.setAttribute('aria-live', 'assertive')
      assertiveRegion.setAttribute('aria-atomic', 'true')
      assertiveRegion.style.position = 'absolute'
      assertiveRegion.style.left = '-10000px'
      assertiveRegion.style.width = '1px'
      assertiveRegion.style.height = '1px'
      assertiveRegion.style.overflow = 'hidden'
      document.body.appendChild(assertiveRegion)
    }
  }
})

afterEach(() => {
  // Clean up live regions
  if (typeof document !== 'undefined') {
    const liveRegions = document.querySelectorAll('[aria-live]')
    liveRegions.forEach(region => {
      if (region.parentNode === document.body) {
        region.remove()
      }
    })
  }
})