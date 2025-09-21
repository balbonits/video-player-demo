# Architecture Overview

## System Design Principles

### Performance-First Architecture
The video player demo is architected with Smart TV performance constraints as the primary design driver, ensuring optimal performance across all platforms.

```typescript
interface PerformanceTargets {
  smartTV: {
    memory: '<100MB total footprint';
    cpu: '<30% average usage';
    inputLatency: '<150ms D-pad response';
    videoPerformance: '60fps with <3s startup';
  };
  web: {
    coreWebVitals: 'LCP <2.5s, FID <100ms, CLS <0.1';
    bundleSize: '<200KB initial load';
    testCoverage: '>90% critical paths';
  };
}
```

## Component Architecture

### Dual Next.js Implementation Strategy

**Pages Router (Primary)**
- Fast development and proven stability
- Optimized for production deployment
- Complete feature implementation

**App Router (Secondary)**
- Demonstrates Next.js 14 mastery
- Showcases modern React patterns
- Learning laboratory for latest features

```
apps/web-player-pages/src/
├── app/                    # App Router implementation
│   ├── docs/              # Documentation routes
│   ├── hls/               # HLS player route
│   ├── performance/       # Performance monitoring
│   └── layout.tsx         # Root layout
├── components/            # Shared components
│   ├── HLSPlayer.tsx     # Core video player
│   ├── SmartTVControls.tsx # TV navigation
│   ├── PerformanceMonitor.tsx # Real-time metrics
│   └── DocLayout.tsx     # Documentation layout
├── utils/                # Utility functions
│   ├── performance.ts    # Performance tracking
│   ├── smartTV.ts       # TV-specific optimizations
│   └── hls.ts           # HLS.js configuration
└── types/                # TypeScript definitions
    ├── player.ts        # Player interfaces
    ├── performance.ts   # Performance metrics
    └── smartTV.ts      # TV platform types
```

## State Management Strategy

### Redux Toolkit with Action Creators Pattern

```typescript
// Store Configuration
interface RootState {
  player: PlayerState;
  performance: PerformanceState;
  accessibility: AccessibilityState;
  smartTV: SmartTVState;
}

// Action Creators Pattern for Maintainability
const playerActions = {
  loadVideo: createAsyncThunk('player/loadVideo', async (src: string) => {
    const performance = startPerformanceTracking();
    const result = await loadHLSStream(src);
    return { ...result, performance };
  }),

  updateQuality: createAction<QualityLevel>('player/updateQuality'),
  trackPerformance: createAction<PerformanceMetrics>('player/trackPerformance')
};
```

## HLS Streaming Architecture

### HLS.js Configuration for Smart TV Optimization

```typescript
interface HLSConfig {
  // Memory optimization for Smart TV
  maxBufferLength: 30;           // Conservative buffering
  maxMaxBufferLength: 60;        // Maximum buffer size
  maxBufferSize: 60 * 1000 * 1000; // 60MB buffer limit

  // CPU optimization
  lowLatencyMode: false;         // Reduce CPU usage
  backBufferLength: 90;          // Aggressive cleanup

  // Network optimization
  abrEwmaFastLive: 3.0;         // Conservative adaptation
  abrEwmaSlowLive: 9.0;         // Slow quality changes

  // Error recovery
  fragLoadingTimeOut: 20000;     // Extended timeout for TV networks
  manifestLoadingTimeOut: 10000; // Manifest loading patience
}
```

### Adaptive Streaming Strategy

1. **Conservative Quality Adaptation**
   - Slower bitrate changes to prevent oscillation
   - Buffer-based adaptation for TV network conditions
   - Manual quality override for user control

2. **Memory Management**
   - Aggressive buffer cleanup on Smart TV platforms
   - Segment disposal optimization
   - Memory leak prevention patterns

3. **Error Recovery**
   - Graceful degradation on network issues
   - Automatic retry with exponential backoff
   - Fallback to lower quality streams

## Performance Monitoring Architecture

### Real-time Metrics Collection

```typescript
interface PerformanceMetrics {
  // Video Performance
  videoMetrics: {
    fps: number;
    droppedFrames: number;
    bufferHealth: number;
    segmentLoadTime: number;
  };

  // System Performance
  systemMetrics: {
    memoryUsage: number;
    cpuUsage: number;
    renderTime: number;
    inputLatency: number;
  };

  // Network Performance
  networkMetrics: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
    qualityLevel: QualityLevel;
  };
}
```

### Performance Optimization Strategies

1. **Component-Level Optimization**
   ```typescript
   // React.memo for expensive components
   const HLSPlayer = memo(({ src, onProgress }) => {
     // useMemo for expensive calculations
     const hlsConfig = useMemo(() => optimizeForPlatform(), [platform]);

     // useCallback for stable references
     const handleProgress = useCallback((progress) => {
       onProgress(throttle(progress, 16)); // 60fps throttling
     }, [onProgress]);
   });
   ```

2. **Smart TV Specific Optimizations**
   - RequestAnimationFrame throttling
   - Event listener cleanup
   - Focus management optimization
   - Memory pool management

## Smart TV Navigation Architecture

### Spatial Navigation System

```typescript
interface NavigationNode {
  id: string;
  element: HTMLElement;
  focusable: boolean;
  neighbors: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

class SpatialNavigationManager {
  private nodes = new Map<string, NavigationNode>();
  private currentFocus: string | null = null;

  registerNode(node: NavigationNode): void;
  handleKeyPress(key: KeyboardEvent): void;
  calculateBestMatch(direction: Direction): string | null;
}
```

### TV Remote Event Handling

1. **D-pad Navigation**
   - Arrow keys for spatial navigation
   - Enter/Select for activation
   - Back button for navigation history

2. **Input Response Optimization**
   - <150ms response time targets
   - Event debouncing for rapid input
   - Visual feedback for all interactions

## Testing Architecture

### Comprehensive Testing Strategy

```typescript
// Component Testing with Testing Library
describe('HLSPlayer', () => {
  it('should load video with performance tracking', async () => {
    const performanceTracker = jest.fn();
    render(<HLSPlayer src="test.m3u8" onPerformance={performanceTracker} />);

    await waitFor(() => {
      expect(performanceTracker).toHaveBeenCalledWith(
        expect.objectContaining({
          timeToFirstFrame: expect.any(Number),
          memoryUsage: expect.any(Number)
        })
      );
    });
  });
});

// Accessibility Testing with Axe-core
describe('Accessibility', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<HLSPlayer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Performance Testing
describe('Performance', () => {
  it('should maintain 60fps during playback', async () => {
    const metrics = await measurePerformance(() => {
      // Simulate video playback
    });

    expect(metrics.fps).toBeGreaterThanOrEqual(60);
    expect(metrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB
  });
});
```

## Deployment Architecture

### CI/CD Pipeline Strategy

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
        run: npm run test:ci
      - name: Performance Testing
        run: npm run test:performance
      - name: Accessibility Testing
        run: npm run test:accessibility

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Application
        run: npm run build
      - name: Lighthouse CI
        run: npm run lighthouse:ci

  deploy:
    needs: [test, build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

### Production Optimizations

1. **Bundle Optimization**
   - Code splitting for route-based lazy loading
   - Tree shaking for minimal bundle size
   - Dynamic imports for heavy dependencies

2. **CDN Strategy**
   - Static asset optimization
   - Video content delivery optimization
   - Geographic distribution for global performance

3. **Monitoring & Alerting**
   - Real-time performance monitoring
   - Error tracking and alerting
   - User behavior analytics

## Security Architecture

### Content Security Policy

```typescript
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    media-src 'self' https://sample.vodobox.com;
    connect-src 'self' https://sample.vodobox.com;
  `,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### DRM Integration Readiness

```typescript
interface DRMConfig {
  widevine: {
    licenseServer: string;
    certificateUrl?: string;
  };
  fairplay: {
    licenseServer: string;
    certificateUrl: string;
  };
  playready: {
    licenseServer: string;
  };
}
```

This architecture ensures optimal performance across all target platforms while maintaining enterprise-grade quality, security, and maintainability standards.