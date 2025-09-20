/**
 * TypeScript declarations for custom Web Components in JSX
 */

declare namespace JSX {
  interface IntrinsicElements {
    'hls-video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string
      autoplay?: boolean
      'performance-mode'?: 'smartTV' | 'mobile' | 'desktop'
      'memory-limit'?: string
      'cpu-limit'?: string
      'buffer-strategy'?: 'conservative' | 'aggressive' | 'adaptive'
      controls?: boolean
    }
  }
}