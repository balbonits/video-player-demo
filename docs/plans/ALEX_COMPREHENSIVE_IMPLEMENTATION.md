# 🏗️ Alex (Engineer) - Comprehensive Implementation Plans

**Lead Engineer:** Alex
**Collaboration:** All personas contributing to technical specifications
**Purpose:** Complete implementation roadmap for 1-2 hour video player development
**Priority Order:** Environment → Player → Core Features → Analytics → Accessibility → Nice-to-Haves

---

## **A) Environment & Platforms Implementation Plan**

### **🌐 Environment Setup Strategy**
**Duration:** 30 minutes (Day 2 morning)
**Collaboration:** Casey (DevOps), Morgan (coordination)

#### **Monorepo Architecture Implementation**
```bash
# Project initialization sequence
npx create-turbo@latest . --name video-player-demo
cd apps/

# Primary: Next.js Pages Router (fast development)
npx create-next-app@latest web-player-pages --typescript --tailwind --eslint --app false --src-dir

# Secondary: Next.js App Router (mastery showcase)
npx create-next-app@latest web-player-app --typescript --tailwind --eslint --app true --src-dir

# Initialize shared packages
mkdir -p packages/{player-core,ui-components,shared-utils}
```

#### **TypeScript Strict Configuration**
```json
// tsconfig.json - Enterprise-grade configuration
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### **Platform-Specific Setup**
```typescript
interface PlatformImplementation {
  web: {
    primary: 'Next.js Pages Router with HLS.js integration',
    setup: 'Standard React development environment',
    testing: 'Jest + Testing Library + Playwright',
    deployment: 'Vercel with performance monitoring'
  },

  mobile: {
    iOS: {
      framework: 'SwiftUI + AVFoundation',
      setup: 'Xcode project with video player templates',
      testing: 'XCTest + XCUITest for accessibility',
      deployment: 'TestFlight for demonstration'
    },
    android: {
      framework: 'Jetpack Compose + ExoPlayer',
      setup: 'Android Studio with Kotlin configuration',
      testing: 'JUnit + Espresso with accessibility validation',
      deployment: 'APK build for sideloading'
    }
  },

  smartTV: {
    roku: {
      framework: 'BrightScript + SceneGraph XML',
      setup: 'Roku Developer SDK with video node',
      testing: 'Roku unit testing framework',
      deployment: 'Developer dashboard side-loading'
    },
    tizen: {
      framework: 'HTML5/CSS/JS + Tizen Web API',
      setup: 'Tizen Studio with web app template',
      testing: 'Browser-based testing with TV simulation',
      deployment: 'Samsung developer mode'
    },
    vizio: {
      framework: 'SmartCast SDK + HTML5',
      setup: 'Vizio developer environment',
      testing: 'SmartCast testing framework',
      deployment: 'VizioOS developer deployment'
    }
  }
}
```

**Sam (QA) Input:** *"Alex, for the environment setup, I need Jest configured with 90% coverage thresholds, Playwright for cross-browser testing, and Axe-core for accessibility validation from day one."*

**Casey (Release) Input:** *"Alex, I'll handle the CI/CD pipeline configuration, but I need the build scripts and environment variables properly structured in your setup."*

---

## **B) Video Player Core Implementation Plan**

### **🎬 HLS Video Player Architecture**
**Duration:** 45 minutes (Day 2 core implementation)
**Collaboration:** Riley (UX wireframes), Sam (testing requirements)

#### **Core Component Structure**
```typescript
// Primary component hierarchy - built from scratch
interface VideoPlayerArchitecture {
  VideoPlayer: {
    responsibility: 'Main container, HLS integration, Redux connection',
    dependencies: ['HLS.js', 'React 18', 'Redux Toolkit'],
    stateManagement: 'Connected to playerSlice, videoSlice, uiSlice',
    accessibility: 'Root ARIA application role, keyboard event handling'
  },

  VideoContainer: {
    responsibility: 'Video element wrapper, HLS initialization, error handling',
    implementation: `
      const VideoContainer: React.FC<VideoContainerProps> = ({ src, onReady }) => {
        const videoRef = useRef<HTMLVideoElement>(null)
        const hlsRef = useRef<Hls | null>(null)
        const dispatch = useAppDispatch()

        useEffect(() => {
          if (videoRef.current && src) {
            initializeHLS(videoRef.current, src)
          }
        }, [src])

        const initializeHLS = useCallback((video: HTMLVideoElement, url: string) => {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,           // Smart TV optimization
              lowLatencyMode: false,        // Compatibility over latency
              backBufferLength: 90,         // 90 second back buffer
              maxBufferLength: 300,         // 5 minute ahead buffer
              startLevel: -1,               // Auto quality detection
              capLevelToPlayerSize: true    // Match resolution to player
            })

            hls.loadSource(url)
            hls.attachMedia(video)
            hlsRef.current = hls

            // Quality levels for Redux store
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              const qualities = hls.levels.map(level => \`\${level.height}p\`)
              dispatch(setAvailableQualities(qualities))
            })

            // Error handling
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                dispatch(setPlayerError(\`HLS Error: \${data.details}\`))
              }
            })

          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            video.src = url
          } else {
            // Fallback to MP4 if available
            dispatch(setPlayerError('HLS not supported, MP4 fallback needed'))
          }
        }, [dispatch])

        return (
          <div className="video-container">
            <video
              ref={videoRef}
              className="video-element"
              preload="metadata"
              crossOrigin="anonymous"
              onTimeUpdate={() => dispatch(updateCurrentTime(videoRef.current?.currentTime || 0))}
              onDurationChange={() => dispatch(updateDuration(videoRef.current?.duration || 0))}
              onPlay={() => dispatch(setPlaybackState({ isPlaying: true, isPaused: false }))}
              onPause={() => dispatch(setPlaybackState({ isPlaying: false, isPaused: true }))}
              onWaiting={() => dispatch(setBuffering(true))}
              onCanPlay={() => dispatch(setBuffering(false))}
            />
          </div>
        )
      }
    `
  },

  PlayerControls: {
    responsibility: 'Control bar, user interactions, Smart TV navigation',
    implementation: 'Redux-connected controls with accessibility and keyboard support'
  }
}
```

#### **HLS.js Integration Strategy (No JW Player Dependencies)**
```typescript
// Direct HLS.js implementation - no paid services
interface HLSImplementationPlan {
  library: 'HLS.js (open source, same foundation as JW Player)',
  advantages: [
    'Complete control over video player behavior',
    'No subscription costs (vs JW Player)',
    'Custom accessibility implementation',
    'Smart TV performance optimization',
    'Full Redux integration'
  ],

  configurationStrategy: {
    smartTV: {
      enableWorker: true,         // Offload processing
      lowLatencyMode: false,      // Prioritize compatibility
      maxBufferLength: 300,       // Conservative buffering for TV memory
      backBufferLength: 90,       // Reasonable back buffer
      capLevelToPlayerSize: true  // Optimize quality for display
    },

    mobile: {
      enableWorker: true,
      lowLatencyMode: true,       // Better mobile experience
      maxBufferLength: 60,        // Lower buffer for mobile memory
      startLevel: 2,              // Start with medium quality
      capLevelToPlayerSize: true
    },

    desktop: {
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 600,       // Larger buffer for desktop
      backBufferLength: 180,      // Generous back buffer
      startLevel: -1              // Auto detect best quality
    }
  },

  foxContext: 'Demonstrates understanding of FOX\'s JW Player foundation while showing modern React implementation capabilities'
}
```

**Riley (UX) Input:** *"Alex, I've created wireframes showing the video player layout. The controls need to support both mouse and D-pad navigation, with clear focus indicators for Smart TV."*

**Sam (QA) Input:** *"Alex, every HLS event and error scenario needs comprehensive test coverage. I'll need mock HLS instances and error simulation for the 90% coverage requirement."*

---

## **C) Core Features Implementation Plan**

### **🎮 Core Feature Priority Implementation**
**Duration:** 30 minutes (Day 2 afternoon)
**Priority Order:** HLS Streaming → Smart TV Navigation → Accessibility → Performance

#### **1. HLS Adaptive Streaming (Priority 1)**
```typescript
// HLS streaming implementation with quality control
interface HLSStreamingFeatures {
  adaptiveQuality: {
    implementation: `
      const useHLSQuality = () => {
        const dispatch = useAppDispatch()
        const { hlsInstance, availableQualities, currentQuality } = useAppSelector(state => state.player)

        const changeQuality = useCallback((quality: string) => {
          if (hlsInstance) {
            if (quality === 'auto') {
              hlsInstance.currentLevel = -1  // Auto quality
            } else {
              const levelIndex = hlsInstance.levels.findIndex(
                level => \`\${level.height}p\` === quality
              )
              if (levelIndex !== -1) {
                hlsInstance.currentLevel = levelIndex
              }
            }
            dispatch(setCurrentQuality(quality))
          }
        }, [hlsInstance, dispatch])

        return { changeQuality, availableQualities, currentQuality }
      }
    `,
    testing: 'Mock HLS levels, test quality switching, validate UI updates'
  },

  bufferingStrategy: {
    smartTV: 'Conservative buffering for TV memory constraints',
    mobile: 'Aggressive buffering for mobile networks',
    desktop: 'Optimal buffering for broadband connections'
  },

  errorHandling: {
    networkErrors: 'Automatic retry with exponential backoff',
    manifestErrors: 'Fallback to MP4 if available',
    decodingErrors: 'Quality downgrade and retry',
    fatalErrors: 'User-friendly error message with retry option'
  }
}
```

#### **2. Smart TV D-pad Navigation (Priority 2)**
```typescript
// Smart TV navigation implementation
interface SmartTVNavigation {
  spatialNavigation: {
    implementation: `
      const useSmartTVNavigation = () => {
        const dispatch = useAppDispatch()
        const { focusedControl, navigationMode } = useAppSelector(state => state.ui)

        const controlMatrix = [
          ['play-pause', 'volume', 'progress', 'quality', 'settings', 'fullscreen']
        ]

        const handleDPadNavigation = useCallback((event: KeyboardEvent) => {
          if (navigationMode === 'remote') {
            event.preventDefault()

            switch (event.key) {
              case 'ArrowRight':
                dispatch(focusNextControl())
                break
              case 'ArrowLeft':
                dispatch(focusPreviousControl())
                break
              case 'ArrowUp':
                dispatch(focusVideoArea())
                break
              case 'ArrowDown':
                dispatch(focusSettingsMenu())
                break
              case 'Enter':
              case ' ':
                dispatch(activateFocusedControl())
                break
            }
          }
        }, [navigationMode, dispatch])

        return { handleDPadNavigation, focusedControl }
      }
    `,
    testing: 'Simulate D-pad input, validate focus management, test spatial logic'
  },

  focusManagement: {
    indicators: '4px blue outline + scale(1.1) transform for TV viewing',
    persistence: 'Remember last focused control when returning to player',
    trapping: 'Focus trap in settings modal, escape to player',
    announcements: 'Screen reader announcements for focus changes'
  }
}
```

**Jordan (Product) Input:** *"Alex, the Smart TV navigation needs to feel intuitive for users coming from Netflix or YouTube. Research their D-pad patterns and ensure our implementation feels familiar."*

**Riley (UX) Input:** *"Alex, I'm providing wireframes that show the exact focus flow and visual indicators. The TV buttons need to be 64px minimum with clear visual hierarchy."*

#### **3. Video Controls Implementation**
```typescript
// Standard video controls with platform optimization
interface VideoControlsImplementation {
  playPauseButton: {
    component: `
      const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
        isPlaying,
        onToggle,
        size = 'desktop',
        focused = false
      }) => {
        const buttonRef = useRef<HTMLButtonElement>(null)
        const { announceToScreenReader } = useAccessibility()

        const handleClick = useCallback(() => {
          onToggle()
          announceToScreenReader(isPlaying ? 'Video paused' : 'Video playing')
        }, [isPlaying, onToggle, announceToScreenReader])

        // Auto-focus for Smart TV
        useEffect(() => {
          if (focused && buttonRef.current) {
            buttonRef.current.focus()
          }
        }, [focused])

        return (
          <button
            ref={buttonRef}
            className={\`
              play-pause-button
              \${size === 'tv' ? 'play-pause-button--tv' : ''}
              \${focused ? 'play-pause-button--focused' : ''}
            \`}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleClick()
              }
            }}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={isPlaying}
            type="button"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        )
      }
    `,
    styling: 'Platform-specific sizing, focus indicators, hover states',
    testing: 'Click handlers, keyboard activation, state changes, accessibility'
  },

  progressBar: {
    implementation: 'Custom progress bar with seek functionality and Smart TV arrow key support',
    features: ['Click to seek', 'Keyboard arrow keys for fine control', 'Buffer display', 'Hover thumbnail preview'],
    accessibility: 'ARIA slider role, value announcements, keyboard control'
  },

  volumeControl: {
    implementation: 'Volume slider with mute toggle and Smart TV up/down arrow support',
    features: ['Click/drag volume adjustment', 'Mute toggle', 'Keyboard control', 'Smart TV arrow keys'],
    persistence: 'Remember volume level across sessions'
  }
}
```

**Sam (QA) Input:** *"Alex, every control needs comprehensive event handler testing. I need proper mocking for video events and Redux action validation."*

---

## **D) Metrics & Analytics Integration Plan**

### **📊 Analytics Implementation Strategy**
**Duration:** 15 minutes (Day 2 integration)
**Collaboration:** Casey (deployment), Jordan (business metrics)

#### **Performance Metrics Collection**
```typescript
// Comprehensive analytics for video player performance
interface AnalyticsImplementation {
  coreWebVitals: {
    implementation: `
      import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

      const usePerformanceMonitoring = () => {
        const dispatch = useAppDispatch()

        useEffect(() => {
          // Track Core Web Vitals
          getCLS((metric) => {
            dispatch(recordMetric({ name: 'CLS', value: metric.value, target: 0.1 }))
            gtag('event', 'CLS', { value: Math.round(metric.value * 1000) })
          })

          getFID((metric) => {
            dispatch(recordMetric({ name: 'FID', value: metric.value, target: 100 }))
            gtag('event', 'FID', { value: Math.round(metric.value) })
          })

          getLCP((metric) => {
            dispatch(recordMetric({ name: 'LCP', value: metric.value, target: 2500 }))
            gtag('event', 'LCP', { value: Math.round(metric.value) })
          })
        }, [dispatch])
      }
    `,
    targets: 'LCP < 2.5s, FID < 100ms, CLS < 0.1',
    alerting: 'Performance degradation tracking'
  },

  videoSpecificMetrics: {
    implementation: `
      const useVideoAnalytics = () => {
        const dispatch = useAppDispatch()

        const trackVideoEvent = useCallback((event: string, data: any) => {
          // Custom video metrics
          const metrics = {
            timeToFirstFrame: 'Time from play click to first video frame',
            rebufferingRatio: 'Percentage of playback time spent buffering',
            qualitySwitches: 'Number of quality changes per session',
            errorRate: 'Frequency of playback errors',
            completionRate: 'Percentage of video watched'
          }

          dispatch(recordVideoMetric({ event, data, timestamp: Date.now() }))

          // Send to Google Analytics
          gtag('event', event, {
            custom_parameter_1: data.videoTitle || 'Demo Video',
            custom_parameter_2: data.quality || 'auto',
            custom_parameter_3: data.platform || 'web'
          })
        }, [dispatch])

        return { trackVideoEvent }
      }
    `,
    events: ['play', 'pause', 'seek', 'quality_change', 'error', 'completion'],
    storage: 'Local storage for session persistence, analytics for aggregation'
  },

  smartTVMetrics: {
    implementation: 'TV-specific performance tracking with memory and CPU monitoring',
    metrics: ['Memory usage', 'Input response time', 'Navigation efficiency', 'D-pad interaction patterns'],
    optimization: 'Real-time performance adjustment based on TV hardware capabilities'
  }
}
```

**Jordan (Product) Input:** *"Alex, I need user engagement metrics: video start rate, completion rate, feature usage, and cross-platform usage patterns for portfolio demonstration."*

**Casey (Release) Input:** *"Alex, integrate the analytics with our monitoring dashboard. I need real-time performance data and error tracking for production deployment."*

---

## **E) Accessibility Features Implementation Plan**

### **♿ WCAG 2.1 AA Compliance Implementation**
**Duration:** 30 minutes (Day 2 accessibility integration)
**Collaboration:** Riley (design compliance), Sam (testing validation)

#### **Comprehensive Accessibility Architecture**
```typescript
// Complete accessibility implementation - beyond JW Player capabilities
interface AccessibilityImplementation {
  keyboardNavigation: {
    implementation: `
      const useKeyboardNavigation = () => {
        const dispatch = useAppDispatch()
        const { focusedControl } = useAppSelector(state => state.ui)

        const handleKeyboardEvents = useCallback((event: KeyboardEvent) => {
          switch (event.key) {
            case 'Tab':
              // Standard tab navigation through controls
              // Let browser handle default tab behavior
              break

            case 'ArrowRight':
            case 'ArrowLeft':
              if (focusedControl === 'progress') {
                // Seek control with arrow keys
                event.preventDefault()
                const seekDirection = event.key === 'ArrowRight' ? 10 : -10
                dispatch(seekRelative(seekDirection))
              } else {
                // Navigate between controls (Smart TV)
                event.preventDefault()
                const direction = event.key === 'ArrowRight' ? 'next' : 'previous'
                dispatch(navigateControls(direction))
              }
              break

            case 'ArrowUp':
            case 'ArrowDown':
              if (focusedControl === 'volume') {
                // Volume control with arrow keys
                event.preventDefault()
                const volumeDelta = event.key === 'ArrowUp' ? 0.1 : -0.1
                dispatch(adjustVolume(volumeDelta))
              }
              break

            case ' ':
            case 'Enter':
              event.preventDefault()
              if (focusedControl === 'play-pause' || !focusedControl) {
                dispatch(togglePlayback())
              } else {
                dispatch(activateFocusedControl())
              }
              break

            case 'f':
            case 'F':
              event.preventDefault()
              dispatch(toggleFullscreen())
              break

            case 'Escape':
              event.preventDefault()
              dispatch(exitFullscreen())
              dispatch(closeSettings())
              break
          }
        }, [focusedControl, dispatch])

        return { handleKeyboardEvents }
      }
    `,
    testing: 'Comprehensive keyboard navigation testing, focus management validation'
  },

  screenReaderSupport: {
    implementation: `
      const useScreenReaderSupport = () => {
        const announceToScreenReader = useCallback((message: string) => {
          // Create live region for screen reader announcements
          const announcement = document.createElement('div')
          announcement.setAttribute('aria-live', 'polite')
          announcement.setAttribute('aria-atomic', 'true')
          announcement.className = 'sr-only'
          announcement.textContent = message

          document.body.appendChild(announcement)

          // Remove after announcement
          setTimeout(() => {
            document.body.removeChild(announcement)
          }, 1000)
        }, [])

        const announceVideoState = useCallback((isPlaying: boolean, currentTime: number, duration: number) => {
          const timeMessage = \`\${Math.floor(currentTime / 60)} minutes \${Math.floor(currentTime % 60)} seconds of \${Math.floor(duration / 60)} minutes\`
          const stateMessage = isPlaying ? 'Playing' : 'Paused'
          announceToScreenReader(\`\${stateMessage}. \${timeMessage}\`)
        }, [announceToScreenReader])

        return { announceToScreenReader, announceVideoState }
      }
    `,
    ariaLabels: 'Dynamic ARIA labels for all controls with current state',
    liveRegions: 'Announce playback state changes, time updates, errors'
  },

  captionCustomization: {
    implementation: `
      interface CaptionSettings {
        fontSize: 'small' | 'medium' | 'large' | 'extra-large'
        fontFamily: 'arial' | 'helvetica' | 'times' | 'courier'
        textColor: string  // Hex color code
        backgroundColor: string  // Hex color or 'transparent'
        opacity: number  // 0-1
        position: 'bottom' | 'top' | 'center'
      }

      const useCaptionCustomization = () => {
        const dispatch = useAppDispatch()
        const settings = useAppSelector(state => state.accessibility.captionSettings)

        const updateCaptionStyle = useCallback((newSettings: Partial<CaptionSettings>) => {
          dispatch(updateCaptionSettings(newSettings))

          // Apply styles to caption display
          const captionElement = document.querySelector('.video-captions')
          if (captionElement) {
            applyCaptionStyles(captionElement, { ...settings, ...newSettings })
          }
        }, [settings, dispatch])

        return { settings, updateCaptionStyle }
      }
    `,
    customization: 'Font size, color, background, position, opacity',
    persistence: 'Save user preferences in localStorage and Redux persist'
  }
}
```

**Riley (UX) Input:** *"Alex, I've designed the caption customization interface. Users need real-time preview of their caption changes, and all color combinations must meet 4.5:1 contrast ratios."*

**Sam (QA) Input:** *"Alex, accessibility testing needs to cover screen reader compatibility with NVDA, VoiceOver, and JAWS. Every ARIA label and announcement needs validation."*

---

## **F) "Nice-to-Have" Features Implementation Plan**

### **✨ Enhancement Features (Time Permitting)**
**Duration:** Variable (implement if time allows)
**Priority:** Seek thumbnails → Logo branding → Social sharing → Timestamp linking → Theater mode → PiP

#### **1. Seek Bar Thumbnails**
```typescript
// Seek bar thumbnail preview implementation
interface SeekThumbnailFeatures {
  implementation: `
    const useSeekThumbnails = () => {
      const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
      const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, y: 0 })

      const generateThumbnail = useCallback(async (time: number) => {
        // For demo: use placeholder service
        const thumbnailUrl = \`https://via.placeholder.com/160x90/333/fff?text=\${Math.floor(time / 60)}:\${Math.floor(time % 60).toString().padStart(2, '0')}\`
        setThumbnailUrl(thumbnailUrl)
      }, [])

      const showThumbnail = useCallback((event: MouseEvent, time: number) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setThumbnailPosition({
          x: event.clientX - rect.left,
          y: rect.top - 100
        })
        generateThumbnail(time)
      }, [generateThumbnail])

      return { thumbnailUrl, thumbnailPosition, showThumbnail }
    }
  `,
  testing: 'Thumbnail generation, positioning accuracy, hover behavior'
}
```

#### **2. Logo Branding & Theme Toggle**
```typescript
// Branding and theme customization
interface BrandingFeatures {
  logoIntegration: {
    implementation: 'Configurable logo overlay with FOX-inspired branding toggle',
    positioning: 'Top-left corner with fade-in animation',
    accessibility: 'Proper alt text and screen reader compatibility'
  },

  themeToggle: {
    implementation: `
      const useThemeToggle = () => {
        const [theme, setTheme] = useState<'light' | 'dark' | 'fox'>('dark')

        const toggleTheme = useCallback(() => {
          const themes = ['dark', 'light', 'fox']
          const currentIndex = themes.indexOf(theme)
          const nextTheme = themes[(currentIndex + 1) % themes.length]
          setTheme(nextTheme)
          document.documentElement.setAttribute('data-theme', nextTheme)
        }, [theme])

        return { theme, toggleTheme }
      }
    `,
    themes: 'Dark (default), Light, FOX-inspired colors',
    persistence: 'Theme preference saved in user settings'
  }
}
```

#### **3. Social Media Sharing**
```typescript
// Social sharing with video timestamp
interface SocialSharingFeatures {
  timestampSharing: {
    implementation: `
      const useSocialSharing = () => {
        const { currentTime } = useAppSelector(state => state.player)

        const shareVideo = useCallback((platform: 'twitter' | 'linkedin' | 'email') => {
          const timestamp = Math.floor(currentTime)
          const shareUrl = \`\${window.location.href}?t=\${timestamp}\`
          const shareText = 'Check out this video player demo showcasing modern streaming technology'

          const shareUrls = {
            twitter: \`https://twitter.com/intent/tweet?url=\${encodeURIComponent(shareUrl)}&text=\${encodeURIComponent(shareText)}\`,
            linkedin: \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(shareUrl)}\`,
            email: \`mailto:?subject=Video Player Demo&body=\${encodeURIComponent(shareText + ' ' + shareUrl)}\`
          }

          window.open(shareUrls[platform], '_blank', 'width=600,height=400')
        }, [currentTime])

        return { shareVideo }
      }
    `,
    features: 'Twitter, LinkedIn, email sharing with timestamp links',
    analytics: 'Track sharing events and referral traffic'
  }
}
```

#### **4. Picture-in-Picture Mode**
```typescript
// Picture-in-Picture implementation
interface PiPFeatures {
  implementation: `
    const usePictureInPicture = () => {
      const [isPiPSupported, setIsPiPSupported] = useState(false)
      const [isPiPActive, setIsPiPActive] = useState(false)

      useEffect(() => {
        setIsPiPSupported('pictureInPictureEnabled' in document)
      }, [])

      const togglePiP = useCallback(async () => {
        const video = document.querySelector('video')
        if (!video || !isPiPSupported) return

        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture()
            setIsPiPActive(false)
          } else {
            await video.requestPictureInPicture()
            setIsPiPActive(true)
          }
        } catch (error) {
          console.error('PiP error:', error)
        }
      }, [isPiPSupported])

      return { isPiPSupported, isPiPActive, togglePiP }
    }
  `,
  browser_support: 'Chrome, Safari, Edge (not Firefox)',
  fallback: 'Hide PiP button on unsupported browsers'
}
```

**Jordan (Product) Input:** *"Alex, analytics should track user engagement patterns, feature usage, and cross-platform behavior. This data will be valuable for the portfolio presentation."*

**Casey (Release) Input:** *"Alex, integrate the analytics with our monitoring dashboard. I need real-time metrics and performance alerts for production deployment."*

---

## **🔧 Implementation Timeline Breakdown**

### **Day 2 Schedule (Total: 2 hours maximum)**

#### **Hour 1: Core Foundation (60 minutes)**
```typescript
const hour1Implementation = {
  '0-20min': {
    task: 'Project setup and Next.js initialization',
    owner: 'Alex with Casey (DevOps support)',
    deliverable: 'Working Next.js app with TypeScript strict',
    learning: 'John learns Next.js project structure and configuration'
  },

  '20-40min': {
    task: 'Redux store setup and basic video component',
    owner: 'Alex with Sam (testing setup)',
    deliverable: 'Redux store with Action Creators, basic VideoPlayer component',
    learning: 'John learns Redux Toolkit patterns and React integration'
  },

  '40-60min': {
    task: 'HLS.js integration and basic controls',
    owner: 'Alex with Riley (UX implementation)',
    deliverable: 'Working HLS video streaming with play/pause controls',
    learning: 'John learns video streaming integration and HLS concepts'
  }
}
```

#### **Hour 2: Polish & Features (60 minutes)**
```typescript
const hour2Implementation = {
  '60-80min': {
    task: 'Smart TV navigation and accessibility',
    owner: 'Alex with Riley (UX) and Sam (QA)',
    deliverable: 'D-pad navigation, WCAG compliance, keyboard support',
    learning: 'John learns accessibility implementation and Smart TV optimization'
  },

  '80-100min': {
    task: 'Testing, analytics, and deployment',
    owner: 'Alex with Sam (testing) and Casey (deployment)',
    deliverable: '90% test coverage, analytics integration, staging deployment',
    learning: 'John learns testing strategy and deployment process'
  },

  '100-120min': {
    task: 'Final polish and demo preparation',
    owner: 'All personas coordination',
    deliverable: 'Production-ready demo, documentation, interview preparation',
    learning: 'John reviews complete implementation and prepares for FOX presentation'
  }
}
```

---

## **🛠️ Technical Dependencies & Prerequisites**

### **Required Packages**
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@reduxjs/toolkit": "1.9.7",
    "react-redux": "8.1.3",
    "redux-persist": "6.0.0",
    "hls.js": "1.4.12",
    "tailwindcss": "3.3.6"
  },
  "devDependencies": {
    "@types/node": "20.8.0",
    "@types/react": "18.2.25",
    "@types/react-dom": "18.2.11",
    "typescript": "5.2.2",
    "eslint": "8.51.0",
    "eslint-config-next": "14.0.0",
    "@testing-library/react": "13.4.0",
    "@testing-library/jest-dom": "6.1.4",
    "jest": "29.7.0",
    "jest-environment-jsdom": "29.7.0",
    "@playwright/test": "1.39.0",
    "@axe-core/playwright": "4.8.2",
    "web-vitals": "3.5.0"
  }
}
```

### **File Structure Template**
```
apps/web-player-pages/
├── src/
│   ├── components/
│   │   ├── VideoPlayer/
│   │   │   ├── index.tsx              # Main export
│   │   │   ├── VideoPlayer.tsx        # Main component
│   │   │   ├── VideoContainer.tsx     # HLS integration
│   │   │   ├── PlayerControls.tsx     # Control bar
│   │   │   ├── PlayPauseButton.tsx    # Individual controls
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── VolumeControl.tsx
│   │   │   ├── QualitySelector.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── FullscreenButton.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Navigation.tsx
│   ├── hooks/
│   │   ├── useVideoPlayer.ts         # Main video hook
│   │   ├── useHLS.ts                 # HLS integration
│   │   ├── useAccessibility.ts       # A11y features
│   │   ├── useSmartTV.ts             # TV navigation
│   │   └── useAnalytics.ts           # Performance tracking
│   ├── lib/
│   │   ├── store/
│   │   │   ├── index.ts              # Store configuration
│   │   │   └── slices/
│   │   │       ├── playerSlice.ts    # Video player state
│   │   │       ├── videoSlice.ts     # Video content state
│   │   │       ├── uiSlice.ts        # Interface state
│   │   │       ├── accessibilitySlice.ts # A11y settings
│   │   │       └── analyticsSlice.ts # Metrics state
│   │   ├── utils/
│   │   └── constants/
│   └── types/
│       ├── player.ts                 # Video player types
│       ├── accessibility.ts          # A11y types
│       └── analytics.ts              # Analytics types
```

---

## **🤝 Cross-Persona Integration Points**

### **Riley → Alex: Design to Code Translation**
- **Wireframes:** Riley provides interactive HTML wireframes
- **Specifications:** Component props, styling, accessibility requirements
- **Design Tokens:** CSS variables and Tailwind configuration
- **Cross-Platform:** Platform-specific design adaptations

### **Sam → Alex: Testing Integration**
- **Test Requirements:** 90% coverage specifications for each component
- **Mock Strategies:** HLS.js mocking, video element simulation
- **Accessibility Testing:** Axe-core integration, manual testing protocols
- **Performance Testing:** Core Web Vitals validation, Smart TV constraints

### **Jordan → Alex: Product Requirements**
- **Feature Specifications:** User stories translated to technical requirements
- **Content Integration:** Video sources, caption files, test scenarios
- **Platform Requirements:** Cross-platform feature matrix and constraints
- **Business Logic:** User preference handling, analytics requirements

### **Casey → Alex: DevOps Integration**
- **Build Configuration:** Optimization for production deployment
- **Environment Variables:** Secure configuration management
- **Performance Monitoring:** Metrics collection and alerting integration
- **Security Requirements:** CSP configuration, vulnerability prevention

---

**Alex's Implementation Mission:** Deliver a professional, accessible, high-performance HLS video player in 1-2 hours by leveraging comprehensive Day 1 setup, team collaboration, and enterprise development practices that demonstrate technical expertise relevant to FOX Corporation's streaming video requirements.

This implementation plan ensures rapid development while maintaining the quality standards that will impress the FOX hiring team and showcase John's technical capabilities.