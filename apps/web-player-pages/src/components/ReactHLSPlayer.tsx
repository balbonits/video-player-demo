'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// TypeScript declaration for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hls-video-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          'performance-mode'?: 'smartTV' | 'mobile' | 'desktop'
          autoplay?: boolean
          'show-performance'?: boolean
          controls?: boolean
        },
        HTMLElement
      >
    }
  }
}

interface ReactHLSPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  showPerformance?: boolean
  controls?: boolean
  className?: string
}

export default function ReactHLSPlayer({
  src,
  performanceMode = 'desktop',
  autoplay = false,
  showPerformance = true,
  controls = true,
  className = ''
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

    const handleError = (event: CustomEvent) => {
      console.error('Player error:', event.detail)
    }

    player.addEventListener('performance', handlePerformance as EventListener)
    player.addEventListener('error', handleError as EventListener)

    return () => {
      player.removeEventListener('performance', handlePerformance as EventListener)
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
      className={className}
    />
  )
}