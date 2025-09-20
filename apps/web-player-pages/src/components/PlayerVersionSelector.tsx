'use client'

import React, { useState } from 'react'

export interface PlayerVersion {
  id: string
  name: string
  description: string
  technology: string
  performanceMode: 'smartTV' | 'mobile' | 'desktop'
  optimizations: string[]
  color: string
  icon: string
}

export const PLAYER_VERSIONS: PlayerVersion[] = [
  {
    id: 'hls-js',
    name: 'HLS.js Performance',
    description: 'Optimized HLS.js implementation with Smart TV constraints',
    technology: 'HLS.js + Web Components',
    performanceMode: 'smartTV',
    optimizations: [
      'Memory pool management',
      'Smart TV buffering strategy',
      'Hardware acceleration detection',
      'D-pad navigation optimized'
    ],
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: '📺'
  },
  {
    id: 'native-html5',
    name: 'Native HTML5 Video',
    description: 'Browser-native HLS support for maximum compatibility',
    technology: 'Native HTML5 Video Element',
    performanceMode: 'desktop',
    optimizations: [
      'Native HLS on Safari/iOS',
      'Fallback to HLS.js on other browsers',
      'Minimal JavaScript overhead',
      'Hardware decoding priority'
    ],
    color: 'bg-green-600 hover:bg-green-700',
    icon: '🌐'
  },
  {
    id: 'mobile-optimized',
    name: 'Mobile Optimized',
    description: 'Battery and bandwidth optimized for mobile devices',
    technology: 'HLS.js + Mobile Optimizations',
    performanceMode: 'mobile',
    optimizations: [
      'Battery usage optimization',
      'Cellular network awareness',
      'Touch gesture controls',
      'Picture-in-picture support'
    ],
    color: 'bg-purple-600 hover:bg-purple-700',
    icon: '📱'
  },
  {
    id: 'roku-simulation',
    name: 'Roku TV Simulation',
    description: 'Simulates Roku Smart TV hardware constraints',
    technology: 'HLS.js + Roku Constraints',
    performanceMode: 'smartTV',
    optimizations: [
      'Limited to 256MB memory simulation',
      'BrightScript-style navigation',
      'Conservative buffering',
      'Single-core CPU simulation'
    ],
    color: 'bg-indigo-600 hover:bg-indigo-700',
    icon: '🟣'
  },
  {
    id: 'chromecast-receiver',
    name: 'Chromecast Receiver',
    description: 'Chromecast Cast Application Framework optimization',
    technology: 'CAF + HLS.js',
    performanceMode: 'smartTV',
    optimizations: [
      'Cast Application Framework integration',
      'Remote control via mobile',
      'Minimal UI for TV viewing',
      'Background mode support'
    ],
    color: 'bg-red-600 hover:bg-red-700',
    icon: '📱➡️📺'
  },
  {
    id: 'performance-benchmark',
    name: 'Performance Benchmark',
    description: 'Real-time performance monitoring and optimization showcase',
    technology: 'HLS.js + Performance APIs',
    performanceMode: 'desktop',
    optimizations: [
      'Real-time performance metrics',
      'Memory usage monitoring',
      'Network bandwidth tracking',
      'Frame rate analysis'
    ],
    color: 'bg-yellow-600 hover:bg-yellow-700',
    icon: '⚡'
  }
]

interface PlayerVersionSelectorProps {
  currentVersion: string
  onVersionChange: (version: PlayerVersion) => void
  className?: string
}

export default function PlayerVersionSelector({
  currentVersion,
  onVersionChange,
  className = ''
}: PlayerVersionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const currentVersionData = PLAYER_VERSIONS.find(v => v.id === currentVersion) || PLAYER_VERSIONS[0]

  return (
    <div className={`relative ${className}`}>
      {/* Current Version Display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentVersionData.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{currentVersionData.name}</h3>
              <p className="text-sm text-gray-300">{currentVersionData.technology}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentVersionData.performanceMode === 'smartTV' ? 'bg-blue-600 text-white' :
              currentVersionData.performanceMode === 'mobile' ? 'bg-purple-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              {currentVersionData.performanceMode}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Version Options */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {PLAYER_VERSIONS.map((version) => (
            <button
              key={version.id}
              onClick={() => {
                onVersionChange(version)
                setIsExpanded(false)
              }}
              className={`w-full p-4 text-left hover:bg-gray-700 border-b border-gray-600 last:border-b-0 transition-colors ${
                version.id === currentVersion ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl mt-1">{version.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-semibold">{version.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      version.performanceMode === 'smartTV' ? 'bg-blue-600 text-white' :
                      version.performanceMode === 'mobile' ? 'bg-purple-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {version.performanceMode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{version.description}</p>
                  <p className="text-xs text-gray-400 mb-2">{version.technology}</p>
                  <div className="space-y-1">
                    {version.optimizations.slice(0, 2).map((optimization, index) => (
                      <div key={index} className="text-xs text-green-400 flex items-center">
                        <span className="mr-1">✓</span>
                        {optimization}
                      </div>
                    ))}
                    {version.optimizations.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{version.optimizations.length - 2} more optimizations
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}

// Performance Mode Badge Component
export function PerformanceModeBadge({ mode }: { mode: 'smartTV' | 'mobile' | 'desktop' }) {
  const badgeConfig = {
    smartTV: {
      bg: 'bg-blue-600',
      text: 'Smart TV',
      icon: '📺',
      description: 'Optimized for TV hardware constraints'
    },
    mobile: {
      bg: 'bg-purple-600',
      text: 'Mobile',
      icon: '📱',
      description: 'Battery and bandwidth optimized'
    },
    desktop: {
      bg: 'bg-green-600',
      text: 'Desktop',
      icon: '🖥️',
      description: 'Full feature set with high performance'
    }
  }

  const config = badgeConfig[mode]

  return (
    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium text-white ${config.bg}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  )
}

// Optimization Features Display Component
export function OptimizationFeatures({ version }: { version: PlayerVersion }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="mr-2">⚡</span>
        Performance Optimizations
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {version.optimizations.map((optimization, index) => (
          <div key={index} className="flex items-center text-sm text-green-400">
            <span className="mr-2">✓</span>
            {optimization}
          </div>
        ))}
      </div>
    </div>
  )
}