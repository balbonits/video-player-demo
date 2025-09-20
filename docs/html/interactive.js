// Professional Technical Documentation Interactive Features

class DocumentationEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupSyntaxHighlighting();
    this.setupCodeCopyButtons();
    this.setupCollapsibleSections();
    this.setupTableOfContents();
    this.setupSearchFunctionality();
    this.setupScrollProgress();
    this.setupInteractiveExamples();
    this.setupThemeToggle();
  }

  // Syntax highlighting with Prism.js
  setupSyntaxHighlighting() {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }

    // Add language labels to code blocks
    document.querySelectorAll('pre[class*="language-"]').forEach(pre => {
      const language = pre.className.match(/language-(\w+)/)?.[1];
      if (language && !pre.querySelector('.code-language')) {
        const label = document.createElement('div');
        label.className = 'code-language';
        label.textContent = language.toUpperCase();

        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.appendChild(label);

        pre.parentNode.insertBefore(header, pre);
      }
    });
  }

  // Copy to clipboard functionality for code blocks
  setupCodeCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      const header = pre.previousElementSibling;
      if (header && header.classList.contains('code-block-header')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => this.copyCodeToClipboard(pre, copyBtn);
        header.appendChild(copyBtn);
      }
    });
  }

  async copyCodeToClipboard(pre, button) {
    const code = pre.textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.innerHTML = '✅ Copied!';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    } catch (err) {
      button.innerHTML = '❌ Failed';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    }
  }

  // Collapsible sections
  setupCollapsibleSections() {
    document.querySelectorAll('.collapsible').forEach(section => {
      const header = section.querySelector('.collapsible-header');
      const content = section.querySelector('.collapsible-content');

      if (header && content) {
        header.onclick = () => {
          section.classList.toggle('open');

          if (section.classList.contains('open')) {
            content.style.display = 'block';
            content.style.animation = 'slideIn 0.3s ease-out';
          } else {
            content.style.display = 'none';
          }
        };
      }
    });
  }

  // Generate table of contents
  setupTableOfContents() {
    const nav = document.querySelector('.doc-nav');
    if (!nav) return;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const navList = document.createElement('ul');
    navList.className = 'doc-nav-list';

    headings.forEach((heading, index) => {
      // Add ID if not present
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      const listItem = document.createElement('li');
      listItem.className = 'doc-nav-item';

      const link = document.createElement('a');
      link.className = 'doc-nav-link';
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 12}px`;

      link.onclick = (e) => {
        e.preventDefault();
        this.smoothScrollTo(heading);
        this.updateActiveNavLink(link);
      };

      listItem.appendChild(link);
      navList.appendChild(listItem);
    });

    // Clear existing nav content and add new TOC
    const existingTitle = nav.querySelector('.doc-nav-title');
    if (!existingTitle) {
      const title = document.createElement('div');
      title.className = 'doc-nav-title';
      title.textContent = 'Table of Contents';
      nav.appendChild(title);
    }

    nav.appendChild(navList);
    this.setupIntersectionObserver();
  }

  // Smooth scrolling
  smoothScrollTo(element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // Update active navigation link
  updateActiveNavLink(activeLink) {
    document.querySelectorAll('.doc-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  // Intersection observer for active navigation highlighting
  setupIntersectionObserver() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const options = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const activeLink = document.querySelector(`.doc-nav-link[href="#${id}"]`);
          if (activeLink) {
            this.updateActiveNavLink(activeLink);
          }
        }
      });
    }, options);

    headings.forEach(heading => observer.observe(heading));
  }

  // Search functionality
  setupSearchFunctionality() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <input type="text" class="search-input" placeholder="Search documentation..." />
      <div class="search-results"></div>
    `;

    const docHeader = document.querySelector('.doc-header');
    if (docHeader) {
      docHeader.appendChild(searchContainer);
    }

    const searchInput = searchContainer.querySelector('.search-input');
    const searchResults = searchContainer.querySelector('.search-results');

    searchInput.oninput = (e) => {
      this.performSearch(e.target.value, searchResults);
    };
  }

  performSearch(query, resultsContainer) {
    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
      return;
    }

    const searchableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, code');
    const results = [];

    searchableElements.forEach(element => {
      if (element.textContent.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          element,
          text: element.textContent,
          type: element.tagName.toLowerCase()
        });
      }
    });

    this.displaySearchResults(results, resultsContainer, query);
  }

  displaySearchResults(results, container, query) {
    if (results.length === 0) {
      container.innerHTML = '<p>No results found</p>';
    } else {
      container.innerHTML = results.slice(0, 10).map(result => `
        <div class="search-result" onclick="this.scrollToElement('${result.element.id || ''}')">
          <span class="search-result-type">${result.type}</span>
          <span class="search-result-text">${this.highlightQuery(result.text, query)}</span>
        </div>
      `).join('');
    }
    container.style.display = 'block';
  }

  highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Scroll progress indicator
  setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);

    window.onscroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.querySelector('.scroll-progress-bar').style.width = scrolled + '%';
    };
  }

  // Interactive code examples
  setupInteractiveExamples() {
    document.querySelectorAll('.interactive-demo').forEach(demo => {
      const buttons = demo.querySelectorAll('.demo-btn');
      const codeBlocks = demo.querySelectorAll('.demo-code');

      buttons.forEach((button, index) => {
        button.onclick = () => {
          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          codeBlocks.forEach((block, blockIndex) => {
            block.style.display = blockIndex === index ? 'block' : 'none';
          });
        };
      });

      // Activate first button by default
      if (buttons.length > 0) {
        buttons[0].click();
      }
    });
  }

  // Theme toggle
  setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.title = 'Toggle theme';

    const docHeader = document.querySelector('.doc-header');
    if (docHeader) {
      docHeader.appendChild(themeToggle);
    }

    themeToggle.onclick = () => {
      document.body.classList.toggle('light-theme');
      themeToggle.innerHTML = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    };
  }
}

// Performance optimization utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.measurePageLoad();
    this.setupPerformanceObserver();
    this.displayMetrics();
  }

  measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      this.metrics.pageLoad = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            this.metrics.fid = entry.processingStart - entry.startTime;
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }

  displayMetrics() {
    setTimeout(() => {
      const metricsDisplay = document.createElement('div');
      metricsDisplay.className = 'performance-metrics';
      metricsDisplay.innerHTML = `
        <h4>Page Performance Metrics</h4>
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">LCP:</span>
            <span class="metric-value">${(this.metrics.lcp || 0).toFixed(0)}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">FID:</span>
            <span class="metric-value">${(this.metrics.fid || 0).toFixed(0)}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">DOM Load:</span>
            <span class="metric-value">${(this.metrics.pageLoad?.domContentLoaded || 0).toFixed(0)}ms</span>
          </div>
        </div>
      `;

      document.querySelector('.doc-container')?.appendChild(metricsDisplay);
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DocumentationEnhancer();
  new PerformanceMonitor();
});

// Add additional CSS for interactive elements
const additionalStyles = `
<style>
.search-container {
  margin-top: var(--space-6);
  position: relative;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-top: var(--space-1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  display: none;
}

.search-result {
  padding: var(--space-3);
  cursor: pointer;
  border-bottom: 1px solid var(--border-primary);
  transition: background var(--transition-fast);
}

.search-result:hover {
  background: var(--bg-tertiary);
}

.search-result-type {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-right: var(--space-2);
}

.search-result-text mark {
  background: var(--text-accent);
  color: var(--bg-primary);
  padding: 1px 2px;
  border-radius: 2px;
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--bg-tertiary);
  z-index: 200;
}

.scroll-progress-bar {
  height: 100%;
  background: var(--text-accent);
  width: 0%;
  transition: width 0.1s ease;
}

.theme-toggle {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: var(--space-2);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 100;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
}

.performance-metrics {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: var(--space-6);
  margin-top: var(--space-8);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.metric-value {
  font-weight: 600;
  color: var(--text-accent);
}

.light-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-code: #f8fafc;
  --bg-inline-code: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);