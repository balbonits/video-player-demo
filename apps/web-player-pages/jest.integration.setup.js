/**
 * Jest Integration Setup for Cross-Component Testing
 * Sam (QA) - Integration testing configuration
 */

import { jest } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

// Mock Redux store setup for integration tests
global.createTestStore = (initialState = {}) => {
  // Mock Redux slices (these will be implemented by Alex)
  const mockPlayerSlice = {
    reducer: (state = { isPlaying: false, volume: 1, isBuffering: false, error: null }, action) => {
      switch (action.type) {
        case 'player/togglePlayback':
          return { ...state, isPlaying: !state.isPlaying }
        case 'player/setVolume':
          return { ...state, volume: action.payload }
        case 'player/setBuffering':
          return { ...state, isBuffering: action.payload }
        case 'player/setError':
          return { ...state, error: action.payload }
        default:
          return state
      }
    },
    actions: {
      togglePlayback: () => ({ type: 'player/togglePlayback' }),
      setVolume: (volume) => ({ type: 'player/setVolume', payload: volume }),
      setBuffering: (buffering) => ({ type: 'player/setBuffering', payload: buffering }),
      setError: (error) => ({ type: 'player/setError', payload: error })
    }
  }

  const mockVideoSlice = {
    reducer: (state = {
      currentSrc: '',
      currentQuality: 'auto',
      availableQualities: [],
      streamingProtocol: 'hls'
    }, action) => {
      switch (action.type) {
        case 'video/setCurrentQuality':
          return { ...state, currentQuality: action.payload }
        case 'video/setAvailableQualities':
          return { ...state, availableQualities: action.payload }
        case 'video/setCurrentSrc':
          return { ...state, currentSrc: action.payload }
        case 'video/setStreamingProtocol':
          return { ...state, streamingProtocol: action.payload }
        default:
          return state
      }
    },
    actions: {
      setCurrentQuality: (quality) => ({ type: 'video/setCurrentQuality', payload: quality }),
      setAvailableQualities: (qualities) => ({ type: 'video/setAvailableQualities', payload: qualities }),
      setCurrentSrc: (src) => ({ type: 'video/setCurrentSrc', payload: src }),
      setStreamingProtocol: (protocol) => ({ type: 'video/setStreamingProtocol', payload: protocol })
    }
  }

  const mockUISlice = {
    reducer: (state = {
      focusedControl: 'play-pause',
      performanceWarnings: [],
      isSettingsOpen: false
    }, action) => {
      switch (action.type) {
        case 'ui/setFocusedControl':
          return { ...state, focusedControl: action.payload }
        case 'ui/addPerformanceWarning':
          return { ...state, performanceWarnings: [...state.performanceWarnings, action.payload] }
        case 'ui/setSettingsOpen':
          return { ...state, isSettingsOpen: action.payload }
        default:
          return state
      }
    },
    actions: {
      setFocusedControl: (control) => ({ type: 'ui/setFocusedControl', payload: control }),
      addPerformanceWarning: (warning) => ({ type: 'ui/addPerformanceWarning', payload: warning }),
      setSettingsOpen: (open) => ({ type: 'ui/setSettingsOpen', payload: open })
    }
  }

  const mockAccessibilitySlice = {
    reducer: (state = {
      captionSettings: { fontSize: 'medium', textColor: '#ffffff', backgroundColor: '#000000' },
      announcements: []
    }, action) => {
      switch (action.type) {
        case 'accessibility/updateCaptionSettings':
          return { ...state, captionSettings: { ...state.captionSettings, ...action.payload } }
        case 'accessibility/addAnnouncement':
          return { ...state, announcements: [...state.announcements, action.payload] }
        default:
          return state
      }
    },
    actions: {
      updateCaptionSettings: (settings) => ({ type: 'accessibility/updateCaptionSettings', payload: settings }),
      addAnnouncement: (text) => ({ type: 'accessibility/addAnnouncement', payload: text })
    }
  }

  const mockAnalyticsSlice = {
    reducer: (state = {
      performanceMetrics: { memoryUsage: 0, inputLatency: 0, videoStartTime: 0 },
      performanceHistory: [],
      averageMetrics: { memoryUsage: 0 },
      events: [],
      sessionMetrics: {}
    }, action) => {
      switch (action.type) {
        case 'analytics/updatePerformanceMetrics':
          return {
            ...state,
            performanceMetrics: { ...state.performanceMetrics, ...action.payload },
            performanceHistory: [...state.performanceHistory, { ...action.payload, timestamp: Date.now() }]
          }
        case 'analytics/recordEvent':
          return { ...state, events: [...state.events, action.payload] }
        default:
          return state
      }
    },
    actions: {
      updatePerformanceMetrics: (metrics) => ({ type: 'analytics/updatePerformanceMetrics', payload: metrics }),
      recordEvent: (event) => ({ type: 'analytics/recordEvent', payload: event })
    }
  }

  // Store global references for tests to access
  global.mockSlices = {
    player: mockPlayerSlice,
    video: mockVideoSlice,
    ui: mockUISlice,
    accessibility: mockAccessibilitySlice,
    analytics: mockAnalyticsSlice
  }

  const store = configureStore({
    reducer: {
      player: mockPlayerSlice.reducer,
      video: mockVideoSlice.reducer,
      ui: mockUISlice.reducer,
      accessibility: mockAccessibilitySlice.reducer,
      analytics: mockAnalyticsSlice.reducer
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      })
  })

  return store
}

// Mock Web Component for integration testing
global.MockHLSVideoPlayer = class extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._metrics = {
      memoryUsage: 50 * 1024 * 1024,
      cpuUsage: 25,
      inputLatency: 85,
      videoStartTime: 1200,
      bufferingRatio: 0.05
    }
    this._isPlaying = false
    this._currentQuality = 'auto'
    this._src = ''
  }

  connectedCallback() {
    this.render()
    this.setupEventListeners()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 400px;
          background: #000;
          position: relative;
        }
        .video-element {
          width: 100%;
          height: 100%;
        }
        .controls-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          padding: 10px;
          display: flex;
          gap: 10px;
        }
        .control-button {
          min-width: 64px;
          min-height: 64px;
          background: #333;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .control-button:focus {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        .progress-bar {
          flex: 1;
          height: 20px;
          background: #555;
          border-radius: 10px;
          cursor: pointer;
        }
      </style>
      <video class="video-element"></video>
      <div class="controls-overlay">
        <button class="control-button" id="play-pause" aria-label="Play or pause video">
          ${this._isPlaying ? '⏸️' : '▶️'}
        </button>
        <button class="control-button" id="volume" aria-label="Volume control">🔊</button>
        <div class="progress-bar" role="slider" aria-label="Video progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
        <select id="quality" aria-label="Video quality">
          <option value="auto">Auto</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="360p">360p</option>
        </select>
        <button class="control-button" id="settings" aria-label="Settings">⚙️</button>
        <button class="control-button" id="fullscreen" aria-label="Fullscreen">⛶</button>
      </div>
    `
  }

  setupEventListeners() {
    const playButton = this.shadowRoot.querySelector('#play-pause')
    playButton?.addEventListener('click', () => {
      this.togglePlayback()
    })

    const qualitySelect = this.shadowRoot.querySelector('#quality')
    qualitySelect?.addEventListener('change', (e) => {
      this.setQuality(e.target.value)
    })

    // Keyboard event handling
    this.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          this.togglePlayback()
          break
        case 'ArrowLeft':
          this.seek(-10)
          break
        case 'ArrowRight':
          this.seek(10)
          break
        case 'f':
          this.toggleFullscreen()
          break
      }
    })

    // Performance monitoring simulation
    this.startPerformanceMonitoring()
  }

  // Public API methods
  getPerformanceMetrics() {
    return { ...this._metrics }
  }

  optimizeForSmartTV() {
    this._metrics.memoryUsage = Math.min(this._metrics.memoryUsage, 90 * 1024 * 1024)
    this._metrics.inputLatency = Math.min(this._metrics.inputLatency, 120)
  }

  optimizeForMobile() {
    this._metrics.memoryUsage = Math.min(this._metrics.memoryUsage, 70 * 1024 * 1024)
  }

  optimizeForDesktop() {
    // Desktop can use more resources
  }

  play() {
    this._isPlaying = true
    this.render()
    this.dispatchPerformanceEvent('video-ready', { videoStartTime: 1200 })
    return Promise.resolve()
  }

  pause() {
    this._isPlaying = false
    this.render()
  }

  togglePlayback() {
    if (this._isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  seek(seconds) {
    // Mock seek implementation
    this.dispatchPerformanceEvent('seek', { seekTime: seconds })
  }

  setQuality(quality) {
    this._currentQuality = quality
    this.dispatchPerformanceEvent('quality-changed', {
      quality,
      switchTime: Math.random() * 800 + 200 // 200-1000ms
    })
  }

  toggleFullscreen() {
    // Mock fullscreen implementation
  }

  getHLSConfig() {
    const performanceMode = this.getAttribute('performance-mode')

    switch (performanceMode) {
      case 'smartTV':
        return {
          maxBufferLength: 180,
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: 2,
          liveSyncDurationCount: 3
        }
      case 'mobile':
        return {
          maxBufferLength: 120,
          enableWorker: true,
          startLevel: 2
        }
      default:
        return {
          maxBufferLength: 300,
          enableWorker: true,
          startLevel: -1
        }
    }
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      this.dispatchPerformanceEvent('performance-update', this._metrics)
    }, 2000)
  }

  dispatchPerformanceEvent(type, data) {
    const event = new CustomEvent('hls-performance', {
      detail: {
        type,
        data,
        timestamp: Date.now(),
        performanceMode: this.getAttribute('performance-mode') || 'desktop'
      },
      bubbles: true
    })
    this.dispatchEvent(event)
  }

  performMemoryCleanup() {
    this._metrics.memoryUsage = Math.max(
      this._metrics.memoryUsage * 0.9,
      40 * 1024 * 1024
    )
    this.dispatchPerformanceEvent('memory-cleanup', {
      memoryUsage: this._metrics.memoryUsage,
      memoryLimit: 100 * 1024 * 1024
    })
  }

  static get observedAttributes() {
    return ['src', 'performance-mode', 'memory-limit', 'cpu-limit']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src') {
      this._src = newValue
    }
    if (name === 'performance-mode') {
      switch (newValue) {
        case 'smartTV':
          this.optimizeForSmartTV()
          break
        case 'mobile':
          this.optimizeForMobile()
          break
      }
    }
  }
}

// Integration test utilities
global.integrationTestUtils = {
  // Create a test environment with store and web component
  createTestEnvironment: (storeInitialState = {}) => {
    const store = global.createTestStore(storeInitialState)

    // Register mock web component if not already registered
    if (!customElements.get('hls-video-player')) {
      customElements.define('hls-video-player', global.MockHLSVideoPlayer)
    }

    return { store }
  },

  // Simulate user interactions across components
  simulateUserFlow: async (actions) => {
    for (const action of actions) {
      switch (action.type) {
        case 'click':
          const element = document.querySelector(action.selector)
          if (element) {
            element.click()
          }
          break
        case 'keydown':
          document.dispatchEvent(new KeyboardEvent('keydown', { key: action.key }))
          break
        case 'focus':
          const focusElement = document.querySelector(action.selector)
          if (focusElement) {
            focusElement.focus()
          }
          break
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, action.duration || 100))
          break
      }
    }
  },

  // Wait for Redux state changes
  waitForState: (store, predicate, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe()
        reject(new Error(`State condition not met within ${timeout}ms`))
      }, timeout)

      const unsubscribe = store.subscribe(() => {
        if (predicate(store.getState())) {
          clearTimeout(timeoutId)
          unsubscribe()
          resolve(store.getState())
        }
      })

      // Check initial state
      if (predicate(store.getState())) {
        clearTimeout(timeoutId)
        unsubscribe()
        resolve(store.getState())
      }
    })
  },

  // Mock performance monitoring integration
  mockPerformanceMonitoring: () => {
    const events = []

    return {
      trackMetric: jest.fn((type, data) => {
        events.push({ type, data, timestamp: Date.now() })
      }),
      alertOnViolation: jest.fn((data) => {
        events.push({ type: 'violation', data, timestamp: Date.now() })
      }),
      getEvents: () => events,
      clearEvents: () => events.length = 0
    }
  }
}

// Setup and teardown for integration tests
beforeEach(() => {
  // Clear any existing custom elements
  if (typeof window !== 'undefined' && window.customElements) {
    // We can't actually clear custom elements, but we can reset the DOM
    document.body.innerHTML = ''
  }
})

afterEach(() => {
  // Clean up DOM
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
  }

  // Clear all mocks
  jest.clearAllMocks()
})