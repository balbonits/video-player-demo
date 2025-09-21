"use client";

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PerformanceMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'poor';
  description: string;
}

interface LighthouseScore {
  category: string;
  score: number;
  metrics: PerformanceMetric[];
}

const PerformancePage = memo(() => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [lighthouseScores, setLighthouseScores] = useState<LighthouseScore[]>([
    {
      category: 'Performance',
      score: 95,
      metrics: [
        { name: 'First Contentful Paint', value: 1.2, unit: 's', status: 'good', description: 'Time to first visual content' },
        { name: 'Largest Contentful Paint', value: 2.1, unit: 's', status: 'good', description: 'Time to largest content element' },
        { name: 'Total Blocking Time', value: 230, unit: 'ms', status: 'good', description: 'Total time blocked by scripts' },
        { name: 'Cumulative Layout Shift', value: 0.05, unit: '', status: 'good', description: 'Visual stability score' },
        { name: 'Speed Index', value: 2.0, unit: 's', status: 'good', description: 'How quickly content loads' }
      ]
    },
    {
      category: 'Accessibility',
      score: 98,
      metrics: [
        { name: 'Color Contrast', value: 'Pass', unit: '', status: 'good', description: 'WCAG 2.1 AA compliance' },
        { name: 'ARIA Labels', value: 'Pass', unit: '', status: 'good', description: 'Screen reader support' },
        { name: 'Keyboard Navigation', value: 'Pass', unit: '', status: 'good', description: 'Full keyboard access' },
        { name: 'Focus Indicators', value: 'Pass', unit: '', status: 'good', description: 'Visible focus states' }
      ]
    },
    {
      category: 'Best Practices',
      score: 92,
      metrics: [
        { name: 'HTTPS', value: 'Yes', unit: '', status: 'good', description: 'Secure connection' },
        { name: 'Console Errors', value: 0, unit: '', status: 'good', description: 'No console errors' },
        { name: 'Image Optimization', value: 'Pass', unit: '', status: 'good', description: 'Optimized image formats' },
        { name: 'Cache Policy', value: 'Configured', unit: '', status: 'good', description: 'Proper cache headers' }
      ]
    }
  ]);

  const performanceProfiles = [
    {
      name: 'Smart TV',
      description: 'Limited CPU/Memory',
      constraints: 'CPU: 6x slowdown, Memory: 100MB, Network: 5 Mbps'
    },
    {
      name: 'Mobile 3G',
      description: 'Slow mobile network',
      constraints: 'CPU: 4x slowdown, Network: 1.5 Mbps, Latency: 300ms'
    },
    {
      name: 'Desktop Broadband',
      description: 'High-speed connection',
      constraints: 'No throttling, Network: 100+ Mbps'
    }
  ];

  const debuggingTechniques = [
    {
      title: 'Memory Profiling',
      description: 'Track memory leaks and usage patterns during video playback',
      tools: ['Chrome DevTools Heap Snapshot', 'Performance Monitor', 'Memory Timeline'],
      command: 'performance.memory'
    },
    {
      title: 'Network Analysis',
      description: 'Monitor segment loading, adaptive bitrate switching, and CDN performance',
      tools: ['Network Waterfall', 'HAR Export', 'WebPageTest'],
      command: 'navigator.connection'
    },
    {
      title: 'Frame Analysis',
      description: 'Detect dropped frames and rendering performance issues',
      tools: ['Rendering Tab', 'Frame Viewer', 'GPU Profiler'],
      command: 'video.getVideoPlaybackQuality()'
    },
    {
      title: 'JavaScript Profiling',
      description: 'Identify performance bottlenecks in video player code',
      tools: ['CPU Profiler', 'Flame Graph', 'Call Tree'],
      command: 'performance.mark() / performance.measure()'
    }
  ];

  const runLighthouseTest = async (profile: string) => {
    setIsRunning(true);
    setCurrentTest(profile);

    // Simulate running Lighthouse test
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update scores with simulated results
    setLighthouseScores(prev => {
      const updated = [...prev];
      // Simulate score variations based on profile
      if (profile === 'Smart TV') {
        updated[0].score = Math.max(70, Math.floor(Math.random() * 20) + 70);
      } else if (profile === 'Mobile 3G') {
        updated[0].score = Math.max(75, Math.floor(Math.random() * 20) + 75);
      } else {
        updated[0].score = Math.max(85, Math.floor(Math.random() * 20) + 85);
      }
      return updated;
    });

    setIsRunning(false);
    setCurrentTest('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Performance Monitoring</h1>
        <p className="text-gray-400">
          Comprehensive performance analysis using Lighthouse and custom video streaming metrics
        </p>
      </div>

      {/* Lighthouse Scores */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Lighthouse Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lighthouseScores.map((category) => (
            <div key={category.category} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{category.category}</h3>
                <div className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
                  {category.score}
                </div>
              </div>

              <div className="space-y-3">
                {category.metrics.map((metric) => (
                  <div key={metric.name} className="flex items-start justify-between text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{getStatusIcon(metric.status)}</span>
                        <span className="text-gray-300">{metric.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                    </div>
                    <div className="text-gray-400">
                      {metric.value}{metric.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Profiles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Test Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceProfiles.map((profile) => (
            <div key={profile.name} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">{profile.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{profile.description}</p>
              <p className="text-xs text-gray-500 mb-4">{profile.constraints}</p>

              <button
                onClick={() => runLighthouseTest(profile.name)}
                disabled={isRunning}
                className={`
                  w-full px-4 py-2 rounded-lg font-medium transition-colors
                  ${isRunning
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                `}
              >
                {isRunning && currentTest === profile.name
                  ? 'Running Test...'
                  : 'Run Test'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Debugging Techniques */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Performance Investigation Techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {debuggingTechniques.map((technique) => (
            <div key={technique.title} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">{technique.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{technique.description}</p>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase">Tools:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {technique.tools.map((tool) => (
                      <span key={tool} className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase">Command:</span>
                  <code className="block mt-1 text-xs bg-black px-3 py-2 rounded font-mono">
                    {technique.command}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video-Specific Metrics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Video Streaming Metrics</h2>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold text-green-500">2.1s</div>
              <div className="text-sm text-gray-400">Time to First Frame</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-sm text-gray-400">Rebuffering Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">3</div>
              <div className="text-sm text-gray-400">Quality Switches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">60fps</div>
              <div className="text-sm text-gray-400">Playback Rate</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-semibold mb-3">Optimization Opportunities</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-400">Implement segment prefetching for smoother playback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-400">Use WebWorkers for MSE operations to avoid main thread blocking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">→</span>
                <span className="text-gray-400">Consider P2P CDN for reduced bandwidth costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">→</span>
                <span className="text-gray-400">Implement CMCD (Common Media Client Data) for better QoE</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CLI Commands */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Run Performance Tests</h2>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Quick Lighthouse Test</h4>
              <code className="block text-sm bg-black px-4 py-3 rounded font-mono">
                npx lighthouse http://localhost:3000/hls --view
              </code>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Smart TV Profile Test</h4>
              <code className="block text-sm bg-black px-4 py-3 rounded font-mono">
                npm run lighthouse:tv
              </code>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Full Performance Suite</h4>
              <code className="block text-sm bg-black px-4 py-3 rounded font-mono">
                npm run performance:analyze
              </code>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Generate Report</h4>
              <code className="block text-sm bg-black px-4 py-3 rounded font-mono">
                node scripts/lighthouse-report.js
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
        <p className="text-gray-400 mb-6">
          Deep dive into video streaming performance optimization techniques
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/docs"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            Documentation
          </Link>
          <a
            href="https://web.dev/lighthouse"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            Lighthouse Guide
          </a>
          <a
            href="https://developer.chrome.com/docs/devtools"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
          >
            DevTools Guide
          </a>
        </div>
      </div>
    </div>
  );
});

PerformancePage.displayName = 'PerformancePage';

export default PerformancePage;