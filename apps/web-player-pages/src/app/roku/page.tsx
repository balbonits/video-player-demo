"use client";

import { memo } from 'react';
import RokuSimulationPlayer from '@/components/RokuSimulationPlayer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';

const dpadNavigationCode = `import { useRef, useEffect, useState } from 'react';

function TVRemotePlayer({ src }) {
  const [focusedElement, setFocusedElement] = useState<string>('play');
  const videoRef = useRef<HTMLVideoElement>(null);

  const controls = [
    { id: 'play', label: 'Play/Pause', action: 'playPause' },
    { id: 'rewind', label: '⏪ 10s', action: 'rewind' },
    { id: 'forward', label: '⏩ 10s', action: 'forward' },
    { id: 'volume-down', label: '🔉', action: 'volumeDown' },
    { id: 'volume-up', label: '🔊', action: 'volumeUp' },
    { id: 'quality', label: 'Quality', action: 'quality' },
    { id: 'captions', label: 'CC', action: 'captions' },
    { id: 'fullscreen', label: '⛶', action: 'fullscreen' },
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      const currentIndex = controls.findIndex(c => c.id === focusedElement);

      switch (e.key) {
        // D-pad navigation
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setFocusedElement(controls[currentIndex - 1].id);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < controls.length - 1) {
            setFocusedElement(controls[currentIndex + 1].id);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Move focus to video timeline
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Move focus to controls
          break;

        // Action buttons
        case 'Enter':
        case ' ':
          e.preventDefault();
          executeAction(controls[currentIndex].action);
          break;

        // Quick actions
        case 'MediaPlayPause':
        case 'p':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'MediaRewind':
        case 'r':
          e.preventDefault();
          video.currentTime -= 10;
          break;
        case 'MediaFastForward':
        case 'f':
          e.preventDefault();
          video.currentTime += 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusedElement]);

  const executeAction = (action: string) => {
    const video = videoRef.current;
    if (!video) return;

    switch (action) {
      case 'playPause':
        video.paused ? video.play() : video.pause();
        break;
      case 'rewind':
        video.currentTime -= 10;
        break;
      case 'forward':
        video.currentTime += 10;
        break;
      case 'volumeDown':
        video.volume = Math.max(0, video.volume - 0.1);
        break;
      case 'volumeUp':
        video.volume = Math.min(1, video.volume + 0.1);
        break;
      // Add more actions as needed
    }
  };

  return (
    <div className="relative">
      <video ref={videoRef} src={src} className="w-full" />

      {/* TV-style control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
        <div className="flex justify-center gap-2">
          {controls.map((control) => (
            <button
              key={control.id}
              className={\`px-4 py-2 rounded \${
                focusedElement === control.id
                  ? 'bg-blue-600 text-white ring-4 ring-white'
                  : 'bg-gray-700 text-gray-300'
              }\`}
              onClick={() => executeAction(control.action)}
              onFocus={() => setFocusedElement(control.id)}
            >
              {control.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`;

const spatialNavigationCode = `class SpatialNavigation {
  private elements: HTMLElement[] = [];
  private currentIndex = 0;

  register(element: HTMLElement) {
    this.elements.push(element);
    element.dataset.navIndex = String(this.elements.length - 1);
  }

  unregister(element: HTMLElement) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  navigate(direction: 'up' | 'down' | 'left' | 'right') {
    const current = this.elements[this.currentIndex];
    const currentRect = current.getBoundingClientRect();

    let bestCandidate: HTMLElement | null = null;
    let bestDistance = Infinity;

    this.elements.forEach((element, index) => {
      if (index === this.currentIndex) return;

      const rect = element.getBoundingClientRect();

      // Check if element is in the right direction
      const isValidDirection = this.isInDirection(
        currentRect,
        rect,
        direction
      );

      if (!isValidDirection) return;

      // Calculate distance
      const distance = this.calculateDistance(currentRect, rect);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = element;
      }
    });

    if (bestCandidate) {
      this.focusElement(bestCandidate);
    }
  }

  private isInDirection(
    from: DOMRect,
    to: DOMRect,
    direction: string
  ): boolean {
    const fromCenter = {
      x: from.left + from.width / 2,
      y: from.top + from.height / 2,
    };
    const toCenter = {
      x: to.left + to.width / 2,
      y: to.top + to.height / 2,
    };

    switch (direction) {
      case 'up':
        return toCenter.y < fromCenter.y;
      case 'down':
        return toCenter.y > fromCenter.y;
      case 'left':
        return toCenter.x < fromCenter.x;
      case 'right':
        return toCenter.x > fromCenter.x;
      default:
        return false;
    }
  }

  private calculateDistance(from: DOMRect, to: DOMRect): number {
    const fromCenter = {
      x: from.left + from.width / 2,
      y: from.top + from.height / 2,
    };
    const toCenter = {
      x: to.left + to.width / 2,
      y: to.top + to.height / 2,
    };

    return Math.sqrt(
      Math.pow(toCenter.x - fromCenter.x, 2) +
      Math.pow(toCenter.y - fromCenter.y, 2)
    );
  }

  private focusElement(element: HTMLElement) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.currentIndex = index;
      element.focus();
    }
  }
}`;

const rokuRemoteMapping = `// Roku Remote Button Mapping
const ROKU_KEY_CODES = {
  OK: 'Enter',         // Select/OK button
  BACK: 'Backspace',   // Back button
  HOME: 'Home',        // Home button
  UP: 'ArrowUp',       // D-pad up
  DOWN: 'ArrowDown',   // D-pad down
  LEFT: 'ArrowLeft',   // D-pad left
  RIGHT: 'ArrowRight', // D-pad right
  REPLAY: 'r',         // Instant replay (rewind)
  PLAY: ' ',           // Play/pause toggle
  REW: 'MediaRewind',  // Rewind button
  FWD: 'MediaFastForward', // Fast forward button
  INFO: 'i',           // Info/Options button (*)
  VOLUME_UP: 'VolumeUp',
  VOLUME_DOWN: 'VolumeDown',
  VOLUME_MUTE: 'VolumeMute',
};

// Handle Roku remote input
function useRokuRemote() {
  useEffect(() => {
    const handleRokuInput = (e: KeyboardEvent) => {
      // Map keyboard events to Roku remote buttons
      switch (e.key) {
        case ROKU_KEY_CODES.OK:
          console.log('OK button pressed');
          // Handle selection
          break;
        case ROKU_KEY_CODES.BACK:
          console.log('Back button pressed');
          // Navigate back
          break;
        case ROKU_KEY_CODES.HOME:
          console.log('Home button pressed');
          // Return to home screen
          break;
        case ROKU_KEY_CODES.PLAY:
          console.log('Play/Pause button pressed');
          // Toggle playback
          break;
        case ROKU_KEY_CODES.INFO:
          console.log('Info button pressed');
          // Show video info overlay
          break;
        // Add more button handlers
      }
    };

    window.addEventListener('keydown', handleRokuInput);
    return () => window.removeEventListener('keydown', handleRokuInput);
  }, []);
}

// Roku-specific UI components
function RokuUIOverlay({ videoInfo }) {
  return (
    <div className="roku-overlay">
      {/* Roku-style progress bar */}
      <div className="progress-bar-container">
        <div className="time-current">0:00</div>
        <div className="progress-bar">
          <div className="progress-bar-fill" />
          <div className="progress-bar-thumb" />
        </div>
        <div className="time-duration">0:00</div>
      </div>

      {/* Roku-style control hints */}
      <div className="control-hints">
        <span className="hint">
          <span className="button-icon">OK</span> Play/Pause
        </span>
        <span className="hint">
          <span className="button-icon">←/→</span> Seek
        </span>
        <span className="hint">
          <span className="button-icon">*</span> Options
        </span>
      </div>
    </div>
  );
}`;

const tvOptimizationCode = `// Smart TV Performance Optimizations
const TV_OPTIMIZATION_CONFIG = {
  // Memory management
  maxBufferLength: 20,        // Reduced for TV memory constraints
  maxMaxBufferLength: 120,     // Lower max buffer
  maxBufferSize: 30 * 1000 * 1000, // 30MB max buffer

  // CPU optimization
  enableWorker: false,         // Workers may not work on all TVs
  enableSoftwareAES: false,    // Use hardware decryption

  // Network optimization
  manifestLoadingTimeOut: 15000, // Longer timeout for slower TV networks
  levelLoadingTimeOut: 15000,
  fragLoadingTimeOut: 20000,

  // ABR settings for TV
  abrEwmaDefaultEstimate: 500000, // Conservative 500kbps estimate
  abrBandWidthFactor: 0.8,        // Use only 80% of bandwidth
  abrMaxWithRealBitrate: false,   // Don't use real bitrate

  // TV-specific
  startLevel: 0,                  // Start with lowest quality
  autoStartLoad: true,
  capLevelOnFPSDrop: true,        // Reduce quality on frame drops
  capLevelToPlayerSize: true,     // Match quality to display size
};

// Frame rate monitoring for TVs
class TVPerformanceMonitor {
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;

  startMonitoring(callback: (fps: number) => void) {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.fps = 1000 / delta;
        this.frameCount++;

        // Report FPS every second
        if (this.frameCount % 60 === 0) {
          callback(this.fps);

          // Adjust quality if FPS drops below 24
          if (this.fps < 24) {
            console.warn('Low FPS detected:', this.fps);
            // Trigger quality reduction
          }
        }
      }

      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }
}

// TV-safe font sizes and spacing
const TV_UI_CONFIG = {
  fontSize: {
    small: '18px',   // Minimum readable on TV
    normal: '24px',
    large: '32px',
    xlarge: '48px',
  },
  spacing: {
    tight: '8px',
    normal: '16px',
    loose: '24px',
    xlarge: '32px',
  },
  focusRing: {
    width: '4px',
    color: '#00a8ff',
    offset: '4px',
  },
  safeArea: {
    top: '5%',
    right: '5%',
    bottom: '5%',
    left: '5%',
  },
};`;

export default function RokuPlayerPage() {
  const testStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Roku Simulation Player</h1>
        <p className="text-gray-400">
          TV remote navigation demonstration - simulating Roku-style D-pad controls and Smart TV optimizations
        </p>
      </div>

      {/* Live Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '60vh', minHeight: '400px' }}>
          <RokuSimulationPlayer
            src={testStream}
            autoplay={false}
            controls
            performanceMode="smartTV"
          />
        </div>

        {/* Remote Control Guide */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-purple-400">Keyboard Remote Controls</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">↑↓←→</kbd>
              <span className="ml-2 text-gray-400">Navigate</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Enter</kbd>
              <span className="ml-2 text-gray-400">Select/OK</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Space</kbd>
              <span className="ml-2 text-gray-400">Play/Pause</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Backspace</kbd>
              <span className="ml-2 text-gray-400">Back</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">R</kbd>
              <span className="ml-2 text-gray-400">Rewind 10s</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">F</kbd>
              <span className="ml-2 text-gray-400">Forward 10s</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">I</kbd>
              <span className="ml-2 text-gray-400">Info/Options</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Home</kbd>
              <span className="ml-2 text-gray-400">Home Screen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="space-y-8">
        {/* D-pad Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">D-pad Navigation Implementation</h2>
          <CodeBlock
            code={dpadNavigationCode}
            language="javascript"
            title="TV Remote Control Handler"
          />
        </section>

        {/* Spatial Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Spatial Navigation System</h2>
          <CodeBlock
            code={spatialNavigationCode}
            language="javascript"
            title="Smart Focus Management"
          />
        </section>

        {/* Roku Remote Mapping */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Roku Remote Integration</h2>
          <CodeBlock
            code={rokuRemoteMapping}
            language="javascript"
            title="Roku Button Mapping"
          />
        </section>

        {/* TV Optimization */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Smart TV Optimizations</h2>
          <CodeBlock
            code={tvOptimizationCode}
            language="javascript"
            title="TV Performance Configuration"
          />
        </section>

        {/* TV Platform Features */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Smart TV Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-purple-400">Navigation Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>D-pad directional navigation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Spatial focus management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Large focus indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Quick action buttons</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Voice control ready</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>10-foot UI design</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-orange-400">TV Optimizations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>Reduced memory footprint</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>Conservative buffering</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>Hardware acceleration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>Frame drop detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>TV-safe area support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">○</span>
                  <span>Large text for readability</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* TV Platform Support */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Smart TV Platform Compatibility</h2>
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">Platform</th>
                  <th className="text-center py-2 px-3">Browser Engine</th>
                  <th className="text-center py-2 px-3">HLS Support</th>
                  <th className="text-center py-2 px-3">Performance</th>
                  <th className="text-center py-2 px-3">Memory Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Roku (WebView)</td>
                  <td className="text-center py-2 px-3">Chromium</td>
                  <td className="text-center py-2 px-3 text-yellow-500">Via HLS.js</td>
                  <td className="text-center py-2 px-3 text-yellow-500">Medium</td>
                  <td className="text-center py-2 px-3">~100MB</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Samsung Tizen</td>
                  <td className="text-center py-2 px-3">Chromium</td>
                  <td className="text-center py-2 px-3 text-green-500">Native</td>
                  <td className="text-center py-2 px-3 text-green-500">Good</td>
                  <td className="text-center py-2 px-3">~200MB</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">LG webOS</td>
                  <td className="text-center py-2 px-3">Chromium</td>
                  <td className="text-center py-2 px-3 text-green-500">Native</td>
                  <td className="text-center py-2 px-3 text-green-500">Good</td>
                  <td className="text-center py-2 px-3">~150MB</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Android TV</td>
                  <td className="text-center py-2 px-3">Chromium</td>
                  <td className="text-center py-2 px-3 text-green-500">Native</td>
                  <td className="text-center py-2 px-3 text-green-500">Excellent</td>
                  <td className="text-center py-2 px-3">~300MB</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Apple TV</td>
                  <td className="text-center py-2 px-3">WebKit</td>
                  <td className="text-center py-2 px-3 text-green-500">Native</td>
                  <td className="text-center py-2 px-3 text-green-500">Excellent</td>
                  <td className="text-center py-2 px-3">~500MB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">TV Performance Metrics</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">~150KB</div>
                <div className="text-sm text-gray-400">Bundle Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">&lt;2s</div>
                <div className="text-sm text-gray-400">Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">~70MB</div>
                <div className="text-sm text-gray-400">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">&lt;30%</div>
                <div className="text-sm text-gray-400">CPU Usage</div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Smart TV Best Practices</h2>
          <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">1.</span>
                <span><strong>10-foot UI:</strong> Design for viewing from 10 feet away with large text and controls</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">2.</span>
                <span><strong>Focus indicators:</strong> Always show clear focus with high contrast rings</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">3.</span>
                <span><strong>Conservative resources:</strong> Limit memory and CPU usage for older TVs</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">4.</span>
                <span><strong>Safe area:</strong> Keep important content within TV-safe zones (5% margin)</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">5.</span>
                <span><strong>Test on hardware:</strong> Always test on actual TV devices, not just simulators</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}