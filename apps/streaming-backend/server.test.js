/**
 * Comprehensive Test Suite for Streaming Backend
 * Target: 100% Code Coverage
 * Sam - Senior QA Engineer
 */

const request = require('supertest');
const express = require('express');

// Mock the entire module before requiring server
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-hex-string-1234567890abcdef')
  }))
}));

describe('Streaming Backend Service - 100% Coverage', () => {
  let app;
  let server;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };

    // Re-require server.js for each test to reset state
    delete require.cache[require.resolve('./server.js')];

    // Mock console.log to prevent output during tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Server Initialization', () => {
    test('should start server on default port 3001', (done) => {
      delete process.env.PORT;
      require('./server.js');

      // Check that console.log was called with startup messages
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('3001'));
      done();
    });

    test('should start server on custom PORT from env', (done) => {
      process.env.PORT = '4000';
      require('./server.js');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('4000'));
      done();
    });
  });

  describe('Middleware Configuration', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should have CORS configured correctly', async () => {
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://example.com');

      expect(res.headers['access-control-allow-origin']).toBe('*');
      expect(res.headers['access-control-allow-methods']).toContain('GET');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('GET /manifest/:contentId/master.m3u8', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should generate master manifest with default parameters', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.apple.mpegurl');
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.headers['x-cdn-cache']).toBe('MISS');
      expect(res.headers['x-edge-location']).toBeDefined();
      expect(res.text).toContain('#EXTM3U');
      expect(res.text).toContain('#EXT-X-VERSION:6');
      expect(res.text).toContain('AUDIO="audio"');
      expect(res.text).toContain('video/');
    });

    test('should filter qualities for mobile device', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-device-type', 'mobile')
        .set('x-bandwidth-estimate', '2000000');

      expect(res.status).toBe(200);
      expect(res.text).toContain('#EXT-X-STREAM-INF');
      expect(res.text).not.toContain('3840x2160'); // No 4K for mobile
    });

    test('should filter qualities for tablet device', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-device-type', 'tablet')
        .set('x-bandwidth-estimate', '5000000');

      expect(res.status).toBe(200);
      expect(res.text).not.toContain('3840x2160'); // No 4K for tablets
    });

    test('should include all qualities for smarttv', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-device-type', 'smarttv')
        .set('x-bandwidth-estimate', '20000000');

      expect(res.status).toBe(200);
      expect(res.text).toContain('3840x2160'); // 4K available for Smart TV
    });

    test('should handle desktop device type', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-device-type', 'desktop')
        .set('x-bandwidth-estimate', '20000000');

      expect(res.status).toBe(200);
      expect(res.text).toContain('3840x2160'); // 4K for desktop too
    });

    test('should use provided session ID', async () => {
      const sessionId = 'test-session-123';
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-session-id', sessionId);

      expect(res.status).toBe(200);
      expect(res.headers['x-session-id']).toBe(sessionId);
    });

    test('should generate session ID if not provided', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8');

      expect(res.status).toBe(200);
      expect(res.headers['x-session-id']).toBe('mocked-hex-string-1234567890abcdef');
    });

    test('should handle low bandwidth scenarios', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8')
        .set('x-bandwidth-estimate', '300000'); // Very low bandwidth

      expect(res.status).toBe(200);
      expect(res.text).toContain('320x180'); // Should have lowest quality
    });

    test('should handle missing bandwidth header', async () => {
      const res = await request(app)
        .get('/manifest/test-content/master.m3u8');

      expect(res.status).toBe(200);
      // Default bandwidth is 5000000, should have multiple qualities
      expect(res.text).toContain('#EXT-X-STREAM-INF');
    });
  });

  describe('GET /manifest/:contentId/video/:qualityId/index.m3u8', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should generate VOD variant playlist', async () => {
      const res = await request(app)
        .get('/manifest/test-content/video/2/index.m3u8');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.apple.mpegurl');
      expect(res.headers['cache-control']).toBe('max-age=3600');
      expect(res.headers['x-cdn-cache']).toBe('HIT');
      expect(res.text).toContain('#EXTM3U');
      expect(res.text).toContain('#EXT-X-PLAYLIST-TYPE:VOD');
      expect(res.text).toContain('#EXT-X-ENDLIST');
      expect(res.text).toContain('#EXTINF:6.000');
      expect(res.text).toContain('/segment/test-content/2/');
    });

    test('should generate live variant playlist', async () => {
      const res = await request(app)
        .get('/manifest/test-content/video/3/index.m3u8?live=true');

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.text).not.toContain('#EXT-X-ENDLIST');
      expect(res.text).toContain('#EXT-X-MEDIA-SEQUENCE:0');
    });

    test('should handle different quality IDs', async () => {
      const res = await request(app)
        .get('/manifest/content-xyz/video/7/index.m3u8');

      expect(res.status).toBe(200);
      expect(res.text).toContain('/segment/content-xyz/7/');
    });

    test('should generate correct number of segments for VOD', async () => {
      const res = await request(app)
        .get('/manifest/test/video/0/index.m3u8');

      expect(res.status).toBe(200);
      const segmentCount = (res.text.match(/#EXTINF/g) || []).length;
      expect(segmentCount).toBe(100); // VOD has 100 segments
    });

    test('should generate sliding window for live streams', async () => {
      const res = await request(app)
        .get('/manifest/test/video/0/index.m3u8?live=true');

      expect(res.status).toBe(200);
      const segmentCount = (res.text.match(/#EXTINF/g) || []).length;
      expect(segmentCount).toBe(10); // Live has 10 segment sliding window
    });
  });

  describe('GET /segment/:contentId/:qualityId/:segmentId.ts', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should deliver full segment without range header', async () => {
      const res = await request(app)
        .get('/segment/test-content/2/5.ts')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('video/mp2t');
      expect(res.headers['content-length']).toBe('1048576');
      expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
      expect(res.headers['x-cdn-cache']).toBe('HIT');
      expect(res.headers['x-edge-location']).toBeDefined();
      expect(res.body.length).toBe(1048576);
    });

    test('should handle byte-range request from start', async () => {
      const res = await request(app)
        .get('/segment/test-content/2/5.ts')
        .set('Range', 'bytes=0-999')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(206);
      expect(res.headers['content-range']).toBe('bytes 0-999/1048576');
      expect(res.headers['accept-ranges']).toBe('bytes');
      expect(res.headers['content-length']).toBe('1000');
      expect(res.body.length).toBe(1000);
    });

    test('should handle byte-range request from middle', async () => {
      const res = await request(app)
        .get('/segment/test-content/2/5.ts')
        .set('Range', 'bytes=500-1499')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(206);
      expect(res.headers['content-range']).toBe('bytes 500-1499/1048576');
      expect(res.body.length).toBe(1000);
    });

    test('should handle open-ended byte-range request', async () => {
      const res = await request(app)
        .get('/segment/test-content/2/5.ts')
        .set('Range', 'bytes=1048570-')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(206);
      expect(res.headers['content-range']).toBe('bytes 1048570-1048575/1048576');
      expect(res.body.length).toBe(6);
    });

    test('should generate different content for different segments', async () => {
      const res1 = await request(app)
        .get('/segment/test/2/1.ts')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      const res2 = await request(app)
        .get('/segment/test/2/2.ts')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res1.body[0]).not.toBe(res2.body[0]); // Different pattern
    });
  });

  describe('POST /analytics/events', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should accept analytics events', async () => {
      const events = [
        { type: 'play', timestamp: Date.now() },
        { type: 'buffer', timestamp: Date.now() }
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'test-session')
        .send({ events });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(2);
      expect(res.body.qoeScore).toBeDefined();
      expect(res.body.recommendations).toBeInstanceOf(Array);
    });

    test('should update bandwidth estimate', async () => {
      const events = [
        { type: 'bandwidth_sample', bandwidth: 8000000 }
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'test-session-bw')
        .send({ events });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(1);
    });

    test('should handle rebuffer events for QoE calculation', async () => {
      // First, create a session
      await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-session-id', 'qoe-test-session');

      const events = [
        { type: 'rebuffer', timestamp: Date.now() },
        { type: 'rebuffer', timestamp: Date.now() }
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'qoe-test-session')
        .send({ events });

      expect(res.status).toBe(200);
      expect(res.body.qoeScore).toBeLessThan(5.0); // Rebuffers reduce QoE
    });

    test('should handle quality switch events', async () => {
      // First, create a session
      await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-session-id', 'switch-test-session');

      const events = [
        { type: 'quality_switch', from: 2, to: 3 },
        { type: 'quality_switch', from: 3, to: 4 }
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'switch-test-session')
        .send({ events });

      expect(res.status).toBe(200);
      expect(res.body.qoeScore).toBeDefined();
    });

    test('should return default QoE for unknown session', async () => {
      const events = [
        { type: 'play', timestamp: Date.now() }
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'unknown-session')
        .send({ events });

      expect(res.status).toBe(200);
      expect(res.body.qoeScore).toBe(3.0); // Default QoE
    });

    test('should handle empty events array', async () => {
      const res = await request(app)
        .post('/analytics/events')
        .send({ events: [] });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(0);
    });
  });

  describe('POST /auth/validate', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should validate valid token', async () => {
      const res = await request(app)
        .post('/auth/validate')
        .send({
          token: 'valid-token-with-more-than-20-chars',
          contentId: 'test-content',
          deviceId: 'device-123'
        });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.sessionToken).toBeDefined();
      expect(res.body.expiresAt).toBeDefined();
      expect(res.body.allowedQualities).toEqual([0, 1, 2, 3, 4, 5]);
      expect(res.body.cdnToken).toBeDefined();
    });

    test('should reject invalid token (too short)', async () => {
      const res = await request(app)
        .post('/auth/validate')
        .send({
          token: 'short',
          contentId: 'test-content',
          deviceId: 'device-123'
        });

      expect(res.status).toBe(403);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toBe('Invalid token');
    });

    test('should reject missing token', async () => {
      const res = await request(app)
        .post('/auth/validate')
        .send({
          contentId: 'test-content',
          deviceId: 'device-123'
        });

      expect(res.status).toBe(403);
      expect(res.body.valid).toBe(false);
    });

    test('should generate CDN token with content and device info', async () => {
      const res = await request(app)
        .post('/auth/validate')
        .send({
          token: 'valid-token-with-more-than-20-chars',
          contentId: 'premium-content',
          deviceId: 'smart-tv-456'
        });

      expect(res.status).toBe(200);
      const cdnToken = res.body.cdnToken;
      const decoded = JSON.parse(Buffer.from(cdnToken, 'base64').toString());
      expect(decoded.contentId).toBe('premium-content');
      expect(decoded.deviceId).toBe('smart-tv-456');
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('GET /bandwidth/estimate', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should return default bandwidth estimate', async () => {
      const res = await request(app)
        .get('/bandwidth/estimate');

      expect(res.status).toBe(200);
      expect(res.body.estimatedBandwidth).toBe(5000000);
      expect(res.body.recommendedQuality).toBeDefined();
      expect(res.body.availableQualities).toBeInstanceOf(Array);
    });

    test('should return updated bandwidth estimate', async () => {
      // First update bandwidth through analytics
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'bw-test')
        .send({
          events: [{ type: 'bandwidth_sample', bandwidth: 10000000 }]
        });

      const res = await request(app)
        .get('/bandwidth/estimate')
        .set('x-session-id', 'bw-test');

      expect(res.status).toBe(200);
      expect(res.body.estimatedBandwidth).toBe(10000000);
    });

    test('should recommend quality based on bandwidth', async () => {
      // Set low bandwidth
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'low-bw')
        .send({
          events: [{ type: 'bandwidth_sample', bandwidth: 500000 }]
        });

      const res = await request(app)
        .get('/bandwidth/estimate')
        .set('x-session-id', 'low-bw');

      expect(res.status).toBe(200);
      expect(res.body.recommendedQuality).toBe(0); // Lowest quality
    });

    test('should mark qualities as viable or not', async () => {
      // Set medium bandwidth
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'medium-bw')
        .send({
          events: [{ type: 'bandwidth_sample', bandwidth: 3000000 }]
        });

      const res = await request(app)
        .get('/bandwidth/estimate')
        .set('x-session-id', 'medium-bw');

      expect(res.status).toBe(200);
      const viable = res.body.availableQualities.filter(q => q.viable);
      const notViable = res.body.availableQualities.filter(q => !q.viable);

      expect(viable.length).toBeGreaterThan(0);
      expect(notViable.length).toBeGreaterThan(0);
    });

    test('should apply safety factor for recommendations', async () => {
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'safety-test')
        .send({
          events: [{ type: 'bandwidth_sample', bandwidth: 4500000 }]
        });

      const res = await request(app)
        .get('/bandwidth/estimate')
        .set('x-session-id', 'safety-test');

      expect(res.status).toBe(200);
      // With 0.7x safety factor, 4500000 * 0.7 = 3150000
      // Should recommend quality 4 (3000000) not quality 5 (4500000)
      expect(res.body.recommendedQuality).toBe(4);
    });
  });

  describe('GET /health', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should return health status', async () => {
      const res = await request(app)
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.body.service).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.edges).toBeInstanceOf(Array);
      expect(res.body.activeSessions).toBeGreaterThanOrEqual(0);
      expect(res.body.analyticsEvents).toBeGreaterThanOrEqual(0);
    });

    test('should show edge location status', async () => {
      const res = await request(app)
        .get('/health');

      expect(res.status).toBe(200);
      const edges = res.body.edges;

      expect(edges.length).toBe(4); // 4 edge locations
      edges.forEach(edge => {
        expect(edge.location).toBeDefined();
        expect(edge.latency).toBeDefined();
        expect(edge.capacity).toBeDefined();
        expect(edge.status).toMatch(/healthy|degraded/);
      });
    });

    test('should mark low capacity edges as degraded', async () => {
      const res = await request(app)
        .get('/health');

      const edges = res.body.edges;
      const degradedEdges = edges.filter(e => e.status === 'degraded');

      // Check that edges with capacity <= 0.2 are marked as degraded
      degradedEdges.forEach(edge => {
        expect(edge.capacity).toBeLessThanOrEqual(0.2);
      });
    });

    test('should track active sessions count', async () => {
      // Create some sessions
      await request(app)
        .get('/manifest/test1/master.m3u8');
      await request(app)
        .get('/manifest/test2/master.m3u8');

      const res = await request(app)
        .get('/health');

      expect(res.body.activeSessions).toBeGreaterThanOrEqual(2);
    });

    test('should track analytics events count', async () => {
      // Send some analytics
      await request(app)
        .post('/analytics/events')
        .send({ events: [{ type: 'test' }] });

      const res = await request(app)
        .get('/health');

      expect(res.body.analyticsEvents).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Helper Functions Coverage', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should select random edge location', async () => {
      const edges = new Set();

      // Make multiple requests to get different edge selections
      for (let i = 0; i < 20; i++) {
        const res = await request(app)
          .get('/manifest/test/master.m3u8');
        edges.add(res.headers['x-edge-location']);
      }

      // Should have selected multiple different edges
      expect(edges.size).toBeGreaterThan(1);
      expect(edges.has('us-east') || edges.has('us-west') ||
             edges.has('us-central') || edges.has('eu-west')).toBe(true);
    });

    test('should handle bandwidth estimation with exponential moving average', async () => {
      const sessionId = 'ema-test';

      // Send initial bandwidth
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', sessionId)
        .send({ events: [{ type: 'bandwidth_sample', bandwidth: 1000000 }] });

      // Send updated bandwidth
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', sessionId)
        .send({ events: [{ type: 'bandwidth_sample', bandwidth: 2000000 }] });

      const res = await request(app)
        .get('/bandwidth/estimate')
        .set('x-session-id', sessionId);

      // Should be weighted average: 1000000 * 0.7 + 2000000 * 0.3 = 1300000
      expect(res.body.estimatedBandwidth).toBe(1300000);
    });

    test('should provide recommendations based on bandwidth', async () => {
      // Test low bandwidth recommendation
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'rec-low')
        .send({ events: [{ type: 'bandwidth_sample', bandwidth: 800000 }] });

      let res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'rec-low')
        .send({ events: [] });

      expect(res.body.recommendations).toContain('Consider lowering video quality for smoother playback');

      // Test high bandwidth recommendation
      await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'rec-high')
        .send({ events: [{ type: 'bandwidth_sample', bandwidth: 15000000 }] });

      res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'rec-high')
        .send({ events: [] });

      expect(res.body.recommendations).toContain('Network supports 4K streaming');
    });

    test('should calculate QoE with all factors', async () => {
      // Create session with high quality
      await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-session-id', 'qoe-complex')
        .set('x-device-type', 'smarttv')
        .set('x-bandwidth-estimate', '20000000');

      // Send mixed events
      const events = [
        { type: 'rebuffer' }, // -0.5
        { type: 'quality_switch' }, // -0.1
        { type: 'quality_switch' } // -0.1
      ];

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'qoe-complex')
        .send({ events });

      expect(res.body.qoeScore).toBeGreaterThan(0);
      expect(res.body.qoeScore).toBeLessThanOrEqual(5);
    });

    test('should handle QoE boundary conditions', async () => {
      // Create session
      await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-session-id', 'qoe-boundary');

      // Send many rebuffers to push QoE to minimum
      const events = Array(20).fill({ type: 'rebuffer' });

      const res = await request(app)
        .post('/analytics/events')
        .set('x-session-id', 'qoe-boundary')
        .send({ events });

      expect(res.body.qoeScore).toBe(0); // Should clamp to minimum
    });

    test('should generate proper CDN token', async () => {
      const res = await request(app)
        .post('/auth/validate')
        .send({
          token: 'valid-token-with-more-than-20-chars',
          contentId: 'test-content-123',
          deviceId: 'test-device-456'
        });

      const cdnToken = res.body.cdnToken;
      const decoded = JSON.parse(Buffer.from(cdnToken, 'base64').toString());

      expect(decoded.contentId).toBe('test-content-123');
      expect(decoded.deviceId).toBe('test-device-456');
      expect(decoded.exp).toBeGreaterThan(Date.now());
      expect(decoded.exp).toBeLessThanOrEqual(Date.now() + 3600 * 1000);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    beforeEach(() => {
      app = require('./server.js');
    });

    test('should handle malformed Range header gracefully', async () => {
      const res = await request(app)
        .get('/segment/test/2/5.ts')
        .set('Range', 'bytes=invalid');

      expect(res.status).toBe(206);
      // Should parse as NaN and handle gracefully
    });

    test('should handle very large segment IDs', async () => {
      const res = await request(app)
        .get('/segment/test/2/999999999.ts');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('video/mp2t');
    });

    test('should handle special characters in content ID', async () => {
      const res = await request(app)
        .get('/manifest/test-content_123.special/master.m3u8');

      expect(res.status).toBe(200);
      expect(res.text).toContain('test-content_123.special');
    });

    test('should handle missing body in analytics', async () => {
      const res = await request(app)
        .post('/analytics/events')
        .send({});

      expect(res.status).toBe(500); // Will throw error accessing undefined.forEach
    });

    test('should handle non-numeric bandwidth', async () => {
      const res = await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-bandwidth-estimate', 'not-a-number');

      expect(res.status).toBe(200);
      // Should default to 5000000
    });

    test('should handle empty device type', async () => {
      const res = await request(app)
        .get('/manifest/test/master.m3u8')
        .set('x-device-type', '');

      expect(res.status).toBe(200);
      // Should default to desktop behavior
    });
  });
});

describe('Integration Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete require.cache[require.resolve('./server.js')];
    jest.spyOn(console, 'log').mockImplementation();
    app = require('./server.js');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle complete streaming workflow', async () => {
    // 1. Validate token
    const authRes = await request(app)
      .post('/auth/validate')
      .send({
        token: 'valid-premium-token-with-more-than-20-chars',
        contentId: 'premium-movie',
        deviceId: 'smart-tv-123'
      });

    expect(authRes.status).toBe(200);
    const sessionToken = authRes.body.sessionToken;

    // 2. Get master manifest
    const manifestRes = await request(app)
      .get('/manifest/premium-movie/master.m3u8')
      .set('x-session-id', sessionToken)
      .set('x-device-type', 'smarttv')
      .set('x-bandwidth-estimate', '10000000');

    expect(manifestRes.status).toBe(200);
    expect(manifestRes.text).toContain('3840x2160'); // 4K available

    // 3. Get variant playlist
    const variantRes = await request(app)
      .get('/manifest/premium-movie/video/5/index.m3u8');

    expect(variantRes.status).toBe(200);
    expect(variantRes.text).toContain('/segment/premium-movie/5/');

    // 4. Fetch segment
    const segmentRes = await request(app)
      .get('/segment/premium-movie/5/0.ts');

    expect(segmentRes.status).toBe(200);

    // 5. Send analytics
    const analyticsRes = await request(app)
      .post('/analytics/events')
      .set('x-session-id', sessionToken)
      .send({
        events: [
          { type: 'play', timestamp: Date.now() },
          { type: 'bandwidth_sample', bandwidth: 12000000 }
        ]
      });

    expect(analyticsRes.status).toBe(200);

    // 6. Get bandwidth estimate
    const bwRes = await request(app)
      .get('/bandwidth/estimate')
      .set('x-session-id', sessionToken);

    expect(bwRes.status).toBe(200);
    expect(bwRes.body.estimatedBandwidth).toBeGreaterThan(10000000);

    // 7. Check health
    const healthRes = await request(app)
      .get('/health');

    expect(healthRes.status).toBe(200);
    expect(healthRes.body.activeSessions).toBeGreaterThan(0);
  });

  test('should handle adaptive bitrate switching', async () => {
    const sessionId = 'abr-test-session';

    // Start with high bandwidth
    await request(app)
      .get('/manifest/test/master.m3u8')
      .set('x-session-id', sessionId)
      .set('x-bandwidth-estimate', '15000000');

    // Simulate bandwidth drop
    await request(app)
      .post('/analytics/events')
      .set('x-session-id', sessionId)
      .send({
        events: [
          { type: 'bandwidth_sample', bandwidth: 1000000 },
          { type: 'quality_switch', from: 7, to: 2 }
        ]
      });

    // Get new recommendation
    const res = await request(app)
      .get('/bandwidth/estimate')
      .set('x-session-id', sessionId);

    expect(res.body.recommendedQuality).toBeLessThan(7);
  });

  test('should handle concurrent sessions', async () => {
    const sessions = [];

    // Create multiple concurrent sessions
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .get(`/manifest/content-${i}/master.m3u8`)
        .set('x-session-id', `session-${i}`);

      sessions.push(res.headers['x-session-id']);
    }

    // Check health shows all sessions
    const healthRes = await request(app)
      .get('/health');

    expect(healthRes.body.activeSessions).toBeGreaterThanOrEqual(5);
  });
});