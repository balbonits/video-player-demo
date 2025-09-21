/**
 * Adaptive Quality Manager
 * Enterprise-grade adaptive bitrate management using streaming-backend intelligence
 *
 * Features:
 * - Backend-driven quality recommendations
 * - Smart TV memory optimization
 * - Network-aware quality switching
 * - Performance-based adaptation
 * - Predictive quality management
 */

import { streamingAnalytics, QualityRecommendation } from './streaming-analytics'
import type { PerformanceMetrics } from '../components/HLSVideoPlayer'

export interface QualityLevel {
  id: number
  bitrate: number // kbps
  resolution: string
  width: number
  height: number
  fps: number
  codec: string
}

export interface AdaptationRules {
  // Performance constraints
  maxMemoryUsage: number // MB
  maxCpuUsage: number // percentage
  maxInputLatency: number // ms

  // Network constraints
  minBandwidth: number // Mbps
  maxRebufferRatio: number // percentage
  bufferTarget: number // seconds

  // Quality preferences
  preferStability: boolean
  aggressiveUpgrade: boolean
  conservativeDowngrade: boolean

  // Platform-specific settings
  platformOptimizations: {
    smartTV: {
      maxResolution: string
      memoryReserve: number // MB to keep free
      qualityChangeDelay: number // ms
    }
    mobile: {
      batteryAware: boolean
      cellularOptimization: boolean
      maxBitrate: number // kbps
    }
    desktop: {
      allowHighQuality: boolean
      predictiveLoading: boolean
    }
  }
}

export interface AdaptationDecision {
  targetLevel: number
  reason: string
  confidence: number
  delayMs: number
  metrics: {
    currentBandwidth: number
    bufferLength: number
    rebufferRatio: number
    memoryUsage: number
  }
}

class AdaptiveQualityManager {
  private hls: any
  private currentPlatform: 'smartTV' | 'mobile' | 'desktop'
  private qualityLevels: QualityLevel[] = []
  private adaptationRules: AdaptationRules
  private lastDecision: AdaptationDecision | null = null
  private decisionHistory: AdaptationDecision[] = []
  private performanceHistory: PerformanceMetrics[] = []
  private bandwidthHistory: number[] = []
  private adaptationTimer: number | null = null

  // Quality switching locks and delays
  private lastQualityChange = 0
  private isUpgrading = false
  private isDowngrading = false
  private upgradeCooldown = 10000 // 10s between upgrades
  private downgradeCooldown = 5000 // 5s between downgrades

  constructor(platform: 'smartTV' | 'mobile' | 'desktop' = 'desktop') {
    this.currentPlatform = platform
    this.adaptationRules = this.getDefaultRules(platform)
    this.startPeriodicAdaptation()
  }

  /**
   * Initialize with HLS instance
   */
  initialize(hlsInstance: any): void {
    this.hls = hlsInstance
    this.extractQualityLevels()
    this.setupHLSEventListeners()
    this.loadBackendConfiguration()

    console.log(`[AdaptiveQuality] Initialized for ${this.currentPlatform} with ${this.qualityLevels.length} quality levels`)
  }

  /**
   * Extract quality levels from HLS manifest
   */
  private extractQualityLevels(): void {
    if (!this.hls || !this.hls.levels) return

    this.qualityLevels = this.hls.levels.map((level: any, index: number) => ({
      id: index,
      bitrate: Math.round(level.bitrate / 1000), // Convert to kbps
      resolution: `${level.width}x${level.height}`,
      width: level.width,
      height: level.height,
      fps: level.frameRate || 30,
      codec: level.videoCodec || 'h264'
    }))

    // Sort by bitrate for easier management
    this.qualityLevels.sort((a, b) => a.bitrate - b.bitrate)

    console.log('[AdaptiveQuality] Quality levels extracted:', this.qualityLevels)
  }

  /**
   * Setup HLS event listeners for adaptation
   */
  private setupHLSEventListeners(): void {
    if (!this.hls) return

    // Import HLS events
    const Hls = require('hls.js')

    // Track bandwidth changes
    this.hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
      if (data.stats && data.stats.total && data.stats.loading) {
        const bandwidth = (data.stats.total * 8) / (data.stats.loading.end - data.stats.loading.start) // bps
        const bandwidthMbps = bandwidth / 1000000
        this.bandwidthHistory.push(bandwidthMbps)

        // Keep only recent bandwidth measurements
        if (this.bandwidthHistory.length > 10) {
          this.bandwidthHistory.shift()
        }
      }
    })

    // Track quality level changes
    this.hls.on(Hls.Events.LEVEL_SWITCHED, (event: any, data: any) => {
      const level = this.qualityLevels[data.level]
      if (level) {
        streamingAnalytics.trackQualityChange(data.level, 'HLS automatic switch')
        this.lastQualityChange = Date.now()

        console.log(`[AdaptiveQuality] Quality switched to ${level.resolution} (${level.bitrate}kbps)`)
      }
    })

    // Track errors for adaptation
    this.hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      if (data.fatal) {
        this.handleFatalError(data)
      } else {
        this.handleRecoverableError(data)
      }
    })

    // Track buffer events
    this.hls.on(Hls.Events.BUFFER_EOS, () => {
      // End of stream - could trigger final quality assessment
    })

    this.hls.on(Hls.Events.BUFFER_FLUSHED, () => {
      // Buffer flushed - might need to reconsider quality
    })
  }

  /**
   * Load backend-driven configuration
   */
  private async loadBackendConfiguration(): Promise<void> {
    try {
      const recommendation = await streamingAnalytics.getBandwidthEstimation()

      // Apply backend recommendations to adaptation rules
      this.adaptationRules.minBandwidth = recommendation.networkConditions.bandwidth * 0.8 // 80% safety margin
      this.adaptationRules.preferStability = recommendation.confidence < 0.7 // Prefer stability for uncertain conditions

      // Platform-specific backend adjustments
      if (this.currentPlatform === 'smartTV') {
        this.adaptationRules.platformOptimizations.smartTV.memoryReserve =
          Math.max(50, recommendation.deviceCapabilities.memoryAvailable * 0.3)
      }

      console.log('[AdaptiveQuality] Backend configuration applied:', recommendation)
    } catch (error) {
      console.warn('[AdaptiveQuality] Backend configuration failed:', error)
    }
  }

  /**
   * Make adaptation decision based on current conditions
   */
  async makeAdaptationDecision(performanceMetrics: PerformanceMetrics): Promise<AdaptationDecision | null> {
    if (!this.hls || this.qualityLevels.length === 0) return null

    // Add current metrics to history
    this.performanceHistory.push(performanceMetrics)
    if (this.performanceHistory.length > 5) {
      this.performanceHistory.shift()
    }

    const currentLevel = this.hls.currentLevel >= 0 ? this.hls.currentLevel : this.hls.loadLevel
    const currentQuality = this.qualityLevels[currentLevel]

    if (!currentQuality) return null

    // Calculate current conditions
    const avgBandwidth = this.getAverageBandwidth()
    const bufferLength = this.getCurrentBufferLength()
    const rebufferRatio = performanceMetrics.bufferingRatio || 0

    // Check if we need to make a change
    const decision = await this.evaluateQualityChange({
      currentLevel,
      avgBandwidth,
      bufferLength,
      rebufferRatio,
      memoryUsage: performanceMetrics.memoryUsage,
      cpuUsage: performanceMetrics.cpuUsage,
      inputLatency: performanceMetrics.inputLatency
    })

    if (decision) {
      this.lastDecision = decision
      this.decisionHistory.push(decision)
      if (this.decisionHistory.length > 20) {
        this.decisionHistory.shift()
      }
    }

    return decision
  }

  /**
   * Evaluate if quality change is needed
   */
  private async evaluateQualityChange(conditions: {
    currentLevel: number
    avgBandwidth: number
    bufferLength: number
    rebufferRatio: number
    memoryUsage: number
    cpuUsage: number
    inputLatency: number
  }): Promise<AdaptationDecision | null> {

    const { currentLevel, avgBandwidth, bufferLength, rebufferRatio, memoryUsage, cpuUsage, inputLatency } = conditions
    const currentQuality = this.qualityLevels[currentLevel]

    // Get backend recommendation
    let backendRecommendation: QualityRecommendation
    try {
      backendRecommendation = await streamingAnalytics.getBandwidthEstimation()
    } catch (error) {
      console.warn('[AdaptiveQuality] Backend recommendation failed, using local logic')
      backendRecommendation = this.getFallbackRecommendation(conditions)
    }

    // Priority-based decision making

    // 1. CRITICAL: Memory constraints (Smart TV priority)
    if (this.currentPlatform === 'smartTV' && memoryUsage > this.adaptationRules.maxMemoryUsage * 0.8) {
      const targetLevel = Math.max(0, currentLevel - 2) // Aggressive downgrade
      return {
        targetLevel,
        reason: `Memory constraint: ${Math.round(memoryUsage / 1024 / 1024)}MB exceeds limit`,
        confidence: 0.95,
        delayMs: 1000, // Quick action for memory
        metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
      }
    }

    // 2. CRITICAL: CPU overload (Smart TV)
    if (this.currentPlatform === 'smartTV' && cpuUsage > this.adaptationRules.maxCpuUsage) {
      const targetLevel = Math.max(0, currentLevel - 1)
      return {
        targetLevel,
        reason: `CPU overload: ${cpuUsage}% exceeds ${this.adaptationRules.maxCpuUsage}%`,
        confidence: 0.9,
        delayMs: 2000,
        metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
      }
    }

    // 3. CRITICAL: Excessive rebuffering
    if (rebufferRatio > this.adaptationRules.maxRebufferRatio) {
      const targetLevel = Math.max(0, currentLevel - 1)
      return {
        targetLevel,
        reason: `Rebuffering too high: ${(rebufferRatio * 100).toFixed(1)}%`,
        confidence: 0.85,
        delayMs: 3000,
        metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
      }
    }

    // 4. CRITICAL: Insufficient bandwidth
    const requiredBandwidth = currentQuality.bitrate / 1000 * 1.2 // 20% safety margin
    if (avgBandwidth < requiredBandwidth && avgBandwidth > 0) {
      const targetLevel = this.findSafeBitrateLevel(avgBandwidth * 0.8) // Conservative selection
      if (targetLevel < currentLevel) {
        return {
          targetLevel,
          reason: `Insufficient bandwidth: ${avgBandwidth.toFixed(1)}Mbps < ${requiredBandwidth.toFixed(1)}Mbps`,
          confidence: 0.8,
          delayMs: 5000,
          metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
        }
      }
    }

    // 5. OPPORTUNITY: Upgrade quality
    if (this.canUpgradeQuality(conditions, backendRecommendation)) {
      const targetLevel = Math.min(this.qualityLevels.length - 1, backendRecommendation.recommendedLevel)
      if (targetLevel > currentLevel) {
        return {
          targetLevel,
          reason: `Backend recommends upgrade: confidence ${(backendRecommendation.confidence * 100).toFixed(0)}%`,
          confidence: backendRecommendation.confidence,
          delayMs: this.adaptationRules.platformOptimizations.smartTV.qualityChangeDelay || 8000,
          metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
        }
      }
    }

    // 6. Smart TV specific: Input latency check
    if (this.currentPlatform === 'smartTV' && inputLatency > this.adaptationRules.maxInputLatency) {
      const targetLevel = Math.max(0, currentLevel - 1)
      return {
        targetLevel,
        reason: `Input latency too high: ${inputLatency}ms`,
        confidence: 0.7,
        delayMs: 4000,
        metrics: { currentBandwidth: avgBandwidth, bufferLength, rebufferRatio, memoryUsage }
      }
    }

    return null // No change needed
  }

  /**
   * Check if quality upgrade is safe and beneficial
   */
  private canUpgradeQuality(conditions: any, recommendation: QualityRecommendation): boolean {
    const now = Date.now()

    // Cooldown check
    if (now - this.lastQualityChange < this.upgradeCooldown) {
      return false
    }

    // Buffer health check
    if (conditions.bufferLength < this.adaptationRules.bufferTarget) {
      return false
    }

    // Rebuffering history check
    if (conditions.rebufferRatio > 0.01) { // More than 1% rebuffering
      return false
    }

    // Platform-specific checks
    if (this.currentPlatform === 'smartTV') {
      // Memory check
      if (conditions.memoryUsage > this.adaptationRules.maxMemoryUsage * 0.6) {
        return false
      }
      // CPU check
      if (conditions.cpuUsage > this.adaptationRules.maxCpuUsage * 0.7) {
        return false
      }
    }

    // Backend confidence check
    if (recommendation.confidence < 0.7) {
      return false
    }

    return true
  }

  /**
   * Apply adaptation decision
   */
  async applyAdaptationDecision(decision: AdaptationDecision): Promise<void> {
    if (!this.hls || !decision) return

    const currentLevel = this.hls.currentLevel >= 0 ? this.hls.currentLevel : this.hls.loadLevel

    if (decision.targetLevel === currentLevel) {
      return // No change needed
    }

    // Apply with delay for stability
    setTimeout(() => {
      this.hls.currentLevel = decision.targetLevel

      const targetQuality = this.qualityLevels[decision.targetLevel]
      streamingAnalytics.trackQualityChange(decision.targetLevel, decision.reason)

      console.log(`[AdaptiveQuality] Applied decision: ${targetQuality?.resolution} (${targetQuality?.bitrate}kbps) - ${decision.reason}`)
    }, decision.delayMs)
  }

  /**
   * Find safe bitrate level for given bandwidth
   */
  private findSafeBitrateLevel(availableBandwidthMbps: number): number {
    const targetBitrate = availableBandwidthMbps * 1000 * 0.8 // 80% of bandwidth, convert to kbps

    for (let i = this.qualityLevels.length - 1; i >= 0; i--) {
      if (this.qualityLevels[i].bitrate <= targetBitrate) {
        return i
      }
    }

    return 0 // Fallback to lowest quality
  }

  /**
   * Get average bandwidth from recent measurements
   */
  private getAverageBandwidth(): number {
    if (this.bandwidthHistory.length === 0) return 0

    const sum = this.bandwidthHistory.reduce((a, b) => a + b, 0)
    return sum / this.bandwidthHistory.length
  }

  /**
   * Get current buffer length
   */
  private getCurrentBufferLength(): number {
    // This would typically come from HLS buffer info
    // For now, return a default value
    return 10 // seconds
  }

  /**
   * Handle fatal errors
   */
  private handleFatalError(data: any): void {
    console.error('[AdaptiveQuality] Fatal error:', data)
    streamingAnalytics.trackError(`Fatal: ${data.details}`)

    // Attempt recovery by switching to lower quality
    if (this.hls && this.hls.currentLevel > 0) {
      this.hls.currentLevel = 0
    }
  }

  /**
   * Handle recoverable errors
   */
  private handleRecoverableError(data: any): void {
    console.warn('[AdaptiveQuality] Recoverable error:', data)
    streamingAnalytics.trackError(`Recoverable: ${data.details}`)
  }

  /**
   * Get fallback recommendation when backend is unavailable
   */
  private getFallbackRecommendation(conditions: any): QualityRecommendation {
    const safeLevel = this.findSafeBitrateLevel(conditions.avgBandwidth)

    return {
      recommendedLevel: safeLevel,
      confidence: 0.5,
      reason: 'Fallback recommendation (backend unavailable)',
      networkConditions: {
        bandwidth: conditions.avgBandwidth,
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

  /**
   * Start periodic adaptation evaluation
   */
  private startPeriodicAdaptation(): void {
    this.adaptationTimer = window.setInterval(async () => {
      if (this.performanceHistory.length > 0) {
        const latestMetrics = this.performanceHistory[this.performanceHistory.length - 1]
        const decision = await this.makeAdaptationDecision(latestMetrics)

        if (decision) {
          await this.applyAdaptationDecision(decision)
        }
      }
    }, 15000) // Check every 15 seconds
  }

  /**
   * Get default adaptation rules for platform
   */
  private getDefaultRules(platform: string): AdaptationRules {
    const baseRules: AdaptationRules = {
      maxMemoryUsage: 150, // MB
      maxCpuUsage: 50, // %
      maxInputLatency: 200, // ms
      minBandwidth: 1.0, // Mbps
      maxRebufferRatio: 0.05, // 5%
      bufferTarget: 10, // seconds
      preferStability: true,
      aggressiveUpgrade: false,
      conservativeDowngrade: true,
      platformOptimizations: {
        smartTV: {
          maxResolution: '1920x1080',
          memoryReserve: 50,
          qualityChangeDelay: 8000
        },
        mobile: {
          batteryAware: true,
          cellularOptimization: true,
          maxBitrate: 4000
        },
        desktop: {
          allowHighQuality: true,
          predictiveLoading: true
        }
      }
    }

    // Platform-specific overrides
    if (platform === 'smartTV') {
      baseRules.maxMemoryUsage = 100
      baseRules.maxCpuUsage = 30
      baseRules.maxInputLatency = 150
      baseRules.aggressiveUpgrade = false
      baseRules.conservativeDowngrade = true
    } else if (platform === 'mobile') {
      baseRules.maxMemoryUsage = 200
      baseRules.maxCpuUsage = 60
      baseRules.minBandwidth = 0.5
      baseRules.preferStability = true
    } else { // desktop
      baseRules.maxMemoryUsage = 500
      baseRules.maxCpuUsage = 70
      baseRules.aggressiveUpgrade = true
      baseRules.conservativeDowngrade = false
    }

    return baseRules
  }

  /**
   * Get current adaptation status
   */
  getAdaptationStatus(): {
    currentLevel: number
    qualityLevels: QualityLevel[]
    lastDecision: AdaptationDecision | null
    avgBandwidth: number
    rules: AdaptationRules
  } {
    return {
      currentLevel: this.hls?.currentLevel || 0,
      qualityLevels: this.qualityLevels,
      lastDecision: this.lastDecision,
      avgBandwidth: this.getAverageBandwidth(),
      rules: this.adaptationRules
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.adaptationTimer) {
      clearInterval(this.adaptationTimer)
      this.adaptationTimer = null
    }
  }
}

export default AdaptiveQualityManager