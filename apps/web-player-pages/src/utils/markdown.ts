import matter from 'gray-matter';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface DocMetadata {
  title: string;
  description: string;
  lastModified?: string;
  category?: string;
  order?: number;
  tags?: string[];
  author?: string;
  draft?: boolean;
}

export interface DocContent {
  metadata: DocMetadata;
  content: string;
  slug: string;
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

/**
 * Load and parse a markdown document
 */
export function loadMarkdownDoc(slug: string): DocContent | null {
  try {
    const docsDirectory = join(process.cwd(), 'docs');
    const fullPath = join(docsDirectory, `${slug}.md`);
    const fileContents = readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);

    return {
      metadata: data as DocMetadata,
      content,
      slug
    };
  } catch (error) {
    console.error(`Error loading markdown document: ${slug}`, error);
    return null;
  }
}

/**
 * Extract table of contents from markdown content
 */
export function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({
      id,
      title,
      level
    });
  }

  return toc;
}

/**
 * Generate breadcrumbs from a doc slug
 */
export function generateBreadcrumbs(slug: string): Array<{ label: string; href: string }> {
  const parts = slug.split('/');
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    currentPath += parts[i];

    // Convert slug to readable label
    const label = parts[i]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      href: `/docs/${currentPath}`
    });

    if (i < parts.length - 1) {
      currentPath += '/';
    }
  }

  return breadcrumbs;
}

/**
 * Get all available documentation slugs
 */
export function getAllDocSlugs(): string[] {
  // This would normally read from the file system
  // For now, return the slugs we know exist
  return [
    'overview',
    'quickstart',
    'fox-context',
    'hls-api',
    'performance',
    'architecture',
    'adaptive-streaming',
    'smart-tv',
    'accessibility',
    'wireframes/desktop',
    'wireframes/smart-tv',
    'wireframes/mobile',
    'demo-script',
    'business-case',
    'technical-deep-dive',
    'test-coverage',
    'manual-testing',
    'benchmarks'
  ];
}

/**
 * Search documentation content
 */
export function searchDocs(query: string): DocContent[] {
  const slugs = getAllDocSlugs();
  const results: DocContent[] = [];

  for (const slug of slugs) {
    const doc = loadMarkdownDoc(slug);
    if (doc) {
      const searchText = `${doc.metadata.title} ${doc.metadata.description} ${doc.content}`.toLowerCase();
      if (searchText.includes(query.toLowerCase())) {
        results.push(doc);
      }
    }
  }

  return results;
}