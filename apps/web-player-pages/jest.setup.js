/**
 * Jest Setup for Video Player Demo
 * Sam (QA) - Base testing configuration
 */

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock window.matchMedia for responsive design tests
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
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver for visibility detection
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock ResizeObserver for responsive behavior
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock HTMLMediaElement for video testing
window.HTMLMediaElement.prototype.load = () => {}
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
window.HTMLMediaElement.prototype.pause = () => {}
window.HTMLMediaElement.prototype.addTextTrack = () => ({})

// Mock Web APIs that may not be available in test environment
if (!window.customElements) {
  window.customElements = {
    define: jest.fn(),
    get: jest.fn(),
    whenDefined: jest.fn().mockResolvedValue(undefined),
    upgrade: jest.fn(),
  }
}

// Mock performance APIs for performance testing
if (!window.performance.memory) {
  window.performance.memory = {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB baseline
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
  }
}

// Mock requestAnimationFrame for animation testing
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 0)
  }
  window.cancelAnimationFrame = (id) => {
    clearTimeout(id)
  }
}

// Mock fullscreen API
if (!document.exitFullscreen) {
  document.exitFullscreen = jest.fn().mockResolvedValue(undefined)
  document.requestFullscreen = jest.fn().mockResolvedValue(undefined)
  HTMLElement.prototype.requestFullscreen = jest.fn().mockResolvedValue(undefined)
}

// Global test utilities
global.testUtils = {
  // Simulate memory pressure for performance tests
  simulateMemoryPressure: (targetMB) => {
    const arrays = []
    const currentMB = window.performance.memory.usedJSHeapSize / (1024 * 1024)
    const neededMB = targetMB - currentMB

    if (neededMB > 0) {
      const arraySize = Math.floor((neededMB * 1024 * 1024) / 8)
      for (let i = 0; i < Math.ceil(arraySize / 1000000); i++) {
        arrays.push(new Array(Math.min(1000000, arraySize - i * 1000000)).fill(0))
      }
    }

    // Update mock memory usage
    window.performance.memory.usedJSHeapSize = targetMB * 1024 * 1024
    return arrays
  },

  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Create test video element
  createTestVideo: (options = {}) => {
    const video = document.createElement('video')
    Object.assign(video, {
      currentTime: 0,
      duration: 120,
      paused: true,
      volume: 1,
      playbackRate: 1,
      ...options
    })
    return video
  },

  // Mock HLS.js instance
  createMockHLS: () => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
    levels: [
      { height: 360, bitrate: 800000 },
      { height: 720, bitrate: 2500000 },
      { height: 1080, bitrate: 5000000 }
    ],
    currentLevel: -1,
    autoLevelEnabled: true,
    config: {
      maxBufferLength: 30,
      enableWorker: true
    }
  })
}

// Console error handling for tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})