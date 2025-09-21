/**
 * Enhanced HLS Video Player with Streaming Backend Integration
 * Dakota - Principal Video Streaming Engineer
 *
 * This component maximizes utilization of our streaming-backend to deliver
 * enterprise-grade video streaming with Smart TV optimizations.
 *
 * Key Features:
 * - Dynamic backend integration for manifest generation
 * - Real-time bandwidth estimation and ABR optimization
 * - Platform-specific configurations (Smart TV, Mobile, Desktop)
 * - Advanced analytics and QoE monitoring
 * - Streaming performance metrics dashboard
 * - Token-based authentication support
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { streamingBackend, StreamingSession, StreamingMetrics, StreamingRecommendations } from '../services/StreamingBackendService'

interface EnhancedHLSPlayerProps {
  contentId: string
  deviceType?: 'desktop' | 'mobile' | 'smarttv'
  authToken?: string
  autoplay?: boolean
  controls?: boolean
  width?: string | number
  height?: string | number
  onStreamingMetrics?: (metrics: StreamingMetrics) => void
  onRecommendations?: (recommendations: StreamingRecommendations) => void
  className?: string
}

interface PlayerState {
  isLoading: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  bufferedPercent: number
  currentQuality: number
  availableQualities: Array<{ id: number; label: string; selected: boolean }>
  volume: number
  muted: boolean
  error: string | null
}

export const EnhancedHLSPlayer: React.FC<EnhancedHLSPlayerProps> = ({
  contentId,
  deviceType = 'desktop',
  authToken,
  autoplay = false,
  controls = true,
  width = '100%',
  height = '400px',
  onStreamingMetrics,
  onRecommendations,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const sessionRef = useRef<StreamingSession | null>(null)
  const metricsIntervalRef = useRef<number | null>(null)

  const [playerState, setPlayerState] = useState<PlayerState>({
    isLoading: true,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    bufferedPercent: 0,
    currentQuality: -1,
    availableQualities: [],
    volume: 1,
    muted: false,
    error: null
  })

  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null)
  const [recommendations, setRecommendations] = useState<StreamingRecommendations | null>(null)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)

  /**
   * Initialize streaming session and setup player
   */
  const initializePlayer = useCallback(async () => {
    try {
      setPlayerState(prev => ({ ...prev, isLoading: true, error: null }))

      // Initialize backend session
      const session = await streamingBackend.initializeSession(contentId, deviceType, authToken)
      sessionRef.current = session

      // Get optimized HLS configuration
      const hlsConfig = streamingBackend.getOptimizedHLSConfig()

      // Get manifest URL with session tracking
      const manifestUrl = streamingBackend.getManifestUrl()

      console.log('[EnhancedHLS] Initializing with config:', {
        deviceType,
        manifestUrl,
        sessionId: session.sessionId
      })

      if (Hls.isSupported() && videoRef.current) {
        // Initialize HLS with backend-optimized configuration
        const hls = new Hls({
          ...hlsConfig,
          debug: false,
          // Override xhrSetup to include additional streaming backend integration
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            // Call original xhrSetup from backend service
            if (hlsConfig.xhrSetup) {
              hlsConfig.xhrSetup(xhr, url)
            }

            // Track additional metrics for enhanced analytics
            const startTime = performance.now()
            xhr.addEventListener('loadstart', () => {
              streamingBackend.trackEvent('segment_request_start', {
                url,
                timestamp: performance.now()
              })
            })

            xhr.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100
                streamingBackend.trackEvent('segment_load_progress', {
                  url,
                  progress,
                  loaded: e.loaded,
                  total: e.total
                })
              }
            })

            xhr.addEventListener('load', () => {
              const loadTime = performance.now() - startTime
              streamingBackend.trackEvent('segment_load_complete', {
                url,
                loadTime,
                status: xhr.status,
                responseSize: xhr.response?.byteLength || xhr.responseText?.length || 0
              })
            })

            xhr.addEventListener('error', () => {
              streamingBackend.trackEvent('segment_load_error', {
                url,
                status: xhr.status,
                statusText: xhr.statusText
              })
            })
          }
        })

        hlsRef.current = hls

        // Setup HLS event listeners for enhanced monitoring
        setupHLSEventListeners(hls)

        // Load the stream
        hls.loadSource(manifestUrl)
        hls.attachMedia(videoRef.current)

        // Setup video event listeners
        setupVideoEventListeners()

      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('[EnhancedHLS] Using native HLS support')
        videoRef.current.src = manifestUrl
        setupVideoEventListeners()
      } else {
        throw new Error('HLS is not supported in this browser')
      }

    } catch (error) {
      console.error('[EnhancedHLS] Initialization failed:', error)
      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize player'
      }))
    }
  }, [contentId, deviceType, authToken])

  /**
   * Setup comprehensive HLS event monitoring
   */
  const setupHLSEventListeners = useCallback((hls: Hls) => {
    // Manifest events
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log('[EnhancedHLS] Manifest parsed:', data)

      const qualities = data.levels.map((level, index) => ({
        id: index,
        label: `${level.height}p (${Math.round(level.bitrate / 1000)}k)`,
        selected: index === hls.startLevel
      }))

      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
        availableQualities: qualities,
        currentQuality: hls.startLevel
      }))

      streamingBackend.trackEvent('manifest_parsed', {
        levels: data.levels.length,
        startLevel: hls.startLevel,
        totalDuration: 0 // Duration will be available after metadata loads
      })
    })

    // Quality level changes
    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      console.log('[EnhancedHLS] Quality switched to:', data.level)

      setPlayerState(prev => ({
        ...prev,
        currentQuality: data.level,
        availableQualities: prev.availableQualities.map(q => ({
          ...q,
          selected: q.id === data.level
        }))
      }))

      streamingBackend.trackEvent('quality_switch', {
        newLevel: data.level,
        bitrate: hls.levels[data.level]?.bitrate,
        resolution: `${hls.levels[data.level]?.width}x${hls.levels[data.level]?.height}`
      })
    })

    // Fragment loading events
    hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
      streamingBackend.trackEvent('fragment_loading', {
        level: data.frag.level,
        sn: data.frag.sn,
        url: data.frag.url
      })
    })

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      streamingBackend.trackEvent('fragment_loaded', {
        level: data.frag.level,
        sn: data.frag.sn,
        loadTime: 0, // Load time tracking done in xhr setup
        size: data.payload?.byteLength || 0
      })
    })

    // Error handling with backend notification
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('[EnhancedHLS] HLS Error:', data)

      streamingBackend.trackEvent('hls_error', {
        type: data.type,
        details: data.details,
        fatal: data.fatal,
        url: data.url,
        response: data.response
      })

      if (data.fatal) {
        setPlayerState(prev => ({
          ...prev,
          error: `HLS Error: ${data.details}`,
          isLoading: false
        }))
      }
    })

    // Buffer events
    hls.on(Hls.Events.BUFFER_APPENDED, (event, data) => {
      updateBufferState()
    })

    hls.on(Hls.Events.BUFFER_EOS, (event, data) => {
      streamingBackend.trackEvent('buffer_end_of_stream', { type: data.type })
    })

  }, [])

  /**
   * Setup video element event listeners
   */
  const setupVideoEventListeners = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    // Playback events
    video.addEventListener('loadstart', () => {
      streamingBackend.trackEvent('video_load_start', {})
    })

    video.addEventListener('loadedmetadata', () => {
      setPlayerState(prev => ({
        ...prev,
        duration: video.duration
      }))
      streamingBackend.trackEvent('video_metadata_loaded', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      })
    })

    video.addEventListener('canplay', () => {
      streamingBackend.trackEvent('video_can_play', {})
    })

    video.addEventListener('playing', () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }))
      streamingBackend.trackEvent('video_playing', {})
    })

    video.addEventListener('pause', () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
      streamingBackend.trackEvent('video_paused', {
        currentTime: video.currentTime
      })
    })

    video.addEventListener('ended', () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
      streamingBackend.trackEvent('video_ended', {
        duration: video.duration
      })
    })

    // Buffering events
    video.addEventListener('waiting', () => {
      streamingBackend.trackEvent('rebuffer_start', {
        currentTime: video.currentTime,
        buffered: getBufferedRanges()
      })
    })

    video.addEventListener('progress', () => {
      updateBufferState()
    })

    video.addEventListener('timeupdate', () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime
      }))
    })

    // Volume events
    video.addEventListener('volumechange', () => {
      setPlayerState(prev => ({
        ...prev,
        volume: video.volume,
        muted: video.muted
      }))
    })

    // Error events
    video.addEventListener('error', (e) => {
      const error = video.error
      setPlayerState(prev => ({
        ...prev,
        error: error ? `Video error: ${error.message}` : 'Unknown video error'
      }))
      streamingBackend.trackEvent('video_error', {
        code: error?.code,
        message: error?.message
      })
    })

  }, [])

  /**
   * Update buffer state and calculate buffered percentage
   */
  const updateBufferState = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration) return

    const buffered = video.buffered
    let bufferedPercent = 0

    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1)
      bufferedPercent = (bufferedEnd / video.duration) * 100
    }

    setPlayerState(prev => ({
      ...prev,
      bufferedPercent
    }))
  }, [])

  /**
   * Get formatted buffered ranges for analytics
   */
  const getBufferedRanges = useCallback(() => {
    const video = videoRef.current
    if (!video) return []

    const ranges = []
    for (let i = 0; i < video.buffered.length; i++) {
      ranges.push({
        start: video.buffered.start(i),
        end: video.buffered.end(i)
      })
    }
    return ranges
  }, [])

  /**
   * Update streaming metrics and recommendations
   */
  const updateMetrics = useCallback(async () => {
    try {
      const metrics = streamingBackend.getStreamingMetrics()
      setStreamingMetrics(metrics)
      onStreamingMetrics?.(metrics)

      const recs = await streamingBackend.getStreamingRecommendations()
      setRecommendations(recs)
      onRecommendations?.(recs)

    } catch (error) {
      console.warn('[EnhancedHLS] Metrics update failed:', error)
    }
  }, [onStreamingMetrics, onRecommendations])

  /**
   * Player control functions
   */
  const play = useCallback(async () => {
    try {
      await videoRef.current?.play()
    } catch (error) {
      console.error('[EnhancedHLS] Play failed:', error)
    }
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      streamingBackend.trackEvent('seek', {
        seekTime: time,
        previousTime: playerState.currentTime
      })
    }
  }, [playerState.currentTime])

  const changeQuality = useCallback((qualityId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityId
      streamingBackend.trackEvent('manual_quality_change', {
        selectedLevel: qualityId
      })
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
    }
  }, [])

  // Initialize player on mount
  useEffect(() => {
    initializePlayer()

    return () => {
      // Cleanup
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
      streamingBackend.terminateSession()
    }
  }, [initializePlayer])

  // Start metrics collection
  useEffect(() => {
    metricsIntervalRef.current = window.setInterval(updateMetrics, 5000)
    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [updateMetrics])

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Progress bar seek handler
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * playerState.duration
    seek(newTime)
  }

  if (playerState.error) {
    return (
      <div className={`enhanced-hls-player error-state ${className}`} style={{ width, height }}>
        <div className="error-message">
          <h3>Playback Error</h3>
          <p>{playerState.error}</p>
          <button onClick={initializePlayer} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`enhanced-hls-player ${className}`} style={{ width, height }}>
      <div className="video-container">
        <video
          ref={videoRef}
          controls={!controls}
          autoPlay={autoplay}
          style={{ width: '100%', height: '100%' }}
        />

        {playerState.isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Initializing stream...</p>
          </div>
        )}

        {controls && (
          <div className="custom-controls">
            <div className="progress-container" onClick={handleProgressClick}>
              <div className="progress-bar">
                <div
                  className="progress-buffer"
                  style={{ width: `${playerState.bufferedPercent}%` }}
                />
                <div
                  className="progress-fill"
                  style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
                />
              </div>
            </div>

            <div className="controls-bar">
              <button
                onClick={playerState.isPlaying ? pause : play}
                className="control-button play-pause"
              >
                {playerState.isPlaying ? '⏸️' : '▶️'}
              </button>

              <button onClick={toggleMute} className="control-button volume">
                {playerState.muted ? '🔇' : '🔊'}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerState.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />

              <div className="time-display">
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </div>

              <select
                value={playerState.currentQuality}
                onChange={(e) => changeQuality(parseInt(e.target.value))}
                className="quality-selector"
              >
                <option value={-1}>Auto</option>
                {playerState.availableQualities.map((quality) => (
                  <option key={quality.id} value={quality.id}>
                    {quality.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="control-button metrics-toggle"
                title="Toggle advanced metrics"
              >
                📊
              </button>
            </div>
          </div>
        )}

        {showAdvancedMetrics && streamingMetrics && (
          <div className="advanced-metrics-overlay">
            <h4>Streaming Metrics</h4>
            <div className="metrics-grid">
              <div>Session: {streamingMetrics.sessionId.slice(-8)}</div>
              <div>Bandwidth: {Math.round(streamingMetrics.bandwidthEstimate / 1000)}k</div>
              <div>Quality: {streamingMetrics.currentQuality}</div>
              <div>Buffer: {streamingMetrics.bufferHealth}%</div>
              <div>Rebuffers: {streamingMetrics.rebufferEvents}</div>
              <div>QoE Score: {streamingMetrics.qoeScore.toFixed(1)}/5</div>
            </div>
            {recommendations && recommendations.recommendations.length > 0 && (
              <div className="recommendations">
                <h5>Recommendations:</h5>
                {recommendations.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation">{rec}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-hls-player {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .custom-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 16px;
        }

        .progress-container {
          margin-bottom: 12px;
          cursor: pointer;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          position: relative;
        }

        .progress-buffer {
          height: 100%;
          background: rgba(255,255,255,0.5);
          border-radius: 3px;
          position: absolute;
          top: 0;
          left: 0;
        }

        .progress-fill {
          height: 100%;
          background: #0066cc;
          border-radius: 3px;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
        }

        .controls-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-button {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .control-button:hover {
          background: rgba(255,255,255,0.2);
        }

        .volume-slider {
          width: 60px;
        }

        .time-display {
          color: white;
          font-size: 14px;
          font-family: monospace;
        }

        .quality-selector {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .advanced-metrics-overlay {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.9);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          max-width: 250px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 8px 0;
        }

        .recommendations {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.3);
        }

        .recommendation {
          margin: 4px 0;
          font-size: 11px;
          opacity: 0.8;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          color: white;
        }

        .error-message {
          text-align: center;
          padding: 20px;
        }

        .retry-button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
        }

        .retry-button:hover {
          background: #0052a3;
        }
      `}</style>
    </div>
  )
}

export default EnhancedHLSPlayer