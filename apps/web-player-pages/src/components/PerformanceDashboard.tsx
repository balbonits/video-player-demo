'use client'

import React, { useEffect, useState } from 'react'
import { streamingAnalytics } from '../services/streaming-analytics'
import type { QoEMetrics } from '../services/streaming-analytics'

interface PerformanceDashboardProps {
  className?: string
  refreshInterval?: number // ms
  showAdvancedMetrics?: boolean
}

interface DashboardState {
  qoe: QoEMetrics | null
  qoeTrend: { direction: 'improving' | 'declining' | 'stable', change: number }
  isConnected: boolean
  lastUpdate: number
}

export default function PerformanceDashboard({
  className = '',
  refreshInterval = 5000,
  showAdvancedMetrics = true
}: PerformanceDashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    qoe: null,
    qoeTrend: { direction: 'stable', change: 0 },
    isConnected: false,
    lastUpdate: 0
  })

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Listen for QoE updates from streaming analytics
    const handleQoEUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const qoeData = customEvent.detail as QoEMetrics
      setDashboardState(prev => ({
        ...prev,
        qoe: qoeData,
        qoeTrend: streamingAnalytics.getQoETrend(),
        isConnected: true,
        lastUpdate: Date.now()
      }))
    }

    window.addEventListener('streaming-qoe-update', handleQoEUpdate as EventListener)

    // Periodic update from analytics service
    const updateInterval = setInterval(() => {
      const currentQoE = streamingAnalytics.getCurrentQoE()
      const currentTrend = streamingAnalytics.getQoETrend()

      if (currentQoE) {
        setDashboardState(prev => ({
          ...prev,
          qoe: currentQoE,
          qoeTrend: currentTrend,
          isConnected: true,
          lastUpdate: Date.now()
        }))
      }
    }, refreshInterval)

    return () => {
      window.removeEventListener('streaming-qoe-update', handleQoEUpdate as EventListener)
      clearInterval(updateInterval)
    }
  }, [refreshInterval])

  const formatScore = (score: number): string => {
    return score.toFixed(1)
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatBandwidth = (mbps: number): string => {
    return `${mbps.toFixed(1)} Mbps`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 4.0) return 'text-green-600'
    if (score >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (direction: string): string => {
    switch (direction) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getPlatformIcon = (platform: string): string => {
    switch (platform) {
      case 'smartTV': return '📺'
      case 'mobile': return '📱'
      case 'desktop': return '💻'
      default: return '🖥️'
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-70 transition-all z-50"
      >
        Show Performance
      </button>
    )
  }

  return (
    <div className={`bg-black bg-opacity-90 text-white p-4 rounded-lg backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🎬</span>
          Streaming Performance
          {dashboardState.qoe?.platformType && (
            <span className="ml-2">{getPlatformIcon(dashboardState.qoe.platformType)}</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dashboardState.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-300">
            {dashboardState.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* QoE Score */}
      {dashboardState.qoe && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Overall QoE */}
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">QoE Score</span>
              <span className="text-xs flex items-center gap-1">
                {getTrendIcon(dashboardState.qoeTrend.direction)}
                {dashboardState.qoeTrend.change !== 0 && (
                  <span className={dashboardState.qoeTrend.change > 0 ? 'text-green-400' : 'text-red-400'}>
                    {dashboardState.qoeTrend.change > 0 ? '+' : ''}{dashboardState.qoeTrend.change.toFixed(1)}
                  </span>
                )}
              </span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(dashboardState.qoe.qualityScore)}`}>
              {formatScore(dashboardState.qoe.qualityScore)}/5.0
            </div>
          </div>

          {/* Startup Time */}
          <div className="bg-gray-800 p-3 rounded-lg">
            <span className="text-sm text-gray-300">Startup Time</span>
            <div className="text-xl font-semibold">
              {formatTime(dashboardState.qoe.startupTime)}
            </div>
          </div>

          {/* Rebuffer Ratio */}
          <div className="bg-gray-800 p-3 rounded-lg">
            <span className="text-sm text-gray-300">Rebuffer Rate</span>
            <div className={`text-xl font-semibold ${dashboardState.qoe.rebufferRatio > 0.05 ? 'text-red-400' : 'text-green-400'}`}>
              {formatPercentage(dashboardState.qoe.rebufferRatio)}
            </div>
          </div>
        </div>
      )}

      {/* Network & Performance Metrics */}
      {dashboardState.qoe && showAdvancedMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-300">Throughput</div>
            <div className="font-semibold">{formatBandwidth(dashboardState.qoe.throughputMbps)}</div>
          </div>

          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-300">Latency</div>
            <div className="font-semibold">{formatTime(dashboardState.qoe.latency)}</div>
          </div>

          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-300">Quality Stability</div>
            <div className="font-semibold">{formatScore(dashboardState.qoe.bitrateStability)}%</div>
          </div>

          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-300">Error Rate</div>
            <div className={`font-semibold ${dashboardState.qoe.errorRate > 0.01 ? 'text-red-400' : 'text-green-400'}`}>
              {formatPercentage(dashboardState.qoe.errorRate)}
            </div>
          </div>
        </div>
      )}

      {/* Platform-Specific Metrics */}
      {dashboardState.qoe && dashboardState.qoe.platformType === 'smartTV' && showAdvancedMetrics && (
        <div className="bg-gray-800 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">📺 Smart TV Metrics</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Memory Usage:</span>
              <span className="ml-2 font-semibold">
                {Math.round(dashboardState.qoe.memoryUsage / 1024 / 1024)}MB
              </span>
            </div>
            <div>
              <span className="text-gray-400">CPU Usage:</span>
              <span className="ml-2 font-semibold">{dashboardState.qoe.cpuUsage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      {dashboardState.qoe && (
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <span>
            Session: {formatTime(dashboardState.qoe.sessionDuration)}
          </span>
          <span>
            Updated: {new Date(dashboardState.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* No Data State */}
      {!dashboardState.qoe && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <div>Waiting for performance data...</div>
          <div className="text-xs mt-1">Start video playback to see metrics</div>
        </div>
      )}
    </div>
  )
}