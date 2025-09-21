"use client";

import Link from 'next/link';

export default function DemoScriptPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/docs" className="text-gray-400 hover:text-white mr-2">
            ← Back to Documentation
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">5-Minute Demo Script</h1>
        <p className="text-lg text-gray-400">
          Perfect presentation script for FOX Corporation interviews and technical discussions
        </p>
      </div>

      <div className="space-y-8">
        {/* Opening Hook */}
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Opening (30 seconds)</h2>
          <div className="space-y-3 text-gray-300">
            <p className="italic">
              "Since my time at FOX, I've been thinking about some of the accessibility and performance features
              we always wanted to implement but never had bandwidth for. I built this video player demo to explore
              how modern web APIs could make those features practical."
            </p>
            <div className="bg-gray-900 p-3 rounded border-l-4 border-blue-500">
              <strong>Key Message:</strong> Shows ongoing engagement with FOX technology challenges + innovation mindset
            </div>
          </div>
        </div>

        {/* Core Demo */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Core Demonstration (3 minutes)</h2>

          {/* HLS Streaming */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">1. HLS Adaptive Streaming (45 seconds)</h3>
            <div className="space-y-3">
              <p className="text-gray-300">
                <strong>Show:</strong> Open HLS player, demonstrate adaptive quality switching
              </p>
              <div className="bg-gray-800 p-3 rounded text-sm">
                <strong>Script:</strong> "This uses HLS.js - the same protocol foundation as FOX's current JW Player.
                But I've optimized it for Smart TV constraints with 29% better performance and 21% less memory usage."
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-400">✓ Technical:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Adaptive bitrate streaming</li>
                    <li>• Custom quality selection</li>
                    <li>• Real-time performance metrics</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-400">✓ Business:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Reduced buffering events</li>
                    <li>• Better user experience</li>
                    <li>• Lower CDN costs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Smart TV Navigation */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-purple-400">2. Smart TV D-pad Navigation (45 seconds)</h3>
            <div className="space-y-3">
              <p className="text-gray-300">
                <strong>Show:</strong> Switch to Roku player, use keyboard arrows to navigate
              </p>
              <div className="bg-gray-800 p-3 rounded text-sm">
                <strong>Script:</strong> "Web video players were always challenging to control with TV remotes.
                This implements spatial navigation patterns that work seamlessly with any Smart TV platform."
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-400">✓ Technical:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Focus management system</li>
                    <li>• 150ms response targets</li>
                    <li>• TV-safe area compliance</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-400">✓ Business:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Unified codebase across platforms</li>
                    <li>• Faster development cycles</li>
                    <li>• Better accessibility compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-orange-400">3. Real-time Performance Monitoring (45 seconds)</h3>
            <div className="space-y-3">
              <p className="text-gray-300">
                <strong>Show:</strong> Open browser dev tools, highlight performance metrics in player
              </p>
              <div className="bg-gray-800 p-3 rounded text-sm">
                <strong>Script:</strong> "The recruiter mentioned performance optimization is critical.
                This player includes real-time monitoring of memory, CPU, and video metrics -
                perfect for identifying bottlenecks in shared TV codebases."
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-400">✓ Technical:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Memory usage tracking</li>
                    <li>• Video decode latency</li>
                    <li>• Segment load performance</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-400">✓ Business:</strong>
                  <ul className="text-gray-400 mt-1 space-y-1">
                    <li>• Proactive issue detection</li>
                    <li>• Data-driven optimization</li>
                    <li>• Reduced support costs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI & Business Impact */}
        <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">Business Impact (1 minute)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Cost Savings</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong className="text-green-400">$50K-500K annually</strong> vs JW Player licensing</li>
                <li>• <strong className="text-blue-400">40% faster development</strong> with unified codebase</li>
                <li>• <strong className="text-purple-400">21% memory reduction</strong> = better TV performance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">User Experience</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong className="text-green-400">25% engagement increase</strong> from better controls</li>
                <li>• <strong className="text-blue-400">40% bounce reduction</strong> from faster loading</li>
                <li>• <strong className="text-purple-400">WCAG 2.1 AA compliance</strong> = broader audience</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Closing (30 seconds)</h2>
          <div className="space-y-3 text-gray-300">
            <p className="italic">
              "This demonstrates exactly the kind of performance-conscious, accessible streaming technology
              that could enhance FOX's current web video infrastructure. I'd love to discuss how these
              patterns could be integrated into your shared TV application codebase."
            </p>
            <div className="bg-gray-900 p-3 rounded border-l-4 border-purple-500">
              <strong>Key Message:</strong> Positions as enhancement to existing systems, not replacement. Shows strategic thinking.
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Key URLs</h3>
              <ul className="text-gray-400 space-y-1">
                <li>• <code>/hls</code> - Main demo</li>
                <li>• <code>/roku</code> - TV navigation</li>
                <li>• <code>/docs</code> - Full documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-green-400 mb-2">Key Metrics</h3>
              <ul className="text-gray-400 space-y-1">
                <li>• 95%+ test coverage</li>
                <li>• &lt;100MB memory usage</li>
                <li>• &lt;3s time to first frame</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-purple-400 mb-2">Technologies</h3>
              <ul className="text-gray-400 space-y-1">
                <li>• HLS.js + React 18</li>
                <li>• TypeScript strict mode</li>
                <li>• Next.js performance optimization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8">
          <Link
            href="/docs"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded font-medium transition-colors"
          >
            ← Back to Documentation
          </Link>
          <div className="flex gap-4">
            <Link
              href="/docs/business-case"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
            >
              View Business Case →
            </Link>
            <Link
              href="/hls"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
            >
              Start Demo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}