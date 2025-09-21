"use client";

import { memo } from 'react';
import Link from 'next/link';

interface DocSection {
  id: string;
  title: string;
  description: string;
  links: Array<{
    title: string;
    href: string;
    description: string;
    type: 'doc' | 'spec' | 'guide' | 'demo';
  }>;
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Essential guides to understand and use the video player demo',
    links: [
      {
        title: 'Project Overview',
        href: '/docs/overview',
        description: 'Understanding the video player demo project goals and architecture',
        type: 'guide'
      },
      {
        title: 'Quick Start Guide',
        href: '/docs/quickstart',
        description: 'Get up and running with the video players in 5 minutes',
        type: 'guide'
      },
      {
        title: 'FOX Corporation Context',
        href: '/docs/fox-context',
        description: 'How this demo relates to FOX streaming requirements',
        type: 'guide'
      }
    ]
  },
  {
    id: 'technical-specs',
    title: 'Technical Specifications',
    description: 'Detailed technical documentation and API references',
    links: [
      {
        title: 'HLS Video Player API',
        href: '/docs/hls-api',
        description: 'Complete API reference for the HLS video player component',
        type: 'spec'
      },
      {
        title: 'Performance Specifications',
        href: '/docs/performance',
        description: 'Smart TV performance constraints and optimizations',
        type: 'spec'
      },
      {
        title: 'Architecture Overview',
        href: '/docs/architecture',
        description: 'System architecture and component relationships',
        type: 'doc'
      }
    ]
  },
  {
    id: 'features',
    title: 'Feature Documentation',
    description: 'Detailed guides for each video player feature',
    links: [
      {
        title: 'Adaptive Streaming',
        href: '/docs/adaptive-streaming',
        description: 'HLS adaptive bitrate streaming implementation',
        type: 'doc'
      },
      {
        title: 'Smart TV Navigation',
        href: '/docs/smart-tv',
        description: 'D-pad navigation and focus management for TV platforms',
        type: 'doc'
      },
      {
        title: 'Accessibility Features',
        href: '/docs/accessibility',
        description: 'WCAG 2.1 AA compliance and accessibility implementations',
        type: 'doc'
      }
    ]
  },
  {
    id: 'wireframes',
    title: 'Wireframes & Design',
    description: 'Visual design specifications and wireframes',
    links: [
      {
        title: 'Desktop Player Wireframe',
        href: '/docs/wireframes/desktop',
        description: 'Desktop video player interface design',
        type: 'demo'
      },
      {
        title: 'Smart TV Interface',
        href: '/docs/wireframes/smart-tv',
        description: 'TV-optimized interface for 10-foot viewing',
        type: 'demo'
      },
      {
        title: 'Mobile Player Design',
        href: '/docs/wireframes/mobile',
        description: 'Touch-optimized mobile video player',
        type: 'demo'
      }
    ]
  },
  {
    id: 'showcase',
    title: 'Showcase & Presentation',
    description: 'Materials for demonstrating the project',
    links: [
      {
        title: 'Demo Script',
        href: '/docs/demo-script',
        description: '5-minute presentation script for FOX interviews',
        type: 'guide'
      },
      {
        title: 'Business Case',
        href: '/docs/business-case',
        description: 'ROI analysis and competitive advantages',
        type: 'doc'
      },
      {
        title: 'Technical Deep Dive',
        href: '/docs/technical-deep-dive',
        description: 'Advanced technical discussion topics',
        type: 'guide'
      }
    ]
  },
  {
    id: 'testing',
    title: 'Testing & QA',
    description: 'Quality assurance and testing documentation',
    links: [
      {
        title: 'Test Coverage Report',
        href: '/docs/test-coverage',
        description: 'Comprehensive testing metrics and coverage analysis',
        type: 'doc'
      },
      {
        title: 'Manual Testing Guide',
        href: '/docs/manual-testing',
        description: 'Step-by-step manual testing procedures',
        type: 'guide'
      },
      {
        title: 'Performance Benchmarks',
        href: '/docs/benchmarks',
        description: 'Performance testing results and metrics',
        type: 'doc'
      }
    ]
  }
];

const TypeBadge = memo(({ type }: { type: string }) => {
  const colors = {
    doc: 'bg-blue-600',
    spec: 'bg-green-600',
    guide: 'bg-purple-600',
    demo: 'bg-orange-600'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded text-white ${colors[type as keyof typeof colors] || 'bg-gray-600'}`}>
      {type}
    </span>
  );
});

TypeBadge.displayName = 'TypeBadge';

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-4">
          <Link href="/" className="text-gray-400 hover:text-white mr-2">
            ← Back to Players
          </Link>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
          Documentation
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl">
          Comprehensive documentation for the video player demo project.
          Everything you need to understand, implement, and showcase the streaming technology.
        </p>

        {/* Quick Stats */}
        <div className="flex gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">95%+</div>
            <div className="text-sm text-gray-400">Test Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">6</div>
            <div className="text-sm text-gray-400">Player Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">WCAG 2.1 AA</div>
            <div className="text-sm text-gray-400">Accessibility</div>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="space-y-12">
        {docSections.map((section) => (
          <div key={section.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
              <p className="text-gray-400">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium group-hover:text-blue-400 transition-colors">
                      {link.title}
                    </h3>
                    <TypeBadge type={link.type} />
                  </div>

                  <p className="text-gray-400 text-sm mb-3">
                    {link.description}
                  </p>

                  <div className="flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Read more</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Present?</h2>
        <p className="text-gray-400 mb-6">
          Start with the demo script for a 5-minute presentation perfect for FOX Corporation interviews
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/docs/demo-script"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            View Demo Script
          </Link>
          <Link
            href="/docs/business-case"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Business Case
          </Link>
        </div>
      </div>
    </div>
  );
}