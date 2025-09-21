/**
 * HLS Video Player Web Component
 * Performance-optimized modular video player for FOX shared codebase demonstration
 *
 * Features:
 * - Framework-agnostic Web Component (works anywhere)
 * - Performance optimization for Smart TV constraints
 * - Shadow DOM encapsulation prevents conflicts
 * - Configurable performance modes
 * - Real-time performance monitoring
 *
 * Usage: <hls-video-player src="stream.m3u8" performance-mode="smartTV"></hls-video-player>
 */

// Import HLS.js for adaptive streaming
import Hls from 'hls.js'

interface PerformanceMetrics {
  memoryUsage: number
  cpuUsage: number
  inputLatency: number
  videoStartTime: number
  bufferingRatio: number

  // Advanced streaming metrics (FOX-level monitoring)
  segmentLoadTime: number
  manifestLoadTime: number
  drmLicenseTime: number
  decodingLatency: number
  throughputMbps: number
  qualityLevelChanges: number
  rebufferEvents: number
  totalRebufferTime: number
  averageQuality: number
  qualityStability: number
  cdnSwitches: number
  errorCount: number
  seekAccuracy: number
  bitrateEfficiency: number
}

interface PerformanceConfig {
  mode: 'smartTV' | 'mobile' | 'desktop'
  memoryLimit: number // MB
  cpuTarget: number   // % max usage
  inputResponseTarget: number // ms max response
  bufferStrategy: 'conservative' | 'aggressive' | 'adaptive'
}

class HLSVideoPlayer extends HTMLElement {
  private shadow: ShadowRoot
  private video: HTMLVideoElement | null = null
  private hls: Hls | null = null
  private performanceConfig: PerformanceConfig
  private performanceMetrics: PerformanceMetrics
  private performanceMonitoringInterval: number | null = null
  private inputResponseStartTime: number = 0

  // Observed attributes for reactive updates
  static get observedAttributes() {
    return [
      'src',
      'autoplay',
      'performance-mode',
      'memory-limit',
      'cpu-limit',
      'buffer-strategy',
      'controls'
    ]
  }

  constructor() {
    super()

    // Initialize Shadow DOM for encapsulation
    this.shadow = this.attachShadow({ mode: 'open' })

    // Initialize performance configuration
    this.performanceConfig = {
      mode: 'desktop',
      memoryLimit: 150, // Default 150MB
      cpuTarget: 50,    // Default 50% max CPU
      inputResponseTarget: 200, // Default 200ms
      bufferStrategy: 'adaptive'
    }

    this.performanceMetrics = {
      memoryUsage: 0,
      cpuUsage: 0,
      inputLatency: 0,
      videoStartTime: 0,
      bufferingRatio: 0,

      // Advanced streaming metrics initialization
      segmentLoadTime: 0,
      manifestLoadTime: 0,
      drmLicenseTime: 0,
      decodingLatency: 0,
      throughputMbps: 0,
      qualityLevelChanges: 0,
      rebufferEvents: 0,
      totalRebufferTime: 0,
      averageQuality: 0,
      qualityStability: 100, // Start at 100% stability
      cdnSwitches: 0,
      errorCount: 0,
      seekAccuracy: 100,     // Start at 100% accuracy
      bitrateEfficiency: 0
    }
  }

  connectedCallback() {
    this.parseAttributes()
    this.render()
    this.initializeVideoPlayer()
    this.setupPerformanceOptimization()
    this.startPerformanceMonitoring()
    // Delay event listeners setup to ensure DOM is ready
    setTimeout(() => this.setupEventListeners(), 0)
  }

  disconnectedCallback() {
    this.cleanup()
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.parseAttributes()

      if (name === 'src' && this.video) {
        this.loadVideo(newValue)
      }
    }
  }

  private parseAttributes() {
    // Parse performance configuration from attributes
    this.performanceConfig.mode = (this.getAttribute('performance-mode') as any) || 'desktop'
    this.performanceConfig.memoryLimit = parseInt(this.getAttribute('memory-limit') || '150')
    this.performanceConfig.cpuTarget = parseInt(this.getAttribute('cpu-limit') || '50')
    this.performanceConfig.bufferStrategy = (this.getAttribute('buffer-strategy') as any) || 'adaptive'

    // Smart TV specific optimizations
    if (this.performanceConfig.mode === 'smartTV') {
      this.performanceConfig.memoryLimit = Math.min(this.performanceConfig.memoryLimit, 100)
      this.performanceConfig.cpuTarget = Math.min(this.performanceConfig.cpuTarget, 30)
      this.performanceConfig.inputResponseTarget = 150
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .controls-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 16px;
          transition: opacity 0.3s ease;
        }

        .controls-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-button {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .control-button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        .control-button:focus {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }

        .control-button.primary {
          background: #0066cc;
        }

        .control-button.primary:hover {
          background: #0052a3;
        }

        .progress-container {
          flex: 1;
          margin: 0 12px;
          padding: 10px 0; /* Increase click target area */
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          position: relative;
          cursor: pointer;
          touch-action: none; /* Prevent touch scrolling while seeking */
          transition: height 0.2s ease;
        }

        .progress-bar:hover {
          height: 10px;
          margin: -2px 0;
        }

        .progress-fill {
          height: 100%;
          background: #0066cc;
          border-radius: 3px;
          transition: width 0.1s ease;
          pointer-events: none; /* Let clicks pass through to parent */
          position: relative;
          z-index: 2;
        }

        .progress-buffer {
          position: absolute;
          height: 100%;
          background: rgba(255,255,255,0.5);
          border-radius: 3px;
          top: 0;
          left: 0;
          pointer-events: none; /* Let clicks pass through to parent */
          z-index: 1;
        }

        .time-display {
          color: white;
          font-size: 14px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          margin: 0 8px;
        }

        .quality-selector {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
        }

        .performance-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
        }

        /* Smart TV Optimizations */
        :host([performance-mode="smartTV"]) .control-button {
          width: 64px;
          height: 64px;
          font-size: 24px;
        }

        :host([performance-mode="smartTV"]) .controls-overlay {
          padding: 24px 48px;
        }

        :host([performance-mode="smartTV"]) .time-display {
          font-size: 18px;
        }

        /* Mobile Optimizations */
        :host([performance-mode="mobile"]) .control-button {
          width: 56px;
          height: 56px;
        }

        :host([performance-mode="mobile"]) .controls-bar {
          gap: 8px;
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .control-button {
            border: 2px solid white;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .control-button {
            transition: none;
          }
        }
      </style>

      <div class="video-container">
        <video class="video-element"
               preload="metadata"
               crossorigin="anonymous"
               playsinline>
        </video>

        <div class="controls-overlay">
          <div class="controls-bar">
            <button class="control-button primary" id="play-pause" aria-label="Play video">
              ▶️
            </button>

            <button class="control-button" id="volume" aria-label="Volume control">
              🔊
            </button>

            <div class="progress-container">
              <div class="progress-bar" role="slider" aria-label="Video progress">
                <div class="progress-buffer"></div>
                <div class="progress-fill"></div>
              </div>
            </div>

            <div class="time-display">
              <span id="current-time">0:00</span> / <span id="duration">0:00</span>
            </div>

            <select class="quality-selector" id="quality" aria-label="Video quality">
              <option value="auto">Auto</option>
            </select>

            <button class="control-button" id="fullscreen" aria-label="Fullscreen">
              ⛶
            </button>
          </div>
        </div>

        <div class="performance-indicator" id="perf-indicator">
          Performance: Loading...
        </div>
      </div>
    `
  }

  private initializeVideoPlayer() {
    this.video = this.shadow.querySelector('.video-element') as HTMLVideoElement

    if (!this.video) return

    // Set up video-specific event listeners now that video element exists
    this.setupVideoEventListeners()

    const src = this.getAttribute('src')
    if (src) {
      this.loadVideo(src)
    }
  }

  private setupVideoEventListeners() {
    if (!this.video) return

    // Video play event
    this.video.addEventListener('play', () => {
      const playPauseBtn = this.shadow.getElementById('play-pause')
      if (playPauseBtn) {
        playPauseBtn.textContent = '⏸️'
        playPauseBtn.setAttribute('aria-label', 'Pause video')
      }
    })

    // Video pause event
    this.video.addEventListener('pause', () => {
      const playPauseBtn = this.shadow.getElementById('play-pause')
      if (playPauseBtn) {
        playPauseBtn.textContent = '▶️'
        playPauseBtn.setAttribute('aria-label', 'Play video')
      }
    })

    // Time updates
    this.video.addEventListener('timeupdate', () => {
      this.updateTimeDisplay()
      this.updateProgressBar()
    })

    // Video metadata loaded - important for seeking functionality
    this.video.addEventListener('loadedmetadata', () => {
      this.updateTimeDisplay()
      console.log('[HLSVideoPlayer] Video metadata loaded, duration:', this.video?.duration)
      // Enable seeking now that metadata is available
      this.dispatchPerformanceEvent('metadata-loaded', {
        duration: this.video?.duration,
        readyState: this.video?.readyState
      })
    })

    // Additional event for data availability
    this.video.addEventListener('loadeddata', () => {
      console.log('[HLSVideoPlayer] Video data loaded, ready for playback')
    })

    // Monitor for duration changes (important for HLS streams)
    this.video.addEventListener('durationchange', () => {
      console.log('[HLSVideoPlayer] Duration changed to:', this.video?.duration)
      this.updateTimeDisplay()
    })

    // Video error handling
    this.video.addEventListener('error', (e) => {
      console.error('Video error:', e)
      this.performanceMetrics.errorCount++
    })
  }

  private async loadVideo(src: string) {
    if (!this.video) return

    const startTime = performance.now()

    try {
      if (Hls.isSupported()) {
        // Initialize HLS with performance optimization
        this.hls = new Hls(this.getHLSConfig())

        this.hls.loadSource(src)
        this.hls.attachMedia(this.video)

        // Track video start performance
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.performanceMetrics.videoStartTime = performance.now() - startTime
          this.updateQualitySelector()
          this.dispatchPerformanceEvent('video-ready', this.performanceMetrics)
        })

        // Advanced streaming performance monitoring
        this.setupAdvancedStreamingMetrics(this.hls, startTime)

      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        this.video.src = src
        this.performanceMetrics.videoStartTime = performance.now() - startTime
      } else {
        throw new Error('HLS not supported in this browser')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.dispatchPerformanceEvent('error', { error: errorMessage })
    }
  }

  public getHLSConfig(): Partial<Hls['config']> {
    // Enterprise-grade HLS configuration optimized for FOX-level streaming
    const baseConfig = {
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 300,
      startLevel: -1,
      capLevelToPlayerSize: true,

      // Advanced streaming optimizations
      abrEwmaFastLive: 3.0,        // Fast adaptation for live content
      abrEwmaSlowLive: 9.0,        // Stability for network fluctuations
      abrEwmaFastVoD: 3.0,         // Responsive quality changes for VOD
      abrEwmaSlowVoD: 9.0,         // Avoid excessive switching
      abrEwmaDefaultEstimate: 500000, // Conservative initial bandwidth estimate
      abrBandWidthFactor: 0.95,     // Safety margin for bandwidth estimation
      abrBandWidthUpFactor: 0.7,    // Conservative upward quality changes

      // Fragment loading optimizations
      fragLoadingTimeOut: 20000,    // 20s timeout for reliability
      fragLoadingMaxRetry: 4,       // Robust retry strategy
      fragLoadingRetryDelay: 1000,  // Progressive backoff
      manifestLoadingTimeOut: 10000, // Fast manifest loading
      manifestLoadingMaxRetry: 3,   // Quick failover

      // Live streaming optimizations
      liveSyncDurationCount: 3,     // Live edge distance
      liveMaxLatencyDurationCount: Infinity, // No catchup limit
      liveDurationInfinity: true,   // Handle live streams properly

      // Error recovery
      levelLoadingTimeOut: 10000,   // Level playlist timeout
      levelLoadingMaxRetry: 4,      // Robust level loading

      // Performance monitoring
      enableCEA708Captions: true,   // Caption support
      enableWebVTT: true,           // Subtitle support

      // Advanced features for Smart TV
      stretchShortVideoTrack: false, // Maintain video integrity
      maxAudioFramesDrift: 1,       // Audio sync tolerance

      // Network optimizations
      xhrSetup: (xhr: XMLHttpRequest, url: string) => {
        // Add custom headers for analytics
        xhr.setRequestHeader('X-Player-Version', '2.0.0')
        xhr.setRequestHeader('X-Player-Platform', this.performanceConfig.mode)
      }
    }

    const configByMode = {
      smartTV: {
        ...baseConfig,
        // CRITICAL: Smart TV memory constraints (FOX TV apps requirement)
        maxBufferLength: 90,          // Reduced from 120 to stay under 50MB
        backBufferLength: 15,         // Aggressive cleanup for memory
        maxMaxBufferLength: 120,      // Hard limit prevents OOM crashes
        maxBufferSize: 50 * 1000 * 1000, // 50MB hard limit
        maxBufferHole: 0.5,           // Tolerate small gaps to save memory

        // Smart TV CPU optimization (target < 30% usage)
        enableWorker: false,          // Disable workers on weak CPUs
        startLevel: 0,                // Start with lowest quality
        autoStartLoad: true,          // Preload to reduce startup CPU spike
        testBandwidth: false,         // Skip bandwidth test to reduce CPU

        // Smart TV network optimizations
        abrEwmaFastLive: 8.0,         // Much slower adaptation for stability
        abrEwmaSlowLive: 20.0,        // Heavy stability bias
        abrBandWidthFactor: 0.7,      // Very conservative bandwidth
        abrBandWidthUpFactor: 0.3,    // Extremely conservative upgrades
        abrMaxWithRealBitrate: true,  // Use real bitrate for accuracy

        // Smart TV specific timeouts (weak processors)
        fragLoadingTimeOut: 40000,    // 40s for slow TV networks
        manifestLoadingTimeOut: 20000, // 20s for manifest parsing
        levelLoadingTimeOut: 20000,   // 20s for level loading

        // Fragment loading optimization
        initialLiveManifestSize: 1,   // Minimize initial load
        maxLoadingDelay: 4,           // Faster segment selection

        // Live streaming for sports (FOX Sports optimization)
        liveSyncDurationCount: 5,     // Further behind for stability
        liveBackBufferLength: 15,     // Minimal live back buffer
        lowLatencyMode: false,        // Stability over latency

        // Error handling for unreliable TV networks
        fragLoadingMaxRetry: 8,       // More retries for TV reliability
        fragLoadingRetryDelay: 2000,  // 2s between retries
        levelLoadingMaxRetry: 6,      // Robust level retry
        manifestLoadingMaxRetry: 4,   // Manifest retry strategy

        // Memory management
        maxFragLookUpTolerance: 0.1,  // Strict fragment tolerance
        appendErrorMaxRetry: 2,       // Conservative append retries
        nudgeMaxRetry: 5,             // Handle playback stalls
        nudgeOffset: 0.2,             // Jump ahead when stalled

        // Progressive enhancement
        progressive: false,           // Disable for TV compatibility
        renderTextTracksNatively: true, // Use native caption rendering
      },

      mobile: {
        ...baseConfig,
        // Mobile battery and bandwidth optimizations
        maxBufferLength: 60,          // Aggressive memory management
        backBufferLength: 15,         // Minimal back buffer
        maxMaxBufferLength: 90,       // Hard mobile memory limit

        // Mobile network adaptation (cellular awareness)
        abrEwmaFastLive: 2.0,         // Quick adaptation for mobile networks
        abrEwmaSlowLive: 6.0,         // Responsive to network changes
        abrBandWidthFactor: 0.9,      // Slightly aggressive for good networks
        abrBandWidthUpFactor: 0.8,    // Quick quality improvements

        // Mobile-specific quality management
        startLevel: 1,                // Start lower for mobile
        capLevelToPlayerSize: true,   // Optimize for mobile screens
        maxAutoLevel: 4,              // Limit max quality to save bandwidth

        // Battery optimization timeouts
        fragLoadingTimeOut: 15000,    // Faster timeouts to save battery
        manifestLoadingTimeOut: 8000, // Quick manifest loading

        // Mobile error recovery (faster failover)
        fragLoadingMaxRetry: 3,       // Quick retry for mobile
        fragLoadingRetryDelay: 500,   // Faster retry intervals

        // Live streaming for mobile
        liveSyncDurationCount: 2,     // Closer to live edge
        liveMaxLatencyDurationCount: 10, // Faster catchup

        // Progressive loading optimization
        enableSoftwareAES: false,     // Use hardware decryption when available
        progressive: true             // Enable progressive loading
      },

      desktop: {
        ...baseConfig,
        // Desktop performance optimizations (high-end capability)
        maxBufferLength: 300,         // Balanced buffering
        backBufferLength: 120,        // Reasonable back buffer
        maxMaxBufferLength: 600,      // Generous desktop limit

        // Desktop quality optimization
        abrEwmaFastLive: 3.0,         // Balanced adaptation
        abrEwmaSlowLive: 9.0,         // Stability preference
        abrBandWidthFactor: 0.95,     // Optimize bandwidth usage
        abrBandWidthUpFactor: 0.7,    // Conservative quality increases

        // Desktop network handling
        startLevel: -1,               // Auto-detect best quality
        capLevelToPlayerSize: false,  // Allow higher quality than screen

        // Robust error handling for desktop
        fragLoadingTimeOut: 20000,    // Standard timeout
        manifestLoadingTimeOut: 10000, // Fast manifest loading
        fragLoadingMaxRetry: 4,       // Standard retry strategy

        // Live streaming optimization
        liveSyncDurationCount: 3,     // Standard live edge
        lowLatencyMode: false,        // Standard latency mode

        // Desktop-specific features
        enableWorker: true,           // Use worker threads
        workerPath: '/hls-worker.js', // Custom worker path if available

        // Advanced desktop features
        enableSoftwareAES: false,     // Prefer hardware decryption
        enableCEA708Captions: true,   // Full caption support
        enableWebVTT: true,           // WebVTT subtitle support
        enableIMSC1: false,           // Disable IMSC1 unless needed

        // Performance monitoring hooks
        debug: false,                 // Disable debug in production
        enableDateRangeMetadataCues: true // Enable metadata cues
      }
    }

    // Get base configuration for the current mode
    const config = configByMode[this.performanceConfig.mode] || configByMode.desktop

    // Apply global optimizations based on detected network conditions
    if (this.isSlowNetwork()) {
      config.abrBandWidthFactor = Math.min(config.abrBandWidthFactor || 0.95, 0.7)
      config.maxBufferLength = Math.min(config.maxBufferLength || 300, 90)
      config.startLevel = Math.max(config.startLevel || -1, 0) // Force low start level
    }

    // Apply CDN-specific optimizations
    if (this.getCDNProvider() === 'akamai') {
      config.fragLoadingTimeOut = (config.fragLoadingTimeOut || 20000) * 1.2 // Akamai can be slower
    }

    return config
  }

  private isSlowNetwork(): boolean {
    // Detect slow network conditions using Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        // Check for slow connection types
        const slowTypes = ['slow-2g', '2g', '3g']
        if (slowTypes.includes(connection.effectiveType)) {
          return true
        }

        // Check for low bandwidth (less than 1 Mbps)
        if (connection.downlink && connection.downlink < 1) {
          return true
        }
      }
    }

    // Fallback: Check if we've had recent loading issues
    if (this.performanceMetrics.bufferingRatio > 0.1) {
      return true
    }

    return false
  }

  private getCDNProvider(): string {
    // Detect CDN provider from stream URL for optimization
    const src = this.getAttribute('src') || ''

    // Major CDN patterns
    if (src.includes('akamai') || src.includes('akamaihd.net')) return 'akamai'
    if (src.includes('cloudfront.net') || src.includes('amazonaws.com')) return 'cloudfront'
    if (src.includes('fastly.com') || src.includes('fastlylb.net')) return 'fastly'
    if (src.includes('limelight') || src.includes('llnwd.net')) return 'limelight'
    if (src.includes('edgecast') || src.includes('systemcdn.net')) return 'edgecast'
    if (src.includes('level3') || src.includes('lswcdn.net')) return 'level3'
    if (src.includes('azure') || src.includes('azureedge.net')) return 'azure'
    if (src.includes('google') || src.includes('googleusercontent.com')) return 'google'

    // FOX-specific CDNs (based on insider knowledge)
    if (src.includes('foxdcg.com') || src.includes('foxnews.com')) return 'akamai' // FOX uses Akamai primarily

    return 'unknown'
  }

  private setupPerformanceOptimization() {
    // Apply performance optimizations based on mode
    switch (this.performanceConfig.mode) {
      case 'smartTV':
        this.applySmartTVOptimizations()
        break
      case 'mobile':
        this.applyMobileOptimizations()
        break
      default:
        this.applyDesktopOptimizations()
        break
    }
  }

  private applySmartTVOptimizations() {
    // Smart TV specific performance optimizations

    // Memory management
    this.setupMemoryMonitoring()

    // CPU optimization - throttle animations to 30fps
    this.setupCPUOptimization()

    // Input response optimization
    this.setupInputOptimization()

    // Visual optimizations for 10-foot viewing
    this.style.setProperty('--button-size', '64px')
    this.style.setProperty('--font-size', '18px')
    this.style.setProperty('--padding', '24px')
  }

  private applyMobileOptimizations() {
    // Mobile specific performance optimizations

    // Reduce buffer sizes for memory constraints
    if (this.hls) {
      this.hls.config.maxBufferLength = 30
      this.hls.config.maxBufferSize = 30 * 1000 * 1000 // 30MB
    }

    // Touch-friendly UI
    this.style.setProperty('--button-size', '48px')
    this.style.setProperty('--font-size', '14px')
    this.style.setProperty('--padding', '16px')

    // Optimize for mobile network conditions
    this.setupMemoryMonitoring()
  }

  private applyDesktopOptimizations() {
    // Desktop optimizations - maximize quality and performance

    // Allow larger buffers for better quality
    if (this.hls) {
      this.hls.config.maxBufferLength = 600
      this.hls.config.maxBufferSize = 120 * 1000 * 1000 // 120MB
    }

    // Standard desktop UI
    this.style.setProperty('--button-size', '36px')
    this.style.setProperty('--font-size', '14px')
    this.style.setProperty('--padding', '12px')
  }

  private setupMemoryMonitoring() {
    // Monitor memory usage and cleanup when approaching limits
    const memoryLimit = this.performanceConfig.memoryLimit * 1024 * 1024 // Convert MB to bytes

    setInterval(() => {
      if ('memory' in performance) {
        const currentMemory = (performance as any).memory.usedJSHeapSize
        this.performanceMetrics.memoryUsage = currentMemory

        // Aggressive cleanup if approaching memory limit
        if (currentMemory > memoryLimit * 0.8) {
          this.performMemoryCleanup()
        }
      }
    }, 5000) // Check every 5 seconds
  }

  private performMemoryCleanup() {
    // Smart TV memory optimization
    if (this.hls) {
      // Reduce buffer size
      this.hls.config.maxBufferLength = Math.min(this.hls.config.maxBufferLength || 300, 120)
      this.hls.config.backBufferLength = Math.min(this.hls.config.backBufferLength || 90, 30)
    }

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }

    this.dispatchPerformanceEvent('memory-cleanup', {
      memoryUsage: this.performanceMetrics.memoryUsage,
      memoryLimit: this.performanceConfig.memoryLimit * 1024 * 1024
    })
  }

  private setupCPUOptimization() {
    // Throttle expensive operations for Smart TV
    let frameCount = 0
    const targetFPS = this.performanceConfig.mode === 'smartTV' ? 30 : 60

    const optimizedRequestAnimationFrame = (callback: FrameRequestCallback) => {
      if (this.performanceConfig.mode === 'smartTV') {
        // Throttle to 30fps for TV
        frameCount++
        if (frameCount % 2 === 0) {
          requestAnimationFrame(callback)
        }
      } else {
        requestAnimationFrame(callback)
      }
    }

    // Override RAF for performance optimization
    ;(this.shadow as any).requestAnimationFrame = optimizedRequestAnimationFrame
  }

  private setupInputOptimization() {
    // Optimize input response for Smart TV D-pad
    const inputElements = this.shadow.querySelectorAll('button, [role="slider"]')

    inputElements.forEach(element => {
      element.addEventListener('keydown', (event) => {
        this.inputResponseStartTime = performance.now()
      })

      element.addEventListener('focus', () => {
        if (this.inputResponseStartTime) {
          const responseTime = performance.now() - this.inputResponseStartTime
          this.performanceMetrics.inputLatency = responseTime

          // Alert if response time exceeds target
          if (responseTime > this.performanceConfig.inputResponseTarget) {
            this.dispatchPerformanceEvent('input-latency-warning', {
              responseTime,
              target: this.performanceConfig.inputResponseTarget
            })
          }
        }
      })
    })
  }

  private setupAdvancedStreamingMetrics(hls: Hls, loadStartTime: number) {
    // Enterprise-grade streaming performance monitoring for FOX-level analytics
    let qualityChangeCount = 0
    let lastQuality = -1
    let segmentStartTime = 0
    let totalSegmentLoadTime = 0
    let segmentLoadCount = 0
    let rebufferStartTime = 0
    let totalRebufferTime = 0
    let rebufferCount = 0

    // Track manifest loading performance
    const manifestStartTime = performance.now()
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.performanceMetrics.manifestLoadTime = performance.now() - manifestStartTime
    })

    // Track fragment loading performance
    hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
      segmentStartTime = performance.now()
    })

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      if (segmentStartTime > 0) {
        const loadTime = performance.now() - segmentStartTime
        totalSegmentLoadTime += loadTime
        segmentLoadCount++
        this.performanceMetrics.segmentLoadTime = totalSegmentLoadTime / segmentLoadCount

        // Calculate throughput
        if (data.frag && data.payload && loadTime > 0) {
          const throughputBps = (data.payload.byteLength * 8) / (loadTime / 1000) // bits per second
          this.performanceMetrics.throughputMbps = throughputBps / 1000000 // Mbps
        }
      }
    })

    // Track quality level changes for stability metrics
    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      if (lastQuality !== -1 && lastQuality !== data.level) {
        qualityChangeCount++
        this.performanceMetrics.qualityLevelChanges = qualityChangeCount
      }
      lastQuality = data.level

      // Calculate average quality
      if (hls.levels && hls.levels.length > 0) {
        const currentQuality = hls.levels[data.level]
        if (currentQuality) {
          // Use bitrate as quality indicator
          this.performanceMetrics.averageQuality = currentQuality.bitrate / 1000 // kbps
        }
      }

      // Calculate quality stability (fewer changes = higher stability)
      const totalDuration = this.video?.currentTime || 1
      this.performanceMetrics.qualityStability = Math.max(0, 100 - (qualityChangeCount / totalDuration) * 10)
    })

    // Track buffering events using video element
    if (this.video) {
      this.video.addEventListener('waiting', () => {
        rebufferStartTime = performance.now()
        rebufferCount++
        this.performanceMetrics.rebufferEvents = rebufferCount
      })

      this.video.addEventListener('canplay', () => {
        if (rebufferStartTime > 0) {
          const rebufferTime = performance.now() - rebufferStartTime
          totalRebufferTime += rebufferTime
          this.performanceMetrics.totalRebufferTime = totalRebufferTime
          rebufferStartTime = 0
        }
      })
    }

    // Track CDN switches (simplified tracking)
    // Note: Advanced CDN switching detection would require additional monitoring

    // Track errors for reliability metrics
    hls.on(Hls.Events.ERROR, (event, data) => {
      this.performanceMetrics.errorCount++

      // Log specific error types for analytics
      this.dispatchPerformanceEvent('streaming-error', {
        errorType: data.type,
        errorDetails: data.details,
        fatal: data.fatal,
        performance: this.performanceMetrics
      })
    })

    // Track seek accuracy
    if (this.video) {
      let seekTargetTime = 0
      this.video.addEventListener('seeking', () => {
        seekTargetTime = this.video?.currentTime || 0
      })

      this.video.addEventListener('seeked', () => {
        if (seekTargetTime > 0 && this.video) {
          const actualTime = this.video.currentTime
          const seekError = Math.abs(actualTime - seekTargetTime)
          const accuracy = Math.max(0, 100 - (seekError * 10)) // 0.1s error = 99% accuracy
          this.performanceMetrics.seekAccuracy = accuracy
        }
      })
    }

    // Calculate bitrate efficiency (actual vs available bandwidth)
    const updateBitrateEfficiency = () => {
      if (hls.levels && this.performanceMetrics.throughputMbps > 0) {
        const currentLevel = hls.levels[hls.currentLevel]
        if (currentLevel) {
          const currentBitrateMbps = currentLevel.bitrate / 1000000
          this.performanceMetrics.bitrateEfficiency =
            Math.min(100, (currentBitrateMbps / this.performanceMetrics.throughputMbps) * 100)
        }
      }
    }

    // Update efficiency metrics periodically
    setInterval(updateBitrateEfficiency, 5000)

    // Dispatch comprehensive streaming analytics
    const dispatchStreamingAnalytics = () => {
      this.dispatchPerformanceEvent('streaming-analytics', {
        sessionDuration: performance.now() - loadStartTime,
        videoLoadTime: this.performanceMetrics.videoStartTime,
        streamingMetrics: {
          manifestLoadTime: this.performanceMetrics.manifestLoadTime,
          averageSegmentLoadTime: this.performanceMetrics.segmentLoadTime,
          throughputMbps: this.performanceMetrics.throughputMbps,
          qualityChanges: this.performanceMetrics.qualityLevelChanges,
          qualityStability: this.performanceMetrics.qualityStability,
          rebufferEvents: this.performanceMetrics.rebufferEvents,
          totalRebufferTime: this.performanceMetrics.totalRebufferTime,
          errorCount: this.performanceMetrics.errorCount,
          seekAccuracy: this.performanceMetrics.seekAccuracy,
          bitrateEfficiency: this.performanceMetrics.bitrateEfficiency
        },
        performanceTargets: {
          manifestLoadTarget: 2000, // 2s max
          segmentLoadTarget: 5000,  // 5s max
          rebufferRateTarget: 0.01, // <1%
          qualityStabilityTarget: 85, // 85% stability
          seekAccuracyTarget: 95    // 95% accuracy
        }
      })
    }

    // Send analytics every 30 seconds
    setInterval(dispatchStreamingAnalytics, 30000)
  }

  private startPerformanceMonitoring() {
    // Real-time performance monitoring
    this.performanceMonitoringInterval = window.setInterval(() => {
      this.updatePerformanceMetrics()
      this.updatePerformanceIndicator()
      this.dispatchPerformanceEvent('performance-update', this.performanceMetrics)
    }, 2000) // Update every 2 seconds
  }

  private updatePerformanceMetrics() {
    // Collect current performance metrics
    if ('memory' in performance) {
      this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize
    }

    // Calculate buffering ratio
    if (this.video) {
      const buffered = this.video.buffered
      const currentTime = this.video.currentTime
      const duration = this.video.duration

      if (duration > 0) {
        let totalBuffered = 0
        for (let i = 0; i < buffered.length; i++) {
          totalBuffered += buffered.end(i) - buffered.start(i)
        }
        this.performanceMetrics.bufferingRatio = (duration - totalBuffered) / duration
      }
    }
  }

  private updatePerformanceIndicator() {
    const indicator = this.shadow.getElementById('perf-indicator')
    if (indicator) {
      const memoryMB = Math.round(this.performanceMetrics.memoryUsage / 1024 / 1024)
      const inputLatency = Math.round(this.performanceMetrics.inputLatency)

      indicator.textContent = `Memory: ${memoryMB}MB | Input: ${inputLatency}ms | Mode: ${this.performanceConfig.mode}`

      // Color coding based on performance
      if (memoryMB > this.performanceConfig.memoryLimit * 0.8) {
        indicator.style.background = 'rgba(239, 68, 68, 0.8)' // Red warning
      } else if (memoryMB > this.performanceConfig.memoryLimit * 0.6) {
        indicator.style.background = 'rgba(245, 158, 11, 0.8)' // Yellow caution
      } else {
        indicator.style.background = 'rgba(34, 197, 94, 0.8)' // Green good
      }
    }
  }

  private updateQualitySelector() {
    if (!this.hls) return

    const qualitySelector = this.shadow.getElementById('quality') as HTMLSelectElement
    if (qualitySelector) {
      // Clear existing options except Auto
      qualitySelector.innerHTML = '<option value="auto">Auto</option>'

      // Add quality levels from HLS
      this.hls.levels.forEach((level, index) => {
        const option = document.createElement('option')
        option.value = index.toString()
        option.textContent = `${level.height}p`
        qualitySelector.appendChild(option)
      })
    }
  }

  private setupEventListeners() {
    // Ensure video element is always accessible
    const getVideoElement = () => {
      if (!this.video) {
        this.video = this.shadow.querySelector('.video-element') as HTMLVideoElement
      }
      return this.video
    }

    // Play/Pause button with better event delegation
    const playPauseBtn = this.shadow.getElementById('play-pause')
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', async () => {
        const video = getVideoElement()
        if (!video) {
          console.warn('[HLSVideoPlayer] Video element not found for play/pause')
          return
        }

        try {
          if (video.paused) {
            await video.play()
            playPauseBtn.textContent = '⏸️'
            playPauseBtn.setAttribute('aria-label', 'Pause video')
          } else {
            video.pause()
            playPauseBtn.textContent = '▶️'
            playPauseBtn.setAttribute('aria-label', 'Play video')
          }
        } catch (error) {
          console.error('[HLSVideoPlayer] Play/pause error:', error)
        }
      })
    }

    // Quality selector
    const qualitySelector = this.shadow.getElementById('quality') as HTMLSelectElement
    if (qualitySelector) {
      qualitySelector.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement
        this.changeQuality(target.value)
      })
    }

    // Volume/Mute button with state tracking
    const volumeBtn = this.shadow.getElementById('volume')
    if (volumeBtn) {
      // Track previous volume for unmuting
      let previousVolume = 1.0

      volumeBtn.addEventListener('click', () => {
        const video = getVideoElement()
        if (!video) {
          console.warn('[HLSVideoPlayer] Video element not found for volume control')
          return
        }

        if (video.muted || video.volume === 0) {
          // Unmute and restore volume
          video.muted = false
          video.volume = previousVolume > 0 ? previousVolume : 1.0
          volumeBtn.textContent = '🔊'
          volumeBtn.setAttribute('aria-label', 'Mute volume')
          console.log('[HLSVideoPlayer] Volume unmuted:', video.volume)
        } else {
          // Save current volume and mute
          previousVolume = video.volume
          video.muted = true
          volumeBtn.textContent = '🔇'
          volumeBtn.setAttribute('aria-label', 'Unmute volume')
          console.log('[HLSVideoPlayer] Volume muted')
        }
      })
    }

    // Progress bar seeking with enhanced Shadow DOM support
    const progressContainer = this.shadow.querySelector('.progress-container') as HTMLElement
    const progressBar = this.shadow.querySelector('.progress-bar') as HTMLElement

    // Enhanced seek handler with better coordinate calculation
    const handleSeek = (event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const video = getVideoElement()
      if (!video) {
        console.warn('[HLSVideoPlayer] Video not available for seeking')
        return
      }

      // Wait for metadata if not loaded
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        console.log('[HLSVideoPlayer] Waiting for metadata before seeking...')
        video.addEventListener('loadedmetadata', () => {
          handleSeek(event)
        }, { once: true })
        return
      }

      const duration = video.duration
      if (!isFinite(duration) || duration <= 0) {
        console.warn('[HLSVideoPlayer] Invalid duration for seeking:', duration)
        return
      }

      // Get click/touch position
      let clientX: number
      if (event instanceof MouseEvent) {
        clientX = event.clientX
      } else {
        clientX = event.touches[0].clientX
      }

      // Calculate position relative to progress bar
      const rect = progressBar.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const percentage = clickX / rect.width
      const newTime = percentage * duration

      // Apply seek with validation
      if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
        video.currentTime = newTime
        this.updateProgressBar() // Immediate visual feedback
        console.log(`[HLSVideoPlayer] Seeked to ${newTime.toFixed(2)}s (${(percentage * 100).toFixed(1)}%)`)
      }
    }

    // Add event listeners to progress elements
    if (progressContainer && progressBar) {
      // Click to seek
      progressBar.addEventListener('click', handleSeek)
      progressContainer.addEventListener('click', handleSeek)
    }

    // Add drag-to-seek functionality for better UX
    let isDragging = false
    progressContainer?.addEventListener('mousedown', (event) => {
      event.preventDefault()
      isDragging = true
      handleSeek(event) // Seek immediately on mousedown

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (isDragging) {
          handleSeek(moveEvent)
        }
      }

      const onMouseUp = () => {
        isDragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    // Touch support for mobile devices
    progressContainer?.addEventListener('touchstart', (event) => {
      event.preventDefault()
      const touch = event.touches[0]
      const mouseEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY
      })
      handleSeek(mouseEvent)
    })

    // Fullscreen
    const fullscreenBtn = this.shadow.getElementById('fullscreen')
    fullscreenBtn?.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        this.requestFullscreen()
      }
    })

    // Keyboard navigation for Smart TV
    this.addEventListener('keydown', this.handleKeyboardInput.bind(this))
  }

  private async handleKeyboardInput(event: KeyboardEvent) {
    // Get video element reference
    const video = this.video || (this.shadow.querySelector('.video-element') as HTMLVideoElement)

    // Smart TV D-pad navigation
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault()
        if (video) {
          if (video.paused) {
            try {
              await video.play()
            } catch (error) {
              console.log('Play was interrupted:', error)
            }
          } else {
            video.pause()
          }
        }
        break

      case 'ArrowLeft':
        event.preventDefault()
        if (video && !isNaN(video.duration) && isFinite(video.currentTime)) {
          const newTime = Math.max(0, video.currentTime - 10)
          if (isFinite(newTime)) {
            video.currentTime = newTime
          }
        }
        break

      case 'ArrowRight':
        event.preventDefault()
        if (video && !isNaN(video.duration) && isFinite(video.currentTime)) {
          const newTime = Math.min(
            video.duration || 0,
            video.currentTime + 10
          )
          if (isFinite(newTime)) {
            video.currentTime = newTime
          }
        }
        break

      case 'f':
      case 'F':
        event.preventDefault()
        document.fullscreenElement ? document.exitFullscreen() : this.requestFullscreen()
        break
    }
  }

  private updateTimeDisplay() {
    if (!this.video) return

    const currentTimeEl = this.shadow.getElementById('current-time')
    const durationEl = this.shadow.getElementById('duration')

    if (currentTimeEl && durationEl) {
      currentTimeEl.textContent = this.formatTime(this.video.currentTime)
      durationEl.textContent = this.formatTime(this.video.duration)
    }
  }

  private updateProgressBar() {
    if (!this.video) return

    const progressFill = this.shadow.querySelector('.progress-fill') as HTMLElement
    const progressBuffer = this.shadow.querySelector('.progress-buffer') as HTMLElement

    // Check if duration is valid before updating progress
    if (progressFill && isFinite(this.video.duration) && this.video.duration > 0) {
      const progress = (this.video.currentTime / this.video.duration) * 100
      progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`
    }

    // Update buffer indicator
    if (progressBuffer && this.video.buffered.length > 0 && isFinite(this.video.duration) && this.video.duration > 0) {
      try {
        const buffered = this.video.buffered.end(this.video.buffered.length - 1)
        const bufferProgress = (buffered / this.video.duration) * 100
        progressBuffer.style.width = `${Math.min(100, Math.max(0, bufferProgress))}%`
      } catch (e) {
        // Buffered range may not be available yet
        progressBuffer.style.width = '0%'
      }
    }
  }

  private changeQuality(qualityIndex: string) {
    if (!this.hls) return

    const index = parseInt(qualityIndex)
    if (qualityIndex === 'auto') {
      this.hls.currentLevel = -1 // Auto quality
    } else {
      this.hls.currentLevel = index
    }

    this.dispatchPerformanceEvent('quality-changed', {
      quality: qualityIndex === 'auto' ? 'auto' : `${this.hls.levels[index]?.height}p`,
      performance: this.performanceMetrics
    })
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00'

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  private dispatchPerformanceEvent(eventType: string, data: any) {
    // Dispatch custom events for performance monitoring
    this.dispatchEvent(new CustomEvent('hls-performance', {
      detail: {
        type: eventType,
        data: data,
        timestamp: Date.now(),
        performanceMode: this.performanceConfig.mode
      },
      bubbles: true
    }))
  }

  private cleanup() {
    // Cleanup for memory management
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }

    if (this.performanceMonitoringInterval) {
      clearInterval(this.performanceMonitoringInterval)
      this.performanceMonitoringInterval = null
    }

    // Remove event listeners
    this.video?.removeEventListener('timeupdate', this.updateTimeDisplay)
    this.removeEventListener('keydown', this.handleKeyboardInput)
  }

  // Public API for programmatic control
  public play() {
    return this.video?.play()
  }

  public pause() {
    this.video?.pause()
  }

  public seek(time: number) {
    if (this.video && isFinite(time) && !isNaN(time)) {
      this.video.currentTime = Math.max(0, Math.min(time, this.video.duration || 0))
    }
  }

  public setQuality(quality: string) {
    this.changeQuality(quality)
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  // Testing support methods
  public getHLSInstance(): any {
    return this.hls
  }

  // Performance optimization methods
  public optimizeForSmartTV() {
    this.setAttribute('performance-mode', 'smartTV')
    this.setAttribute('memory-limit', '100')
    this.setAttribute('cpu-limit', '30')
  }

  public optimizeForMobile() {
    this.setAttribute('performance-mode', 'mobile')
    this.setAttribute('memory-limit', '200')
  }
}

// Register the Web Component
customElements.define('hls-video-player', HLSVideoPlayer)

// Export for TypeScript support
export { HLSVideoPlayer }
export type { PerformanceMetrics, PerformanceConfig }