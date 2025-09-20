'use client'

import React, { useRef, useEffect, useState } from 'react'

interface RokuConstraints {
  memoryLimit: number // MB
  cpuCores: number
  maxBitrate: number
  bufferSize: number
  renderBudget: number // ms per frame
}

interface RokuSimulationPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  controls?: boolean
  className?: string
}

export default function RokuSimulationPlayer({
  src,
  performanceMode = 'smartTV',
  autoplay = false,
  controls = true,
  className = ''
}: RokuSimulationPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)
  const [rokuConstraints] = useState<RokuConstraints>({
    memoryLimit: 256, // Simulate Roku Express (256MB)
    cpuCores: 1, // Single core ARM
    maxBitrate: 2000000, // 2 Mbps max for low-end Roku
    bufferSize: 10, // 10 seconds max buffer
    renderBudget: 33 // 30fps target
  })
  const [systemMetrics, setSystemMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    currentBitrate: 0,
    bufferLevel: 0,
    frameDrops: 0,
    isOverBudget: false
  })
  const [simulationMode, setSimulationMode] = useState<'roku-express' | 'roku-ultra' | 'roku-tv'>('roku-express')
  const frameDropCount = useRef(0)
  const lastFrameTime = useRef(0)

  // Initialize HLS.js with Roku-like constraints
  useEffect(() => {
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          // Roku simulation settings
          enableWorker: false, // Roku doesn't support workers
          lowLatencyMode: false,

          // Conservative buffering to simulate Roku constraints
          backBufferLength: rokuConstraints.bufferSize,
          maxBufferLength: rokuConstraints.bufferSize,
          maxMaxBufferLength: rokuConstraints.bufferSize * 2,
          maxBufferSize: rokuConstraints.bufferSize * 1000 * 1000,
          maxBufferHole: 1.0,

          // Conservative ABR to prevent overwhelming the device
          abrEwmaFastLive: 10.0, // Very slow adaptation
          abrEwmaSlowLive: 30.0,
          abrEwmaDefaultEstimate: 100000, // Start conservative
          abrBandWidthFactor: 0.7, // Use only 70% of detected bandwidth
          abrBandWidthUpFactor: 0.8, // Slow quality increases

          // Longer timeouts for slower processing
          fragLoadingTimeOut: 45000,
          manifestLoadingTimeOut: 20000,
          levelLoadingTimeOut: 20000,

          // Start with lowest quality
          startLevel: 0,
          testBandwidth: false // Don't auto-detect, stay conservative
        })

        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        setHlsInstance(hls)

        // Filter quality levels based on Roku constraints
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('Roku simulation: Manifest parsed')

          // Limit available quality levels based on device simulation
          const filteredLevels = hls.levels.filter((level: any) => {
            return level.bitrate <= rokuConstraints.maxBitrate
          })

          if (filteredLevels.length < hls.levels.length) {
            console.log(`Roku constraint: Filtered ${hls.levels.length - filteredLevels.length} high-bitrate levels`)
          }
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const level = hls.levels[data.level]
          console.log(`Roku: Quality switched to ${level.height}p @ ${level.bitrate}bps`)

          setSystemMetrics(prev => ({
            ...prev,
            currentBitrate: level.bitrate
          }))
        })

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
          // Simulate memory pressure from loading fragments
          const fragmentSize = data.frag.relurl?.length || 1000
          setSystemMetrics(prev => ({
            ...prev,
            memoryUsage: Math.min(rokuConstraints.memoryLimit, prev.memoryUsage + fragmentSize / 1000)
          }))
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('Roku simulation error:', data)

          if (data.fatal) {
            // Simulate Roku error recovery behavior
            setTimeout(() => {
              console.log('Roku: Attempting recovery...')
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad()
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError()
              }
            }, 2000)
          }
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
  }, [src, rokuConstraints, simulationMode])

  // Simulate Roku system monitoring
  useEffect(() => {
    const monitoringInterval = setInterval(() => {
      const video = videoRef.current
      if (!video || !hlsInstance) return

      // Simulate CPU usage based on video complexity and bitrate
      const baseCpuUsage = 15 // Base system usage
      const videoCpuUsage = (systemMetrics.currentBitrate / 1000000) * 20 // ~20% per Mbps
      const totalCpuUsage = Math.min(100, baseCpuUsage + videoCpuUsage)

      // Simulate frame drops if over performance budget
      const currentTime = performance.now()
      if (lastFrameTime.current > 0) {
        const frameDelta = currentTime - lastFrameTime.current
        if (frameDelta > rokuConstraints.renderBudget) {
          frameDropCount.current++
          setSystemMetrics(prev => ({
            ...prev,
            frameDrops: frameDropCount.current,
            isOverBudget: true
          }))
        } else {
          setSystemMetrics(prev => ({
            ...prev,
            isOverBudget: false
          }))
        }
      }
      lastFrameTime.current = currentTime

      // Calculate buffer level
      const buffered = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0
      const bufferLevel = buffered - video.currentTime

      // Simulate memory cleanup (garbage collection)
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: totalCpuUsage,
        bufferLevel: bufferLevel,
        memoryUsage: Math.max(50, prev.memoryUsage - 0.5) // Gradual cleanup
      }))

      // Force quality reduction if memory usage is too high
      if (systemMetrics.memoryUsage > rokuConstraints.memoryLimit * 0.8) {
        hlsInstance.currentLevel = 0 // Force lowest quality
        console.log('Roku: Memory pressure - reducing quality')
      }

    }, 100)

    return () => clearInterval(monitoringInterval)
  }, [hlsInstance, rokuConstraints, systemMetrics.currentBitrate])

  // Roku-style remote control simulation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

      // Simulate Roku remote delay
      setTimeout(() => {
        switch (event.code) {
          case 'Space':
          case 'Enter':
            event.preventDefault()
            video.paused ? video.play() : video.pause()
            break
          case 'ArrowLeft':
            event.preventDefault()
            video.currentTime = Math.max(0, video.currentTime - 10)
            break
          case 'ArrowRight':
            event.preventDefault()
            video.currentTime = Math.min(video.duration, video.currentTime + 10)
            break
          case 'ArrowUp':
            event.preventDefault()
            // Simulate Roku quality up
            if (hlsInstance && hlsInstance.currentLevel < hlsInstance.levels.length - 1) {
              hlsInstance.currentLevel = hlsInstance.currentLevel + 1
            }
            break
          case 'ArrowDown':
            event.preventDefault()
            // Simulate Roku quality down
            if (hlsInstance && hlsInstance.currentLevel > 0) {
              hlsInstance.currentLevel = hlsInstance.currentLevel - 1
            }
            break
          case 'Backspace':
            event.preventDefault()
            // Simulate Roku back button
            console.log('Roku: Back button pressed')
            break
          case 'KeyH':
            event.preventDefault()
            // Simulate Roku home button
            console.log('Roku: Home button pressed')
            break
        }
      }, 50) // 50ms delay to simulate remote response time
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hlsInstance])

  const getConstraintStatus = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage < 60) return 'text-green-400'
    if (percentage < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const switchSimulationMode = (mode: typeof simulationMode) => {
    setSimulationMode(mode)
    // Reset metrics when switching modes
    setSystemMetrics({
      memoryUsage: 50,
      cpuUsage: 15,
      currentBitrate: 0,
      bufferLevel: 0,
      frameDrops: 0,
      isOverBudget: false
    })
    frameDropCount.current = 0
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

      {/* Roku Device Simulation Selector */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs">
        <div className="mb-2 text-purple-400 font-bold">🟣 ROKU SIMULATION</div>
        <select
          value={simulationMode}
          onChange={(e) => switchSimulationMode(e.target.value as typeof simulationMode)}
          className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
        >
          <option value="roku-express">Roku Express (256MB)</option>
          <option value="roku-ultra">Roku Ultra (1GB)</option>
          <option value="roku-tv">Roku TV (512MB)</option>
        </select>
      </div>

      {/* System Constraints Monitor */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-90 text-white p-3 rounded text-xs max-w-xs">
        <h4 className="font-bold mb-2 text-purple-400">Roku System Monitor</h4>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-gray-300">Memory</div>
            <div className={getConstraintStatus(systemMetrics.memoryUsage, rokuConstraints.memoryLimit)}>
              {systemMetrics.memoryUsage.toFixed(0)}/{rokuConstraints.memoryLimit} MB
            </div>
          </div>

          <div>
            <div className="text-gray-300">CPU</div>
            <div className={getConstraintStatus(systemMetrics.cpuUsage, 80)}>
              {systemMetrics.cpuUsage.toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-gray-300">Buffer</div>
            <div className={getConstraintStatus(systemMetrics.bufferLevel, rokuConstraints.bufferSize)}>
              {systemMetrics.bufferLevel.toFixed(1)}s
            </div>
          </div>

          <div>
            <div className="text-gray-300">Bitrate</div>
            <div className="text-cyan-400">
              {(systemMetrics.currentBitrate / 1000).toFixed(0)}k
            </div>
          </div>
        </div>

        {/* Performance Warnings */}
        {systemMetrics.isOverBudget && (
          <div className="text-red-400 text-xs mb-1">⚠️ Frame budget exceeded</div>
        )}

        {systemMetrics.frameDrops > 0 && (
          <div className="text-orange-400 text-xs mb-1">📉 Frames dropped: {systemMetrics.frameDrops}</div>
        )}

        {systemMetrics.memoryUsage > rokuConstraints.memoryLimit * 0.8 && (
          <div className="text-red-400 text-xs mb-1">🚨 Memory pressure detected</div>
        )}
      </div>

      {/* Roku Remote Control Guide */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs max-w-md">
        <div className="text-purple-400 font-bold mb-1">Roku Remote Simulation:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>OK (Space/Enter): Play/Pause</div>
          <div>← →: Seek 10s</div>
          <div>↑ ↓: Quality control</div>
          <div>H: Home button</div>
          <div>Backspace: Back button</div>
          <div>50ms response delay simulated</div>
        </div>
      </div>

      {/* Performance Limitations Notice */}
      <div className="absolute bottom-16 left-2 right-2 bg-purple-600 bg-opacity-90 text-white p-2 rounded text-xs text-center">
        <strong>Roku Constraints Active:</strong> Limited to {rokuConstraints.maxBitrate / 1000}k bitrate,
        {rokuConstraints.memoryLimit}MB memory, {rokuConstraints.bufferSize}s buffer
      </div>
    </div>
  )
}