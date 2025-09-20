/**
 * Jest Test Setup Configuration
 *
 * Global test environment setup for HLS Video Player testing
 * Configures mocks, polyfills, and testing utilities
 */

import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// Mock Web Components API for environments that don't support it
if (!global.customElements) {
  global.customElements = {
    define: jest.fn(),
    get: jest.fn(),
    upgrade: jest.fn(),
    whenDefined: jest.fn(() => Promise.resolve())
  } as any
}

// Mock Shadow DOM API
if (!Element.prototype.attachShadow) {
  Element.prototype.attachShadow = jest.fn().mockImplementation(() => ({
    appendChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    innerHTML: '',
    firstElementChild: null,
    activeElement: null
  }))
}

// Mock Performance API for memory testing
if (!global.performance.memory) {
  Object.defineProperty(global.performance, 'memory', {
    value: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2000 * 1024 * 1024
    },
    writable: true
  })
}

// Mock MediaError for video testing
global.MediaError = class MockMediaError {
  public static MEDIA_ERR_ABORTED = 1
  public static MEDIA_ERR_NETWORK = 2
  public static MEDIA_ERR_DECODE = 3
  public static MEDIA_ERR_SRC_NOT_SUPPORTED = 4

  constructor(public code: number, public message: string = '') {}
}

// Mock HTMLVideoElement methods
const originalCreateElement = document.createElement
document.createElement = function(tagName: string) {
  const element = originalCreateElement.call(this, tagName)

  if (tagName === 'video') {
    // Add video-specific mocks
    Object.defineProperties(element, {
      play: {
        value: jest.fn(() => Promise.resolve()),
        writable: true
      },
      pause: {
        value: jest.fn(),
        writable: true
      },
      load: {
        value: jest.fn(),
        writable: true
      },
      canPlayType: {
        value: jest.fn((type: string) => {
          if (type === 'application/vnd.apple.mpegurl') return 'probably'
          return ''
        }),
        writable: true
      },
      buffered: {
        value: {
          length: 0,
          start: jest.fn(),
          end: jest.fn()
        },
        writable: true
      },
      currentTime: {
        value: 0,
        writable: true
      },
      duration: {
        value: 0,
        writable: true
      },
      paused: {
        value: true,
        writable: true
      },
      ended: {
        value: false,
        writable: true
      },
      muted: {
        value: false,
        writable: true
      },
      volume: {
        value: 1,
        writable: true
      },
      playbackRate: {
        value: 1,
        writable: true
      },
      readyState: {
        value: 0,
        writable: true
      },
      networkState: {
        value: 0,
        writable: true
      },
      error: {
        value: null,
        writable: true
      }
    })
  }

  return element
}

// Mock Fullscreen API
if (!document.fullscreenElement) {
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true
  })
}

if (!document.exitFullscreen) {
  document.exitFullscreen = jest.fn(() => Promise.resolve())
}

if (!Element.prototype.requestFullscreen) {
  Element.prototype.requestFullscreen = jest.fn(() => Promise.resolve())
}

// Mock ResizeObserver for responsive testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock IntersectionObserver for visibility testing
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args: any[]) => {
  // Suppress known test warnings
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is deprecated') ||
    args[0]?.includes?.('Warning: validateDOMNesting')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

console.warn = (...args: any[]) => {
  // Suppress known test warnings
  if (args[0]?.includes?.('componentWillReceiveProps has been renamed')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

// Mock requestAnimationFrame for animation testing
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16) // ~60fps
})

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id)
})

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Setup global test timeout
jest.setTimeout(10000) // 10 seconds for performance tests

// Global test cleanup
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers()

  // Reset DOM
  document.body.innerHTML = ''

  // Reset mocks
  jest.clearAllMocks()

  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

export {}