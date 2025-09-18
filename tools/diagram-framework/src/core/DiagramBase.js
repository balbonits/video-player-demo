/**
 * DiagramBase.js - Core diagram framework for team visual documentation
 * Created by: Alex (Engineer)
 * Purpose: Unified system for creating professional interactive diagrams
 */

export class DiagramBase {
  constructor(options = {}) {
    this.config = {
      title: options.title || 'Untitled Diagram',
      type: options.type || 'generic',
      theme: options.theme || 'modern',
      accessibility: options.accessibility !== false,
      interactive: options.interactive !== false,
      animations: options.animations !== false,
      responsive: options.responsive !== false,
      ...options
    }

    this.elements = []
    this.connections = []
    this.annotations = []
  }

  /**
   * Add an element to the diagram
   */
  addElement(element) {
    const diagramElement = {
      id: element.id || `element-${this.elements.length}`,
      type: element.type || 'box',
      content: element.content || '',
      position: element.position || { x: 0, y: 0 },
      size: element.size || { width: 200, height: 100 },
      style: element.style || {},
      accessibility: {
        label: element.accessibilityLabel || element.content,
        role: element.role || 'button',
        tabIndex: element.tabIndex || 0
      },
      interactions: element.interactions || {}
    }

    this.elements.push(diagramElement)
    return diagramElement.id
  }

  /**
   * Connect two elements with animated line
   */
  addConnection(fromId, toId, options = {}) {
    const connection = {
      from: fromId,
      to: toId,
      type: options.type || 'arrow',
      animated: options.animated !== false,
      label: options.label || '',
      style: options.style || {}
    }

    this.connections.push(connection)
    return connection
  }

  /**
   * Add annotation or technical specification
   */
  addAnnotation(content, position, options = {}) {
    const annotation = {
      id: `annotation-${this.annotations.length}`,
      content,
      position,
      type: options.type || 'note',
      style: options.style || {}
    }

    this.annotations.push(annotation)
    return annotation.id
  }

  /**
   * Generate CSS styles for the diagram
   */
  generateCSS() {
    return `
      /* Diagram Framework Base Styles */
      .diagram-container {
        width: 100%;
        max-width: ${this.config.maxWidth || '1400px'};
        margin: 0 auto;
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: ${this.getThemeColor('background')};
        border-radius: 12px;
        position: relative;
      }

      .diagram-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .diagram-title {
        font-size: 2rem;
        font-weight: 700;
        color: ${this.getThemeColor('text-primary')};
        margin-bottom: 8px;
      }

      .diagram-subtitle {
        font-size: 1.1rem;
        color: ${this.getThemeColor('text-secondary')};
        font-weight: 500;
      }

      .diagram-canvas {
        position: relative;
        min-height: 600px;
        background: ${this.getThemeColor('canvas')};
        border-radius: 8px;
        border: 2px solid ${this.getThemeColor('border')};
        overflow: hidden;
      }

      .diagram-element {
        position: absolute;
        background: ${this.getThemeColor('element-bg')};
        border: 2px solid ${this.getThemeColor('element-border')};
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-weight: 600;
        color: ${this.getThemeColor('text-primary')};
      }

      .diagram-element:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px ${this.getThemeColor('shadow')};
        border-color: ${this.getThemeColor('accent')};
      }

      .diagram-element:focus {
        outline: 3px solid ${this.getThemeColor('focus')};
        outline-offset: 2px;
      }

      .diagram-element.active {
        background: ${this.getThemeColor('accent')};
        color: white;
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 30px ${this.getThemeColor('accent-shadow')};
      }

      .diagram-connection {
        position: absolute;
        z-index: 1;
      }

      .diagram-arrow {
        stroke: ${this.getThemeColor('connection')};
        stroke-width: 2;
        marker-end: url(#arrowhead);
        transition: all 0.3s ease;
      }

      .diagram-arrow.animated {
        stroke-dasharray: 8 4;
        animation: flow 2s linear infinite;
      }

      @keyframes flow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 12; }
      }

      .diagram-annotation {
        position: absolute;
        background: ${this.getThemeColor('annotation-bg')};
        border: 1px solid ${this.getThemeColor('annotation-border')};
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 0.85rem;
        color: ${this.getThemeColor('text-secondary')};
        max-width: 200px;
        z-index: 10;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .diagram-container {
          padding: 15px;
        }

        .diagram-element {
          font-size: 0.9rem;
          padding: 12px;
        }

        .diagram-title {
          font-size: 1.5rem;
        }
      }

      /* High Contrast Mode */
      @media (prefers-contrast: high) {
        .diagram-element {
          border-width: 3px;
        }

        .diagram-arrow {
          stroke-width: 3;
        }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .diagram-element,
        .diagram-arrow {
          transition: none;
          animation: none;
        }
      }
    `
  }

  /**
   * Get theme-specific colors
   */
  getThemeColor(property) {
    const themes = {
      modern: {
        background: '#ffffff',
        'canvas': '#f8fafc',
        'text-primary': '#1a202c',
        'text-secondary': '#718096',
        'element-bg': '#ffffff',
        'element-border': '#e2e8f0',
        'accent': '#667eea',
        'accent-shadow': 'rgba(102, 126, 234, 0.3)',
        'focus': '#4299e1',
        'connection': '#a0aec0',
        'shadow': 'rgba(0, 0, 0, 0.1)',
        'border': '#e2e8f0',
        'annotation-bg': '#fff5f5',
        'annotation-border': '#fed7d7'
      },
      dark: {
        background: '#1a202c',
        'canvas': '#2d3748',
        'text-primary': '#f7fafc',
        'text-secondary': '#a0aec0',
        'element-bg': '#4a5568',
        'element-border': '#718096',
        'accent': '#667eea',
        'accent-shadow': 'rgba(102, 126, 234, 0.4)',
        'focus': '#63b3ed',
        'connection': '#718096',
        'shadow': 'rgba(0, 0, 0, 0.3)',
        'border': '#4a5568',
        'annotation-bg': '#2d3748',
        'annotation-border': '#4a5568'
      },
      fox: {
        background: '#ffffff',
        'canvas': '#f7f7f7',
        'text-primary': '#1a1a1a',
        'text-secondary': '#666666',
        'element-bg': '#ffffff',
        'element-border': '#cccccc',
        'accent': '#0066cc', // FOX-inspired blue
        'accent-shadow': 'rgba(0, 102, 204, 0.3)',
        'focus': '#0052a3',
        'connection': '#999999',
        'shadow': 'rgba(0, 0, 0, 0.1)',
        'border': '#cccccc',
        'annotation-bg': '#f0f8ff',
        'annotation-border': '#0066cc'
      }
    }

    return themes[this.config.theme]?.[property] || themes.modern[property]
  }

  /**
   * Generate JavaScript interactions
   */
  generateJS() {
    return `
      // Diagram Framework Interactions
      document.addEventListener('DOMContentLoaded', function() {
        const elements = document.querySelectorAll('.diagram-element');
        const connections = document.querySelectorAll('.diagram-arrow');

        // Element interactions
        elements.forEach(element => {
          element.addEventListener('click', function() {
            // Remove active class from all elements
            elements.forEach(el => el.classList.remove('active'));

            // Add active class to clicked element
            this.classList.add('active');

            // Animate connected arrows
            const elementId = this.dataset.id;
            animateConnections(elementId);

            // Show related annotations
            showAnnotations(elementId);
          });

          // Keyboard navigation
          element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });
        });

        // Connection animations
        function animateConnections(elementId) {
          connections.forEach(conn => {
            if (conn.dataset.from === elementId || conn.dataset.to === elementId) {
              conn.classList.add('animated');
              setTimeout(() => conn.classList.remove('animated'), 2000);
            }
          });
        }

        // Annotation display
        function showAnnotations(elementId) {
          const annotations = document.querySelectorAll('.diagram-annotation');
          annotations.forEach(annotation => {
            if (annotation.dataset.target === elementId) {
              annotation.style.display = 'block';
              annotation.style.animation = 'fadeIn 0.3s ease-in-out';
            } else {
              annotation.style.display = 'none';
            }
          });
        }

        // Auto-play demonstration
        let currentIndex = 0;
        function autoPlay() {
          if (elements.length > 0) {
            elements[currentIndex].click();
            currentIndex = (currentIndex + 1) % elements.length;
            setTimeout(autoPlay, 3000);
          }
        }

        // Start auto-play after 2 seconds
        setTimeout(autoPlay, 2000);

        // Accessibility enhancements
        elements.forEach((element, index) => {
          element.setAttribute('role', 'button');
          element.setAttribute('tabindex', '0');
          element.setAttribute('aria-label', \`Diagram element \${index + 1}: \${element.textContent}\`);
        });
      });

      // CSS Animation utilities
      function fadeIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'all 0.3s ease-in-out';

        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }

      function slideIn(element, direction = 'left') {
        const transforms = {
          left: 'translateX(-20px)',
          right: 'translateX(20px)',
          up: 'translateY(-20px)',
          down: 'translateY(20px)'
        };

        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        requestAnimationFrame(() => {
          element.style.transform = 'translate(0)';
          element.style.opacity = '1';
        });
      }
    `
  }

  /**
   * Generate complete HTML diagram
   */
  generateHTML() {
    const svgDefs = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7"
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${this.getThemeColor('connection')}" />
        </marker>
      </defs>
    `

    const elementsHTML = this.elements.map(element => `
      <div class="diagram-element"
           data-id="${element.id}"
           style="
             left: ${element.position.x}px;
             top: ${element.position.y}px;
             width: ${element.size.width}px;
             height: ${element.size.height}px;
             ${Object.entries(element.style).map(([k, v]) => `${k}: ${v}`).join('; ')}
           "
           role="${element.accessibility.role}"
           tabindex="${element.accessibility.tabIndex}"
           aria-label="${element.accessibility.label}">
        ${element.content}
      </div>
    `).join('')

    const connectionsHTML = this.connections.length > 0 ? `
      <svg class="diagram-connections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
        ${svgDefs}
        ${this.connections.map(conn => {
          const fromElement = this.elements.find(el => el.id === conn.from)
          const toElement = this.elements.find(el => el.id === conn.to)

          if (!fromElement || !toElement) return ''

          const x1 = fromElement.position.x + fromElement.size.width / 2
          const y1 = fromElement.position.y + fromElement.size.height / 2
          const x2 = toElement.position.x + toElement.size.width / 2
          const y2 = toElement.position.y + toElement.size.height / 2

          return `
            <line class="diagram-arrow ${conn.animated ? 'animated' : ''}"
                  data-from="${conn.from}"
                  data-to="${conn.to}"
                  x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />
            ${conn.label ? `
              <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 10}"
                    text-anchor="middle"
                    fill="${this.getThemeColor('text-secondary')}"
                    font-size="12">${conn.label}</text>
            ` : ''}
          `
        }).join('')}
      </svg>
    ` : ''

    const annotationsHTML = this.annotations.map(annotation => `
      <div class="diagram-annotation"
           data-target="${annotation.target || ''}"
           style="
             left: ${annotation.position.x}px;
             top: ${annotation.position.y}px;
             ${Object.entries(annotation.style).map(([k, v]) => `${k}: ${v}`).join('; ')}
           ">
        ${annotation.content}
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.config.title}</title>
        <style>
          ${this.generateCSS()}
        </style>
      </head>
      <body>
        <div class="diagram-container">
          <div class="diagram-header">
            <h1 class="diagram-title">${this.config.title}</h1>
            <p class="diagram-subtitle">${this.config.subtitle || ''}</p>
          </div>

          <div class="diagram-canvas">
            ${elementsHTML}
            ${connectionsHTML}
            ${annotationsHTML}
          </div>
        </div>

        <script>
          ${this.generateJS()}
        </script>
      </body>
      </html>
    `
  }

  /**
   * Save diagram to file
   */
  async save(filePath) {
    const html = this.generateHTML()

    // In a real implementation, this would write to file
    // For now, return the HTML content
    return html
  }
}

/**
 * Specialized diagram types
 */

export class WireframeDiagram extends DiagramBase {
  constructor(options = {}) {
    super({
      ...options,
      type: 'wireframe',
      theme: options.theme || 'modern'
    })
  }

  addVideoPlayer(position = { x: 100, y: 100 }) {
    return this.addElement({
      type: 'video-player',
      content: `
        <div style="width: 100%; height: 60%; background: #f0f0f0; border-radius: 4px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
          <span style="color: #666;">📺 VIDEO AREA</span>
        </div>
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button style="width: 24px; height: 24px; border: none; border-radius: 50%; background: #4299e1; color: white;">▶</button>
          <div style="flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; margin: 10px;"></div>
          <button style="width: 24px; height: 24px; border: none; border-radius: 50%; background: #e2e8f0;">🔊</button>
        </div>
      `,
      position,
      size: { width: 320, height: 200 },
      accessibilityLabel: 'Video player wireframe component'
    })
  }

  addMobilePlayer(position = { x: 100, y: 100 }) {
    return this.addElement({
      type: 'mobile-player',
      content: `
        <div style="width: 100%; height: 70%; background: #f0f0f0; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
          <span style="color: #666; font-size: 0.8rem;">📱 MOBILE VIDEO</span>
        </div>
        <div style="display: flex; gap: 6px; justify-content: space-around;">
          <button style="width: 32px; height: 32px; border: none; border-radius: 50%; background: #4299e1; color: white;">▶</button>
          <button style="width: 32px; height: 32px; border: none; border-radius: 50%; background: #e2e8f0;">🔊</button>
          <button style="width: 32px; height: 32px; border: none; border-radius: 50%; background: #e2e8f0;">⛶</button>
        </div>
      `,
      position,
      size: { width: 200, height: 150 },
      accessibilityLabel: 'Mobile video player wireframe'
    })
  }

  addSmartTVPlayer(position = { x: 100, y: 100 }) {
    return this.addElement({
      type: 'smart-tv-player',
      content: `
        <div style="width: 100%; height: 65%; background: #f0f0f0; border-radius: 4px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; position: relative;">
          <span style="color: #666;">📺 SMART TV VIDEO</span>
          <div style="position: absolute; top: 5px; right: 5px; font-size: 0.7rem; color: #999;">1920×1080</div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button style="width: 36px; height: 36px; border: 3px solid #4299e1; border-radius: 50%; background: #4299e1; color: white; font-weight: bold;">▶</button>
          <button style="width: 36px; height: 36px; border: none; border-radius: 50%; background: #e2e8f0;">🔊</button>
          <button style="width: 36px; height: 36px; border: none; border-radius: 50%; background: #e2e8f0;">⚙️</button>
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 0.7rem; color: #666;">D-pad Navigation</div>
      `,
      position,
      size: { width: 400, height: 220 },
      accessibilityLabel: 'Smart TV video player with D-pad navigation'
    })
  }
}

export class ArchitectureDiagram extends DiagramBase {
  constructor(options = {}) {
    super({
      ...options,
      type: 'architecture',
      theme: options.theme || 'modern'
    })
  }

  addComponent(name, type, position) {
    const icons = {
      frontend: '🌐',
      backend: '⚙️',
      database: '🗄️',
      api: '🔌',
      streaming: '📡',
      cdn: '☁️'
    }

    return this.addElement({
      type: 'component',
      content: `
        <div style="font-size: 2rem; margin-bottom: 8px;">${icons[type] || '📦'}</div>
        <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
        <div style="font-size: 0.8rem; opacity: 0.7;">${type.toUpperCase()}</div>
      `,
      position,
      size: { width: 150, height: 120 },
      accessibilityLabel: `${name} ${type} component`
    })
  }
}

export class UserFlowDiagram extends DiagramBase {
  constructor(options = {}) {
    super({
      ...options,
      type: 'user-flow',
      theme: options.theme || 'modern'
    })
  }

  addFlowStep(title, description, position, stepNumber) {
    return this.addElement({
      type: 'flow-step',
      content: `
        <div style="width: 40px; height: 40px; background: #4299e1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 12px;">${stepNumber}</div>
        <div style="font-weight: 600; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 0.85rem; opacity: 0.8; line-height: 1.3;">${description}</div>
      `,
      position,
      size: { width: 200, height: 140 },
      accessibilityLabel: `Step ${stepNumber}: ${title}`
    })
  }
}

// Export factory functions for easy usage
export function createWireframe(config) {
  return new WireframeDiagram(config)
}

export function createArchitecture(config) {
  return new ArchitectureDiagram(config)
}

export function createUserFlow(config) {
  return new UserFlowDiagram(config)
}