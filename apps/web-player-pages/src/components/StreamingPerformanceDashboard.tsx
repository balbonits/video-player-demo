/**
 * Advanced Streaming Performance Monitoring Dashboard
 * Dakota - Principal Video Streaming Engineer
 *
 * This dashboard provides real-time visibility into streaming performance metrics,
 * optimized for Smart TV and enterprise monitoring requirements.
 *
 * Features:
 * - Real-time streaming metrics visualization
 * - Platform-specific performance indicators
 * - QoE scoring and recommendations
 * - Buffer health monitoring
 * - ABR algorithm performance tracking
 * - Network condition analysis
 * - Smart TV optimization insights
 */

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { StreamingMetrics, StreamingRecommendations } from '../services/StreamingBackendService'
import { smartTVProfiles, SmartTVStreamingProfile } from '../services/SmartTVStreamingProfiles'

interface PerformanceData {
  timestamp: number
  bandwidth: number
  quality: number
  bufferHealth: number
  rebufferEvents: number
  qualityChanges: number
  latency: number
}

interface StreamingPerformanceDashboardProps {
  metrics: StreamingMetrics | null
  recommendations: StreamingRecommendations | null
  platformId?: string
  isVisible: boolean
  onToggle: () => void
}

export const StreamingPerformanceDashboard: React.FC<StreamingPerformanceDashboardProps> = ({
  metrics,
  recommendations,
  platformId,
  isVisible,
  onToggle
}) => {
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([])
  const [platformProfile, setPlatformProfile] = useState<SmartTVStreamingProfile | null>(null)
  const [alertCount, setAlertCount] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Update platform profile when platformId changes
  useEffect(() => {
    if (platformId) {
      const profile = smartTVProfiles.getProfileForPlatform(platformId)
      setPlatformProfile(profile)
    }
  }, [platformId])

  // Track performance history
  useEffect(() => {
    if (metrics) {
      const newDataPoint: PerformanceData = {
        timestamp: Date.now(),
        bandwidth: metrics.bandwidthEstimate / 1000000, // Convert to Mbps
        quality: metrics.currentQuality,
        bufferHealth: metrics.bufferHealth,
        rebufferEvents: metrics.rebufferEvents,
        qualityChanges: metrics.qualityChanges,
        latency: metrics.latency
      }

      setPerformanceHistory(prev => {
        const updated = [...prev, newDataPoint]
        // Keep only last 60 data points (5 minutes at 5-second intervals)
        return updated.slice(-60)
      })

      // Update alert count
      let alerts = 0
      if (metrics.bufferHealth < 30) alerts++
      if (metrics.qoeScore < 3.0) alerts++
      if (metrics.rebufferEvents > 3) alerts++
      if (metrics.bandwidthEstimate < 1000000) alerts++ // < 1 Mbps
      setAlertCount(alerts)
    }
  }, [metrics])

  // Draw performance chart
  useEffect(() => {
    if (!canvasRef.current || performanceHistory.length < 2) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const padding = 30

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (i * (width - 2 * padding)) / 6
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * (height - 2 * padding)) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw bandwidth line
    if (performanceHistory.length > 1) {
      const maxBandwidth = Math.max(...performanceHistory.map(d => d.bandwidth), 10)

      ctx.strokeStyle = '#0066cc'
      ctx.lineWidth = 2
      ctx.beginPath()

      performanceHistory.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (performanceHistory.length - 1)
        const y = height - padding - (point.bandwidth / maxBandwidth) * (height - 2 * padding)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw buffer health line
      ctx.strokeStyle = '#00cc66'
      ctx.lineWidth = 2
      ctx.beginPath()

      performanceHistory.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (performanceHistory.length - 1)
        const y = height - padding - (point.bufferHealth / 100) * (height - 2 * padding)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw quality level indicators
      ctx.fillStyle = '#ffcc00'
      performanceHistory.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (performanceHistory.length - 1)
        const y = height - padding - (point.quality / 7) * (height - 2 * padding)

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    // Draw legend
    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.fillText('— Bandwidth (Mbps)', padding, height - 10)
    ctx.fillStyle = '#00cc66'
    ctx.fillText('— Buffer Health (%)', padding + 140, height - 10)
    ctx.fillStyle = '#ffcc00'
    ctx.fillText('● Quality Level', padding + 280, height - 10)

  }, [performanceHistory])

  const getQoEColor = (score: number): string => {
    if (score >= 4.5) return '#00cc66' // Excellent - Green
    if (score >= 3.5) return '#66cc00' // Good - Light Green
    if (score >= 2.5) return '#cccc00' // Fair - Yellow
    if (score >= 1.5) return '#cc6600' // Poor - Orange
    return '#cc0000' // Bad - Red
  }

  const getBufferHealthColor = (health: number): string => {
    if (health >= 70) return '#00cc66' // Good
    if (health >= 40) return '#cccc00' // Warning
    return '#cc0000' // Critical
  }

  const formatBandwidth = (bps: number): string => {
    if (bps >= 1000000) {
      return `${(bps / 1000000).toFixed(1)} Mbps`
    }
    return `${(bps / 1000).toFixed(0)} Kbps`
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Open Performance Dashboard"
      >
        📊 {alertCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">{alertCount}</span>}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Streaming Performance Dashboard</h2>
            {platformProfile && (
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                {platformProfile.platformName}
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Chart */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Performance Timeline</h3>
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 bg-gray-900 rounded"
                />
              </div>

              {/* Key Metrics */}
              {metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">QoE Score</div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getQoEColor(metrics.qoeScore) }}
                    >
                      {metrics.qoeScore.toFixed(1)}/5
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Bandwidth</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatBandwidth(metrics.bandwidthEstimate)}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Buffer Health</div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getBufferHealthColor(metrics.bufferHealth) }}
                    >
                      {metrics.bufferHealth}%
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Quality Level</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {metrics.currentQuality === -1 ? 'Auto' : metrics.currentQuality}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Rebuffer Events</div>
                    <div className={`text-2xl font-bold ${metrics.rebufferEvents > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {metrics.rebufferEvents}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Quality Changes</div>
                    <div className={`text-2xl font-bold ${metrics.qualityChanges > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {metrics.qualityChanges}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Latency</div>
                    <div className={`text-2xl font-bold ${metrics.latency > 100 ? 'text-red-400' : 'text-green-400'}`}>
                      {metrics.latency}ms
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Throughput</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatBandwidth(metrics.throughput)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Platform Info */}
              {platformProfile && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Platform Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Memory Limit:</span>
                      <span>{platformProfile.capabilities.maxMemoryMB}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Bitrate:</span>
                      <span>{formatBandwidth(platformProfile.capabilities.maxDecodingBitrate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Buffer Strategy:</span>
                      <span className="capitalize">{platformProfile.streamingOptimizations.bufferStrategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ABR Strategy:</span>
                      <span className="capitalize">{platformProfile.streamingOptimizations.abrStrategy}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-2">Performance Targets:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Startup Time:</span>
                        <span>{platformProfile.performanceTargets.startupTimeMs}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Rebuffer Rate:</span>
                        <span>{platformProfile.performanceTargets.maxRebufferRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Quality Stability:</span>
                        <span>{platformProfile.performanceTargets.minQualityStability}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-900 rounded p-3">
                      <div className="text-sm font-medium text-blue-300">Optimal Quality</div>
                      <div className="text-lg">{recommendations.optimalQuality}</div>
                    </div>

                    <div className="bg-green-900 rounded p-3">
                      <div className="text-sm font-medium text-green-300">Buffer Strategy</div>
                      <div className="text-sm capitalize">{recommendations.bufferStrategy}</div>
                    </div>

                    {recommendations.qualityLocking && (
                      <div className="bg-yellow-900 rounded p-3">
                        <div className="text-sm font-medium text-yellow-300">Quality Locking</div>
                        <div className="text-xs">Recommended due to unstable network</div>
                      </div>
                    )}

                    {recommendations.edgeSwitchRecommended && (
                      <div className="bg-orange-900 rounded p-3">
                        <div className="text-sm font-medium text-orange-300">Edge Switch</div>
                        <div className="text-xs">CDN edge switch recommended</div>
                      </div>
                    )}
                  </div>

                  {recommendations.recommendations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-300 mb-2">System Recommendations:</div>
                      <div className="space-y-2">
                        {recommendations.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs bg-gray-700 rounded p-2">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alerts */}
              {alertCount > 0 && (
                <div className="bg-red-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-red-300">Active Alerts</h3>
                  <div className="space-y-2 text-sm">
                    {metrics && metrics.bufferHealth < 30 && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">⚠</span>
                        <span>Low buffer health ({metrics.bufferHealth}%)</span>
                      </div>
                    )}
                    {metrics && metrics.qoeScore < 3.0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">⚠</span>
                        <span>Poor QoE score ({metrics.qoeScore.toFixed(1)})</span>
                      </div>
                    )}
                    {metrics && metrics.rebufferEvents > 3 && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">⚠</span>
                        <span>High rebuffer count ({metrics.rebufferEvents})</span>
                      </div>
                    )}
                    {metrics && metrics.bandwidthEstimate < 1000000 && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">⚠</span>
                        <span>Low bandwidth ({formatBandwidth(metrics.bandwidthEstimate)})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Session Info */}
              {metrics && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Session Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Session ID:</span>
                      <span className="font-mono text-xs">{metrics.sessionId.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Points:</span>
                      <span>{performanceHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Update:</span>
                      <span className="text-xs">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreamingPerformanceDashboard