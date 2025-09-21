"use client";

import { memo } from 'react';
import NativeHTML5Player from '@/components/NativeHTML5Player';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';

const basicImplementation = `function NativeVideoPlayer({ src, poster }) {
  return (
    <video
      src={src}
      poster={poster}
      controls
      playsInline
      className="w-full h-full"
    >
      Your browser does not support the video tag.
    </video>
  );
}`;

const advancedImplementation = `import { useRef, useEffect, useState } from 'react';

function AdvancedNativePlayer({ src, autoplay = false }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffer = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferPercent);
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    if (autoplay) {
      video.play().catch(console.error);
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffer);
    };
  }, [src, autoplay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        playsInline
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="text-white hover:text-blue-400 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <div className="flex-1">
            <div className="bg-gray-700 rounded-full h-2 relative">
              <div
                className="bg-gray-500 h-full rounded-full absolute"
                style={{ width: \`\${buffered}%\` }}
              />
              <div
                className="bg-blue-500 h-full rounded-full absolute"
                style={{ width: \`\${(currentTime / duration) * 100}%\` }}
              />
            </div>
          </div>

          <span className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
}`;

const eventHandling = `// Video Events Reference
const videoEventHandlers = {
  // Playback Events
  onPlay: () => console.log('Video started playing'),
  onPause: () => console.log('Video paused'),
  onEnded: () => console.log('Video ended'),

  // Loading Events
  onLoadStart: () => console.log('Started loading'),
  onLoadedMetadata: (e) => {
    console.log('Duration:', e.target.duration);
    console.log('Dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
  },
  onLoadedData: () => console.log('First frame loaded'),
  onCanPlay: () => console.log('Can start playing'),
  onCanPlayThrough: () => console.log('Can play through without buffering'),

  // Progress Events
  onTimeUpdate: (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100;
    console.log(\`Progress: \${percent.toFixed(1)}%\`);
  },
  onProgress: (e) => {
    const video = e.target;
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      console.log(\`Buffered: \${bufferedEnd}s\`);
    }
  },

  // Error Events
  onError: (e) => {
    const error = e.target.error;
    console.error('Video error:', error?.message || 'Unknown error');
  },

  // Network Events
  onWaiting: () => console.log('Buffering...'),
  onStalled: () => console.log('Download stalled'),
  onSuspend: () => console.log('Download suspended'),
};

// Apply all event handlers
Object.entries(videoEventHandlers).forEach(([event, handler]) => {
  video.addEventListener(event.slice(2).toLowerCase(), handler);
});`;

const formatSupport = `// Check format support
const checkVideoSupport = () => {
  const video = document.createElement('video');

  const formats = {
    mp4: video.canPlayType('video/mp4'),
    webm: video.canPlayType('video/webm'),
    ogg: video.canPlayType('video/ogg'),
    hls: video.canPlayType('application/vnd.apple.mpegurl'),
    dash: video.canPlayType('application/dash+xml'),
  };

  console.log('Video Format Support:');
  Object.entries(formats).forEach(([format, support]) => {
    console.log(\`\${format}: \${support || 'not supported'}\`);
  });

  return formats;
};

// Provide fallback sources
<video controls>
  <source src="video.webm" type="video/webm" />
  <source src="video.mp4" type="video/mp4" />
  <source src="video.ogv" type="video/ogg" />
  Your browser does not support HTML5 video.
</video>`;

export default function NativePlayerPage() {
  // Use a direct MP4 file for native player demo
  const testStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Native HTML5 Player</h1>
        <p className="text-gray-400">
          Pure HTML5 video element - the simplest and most lightweight video solution
        </p>
      </div>

      {/* Live Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '60vh', minHeight: '400px' }}>
          <NativeHTML5Player
            src={testStream}
            autoplay={false}
            controls
            performanceMode="desktop"
          />
        </div>

        {/* Stream Info */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Native HTML5 Video Element (HLS on Safari, Progressive on others)</span>
            <span className="text-green-500">● Ready</span>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="space-y-8">
        {/* Basic Implementation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Implementation</h2>
          <CodeBlock
            code={basicImplementation}
            language="javascript"
            title="Simple Video Player"
          />
        </section>

        {/* Advanced Implementation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Advanced Implementation</h2>
          <CodeBlock
            code={advancedImplementation}
            language="javascript"
            title="Custom Controls & State Management"
          />
        </section>

        {/* Event Handling */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Event Handling</h2>
          <CodeBlock
            code={eventHandling}
            language="javascript"
            title="Comprehensive Event Listeners"
          />
        </section>

        {/* Format Support */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Format Support & Fallbacks</h2>
          <CodeBlock
            code={formatSupport}
            language="javascript"
            title="Format Detection & Fallbacks"
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
                  <span>Zero dependencies - pure web standards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Smallest possible footprint (&lt;10KB)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Native browser optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Built-in accessibility features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Hardware acceleration support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Perfect for progressive download</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-yellow-400">Limitations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>No adaptive bitrate streaming</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Limited format support across browsers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>No DRM support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Basic buffering strategy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">○</span>
                  <span>HLS only on Safari/iOS</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Browser Compatibility */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Browser Compatibility</h2>
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">Format</th>
                  <th className="text-center py-2 px-3">Chrome</th>
                  <th className="text-center py-2 px-3">Firefox</th>
                  <th className="text-center py-2 px-3">Safari</th>
                  <th className="text-center py-2 px-3">Edge</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">MP4 (H.264)</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">WebM (VP9)</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">HLS</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-yellow-500">○</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Ogg Theora</td>
                  <td className="text-center py-2 px-3 text-yellow-500">○</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-yellow-500">○</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs text-gray-500">
              ✓ = Supported | ○ = Partial support | ✗ = Not supported
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">&lt;10KB</div>
                <div className="text-sm text-gray-400">Bundle Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">&lt;0.5s</div>
                <div className="text-sm text-gray-400">Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">~30MB</div>
                <div className="text-sm text-gray-400">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">99%+</div>
                <div className="text-sm text-gray-400">Browser Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Best Use Cases</h2>
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Progressive Download:</strong> Best for pre-recorded content with known file sizes</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Simple Playback:</strong> When adaptive streaming is not required</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Low Complexity:</strong> Projects that need minimal dependencies</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Safari HLS:</strong> Native HLS support on Apple devices</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Fallback Player:</strong> As a fallback when advanced players fail</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}