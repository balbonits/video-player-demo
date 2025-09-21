"use client";

import { memo } from 'react';
import Link from 'next/link';

interface PlayerOption {
  id: string;
  title: string;
  description: string;
  features: string[];
  pros: string[];
  cons: string[];
  useCase: string;
  badge?: string;
  href: string;
}

const playerOptions: PlayerOption[] = [
  {
    id: 'hls',
    title: 'HLS.js Player',
    description: 'Production-ready adaptive streaming with HLS.js',
    features: ['Adaptive bitrate', 'Multi-audio/subtitle', 'DRM support', 'Low latency'],
    pros: ['Industry standard', 'Excellent browser support', 'Rich feature set'],
    cons: ['Larger bundle size', 'Complex configuration'],
    useCase: 'Production streaming applications',
    badge: 'Recommended',
    href: '/hls'
  },
  {
    id: 'native',
    title: 'Native HTML5',
    description: 'Pure HTML5 video element with custom controls',
    features: ['Minimal dependencies', 'Native browser APIs', 'Lightweight'],
    pros: ['Simple implementation', 'Small footprint', 'Fast load time'],
    cons: ['Limited format support', 'No adaptive streaming', 'Basic features only'],
    useCase: 'Simple video playback needs',
    href: '/native'
  },
  {
    id: 'mobile',
    title: 'Mobile Optimized',
    description: 'Touch-friendly player for mobile devices',
    features: ['Touch gestures', 'Responsive design', 'Battery optimization', 'Network aware'],
    pros: ['Mobile-first design', 'Touch optimized', 'Performance focused'],
    cons: ['Mobile specific', 'Limited desktop features'],
    useCase: 'Mobile web applications',
    badge: 'Mobile',
    href: '/mobile'
  },
  {
    id: 'roku',
    title: 'Roku Simulation',
    description: 'TV remote navigation demonstration',
    features: ['D-pad navigation', 'Focus management', 'Remote control', 'TV optimization'],
    pros: ['TV-ready', 'Accessible navigation', 'Smart TV patterns'],
    cons: ['Desktop simulation only', 'Limited to keyboard input'],
    useCase: 'Smart TV development',
    badge: 'TV',
    href: '/roku'
  },
  {
    id: 'chromecast',
    title: 'Chromecast Receiver',
    description: 'Cast receiver player implementation',
    features: ['Cast protocol', 'Remote control', 'Queue management', 'Multi-room'],
    pros: ['Cast ecosystem', 'Remote playback', 'Cross-device'],
    cons: ['Requires Cast devices', 'Complex setup'],
    useCase: 'Cast-enabled applications',
    badge: 'Cast',
    href: '/chromecast'
  },
  {
    id: 'benchmark',
    title: 'Performance Benchmark',
    description: 'Performance testing and optimization tools',
    features: ['FPS monitoring', 'Memory tracking', 'Network analysis', 'CPU profiling'],
    pros: ['Real metrics', 'Optimization insights', 'Cross-platform testing'],
    cons: ['Development tool only', 'Not for production'],
    useCase: 'Performance optimization',
    badge: 'Test',
    href: '/benchmark'
  }
];

const ComparisonTable = memo(() => {
  const features = [
    { name: 'Adaptive Streaming', hls: '✓', native: '✗', mobile: '✓', roku: '✓', chromecast: '✓', benchmark: '✓' },
    { name: 'DRM Support', hls: '✓', native: '✗', mobile: '✓', roku: '✓', chromecast: '✓', benchmark: '✗' },
    { name: 'Subtitles/CC', hls: '✓', native: '✓', mobile: '✓', roku: '✓', chromecast: '✓', benchmark: '✓' },
    { name: 'Multi-Audio', hls: '✓', native: '✗', mobile: '✓', roku: '✓', chromecast: '✓', benchmark: '✓' },
    { name: 'Touch Gestures', hls: '○', native: '○', mobile: '✓', roku: '✗', chromecast: '✗', benchmark: '○' },
    { name: 'TV Remote', hls: '○', native: '✗', mobile: '✗', roku: '✓', chromecast: '✓', benchmark: '✗' },
    { name: 'Bundle Size', hls: '~200KB', native: '<10KB', mobile: '~100KB', roku: '~150KB', chromecast: '~180KB', benchmark: '~250KB' },
    { name: 'Load Time', hls: '<2s', native: '<0.5s', mobile: '<1.5s', roku: '<2s', chromecast: '<2.5s', benchmark: '<3s' },
    { name: 'Memory Usage', hls: '~80MB', native: '~30MB', mobile: '~60MB', roku: '~70MB', chromecast: '~85MB', benchmark: '~100MB' },
    { name: 'Browser Support', hls: '95%+', native: '99%+', mobile: '90%+', roku: 'N/A', chromecast: 'Chrome', benchmark: '95%+' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium text-gray-400">Feature</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">HLS.js</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">Native</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">Mobile</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">Roku</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">Chromecast</th>
            <th className="text-center py-3 px-4 font-medium text-gray-400">Benchmark</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.name} className={index % 2 === 0 ? 'bg-gray-900/50' : ''}>
              <td className="py-3 px-4 text-sm font-medium">{feature.name}</td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.hls === '✓' ? 'text-green-500' : feature.hls === '○' ? 'text-yellow-500' : feature.hls === '✗' ? 'text-red-500' : 'text-gray-400'}>
                  {feature.hls}
                </span>
              </td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.native === '✓' ? 'text-green-500' : feature.native === '○' ? 'text-yellow-500' : feature.native === '✗' ? 'text-red-500' : 'text-gray-400'}>
                  {feature.native}
                </span>
              </td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.mobile === '✓' ? 'text-green-500' : feature.mobile === '○' ? 'text-yellow-500' : feature.mobile === '✗' ? 'text-red-500' : 'text-gray-400'}>
                  {feature.mobile}
                </span>
              </td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.roku === '✓' ? 'text-green-500' : feature.roku === '○' ? 'text-yellow-500' : feature.roku === '✗' ? 'text-red-500' : feature.roku === 'N/A' ? 'text-gray-600' : 'text-gray-400'}>
                  {feature.roku}
                </span>
              </td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.chromecast === '✓' ? 'text-green-500' : feature.chromecast === '○' ? 'text-yellow-500' : feature.chromecast === '✗' ? 'text-red-500' : feature.chromecast === 'Chrome' ? 'text-blue-500' : 'text-gray-400'}>
                  {feature.chromecast}
                </span>
              </td>
              <td className="text-center py-3 px-4 text-sm">
                <span className={feature.benchmark === '✓' ? 'text-green-500' : feature.benchmark === '○' ? 'text-yellow-500' : feature.benchmark === '✗' ? 'text-red-500' : 'text-gray-400'}>
                  {feature.benchmark}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div>✓ = Fully supported | ○ = Partial support | ✗ = Not supported</div>
        <div>Performance metrics measured on Apple M1, Chrome 120+</div>
      </div>
    </div>
  );
});

ComparisonTable.displayName = 'ComparisonTable';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
          Video Player Demo Suite
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Performance-optimized video players for Smart TV, OTT, and web platforms.
          Demonstrating modern streaming solutions with focus on accessibility and performance.
        </p>

        {/* Key Metrics */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">95+</div>
            <div className="text-sm text-gray-400">Lighthouse Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">&lt;100MB</div>
            <div className="text-sm text-gray-400">TV Memory Usage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">60fps</div>
            <div className="text-sm text-gray-400">Video Playback</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">&lt;3s</div>
            <div className="text-sm text-gray-400">Time to First Frame</div>
          </div>
        </div>
      </div>

      {/* Player Options Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Choose Your Player</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playerOptions.map((player) => (
            <Link
              key={player.id}
              href={player.href}
              className="group relative bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              {player.badge && (
                <span className={`
                  absolute top-4 right-4 text-xs px-2 py-1 rounded
                  ${player.badge === 'Recommended' ? 'bg-green-600 text-white' : ''}
                  ${player.badge === 'TV' ? 'bg-purple-600 text-white' : ''}
                  ${player.badge === 'Mobile' ? 'bg-blue-600 text-white' : ''}
                  ${player.badge === 'Cast' ? 'bg-orange-600 text-white' : ''}
                  ${player.badge === 'Test' ? 'bg-red-600 text-white' : ''}
                `}>
                  {player.badge}
                </span>
              )}

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {player.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{player.description}</p>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Key Features</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.features.map((feature) => (
                      <span key={feature} className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Best For</span>
                  <p className="text-sm mt-1">{player.useCase}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Explore</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <ComparisonTable />
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <p className="text-gray-400 mb-6">
          Get started with the recommended HLS.js player for production streaming applications
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/hls"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Try HLS Player
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}