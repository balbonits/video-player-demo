"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Overview',
    description: 'Player comparison and selection'
  },
  {
    href: '/hls',
    label: 'HLS Player',
    description: 'Production-ready HLS.js implementation',
    badge: 'Recommended',
    badgeColor: 'bg-green-600'
  },
  {
    href: '/native',
    label: 'Native HTML5',
    description: 'Pure HTML5 video element',
    badge: 'Simple',
    badgeColor: 'bg-gray-600'
  },
  {
    href: '/mobile',
    label: 'Mobile Optimized',
    description: 'Touch-friendly mobile player',
    badge: 'Mobile',
    badgeColor: 'bg-blue-600'
  },
  {
    href: '/roku',
    label: 'Roku Simulation',
    description: 'TV remote navigation demo',
    badge: 'TV',
    badgeColor: 'bg-purple-600'
  },
  {
    href: '/performance',
    label: 'Performance',
    description: 'Lighthouse & performance monitoring',
    badge: 'Analytics',
    badgeColor: 'bg-purple-600'
  },
  {
    href: '/docs',
    label: 'Documentation',
    description: 'Implementation guide',
    badge: 'Docs',
    badgeColor: 'bg-gray-600'
  }
];

const Navigation = memo(() => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-bold text-lg">Video Player Demo</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`
        md:hidden fixed top-16 left-0 bottom-0 z-40 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded text-white ${item.badgeColor || 'bg-gray-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Performance Metrics in Mobile Menu */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Server Running</span>
              </div>
              <div>FPS: 60</div>
              <div>Memory: &lt;100MB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto z-30">
        <div className="p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-bold text-lg">Video Player Demo</span>
          </Link>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-lg transition-all
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                  `}
                  title={item.description}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded text-white ${item.badgeColor || 'bg-gray-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="font-medium text-gray-300 mb-3">Performance Metrics</div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-500">Ready</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>FPS</span>
                <span className="text-gray-300">60</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Memory</span>
                <span className="text-gray-300">&lt;100MB</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for desktop content */}
      <div className="hidden md:block w-64 flex-shrink-0" />
      {/* Spacer for mobile content */}
      <div className="md:hidden h-16" />
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;