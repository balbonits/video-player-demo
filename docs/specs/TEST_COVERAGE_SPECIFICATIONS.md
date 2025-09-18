# 🧪 Test Coverage Specifications - 90% Coverage Target

**QA Engineer:** Sam
**Collaboration:** Jordan (Product) for requirements mapping
**Purpose:** Comprehensive test specifications matching every product requirement
**Coverage Target:** 90% overall, 95% critical components

---

## **📊 Test Coverage Matrix**

### **Coverage Mapping: Product Requirements → Test Requirements**
```typescript
interface TestCoverageMapping {
  'FR-001_HLS_Streaming': {
    productRequirement: 'Implement adaptive HLS video streaming with quality selection',
    testCoverage: '95% (critical component)',
    testTypes: ['Unit', 'Integration', 'E2E', 'Performance'],
    scenarios: 18,
    edgeCases: 12
  },

  'FR-002_SmartTV_Navigation': {
    productRequirement: 'Implement spatial navigation optimized for Smart TV remote controls',
    testCoverage: '95% (critical for Smart TV platforms)',
    testTypes: ['Unit', 'Integration', 'E2E', 'Accessibility'],
    scenarios: 15,
    edgeCases: 8
  },

  'FR-003_Video_Controls': {
    productRequirement: 'Implement comprehensive video playback controls with cross-platform optimization',
    testCoverage: '95% (user interaction critical)',
    testTypes: ['Unit', 'Integration', 'E2E', 'Accessibility'],
    scenarios: 22,
    edgeCases: 10
  },

  'FR-004_Responsive_Design': {
    productRequirement: 'Deliver consistent user experience across all target platforms and viewports',
    testCoverage: '90% responsive behavior validation',
    testTypes: ['Integration', 'E2E', 'Visual Regression'],
    scenarios: 12,
    edgeCases: 6
  }
}
```

---

## **🎬 HLS Streaming Test Specifications (FR-001)**

### **Unit Test Requirements - HLS Integration**
```typescript
// HLS.js integration testing - 95% coverage
describe('HLS Video Player Integration', () => {
  describe('HLS Initialization', () => {
    it('should initialize HLS.js with correct configuration for Smart TV', () => {
      // Test: HLS configuration matches Smart TV performance requirements
      const expectedConfig = {
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 300,
        startLevel: -1,
        capLevelToPlayerSize: true
      }

      const hls = initializeHLSPlayer(mockVideoElement, mockHLSUrl, 'smartTV')
      expect(hls.config).toMatchObject(expectedConfig)
    })

    it('should handle HLS manifest parsing and quality level detection', async () => {
      // Test: Quality levels properly extracted and stored in Redux
      const mockManifest = createMockHLSManifest(['1080p', '720p', '480p'])
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.initializeVideo(mockHLSUrl)
      })

      expect(result.current.availableQualities).toEqual(['1080p', '720p', '480p'])
    })

    it('should fallback to native HLS on Safari', () => {
      // Test: Safari native HLS detection and fallback
      mockUserAgent('Safari')
      const videoElement = createMockVideoElement()
      videoElement.canPlayType.mockReturnValue('probably')

      initializeHLSPlayer(videoElement, mockHLSUrl)

      expect(videoElement.src).toBe(mockHLSUrl)
      expect(HLS.isSupported).not.toHaveBeenCalled()
    })

    it('should handle HLS initialization errors gracefully', async () => {
      // Test: Error handling when HLS fails to initialize
      const mockHLS = {
        loadSource: jest.fn(),
        attachMedia: jest.fn(),
        on: jest.fn()
      }
      mockHLS.on.mockImplementation((event, callback) => {
        if (event === Hls.Events.ERROR) {
          callback(null, { fatal: true, details: 'MANIFEST_LOAD_ERROR' })
        }
      })

      const { result } = renderHook(() => useVideoPlayer())
      await act(async () => {
        result.current.initializeVideo(invalidHLSUrl)
      })

      expect(result.current.error).toContain('HLS Error: MANIFEST_LOAD_ERROR')
    })
  })

  describe('Quality Selection and Adaptation', () => {
    it('should change quality level when user selects specific quality', async () => {
      // Test: Manual quality selection overrides adaptive logic
      const mockHLS = createMockHLSInstance()
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.changeQuality('720p')
      })

      const expectedLevelIndex = mockHLS.levels.findIndex(level => level.height === 720)
      expect(mockHLS.currentLevel).toBe(expectedLevelIndex)
    })

    it('should return to adaptive mode when "Auto" selected', async () => {
      // Test: Auto quality resets to HLS adaptive behavior
      const mockHLS = createMockHLSInstance()
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.changeQuality('auto')
      })

      expect(mockHLS.currentLevel).toBe(-1) // -1 = auto mode
    })

    it('should track quality switches for analytics', async () => {
      // Test: Quality changes recorded for performance analytics
      const mockAnalytics = jest.fn()
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.changeQuality('480p')
      })

      expect(mockAnalytics).toHaveBeenCalledWith('quality_change', {
        from: 'auto',
        to: '480p',
        timestamp: expect.any(Number)
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle network errors with retry logic', async () => {
      // Test: Network error recovery with exponential backoff
      const mockRetry = jest.fn()
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.handleNetworkError('NETWORK_ERROR')
      })

      expect(mockRetry).toHaveBeenCalledWith({
        attempt: 1,
        maxAttempts: 3,
        backoffMs: 1000
      })
    })

    it('should display user-friendly error messages', async () => {
      // Test: Technical errors converted to user-friendly messages
      const { result } = renderHook(() => useVideoPlayer())

      await act(async () => {
        result.current.handleHLSError({ details: 'MANIFEST_LOAD_ERROR' })
      })

      expect(result.current.userErrorMessage).toBe(
        'Unable to load video. Please check your internet connection and try again.'
      )
    })
  })
})
```

### **Integration Test Requirements - HLS + Redux**
```typescript
// Integration testing between HLS player and Redux state management
describe('HLS Player Redux Integration', () => {
  it('should sync HLS events with Redux store state', async () => {
    // Test: HLS events properly update Redux state
    const store = createMockStore()
    const { getByTestId } = render(
      <Provider store={store}>
        <VideoPlayer src={mockHLSUrl} />
      </Provider>
    )

    // Simulate HLS events
    fireHLSEvent('MANIFEST_PARSED', { levels: mockQualityLevels })
    fireHLSEvent('LEVEL_LOADED', { level: 0 })

    await waitFor(() => {
      const state = store.getState()
      expect(state.player.availableQualities).toEqual(['1080p', '720p', '480p'])
      expect(state.player.currentQuality).toBe('1080p')
    })
  })

  it('should handle Redux actions affecting HLS player', async () => {
    // Test: Redux actions properly control HLS behavior
    const store = createMockStore()
    const { getByTestId } = render(
      <Provider store={store}>
        <VideoPlayer src={mockHLSUrl} />
      </Provider>
    )

    store.dispatch(changeQuality('720p'))

    await waitFor(() => {
      expect(mockHLSInstance.currentLevel).toBe(1) // Index for 720p
    })
  })
})
```

### **E2E Test Requirements - Complete User Journeys**
```typescript
// End-to-end testing for complete user workflows
describe('HLS Video Player E2E', () => {
  test('complete video playback journey', async ({ page }) => {
    // Test: Full user journey from landing to video completion
    await page.goto('/demo/hls-streaming')

    // Verify video player loads
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible()

    // Verify HLS stream loads
    await expect(page.locator('video')).toHaveAttribute('src', /\.m3u8/)

    // Start playback
    await page.click('[aria-label="Play video"]')
    await expect(page.locator('[aria-label="Pause video"]')).toBeVisible()

    // Test quality selection
    await page.click('[aria-label="Quality settings"]')
    await page.click('text=720p')
    await expect(page.locator('text=720p')).toBeVisible()

    // Test seeking
    await page.click('[data-testid="progress-bar"]', { position: { x: 100, y: 5 } })

    // Verify video time changed
    const currentTime = await page.locator('[data-testid="current-time"]').textContent()
    expect(currentTime).not.toBe('0:00')
  })

  test('Smart TV navigation with keyboard simulation', async ({ page }) => {
    // Test: Complete Smart TV user journey with D-pad
    await page.goto('/demo/smart-tv')

    // Simulate Smart TV environment
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (SMART-TV; Linux; Tizen)',
        configurable: true
      })
    })

    // Test D-pad navigation
    await page.keyboard.press('Tab') // Focus first control
    await expect(page.locator('[aria-label="Play video"]')).toBeFocused()

    await page.keyboard.press('ArrowRight') // Navigate to volume
    await expect(page.locator('[aria-label="Volume control"]')).toBeFocused()

    await page.keyboard.press('ArrowRight') // Navigate to progress
    await expect(page.locator('[aria-label="Video progress"]')).toBeFocused()

    // Test activation with Enter key
    await page.keyboard.press('Enter')
    // Verify appropriate action taken based on focused control
  })
})
```

---

## **📱 Cross-Platform Test Specifications**

### **Mobile Platform Testing Requirements**
```typescript
// Mobile-specific testing for touch optimization and native features
describe('Mobile Video Player Testing', () => {
  describe('Touch Interaction', () => {
    it('should support touch gestures for video control', async () => {
      // Test: Touch gestures work correctly on mobile
      const { getByTestId } = render(<VideoPlayer src={mockUrl} />)
      const videoContainer = getByTestId('video-container')

      // Single tap to play/pause
      fireEvent.touchStart(videoContainer)
      fireEvent.touchEnd(videoContainer)

      await waitFor(() => {
        expect(mockVideoElement.play).toHaveBeenCalled()
      })

      // Swipe right for seek forward
      fireEvent.touchStart(videoContainer, { touches: [{ clientX: 100, clientY: 100 }] })
      fireEvent.touchMove(videoContainer, { touches: [{ clientX: 150, clientY: 100 }] })
      fireEvent.touchEnd(videoContainer)

      await waitFor(() => {
        expect(mockVideoElement.currentTime).toBeGreaterThan(10) // 10s seek
      })
    })

    it('should have appropriate touch target sizes (56px minimum)', () => {
      // Test: All touch targets meet mobile accessibility requirements
      const { container } = render(<VideoPlayer src={mockUrl} />)
      const buttons = container.querySelectorAll('button')

      buttons.forEach(button => {
        const styles = getComputedStyle(button)
        const width = parseInt(styles.width)
        const height = parseInt(styles.height)

        expect(width).toBeGreaterThanOrEqual(56)
        expect(height).toBeGreaterThanOrEqual(56)
      })
    })
  })

  describe('Picture-in-Picture Support', () => {
    it('should enable PiP on supported browsers', async () => {
      // Test: Picture-in-Picture functionality
      Object.defineProperty(document, 'pictureInPictureEnabled', {
        value: true,
        configurable: true
      })

      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)
      const pipButton = getByLabelText('Picture-in-Picture')

      expect(pipButton).toBeEnabled()

      await user.click(pipButton)
      expect(mockVideoElement.requestPictureInPicture).toHaveBeenCalled()
    })

    it('should hide PiP button on unsupported browsers', () => {
      // Test: Progressive enhancement for PiP
      Object.defineProperty(document, 'pictureInPictureEnabled', {
        value: false,
        configurable: true
      })

      const { queryByLabelText } = render(<VideoPlayer src={mockUrl} />)
      const pipButton = queryByLabelText('Picture-in-Picture')

      expect(pipButton).not.toBeInTheDocument()
    })
  })
})
```

### **Smart TV Platform Testing Requirements**
```typescript
// Smart TV specific testing with hardware constraint simulation
describe('Smart TV Video Player Testing', () => {
  beforeEach(() => {
    // Mock Smart TV environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (SMART-TV; Linux; Tizen)',
      configurable: true
    })

    // Mock TV hardware constraints
    Object.defineProperty(navigator, 'deviceMemory', {
      value: 1, // 1GB memory constraint
      configurable: true
    })
  })

  describe('D-pad Navigation Performance', () => {
    it('should respond to D-pad input within 200ms', async () => {
      // Test: Smart TV input response time requirements
      const { getByTestId } = render(<VideoPlayer src={mockUrl} />)
      const startTime = performance.now()

      fireEvent.keyDown(document, { key: 'ArrowRight' })

      await waitFor(() => {
        const focusedElement = document.activeElement
        expect(focusedElement).toHaveAttribute('data-control', 'volume')
      })

      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(200)
    })

    it('should maintain focus indicators visible on TV screens', () => {
      // Test: Focus indicators meet TV viewing requirements
      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)
      const playButton = getByLabelText('Play video')

      fireEvent.focus(playButton)

      const styles = getComputedStyle(playButton)
      expect(styles.outlineWidth).toBe('4px') // TV requirement
      expect(styles.transform).toContain('scale(1.1)') // TV enhancement
    })
  })

  describe('Memory Management', () => {
    it('should not exceed Smart TV memory constraints', async () => {
      // Test: Memory usage within Smart TV limits
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      const { unmount } = render(<VideoPlayer src={mockUrl} />)

      // Simulate extended usage
      for (let i = 0; i < 100; i++) {
        fireEvent.timeUpdate(document.querySelector('video'))
      }

      const peakMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryUsage = (peakMemory - initialMemory) / 1024 / 1024 // MB

      expect(memoryUsage).toBeLessThan(150) // Smart TV constraint

      unmount()

      // Verify cleanup
      if (global.gc) global.gc()
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      expect(finalMemory).toBeLessThanOrEqual(peakMemory * 1.1) // 10% tolerance
    })
  })

  describe('Platform-Specific Optimization', () => {
    it('should apply Roku-specific optimizations', () => {
      // Test: Roku platform detection and optimization
      mockPlatformDetection('roku')
      const { container } = render(<VideoPlayer src={mockUrl} />)

      expect(container.querySelector('.video-player')).toHaveClass('platform-roku')
      expect(document.documentElement.style.getPropertyValue('--tv-button-size')).toBe('64px')
    })

    it('should optimize buffering strategy for TV network conditions', async () => {
      // Test: TV-specific buffering configuration
      const mockHLS = createMockHLSInstance()
      mockPlatformDetection('tizen')

      render(<VideoPlayer src={mockUrl} />)

      expect(mockHLS.config.maxBufferLength).toBe(180) // Reduced for TV
      expect(mockHLS.config.backBufferLength).toBe(60)  // Conservative back buffer
    })
  })
})
```

---

## **♿ Accessibility Test Specifications**

### **WCAG 2.1 AA Compliance Testing**
```typescript
// Comprehensive accessibility testing - 100% WCAG compliance
describe('Accessibility Compliance Testing', () => {
  describe('Automated Accessibility Validation', () => {
    it('should have zero accessibility violations', async () => {
      // Test: Axe-core validation with WCAG 2.1 AA rules
      const { container } = render(<VideoPlayer src={mockUrl} />)
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-labels': { enabled: true }
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      })

      expect(results).toHaveNoViolations()
    })

    it('should meet color contrast requirements for all UI elements', async () => {
      // Test: 4.5:1 contrast ratio for normal text, 3:1 for large text
      const { container } = render(<VideoPlayer src={mockUrl} />)
      const buttons = container.querySelectorAll('button')

      buttons.forEach(button => {
        const styles = getComputedStyle(button)
        const contrastRatio = calculateContrastRatio(
          styles.color,
          styles.backgroundColor
        )

        const fontSize = parseInt(styles.fontSize)
        const minimumContrast = fontSize >= 18 ? 3 : 4.5

        expect(contrastRatio).toBeGreaterThanOrEqual(minimumContrast)
      })
    })
  })

  describe('Keyboard Navigation Testing', () => {
    it('should support complete keyboard operation', async () => {
      // Test: All functionality accessible via keyboard only
      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)

      // Tab through all controls
      await user.tab()
      expect(getByLabelText('Play video')).toHaveFocus()

      await user.tab()
      expect(getByLabelText('Volume control')).toHaveFocus()

      await user.tab()
      expect(getByLabelText('Video progress')).toHaveFocus()

      await user.tab()
      expect(getByLabelText('Quality settings')).toHaveFocus()

      await user.tab()
      expect(getByLabelText('Settings')).toHaveFocus()

      await user.tab()
      expect(getByLabelText('Fullscreen')).toHaveFocus()

      // Test keyboard activation
      await user.keyboard('[Enter]')
      // Verify appropriate action based on focused control
    })

    it('should support keyboard shortcuts for video control', async () => {
      // Test: Standard video player keyboard shortcuts
      const { container } = render(<VideoPlayer src={mockUrl} />)

      // Spacebar for play/pause
      fireEvent.keyDown(container, { key: ' ' })
      expect(mockVideoElement.play).toHaveBeenCalled()

      // F key for fullscreen
      fireEvent.keyDown(container, { key: 'f' })
      expect(mockVideoElement.requestFullscreen).toHaveBeenCalled()

      // Arrow keys for seeking
      fireEvent.keyDown(container, { key: 'ArrowRight' })
      expect(mockVideoElement.currentTime).toBe(10) // 10s forward

      fireEvent.keyDown(container, { key: 'ArrowLeft' })
      expect(mockVideoElement.currentTime).toBe(0) // 10s backward
    })

    it('should prevent keyboard traps in modal dialogs', async () => {
      // Test: Modal focus management and escape behavior
      const { getByLabelText, getByRole } = render(<VideoPlayer src={mockUrl} />)

      // Open settings modal
      await user.click(getByLabelText('Settings'))
      const modal = getByRole('dialog')
      expect(modal).toBeVisible()

      // Tab should stay within modal
      await user.tab()
      expect(document.activeElement).toBeWithin(modal)

      // Escape should close modal and return focus
      await user.keyboard('[Escape]')
      expect(modal).not.toBeVisible()
      expect(getByLabelText('Settings')).toHaveFocus()
    })
  })

  describe('Screen Reader Support Testing', () => {
    it('should provide proper ARIA labels for all controls', () => {
      // Test: ARIA labels are descriptive and contextual
      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)

      expect(getByLabelText('Play video')).toBeInTheDocument()
      expect(getByLabelText(/Volume.*\d+%/)).toBeInTheDocument() // Dynamic volume
      expect(getByLabelText(/Video progress.*\d+.*of.*\d+/)).toBeInTheDocument() // Dynamic time
      expect(getByLabelText(/Quality.*\d+p/)).toBeInTheDocument() // Current quality
    })

    it('should announce state changes to screen readers', async () => {
      // Test: Screen reader announcements for important state changes
      const mockAnnounce = jest.fn()
      jest.spyOn(accessibility, 'announceToScreenReader').mockImplementation(mockAnnounce)

      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)

      await user.click(getByLabelText('Play video'))
      expect(mockAnnounce).toHaveBeenCalledWith('Video playing')

      await user.click(getByLabelText('Pause video'))
      expect(mockAnnounce).toHaveBeenCalledWith('Video paused')

      // Test time announcements (every 30 seconds)
      jest.advanceTimersByTime(30000)
      expect(mockAnnounce).toHaveBeenCalledWith(expect.stringMatching(/\d+ minutes \d+ seconds/))
    })
  })

  describe('Caption Customization Testing', () => {
    it('should allow complete caption appearance customization', async () => {
      // Test: Caption settings affect display in real-time
      const { getByLabelText, getByTestId } = render(<VideoPlayer src={mockUrlWithCaptions} />)

      // Open caption settings
      await user.click(getByLabelText('Caption settings'))

      // Change font size
      await user.click(getByLabelText('Large font size'))
      const captions = getByTestId('video-captions')
      expect(captions).toHaveStyle('font-size: 24px')

      // Change color
      await user.click(getByLabelText('Yellow text color'))
      expect(captions).toHaveStyle('color: #ffff00')

      // Change position
      await user.click(getByLabelText('Top position'))
      expect(captions).toHaveStyle('top: 40px')
      expect(captions).not.toHaveStyle('bottom: 80px')
    })

    it('should persist caption preferences across sessions', async () => {
      // Test: Caption settings persistence using Redux Persist
      const { getByLabelText, rerender } = render(<VideoPlayer src={mockUrl} />)

      // Change caption settings
      await user.click(getByLabelText('Caption settings'))
      await user.click(getByLabelText('Large font size'))
      await user.click(getByLabelText('Yellow text color'))

      // Verify settings saved
      const savedSettings = JSON.parse(localStorage.getItem('persist:root') || '{}')
      expect(savedSettings.accessibility).toContain('fontSize":"large"')
      expect(savedSettings.accessibility).toContain('textColor":"#ffff00"')

      // Simulate page reload
      rerender(<VideoPlayer src={mockUrl} />)

      // Verify settings restored
      const captions = getByTestId('video-captions')
      expect(captions).toHaveStyle('font-size: 24px')
      expect(captions).toHaveStyle('color: #ffff00')
    })
  })
})
```

---

## **📊 Performance Test Specifications**

### **Core Web Vitals Testing Requirements**
```typescript
// Performance testing aligned with Google Core Web Vitals
describe('Performance Validation Testing', () => {
  describe('Core Web Vitals', () => {
    it('should achieve LCP (Largest Contentful Paint) < 2.5s', async () => {
      // Test: Video player loads within performance budget
      const mockPerformanceObserver = jest.fn()
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
        observe: jest.fn(),
        disconnect: jest.fn()
      }))

      render(<VideoPlayer src={mockUrl} />)

      // Simulate LCP measurement
      const lcpEntry = { startTime: 2200, element: 'video-player' }
      mockPerformanceObserver(lcpEntry)

      expect(lcpEntry.startTime).toBeLessThan(2500)
    })

    it('should maintain CLS (Cumulative Layout Shift) < 0.1', async () => {
      // Test: Layout stability during video loading and control interactions
      let clsValue = 0
      const mockLayoutShiftObserver = jest.fn((entries) => {
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
      })

      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)

      // Simulate user interactions that might cause layout shifts
      await user.click(getByLabelText('Settings'))
      await user.click(getByLabelText('Quality settings'))
      await user.click(getByLabelText('720p'))

      expect(clsValue).toBeLessThan(0.1)
    })

    it('should achieve FID (First Input Delay) < 100ms', async () => {
      // Test: Input responsiveness meets performance requirements
      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)
      const startTime = performance.now()

      await user.click(getByLabelText('Play video'))

      const inputDelay = performance.now() - startTime
      expect(inputDelay).toBeLessThan(100)
    })
  })

  describe('Video-Specific Performance', () => {
    it('should start video playback within 1 second', async () => {
      // Test: Time to first frame performance requirement
      const { getByLabelText } = render(<VideoPlayer src={mockUrl} />)
      const startTime = performance.now()

      await user.click(getByLabelText('Play video'))

      await waitFor(() => {
        expect(mockVideoElement.currentTime).toBeGreaterThan(0)
      })

      const timeToFirstFrame = performance.now() - startTime
      expect(timeToFirstFrame).toBeLessThan(1000)
    })

    it('should maintain smooth playback under network stress', async () => {
      // Test: Adaptive streaming under varying network conditions
      const mockNetworkThrottling = jest.fn()
      const { container } = render(<VideoPlayer src={mockUrl} />)

      // Simulate network degradation
      mockNetworkThrottling('slow-3g')

      // Verify quality adaptation
      await waitFor(() => {
        expect(mockHLSInstance.currentLevel).toBeLessThanOrEqual(2) // Lower quality
      })

      // Simulate network improvement
      mockNetworkThrottling('wifi')

      // Verify quality improvement
      await waitFor(() => {
        expect(mockHLSInstance.currentLevel).toBeGreaterThan(2) // Higher quality
      })
    })
  })
})
```

---

## **🔄 Integration Test Specifications**

### **Redux State Management Integration**
```typescript
// Redux integration testing with video player
describe('Redux Video Player Integration', () => {
  describe('Action Creator Testing', () => {
    it('should dispatch correct actions for video operations', async () => {
      // Test: Video operations create appropriate Redux actions
      const store = createMockStore()
      const { getByLabelText } = render(
        <Provider store={store}>
          <VideoPlayer src={mockUrl} />
        </Provider>
      )

      await user.click(getByLabelText('Play video'))

      const actions = store.getActions()
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'player/playVideo/pending'
        })
      )
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'player/playVideo/fulfilled',
          payload: expect.objectContaining({
            currentTime: expect.any(Number)
          })
        })
      )
    })

    it('should handle async thunk errors gracefully', async () => {
      // Test: Error handling in Redux async thunks
      const store = createMockStore()
      mockVideoElement.play.mockRejectedValue(new Error('Playback failed'))

      const { getByLabelText } = render(
        <Provider store={store}>
          <VideoPlayer src={mockUrl} />
        </Provider>
      )

      await user.click(getByLabelText('Play video'))

      await waitFor(() => {
        const state = store.getState()
        expect(state.player.error).toContain('Playback failed')
        expect(state.player.isPlaying).toBe(false)
      })
    })
  })

  describe('State Persistence Testing', () => {
    it('should persist user preferences across sessions', async () => {
      // Test: Redux Persist functionality for user settings
      const store = createMockStore()
      const { getByLabelText } = render(
        <Provider store={store}>
          <VideoPlayer src={mockUrl} />
        </Provider>
      )

      // Change volume
      const volumeSlider = getByLabelText('Volume control')
      fireEvent.change(volumeSlider, { target: { value: '0.7' } })

      // Change accessibility settings
      await user.click(getByLabelText('Settings'))
      await user.click(getByLabelText('High contrast mode'))

      // Verify persistence
      const persistedState = JSON.parse(localStorage.getItem('persist:root') || '{}')
      expect(persistedState.player).toContain('"volume":0.7')
      expect(persistedState.accessibility).toContain('"highContrast":true')
    })
  })
})
```

---

## **🎯 Test Automation Strategy**

### **CI/CD Testing Pipeline**
```typescript
interface TestAutomationStrategy {
  unitTests: {
    framework: 'Jest with Testing Library',
    execution: 'Every commit via GitHub Actions',
    coverage: '90% overall, 95% critical components',
    duration: '<2 minutes execution time',
    reporting: 'Coverage reports uploaded to Codecov'
  },

  integrationTests: {
    framework: 'Testing Library with MSW for API mocking',
    execution: 'Every pull request',
    coverage: 'All major component interactions',
    duration: '<5 minutes execution time',
    focus: 'Redux state flow, HLS integration, cross-component communication'
  },

  e2eTests: {
    framework: 'Playwright with multi-browser support',
    execution: 'Every deployment to staging',
    browsers: ['Chromium', 'Firefox', 'WebKit'],
    devices: ['Desktop', 'Mobile Chrome', 'Mobile Safari', 'Smart TV simulation'],
    duration: '<15 minutes execution time',
    scenarios: 'Critical user journeys across all platforms'
  },

  accessibilityTests: {
    automated: 'Axe-core integration in all test suites',
    manual: 'Daily screen reader testing during development',
    tools: ['NVDA (Windows)', 'VoiceOver (macOS)', 'TalkBack (Android)'],
    validation: 'Zero WCAG violations, complete assistive technology compatibility'
  },

  performanceTests: {
    lighthouse: 'Lighthouse CI for every deployment',
    coreWebVitals: 'Real user monitoring in production',
    videoMetrics: 'Custom performance tracking for streaming behavior',
    smartTVSimulation: 'Performance testing with hardware constraint simulation'
  }
}
```

### **Quality Gates and Success Criteria**
```typescript
interface QualityGates {
  deploymentBlocking: {
    testCoverage: '90% minimum (blocks deployment if lower)',
    accessibilityViolations: '0 WCAG violations (zero tolerance)',
    performanceRegression: '<5% degradation from baseline',
    functionalRegression: '100% critical user journeys must pass'
  },

  warningThresholds: {
    testCoverage: '<95% critical components triggers warning',
    performanceDegradation: '2-5% degradation triggers investigation',
    accessibilityWarnings: 'Any new accessibility issues flagged',
    crossBrowserInconsistency: 'Behavior differences between browsers'
  },

  successValidation: {
    readyForDemo: [
      'All tests passing with required coverage',
      'Zero accessibility violations',
      'Performance targets met on all platforms',
      'Cross-browser compatibility validated',
      'Smart TV navigation fully functional'
    ],
    readyForInterview: [
      'Demo runs flawlessly in presentation scenario',
      'All edge cases handled gracefully',
      'Performance monitoring active and reporting',
      'Documentation complete and professional'
    ]
  }
}
```

---

## **🤝 Product-QA Collaboration Framework**

### **Requirements to Test Case Translation**
```typescript
interface ProductQACollaboration {
  requirementMapping: {
    process: [
      '1. Jordan defines acceptance criteria using Given-When-Then format',
      '2. Sam translates acceptance criteria to specific test cases',
      '3. Sam identifies edge cases and error scenarios',
      '4. Jordan validates edge cases against business requirements',
      '5. Sam implements comprehensive test coverage',
      '6. Jordan validates test scenarios cover all user needs'
    ],

    qualityAssurance: [
      'Every product requirement has corresponding test coverage',
      'All acceptance criteria are directly testable',
      'Edge cases are identified and validated',
      'Performance requirements have measurable test criteria',
      'Accessibility requirements have both automated and manual validation'
    ]
  },

  testCaseReview: {
    frequency: 'Daily review of new test cases and requirements',
    participants: 'Jordan (product validation) + Sam (technical validation)',
    deliverable: 'Approved test specifications ready for implementation',
    criteria: 'Test cases fully cover product requirements with appropriate edge cases'
  }
}
```

---

**Sam's Testing Mission:** Ensure comprehensive test coverage for every product requirement defined by Jordan, with automated validation of 90% code coverage, zero accessibility violations, and complete user journey validation across all platforms. Every line of code should be tested, every user interaction validated, and every accessibility requirement verified through both automated and manual testing.

This collaborative approach between Product and QA ensures that our video player demo not only meets all functional requirements but exceeds enterprise quality standards that FOX Corporation expects from senior engineering candidates.