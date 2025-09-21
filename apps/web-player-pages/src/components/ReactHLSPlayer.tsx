'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

interface ReactHLSPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  showPerformance?: boolean
  controls?: boolean
  className?: string

  // Backend integration props
  backendUrl?: string
  contentId?: string
  enableAnalytics?: boolean
  authToken?: string
  memoryLimit?: number
  cpuLimit?: number
}

export default function ReactHLSPlayer({
  src,
  performanceMode = 'desktop',
  autoplay = false,
  showPerformance = true,
  controls = true,
  className = '',
  backendUrl = 'https://streaming-backend-gamma.vercel.app',
  contentId = 'default-content',
  enableAnalytics = true,
  authToken,
  memoryLimit,
  cpuLimit
}: ReactHLSPlayerProps) {
  const playerRef = useRef<HTMLElement>(null)
  const [isClient, setIsClient] = React.useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import the web component only on client side
    if (typeof window !== 'undefined') {
      import('./HLSVideoPlayer').then(() => {
        console.log('HLS Video Player web component loaded')
      }).catch(err => {
        console.error('Failed to load HLS Video Player:', err)
      })
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    const player = playerRef.current
    if (!player) return

    const handlePerformance = (event: CustomEvent) => {
      console.log('Performance metrics:', event.detail)
    }

    const handleQoEUpdate = (event: CustomEvent) => {
      console.log('QoE Update:', event.detail)
    }

    const handleError = (event: CustomEvent) => {
      console.error('Player error:', event.detail)
    }

    player.addEventListener('hls-performance', handlePerformance as EventListener)
    player.addEventListener('qoe-update', handleQoEUpdate as EventListener)
    player.addEventListener('error', handleError as EventListener)

    return () => {
      player.removeEventListener('hls-performance', handlePerformance as EventListener)
      player.removeEventListener('qoe-update', handleQoEUpdate as EventListener)
      player.removeEventListener('error', handleError as EventListener)
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className={`${className} bg-black flex items-center justify-center`} style={{ aspectRatio: '16/9' }}>
        <div className="text-white">Loading video player...</div>
      </div>
    )
  }

  return (
    <hls-video-player
      ref={playerRef}
      src={src}
      performance-mode={performanceMode}
      autoplay={autoplay}
      show-performance={showPerformance}
      controls={controls}
      backend-url={backendUrl}
      content-id={contentId}
      enable-analytics={enableAnalytics}
      auth-token={authToken}
      memory-limit={memoryLimit}
      cpu-limit={cpuLimit}
      className={className}
    />
  )
}