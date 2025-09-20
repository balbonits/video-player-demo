// Type definitions for the HLS Video Player web component
declare namespace JSX {
  interface IntrinsicElements {
    'hls-video-player': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        'performance-mode'?: 'smartTV' | 'mobile' | 'desktop'
        autoplay?: boolean
        'show-performance'?: boolean
        controls?: boolean
      },
      HTMLElement
    >
  }
}