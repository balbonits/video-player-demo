/**
 * Comprehensive Streaming API Backend Tests
 * Sam (QA) - Enterprise-level backend testing for video streaming infrastructure
 *
 * Coverage Requirements: 95% for critical streaming endpoints
 * Performance Targets: <500ms response time, proper CORS handling
 */

const request = require('supertest')
const fs = require('fs')
const path = require('path')

// Import the Express app (we'll need to modify server.js to export the app)
let app

describe('Video Streaming API Backend', () => {
  let server

  beforeAll(async () => {
    // Start the server for testing
    process.env.NODE_ENV = 'test'
    process.env.PORT = '8081' // Use different port for testing

    // Dynamically import the server
    const serverModule = require('../server.js')
    app = serverModule.app || serverModule

    // Start server if not already listening
    if (!serverModule.server) {
      server = app.listen(8081)
    }
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('Health Check Endpoints', () => {
    test('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String)
      })
    })

    test('should respond within performance threshold', async () => {
      const startTime = Date.now()

      const response = await request(app)
        .get('/health')
        .expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(100) // 100ms threshold
    })
  })

  describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204)

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000')
      expect(response.headers['access-control-allow-methods']).toContain('GET')
    })

    test('should reject unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://malicious-site.com')

      // Should either reject or not include CORS headers
      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })

    test('should allow multiple valid origins', async () => {
      const validOrigins = [
        'http://localhost:3000',
        'https://video-player-demo.vercel.app',
        'https://localhost:3000'
      ]

      for (const origin of validOrigins) {
        const response = await request(app)
          .get('/health')
          .set('Origin', origin)
          .expect(200)

        expect(response.headers['access-control-allow-origin']).toBe(origin)
      }
    })
  })

  describe('Video File Serving', () => {
    const mockVideoPath = path.join(__dirname, '../test-assets/sample.mp4')

    beforeAll(() => {
      // Create test assets directory if it doesn't exist
      const testAssetsDir = path.dirname(mockVideoPath)
      if (!fs.existsSync(testAssetsDir)) {
        fs.mkdirSync(testAssetsDir, { recursive: true })
      }

      // Create a mock video file for testing
      if (!fs.existsSync(mockVideoPath)) {
        fs.writeFileSync(mockVideoPath, Buffer.alloc(1024 * 1024, 'mock video data')) // 1MB mock file
      }
    })

    test('should serve video files with proper headers', async () => {
      const response = await request(app)
        .get('/video/sample.mp4')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/video\/mp4/)
      expect(response.headers['accept-ranges']).toBe('bytes')
      expect(response.headers['cache-control']).toBeDefined()
    })

    test('should support range requests for video streaming', async () => {
      const response = await request(app)
        .get('/video/sample.mp4')
        .set('Range', 'bytes=0-1023')
        .expect(206) // Partial Content

      expect(response.headers['content-range']).toMatch(/bytes 0-1023\/\d+/)
      expect(response.headers['content-length']).toBe('1024')
    })

    test('should handle invalid range requests gracefully', async () => {
      const response = await request(app)
        .get('/video/sample.mp4')
        .set('Range', 'bytes=invalid-range')
        .expect(400) // Bad Request

      expect(response.body).toEqual({
        error: 'Invalid range request',
        code: 'INVALID_RANGE'
      })
    })

    test('should return 404 for non-existent video files', async () => {
      const response = await request(app)
        .get('/video/nonexistent.mp4')
        .expect(404)

      expect(response.body).toEqual({
        error: 'Video file not found',
        code: 'FILE_NOT_FOUND'
      })
    })
  })

  describe('HLS Streaming Endpoints', () => {
    test('should serve HLS master playlist', async () => {
      const response = await request(app)
        .get('/hls/master.m3u8')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/application\/vnd\.apple\.mpegurl/)
      expect(response.text).toContain('#EXTM3U')
      expect(response.text).toContain('#EXT-X-STREAM-INF')
    })

    test('should serve quality-specific playlists', async () => {
      const qualities = ['720p', '480p', '360p']

      for (const quality of qualities) {
        const response = await request(app)
          .get(`/hls/${quality}.m3u8`)
          .expect(200)

        expect(response.headers['content-type']).toMatch(/application\/vnd\.apple\.mpegurl/)
        expect(response.text).toContain('#EXTM3U')
        expect(response.text).toContain('#EXTINF')
      }
    })

    test('should serve HLS segments with proper caching', async () => {
      const response = await request(app)
        .get('/hls/720p/segment001.ts')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/video\/mp2t/)
      expect(response.headers['cache-control']).toContain('max-age')
      expect(parseInt(response.headers['cache-control'].match(/max-age=(\d+)/)[1])).toBeGreaterThan(0)
    })

    test('should validate HLS playlist format', async () => {
      const response = await request(app)
        .get('/hls/master.m3u8')
        .expect(200)

      const playlist = response.text
      const lines = playlist.split('\n')

      // Validate HLS format
      expect(lines[0]).toBe('#EXTM3U')
      expect(playlist).toContain('#EXT-X-VERSION')

      // Check for required stream info
      const streamLines = lines.filter(line => line.startsWith('#EXT-X-STREAM-INF'))
      expect(streamLines.length).toBeGreaterThan(0)

      streamLines.forEach(line => {
        expect(line).toMatch(/BANDWIDTH=\d+/)
        expect(line).toMatch(/RESOLUTION=\d+x\d+/)
      })
    })
  })

  describe('Performance and Monitoring', () => {
    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10
      const startTime = Date.now()

      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app).get('/health').expect(200)
      )

      await Promise.all(promises)

      const totalTime = Date.now() - startTime
      const averageTime = totalTime / concurrentRequests

      expect(averageTime).toBeLessThan(200) // 200ms average per request
    })

    test('should maintain memory usage under Smart TV constraints', async () => {
      const initialMemory = global.testUtils.getMemoryUsage()

      // Simulate heavy load
      const promises = Array.from({ length: 50 }, () =>
        request(app).get('/hls/master.m3u8').expect(200)
      )

      await Promise.all(promises)

      const finalMemory = global.testUtils.getMemoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(50) // Less than 50MB increase
    })

    test('should compress responses for bandwidth optimization', async () => {
      const response = await request(app)
        .get('/hls/master.m3u8')
        .set('Accept-Encoding', 'gzip')
        .expect(200)

      expect(response.headers['content-encoding']).toBe('gzip')
    })
  })

  describe('Error Handling and Security', () => {
    test('should handle server errors gracefully', async () => {
      // Simulate server error by requesting invalid endpoint
      const response = await request(app)
        .get('/api/trigger-error')
        .expect(500)

      expect(response.body).toEqual({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: expect.any(String)
      })
    })

    test('should prevent path traversal attacks', async () => {
      const maliciousPaths = [
        '/video/../../../etc/passwd',
        '/video/..\\..\\..\\windows\\system32\\config\\sam',
        '/hls/../../../etc/hosts'
      ]

      for (const path of maliciousPaths) {
        const response = await request(app)
          .get(path)
          .expect(403) // Forbidden

        expect(response.body).toEqual({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        })
      }
    })

    test('should validate file extensions', async () => {
      const invalidExtensions = ['.exe', '.bat', '.sh', '.php']

      for (const ext of invalidExtensions) {
        const response = await request(app)
          .get(`/video/malicious${ext}`)
          .expect(403)

        expect(response.body).toEqual({
          error: 'Invalid file type',
          code: 'INVALID_FILE_TYPE'
        })
      }
    })

    test('should rate limit requests', async () => {
      // Make rapid requests to trigger rate limiting
      const rapidRequests = Array.from({ length: 20 }, () =>
        request(app).get('/health')
      )

      const responses = await Promise.allSettled(rapidRequests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      )

      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Adaptive Bitrate Streaming', () => {
    test('should provide multiple quality levels', async () => {
      const response = await request(app)
        .get('/hls/master.m3u8')
        .expect(200)

      const playlist = response.text
      const streamLines = playlist.split('\n').filter(line => line.startsWith('#EXT-X-STREAM-INF'))

      // Should have at least 3 quality levels
      expect(streamLines.length).toBeGreaterThanOrEqual(3)

      // Extract bandwidth values
      const bandwidths = streamLines.map(line => {
        const match = line.match(/BANDWIDTH=(\d+)/)
        return match ? parseInt(match[1]) : 0
      })

      // Bandwidths should be in ascending order
      for (let i = 1; i < bandwidths.length; i++) {
        expect(bandwidths[i]).toBeGreaterThan(bandwidths[i - 1])
      }
    })

    test('should serve appropriate quality based on request parameters', async () => {
      const qualityTests = [
        { quality: '360p', expectedBandwidth: 800000 },
        { quality: '720p', expectedBandwidth: 2500000 },
        { quality: '1080p', expectedBandwidth: 5000000 }
      ]

      for (const test of qualityTests) {
        const response = await request(app)
          .get(`/api/recommend-quality?bandwidth=${test.expectedBandwidth}`)
          .expect(200)

        expect(response.body).toEqual({
          recommendedQuality: test.quality,
          bandwidth: test.expectedBandwidth,
          resolution: expect.any(String)
        })
      }
    })
  })

  describe('Content Delivery Network Integration', () => {
    test('should set appropriate CDN headers', async () => {
      const response = await request(app)
        .get('/video/sample.mp4')
        .expect(200)

      expect(response.headers['cache-control']).toMatch(/max-age=\d+/)
      expect(response.headers['etag']).toBeDefined()
      expect(response.headers['last-modified']).toBeDefined()
    })

    test('should handle If-None-Match conditional requests', async () => {
      // Get initial response with ETag
      const initialResponse = await request(app)
        .get('/video/sample.mp4')
        .expect(200)

      const etag = initialResponse.headers['etag']
      expect(etag).toBeDefined()

      // Make conditional request with same ETag
      const conditionalResponse = await request(app)
        .get('/video/sample.mp4')
        .set('If-None-Match', etag)
        .expect(304) // Not Modified

      expect(conditionalResponse.body).toEqual({})
    })
  })

  describe('Analytics and Monitoring', () => {
    test('should log video access for analytics', async () => {
      const logSpy = jest.spyOn(console, 'log')

      await request(app)
        .get('/video/sample.mp4')
        .set('User-Agent', 'Mozilla/5.0 (SmartTV; Tizen 4.0)')
        .expect(200)

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Video access:'),
        expect.objectContaining({
          file: 'sample.mp4',
          userAgent: expect.stringContaining('SmartTV'),
          timestamp: expect.any(Number)
        })
      )

      logSpy.mockRestore()
    })

    test('should track bandwidth usage', async () => {
      const response = await request(app)
        .get('/api/bandwidth-stats')
        .expect(200)

      expect(response.body).toEqual({
        totalBandwidth: expect.any(Number),
        activeStreams: expect.any(Number),
        averageBitrate: expect.any(Number),
        timestamp: expect.any(String)
      })
    })
  })
})

/**
 * Integration Tests with Frontend
 */
describe('Frontend-Backend Integration', () => {
  test('should handle video player initialization requests', async () => {
    const response = await request(app)
      .post('/api/player/initialize')
      .send({
        videoId: 'test-video',
        playerType: 'hls-js',
        platform: 'smart-tv'
      })
      .expect(200)

    expect(response.body).toEqual({
      videoUrl: expect.stringContaining('/hls/'),
      posterUrl: expect.any(String),
      subtitles: expect.any(Array),
      qualityLevels: expect.any(Array),
      sessionId: expect.any(String)
    })
  })

  test('should handle player analytics events', async () => {
    const analyticsEvent = {
      sessionId: 'test-session-123',
      event: 'video_start',
      timestamp: Date.now(),
      data: {
        videoId: 'test-video',
        quality: '720p',
        platform: 'smart-tv'
      }
    }

    const response = await request(app)
      .post('/api/analytics/event')
      .send(analyticsEvent)
      .expect(200)

    expect(response.body).toEqual({
      success: true,
      eventId: expect.any(String)
    })
  })

  test('should validate player configuration requests', async () => {
    const invalidConfig = {
      videoId: '', // Invalid empty videoId
      playerType: 'invalid-player-type',
      platform: 'unknown-platform'
    }

    const response = await request(app)
      .post('/api/player/initialize')
      .send(invalidConfig)
      .expect(400)

    expect(response.body).toEqual({
      error: 'Invalid configuration',
      code: 'VALIDATION_ERROR',
      details: expect.any(Array)
    })
  })
})