/**
 * Jest Setup for Video Streaming Backend
 * Sam (QA) - Backend testing configuration and mocks
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.PORT = '8080'
process.env.CORS_ORIGIN = 'http://localhost:3000'

// Global test utilities for backend streaming tests
global.testUtils = {
  // Create mock Express request
  createMockReq: (options = {}) => ({
    method: 'GET',
    url: '/',
    headers: {
      'user-agent': 'Mozilla/5.0 (Smart TV) Test Browser',
      'accept': 'application/json',
      ...options.headers
    },
    query: {},
    params: {},
    body: {},
    ...options
  }),

  // Create mock Express response
  createMockRes: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      statusCode: 200,
      locals: {}
    }
    return res
  },

  // Create mock Next function for middleware
  createMockNext: () => jest.fn(),

  // Mock HLS segment data
  createMockHLSSegment: (duration = 10, sequence = 1) => ({
    duration,
    sequence,
    uri: `segment${sequence}.ts`,
    timeline: 0,
    byteRange: null,
    title: null,
    programDateTime: null,
    key: null
  }),

  // Mock M3U8 playlist content
  createMockM3U8: (segments = 3, targetDuration = 10) => {
    const segmentLines = Array.from({ length: segments }, (_, i) => [
      `#EXTINF:${targetDuration}.0,`,
      `segment${i + 1}.ts`
    ]).flat()

    return [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${targetDuration}`,
      '#EXT-X-MEDIA-SEQUENCE:0',
      ...segmentLines,
      '#EXT-X-ENDLIST'
    ].join('\n')
  },

  // Mock video file metadata
  createMockVideoMetadata: (options = {}) => ({
    duration: 120,
    bitrate: 2500000,
    width: 1920,
    height: 1080,
    frameRate: 29.97,
    codecs: 'avc1.640028,mp4a.40.2',
    size: 50 * 1024 * 1024, // 50MB
    ...options
  }),

  // Simulate network latency
  simulateNetworkLatency: (ms = 100) =>
    new Promise(resolve => setTimeout(resolve, ms)),

  // Simulate bandwidth throttling
  simulateBandwidthThrottling: (bytesPerSecond = 1000000) => ({
    download: (bytes) => {
      const timeMs = (bytes / bytesPerSecond) * 1000
      return new Promise(resolve => setTimeout(resolve, timeMs))
    }
  }),

  // Memory monitoring utilities
  getMemoryUsage: () => {
    const usage = process.memoryUsage()
    return {
      rss: usage.rss / 1024 / 1024, // MB
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024 // MB
    }
  },

  // Assert memory usage under Smart TV constraints
  assertMemoryUnderLimit: (limitMB = 100) => {
    const usage = global.testUtils.getMemoryUsage()
    expect(usage.heapUsed).toBeLessThan(limitMB)
    return usage
  }
}

// Mock fs operations for video file testing
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
    on: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn()
  })),
  stat: jest.fn((path, callback) => {
    callback(null, {
      size: 50 * 1024 * 1024, // 50MB default
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date()
    })
  }),
  access: jest.fn((path, mode, callback) => {
    callback(null) // File exists
  })
}))

// Mock path operations
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => '/' + args.join('/'))
}))

// Console error handling for backend tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Filter out expected test warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('deprecated') || args[0].includes('warning'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test timeout for streaming operations
jest.setTimeout(30000)