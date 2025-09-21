"use client";

import { memo, ReactNode } from 'react';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';
import DocNavigation from './DocNavigation';

interface DocLayoutProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  lastModified?: string;
  content?: string;
  showToc?: boolean;
}

interface MarkdownComponentProps {
  children: ReactNode;
  className?: string;
  href?: string;
  id?: string;
}

// Custom markdown components with proper styling
const MarkdownComponents = {
  h1: ({ children, ...props }: MarkdownComponentProps) => (
    <h1 className="text-4xl font-bold mb-6 text-white border-b border-gray-800 pb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: MarkdownComponentProps) => (
    <h2
      id={id}
      className="text-3xl font-semibold mb-4 mt-8 text-white scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: MarkdownComponentProps) => (
    <h3
      id={id}
      className="text-2xl font-semibold mb-3 mt-6 text-gray-200 scroll-mt-20"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, id, ...props }: MarkdownComponentProps) => (
    <h4
      id={id}
      className="text-xl font-semibold mb-2 mt-4 text-gray-300 scroll-mt-20"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: MarkdownComponentProps) => (
    <p className="text-gray-300 mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: MarkdownComponentProps) => (
    <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: MarkdownComponentProps) => (
    <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: MarkdownComponentProps) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }: MarkdownComponentProps) => (
    <Link
      href={href || '#'}
      className="text-blue-400 hover:text-blue-300 underline transition-colors"
      {...props}
    >
      {children}
    </Link>
  ),
  code: ({ children, ...props }: MarkdownComponentProps) => (
    <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }: MarkdownComponentProps) => (
    <pre className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-4 overflow-x-auto" {...props}>
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: MarkdownComponentProps) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-900 text-gray-300 italic" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: MarkdownComponentProps) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-gray-700" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: MarkdownComponentProps) => (
    <th className="border border-gray-700 px-4 py-2 bg-gray-800 text-left font-semibold text-gray-200" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: MarkdownComponentProps) => (
    <td className="border border-gray-700 px-4 py-2 text-gray-300" {...props}>
      {children}
    </td>
  ),
};

const DocLayout = memo(({
  children,
  title,
  description,
  breadcrumbs,
  lastModified,
  content,
  showToc = false
}: DocLayoutProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-gray-600">/</span>
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex gap-8">
        {/* Documentation Navigation Sidebar */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="sticky top-8">
            <DocNavigation />
          </div>
        </div>

        {/* Main Content */}
        <div className={`${showToc ? 'lg:w-2/4' : 'lg:w-3/4'} w-full min-w-0`}>
          {/* Header */}
          {(title || description) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-xl text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
              {lastModified && (
                <div className="mt-4 text-sm text-gray-500">
                  Last updated: {lastModified}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {content ? (
              <Markdown
                options={{
                  overrides: MarkdownComponents,
                  slugify: (str: string) => str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                }}
              >
                {content}
              </Markdown>
            ) : (
              children
            )}
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex justify-between">
              <Link
                href="/docs"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Documentation
              </Link>

              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                View Players
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Table of Contents Sidebar */}
        {showToc && (
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-20">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">On this page</h3>
                {/* TOC will be populated by individual doc pages */}
                <div id="toc-content" className="space-y-2 text-sm">
                  {/* Dynamic TOC content */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DocLayout.displayName = 'DocLayout';

export default DocLayout;