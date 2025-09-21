'use client'

import { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import ReactHLSPlayer from '@/components/ReactHLSPlayer'
import PerformanceDashboard from '@/components/PerformanceDashboard'

interface TestStream {
  id: string
  name: string
  url: string
  description: string
  contentId: string
  platform: 'smartTV' | 'mobile' | 'desktop'
  expectedQoE: number
}

export default function BackendIntegrationPage() {
  const [selectedStream, setSelectedStream] = useState<TestStream | null>(null)
  const [showDashboard, setShowDashboard] = useState(true)
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  const testStreams: TestStream[] = [
    {
      id: 'smart-tv-optimized',
      name: 'Smart TV Optimized Stream',
      url: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
      description: 'Memory-constrained playback with conservative quality adaptation',
      contentId: 'planete-interdite-tv',
      platform: 'smartTV',
      expectedQoE: 4.2
    },
    {
      id: 'mobile-adaptive',
      name: 'Mobile Adaptive Stream',
      url: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
      description: 'Battery-aware streaming with cellular optimization',
      contentId: 'planete-interdite-mobile',
      platform: 'mobile',
      expectedQoE: 4.0
    },
    {
      id: 'desktop-premium',
      name: 'Desktop Premium Stream',
      url: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8',
      description: 'High-quality streaming with predictive loading',
      contentId: 'planete-interdite-desktop',
      platform: 'desktop',
      expectedQoE: 4.5
    }
  ]

  useEffect(() => {
    // Check backend connectivity
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(
          'https://streaming-backend-gamma.vercel.app/health',
          { method: 'GET' }
        )

        if (response.ok) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('error')
        }
      } catch (error) {
        setBackendStatus('error')
      }
    }

    checkBackendStatus()

    // Set default stream
    setSelectedStream(testStreams[0])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'error': return '❌'
      default: return '⚠️'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'smartTV': return '📺'
      case 'mobile': return '📱'
      case 'desktop': return '💻'
      default: return '🖥️'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backend Integration Demo</h1>
        <p className="text-gray-400 mb-4">
          Live demonstration of streaming-backend integration with real-time QoE analytics,
          adaptive quality management, and platform-specific optimizations.
        </p>

        {/* Backend Status */}
        <div className="flex items-center gap-2 text-sm">
          <span>{getStatusIcon(backendStatus)}</span>
          <span className={getStatusColor(backendStatus)}>
            Backend Status: {backendStatus === 'connected' ? 'Connected' : backendStatus === 'error' ? 'Disconnected' : 'Checking...'}
          </span>
          {backendStatus === 'connected' && (
            <span className="text-gray-400">
              • QoE Analytics: Active • Adaptive Quality: Enabled • Performance Monitoring: Real-time
            </span>
          )}
        </div>
      </div>

      {/* Stream Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Configurations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testStreams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => setSelectedStream(stream)}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${selectedStream?.id === stream.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getPlatformIcon(stream.platform)}</span>
                <h3 className="font-semibold">{stream.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">{stream.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Expected QoE: {stream.expectedQoE}/5.0</span>
                <span className="text-gray-500 capitalize">{stream.platform}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live Stream</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showDashboard ? 'Hide' : 'Show'} Performance
                </button>
                {selectedStream && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{getPlatformIcon(selectedStream.platform)}</span>
                    <span>{selectedStream.platform}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedStream ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <ReactHLSPlayer
                  src={selectedStream.url}
                  performanceMode={selectedStream.platform}
                  contentId={selectedStream.contentId}
                  enableAnalytics={true}
                  memoryLimit={selectedStream.platform === 'smartTV' ? 100 : 500}
                  cpuLimit={selectedStream.platform === 'smartTV' ? 30 : 70}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🎬</div>
                  <div>Select a test configuration to begin</div>
                </div>
              </div>
            )}

            {/* Stream Info */}
            {selectedStream && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Configuration Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Content ID:</span>
                    <span className="ml-2 font-mono">{selectedStream.contentId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Platform:</span>
                    <span className="ml-2 capitalize">{selectedStream.platform}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Backend URL:</span>
                    <span className="ml-2 font-mono text-xs">streaming-backend-de3jgbd2a...</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Analytics:</span>
                    <span className="ml-2 text-green-400">Enabled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="lg:col-span-1">
          {showDashboard && (
            <PerformanceDashboard
              className="sticky top-4"
              refreshInterval={3000}
              showAdvancedMetrics={true}
            />
          )}
        </div>
      </div>

      {/* Backend Features */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Backend Integration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* QoE Analytics */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold">QoE Analytics</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Netflix-style 0-5 scoring algorithm</li>
              <li>• Real-time rebuffer ratio tracking</li>
              <li>• Startup time optimization</li>
              <li>• Quality stability monitoring</li>
              <li>• Platform-specific metrics</li>
            </ul>
          </div>

          {/* Adaptive Quality */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold">Adaptive Quality</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Backend-driven quality recommendations</li>
              <li>• Memory-aware quality switching</li>
              <li>• CPU usage optimization</li>
              <li>• Network condition adaptation</li>
              <li>• Smart TV specific constraints</li>
            </ul>
          </div>

          {/* Performance Monitoring */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔧</span>
              <h3 className="text-lg font-semibold">Performance Monitoring</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Real-time memory usage tracking</li>
              <li>• CPU performance optimization</li>
              <li>• Input latency measurement</li>
              <li>• Throughput analysis</li>
              <li>• Error rate monitoring</li>
            </ul>
          </div>

          {/* Error Recovery */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-lg font-semibold">Error Recovery</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Automatic quality degradation</li>
              <li>• Buffer management optimization</li>
              <li>• Network timeout handling</li>
              <li>• Smart TV memory error recovery</li>
              <li>• Graceful degradation strategies</li>
            </ul>
          </div>

          {/* CDN Optimization */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌐</span>
              <h3 className="text-lg font-semibold">CDN Optimization</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Edge location optimization</li>
              <li>• Segment pre-fetching</li>
              <li>• Cache header optimization</li>
              <li>• Geographic routing</li>
              <li>• Bandwidth estimation</li>
            </ul>
          </div>

          {/* Smart TV Features */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📺</span>
              <h3 className="text-lg font-semibold">Smart TV Features</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Memory constraint management</li>
              <li>• CPU usage optimization</li>
              <li>• D-pad navigation support</li>
              <li>• Conservative buffer strategies</li>
              <li>• Low-latency input handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Backend API Endpoints</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">GET /health</h4>
                  <p className="text-sm text-gray-400">Service health and status monitoring</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">GET /manifest/&#123;contentId&#125;/master.m3u8</h4>
                  <p className="text-sm text-gray-400">HLS master manifest with quality ladder</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">POST /analytics/events</h4>
                  <p className="text-sm text-gray-400">QoE analytics and performance metrics</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">GET /bandwidth/estimate</h4>
                  <p className="text-sm text-gray-400">Network bandwidth estimation and recommendations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border-t border-gray-800">
            <code className="text-sm text-gray-300">
              Base URL: https://streaming-backend-gamma.vercel.app
            </code>
          </div>
        </div>
      </div>

      {/* FOX Integration Context */}
      <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎬 FOX Corporation Integration</h2>
        <p className="text-gray-400 mb-6">
          This backend integration demonstrates enterprise-grade streaming optimizations
          specifically designed for FOX's shared TV application codebase requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Performance First</h4>
            <p className="text-sm text-gray-400">
              Smart TV memory constraints, CPU optimization, and 60fps playback targets
              aligned with FOX's streaming platform requirements.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Enterprise Analytics</h4>
            <p className="text-sm text-gray-400">
              Netflix-style QoE scoring and real-time performance monitoring
              for production-grade streaming applications.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Cross-Platform</h4>
            <p className="text-sm text-gray-400">
              Optimized for Smart TV, mobile, and desktop with platform-specific
              adaptations for consistent user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}