/**
 * Streaming Analytics Service
 * Integrates with deployed streaming-backend for QoE analytics and performance monitoring
 *
 * Features:
 * - Real-time QoE (Quality of Experience) scoring
 * - Bandwidth estimation and quality recommendations
 * - Performance analytics collection
 * - Smart TV optimization metrics
 * - Netflix-style analytics dashboard
 */

export interface QoEMetrics {
  // Core quality metrics
  qualityScore: number // 0-5 scale (Netflix-style)
  rebufferRatio: number // Percentage of time spent rebuffering
  startupTime: number // Time to first frame (ms)
  resolutionQuality: number // Average resolution quality
  bitrateStability: number // Quality consistency score

  // Performance metrics
  throughputMbps: number // Network throughput
  latency: number // Network latency (ms)
  errorRate: number // Error occurrence rate
  seekAccuracy: number // Seek operation accuracy %

  // Session metrics
  sessionDuration: number // Total viewing time
  engagementScore: number // User engagement rating
  platformType: 'smartTV' | 'mobile' | 'desktop'

  // Advanced metrics
  manifestLoadTime: number
  segmentLoadTime: number
  decodingLatency: number
  memoryUsage: number
  cpuUsage: number
}

export interface QualityRecommendation {
  recommendedLevel: number
  confidence: number // 0-1 confidence score
  reason: string
  networkConditions: {
    bandwidth: number
    latency: number
    stability: string
  }
  deviceCapabilities: {
    maxResolution: string
    hardwareDecoding: boolean
    memoryAvailable: number
  }
}

export interface AnalyticsEvent {
  type: 'playback_start' | 'playback_end' | 'quality_change' | 'rebuffer_start' | 'rebuffer_end' | 'seek' | 'error' | 'performance_update'
  timestamp: number
  sessionId: string
  userId?: string
  contentId: string

  // Event-specific data
  data: {
    currentTime?: number
    quality?: number
    bufferLength?: number
    error?: string
    metrics?: Partial<QoEMetrics>
  }
}

class StreamingAnalyticsService {
  private baseUrl: string
  private sessionId: string
  private contentId: string
  private analyticsBuffer: AnalyticsEvent[] = []
  private qoeHistory: QoEMetrics[] = []
  private batchSize = 10
  private flushInterval = 30000 // 30 seconds
  private flushTimer: number | null = null

  constructor(backendUrl: string = 'https://streaming-backend-gamma.vercel.app') {
    this.baseUrl = backendUrl
    this.sessionId = this.generateSessionId()
    this.contentId = 'default-content'
    this.startPeriodicFlush()
  }

  /**
   * Initialize analytics session
   */
  async initializeSession(contentId: string, userId?: string): Promise<void> {
    this.contentId = contentId

    const startEvent: AnalyticsEvent = {
      type: 'playback_start',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId,
      contentId: this.contentId,
      data: {
        currentTime: 0
      }
    }

    this.addEvent(startEvent)

    // Validate backend connectivity
    try {
      await this.validateBackendConnection()
      console.log('[StreamingAnalytics] Backend connection validated')
    } catch (error) {
      console.warn('[StreamingAnalytics] Backend validation failed:', error)
    }
  }

  /**
   * Validate backend connectivity
   */
  private async validateBackendConnection(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': this.sessionId
      }
    })

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`)
    }

    const health = await response.json()
    console.log('[StreamingAnalytics] Backend health:', health)
  }

  /**
   * Calculate QoE score using Netflix-style algorithm
   */
  calculateQoEScore(metrics: Partial<QoEMetrics>): number {
    // Netflix-style QoE calculation (0-5 scale)
    let score = 5.0 // Start with perfect score

    // Penalize rebuffering (most important factor)
    if (metrics.rebufferRatio !== undefined) {
      score -= Math.min(2.0, metrics.rebufferRatio * 20) // -2 points max for rebuffering
    }

    // Penalize slow startup
    if (metrics.startupTime !== undefined) {
      const startupPenalty = Math.max(0, (metrics.startupTime - 2000) / 1000) // Penalty after 2s
      score -= Math.min(1.0, startupPenalty * 0.5) // -1 point max for startup
    }

    // Reward quality stability
    if (metrics.bitrateStability !== undefined) {
      const stabilityBonus = (metrics.bitrateStability - 80) / 20 // Bonus above 80%
      score += Math.max(0, Math.min(0.5, stabilityBonus * 0.5))
    }

    // Penalize excessive quality changes
    if (metrics.qualityScore !== undefined && metrics.qualityScore < 3) {
      score -= (3 - metrics.qualityScore) * 0.3
    }

    // Error rate impact
    if (metrics.errorRate !== undefined) {
      score -= Math.min(1.0, metrics.errorRate * 10)
    }

    return Math.max(0, Math.min(5, Number(score.toFixed(2))))
  }

  /**
   * Get bandwidth estimation and quality recommendations
   */
  async getBandwidthEstimation(): Promise<QualityRecommendation> {
    try {
      const response = await fetch(`${this.baseUrl}/bandwidth/estimate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
          'X-Device-Type': this.getDeviceType()
        }
      })

      if (!response.ok) {
        throw new Error(`Bandwidth estimation failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        recommendedLevel: data.recommendedQuality || 2,
        confidence: data.confidence || 0.8,
        reason: data.reason || 'Based on network analysis',
        networkConditions: {
          bandwidth: data.estimatedBandwidth || 5.0,
          latency: data.networkLatency || 50,
          stability: data.connectionStability || 'stable'
        },
        deviceCapabilities: {
          maxResolution: this.getMaxResolution(),
          hardwareDecoding: this.hasHardwareDecoding(),
          memoryAvailable: this.getAvailableMemory()
        }
      }
    } catch (error) {
      console.error('[StreamingAnalytics] Bandwidth estimation error:', error)

      // Fallback recommendation
      return {
        recommendedLevel: 2,
        confidence: 0.5,
        reason: 'Fallback recommendation (backend unavailable)',
        networkConditions: {
          bandwidth: 3.0,
          latency: 100,
          stability: 'unknown'
        },
        deviceCapabilities: {
          maxResolution: '1920x1080',
          hardwareDecoding: false,
          memoryAvailable: 512
        }
      }
    }
  }

  /**
   * Send analytics events to backend
   */
  async sendAnalytics(events: AnalyticsEvent[]): Promise<void> {
    if (events.length === 0) return

    try {
      const response = await fetch(`${this.baseUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
          'X-Device-Type': this.getDeviceType()
        },
        body: JSON.stringify({
          events,
          sessionMetadata: {
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            platform: this.getDeviceType(),
            timestamp: Date.now(),
            contentId: this.contentId
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Analytics submission failed: ${response.status}`)
      }

      const result = await response.json()

      // Update QoE score from backend
      if (result.qoeScore !== undefined) {
        const qoeMetrics: QoEMetrics = {
          qualityScore: result.qoeScore,
          rebufferRatio: result.rebufferRatio || 0,
          startupTime: result.startupTime || 0,
          resolutionQuality: result.resolutionQuality || 0,
          bitrateStability: result.bitrateStability || 100,
          throughputMbps: result.throughputMbps || 0,
          latency: result.latency || 0,
          errorRate: result.errorRate || 0,
          seekAccuracy: result.seekAccuracy || 100,
          sessionDuration: Date.now() - events[0].timestamp,
          engagementScore: result.engagementScore || 0,
          platformType: this.getDeviceType() as any,
          manifestLoadTime: result.manifestLoadTime || 0,
          segmentLoadTime: result.segmentLoadTime || 0,
          decodingLatency: result.decodingLatency || 0,
          memoryUsage: result.memoryUsage || 0,
          cpuUsage: result.cpuUsage || 0
        }

        this.qoeHistory.push(qoeMetrics)

        // Dispatch QoE update event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('streaming-qoe-update', {
            detail: qoeMetrics
          }))
        }
      }

      console.log('[StreamingAnalytics] Analytics sent successfully:', result)
    } catch (error) {
      console.error('[StreamingAnalytics] Analytics submission error:', error)
      // Store failed events for retry
      this.analyticsBuffer.unshift(...events)
    }
  }

  /**
   * Add analytics event to buffer
   */
  addEvent(event: AnalyticsEvent): void {
    this.analyticsBuffer.push(event)

    // Auto-flush if buffer is full
    if (this.analyticsBuffer.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Partial<QoEMetrics>): void {
    const qoeScore = this.calculateQoEScore(metrics)

    const performanceEvent: AnalyticsEvent = {
      type: 'performance_update',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      contentId: this.contentId,
      data: {
        metrics: {
          ...metrics,
          qualityScore: qoeScore
        }
      }
    }

    this.addEvent(performanceEvent)
  }

  /**
   * Track quality change
   */
  trackQualityChange(newQuality: number, reason: string): void {
    const qualityEvent: AnalyticsEvent = {
      type: 'quality_change',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      contentId: this.contentId,
      data: {
        quality: newQuality
      }
    }

    this.addEvent(qualityEvent)
    console.log(`[StreamingAnalytics] Quality changed to level ${newQuality}: ${reason}`)
  }

  /**
   * Track rebuffering events
   */
  trackRebuffering(isStart: boolean, bufferLength?: number): void {
    const rebufferEvent: AnalyticsEvent = {
      type: isStart ? 'rebuffer_start' : 'rebuffer_end',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      contentId: this.contentId,
      data: {
        bufferLength
      }
    }

    this.addEvent(rebufferEvent)
  }

  /**
   * Track errors
   */
  trackError(error: string, currentTime?: number): void {
    const errorEvent: AnalyticsEvent = {
      type: 'error',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      contentId: this.contentId,
      data: {
        error,
        currentTime
      }
    }

    this.addEvent(errorEvent)
    console.error(`[StreamingAnalytics] Error tracked: ${error}`)
  }

  /**
   * Flush analytics buffer
   */
  async flush(): Promise<void> {
    if (this.analyticsBuffer.length === 0) return

    const eventsToSend = this.analyticsBuffer.splice(0, this.batchSize)
    await this.sendAnalytics(eventsToSend)
  }

  /**
   * Get current QoE metrics
   */
  getCurrentQoE(): QoEMetrics | null {
    return this.qoeHistory.length > 0 ? this.qoeHistory[this.qoeHistory.length - 1] : null
  }

  /**
   * Get QoE trend (improving/declining)
   */
  getQoETrend(): { direction: 'improving' | 'declining' | 'stable', change: number } {
    if (this.qoeHistory.length < 2) {
      return { direction: 'stable', change: 0 }
    }

    const recent = this.qoeHistory[this.qoeHistory.length - 1]
    const previous = this.qoeHistory[this.qoeHistory.length - 2]
    const change = recent.qualityScore - previous.qualityScore

    return {
      direction: change > 0.1 ? 'improving' : change < -0.1 ? 'declining' : 'stable',
      change: Number(change.toFixed(2))
    }
  }

  /**
   * Start periodic analytics flushing
   */
  private startPeriodicFlush(): void {
    if (typeof window !== 'undefined') {
      this.flushTimer = window.setInterval(() => {
        this.flush()
      }, this.flushInterval)
    }
  }

  /**
   * Stop analytics service
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // Final flush
    this.flush()

    // Send session end event
    const endEvent: AnalyticsEvent = {
      type: 'playback_end',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      contentId: this.contentId,
      data: {}
    }

    this.addEvent(endEvent)
    this.flush()
  }

  // Utility methods
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('smart-tv') || userAgent.includes('tizen') || userAgent.includes('webos')) {
      return 'smartTV'
    }

    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return 'mobile'
    }

    return 'desktop'
  }

  private getMaxResolution(): string {
    const screen = window.screen
    return `${screen.width}x${screen.height}`
  }

  private hasHardwareDecoding(): boolean {
    // Simplified hardware decoding detection
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl')
    return context !== null
  }

  private getAvailableMemory(): number {
    // Estimate available memory
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return Math.round((memory.jsHeapSizeLimit - memory.usedJSHeapSize) / 1024 / 1024) // MB
    }
    return 512 // Default fallback
  }
}

// Create singleton instance only on client side
let streamingAnalyticsInstance: StreamingAnalyticsService | null = null

export const streamingAnalytics = (() => {
  if (typeof window === 'undefined') {
    // Return a stub for SSR
    return {
      initializeSession: async () => {},
      getBandwidthEstimation: async () => ({ recommendedLevel: 2, confidence: 0.8, reason: 'SSR fallback', networkConditions: { bandwidth: 5, latency: 50, stability: 'stable' }, deviceCapabilities: { maxResolution: '1920x1080', hardwareDecoding: false, memoryAvailable: 512 } }),
      sendAnalytics: async () => {},
      addEvent: () => {},
      trackPerformance: () => {},
      trackQualityChange: () => {},
      trackRebuffering: () => {},
      trackError: () => {},
      flush: async () => {},
      getCurrentQoE: () => null,
      getQoETrend: () => ({ direction: 'stable' as const, change: 0 }),
      destroy: () => {}
    } as any
  }

  if (!streamingAnalyticsInstance) {
    streamingAnalyticsInstance = new StreamingAnalyticsService()
  }
  return streamingAnalyticsInstance
})()

export default StreamingAnalyticsService