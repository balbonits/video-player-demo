'use client'

import React, { useRef, useEffect, useState } from 'react'

interface ChromecastState {
  isReceiver: boolean
  senderConnected: boolean
  mediaSessionId: string
  receiverName: string
  applicationName: string
}

interface ChromecastReceiverPlayerProps {
  src: string
  performanceMode?: 'smartTV' | 'mobile' | 'desktop'
  autoplay?: boolean
  controls?: boolean
  className?: string
}

export default function ChromecastReceiverPlayer({
  src,
  performanceMode = 'smartTV',
  autoplay = false,
  controls = true,
  className = ''
}: ChromecastReceiverPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)
  const [castState, setCastState] = useState<ChromecastState>({
    isReceiver: true,
    senderConnected: false,
    mediaSessionId: 'session-' + Math.random().toString(36).substr(2, 9),
    receiverName: 'Living Room Chromecast',
    applicationName: 'FOX Video Player Demo'
  })
  const [receiverMetrics, setReceiverMetrics] = useState({
    memoryUsage: 45, // MB
    temperature: 42, // Celsius
    wifiSignal: -35, // dBm
    castProtocolVersion: '1.36.159766',
    uptime: 0
  })
  const [messageQueue, setMessageQueue] = useState<string[]>([])

  // Simulate Chromecast receiver environment
  useEffect(() => {
    // Initialize HLS.js with Chromecast receiver optimizations
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          // Chromecast receiver optimizations
          enableWorker: true,
          lowLatencyMode: false,

          // Conservative buffering for TV viewing
          backBufferLength: 60,
          maxBufferLength: 180,
          maxMaxBufferLength: 300,

          // Network optimizations for Cast
          fragLoadingTimeOut: 30000,
          manifestLoadingTimeOut: 15000,

          // Quality selection
          abrEwmaFastLive: 3.0,
          abrEwmaSlowLive: 9.0,
          startLevel: -1, // Auto quality
          testBandwidth: true
        })

        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        setHlsInstance(hls)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          addMessage('Media ready for casting')
          simulateReceiverConnection()
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const level = hls.levels[data.level]
          addMessage(`Quality: ${level.height}p @ ${Math.round(level.bitrate / 1000)}k`)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            addMessage(`ERROR: ${data.type} - ${data.details}`)
          }
        })
      }
    }).catch(err => {
      console.error('Failed to load HLS.js:', err)
      addMessage('ERROR: Failed to initialize media player')
    })

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [src])

  // Simulate receiver connection
  const simulateReceiverConnection = () => {
    setTimeout(() => {
      setCastState(prev => ({
        ...prev,
        senderConnected: true
      }))
      addMessage('Sender device connected')
      addMessage('Media session started')
    }, 2000)
  }

  // Add message to the receiver log
  const addMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setMessageQueue(prev => [...prev, `[${timestamp}] ${message}`].slice(-10)) // Keep last 10 messages
  }

  // Simulate Chromecast receiver metrics
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setReceiverMetrics(prev => ({
        ...prev,
        memoryUsage: Math.max(40, Math.min(120, prev.memoryUsage + (Math.random() - 0.5) * 2)),
        temperature: Math.max(35, Math.min(65, prev.temperature + (Math.random() - 0.5) * 0.5)),
        wifiSignal: Math.max(-70, Math.min(-20, prev.wifiSignal + (Math.random() - 0.5) * 2)),
        uptime: prev.uptime + 1
      }))
    }, 1000)

    return () => clearInterval(metricsInterval)
  }, [])

  // Simulate Cast API messages
  useEffect(() => {
    // Simulate periodic Cast framework messages
    const messageInterval = setInterval(() => {
      const messages = [
        'Heartbeat from sender',
        'Media status update sent',
        'Volume level synchronized',
        'Playback position sync',
        'Network quality check'
      ]

      if (castState.senderConnected && Math.random() > 0.7) {
        addMessage(messages[Math.floor(Math.random() * messages.length)])
      }
    }, 5000)

    return () => clearInterval(messageInterval)
  }, [castState.senderConnected])

  // Simulate remote control commands from sender
  const simulateRemoteCommand = (command: string) => {
    const video = videoRef.current
    if (!video) return

    addMessage(`Remote command: ${command}`)

    switch (command) {
      case 'play':
        video.play()
        break
      case 'pause':
        video.pause()
        break
      case 'seek_forward':
        video.currentTime = Math.min(video.duration, video.currentTime + 30)
        break
      case 'seek_backward':
        video.currentTime = Math.max(0, video.currentTime - 30)
        break
      case 'volume_up':
        video.volume = Math.min(1, video.volume + 0.1)
        break
      case 'volume_down':
        video.volume = Math.max(0, video.volume - 0.1)
        break
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const getSignalStrength = () => {
    if (receiverMetrics.wifiSignal > -40) return { text: 'Excellent', color: 'text-green-400' }
    if (receiverMetrics.wifiSignal > -50) return { text: 'Good', color: 'text-yellow-400' }
    if (receiverMetrics.wifiSignal > -60) return { text: 'Fair', color: 'text-orange-400' }
    return { text: 'Poor', color: 'text-red-400' }
  }

  const getTemperatureColor = () => {
    if (receiverMetrics.temperature < 45) return 'text-green-400'
    if (receiverMetrics.temperature < 55) return 'text-yellow-400'
    return 'text-red-400'
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

      {/* Chromecast Receiver Status */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white p-3 rounded text-xs max-w-xs">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">📱➡️📺</span>
          <div>
            <div className="font-bold text-blue-400">Chromecast Receiver</div>
            <div className="text-gray-300">{castState.receiverName}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${castState.senderConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span>{castState.senderConnected ? 'Connected' : 'Waiting for connection...'}</span>
          </div>
          <div className="text-gray-400">Session: {castState.mediaSessionId}</div>
          <div className="text-gray-400">App: {castState.applicationName}</div>
        </div>
      </div>

      {/* Receiver Metrics */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-90 text-white p-3 rounded text-xs max-w-xs">
        <h4 className="font-bold mb-2 text-blue-400">Device Metrics</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-gray-300">Memory</div>
            <div className="text-cyan-400">{receiverMetrics.memoryUsage.toFixed(0)} MB</div>
          </div>

          <div>
            <div className="text-gray-300">Temperature</div>
            <div className={getTemperatureColor()}>{receiverMetrics.temperature.toFixed(1)}°C</div>
          </div>

          <div>
            <div className="text-gray-300">WiFi Signal</div>
            <div className={getSignalStrength().color}>
              {receiverMetrics.wifiSignal} dBm ({getSignalStrength().text})
            </div>
          </div>

          <div>
            <div className="text-gray-300">Uptime</div>
            <div className="text-green-400">{formatUptime(receiverMetrics.uptime)}</div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-gray-400 text-xs">Cast SDK: {receiverMetrics.castProtocolVersion}</div>
        </div>
      </div>

      {/* Simulated Remote Control */}
      {castState.senderConnected && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-90 text-white p-3 rounded">
          <h4 className="font-bold mb-2 text-blue-400">Sender Remote</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => simulateRemoteCommand('play')}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            >
              ▶️ Play
            </button>
            <button
              onClick={() => simulateRemoteCommand('pause')}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              ⏸️ Pause
            </button>
            <button
              onClick={() => simulateRemoteCommand('seek_backward')}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              ⏪ -30s
            </button>
            <button
              onClick={() => simulateRemoteCommand('seek_forward')}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              ⏩ +30s
            </button>
            <button
              onClick={() => simulateRemoteCommand('volume_down')}
              className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
            >
              🔉 Vol-
            </button>
            <button
              onClick={() => simulateRemoteCommand('volume_up')}
              className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
            >
              🔊 Vol+
            </button>
          </div>
        </div>
      )}

      {/* Cast Message Log */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs max-w-md max-h-32 overflow-y-auto">
        <div className="font-bold mb-1 text-blue-400">Cast Messages:</div>
        {messageQueue.map((message, index) => (
          <div key={index} className="text-gray-300 mb-1 font-mono text-xs">
            {message}
          </div>
        ))}
      </div>

      {/* Cast Instructions */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-90 text-white p-2 rounded text-xs">
        <div className="text-blue-400 font-bold mb-1">Chromecast Receiver App</div>
        <div className="text-gray-300">
          This simulates a Chromecast receiver application.<br/>
          Use the remote control buttons to test Cast functionality.
        </div>
      </div>

      {/* Connection Status Overlay */}
      {!castState.senderConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">📱➡️📺</div>
            <div className="text-xl font-bold mb-2">Ready to Cast</div>
            <div className="text-gray-300">Waiting for sender device...</div>
            <div className="mt-4 animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}