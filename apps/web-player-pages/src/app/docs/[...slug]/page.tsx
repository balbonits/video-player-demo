"use client";

import { memo, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import DocLayout from '@/components/DocLayout';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

interface DocData {
  title: string;
  description: string;
  content: string;
  lastModified?: string;
}

// Mock documentation content - in production this would come from markdown files
const mockDocs: Record<string, DocData> = {
  'overview': {
    title: 'Project Overview',
    description: 'Understanding the video player demo project goals and architecture',
    content: `
# Project Overview

This video player demo showcases modern streaming technology capabilities optimized for Smart TV and OTT platforms.

## Key Features

- **Adaptive HLS Streaming**: Automatic quality adjustment based on network conditions
- **Smart TV Optimization**: D-pad navigation and 10-foot UI design
- **Accessibility First**: WCAG 2.1 AA compliance with screen reader support
- **Cross-Platform**: Web, iOS, Android, Roku, and Smart TV compatibility

## Architecture

The project uses a modern React 18 + Next.js 14 architecture with TypeScript strict mode:

\`\`\`typescript
interface VideoPlayer {
  hls: HLS.Engine;
  accessibility: WCAG2.1AA;
  performance: SmartTVOptimized;
  platforms: CrossPlatform[];
}
\`\`\`

## Performance Targets

- **Memory Usage**: < 100MB total application footprint
- **CPU Usage**: < 30% average on Smart TV hardware
- **Input Latency**: < 150ms response time for D-pad navigation
- **Video Performance**: 60fps playback with < 3s startup time

## Business Context

This demo addresses accessibility and performance challenges identified during previous work at FOX Digital Media, showcasing how modern web APIs can solve previously impractical requirements.
    `,
    lastModified: 'September 21, 2024'
  },
  'quickstart': {
    title: 'Quick Start Guide',
    description: 'Get up and running with the video players in 5 minutes',
    content: `
# Quick Start Guide

Get the video player demo running locally in under 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone git@github.com:balbonits/video-player-demo.git
   cd video-player-demo
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   cd apps/web-player-pages
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Try the HLS Player**: Click "HLS Streaming" to see adaptive bitrate streaming
2. **Test Smart TV Navigation**: Use Tab/Arrow keys to simulate D-pad controls
3. **Enable Captions**: Toggle closed captions to see WebVTT support
4. **Check Performance**: Open browser DevTools to monitor Core Web Vitals

## Next Steps

- Review the [Architecture Overview](/docs/architecture)
- Explore [Smart TV Features](/docs/smart-tv)
- Test [Accessibility Features](/docs/accessibility)
    `,
    lastModified: 'September 21, 2024'
  },
  'fox-context': {
    title: 'FOX Corporation Context',
    description: 'How this demo relates to FOX streaming requirements',
    content: `
# FOX Corporation Context

This demo directly addresses streaming video challenges from my tenure at FOX Digital Media (2012-2019) and contract work (2020-2022).

## Historical Context

### FOX Digital Media Experience (2012-2019)
- Built FOXSports.com video streaming infrastructure
- Developed FOXNation.com OTT platform
- Worked on FX+ streaming service architecture
- Identified accessibility gaps in TV-based video players

### Contract Work (2020-2022)
- Enhanced FOX.com video player performance
- Worked with JW Player integration challenges
- Optimized Smart TV video delivery

## Current FOX Technology Stack

### Web Video Implementation
- **Primary Player**: JW Player for web video streaming
- **Protocol**: HLS (HTTP Live Streaming) - same as our demo
- **Challenges**: Smart TV remote control, accessibility compliance

### Technical Alignment

Our demo showcases evolution from JW Player to modern React patterns:

\`\`\`typescript
// Current FOX (JW Player)
jwplayer("player").setup({
  file: "stream.m3u8",
  // Limited customization
});

// Our Demo (HLS.js + React)
<HLSPlayer
  src="stream.m3u8"
  smartTVOptimized={true}
  accessibility={{ wcag: "2.1AA" }}
  customControls={true}
/>
\`\`\`

## Addressing FOX Requirements

### Performance Optimization (Primary Need)
- **Challenge**: Shared codebase performance across all TV apps
- **Our Solution**: Smart TV-specific optimizations, memory management
- **Metrics**: <100MB memory, <30% CPU usage, 60fps playback

### Accessibility Compliance
- **Challenge**: WCAG 2.1 AA compliance for video interfaces
- **Our Solution**: Built-in screen reader support, keyboard navigation
- **Features**: Caption customization, high contrast, focus management

### Cross-Platform Consistency
- **Challenge**: Unified experience across Web, iOS, Android, Roku, Tizen
- **Our Solution**: React-based architecture with platform adapters
- **Benefit**: Single codebase, consistent behavior

## Interview Positioning

This demo showcases:
1. **Institutional Knowledge**: Understanding of FOX's current video architecture
2. **Technical Evolution**: How modern React patterns improve on legacy solutions
3. **Problem-Solving**: Addressing real challenges from previous FOX experience
4. **Forward Thinking**: Exploring "wishlist" features now made practical

The demo represents ongoing engagement with FOX streaming technology challenges, not a replacement for existing systems.
    `,
    lastModified: 'September 21, 2024'
  }
};

const DocPage = memo(({ params }: DocPageProps) => {
  const [docData, setDocData] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);

  const slug = params.slug.join('/');

  useEffect(() => {
    // Simulate async loading
    const loadDoc = async () => {
      setLoading(true);

      // Small delay to simulate file system read
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc = mockDocs[slug];
      if (doc) {
        setDocData(doc);
      } else {
        setDocData(null);
      }

      setLoading(false);
    };

    loadDoc();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!docData) {
    notFound();
  }

  // Generate breadcrumbs
  const breadcrumbs = slug.split('/').map((part, index, array) => {
    const href = `/docs/${array.slice(0, index + 1).join('/')}`;
    const label = part.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return { label, href };
  });

  return (
    <DocLayout
      title={docData.title}
      description={docData.description}
      breadcrumbs={breadcrumbs}
      lastModified={docData.lastModified}
      content={docData.content}
      showToc={true}
    />
  );
});

DocPage.displayName = 'DocPage';

export default DocPage;