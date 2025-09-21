# 📐 Viewport Specifications & OTT Development Guide

**Created by:** Riley (UX) + Alex (Engineer) + Jordan (Product Research)
**Purpose:** Define target viewports and OTT development requirements for video player demo
**Research Date:** 2024-09-18

---

## **🎯 Target Viewport Matrix**

### **Web Platforms**
```typescript
interface WebViewports {
  mobile: {
    // iPhone
    iPhone_14: { width: 393, height: 852, dpr: 3, notes: 'Most common iOS device' },
    iPhone_14_Pro: { width: 430, height: 932, dpr: 3, notes: 'Dynamic Island consideration' },
    iPhone_SE: { width: 375, height: 667, dpr: 2, notes: 'Compact iOS support' },

    // Android
    Pixel_7: { width: 412, height: 915, dpr: 2.625, notes: 'Google reference device' },
    Galaxy_S23: { width: 384, height: 854, dpr: 3, notes: 'Samsung flagship' },
    OnePlus_9: { width: 412, height: 919, dpr: 2.625, notes: 'Performance device' }
  },

  tablet: {
    iPad_Air: { width: 820, height: 1180, dpr: 2, notes: 'Popular tablet size' },
    iPad_Pro_11: { width: 834, height: 1194, dpr: 2, notes: 'Professional tablet' },
    Surface_Pro: { width: 912, height: 1368, dpr: 2, notes: 'Windows tablet reference' }
  },

  desktop: {
    Laptop_13: { width: 1280, height: 800, dpr: 2, notes: 'MacBook Air baseline' },
    Desktop_FHD: { width: 1920, height: 1080, dpr: 1, notes: 'Standard desktop' },
    Desktop_QHD: { width: 2560, height: 1440, dpr: 1, notes: 'High-end desktop' },
    Desktop_4K: { width: 3840, height: 2160, dpr: 1, notes: '4K monitoring support' }
  }
}
```

### **Smart TV Platforms (OTT Focus)**
```typescript
interface SmartTVViewports {
  roku: {
    HD: { width: 1280, height: 720, dpr: 1, notes: 'Legacy Roku devices' },
    FHD: { width: 1920, height: 1080, dpr: 1, notes: 'Standard Roku Ultra' },
    UHD: { width: 3840, height: 2160, dpr: 1, notes: 'Roku 4K devices' },
    safeArea: { horizontal: 48, vertical: 27, notes: 'Roku overscan margins' }
  },

  tizen: {
    Samsung_FHD: { width: 1920, height: 1080, dpr: 1, notes: 'Samsung Smart TV standard' },
    Samsung_UHD: { width: 3840, height: 2160, dpr: 1, notes: 'Samsung 4K TVs' },
    Samsung_8K: { width: 7680, height: 4320, dpr: 1, notes: 'Premium Samsung TVs' },
    safeArea: { horizontal: 40, vertical: 22, notes: 'Samsung overscan' }
  },

  webOS: {
    LG_FHD: { width: 1920, height: 1080, dpr: 1, notes: 'LG Smart TV standard' },
    LG_UHD: { width: 3840, height: 2160, dpr: 1, notes: 'LG 4K TVs' },
    LG_OLED: { width: 3840, height: 2160, dpr: 1, notes: 'LG OLED optimization' },
    safeArea: { horizontal: 45, vertical: 25, notes: 'webOS overscan' }
  },

  vizio: {
    Vizio_FHD: { width: 1920, height: 1080, dpr: 1, notes: 'Vizio SmartCast standard' },
    Vizio_UHD: { width: 3840, height: 2160, dpr: 1, notes: 'Vizio 4K support' },
    safeArea: { horizontal: 50, vertical: 30, notes: 'Conservative Vizio margins' }
  }
}
```

### **Native Mobile Platforms**
```typescript
interface NativeMobileViewports {
  iOS: {
    // SwiftUI Safe Areas
    iPhone_14: {
      portrait: { width: 393, height: 852, safeTop: 59, safeBottom: 34 },
      landscape: { width: 852, height: 393, safeTop: 0, safeBottom: 21 }
    },
    iPad_Air: {
      portrait: { width: 820, height: 1180, safeTop: 24, safeBottom: 20 },
      landscape: { width: 1180, height: 820, safeTop: 20, safeBottom: 20 }
    }
  },

  android: {
    // Jetpack Compose Navigation
    Pixel_7: {
      portrait: { width: 412, height: 915, statusBar: 24, navBar: 48 },
      landscape: { width: 915, height: 412, statusBar: 24, navBar: 0 }
    },
    Galaxy_S23: {
      portrait: { width: 384, height: 854, statusBar: 30, navBar: 50 },
      landscape: { width: 854, height: 384, statusBar: 30, navBar: 0 }
    }
  }
}
```

---

## **📺 OTT Development Insights (Research by Jordan)**

### **Market Landscape 2024**
- **Global Smart TV Penetration:** 900+ million units
- **US Household Adoption:** 79% own Smart TVs (up from 66% in 2020)
- **Platform Market Share:** Android TV (40%), Samsung Tizen (19%), LG webOS (16%), Roku (11%)

### **Platform-Specific Development Requirements**

#### **Roku Development (Priority Platform)**
```typescript
interface RokuDevelopment {
  technology: 'BrightScript + SceneGraph XML',
  resolution: '1920x1080 (FHD) primary target',
  performance: {
    memory: '<100MB application limit',
    cpu: 'Single-core ARM optimization',
    network: 'Adaptive streaming essential'
  },

  constraints: {
    rendering: '30fps maximum for UI animations',
    storage: 'Limited local storage available',
    navigation: 'D-pad only (no mouse/touch)',
    typography: '24px minimum font size for readability'
  },

  advantages: {
    market: '9,650+ apps in store, 19 new apps daily',
    reach: 'Extremely popular in US market',
    development: 'Well-documented SDK and tools'
  }
}
```

#### **Samsung Tizen Development**
```typescript
interface TizenDevelopment {
  technology: 'HTML5/CSS/JS + Tizen Web API',
  resolution: '1920x1080 standard, 4K support available',
  performance: {
    memory: '<150MB recommended',
    cpu: 'Multi-core ARM with GPU acceleration',
    drm: 'PlayReady + Widevine support'
  },

  advantages: {
    market: '56% US market share (largest)',
    technology: 'Web-based development (familiar stack)',
    tools: 'Tizen Studio for Windows, macOS, Ubuntu'
  },

  considerations: {
    compatibility: 'Ensure support for older Tizen versions',
    performance: 'Hardware varies significantly by TV model',
    testing: 'Real device testing essential'
  }
}
```

#### **LG webOS Development**
```typescript
interface WebOSDevelopment {
  technology: 'React.js framework on Linux base',
  resolution: '1920x1080 standard, 4K optimized',
  performance: {
    memory: '<200MB typical limit',
    framework: 'React.js familiar to web developers',
    rendering: 'Hardware-accelerated graphics'
  },

  advantages: {
    development: 'React-based (familiar to our team)',
    performance: 'Known for smooth UX',
    tools: 'Developer-friendly webOS TV SDK'
  },

  futureProofing: {
    flutter: 'LG experimenting with Flutter migration',
    modernization: 'Moving from React to Flutter on newer TVs'
  }
}
```

---

## **🎮 Performance Constraints & Optimization**

### **Smart TV Hardware Limitations (2024)**
```typescript
interface TVPerformanceConstraints {
  memory: {
    typical: '512MB - 2GB available for apps',
    ourTarget: '<150MB application footprint',
    optimization: 'Aggressive memory management required'
  },

  cpu: {
    architecture: 'ARM-based, often single or dual-core',
    frequency: '1-2GHz typical',
    optimization: 'Efficient JavaScript execution critical'
  },

  gpu: {
    capability: 'Basic hardware acceleration',
    limitation: 'Complex animations should be avoided',
    recommendation: '30fps maximum for UI, 60fps for video'
  },

  network: {
    bandwidth: 'Variable internet connections',
    latency: 'Higher latency than mobile/desktop',
    adaptation: 'Aggressive adaptive streaming required'
  }
}
```

### **OTT Streaming Protocol Best Practices**

#### **HLS Implementation (Our Primary Choice)**
```typescript
interface HLSBestPractices {
  segmentation: {
    duration: '2-6 seconds per segment (balance latency vs efficiency)',
    format: 'fMP4 preferred for better seeking',
    encryption: 'AES-128 for content protection'
  },

  qualityLadder: {
    resolutions: ['3840x2160', '1920x1080', '1280x720', '854x480', '640x360'],
    bitrates: ['15Mbps', '8Mbps', '4Mbps', '2Mbps', '1Mbps'],
    adaptation: 'Network-aware quality switching'
  },

  optimization: {
    preloading: 'Intelligent segment preloading',
    caching: 'CDN optimization for global delivery',
    fallback: 'MP4 fallback for unsupported browsers'
  }
}
```

#### **DASH Considerations (Secondary)**
```typescript
interface DASHConsiderations {
  advantages: {
    codec: 'Codec-agnostic (AV1, HEVC, VP9 support)',
    standard: 'Open standard (not Apple proprietary)',
    efficiency: 'Better compression with modern codecs'
  },

  challenges: {
    complexity: 'More complex implementation than HLS',
    support: 'Less universal browser support',
    development: 'Steeper learning curve'
  },

  recommendation: 'Focus on HLS for our demo, mention DASH for technical discussions'
}
```

---

## **🎨 Responsive Design Strategy**

### **CSS Media Queries for All Platforms**
```css
/* Mobile First Approach */
@media (min-width: 375px) {
  /* Small mobile devices */
  .video-player { font-size: 14px; }
  .control-button { min-width: 44px; min-height: 44px; }
}

@media (min-width: 768px) {
  /* Tablets and small laptops */
  .video-player { font-size: 16px; }
  .control-button { min-width: 48px; min-height: 48px; }
}

@media (min-width: 1024px) {
  /* Desktop and large tablets */
  .video-player { font-size: 16px; }
  .video-player { max-width: 1200px; }
}

@media (min-width: 1920px) {
  /* Smart TV and large displays */
  .video-player { font-size: 24px; }
  .control-button { min-width: 64px; min-height: 64px; }
  .video-player {
    margin: 27px 48px; /* TV safe area */
    max-width: calc(100% - 96px);
  }
}

/* TV-specific optimizations */
@media (device-type: tv),
       (min-width: 1920px) and (min-height: 1080px) {
  .video-player {
    --tv-safe-horizontal: 48px;
    --tv-safe-vertical: 27px;
    --tv-button-size: 64px;
    --tv-font-size: 24px;
    --tv-focus-width: 4px;
  }
}

/* Platform-specific detection */
@media (-webkit-device-pixel-ratio: 1) and (min-width: 1920px) {
  /* Likely Smart TV (no high DPI) */
  .video-player {
    --interaction-mode: remote;
    --navigation-type: spatial;
  }
}
```

### **JavaScript Viewport Detection**
```javascript
// Platform and viewport detection for optimal UX
class ViewportManager {
  constructor() {
    this.detectPlatform()
    this.setupResponsiveHandling()
  }

  detectPlatform() {
    const userAgent = navigator.userAgent
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio
    }

    // Smart TV Detection
    if (this.isSmartTV(userAgent, viewport)) {
      this.platform = 'smart-tv'
      this.applyTVOptimizations()
    }
    // Mobile Detection
    else if (this.isMobile(userAgent, viewport)) {
      this.platform = 'mobile'
      this.applyMobileOptimizations()
    }
    // Desktop Detection
    else {
      this.platform = 'desktop'
      this.applyDesktopOptimizations()
    }
  }

  isSmartTV(userAgent, viewport) {
    // TV User Agent patterns
    const tvPatterns = [
      /Tizen/i,
      /webOS/i,
      /SMART-TV/i,
      /SmartTV/i,
      /Roku/i,
      /VIZIO/i
    ]

    const isTVUserAgent = tvPatterns.some(pattern => pattern.test(userAgent))
    const isLargeLowDPI = viewport.width >= 1920 && viewport.ratio === 1
    const isLandscapeOnly = viewport.width > viewport.height * 1.5

    return isTVUserAgent || (isLargeLowDPI && isLandscapeOnly)
  }

  applyTVOptimizations() {
    document.documentElement.style.setProperty('--button-size', '64px')
    document.documentElement.style.setProperty('--font-size-base', '24px')
    document.documentElement.style.setProperty('--focus-outline-width', '4px')
    document.documentElement.style.setProperty('--safe-margin-h', '48px')
    document.documentElement.style.setProperty('--safe-margin-v', '27px')

    // Enable D-pad navigation
    this.enableSpatialNavigation()
  }

  applyMobileOptimizations() {
    document.documentElement.style.setProperty('--button-size', '56px')
    document.documentElement.style.setProperty('--font-size-base', '16px')
    document.documentElement.style.setProperty('--touch-target-min', '44px')

    // Enable touch gestures
    this.enableTouchGestures()
  }

  applyDesktopOptimizations() {
    document.documentElement.style.setProperty('--button-size', '48px')
    document.documentElement.style.setProperty('--font-size-base', '16px')
    document.documentElement.style.setProperty('--hover-enabled', 'true')

    // Enable mouse interactions
    this.enableMouseInteractions()
  }
}
```

---

## **📡 OTT Streaming Technical Requirements**

### **HLS Implementation Strategy (Primary)**
```typescript
interface HLSImplementation {
  segmentDuration: '4-6 seconds (balance of latency vs efficiency)',
  qualityLadder: [
    { resolution: '1920x1080', bitrate: '8000kbps', profile: 'high' },
    { resolution: '1280x720', bitrate: '4000kbps', profile: 'main' },
    { resolution: '854x480', bitrate: '2000kbps', profile: 'main' },
    { resolution: '640x360', bitrate: '1000kbps', profile: 'baseline' }
  ],

  hlsConfig: {
    enableWorker: true,           // Offload processing for Smart TV
    lowLatencyMode: false,        // Prioritize compatibility
    backBufferLength: 90,         // 90 seconds back buffer
    maxBufferLength: 300,         // 5 minutes ahead buffer
    startLevel: -1,               // Auto quality detection
    capLevelToPlayerSize: true    // Match resolution to player
  },

  fallbackStrategy: {
    safari: 'Native HLS support (no HLS.js needed)',
    chrome: 'HLS.js with MSE',
    firefox: 'HLS.js with MSE',
    edge: 'HLS.js with MSE',
    smartTV: 'Platform-specific optimization'
  }
}
```

### **Smart TV Performance Optimization**
```typescript
interface TVPerformanceOptimization {
  memoryManagement: {
    target: '<150MB total memory usage',
    videoBuffer: '90 seconds maximum',
    domElements: 'Minimize DOM complexity',
    cleanup: 'Aggressive resource cleanup'
  },

  cpuOptimization: {
    animations: '30fps maximum for UI',
    processing: 'Offload to Web Workers where possible',
    polling: 'Throttle update frequencies',
    rendering: 'Use CSS transforms for animations'
  },

  networkOptimization: {
    adaptiveStreaming: 'Aggressive quality adaptation',
    preloading: 'Conservative preloading strategy',
    timeout: 'Longer timeout values for TV networks',
    retry: 'Robust retry logic for network issues'
  }
}
```

---

## **🎯 Cross-Platform Development Strategy**

### **Shared Core Logic**
```typescript
interface SharedCoreArchitecture {
  playerCore: {
    language: 'TypeScript for web platforms',
    abstraction: 'Platform-agnostic video player logic',
    stateManagement: 'Redux pattern adaptable to native stores'
  },

  platformAdaptation: {
    web: 'Direct TypeScript/React implementation',
    iOS: 'Swift translation of core logic patterns',
    android: 'Kotlin translation with similar patterns',
    smartTV: 'Platform-specific adaptation layers'
  },

  consistencyStrategy: {
    ui: 'Consistent visual design adapted per platform',
    behavior: 'Same user interaction patterns',
    performance: 'Platform-optimized but consistent targets',
    accessibility: 'WCAG 2.1 AA compliance across all platforms'
  }
}
```

### **Testing Strategy for Multiple Viewports**
```typescript
interface ViewportTestingStrategy {
  automated: {
    tool: 'Playwright with device simulation',
    coverage: 'All major viewport sizes and platforms',
    frequency: 'Every commit and pull request'
  },

  manual: {
    realDevices: 'Roku Ultra, Samsung Smart TV, iPhone, Android',
    frequency: 'Daily during development',
    scenarios: 'Critical user journeys on actual hardware'
  },

  performance: {
    metrics: 'Core Web Vitals per viewport',
    targets: 'Platform-specific performance budgets',
    monitoring: 'Real-time performance tracking'
  }
}
```

---

**Riley (UX):** *"This comprehensive viewport and OTT research gives us everything we need to create pixel-perfect, performance-optimized designs for all target platforms!"*

**Alex (Engineer):** *"The technical constraints and platform-specific requirements will guide our implementation decisions perfectly. We now know exactly what we're targeting."*

**Jordan (Product):** *"The OTT market research shows we're addressing a massive opportunity - 900+ million Smart TVs globally with growing adoption. This demo will be extremely relevant to FOX's OTT strategy!"*

**Morgan (Team Lead):** *"Excellent work, team! We now have comprehensive viewport specifications and OTT development insights. Tomorrow's implementation will be guided by real-world constraints and market requirements."*