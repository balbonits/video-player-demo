"use client";

import { memo, useState, useRef, useEffect } from 'react';
import ReactHLSPlayer from '@/components/ReactHLSPlayer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';
import VideoStatusIndicator from '@/components/VideoStatusIndicator';

const installCode = `npm install hls.js
# or
yarn add hls.js
# or
pnpm add hls.js`;

const importCode = `import Hls from 'hls.js';
import { useRef, useEffect } from 'react';`;

const componentCode = `function HLSPlayer({ src, autoplay = false }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Performance optimizations
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,

        // Smart TV optimizations
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,

        // Network optimizations
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error', data);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      if (autoplay) {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-full"
      playsInline
    />
  );
}`;

const configCode = `const hlsConfig = {
  // Buffer Configuration
  maxBufferLength: 30,            // Maximum buffer length in seconds
  maxMaxBufferLength: 600,         // Maximum total buffer length
  maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
  maxBufferHole: 0.5,              // Maximum gap allowed in buffer

  // Smart TV Optimizations
  enableWorker: true,              // Use Web Worker for demuxing
  lowLatencyMode: false,           // Disable for TV stability
  backBufferLength: 90,            // Keep 90s of back buffer

  // Network Configuration
  manifestLoadingTimeOut: 10000,   // 10s timeout for manifest
  manifestLoadingMaxRetry: 3,      // Retry manifest 3 times
  levelLoadingTimeOut: 10000,      // 10s timeout for segments
  levelLoadingMaxRetry: 4,         // Retry segments 4 times

  // ABR Configuration
  abrEwmaDefaultEstimate: 1000000, // 1Mbps default bandwidth
  abrBandWidthFactor: 0.95,        // Conservative bandwidth usage
  abrBandWidthUpFactor: 0.7,       // Slower quality increases
  abrMaxWithRealBitrate: true,     // Use real bitrate for max

  // Performance
  testBandwidth: true,             // Test bandwidth on start
  debug: false,                    // Disable debug logging
};`;

const eventHandlingCode = `// Quality Level Change
hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
  console.log(\`Switched to quality level \${data.level}\`);
  const levelDetails = hls.levels[data.level];
  console.log(\`Resolution: \${levelDetails.width}x\${levelDetails.height}\`);
  console.log(\`Bitrate: \${levelDetails.bitrate}\`);
});

// Buffer Management
hls.on(Hls.Events.BUFFER_APPENDED, (event, data) => {
  const buffered = video.buffered;
  if (buffered.length > 0) {
    const bufferEnd = buffered.end(buffered.length - 1);
    const bufferLength = bufferEnd - video.currentTime;
    console.log(\`Buffer length: \${bufferLength.toFixed(2)}s\`);
  }
});

// Error Recovery
hls.on(Hls.Events.ERROR, (event, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.error('Fatal network error');
        // Implement exponential backoff retry
        setTimeout(() => hls.startLoad(), 1000);
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.error('Fatal media error');
        hls.recoverMediaError();
        break;
      default:
        console.error('Fatal error, cannot recover');
        // Implement fallback behavior
        break;
    }
  }
});`;

export default function HLSPlayerPage() {
  // Using a CORS-enabled HLS stream
  const testStream = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Get video element from the web component
  useEffect(() => {
    const checkForVideo = () => {
      if (playerContainerRef.current) {
        // Look for the video element inside the web component's shadow DOM
        const webComponent = playerContainerRef.current.querySelector('hls-video-player');
        if (webComponent) {
          const shadowRoot = (webComponent as any).shadowRoot;
          if (shadowRoot) {
            const video = shadowRoot.querySelector('video');
            if (video) {
              setVideoElement(video);
              return true;
            }
          }
        }
      }
      return false;
    };

    // Check immediately
    if (!checkForVideo()) {
      // If not found, set up an interval to keep checking
      const interval = setInterval(() => {
        if (checkForVideo()) {
          clearInterval(interval);
        }
      }, 500);

      // Clean up after 10 seconds if video not found
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HLS.js Player</h1>
        <p className="text-gray-400">
          Production-ready adaptive streaming with HLS.js - the industry standard for HTTP Live Streaming
        </p>
      </div>

      {/* Live Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <div ref={playerContainerRef} className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '60vh', minHeight: '400px' }}>
          <ReactHLSPlayer
            src={testStream}
            autoplay={false}
            controls
            performanceMode="desktop"
          />
        </div>

        {/* Dynamic Video Status */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <VideoStatusIndicator
            videoElement={videoElement}
            streamUrl={testStream}
            isLive={false}
          />
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="space-y-8">
        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <CodeBlock
            code={installCode}
            language="bash"
            title="Package Installation"
          />
        </section>

        {/* Basic Implementation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Implementation</h2>
          <CodeBlock
            code={importCode}
            language="javascript"
            title="Import Statements"
          />
          <CodeBlock
            code={componentCode}
            language="javascript"
            title="React Component"
          />
        </section>

        {/* Configuration */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Performance Configuration</h2>
          <CodeBlock
            code={configCode}
            language="javascript"
            title="HLS.js Configuration"
          />
        </section>

        {/* Event Handling */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Event Handling</h2>
          <CodeBlock
            code={eventHandlingCode}
            language="javascript"
            title="Event Listeners"
          />
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-green-400">Strengths</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Adaptive bitrate streaming with intelligent ABR algorithms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Multi-audio track and subtitle support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>DRM support (Widevine, PlayReady, FairPlay)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Low latency mode for live streaming</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Extensive error recovery mechanisms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Web Worker support for better performance</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-yellow-400">Considerations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>Bundle size ~200KB (gzipped: ~70KB)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>Complex configuration for advanced features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>Memory usage increases with buffer size</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>Requires careful tuning for Smart TV</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>Native HLS fallback needs separate handling</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">~200KB</div>
                <div className="text-sm text-gray-400">Bundle Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">&lt;2s</div>
                <div className="text-sm text-gray-400">Time to First Frame</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">~80MB</div>
                <div className="text-sm text-gray-400">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">95%+</div>
                <div className="text-sm text-gray-400">Browser Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                <span><strong>Buffer Management:</strong> Set appropriate buffer sizes based on target platform (lower for Smart TV)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                <span><strong>Error Handling:</strong> Implement comprehensive error recovery with exponential backoff</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                <span><strong>Memory Cleanup:</strong> Always destroy HLS instance in cleanup to prevent memory leaks</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">4.</span>
                <span><strong>ABR Tuning:</strong> Adjust ABR parameters based on network conditions and device capabilities</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">5.</span>
                <span><strong>Performance Monitoring:</strong> Track buffer health, quality switches, and playback metrics</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}