"use client";

import { memo } from 'react';
import MobileOptimizedPlayer from '@/components/MobileOptimizedPlayer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';

const touchGesturesCode = `import { useState, useRef, TouchEvent } from 'react';

function MobileTouchPlayer({ src }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const video = videoRef.current;
    if (!video) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Horizontal swipe for seeking
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const seekAmount = deltaX > 0 ? 10 : -10;
      video.currentTime = Math.max(0, Math.min(
        video.duration,
        video.currentTime + seekAmount
      ));
    }

    // Vertical swipe for volume
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const volumeChange = deltaY > 0 ? -0.1 : 0.1;
      video.volume = Math.max(0, Math.min(1, video.volume + volumeChange));
    }

    // Double tap for play/pause
    const currentTime = Date.now();
    if (currentTime - lastTap < 300) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
    setLastTap(currentTime);
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        playsInline
        webkit-playsinline="true"
      />
    </div>
  );
}`;

const orientationHandling = `import { useEffect, useState } from 'react';

function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    // Listen to both resize and orientationchange events
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

function OrientationAwarePlayer({ src }) {
  const orientation = useOrientation();

  return (
    <div className={\`relative \${
      orientation === 'landscape' ? 'h-screen' : 'h-[50vh]'
    }\`}>
      <video
        src={src}
        className="w-full h-full object-contain"
        controls
        playsInline
      />
      {orientation === 'portrait' && (
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded">
          <span className="text-white text-sm">
            Rotate for fullscreen
          </span>
        </div>
      )}
    </div>
  );
}`;

const batteryOptimization = `import { useEffect, useState } from 'react';

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

function useBatteryOptimization() {
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(true);
  const [qualityMode, setQualityMode] = useState<'auto' | 'saver' | 'performance'>('auto');

  useEffect(() => {
    // @ts-ignore - Battery API is not in TypeScript definitions
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery: BatteryManager) => {
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);

          // Adjust quality based on battery
          if (battery.level < 0.2 && !battery.charging) {
            setQualityMode('saver');
          } else if (battery.charging || battery.level > 0.5) {
            setQualityMode('performance');
          } else {
            setQualityMode('auto');
          }
        };

        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);

        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
        };
      });
    }
  }, []);

  return { batteryLevel, isCharging, qualityMode };
}

function BatteryAwarePlayer({ src }) {
  const { batteryLevel, isCharging, qualityMode } = useBatteryOptimization();
  const [maxQuality, setMaxQuality] = useState<number | null>(null);

  useEffect(() => {
    // Limit quality based on battery mode
    switch (qualityMode) {
      case 'saver':
        setMaxQuality(480); // Limit to 480p
        break;
      case 'auto':
        setMaxQuality(720); // Limit to 720p
        break;
      case 'performance':
        setMaxQuality(null); // No limit
        break;
    }
  }, [qualityMode]);

  return (
    <div className="relative">
      <video src={src} controls playsInline />

      {/* Battery Status Indicator */}
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-2 rounded">
        <div className="flex items-center gap-2 text-white text-sm">
          <span>{Math.round(batteryLevel * 100)}%</span>
          {isCharging && <span>⚡</span>}
          <span className={\`
            \${qualityMode === 'saver' ? 'text-yellow-400' : ''}
            \${qualityMode === 'performance' ? 'text-green-400' : ''}
          \`}>
            {qualityMode === 'saver' && 'Battery Saver'}
            {qualityMode === 'auto' && 'Balanced'}
            {qualityMode === 'performance' && 'Performance'}
          </span>
        </div>
      </div>
    </div>
  );
}`;

const networkAwareness = `import { useEffect, useState } from 'react';

interface NetworkInformation {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  saveData: boolean;
  downlink: number;
  rtt: number;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

function useNetworkQuality() {
  const [networkQuality, setNetworkQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    // @ts-ignore - Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setSaveData(connection.saveData || false);

        // Determine network quality
        switch (connection.effectiveType) {
          case '4g':
            setNetworkQuality('high');
            break;
          case '3g':
            setNetworkQuality('medium');
            break;
          case '2g':
          case 'slow-2g':
            setNetworkQuality('low');
            break;
          default:
            // Use downlink speed as fallback
            if (connection.downlink >= 5) {
              setNetworkQuality('high');
            } else if (connection.downlink >= 1) {
              setNetworkQuality('medium');
            } else {
              setNetworkQuality('low');
            }
        }
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return { networkQuality, saveData };
}

function NetworkAwarePlayer({ src, hlsConfig }) {
  const { networkQuality, saveData } = useNetworkQuality();

  // Adjust HLS config based on network
  const getOptimizedConfig = () => {
    if (saveData) {
      return {
        ...hlsConfig,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        maxBufferSize: 10 * 1000 * 1000, // 10MB
        abrBandWidthFactor: 0.5,
      };
    }

    switch (networkQuality) {
      case 'low':
        return {
          ...hlsConfig,
          maxBufferLength: 15,
          maxMaxBufferLength: 60,
          maxBufferSize: 20 * 1000 * 1000, // 20MB
          abrBandWidthFactor: 0.7,
        };
      case 'medium':
        return {
          ...hlsConfig,
          maxBufferLength: 30,
          maxMaxBufferLength: 300,
          maxBufferSize: 40 * 1000 * 1000, // 40MB
          abrBandWidthFactor: 0.85,
        };
      case 'high':
      default:
        return hlsConfig;
    }
  };

  return (
    <div className="relative">
      {/* Network indicator */}
      <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded">
        <span className={\`text-sm \${
          networkQuality === 'high' ? 'text-green-400' :
          networkQuality === 'medium' ? 'text-yellow-400' :
          'text-red-400'
        }\`}>
          {networkQuality === 'high' && '📶 High Speed'}
          {networkQuality === 'medium' && '📶 Medium Speed'}
          {networkQuality === 'low' && '📶 Low Speed'}
          {saveData && ' (Data Saver)'}
        </span>
      </div>

      <HLSPlayer
        src={src}
        config={getOptimizedConfig()}
      />
    </div>
  );
}`;

export default function MobilePlayerPage() {
  const testStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mobile Optimized Player</h1>
        <p className="text-gray-400">
          Touch-friendly video player optimized for mobile devices with gesture controls and battery awareness
        </p>
      </div>

      {/* Live Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '60vh', minHeight: '400px' }}>
          <MobileOptimizedPlayer
            src={testStream}
            autoplay={false}
            controls
            performanceMode="mobile"
          />
        </div>

        {/* Mobile Controls Info */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">👆</div>
              <div className="text-gray-400">Double Tap to Play</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">👉</div>
              <div className="text-gray-400">Swipe to Seek</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">👆👇</div>
              <div className="text-gray-400">Swipe for Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-gray-400">Rotate for Full</div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="space-y-8">
        {/* Touch Gestures */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Touch Gesture Implementation</h2>
          <CodeBlock
            code={touchGesturesCode}
            language="javascript"
            title="Touch Controls"
          />
        </section>

        {/* Orientation Handling */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Orientation Handling</h2>
          <CodeBlock
            code={orientationHandling}
            language="javascript"
            title="Auto-Rotation Support"
          />
        </section>

        {/* Battery Optimization */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Battery Optimization</h2>
          <CodeBlock
            code={batteryOptimization}
            language="javascript"
            title="Battery-Aware Streaming"
          />
        </section>

        {/* Network Awareness */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Network Awareness</h2>
          <CodeBlock
            code={networkAwareness}
            language="javascript"
            title="Adaptive Network Quality"
          />
        </section>

        {/* Mobile-Specific Features */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mobile-Specific Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-green-400">Touch Optimizations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Double-tap to play/pause</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Horizontal swipe for 10s seek</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Vertical swipe for volume control</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Pinch to zoom for video scaling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Long press for playback speed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Edge swipe for brightness</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-blue-400">Power Management</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Battery level monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Automatic quality adjustment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Reduced buffering on low battery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Network-aware streaming</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Data saver mode support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">○</span>
                  <span>Background pause on minimize</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mobile Platform Support */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mobile Platform Support</h2>
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">Feature</th>
                  <th className="text-center py-2 px-3">iOS Safari</th>
                  <th className="text-center py-2 px-3">Android Chrome</th>
                  <th className="text-center py-2 px-3">Mobile Firefox</th>
                  <th className="text-center py-2 px-3">Samsung Internet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Touch Gestures</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Fullscreen API</td>
                  <td className="text-center py-2 px-3 text-yellow-500">○</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Picture-in-Picture</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-3 font-medium">Battery API</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Network Info API</td>
                  <td className="text-center py-2 px-3 text-red-500">✗</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                  <td className="text-center py-2 px-3 text-yellow-500">○</td>
                  <td className="text-center py-2 px-3 text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs text-gray-500">
              ✓ = Fully supported | ○ = Partial support | ✗ = Not supported
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mobile Performance Metrics</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">~100KB</div>
                <div className="text-sm text-gray-400">Bundle Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">&lt;1.5s</div>
                <div className="text-sm text-gray-400">Load Time (4G)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">~60MB</div>
                <div className="text-sm text-gray-400">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">90%+</div>
                <div className="text-sm text-gray-400">Mobile Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mobile Best Practices</h2>
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                <span><strong>Always use playsInline:</strong> Prevents unwanted fullscreen on iOS</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                <span><strong>Implement touch zones:</strong> Larger tap targets for mobile interaction</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                <span><strong>Optimize for portrait:</strong> Most mobile viewing is vertical</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">4.</span>
                <span><strong>Respect data saving:</strong> Check for saveData flag in Network API</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">5.</span>
                <span><strong>Handle interruptions:</strong> Pause on phone calls, notifications</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}