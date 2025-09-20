'use client'

import React, { useEffect, useRef } from 'react'

// TypeScript declaration for custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hls-video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        'performance-mode'?: string
        controls?: boolean
      }
    }
  }
}

export default function Home() {
  const playerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Dynamically import the web component
    import('../components/HLSVideoPlayer').then(() => {
      console.log('HLS Video Player web component loaded')
    }).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          FOX Video Player Demo
        </h1>
        <p className="text-gray-300 text-lg">
          Performance-optimized HLS video player for Smart TV/OTT platforms
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-8" style={{ height: '500px' }}>
          <hls-video-player
            ref={playerRef}
            src="http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8"
            performance-mode="desktop"
            controls
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Information Panel */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-cyan-400">Stream Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-white">Current Stream</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Source: Planete Interdite</li>
                <li>• Format: HLS (HTTP Live Streaming)</li>
                <li>• Adaptive bitrate streaming</li>
                <li>• WebVTT subtitle support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-white">Features</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Performance optimization</li>
                <li>• Smart TV compatibility</li>
                <li>• Keyboard navigation</li>
                <li>• Memory management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Controls Information */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Keyboard Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Space/Enter:</strong> Play/Pause</li>
                <li><strong>Arrow Left:</strong> Seek backward 10s</li>
                <li><strong>Arrow Right:</strong> Seek forward 10s</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-gray-300">
                <li><strong>F:</strong> Toggle fullscreen</li>
                <li><strong>Quality selector:</strong> Manual quality control</li>
                <li><strong>Performance mode:</strong> Smart TV optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}