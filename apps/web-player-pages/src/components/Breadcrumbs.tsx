"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const pathLabels: Record<string, string> = {
  '/': 'Home',
  '/hls': 'HLS Player',
  '/native': 'Native HTML5',
  '/mobile': 'Mobile Optimized',
  '/roku': 'Roku Simulation',
  '/chromecast': 'Chromecast Receiver',
  '/benchmark': 'Performance Benchmark',
  '/docs': 'Documentation'
};

const Breadcrumbs = memo(() => {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: pathLabels[pathname] || 'Page', href: pathname }
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === items.length - 1 ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;