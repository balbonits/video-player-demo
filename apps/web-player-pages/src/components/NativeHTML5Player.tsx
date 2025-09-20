'use client'

import React, { useRef, useEffect, useState } from 'react'

interface NativeHTML5PlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  controls?: boolean
  className?: string
}

export default function NativeHTML5Player({
  src,
  performanceMode = 'desktop',
  autoplay = false,
  controls = true,
  className = ''
}: NativeHTML5PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [supportsHLS, setSupportsHLS] = useState<boolean | null>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)
  const [videoInfo, setVideoInfo] = useState({
    currentTime: 0,
    duration: 0,
    buffered: 0,
    quality: 'Auto',
    videoWidth: 0,
    videoHeight: 0
  })

  // Check for native HLS support
  useEffect(() => {
    const video = document.createElement('video')
    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl') !== ''
    setSupportsHLS(canPlayHLS)

    if (!canPlayHLS) {
      // Fallback to HLS.js for non-Safari browsers
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls({
            // Performance optimizations based on mode
            enableWorker: performanceMode === 'desktop',
            lowLatencyMode: false, // Conservative for compatibility
            backBufferLength: performanceMode === 'smartTV' ? 30 : 60,
            maxBufferLength: performanceMode === 'smartTV' ? 30 : 300,
            maxMaxBufferLength: performanceMode === 'smartTV' ? 60 : 600,
            maxBufferSize: performanceMode === 'smartTV' ? 60 * 1000 * 1000 : 60 * 1000 * 1000,
            maxBufferHole: 0.5,

            // Smart TV optimizations
            ...(performanceMode === 'smartTV' && {
              liveSyncDurationCount: 2,
              liveMaxLatencyDurationCount: 5,
              enableWorker: false, // Disable for older TV browsers
              fragLoadingTimeOut: 20000,
              manifestLoadingTimeOut: 10000
            }),

            // Mobile optimizations
            ...(performanceMode === 'mobile' && {
              enableWorker: true,
              backBufferLength: 30,
              maxBufferLength: 60,
              abrEwmaFastLive: 3.0,
              abrEwmaSlowLive: 9.0
            })
          })

          hls.loadSource(src)
          hls.attachMedia(videoRef.current)
          setHlsInstance(hls)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS.js: Manifest parsed, video ready')
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS.js fatal error:', data)
            }
          })
        }
      }).catch(err => {
        console.error('Failed to load HLS.js:', err)
      })
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [src, performanceMode])

  // Update video information
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateVideoInfo = () => {
      const buffered = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0

      setVideoInfo({
        currentTime: video.currentTime,
        duration: video.duration || 0,
        buffered: buffered,
        quality: hlsInstance ? `${hlsInstance.currentLevel >= 0 ? hlsInstance.levels[hlsInstance.currentLevel]?.height || 'Auto' : 'Auto'}p` : 'Native',
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      })
    }

    const events = ['timeupdate', 'durationchange', 'progress', 'loadedmetadata']
    events.forEach(event => video.addEventListener(event, updateVideoInfo))

    return () => {
      events.forEach(event => video.removeEventListener(event, updateVideoInfo))
    }
  }, [hlsInstance])

  // Keyboard controls for Smart TV navigation
  useEffect(() => {
    if (performanceMode !== 'smartTV') return

    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

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
          video.volume = Math.min(1, video.volume + 0.1)
          break
        case 'ArrowDown':
          event.preventDefault()
          video.volume = Math.max(0, video.volume - 0.1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [performanceMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={supportsHLS ? src : undefined}
        autoPlay={autoplay}
        controls={controls}
        className="w-full h-full bg-black"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Native HLS Support Indicator */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {supportsHLS === null ? 'Detecting...' :
         supportsHLS ? 'Native HLS' : 'HLS.js Fallback'}
      </div>

      {/* Performance Mode Indicator */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {performanceMode.toUpperCase()}
      </div>

      {/* Video Information Overlay */}
      <div className="absolute bottom-16 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <strong>Time:</strong> {formatTime(videoInfo.currentTime)} / {formatTime(videoInfo.duration)}
          </div>
          <div>
            <strong>Quality:</strong> {videoInfo.quality}
          </div>
          <div>
            <strong>Resolution:</strong> {videoInfo.videoWidth}x{videoInfo.videoHeight}
          </div>
          <div>
            <strong>Buffered:</strong> {formatTime(videoInfo.buffered)}
          </div>
        </div>
      </div>

      {/* Smart TV Controls Help */}
      {performanceMode === 'smartTV' && (
        <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
          <div className="text-center">
            <strong>Smart TV Controls:</strong> Space/Enter = Play/Pause | ← → = Seek | ↑ ↓ = Volume
          </div>
        </div>
      )}
    </div>
  )
}