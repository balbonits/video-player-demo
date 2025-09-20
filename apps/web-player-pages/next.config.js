/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [
      'sample.vodobox.com',
      'commondatastorage.googleapis.com',
      'storage.googleapis.com'
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom', 'hls.js'],
  },

  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: `../.next/analyze/${isServer ? 'server' : 'client'}.html`
        })
      );
    }

    // Performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          hls: {
            test: /[\\/]node_modules[\\/]hls\.js/,
            name: 'hls',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },

  // Security headers
  async headers() {
    const contentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      media-src 'self' blob: https: http: data:;
      connect-src 'self' https: wss: blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_COMMIT_SHA: process.env.GITHUB_SHA || 'local',
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Performance monitoring
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

// Development-specific configuration
if (process.env.NODE_ENV === 'development') {
  nextConfig.eslint = {
    // Only run ESLint on these directories during `next build` or `next lint`
    dirs: ['src', 'components', 'pages', 'utils'],
  };
}

module.exports = nextConfig;
