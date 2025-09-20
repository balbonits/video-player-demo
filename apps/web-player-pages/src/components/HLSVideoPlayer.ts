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
      bufferingRatio: 0
    }
  }

  connectedCallback() {
    this.parseAttributes()
    this.render()
    this.initializeVideoPlayer()
    this.setupPerformanceOptimization()
    this.startPerformanceMonitoring()
    this.setupEventListeners()
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
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        }

        .progress-fill {
          height: 100%;
          background: #0066cc;
          border-radius: 3px;
          transition: width 0.1s ease;
        }

        .progress-buffer {
          position: absolute;
          height: 100%;
          background: rgba(255,255,255,0.5);
          border-radius: 3px;
          top: 0;
          left: 0;
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

    const src = this.getAttribute('src')
    if (src) {
      this.loadVideo(src)
    }
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

        // Performance monitoring for HLS events
        this.hls.on(Hls.Events.FRAG_LOADED, () => {
          this.updatePerformanceMetrics()
        })

        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            this.dispatchPerformanceEvent('error', { error: data.details, performance: this.performanceMetrics })
          }
        })

      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        this.video.src = src
        this.performanceMetrics.videoStartTime = performance.now() - startTime
      } else {
        throw new Error('HLS not supported in this browser')
      }
    } catch (error) {
      this.dispatchPerformanceEvent('error', { error: error.message })
    }
  }

  private getHLSConfig(): Partial<Hls['config']> {
    // Performance-optimized HLS configuration based on mode
    const baseConfig = {
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 300,
      startLevel: -1,
      capLevelToPlayerSize: true
    }

    switch (this.performanceConfig.mode) {
      case 'smartTV':
        return {
          ...baseConfig,
          maxBufferLength: 180,        // Conservative for TV memory
          backBufferLength: 60,        // Reduced back buffer
          lowLatencyMode: false,       // Prioritize compatibility
          maxMaxBufferLength: 300,     // Hard limit for TV memory
          liveSyncDurationCount: 3     // Live streaming optimization
        }

      case 'mobile':
        return {
          ...baseConfig,
          maxBufferLength: 120,        // Mobile memory constraints
          backBufferLength: 30,        // Minimal back buffer
          startLevel: 2,               // Start with medium quality
          capLevelToPlayerSize: true   // Optimize for mobile screens
        }

      default: // desktop
        return {
          ...baseConfig,
          maxBufferLength: 600,        // Generous buffering
          backBufferLength: 180,       // Large back buffer
          startLevel: -1               // Auto-detect best quality
        }
    }
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
    if (!this.video) return

    // Play/Pause button
    const playPauseBtn = this.shadow.getElementById('play-pause')
    playPauseBtn?.addEventListener('click', () => {
      if (this.video?.paused) {
        this.video.play()
      } else {
        this.video?.pause()
      }
    })

    // Video events
    this.video.addEventListener('play', () => {
      const playPauseBtn = this.shadow.getElementById('play-pause')
      if (playPauseBtn) {
        playPauseBtn.textContent = '⏸️'
        playPauseBtn.setAttribute('aria-label', 'Pause video')
      }
    })

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

    // Quality selector
    const qualitySelector = this.shadow.getElementById('quality')
    qualitySelector?.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement
      this.changeQuality(target.value)
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

  private handleKeyboardInput(event: KeyboardEvent) {
    // Smart TV D-pad navigation
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault()
        this.video?.paused ? this.video?.play() : this.video?.pause()
        break

      case 'ArrowLeft':
        event.preventDefault()
        if (this.video) {
          this.video.currentTime = Math.max(0, this.video.currentTime - 10)
        }
        break

      case 'ArrowRight':
        event.preventDefault()
        if (this.video) {
          this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10)
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

    if (progressFill && this.video.duration) {
      const progress = (this.video.currentTime / this.video.duration) * 100
      progressFill.style.width = `${progress}%`
    }

    if (progressBuffer && this.video.buffered.length > 0 && this.video.duration) {
      const buffered = this.video.buffered.end(this.video.buffered.length - 1)
      const bufferProgress = (buffered / this.video.duration) * 100
      progressBuffer.style.width = `${bufferProgress}%`
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
    if (this.video) {
      this.video.currentTime = time
    }
  }

  public setQuality(quality: string) {
    this.changeQuality(quality)
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
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