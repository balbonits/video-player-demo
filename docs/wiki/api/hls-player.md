# HLS Player API Reference

## HLSPlayer Component

The core video player component with HLS.js integration, optimized for Smart TV performance and accessibility.

### Props Interface

```typescript
interface HLSPlayerProps {
  // Required Props
  src: string;                          // HLS stream URL (.m3u8)

  // Optional Configuration
  autoplay?: boolean;                   // Default: false (Smart TV safe)
  muted?: boolean;                      // Default: false
  loop?: boolean;                       // Default: false
  preload?: 'none' | 'metadata' | 'auto'; // Default: 'metadata'

  // Performance Options
  performanceTracking?: boolean;        // Default: true
  smartTVMode?: boolean;               // Default: auto-detected
  memoryOptimization?: boolean;        // Default: true on Smart TV

  // Accessibility
  captions?: boolean;                  // Default: true
  captionLanguage?: string;            // Default: 'en'
  captionStyle?: CaptionStyle;         // Custom caption styling
  ariaLabel?: string;                  // Screen reader description

  // Quality Control
  autoQuality?: boolean;               // Default: true
  qualityLevels?: QualityLevel[];      // Available quality options
  maxQuality?: QualityLevel;           // Maximum allowed quality
  minQuality?: QualityLevel;           // Minimum quality threshold

  // Smart TV Navigation
  focusManagement?: boolean;           // Default: true on Smart TV
  remoteNavigation?: boolean;          // Default: true on Smart TV
  spatialNavigation?: SpatialNavConfig; // Custom navigation configuration

  // Event Handlers
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: PlayerError) => void;
  onProgress?: (progress: ProgressEvent) => void;
  onQualityChange?: (quality: QualityLevel) => void;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;

  // Advanced Configuration
  hlsConfig?: Partial<HLSConfig>;      // HLS.js configuration override
  customControls?: boolean;            // Default: true
  className?: string;                  // CSS classes
  style?: React.CSSProperties;        // Inline styles
}
```

### Basic Usage

```typescript
import { HLSPlayer } from '@/components/HLSPlayer';

function VideoPage() {
  const handleProgress = (progress: ProgressEvent) => {
    console.log(`Progress: ${progress.currentTime}/${progress.duration}`);
  };

  return (
    <HLSPlayer
      src="https://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8"
      autoplay={false}
      captions={true}
      onProgress={handleProgress}
      smartTVMode={true}
    />
  );
}
```

### Advanced Configuration

```typescript
function AdvancedVideoPlayer() {
  const hlsConfig = {
    maxBufferLength: 30,
    abrEwmaFastLive: 3.0,
    lowLatencyMode: false
  };

  const captionStyle = {
    fontSize: '18px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <HLSPlayer
      src="stream.m3u8"
      hlsConfig={hlsConfig}
      captionStyle={captionStyle}
      performanceTracking={true}
      memoryOptimization={true}
      onPerformanceUpdate={(metrics) => {
        if (metrics.memoryUsage > 80 * 1024 * 1024) {
          console.warn('High memory usage detected');
        }
      }}
    />
  );
}
```

## Type Definitions

### QualityLevel

```typescript
interface QualityLevel {
  bitrate: number;          // Bitrate in bits per second
  width: number;            // Video width in pixels
  height: number;           // Video height in pixels
  codecs: string;           // Video/audio codecs
  level: number;            // Quality level index
  name: string;             // Human-readable name ('720p', '1080p', etc.)
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  // Video Performance
  currentFPS: number;              // Current frames per second
  droppedFrames: number;           // Total dropped frames
  decodedFrames: number;           // Total decoded frames
  bufferHealth: number;            // Buffer health (0-1)

  // System Performance
  memoryUsage: number;             // Memory usage in bytes
  cpuUsage: number;                // CPU usage percentage (0-100)
  renderTime: number;              // Average render time in ms

  // Network Performance
  currentBitrate: number;          // Current streaming bitrate
  networkLatency: number;          // Network latency in ms
  segmentLoadTime: number;         // Average segment load time

  // Timestamps
  timestamp: number;               // Performance snapshot timestamp
  sessionDuration: number;         // Total session duration
}
```

### PlayerError

```typescript
interface PlayerError {
  type: ErrorType;
  code: number;
  message: string;
  details?: any;
  recoverable: boolean;
  timestamp: number;
}

enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  MEDIA_ERROR = 'MEDIA_ERROR',
  OTHER_ERROR = 'OTHER_ERROR'
}
```

### CaptionStyle

```typescript
interface CaptionStyle {
  fontSize?: string;               // Font size ('16px', '1.2em', etc.)
  fontFamily?: string;             // Font family
  color?: string;                  // Text color
  backgroundColor?: string;        // Background color
  textAlign?: 'left' | 'center' | 'right';
  position?: CaptionPosition;      // Caption positioning
  opacity?: number;                // Background opacity (0-1)
}

interface CaptionPosition {
  bottom?: string;                 // Distance from bottom
  left?: string;                   // Distance from left
  right?: string;                  // Distance from right
  maxWidth?: string;               // Maximum caption width
}
```

## Hook APIs

### useHLSPlayer

Custom hook for programmatic player control.

```typescript
function useHLSPlayer(ref: RefObject<HTMLVideoElement>) {
  const player = useHLSPlayer(videoRef);

  return {
    // Player Control
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;

    // Quality Control
    setQuality: (level: QualityLevel) => void;
    getQualityLevels: () => QualityLevel[];
    enableAutoQuality: () => void;

    // Performance Monitoring
    getPerformanceMetrics: () => PerformanceMetrics;
    startPerformanceTracking: () => void;
    stopPerformanceTracking: () => void;

    // State
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    buffered: TimeRanges;
    currentQuality: QualityLevel | null;
  };
}
```

### useSmartTVNavigation

Hook for Smart TV remote navigation management.

```typescript
function useSmartTVNavigation(enabled: boolean = true) {
  return {
    // Navigation Control
    registerFocusable: (id: string, element: HTMLElement) => void;
    unregisterFocusable: (id: string) => void;
    setFocus: (id: string) => void;

    // Navigation State
    currentFocus: string | null;
    navigationEnabled: boolean;

    // Event Handlers
    onNavigate: (direction: Direction, handler: NavigationHandler) => void;
  };
}
```

### usePerformanceMonitor

Hook for real-time performance monitoring.

```typescript
function usePerformanceMonitor(interval: number = 1000) {
  return {
    // Performance Data
    metrics: PerformanceMetrics | null;
    history: PerformanceMetrics[];

    // Control
    start: () => void;
    stop: () => void;
    reset: () => void;

    // Analysis
    getAverageMetrics: () => PerformanceMetrics;
    detectBottlenecks: () => PerformanceBottleneck[];
  };
}
```

## Error Handling

### Error Recovery Strategies

```typescript
function VideoPlayerWithErrorHandling() {
  const handleError = (error: PlayerError) => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        // Retry with exponential backoff
        retryWithBackoff(() => player.reload());
        break;

      case ErrorType.MEDIA_ERROR:
        // Try to recover by seeking to different position
        if (error.recoverable) {
          player.seek(player.currentTime + 1);
        }
        break;

      default:
        // Log error and show user-friendly message
        console.error('Player error:', error);
        showErrorToUser('Video playback failed');
    }
  };

  return (
    <HLSPlayer
      src="stream.m3u8"
      onError={handleError}
    />
  );
}
```

## Performance Optimization

### Smart TV Optimizations

```typescript
// Automatic Smart TV detection and optimization
const smartTVConfig = {
  // Memory constraints
  maxBufferLength: 30,
  maxBufferSize: 60 * 1024 * 1024, // 60MB

  // CPU optimization
  lowLatencyMode: false,
  abrEwmaFastLive: 5.0, // Slower adaptation

  // Network optimization
  fragLoadingTimeOut: 20000,
  manifestLoadingTimeOut: 10000
};

<HLSPlayer
  src="stream.m3u8"
  smartTVMode={true}
  hlsConfig={smartTVConfig}
  memoryOptimization={true}
/>
```

### Performance Monitoring Integration

```typescript
function MonitoredVideoPlayer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const handlePerformanceUpdate = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);

    // Alert on performance issues
    if (newMetrics.memoryUsage > 80 * 1024 * 1024) {
      console.warn('High memory usage:', newMetrics.memoryUsage);
    }

    if (newMetrics.currentFPS < 30) {
      console.warn('Low FPS detected:', newMetrics.currentFPS);
    }
  };

  return (
    <div>
      <HLSPlayer
        src="stream.m3u8"
        onPerformanceUpdate={handlePerformanceUpdate}
        performanceTracking={true}
      />

      {metrics && (
        <PerformanceDashboard metrics={metrics} />
      )}
    </div>
  );
}
```

## Testing Support

### Testing Utilities

```typescript
// Test helper for mocking HLS player
export function createMockHLSPlayer(overrides = {}) {
  return {
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    currentTime: 0,
    duration: 100,
    ...overrides
  };
}

// Performance testing helper
export function measurePlayerPerformance(
  player: HLSPlayer,
  duration: number = 5000
): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics[] = [];

    const interval = setInterval(() => {
      metrics.push(player.getPerformanceMetrics());
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve(calculateAverageMetrics(metrics));
    }, duration);
  });
}
```

This API reference provides comprehensive documentation for implementing and customizing the HLS video player with performance optimization and Smart TV compatibility.