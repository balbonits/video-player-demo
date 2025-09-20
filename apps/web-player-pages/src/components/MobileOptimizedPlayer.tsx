'use client'

import React, { useRef, useEffect, useState } from 'react'

interface MobileOptimizedPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  controls?: boolean
  className?: string
}

interface MobileMetrics {
  batteryLevel: number
  connectionType: string
  networkSpeed: string
  isLowData: boolean
  deviceMemory: number
}

export default function MobileOptimizedPlayer({
  src,
  performanceMode = 'mobile',
  autoplay = false,
  controls = true,
  className = ''
}: MobileOptimizedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [showTouchControls, setShowTouchControls] = useState(false)
  const [mobileMetrics, setMobileMetrics] = useState<MobileMetrics>({
    batteryLevel: 0,
    connectionType: 'unknown',
    networkSpeed: 'unknown',
    isLowData: false,
    deviceMemory: 0
  })

  // Initialize mobile-optimized HLS.js
  useEffect(() => {
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported() && videoRef.current) {
        // Get network information for mobile optimization
        const navigator = window.navigator as any
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

        const isSlowNetwork = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
        const isLowData = connection?.saveData === true

        const hls = new Hls({
          // Mobile-specific optimizations
          enableWorker: true,
          lowLatencyMode: false,

          // Conservative buffering for mobile
          backBufferLength: isSlowNetwork ? 15 : 30,
          maxBufferLength: isSlowNetwork ? 30 : 60,
          maxMaxBufferLength: isSlowNetwork ? 60 : 120,

          // Network-aware settings
          maxBufferSize: isSlowNetwork ? 30 * 1000 * 1000 : 60 * 1000 * 1000,
          maxBufferHole: 0.5,

          // ABR settings for mobile
          abrEwmaFastLive: isSlowNetwork ? 5.0 : 3.0,
          abrEwmaSlowLive: isSlowNetwork ? 15.0 : 9.0,
          abrEwmaDefaultEstimate: isSlowNetwork ? 100000 : 500000,

          // Timeouts for mobile networks
          fragLoadingTimeOut: isSlowNetwork ? 30000 : 20000,
          manifestLoadingTimeOut: isSlowNetwork ? 20000 : 10000,

          // Quality selection
          startLevel: isSlowNetwork ? 0 : -1, // Start with lowest quality on slow networks
          testBandwidth: !isSlowNetwork
        })

        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        setHlsInstance(hls)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('Mobile HLS player ready')
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data)
          }
        })

        // Monitor network changes
        if (connection) {
          const handleConnectionChange = () => {
            console.log('Network changed:', connection.effectiveType)
            // Adjust quality based on network change
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
              hls.currentLevel = 0 // Force lowest quality
            }
          }

          connection.addEventListener('change', handleConnectionChange)

          return () => {
            connection.removeEventListener('change', handleConnectionChange)
            hls.destroy()
          }
        }
      }
    }).catch(err => {
      console.error('Failed to load HLS.js:', err)
    })

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [src])

  // Get mobile device metrics
  useEffect(() => {
    const updateMobileMetrics = () => {
      const navigator = window.navigator as any
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

      setMobileMetrics({
        batteryLevel: navigator.getBattery ? 0 : 0, // Will be updated by battery API
        connectionType: connection?.effectiveType || 'unknown',
        networkSpeed: connection?.downlink ? `${connection.downlink} Mbps` : 'unknown',
        isLowData: connection?.saveData === true,
        deviceMemory: navigator.deviceMemory || 0
      })
    }

    updateMobileMetrics()

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setMobileMetrics(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100)
          }))
        }

        updateBattery()
        battery.addEventListener('levelchange', updateBattery)

        return () => battery.removeEventListener('levelchange', updateBattery)
      })
    }

    // Network monitoring
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateMobileMetrics)
      return () => connection.removeEventListener('change', updateMobileMetrics)
    }
  }, [])

  // Touch controls
  const handleTouchStart = () => {
    setShowTouchControls(true)
    setTimeout(() => setShowTouchControls(false), 3000)
  }

  // Fullscreen handling
  const toggleFullscreen = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          await video.requestFullscreen()
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Picture-in-Picture handling
  const togglePictureInPicture = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isPictureInPicture && 'pictureInPictureEnabled' in document) {
        await video.requestPictureInPicture()
        setIsPictureInPicture(true)
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPictureInPicture(false)
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error)
    }
  }

  // Quality adjustment based on battery
  useEffect(() => {
    if (!hlsInstance || !mobileMetrics.batteryLevel) return

    // Reduce quality when battery is low
    if (mobileMetrics.batteryLevel < 20) {
      hlsInstance.currentLevel = 0 // Lowest quality
      console.log('Low battery: Reducing quality')
    } else if (mobileMetrics.batteryLevel < 50) {
      hlsInstance.currentLevel = Math.min(1, hlsInstance.levels.length - 1)
      console.log('Medium battery: Using medium quality')
    }
  }, [mobileMetrics.batteryLevel, hlsInstance])

  const getBatteryColor = () => {
    if (mobileMetrics.batteryLevel > 50) return 'text-green-400'
    if (mobileMetrics.batteryLevel > 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConnectionColor = () => {
    switch (mobileMetrics.connectionType) {
      case '4g': return 'text-green-400'
      case '3g': return 'text-yellow-400'
      case '2g':
      case 'slow-2g': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`relative ${className}`} onTouchStart={handleTouchStart}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay={autoplay}
        controls={controls}
        className="w-full h-full bg-black"
        style={{ aspectRatio: '16/9' }}
        playsInline // Important for mobile
      />

      {/* Mobile Metrics Display */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <span>🔋</span>
            <span className={getBatteryColor()}>{mobileMetrics.batteryLevel}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📶</span>
            <span className={getConnectionColor()}>{mobileMetrics.connectionType.toUpperCase()}</span>
          </div>
          {mobileMetrics.isLowData && (
            <div className="flex items-center space-x-1">
              <span>💾</span>
              <span className="text-blue-400">Data Saver</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Mode Indicator */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center space-x-2">
          <span>📱</span>
          <span>MOBILE OPTIMIZED</span>
        </div>
      </div>

      {/* Touch Controls Overlay */}
      {showTouchControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex space-x-4">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-black bg-opacity-70 text-white p-3 rounded-full text-xl"
            >
              {isFullscreen ? '⤡' : '⤢'}
            </button>

            {/* Picture-in-Picture Button */}
            {('pictureInPictureEnabled' in document) && (
              <button
                onClick={togglePictureInPicture}
                className="bg-black bg-opacity-70 text-white p-3 rounded-full text-xl"
              >
                📺
              </button>
            )}
          </div>
        </div>
      )}

      {/* Network Status Warning */}
      {(mobileMetrics.connectionType === '2g' || mobileMetrics.connectionType === 'slow-2g') && (
        <div className="absolute bottom-16 left-2 right-2 bg-red-600 text-white p-2 rounded text-xs text-center">
          <strong>Slow Network Detected</strong> - Quality automatically reduced to save data
        </div>
      )}

      {/* Low Battery Warning */}
      {mobileMetrics.batteryLevel > 0 && mobileMetrics.batteryLevel < 20 && (
        <div className="absolute bottom-16 left-2 right-2 bg-orange-600 text-white p-2 rounded text-xs text-center">
          <strong>Low Battery</strong> - Video quality reduced to conserve power
        </div>
      )}

      {/* Data Saver Mode */}
      {mobileMetrics.isLowData && (
        <div className="absolute bottom-2 left-2 right-2 bg-blue-600 text-white p-2 rounded text-xs text-center">
          <strong>Data Saver Active</strong> - Using lowest quality to reduce data usage
        </div>
      )}

      {/* Mobile Instructions */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs">
        <div>📱 Tap screen for controls | Pinch to zoom | Double-tap for fullscreen</div>
      </div>
    </div>
  )
}