/**
 * Smart TV Platform-Specific Streaming Profiles
 * Dakota - Principal Video Streaming Engineer
 *
 * This service provides optimized streaming configurations for different
 * Smart TV platforms, maximizing performance while respecting platform constraints.
 *
 * Platform Coverage:
 * - Samsung Tizen (2018+)
 * - LG webOS (4.0+)
 * - Roku OS (9.0+)
 * - Amazon Fire TV (Fire OS 7+)
 * - Android TV (8.0+)
 * - Sony Bravia (Android TV variant)
 * - Vizio SmartCast (V6+)
 */

export interface PlatformCapabilities {
  // Hardware constraints
  maxMemoryMB: number
  maxCpuCores: number
  maxDecodingBitrate: number
  maxResolution: string
  maxFrameRate: number

  // Codec support
  supportedCodecs: string[]
  hwDecodingCodecs: string[]

  // Network capabilities
  maxBandwidth: number
  networkingApi: 'xhr' | 'fetch' | 'custom'

  // DRM support
  drmSystems: string[]

  // Platform-specific features
  platformFeatures: string[]
  limitations: string[]
}

export interface SmartTVStreamingProfile {
  platformId: string
  platformName: string
  capabilities: PlatformCapabilities
  hlsConfig: any
  streamingOptimizations: {
    bufferStrategy: 'conservative' | 'balanced' | 'aggressive'
    qualityLadderFilter: (qualities: any[]) => any[]
    abrStrategy: 'stability' | 'quality' | 'balanced'
    networkStrategy: 'robust' | 'fast' | 'adaptive'
  }
  performanceTargets: {
    startupTimeMs: number
    maxRebufferRate: number
    maxQualityChanges: number
    minQualityStability: number
  }
}

class SmartTVStreamingProfiles {
  private profiles: Map<string, SmartTVStreamingProfile> = new Map()

  constructor() {
    this.initializeProfiles()
  }

  private initializeProfiles(): void {
    // Samsung Tizen Platform Profile
    this.profiles.set('tizen', {
      platformId: 'tizen',
      platformName: 'Samsung Tizen Smart TV',
      capabilities: {
        maxMemoryMB: 150, // Conservative for older models
        maxCpuCores: 4,
        maxDecodingBitrate: 25000000, // 25 Mbps max
        maxResolution: '3840x2160',
        maxFrameRate: 60,
        supportedCodecs: ['avc1', 'hev1', 'vp9'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90'],
        maxBandwidth: 100000000, // 100 Mbps
        networkingApi: 'xhr',
        drmSystems: ['widevine', 'playready'],
        platformFeatures: ['4k', 'hdr10', 'dolby-vision'],
        limitations: ['limited-worker-support', 'memory-constrained']
      },
      hlsConfig: {
        // Memory optimization for Tizen
        maxBufferLength: 45,
        backBufferLength: 15,
        maxMaxBufferLength: 60,
        maxBufferSize: 30 * 1000 * 1000, // 30MB

        // Conservative ABR for stability
        abrEwmaFastLive: 8.0,
        abrEwmaSlowLive: 20.0,
        abrBandWidthFactor: 0.7,
        abrBandWidthUpFactor: 0.4,

        // Network optimization for TV WiFi
        fragLoadingTimeOut: 30000,
        manifestLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 2000,

        // Tizen-specific settings
        enableWorker: false, // Tizen has limited worker support
        startLevel: 1, // Start conservative
        autoStartLoad: true,
        testBandwidth: false,

        // Error recovery
        levelLoadingMaxRetry: 8,
        manifestLoadingMaxRetry: 5,

        // Platform optimizations
        maxAudioFramesDrift: 2,
        nudgeMaxRetry: 8,
        nudgeOffset: 0.3,

        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'tizen')
          xhr.setRequestHeader('X-TV-Model', this.getTizenModel())
          xhr.timeout = 30000
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'conservative',
        qualityLadderFilter: (qualities) =>
          qualities.filter(q => q.bitrate <= 15000000), // Max 15 Mbps
        abrStrategy: 'stability',
        networkStrategy: 'robust'
      },
      performanceTargets: {
        startupTimeMs: 3000,
        maxRebufferRate: 0.5, // 0.5%
        maxQualityChanges: 5,
        minQualityStability: 90
      }
    })

    // LG webOS Platform Profile
    this.profiles.set('webos', {
      platformId: 'webos',
      platformName: 'LG webOS Smart TV',
      capabilities: {
        maxMemoryMB: 200, // Generally more memory than Tizen
        maxCpuCores: 4,
        maxDecodingBitrate: 40000000, // 40 Mbps max
        maxResolution: '3840x2160',
        maxFrameRate: 120, // Some models support 120fps
        supportedCodecs: ['avc1', 'hev1', 'vp9', 'av1'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90', 'av01.0.08M.08'],
        maxBandwidth: 100000000,
        networkingApi: 'xhr',
        drmSystems: ['widevine', 'playready'],
        platformFeatures: ['4k', 'hdr10', 'dolby-vision', 'dolby-atmos'],
        limitations: ['worker-memory-limited']
      },
      hlsConfig: {
        // Balanced memory management for webOS
        maxBufferLength: 90,
        backBufferLength: 30,
        maxMaxBufferLength: 120,
        maxBufferSize: 50 * 1000 * 1000, // 50MB

        // Balanced ABR for webOS
        abrEwmaFastLive: 5.0,
        abrEwmaSlowLive: 12.0,
        abrBandWidthFactor: 0.8,
        abrBandWidthUpFactor: 0.6,

        // webOS network optimization
        fragLoadingTimeOut: 25000,
        manifestLoadingTimeOut: 12000,
        fragLoadingMaxRetry: 5,

        // webOS can handle workers better
        enableWorker: true,
        startLevel: -1, // Auto-detect
        lowLatencyMode: false,

        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'webos')
          xhr.setRequestHeader('X-TV-Model', this.getWebOSModel())
          xhr.timeout = 25000
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'balanced',
        qualityLadderFilter: (qualities) =>
          qualities.filter(q => q.bitrate <= 25000000), // Max 25 Mbps
        abrStrategy: 'balanced',
        networkStrategy: 'adaptive'
      },
      performanceTargets: {
        startupTimeMs: 2500,
        maxRebufferRate: 0.3,
        maxQualityChanges: 8,
        minQualityStability: 85
      }
    })

    // Roku Platform Profile
    this.profiles.set('roku', {
      platformId: 'roku',
      platformName: 'Roku Streaming Device',
      capabilities: {
        maxMemoryMB: 100, // Very memory constrained
        maxCpuCores: 4,
        maxDecodingBitrate: 20000000, // 20 Mbps max
        maxResolution: '3840x2160',
        maxFrameRate: 60,
        supportedCodecs: ['avc1', 'hev1'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90'],
        maxBandwidth: 100000000,
        networkingApi: 'custom', // Roku uses BrightScript
        drmSystems: ['playready'],
        platformFeatures: ['4k', 'hdr10'],
        limitations: ['very-memory-constrained', 'no-workers', 'brightscript-only']
      },
      hlsConfig: {
        // Extremely conservative for Roku
        maxBufferLength: 30,
        backBufferLength: 10,
        maxMaxBufferLength: 45,
        maxBufferSize: 20 * 1000 * 1000, // 20MB

        // Very conservative ABR
        abrEwmaFastLive: 12.0,
        abrEwmaSlowLive: 30.0,
        abrBandWidthFactor: 0.6,
        abrBandWidthUpFactor: 0.3,

        // Roku network settings
        fragLoadingTimeOut: 40000,
        manifestLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 8,

        // Roku limitations
        enableWorker: false,
        startLevel: 0, // Always start lowest
        autoStartLoad: true,
        testBandwidth: false,

        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'roku')
          xhr.setRequestHeader('X-Roku-Model', this.getRokuModel())
          xhr.timeout = 40000
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'conservative',
        qualityLadderFilter: (qualities) =>
          qualities.filter(q => q.bitrate <= 10000000 && q.id <= 5), // Max 1080p
        abrStrategy: 'stability',
        networkStrategy: 'robust'
      },
      performanceTargets: {
        startupTimeMs: 4000,
        maxRebufferRate: 1.0, // 1%
        maxQualityChanges: 3,
        minQualityStability: 95
      }
    })

    // Amazon Fire TV Profile
    this.profiles.set('firetv', {
      platformId: 'firetv',
      platformName: 'Amazon Fire TV',
      capabilities: {
        maxMemoryMB: 300, // Better memory than most
        maxCpuCores: 4,
        maxDecodingBitrate: 40000000,
        maxResolution: '3840x2160',
        maxFrameRate: 60,
        supportedCodecs: ['avc1', 'hev1', 'vp9'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90'],
        maxBandwidth: 100000000,
        networkingApi: 'xhr',
        drmSystems: ['widevine', 'playready'],
        platformFeatures: ['4k', 'hdr10', 'dolby-vision'],
        limitations: ['amazon-store-only']
      },
      hlsConfig: {
        // Aggressive settings for Fire TV
        maxBufferLength: 120,
        backBufferLength: 60,
        maxMaxBufferLength: 180,
        maxBufferSize: 80 * 1000 * 1000, // 80MB

        // Responsive ABR
        abrEwmaFastLive: 3.0,
        abrEwmaSlowLive: 8.0,
        abrBandWidthFactor: 0.9,
        abrBandWidthUpFactor: 0.7,

        // Fire TV network optimization
        fragLoadingTimeOut: 15000,
        manifestLoadingTimeOut: 8000,
        fragLoadingMaxRetry: 4,

        // Fire TV can handle advanced features
        enableWorker: true,
        startLevel: -1,
        lowLatencyMode: false,

        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'firetv')
          xhr.setRequestHeader('X-FireTV-Generation', this.getFireTVGeneration())
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'aggressive',
        qualityLadderFilter: (qualities) => qualities, // No filtering
        abrStrategy: 'quality',
        networkStrategy: 'fast'
      },
      performanceTargets: {
        startupTimeMs: 2000,
        maxRebufferRate: 0.2,
        maxQualityChanges: 10,
        minQualityStability: 80
      }
    })

    // Android TV Profile
    this.profiles.set('androidtv', {
      platformId: 'androidtv',
      platformName: 'Android TV',
      capabilities: {
        maxMemoryMB: 250,
        maxCpuCores: 8,
        maxDecodingBitrate: 50000000,
        maxResolution: '3840x2160',
        maxFrameRate: 60,
        supportedCodecs: ['avc1', 'hev1', 'vp9', 'av1'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90', 'vp09.00.50.08'],
        maxBandwidth: 100000000,
        networkingApi: 'fetch',
        drmSystems: ['widevine'],
        platformFeatures: ['4k', 'hdr10', 'hdr10+', 'dolby-vision'],
        limitations: ['varies-by-manufacturer']
      },
      hlsConfig: {
        // Android TV balanced approach
        maxBufferLength: 100,
        backBufferLength: 40,
        maxMaxBufferLength: 150,
        maxBufferSize: 60 * 1000 * 1000, // 60MB

        // Modern ABR for Android TV
        abrEwmaFastLive: 4.0,
        abrEwmaSlowLive: 10.0,
        abrBandWidthFactor: 0.85,
        abrBandWidthUpFactor: 0.65,

        // Android TV network settings
        fragLoadingTimeOut: 18000,
        manifestLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 4,

        // Android TV features
        enableWorker: true,
        startLevel: -1,
        lowLatencyMode: false,

        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'androidtv')
          xhr.setRequestHeader('X-Android-Version', this.getAndroidTVVersion())
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'balanced',
        qualityLadderFilter: (qualities) => qualities,
        abrStrategy: 'balanced',
        networkStrategy: 'adaptive'
      },
      performanceTargets: {
        startupTimeMs: 2200,
        maxRebufferRate: 0.25,
        maxQualityChanges: 8,
        minQualityStability: 85
      }
    })
  }

  /**
   * Get streaming profile for detected platform
   */
  getProfileForPlatform(platformId?: string): SmartTVStreamingProfile {
    // Auto-detect if not specified
    if (!platformId) {
      platformId = this.detectPlatform()
    }

    const profile = this.profiles.get(platformId)
    if (!profile) {
      console.warn(`[SmartTVProfiles] Unknown platform: ${platformId}, using default`)
      return this.getDefaultProfile()
    }

    return profile
  }

  /**
   * Auto-detect Smart TV platform from user agent and APIs
   */
  detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase()

    // Samsung Tizen detection
    if (userAgent.includes('tizen') || userAgent.includes('samsung')) {
      return 'tizen'
    }

    // LG webOS detection
    if (userAgent.includes('webos') || userAgent.includes('netcast')) {
      return 'webos'
    }

    // Roku detection
    if (userAgent.includes('roku') || userAgent.includes('brightscript')) {
      return 'roku'
    }

    // Fire TV detection
    if (userAgent.includes('aftb') || userAgent.includes('afts') || userAgent.includes('fire tv')) {
      return 'firetv'
    }

    // Android TV detection
    if (userAgent.includes('android') && userAgent.includes('tv')) {
      return 'androidtv'
    }

    // Check for Smart TV APIs
    if (typeof (window as any).tizen !== 'undefined') {
      return 'tizen'
    }

    if (typeof (window as any).webOS !== 'undefined') {
      return 'webos'
    }

    console.log('[SmartTVProfiles] Platform not detected, using default desktop profile')
    return 'desktop'
  }

  /**
   * Get all available platform profiles
   */
  getAllProfiles(): SmartTVStreamingProfile[] {
    return Array.from(this.profiles.values())
  }

  /**
   * Get performance recommendations for current platform
   */
  getPerformanceRecommendations(platformId?: string): string[] {
    const profile = this.getProfileForPlatform(platformId)
    const recommendations: string[] = []

    if (profile.capabilities.maxMemoryMB < 150) {
      recommendations.push('Memory-constrained platform detected - using conservative buffering')
    }

    if (profile.capabilities.limitations.includes('no-workers')) {
      recommendations.push('Web Workers disabled for platform compatibility')
    }

    if (profile.platformId === 'roku') {
      recommendations.push('Roku optimization: Enhanced error recovery and conservative quality selection')
    }

    if (profile.platformId === 'tizen') {
      recommendations.push('Samsung TV optimization: Stability-focused ABR algorithm')
    }

    return recommendations
  }

  /**
   * Optimize quality ladder for platform
   */
  optimizeQualityLadder(qualities: any[], platformId?: string): any[] {
    const profile = this.getProfileForPlatform(platformId)
    return profile.streamingOptimizations.qualityLadderFilter(qualities)
  }

  private getDefaultProfile(): SmartTVStreamingProfile {
    return {
      platformId: 'desktop',
      platformName: 'Desktop/Generic',
      capabilities: {
        maxMemoryMB: 500,
        maxCpuCores: 8,
        maxDecodingBitrate: 100000000,
        maxResolution: '3840x2160',
        maxFrameRate: 60,
        supportedCodecs: ['avc1', 'hev1', 'vp9', 'av1'],
        hwDecodingCodecs: ['avc1.640028', 'hev1.1.6.L150.90'],
        maxBandwidth: 1000000000,
        networkingApi: 'fetch',
        drmSystems: ['widevine', 'playready'],
        platformFeatures: ['4k', 'hdr10'],
        limitations: []
      },
      hlsConfig: {
        maxBufferLength: 300,
        backBufferLength: 120,
        maxMaxBufferLength: 600,
        maxBufferSize: 120 * 1000 * 1000,
        abrEwmaFastLive: 3.0,
        abrEwmaSlowLive: 9.0,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
        fragLoadingTimeOut: 20000,
        manifestLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 4,
        enableWorker: true,
        startLevel: -1,
        lowLatencyMode: false,
        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.setRequestHeader('X-Platform', 'desktop')
        }
      },
      streamingOptimizations: {
        bufferStrategy: 'balanced',
        qualityLadderFilter: (qualities) => qualities,
        abrStrategy: 'balanced',
        networkStrategy: 'adaptive'
      },
      performanceTargets: {
        startupTimeMs: 1500,
        maxRebufferRate: 0.1,
        maxQualityChanges: 12,
        minQualityStability: 80
      }
    }
  }

  // Platform-specific model detection helpers
  private getTizenModel(): string {
    try {
      return (window as any).tizen?.systeminfo?.getCapability?.('product.model') || 'unknown'
    } catch {
      return 'tizen-generic'
    }
  }

  private getWebOSModel(): string {
    try {
      return (window as any).webOS?.deviceInfo?.modelName || 'webos-generic'
    } catch {
      return 'webos-generic'
    }
  }

  private getRokuModel(): string {
    // Would be available through BrightScript APIs
    return 'roku-generic'
  }

  private getFireTVGeneration(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('AFTB')) return 'fire-tv-stick'
    if (userAgent.includes('AFTS')) return 'fire-tv-stick-4k'
    if (userAgent.includes('AFTM')) return 'fire-tv-cube'
    return 'fire-tv-generic'
  }

  private getAndroidTVVersion(): string {
    const match = navigator.userAgent.match(/Android (\d+\.\d+)/)
    return match ? match[1] : '9.0'
  }
}

// Singleton instance
export const smartTVProfiles = new SmartTVStreamingProfiles()

// Export types and class
export { SmartTVStreamingProfiles }