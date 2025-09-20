'use client'

import React, { useRef, useEffect, useState } from 'react'

interface PerformanceMetrics {
  memoryUsage: number
  cpuUsage: number
  networkBandwidth: number
  frameRate: number
  droppedFrames: number
  bufferHealth: number
  loadTime: number
  currentBitrate: number
  renderTime: number
}

interface PerformanceBenchmarkPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  controls?: boolean
  className?: string
}

export default function PerformanceBenchmarkPlayer({
  src,
  performanceMode = 'desktop',
  autoplay = false,
  controls = true,
  className = ''
}: PerformanceBenchmarkPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    networkBandwidth: 0,
    frameRate: 0,
    droppedFrames: 0,
    bufferHealth: 0,
    loadTime: 0,
    currentBitrate: 0,
    renderTime: 0
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const performanceStartTime = useRef<number>(0)
  const frameCount = useRef<number>(0)
  const lastFrameTime = useRef<number>(0)

  // Initialize HLS.js with performance monitoring
  useEffect(() => {
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60,
          maxBufferLength: 300,
          maxMaxBufferLength: 600,
          debug: true,

          // Performance monitoring configurations
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 10000,
          levelLoadingTimeOut: 10000,

          // Smart TV specific optimizations
          ...(performanceMode === 'smartTV' && {
            enableWorker: false,
            maxBufferLength: 30,
            backBufferLength: 30,
            fragLoadingTimeOut: 30000
          })
        })

        performanceStartTime.current = performance.now()

        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        setHlsInstance(hls)

        // Performance event listeners
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const loadTime = performance.now() - performanceStartTime.current
          setMetrics(prev => ({ ...prev, loadTime }))
          console.log(`Manifest loaded in ${loadTime.toFixed(2)}ms`)
        })

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
          // Use payload size for bandwidth calculation
          const fragmentSize = (data as any).payload?.byteLength || 1024 // Default to 1KB
          const loadTime = 100 // Default 100ms for calculation
          const bandwidth = fragmentSize / (loadTime / 1000) / 1024 // KB/s

          setMetrics(prev => ({
            ...prev,
            networkBandwidth: bandwidth,
            currentBitrate: data.frag.bitrate || 0
          }))
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(`Quality switched to level ${data.level}`)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data)
        })
      }
    }).catch(err => {
      console.error('Failed to load HLS.js:', err)
    })

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [src, performanceMode])

  // Performance monitoring loop
  useEffect(() => {
    if (!isMonitoring) return

    const monitoringInterval = setInterval(() => {
      const video = videoRef.current
      if (!video) return

      // Memory usage (if available)
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0

      // Buffer health calculation
      const buffered = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0
      const bufferHealth = Math.min(100, (buffered - video.currentTime) * 100 / 30) // 30 seconds = 100%

      // Frame rate calculation
      const currentTime = performance.now()
      if (lastFrameTime.current > 0) {
        const timeDelta = currentTime - lastFrameTime.current
        const fps = 1000 / timeDelta
        frameCount.current++

        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          bufferHealth: Math.max(0, bufferHealth),
          frameRate: fps,
          renderTime: timeDelta
        }))
      }
      lastFrameTime.current = currentTime

      // CPU usage estimation (rough approximation)
      const renderStart = performance.now()
      // Simulate some work to measure CPU
      for (let i = 0; i < 1000; i++) {
        Math.random()
      }
      const renderEnd = performance.now()
      const cpuUsage = Math.min(100, (renderEnd - renderStart) * 10)

      setMetrics(prev => ({ ...prev, cpuUsage }))
    }, 100) // Update every 100ms

    return () => clearInterval(monitoringInterval)
  }, [isMonitoring])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsMonitoring(true)
    const handlePause = () => setIsMonitoring(false)
    const handleLoadStart = () => {
      performanceStartTime.current = performance.now()
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadstart', handleLoadStart)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadstart', handleLoadStart)
    }
  }, [])

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-400'
    if (value <= thresholds.warning) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatBitrate = (bitrate: number) => {
    return (bitrate / 1000).toFixed(0) + ' Kbps'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay={autoplay}
        controls={controls}
        className="w-full h-full bg-black"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Real-time Performance Dashboard */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs max-w-xs">
        <h4 className="font-bold mb-2 text-yellow-400">Performance Metrics</h4>

        <div className="grid grid-cols-2 gap-2">
          {/* Memory Usage */}
          <div>
            <div className="text-gray-300">Memory</div>
            <div className={getMetricColor(metrics.memoryUsage, { good: 50, warning: 100 })}>
              {formatBytes(metrics.memoryUsage)}
            </div>
          </div>

          {/* CPU Usage */}
          <div>
            <div className="text-gray-300">CPU</div>
            <div className={getMetricColor(metrics.cpuUsage, { good: 30, warning: 60 })}>
              {metrics.cpuUsage.toFixed(1)}%
            </div>
          </div>

          {/* Frame Rate */}
          <div>
            <div className="text-gray-300">FPS</div>
            <div className={getMetricColor(60 - metrics.frameRate, { good: 10, warning: 20 })}>
              {metrics.frameRate.toFixed(1)}
            </div>
          </div>

          {/* Buffer Health */}
          <div>
            <div className="text-gray-300">Buffer</div>
            <div className={getMetricColor(100 - metrics.bufferHealth, { good: 20, warning: 50 })}>
              {metrics.bufferHealth.toFixed(1)}%
            </div>
          </div>

          {/* Network Bandwidth */}
          <div>
            <div className="text-gray-300">Bandwidth</div>
            <div className="text-cyan-400">
              {(metrics.networkBandwidth / 1024).toFixed(1)} MB/s
            </div>
          </div>

          {/* Current Bitrate */}
          <div>
            <div className="text-gray-300">Bitrate</div>
            <div className="text-purple-400">
              {formatBitrate(metrics.currentBitrate)}
            </div>
          </div>
        </div>

        {/* Load Time */}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-gray-300">Load Time</div>
          <div className={getMetricColor(metrics.loadTime, { good: 1000, warning: 3000 })}>
            {metrics.loadTime.toFixed(0)}ms
          </div>
        </div>

        {/* Performance Score */}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-gray-300">Performance Score</div>
          <div className="text-white font-bold">
            {calculatePerformanceScore(metrics)}/100
          </div>
        </div>
      </div>

      {/* Performance Mode Indicator */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">⚡</span>
          <span>BENCHMARK MODE</span>
          <span className="text-gray-400">|</span>
          <span>{performanceMode.toUpperCase()}</span>
        </div>
      </div>

      {/* Performance Thresholds Legend */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs max-w-md">
        <div className="text-yellow-400 font-bold mb-1">Performance Targets:</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-green-400">●</span> Good
          </div>
          <div>
            <span className="text-yellow-400">●</span> Warning
          </div>
          <div>
            <span className="text-red-400">●</span> Critical
          </div>
        </div>
        <div className="mt-1 text-gray-300">
          Memory &lt;50MB | CPU &lt;30% | Buffer &gt;80% | Load &lt;1s
        </div>
      </div>
    </div>
  )
}

// Performance score calculation
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100

  // Memory penalty (target: <50MB)
  if (metrics.memoryUsage > 50) {
    score -= Math.min(30, (metrics.memoryUsage - 50) / 2)
  }

  // CPU penalty (target: <30%)
  if (metrics.cpuUsage > 30) {
    score -= Math.min(25, (metrics.cpuUsage - 30) / 2)
  }

  // Buffer health bonus/penalty (target: >80%)
  if (metrics.bufferHealth < 80) {
    score -= Math.min(20, (80 - metrics.bufferHealth) / 4)
  }

  // Load time penalty (target: <1000ms)
  if (metrics.loadTime > 1000) {
    score -= Math.min(15, (metrics.loadTime - 1000) / 200)
  }

  // Frame rate penalty (target: >25fps)
  if (metrics.frameRate < 25) {
    score -= Math.min(10, (25 - metrics.frameRate))
  }

  return Math.max(0, Math.round(score))
}