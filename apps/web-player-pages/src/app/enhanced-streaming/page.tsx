/**
 * Enhanced Streaming Demo Page
 * Dakota - Principal Video Streaming Engineer
 *
 * This page demonstrates the advanced streaming implementation with:
 * - Streaming backend integration
 * - Smart TV platform optimizations
 * - Real-time performance monitoring
 * - Advanced HLS.js configuration
 * - Platform-specific streaming profiles
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import EnhancedHLSPlayer from '../../components/EnhancedHLSPlayer'
import StreamingPerformanceDashboard from '../../components/StreamingPerformanceDashboard'
import { StreamingMetrics, StreamingRecommendations } from '../../services/StreamingBackendService'
import { smartTVProfiles } from '../../services/SmartTVStreamingProfiles'

const DEMO_CONTENT = {
  'planete-interdite': {
    id: 'planete-interdite',
    title: 'Planète Interdite (with Backend)',
    description: 'Full-featured HLS stream with our optimized backend integration',
    url: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
    useBackend: true
  },
  'apple-demo': {
    id: 'apple-demo',
    title: 'Apple Demo Stream (Direct)',
    description: 'Apple HLS test stream for comparison',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    useBackend: false
  },
  'backend-optimized': {
    id: 'backend-demo',
    title: 'Backend Optimized Stream',
    description: 'Stream served through our streaming backend with all optimizations',
    url: 'demo-content',
    useBackend: true
  }
}

const PLATFORM_OPTIONS = [
  { id: 'desktop', name: 'Desktop/Laptop', icon: '💻' },
  { id: 'mobile', name: 'Mobile Device', icon: '📱' },
  { id: 'smarttv', name: 'Smart TV', icon: '📺' },
  { id: 'tizen', name: 'Samsung Tizen TV', icon: '📺' },
  { id: 'webos', name: 'LG webOS TV', icon: '📺' },
  { id: 'roku', name: 'Roku Device', icon: '📺' },
  { id: 'firetv', name: 'Amazon Fire TV', icon: '📺' },
  { id: 'androidtv', name: 'Android TV', icon: '📺' }
]

export default function EnhancedStreamingPage() {
  const [selectedContent, setSelectedContent] = useState(DEMO_CONTENT['planete-interdite'])
  const [selectedPlatform, setSelectedPlatform] = useState('desktop')
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null)
  const [recommendations, setRecommendations] = useState<StreamingRecommendations | null>(null)
  const [dashboardVisible, setDashboardVisible] = useState(false)
  const [authToken, setAuthToken] = useState('')
  const [autoplay, setAutoplay] = useState(false)

  // Auto-detect platform if not manually selected
  useEffect(() => {
    if (selectedPlatform === 'desktop') {
      const detectedPlatform = smartTVProfiles.detectPlatform()
      if (detectedPlatform !== 'desktop') {
        setSelectedPlatform(detectedPlatform)
      }
    }
  }, [selectedPlatform])

  const handleStreamingMetrics = useCallback((metrics: StreamingMetrics) => {
    setStreamingMetrics(metrics)
  }, [])

  const handleRecommendations = useCallback((recs: StreamingRecommendations) => {
    setRecommendations(recs)
  }, [])

  const toggleDashboard = useCallback(() => {
    setDashboardVisible(!dashboardVisible)
  }, [dashboardVisible])

  const handleContentChange = (contentId: string) => {
    const content = DEMO_CONTENT[contentId as keyof typeof DEMO_CONTENT]
    if (content) {
      setSelectedContent(content)
    }
  }

  const generateAuthToken = () => {
    const token = 'demo_' + Math.random().toString(36).substr(2, 16)
    setAuthToken(token)
  }

  const deviceType = selectedPlatform.includes('tv') || selectedPlatform === 'smarttv'
    ? 'smarttv'
    : selectedPlatform === 'mobile'
    ? 'mobile'
    : 'desktop'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Enhanced Streaming Demo</h1>
          <p className="text-gray-400">
            Advanced HLS streaming with backend integration and Smart TV optimizations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedContent.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Platform:</span>
                  <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                    {PLATFORM_OPTIONS.find(p => p.id === selectedPlatform)?.name || selectedPlatform}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 mb-6">{selectedContent.description}</p>

              {/* Player Container */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <EnhancedHLSPlayer
                  contentId={selectedContent.id}
                  deviceType={deviceType}
                  authToken={authToken || undefined}
                  autoplay={autoplay}
                  controls={true}
                  width="100%"
                  height="100%"
                  onStreamingMetrics={handleStreamingMetrics}
                  onRecommendations={handleRecommendations}
                  className="w-full h-full"
                />
              </div>

              {/* Player Status */}
              {streamingMetrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-gray-400">Session</div>
                    <div className="font-mono text-xs">{streamingMetrics.sessionId.slice(-8)}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-gray-400">Bandwidth</div>
                    <div className="font-semibold">
                      {(streamingMetrics.bandwidthEstimate / 1000000).toFixed(1)} Mbps
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-gray-400">Quality</div>
                    <div className="font-semibold">
                      {streamingMetrics.currentQuality === -1 ? 'Auto' : `Level ${streamingMetrics.currentQuality}`}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-gray-400">QoE Score</div>
                    <div className={`font-semibold ${
                      streamingMetrics.qoeScore >= 4 ? 'text-green-400' :
                      streamingMetrics.qoeScore >= 3 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {streamingMetrics.qoeScore.toFixed(1)}/5
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Content Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Content Selection</h3>
              <div className="space-y-3">
                {Object.entries(DEMO_CONTENT).map(([id, content]) => (
                  <button
                    key={id}
                    onClick={() => handleContentChange(id)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedContent.id === id
                        ? 'border-blue-500 bg-blue-900'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{content.title}</div>
                    <div className="text-sm text-gray-400 mt-1">{content.description}</div>
                    {content.useBackend && (
                      <div className="text-xs text-blue-400 mt-1">🔧 Backend Optimized</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Simulation</h3>
              <div className="space-y-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${
                      selectedPlatform === platform.id
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>

              {selectedPlatform !== 'desktop' && (
                <div className="mt-4 p-3 bg-blue-900 rounded text-sm">
                  <div className="font-medium text-blue-300">Platform Optimizations Active</div>
                  <div className="text-xs text-blue-200 mt-1">
                    {selectedPlatform.includes('tv') || selectedPlatform === 'smarttv'
                      ? 'Smart TV memory and CPU constraints applied'
                      : selectedPlatform === 'mobile'
                      ? 'Mobile battery and bandwidth optimizations active'
                      : 'Desktop performance optimizations enabled'}
                  </div>
                </div>
              )}
            </div>

            {/* Configuration Options */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Configuration</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Autoplay</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Auth Token (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Enter auth token..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={generateAuthToken}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            {streamingMetrics && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buffer Health:</span>
                    <span className={`font-semibold ${
                      streamingMetrics.bufferHealth >= 70 ? 'text-green-400' :
                      streamingMetrics.bufferHealth >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {streamingMetrics.bufferHealth}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rebuffer Events:</span>
                    <span className={streamingMetrics.rebufferEvents > 3 ? 'text-red-400' : 'text-green-400'}>
                      {streamingMetrics.rebufferEvents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality Changes:</span>
                    <span className={streamingMetrics.qualityChanges > 10 ? 'text-yellow-400' : 'text-green-400'}>
                      {streamingMetrics.qualityChanges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latency:</span>
                    <span className={streamingMetrics.latency > 100 ? 'text-red-400' : 'text-green-400'}>
                      {streamingMetrics.latency}ms
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleDashboard}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium"
                >
                  📊 Advanced Dashboard
                </button>
              </div>
            )}

            {/* Recommendations */}
            {recommendations && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">System Recommendations</h3>
                <div className="space-y-3">
                  <div className="bg-blue-900 rounded p-3">
                    <div className="text-sm font-medium text-blue-300">Optimal Quality</div>
                    <div className="text-lg">Level {recommendations.optimalQuality}</div>
                  </div>

                  <div className="bg-green-900 rounded p-3">
                    <div className="text-sm font-medium text-green-300">Buffer Strategy</div>
                    <div className="text-sm capitalize">{recommendations.bufferStrategy}</div>
                  </div>

                  {recommendations.recommendations.length > 0 && (
                    <div className="space-y-2">
                      {recommendations.recommendations.map((rec, index) => (
                        <div key={index} className="text-xs bg-gray-700 rounded p-2">
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Streaming Technology Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Backend Integration</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Dynamic manifest generation</li>
                <li>• Real-time bandwidth estimation</li>
                <li>• Advanced analytics collection</li>
                <li>• CDN optimization routing</li>
                <li>• Quality recommendation engine</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">Smart TV Optimizations</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Memory-constrained buffering</li>
                <li>• Conservative ABR algorithms</li>
                <li>• Platform-specific configurations</li>
                <li>• CPU usage optimization</li>
                <li>• Enhanced error recovery</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Performance Monitoring</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Real-time QoE calculation</li>
                <li>• Buffer health tracking</li>
                <li>• Network condition analysis</li>
                <li>• Adaptive quality decisions</li>
                <li>• Performance alerting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Dashboard */}
      <StreamingPerformanceDashboard
        metrics={streamingMetrics}
        recommendations={recommendations}
        platformId={selectedPlatform}
        isVisible={dashboardVisible}
        onToggle={toggleDashboard}
      />
    </div>
  )
}