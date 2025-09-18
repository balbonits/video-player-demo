# 📋 Technical Documentation

## Architecture Overview

### **Dual Implementation Strategy**

This project implements two parallel Next.js applications to demonstrate both proven delivery capabilities and cutting-edge expertise:

#### **Primary Implementation: Pages Router**
- **Purpose:** Fast development, proven performance, working demo
- **Path:** `apps/web-player-pages/`
- **Performance:** 14ms TTFB, fast hot reload
- **Status:** Production-ready demonstration

#### **Secondary Implementation: App Router**
- **Purpose:** Next.js mastery showcase, modern patterns
- **Path:** `apps/web-player-app/`
- **Performance:** Optimized with streaming, Server Components
- **Status:** Technical demonstration

### **Technology Stack**

#### **Core Web Technologies**
```typescript
// Frontend Framework
Next.js 14.x (Pages + App Router)
React 18.x
TypeScript 5.x (strict mode)

// State Management
Redux Toolkit 2.x
Redux Persist 6.x
React-Redux 9.x

// Video Streaming
HLS.js 1.5.x
Video.js (fallback)
MSE/EME APIs

// Styling & UI
Tailwind CSS 3.x
Headless UI
Radix UI (accessible components)

// Testing
Jest 29.x
Testing Library (React/DOM)
Playwright (E2E)
Axe-core (accessibility)
```

#### **Mobile Technologies**
```swift
// iOS Stack
SwiftUI (iOS 16+)
AVFoundation
AVPlayerViewController
Combine
XCTest / XCUITest

// Android Stack
Kotlin 1.9.x
Jetpack Compose
ExoPlayer 2.19.x
Coroutines
JUnit 5 / Espresso
```

#### **Smart TV Technologies**
```javascript
// Roku Platform
BrightScript
SceneGraph XML
Roku Video Node

// Samsung Tizen
Tizen Web API 7.0+
HTML5 Video + MSE
Tizen TV Extensions

// Vizio SmartCast
SmartCast SDK 3.0+
HTML5/JavaScript
DIAL Protocol
```

## **Performance Architecture**

### **Performance Targets**
```typescript
interface PerformanceTargets {
  web: {
    initialLoad: '< 3000ms',    // Smart TV constraint
    videoStart: '< 1000ms',     // Time to first frame
    memoryUsage: '< 150MB',     // TV memory limits
    bundleSize: '< 500KB'       // Initial bundle
  },
  mobile: {
    appLaunch: '< 2000ms',      // iOS: 2s, Android: 3s
    videoLoad: '< 1500ms',      // Mobile network consideration
    batteryDrain: '< 5%/hour',  // Background playback
    memoryUsage: '< 200MB'      // Mobile constraints
  },
  smartTV: {
    bootTime: '< 5000ms',       // TV app launch
    navigationResponse: '< 200ms', // Remote control lag
    videoBuffering: '< 2000ms', // Network buffering
    cpuUsage: '< 30%'          // TV CPU constraints
  }
}
```

### **Optimization Strategies**

#### **Bundle Optimization**
```typescript
// Code Splitting Strategy
const LazyVideoPlayer = lazy(() => import('./VideoPlayer'))
const LazyAdvancedControls = lazy(() => import('./AdvancedControls'))

// Next.js Optimization
export const config = {
  runtime: 'edge',              // Edge runtime for API routes
  regions: ['iad1', 'sfo1'],   // Geographic distribution
}

// Bundle Analysis
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
```

#### **Video Optimization**
```typescript
// HLS Configuration for Performance
const hlsConfig = {
  enableWorker: true,           // Offload processing
  lowLatencyMode: true,         // Reduce delay
  backBufferLength: 90,         // Smart buffering
  maxBufferLength: 300,         // Maximum buffer
  maxMaxBufferLength: 600,      // Peak buffer size
  startLevel: -1,               // Auto quality start
  capLevelToPlayerSize: true    // Match player resolution
}
```

## **State Management Architecture**

### **Redux Store Structure**
```typescript
interface RootState {
  player: PlayerState          // Video playback state
  video: VideoState           // Content and metadata
  ui: UIState                 // Interface and navigation
  accessibility: A11yState   // Accessibility preferences
  analytics: AnalyticsState   // Performance tracking
  platform: PlatformState    // Device-specific state
}
```

### **Action Creators Pattern**
```typescript
// Async Action Creators (Thunks)
export const playVideo = createAsyncThunk(
  'player/play',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState
    const videoElement = getVideoElement()

    try {
      await videoElement.play()
      dispatch(trackVideoEvent({ event: 'play', timestamp: Date.now() }))
      return { currentTime: videoElement.currentTime }
    } catch (error) {
      throw new Error(`Playback failed: ${error.message}`)
    }
  }
)

// Synchronous Action Creators
export const { setVolume, toggleMute, updateProgress } = playerSlice.actions
```

## **API & Data Architecture**

### **API Routes Structure**
```typescript
// Pages Router API
pages/api/
├── videos/
│   ├── [id].ts              // GET /api/videos/:id
│   └── stream/[id].ts       // GET /api/videos/stream/:id
├── analytics/
│   └── events.ts            // POST /api/analytics/events
└── health.ts                // GET /api/health

// App Router API
app/api/
├── videos/
│   ├── [id]/route.ts        // RESTful video endpoints
│   └── stream/[id]/route.ts // Streaming endpoints
├── analytics/
│   └── route.ts             // Analytics collection
└── health/route.ts          // Health check
```

### **Data Flow Architecture**
```typescript
// Data Flow Pattern
User Interaction → Action Creator → Reducer → State Update → Component Re-render

// Example: Video Playback
onClick() → dispatch(playVideo()) → playerSlice → state.isPlaying: true → <PlayButton />
```

## **Testing Architecture**

### **Testing Strategy Pyramid**
```
┌─────────────────┐
│   E2E Tests     │ ← 10% (Critical user journeys)
│  (Playwright)   │
├─────────────────┤
│ Integration     │ ← 20% (Component interaction)
│ Tests (RTL)     │
├─────────────────┤
│  Unit Tests     │ ← 70% (Pure functions, hooks)
│   (Jest)        │
└─────────────────┘
```

### **Test Configuration**
```typescript
// Jest Configuration
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

// Playwright Configuration
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## **Security Architecture**

### **Content Security Policy**
```typescript
// CSP Configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'media-src': ["'self'", 'blob:', 'https:'],
  'connect-src': ["'self'", 'https:', 'wss:'],
  'frame-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
}
```

### **DRM & Content Protection**
```typescript
// EME (Encrypted Media Extensions) Setup
const drmConfig = {
  widevine: {
    licenseUrl: 'https://license.example.com/widevine',
    certificateUrl: 'https://cert.example.com/widevine'
  },
  playready: {
    licenseUrl: 'https://license.example.com/playready'
  },
  fairplay: {
    licenseUrl: 'https://license.example.com/fairplay',
    certificateUrl: 'https://cert.example.com/fairplay'
  }
}
```

## **Deployment Architecture**

### **Build Pipeline**
```yaml
# GitHub Actions Workflow
name: Deploy Video Player Demo
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:a11y

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web-player-pages, web-player-app]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build --workspace=${{ matrix.app }}
      - uses: actions/upload-artifact@v4

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action@v1
```

### **Environment Configuration**
```typescript
// Environment Variables
interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'staging' | 'production'
  NEXT_PUBLIC_APP_VERSION: string
  NEXT_PUBLIC_BUILD_ID: string

  // Analytics
  NEXT_PUBLIC_GA_ID: string
  NEXT_PUBLIC_ANALYTICS_ENDPOINT: string

  // Video Streaming
  NEXT_PUBLIC_HLS_BASE_URL: string
  NEXT_PUBLIC_CDN_URL: string

  // Feature Flags
  NEXT_PUBLIC_ENABLE_APP_ROUTER: boolean
  NEXT_PUBLIC_ENABLE_LIVE_TRANSCRIPTION: boolean
  NEXT_PUBLIC_ENABLE_SMART_TV_MODE: boolean
}
```

## **Monitoring & Observability**

### **Performance Monitoring**
```typescript
// Core Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  })

  // Send to custom analytics
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  })
}

// Track all Core Web Vitals
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### **Error Tracking**
```typescript
// Error Boundary with Reporting
class VideoPlayerErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    console.error('VideoPlayer Error:', error, errorInfo)

    // Report to error tracking service
    reportError({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })
  }
}
```

---

**Next.js Mastery Learning Journey:** This technical documentation serves as both implementation reference and educational material for understanding modern React/Next.js patterns in enterprise video streaming applications.