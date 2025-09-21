"use client";

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DocNavItem {
  href: string;
  label: string;
  description: string;
  category: string;
  icon?: string;
}

const docNavItems: DocNavItem[] = [
  // Getting Started
  {
    href: '/docs/overview',
    label: 'Project Overview',
    description: 'Understanding the video player demo project goals',
    category: 'Getting Started',
    icon: '📋'
  },
  {
    href: '/docs/quickstart',
    label: 'Quick Start',
    description: 'Get up and running in 5 minutes',
    category: 'Getting Started',
    icon: '🚀'
  },
  {
    href: '/docs/fox-context',
    label: 'FOX Context',
    description: 'How this relates to FOX streaming requirements',
    category: 'Getting Started',
    icon: '🦊'
  },

  // Technical Specs
  {
    href: '/docs/hls-api',
    label: 'HLS API Reference',
    description: 'Complete API documentation',
    category: 'Technical Specs',
    icon: '📡'
  },
  {
    href: '/docs/performance',
    label: 'Performance Specs',
    description: 'Smart TV performance constraints',
    category: 'Technical Specs',
    icon: '⚡'
  },
  {
    href: '/docs/architecture',
    label: 'Architecture',
    description: 'System design and components',
    category: 'Technical Specs',
    icon: '🏗️'
  },

  // Features
  {
    href: '/docs/adaptive-streaming',
    label: 'Adaptive Streaming',
    description: 'HLS adaptive bitrate implementation',
    category: 'Features',
    icon: '📊'
  },
  {
    href: '/docs/smart-tv',
    label: 'Smart TV Navigation',
    description: 'D-pad navigation and focus management',
    category: 'Features',
    icon: '📺'
  },
  {
    href: '/docs/accessibility',
    label: 'Accessibility',
    description: 'WCAG 2.1 AA compliance features',
    category: 'Features',
    icon: '♿'
  },

  // Showcase
  {
    href: '/docs/demo-script',
    label: 'Demo Script',
    description: '5-minute presentation for interviews',
    category: 'Showcase',
    icon: '🎤'
  },
  {
    href: '/docs/business-case',
    label: 'Business Case',
    description: 'ROI analysis and competitive advantages',
    category: 'Showcase',
    icon: '💰'
  }
];

const categories = Array.from(new Set(docNavItems.map(item => item.category)));

interface DocNavigationProps {
  className?: string;
}

const DocNavigation = memo(({ className = '' }: DocNavigationProps) => {
  const pathname = usePathname();

  return (
    <nav className={`bg-gray-900 border border-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Documentation
      </h3>

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {docNavItems
                .filter(item => item.category === category)
                .map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group flex items-start space-x-3 p-2 rounded-md transition-all
                        ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <span className="text-sm mt-0.5 opacity-70">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <Link
            href="/hls"
            className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <span className="text-sm">Try Live Demo</span>
          </Link>
          <Link
            href="https://github.com/balbonits/video-player-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm">View Source</span>
          </Link>
        </div>
      </div>
    </nav>
  );
});

DocNavigation.displayName = 'DocNavigation';

export default DocNavigation;