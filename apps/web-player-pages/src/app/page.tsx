'use client'

import React, { useState, useEffect } from 'react'
import PlayerVersionSelector, { PLAYER_VERSIONS, PlayerVersion, PerformanceModeBadge, OptimizationFeatures } from '../components/PlayerVersionSelector'
import ReactHLSPlayer from '../components/ReactHLSPlayer'
import NativeHTML5Player from '../components/NativeHTML5Player'
import PerformanceBenchmarkPlayer from '../components/PerformanceBenchmarkPlayer'
import MobileOptimizedPlayer from '../components/MobileOptimizedPlayer'
import RokuSimulationPlayer from '../components/RokuSimulationPlayer'
import ChromecastReceiverPlayer from '../components/ChromecastReceiverPlayer'

export default function Home() {
  const [currentVersion, setCurrentVersion] = useState(PLAYER_VERSIONS[0])
  const [streamSource, setStreamSource] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')

  // Available test streams
  const testStreams = [
    {
      name: 'Mux Test Stream (Big Buck Bunny)',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      description: 'High quality adaptive streaming with multiple bitrates'
    },
    {
      name: 'Apple Test Stream',
      url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
      description: 'Apple HLS reference implementation'
    },
    {
      name: 'Tears of Steel (4K)',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: '4K video content for high-end testing'
    }
  ]

  const handleVersionChange = (version: PlayerVersion) => {
    setCurrentVersion(version)
    console.log(`Switched to player version: ${version.name}`)
  }

  const renderPlayer = () => {
    const commonProps = {
      src: streamSource,
      performanceMode: currentVersion.performanceMode,
      autoplay: false,
      controls: true,
      className: 'w-full h-full'
    }

    switch (currentVersion.id) {
      case 'hls-js':
        return <ReactHLSPlayer {...commonProps} />
      case 'native-html5':
        return <NativeHTML5Player {...commonProps} />
      case 'mobile-optimized':
        return <MobileOptimizedPlayer {...commonProps} />
      case 'roku-simulation':
        return <RokuSimulationPlayer {...commonProps} />
      case 'chromecast-receiver':
        return <ChromecastReceiverPlayer {...commonProps} />
      case 'performance-benchmark':
        return <PerformanceBenchmarkPlayer {...commonProps} />
      default:
        return <ReactHLSPlayer {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          FOX Video Player Demo
        </h1>
        <p className="text-gray-300 text-base md:text-lg mb-4">
          Performance-optimized HLS video player for Smart TV/OTT platforms
        </p>
        <div className="flex justify-center">
          <PerformanceModeBadge mode={currentVersion.performanceMode} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Player Version Selector */}
        <div className="mb-6">
          <PlayerVersionSelector
            currentVersion={currentVersion.id}
            onVersionChange={handleVersionChange}
            className="mb-4"
          />
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-6" style={{ height: '60vh', minHeight: '400px' }}>
          {renderPlayer()}
        </div>

        {/* Stream Source Selector */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-cyan-400">Stream Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {testStreams.map((stream, index) => (
              <button
                key={index}
                onClick={() => setStreamSource(stream.url)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  streamSource === stream.url
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="font-semibold text-sm">{stream.name}</div>
                <div className="text-xs mt-1 opacity-80">{stream.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Optimization Features */}
          <OptimizationFeatures version={currentVersion} />

          {/* Current Player Information */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Player Information</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Technology Stack</h4>
                <p className="text-sm text-gray-300">{currentVersion.technology}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Description</h4>
                <p className="text-sm text-gray-300">{currentVersion.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Performance Mode</h4>
                <div className="flex items-center space-x-2">
                  <PerformanceModeBadge mode={currentVersion.performanceMode} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Support Matrix */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Platform Support Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3 text-white">Platform</th>
                  <th className="text-center py-2 px-3 text-white">Native HLS</th>
                  <th className="text-center py-2 px-3 text-white">HLS.js</th>
                  <th className="text-center py-2 px-3 text-white">Performance Mode</th>
                  <th className="text-center py-2 px-3 text-white">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">🌐 Desktop Browsers</td>
                  <td className="text-center py-2 px-3">Safari Only</td>
                  <td className="text-center py-2 px-3 text-green-400">✓</td>
                  <td className="text-center py-2 px-3">Desktop</td>
                  <td className="text-center py-2 px-3 text-green-400">Full Support</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">📱 Mobile Browsers</td>
                  <td className="text-center py-2 px-3 text-green-400">iOS ✓</td>
                  <td className="text-center py-2 px-3 text-green-400">✓</td>
                  <td className="text-center py-2 px-3">Mobile</td>
                  <td className="text-center py-2 px-3 text-green-400">Optimized</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">📺 Smart TVs</td>
                  <td className="text-center py-2 px-3 text-yellow-400">Limited</td>
                  <td className="text-center py-2 px-3 text-green-400">✓</td>
                  <td className="text-center py-2 px-3">Smart TV</td>
                  <td className="text-center py-2 px-3 text-yellow-400">Constrained</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">🟣 Roku Devices</td>
                  <td className="text-center py-2 px-3 text-red-400">✗</td>
                  <td className="text-center py-2 px-3 text-yellow-400">Limited</td>
                  <td className="text-center py-2 px-3">Smart TV</td>
                  <td className="text-center py-2 px-3 text-yellow-400">Simulated</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">📱➡️📺 Chromecast</td>
                  <td className="text-center py-2 px-3 text-green-400">✓</td>
                  <td className="text-center py-2 px-3 text-green-400">✓</td>
                  <td className="text-center py-2 px-3">Smart TV</td>
                  <td className="text-center py-2 px-3 text-green-400">Cast Ready</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Targets */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-red-400">FOX Corporation Performance Targets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Smart TV Constraints</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Memory usage &lt; 100MB</li>
                <li>• CPU usage &lt; 30%</li>
                <li>• Input response &lt; 150ms</li>
                <li>• Conservative buffering</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Web Performance</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Initial load &lt; 200KB</li>
                <li>• Time to first frame &lt; 1s</li>
                <li>• Rebuffering rate &lt; 1%</li>
                <li>• 60fps UI animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Shared Codebase</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Cross-platform compatibility</li>
                <li>• Performance isolation</li>
                <li>• Unified monitoring</li>
                <li>• Module federation ready</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}