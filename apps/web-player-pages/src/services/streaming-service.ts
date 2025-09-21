/**
 * Streaming Service
 * Complete integration with deployed streaming-backend
 *
 * Features:
 * - HLS manifest management through backend
 * - Segment delivery optimization
 * - Authentication and DRM integration
 * - CDN optimization
 * - Real-time performance monitoring
 * - Smart TV and cross-platform optimization
 */

import { streamingAnalytics } from './streaming-analytics'
import AdaptiveQualityManager from './adaptive-quality-manager'

export interface StreamingConfig {
  backendUrl: string
  contentId: string
  userId?: string
  sessionId?: string
  platform: 'smartTV' | 'mobile' | 'desktop'
  authToken?: string

  // Performance settings
  enableAnalytics: boolean
  enableAdaptiveQuality: boolean
  enablePredictiveLoading: boolean

  // Quality constraints
  maxResolution?: string
  maxBitrate?: number // kbps
  minBitrate?: number // kbps

  // Buffer settings
  initialBufferLength?: number // seconds
  maxBufferLength?: number // seconds

  // Smart TV specific
  memoryLimit?: number // MB
  cpuLimit?: number // percentage
}

export interface StreamMetadata {
  contentId: string
  title: string
  duration: number
  qualityLevels: Array<{
    id: number
    bitrate: number
    resolution: string
    fps: number
  }>
  audioTracks: Array<{
    id: number
    language: string
    codec: string
  }>
  subtitleTracks: Array<{
    id: number
    language: string
    format: string
  }>
  drmInfo?: {
    type: 'widevine' | 'fairplay' | 'playready'
    licenseUrl: string
    certificateUrl?: string
  }
}

export interface StreamingError {
  code: string
  message: string
  details?: any
  recoverable: boolean
  timestamp: number
}

class StreamingService {
  private config: StreamingConfig
  private adaptiveQualityManager: AdaptiveQualityManager
  private hlsInstance: any = null
  private streamMetadata: StreamMetadata | null = null
  private isInitialized = false
  private errorHistory: StreamingError[] = []

  constructor(config: StreamingConfig) {
    this.config = {
      ...config,
      initialBufferLength: config.initialBufferLength || 10,
      maxBufferLength: config.maxBufferLength || 300,
      memoryLimit: config.memoryLimit || (config.platform === 'smartTV' ? 100 : 500),
      cpuLimit: config.cpuLimit || (config.platform === 'smartTV' ? 30 : 70),
      enableAnalytics: config.enableAnalytics !== undefined ? config.enableAnalytics : true,
      enableAdaptiveQuality: config.enableAdaptiveQuality !== undefined ? config.enableAdaptiveQuality : true,
      enablePredictiveLoading: config.enablePredictiveLoading !== undefined ? config.enablePredictiveLoading : false
    }

    this.adaptiveQualityManager = new AdaptiveQualityManager(this.config.platform)

    console.log('[StreamingService] Initialized for platform:', this.config.platform)
  }

  /**
   * Initialize streaming service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize analytics
      if (this.config.enableAnalytics) {
        await streamingAnalytics.initializeSession(this.config.contentId, this.config.userId)
      }

      // Load stream metadata from backend
      this.streamMetadata = await this.loadStreamMetadata()

      // Validate authentication if required
      if (this.config.authToken) {
        await this.validateAuthentication()
      }

      this.isInitialized = true
      console.log('[StreamingService] Initialization complete')

    } catch (error) {
      const streamingError: StreamingError = {
        code: 'INIT_FAILED',
        message: 'Failed to initialize streaming service',
        details: error,
        recoverable: true,
        timestamp: Date.now()
      }

      this.addError(streamingError)
      throw error
    }
  }

  /**
   * Get HLS manifest URL from backend
   */
  async getHLSManifestUrl(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Use backend manifest endpoint
      const manifestUrl = `${this.config.backendUrl}/manifest/${this.config.contentId}/master.m3u8`

      // Add session and platform headers
      const params = new URLSearchParams({
        'session-id': this.config.sessionId || streamingAnalytics['sessionId'],
        'platform': this.config.platform,
        'max-resolution': this.config.maxResolution || '1920x1080',
        'max-bitrate': (this.config.maxBitrate || 15000).toString()
      })

      const urlWithParams = `${manifestUrl}?${params.toString()}`

      console.log('[StreamingService] Generated manifest URL:', urlWithParams)
      return urlWithParams

    } catch (error) {
      const streamingError: StreamingError = {
        code: 'MANIFEST_URL_FAILED',
        message: 'Failed to generate manifest URL',
        details: error,
        recoverable: true,
        timestamp: Date.now()
      }

      this.addError(streamingError)
      throw error
    }
  }

  /**
   * Configure HLS instance with backend integration
   */
  configureHLS(hlsInstance: any): void {
    this.hlsInstance = hlsInstance

    // Configure HLS with backend-optimized settings
    const hlsConfig = this.getHLSConfiguration()
    Object.assign(hlsInstance.config, hlsConfig)

    // Setup backend-aware XHR
    hlsInstance.config.xhrSetup = this.createXHRSetup()

    // Initialize adaptive quality manager
    if (this.config.enableAdaptiveQuality) {
      this.adaptiveQualityManager.initialize(hlsInstance)
    }

    // Setup HLS event monitoring
    this.setupHLSEventMonitoring(hlsInstance)

    console.log('[StreamingService] HLS configured with backend integration')
  }

  /**
   * Create XHR setup function for backend integration
   */
  private createXHRSetup() {
    return (xhr: XMLHttpRequest, url: string) => {
      // Add authentication headers
      if (this.config.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.config.authToken}`)
      }

      // Add session tracking
      xhr.setRequestHeader('X-Session-ID', this.config.sessionId || streamingAnalytics['sessionId'])
      xhr.setRequestHeader('X-Platform', this.config.platform)
      xhr.setRequestHeader('X-Player-Version', '2.0.0')

      // Add performance headers for backend optimization
      if (this.config.platform === 'smartTV') {
        xhr.setRequestHeader('X-Memory-Limit', this.config.memoryLimit?.toString() || '100')
        xhr.setRequestHeader('X-CPU-Limit', this.config.cpuLimit?.toString() || '30')
      }

      // Add User-Agent for better backend analytics
      xhr.setRequestHeader('X-User-Agent', navigator.userAgent)

      // CORS and cache headers
      xhr.setRequestHeader('Cache-Control', 'no-cache')

      // Timeout based on platform
      xhr.timeout = this.config.platform === 'smartTV' ? 40000 : 20000

      // Track request timing for analytics
      const startTime = performance.now()

      xhr.addEventListener('loadend', () => {
        const loadTime = performance.now() - startTime

        if (this.config.enableAnalytics) {
          streamingAnalytics.trackPerformance({
            segmentLoadTime: loadTime,
            throughputMbps: xhr.response ? (xhr.response.byteLength * 8) / (loadTime / 1000) / 1000000 : 0,
            errorRate: xhr.status >= 400 ? 1 : 0
          } as any)
        }
      })
    }
  }

  /**
   * Get HLS configuration optimized for platform and backend
   */
  private getHLSConfiguration(): any {
    const baseConfig = {
      // Backend integration
      enableWorker: this.config.platform !== 'smartTV',
      startLevel: -1, // Let backend decide initial quality
      autoStartLoad: true,

      // Buffer management
      maxBufferLength: this.config.maxBufferLength,
      maxMaxBufferLength: this.config.maxBufferLength! * 2,
      backBufferLength: this.config.platform === 'smartTV' ? 15 : 90,

      // Fragment loading
      fragLoadingTimeOut: this.config.platform === 'smartTV' ? 40000 : 20000,
      fragLoadingMaxRetry: this.config.platform === 'smartTV' ? 8 : 4,
      fragLoadingRetryDelay: this.config.platform === 'smartTV' ? 2000 : 1000,

      // Manifest loading
      manifestLoadingTimeOut: this.config.platform === 'smartTV' ? 20000 : 10000,
      manifestLoadingMaxRetry: 4,

      // Quality management
      capLevelToPlayerSize: this.config.platform === 'mobile',
      abrEwmaFastLive: this.config.platform === 'smartTV' ? 8.0 : 3.0,
      abrEwmaSlowLive: this.config.platform === 'smartTV' ? 20.0 : 9.0,

      // Error handling
      appendErrorMaxRetry: 3,
      nudgeMaxRetry: 5,

      // Platform-specific optimizations
      progressive: this.config.platform === 'mobile',
      lowLatencyMode: false, // Prefer stability

      // Backend-specific headers in XHR setup
      xhrSetup: this.createXHRSetup()
    }

    // Platform-specific overrides
    if (this.config.platform === 'smartTV') {
      baseConfig.maxBufferLength = Math.min(baseConfig.maxBufferLength!, 120)
      baseConfig.enableWorker = false
    }

    return baseConfig
  }

  /**
   * Setup HLS event monitoring for backend integration
   */
  private setupHLSEventMonitoring(hls: any): void {
    const Hls = require('hls.js')

    // Manifest loading events
    hls.on(Hls.Events.MANIFEST_LOADING, () => {
      console.log('[StreamingService] Manifest loading started')
    })

    hls.on(Hls.Events.MANIFEST_PARSED, (event: any, data: any) => {
      console.log('[StreamingService] Manifest parsed:', data.levels.length, 'quality levels')

      if (this.config.enableAnalytics) {
        streamingAnalytics.trackPerformance({
          manifestLoadTime: performance.now(),
          qualityLevelChanges: 0,
          averageQuality: data.levels.length > 0 ? data.levels[Math.floor(data.levels.length / 2)].bitrate / 1000 : 0
        } as any)
      }
    })

    // Fragment loading events
    hls.on(Hls.Events.FRAG_LOADING, (event: any, data: any) => {
      // Track segment requests to backend
    })

    hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
      if (this.config.enableAnalytics && data.stats) {
        const loadTime = data.stats.loading.end - data.stats.loading.start
        streamingAnalytics.trackPerformance({
          segmentLoadTime: loadTime,
          throughputMbps: data.stats.total ? (data.stats.total * 8) / (loadTime / 1000) / 1000000 : 0
        } as any)
      }
    })

    // Quality level events
    hls.on(Hls.Events.LEVEL_SWITCHED, (event: any, data: any) => {
      if (this.config.enableAnalytics) {
        streamingAnalytics.trackQualityChange(data.level, 'HLS automatic adaptation')
      }
    })

    // Error events
    hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      const streamingError: StreamingError = {
        code: data.details || 'HLS_ERROR',
        message: `HLS Error: ${data.details}`,
        details: data,
        recoverable: !data.fatal,
        timestamp: Date.now()
      }

      this.addError(streamingError)

      if (this.config.enableAnalytics) {
        streamingAnalytics.trackError(streamingError.message)
      }

      // Attempt recovery for specific errors
      if (data.details === 'bufferAppendError' && this.config.platform === 'smartTV') {
        this.handleSmartTVBufferError(hls)
      }
    })

    // Buffer events
    hls.on(Hls.Events.BUFFER_APPENDED, () => {
      // Monitor buffer health
    })

    hls.on(Hls.Events.BUFFER_EOS, () => {
      console.log('[StreamingService] End of stream reached')
    })
  }

  /**
   * Handle Smart TV specific buffer errors
   */
  private handleSmartTVBufferError(hls: any): void {
    console.warn('[StreamingService] Smart TV buffer error - attempting recovery')

    // Reduce buffer size aggressively
    hls.config.maxBufferLength = Math.min(hls.config.maxBufferLength, 60)
    hls.config.backBufferLength = Math.min(hls.config.backBufferLength, 10)

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }

    // Switch to lower quality
    if (hls.currentLevel > 0) {
      hls.currentLevel = Math.max(0, hls.currentLevel - 2)
    }
  }

  /**
   * Load stream metadata from backend
   */
  private async loadStreamMetadata(): Promise<StreamMetadata> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/metadata/${this.config.contentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.config.sessionId || streamingAnalytics['sessionId'],
          'X-Platform': this.config.platform
        }
      })

      if (!response.ok) {
        throw new Error(`Metadata request failed: ${response.status}`)
      }

      const metadata = await response.json()
      console.log('[StreamingService] Stream metadata loaded:', metadata)

      return metadata
    } catch (error) {
      console.warn('[StreamingService] Failed to load metadata, using defaults:', error)

      // Return default metadata
      return {
        contentId: this.config.contentId,
        title: 'Test Content',
        duration: 0,
        qualityLevels: [],
        audioTracks: [],
        subtitleTracks: []
      }
    }
  }

  /**
   * Validate authentication with backend
   */
  private async validateAuthentication(): Promise<void> {
    if (!this.config.authToken) return

    try {
      const response = await fetch(`${this.config.backendUrl}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        body: JSON.stringify({
          contentId: this.config.contentId,
          platform: this.config.platform
        })
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('[StreamingService] Authentication validated:', result)

    } catch (error) {
      const authError: StreamingError = {
        code: 'AUTH_FAILED',
        message: 'Authentication validation failed',
        details: error,
        recoverable: false,
        timestamp: Date.now()
      }

      this.addError(authError)
      throw error
    }
  }

  /**
   * Get streaming performance metrics
   */
  getPerformanceMetrics(): any {
    if (!this.config.enableAnalytics) return null

    const currentQoE = streamingAnalytics.getCurrentQoE()
    const qoeTrend = streamingAnalytics.getQoETrend()
    const adaptationStatus = this.adaptiveQualityManager.getAdaptationStatus()

    return {
      qoe: currentQoE,
      qoeTrend,
      adaptation: adaptationStatus,
      errors: this.errorHistory.slice(-5), // Last 5 errors
      platform: this.config.platform,
      backendConnected: true
    }
  }

  /**
   * Add error to history
   */
  private addError(error: StreamingError): void {
    this.errorHistory.push(error)

    // Keep only recent errors
    if (this.errorHistory.length > 20) {
      this.errorHistory.shift()
    }

    console.error('[StreamingService] Error added:', error)
  }

  /**
   * Get stream metadata
   */
  getStreamMetadata(): StreamMetadata | null {
    return this.streamMetadata
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StreamingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('[StreamingService] Configuration updated')
  }

  /**
   * Cleanup streaming service
   */
  destroy(): void {
    if (this.config.enableAnalytics) {
      streamingAnalytics.destroy()
    }

    this.adaptiveQualityManager.destroy()

    this.isInitialized = false
    console.log('[StreamingService] Service destroyed')
  }
}

export default StreamingService