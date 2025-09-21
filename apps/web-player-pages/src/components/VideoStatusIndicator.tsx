'use client';

import { useState, useEffect, useRef, memo } from 'react';

interface VideoStatusIndicatorProps {
  videoElement?: HTMLVideoElement | null;
  isLive?: boolean;
  streamUrl?: string;
  className?: string;
}

type VideoState = 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'seeking' | 'ended' | 'error' | 'live' | 'stalled';

interface NetworkInfo {
  downloadSpeed: number;
  effectiveType: string;
  rtt: number;
}

const VideoStatusIndicator = memo(({
  videoElement,
  isLive = false,
  streamUrl = '',
  className = ''
}: VideoStatusIndicatorProps) => {
  const [videoState, setVideoState] = useState<VideoState>('loading');
  const [bufferPercentage, setBufferPercentage] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoResolution, setVideoResolution] = useState({ width: 0, height: 0 });
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    downloadSpeed: 0,
    effectiveType: 'unknown',
    rtt: 0
  });
  const [bitrate, setBitrate] = useState(0);
  const [latency, setLatency] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const statsIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!videoElement) return;

    // Event handlers
    const handleLoadStart = () => setVideoState('loading');
    const handleLoadedData = () => {
      setVideoState('ready');
      setDuration(videoElement.duration);
      setVideoResolution({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    };
    const handlePlay = () => setVideoState(isLive ? 'live' : 'playing');
    const handlePause = () => setVideoState('paused');
    const handleEnded = () => setVideoState('ended');
    const handleSeeking = () => setVideoState('seeking');
    const handleSeeked = () => setVideoState(videoElement.paused ? 'paused' : 'playing');
    const handleWaiting = () => setVideoState('buffering');
    const handleStalled = () => setVideoState('stalled');
    const handleCanPlay = () => {
      if (videoElement.paused && videoState === 'buffering') {
        setVideoState('ready');
      }
    };

    const handleError = (e: Event) => {
      setVideoState('error');
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      if (error) {
        const errorMessages: Record<number, string> = {
          1: 'MEDIA_ERR_ABORTED: Playback aborted',
          2: 'MEDIA_ERR_NETWORK: Network error',
          3: 'MEDIA_ERR_DECODE: Decode error',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED: Source not supported'
        };
        setErrorMessage(errorMessages[error.code] || 'Unknown error');
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);

      // Update buffer percentage
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const bufferPercent = (bufferedEnd / videoElement.duration) * 100;
        setBufferPercentage(Math.min(bufferPercent, 100));
      }
    };

    const handleRateChange = () => setPlaybackRate(videoElement.playbackRate);
    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };

    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const bufferPercent = (bufferedEnd / videoElement.duration) * 100;
        setBufferPercentage(Math.min(bufferPercent, 100));
      }
    };

    // Add event listeners
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('seeking', handleSeeking);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('stalled', handleStalled);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ratechange', handleRateChange);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('progress', handleProgress);

    // Stats collection interval
    statsIntervalRef.current = setInterval(() => {
      // Get video quality stats if available
      const quality = (videoElement as any).getVideoPlaybackQuality?.();
      if (quality) {
        setDroppedFrames(quality.droppedVideoFrames || 0);
      }

      // Network Information API
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          setNetworkInfo({
            downloadSpeed: connection.downlink || 0,
            effectiveType: connection.effectiveType || 'unknown',
            rtt: connection.rtt || 0
          });
        }
      }

      // Estimate bitrate from buffer changes
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const timeRangeSize = bufferedEnd - videoElement.currentTime;
        if (timeRangeSize > 0) {
          // Rough estimate: assume 1MB per 10 seconds at 1Mbps
          const estimatedBitrate = (timeRangeSize * 0.1) * 1000; // kbps
          setBitrate(Math.round(estimatedBitrate));
        }
      }

      // Latency estimate for live streams
      if (isLive && duration > 0) {
        const estimatedLatency = duration - currentTime;
        setLatency(Math.max(0, estimatedLatency));
      }
    }, 1000);

    // Cleanup
    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('seeking', handleSeeking);
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('stalled', handleStalled);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ratechange', handleRateChange);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('progress', handleProgress);

      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [videoElement, isLive, currentTime, duration]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status color and icon
  const getStatusIndicator = () => {
    const indicators: Record<VideoState, { color: string; text: string; icon: string; pulse?: boolean }> = {
      loading: { color: 'text-yellow-500', text: 'Loading', icon: '⟳', pulse: true },
      ready: { color: 'text-blue-500', text: 'Ready', icon: '⏸' },
      playing: { color: 'text-green-500', text: 'Playing', icon: '▶' },
      paused: { color: 'text-gray-400', text: 'Paused', icon: '⏸' },
      buffering: { color: 'text-orange-500', text: 'Buffering', icon: '⟳', pulse: true },
      seeking: { color: 'text-purple-500', text: 'Seeking', icon: '⟳', pulse: true },
      ended: { color: 'text-gray-500', text: 'Ended', icon: '■' },
      error: { color: 'text-red-500', text: 'Error', icon: '⚠' },
      live: { color: 'text-red-500', text: 'LIVE', icon: '●', pulse: true },
      stalled: { color: 'text-yellow-600', text: 'Stalled', icon: '⚠', pulse: true }
    };

    return indicators[videoState] || indicators.loading;
  };

  const status = getStatusIndicator();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Status Bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {/* Stream Info */}
          <span className="text-gray-400">
            {streamUrl ? `Stream: ${new URL(streamUrl).hostname}` : 'No stream'}
          </span>

          {/* Video Resolution */}
          {videoResolution.width > 0 && (
            <span className="text-gray-400">
              {videoResolution.width}x{videoResolution.height}
            </span>
          )}

          {/* Bitrate if available */}
          {bitrate > 0 && (
            <span className="text-gray-400">
              {(bitrate / 1000).toFixed(1)} Mbps
            </span>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={`${status.color} flex items-center gap-1`}>
            <span className={status.pulse ? 'animate-pulse' : ''}>{status.icon}</span>
            <span className="font-medium">{status.text}</span>
          </span>

          {/* Live Latency */}
          {isLive && latency > 0 && (
            <span className="text-gray-400 text-xs">
              Latency: {latency.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* Progress and Buffer Bar */}
      {!isLive && duration > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
            {/* Buffer bar */}
            <div
              className="absolute h-full bg-gray-600 transition-all duration-300"
              style={{ width: `${bufferPercentage}%` }}
            />
            {/* Progress bar */}
            <div
              className="absolute h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {/* Playback Stats */}
        <div className="space-y-1">
          <div className="text-gray-500">Playback</div>
          <div className="text-gray-300">
            {playbackRate}x {isMuted && '🔇'}
          </div>
        </div>

        {/* Buffer Health */}
        <div className="space-y-1">
          <div className="text-gray-500">Buffer</div>
          <div className={`${bufferPercentage > 50 ? 'text-green-400' : bufferPercentage > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
            {bufferPercentage.toFixed(0)}%
          </div>
        </div>

        {/* Network Quality */}
        <div className="space-y-1">
          <div className="text-gray-500">Network</div>
          <div className={`${networkInfo.effectiveType === '4g' ? 'text-green-400' : networkInfo.effectiveType === '3g' ? 'text-yellow-400' : 'text-red-400'}`}>
            {networkInfo.effectiveType.toUpperCase()} {networkInfo.rtt > 0 && `(${networkInfo.rtt}ms)`}
          </div>
        </div>

        {/* Frame Drops */}
        <div className="space-y-1">
          <div className="text-gray-500">Dropped Frames</div>
          <div className={`${droppedFrames === 0 ? 'text-green-400' : droppedFrames < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
            {droppedFrames}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {videoState === 'error' && errorMessage && (
        <div className="p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

VideoStatusIndicator.displayName = 'VideoStatusIndicator';

export default VideoStatusIndicator;