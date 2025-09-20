/**
 * Enterprise Video Streaming Backend
 * Dakota - Principal Video Streaming Engineer
 *
 * This service emulates how major CDNs serve video content with:
 * - Dynamic manifest generation
 * - Segment delivery with byte-range support
 * - Adaptive bitrate selection
 * - Real-time analytics collection
 * - Token-based authentication
 * - Multi-CDN simulation
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range', 'X-Session-ID', 'X-Device-ID', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-CDN-Cache', 'X-Edge-Location', 'X-Bandwidth-Estimate']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// In-memory store for analytics and session management
const sessions = new Map();
const analytics = [];
const bandwidthEstimates = new Map();

// CDN edge locations simulation
const edgeLocations = {
  'us-east': { latency: 10, capacity: 0.8 },
  'us-west': { latency: 15, capacity: 0.9 },
  'us-central': { latency: 20, capacity: 0.7 },
  'eu-west': { latency: 80, capacity: 0.6 }
};

// Quality ladder matching industry standards
const qualityLadder = [
  { id: 0, bitrate: 400000, resolution: '320x180', fps: 24, codec: 'avc1.42001e' },
  { id: 1, bitrate: 800000, resolution: '480x270', fps: 24, codec: 'avc1.42001e' },
  { id: 2, bitrate: 1200000, resolution: '640x360', fps: 24, codec: 'avc1.42001f' },
  { id: 3, bitrate: 2000000, resolution: '960x540', fps: 30, codec: 'avc1.4d001f' },
  { id: 4, bitrate: 3000000, resolution: '1280x720', fps: 30, codec: 'avc1.640028' },
  { id: 5, bitrate: 4500000, resolution: '1920x1080', fps: 30, codec: 'avc1.640028' },
  { id: 6, bitrate: 8000000, resolution: '1920x1080', fps: 60, codec: 'avc1.640028' },
  { id: 7, bitrate: 15000000, resolution: '3840x2160', fps: 60, codec: 'hev1.1.6.L150.90' }
];

/**
 * Generate dynamic HLS manifest based on device capabilities
 * Emulates Netflix's per-device manifest generation
 */
app.get('/manifest/:contentId/master.m3u8', (req, res) => {
  const { contentId } = req.params;
  const deviceType = req.headers['x-device-type'] || 'desktop';
  const bandwidth = parseInt(req.headers['x-bandwidth-estimate']) || 5000000;
  const sessionId = req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');

  // Select appropriate edge location
  const clientIP = req.ip;
  const edge = selectOptimalEdge(clientIP);

  // Filter quality ladder based on device
  const availableQualities = filterQualitiesForDevice(deviceType, bandwidth);

  // Generate master playlist
  let manifest = '#EXTM3U\\n';
  manifest += '#EXT-X-VERSION:6\\n';
  manifest += `#EXT-X-SESSION-DATA:DATA-ID="edge.location",VALUE="${edge}"\\n`;
  manifest += '\\n';

  // Audio tracks
  manifest += '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",DEFAULT=YES,';
  manifest += 'AUTOSELECT=YES,LANGUAGE="en",URI="audio/en/index.m3u8"\\n';
  manifest += '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Spanish",DEFAULT=NO,';
  manifest += 'AUTOSELECT=YES,LANGUAGE="es",URI="audio/es/index.m3u8"\\n\\n';

  // Video variants
  availableQualities.forEach(quality => {
    manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bitrate},`;
    manifest += `RESOLUTION=${quality.resolution},`;
    manifest += `FRAME-RATE=${quality.fps},`;
    manifest += `CODECS="${quality.codec},mp4a.40.2",`;
    manifest += 'AUDIO="audio"\\n';
    manifest += `video/${quality.id}/index.m3u8\\n\\n`;
  });

  // Store session info
  sessions.set(sessionId, {
    contentId,
    deviceType,
    startTime: Date.now(),
    edge,
    qualities: availableQualities.map(q => q.id)
  });

  res.set({
    'Content-Type': 'application/vnd.apple.mpegurl',
    'Cache-Control': 'no-cache',
    'X-CDN-Cache': 'MISS',
    'X-Edge-Location': edge,
    'X-Session-ID': sessionId
  });

  res.send(manifest);
});

/**
 * Serve variant playlist (simulates segment URLs)
 * Implements sliding window for live streams
 */
app.get('/manifest/:contentId/video/:qualityId/index.m3u8', (req, res) => {
  const { contentId, qualityId } = req.params;
  const isLive = req.query.live === 'true';
  const segmentDuration = 6;
  const segmentCount = isLive ? 10 : 100; // Sliding window for live

  let playlist = '#EXTM3U\\n';
  playlist += '#EXT-X-VERSION:6\\n';
  playlist += `#EXT-X-TARGETDURATION:${segmentDuration}\\n`;
  playlist += '#EXT-X-MEDIA-SEQUENCE:0\\n';
  playlist += '#EXT-X-PLAYLIST-TYPE:VOD\\n';
  playlist += '\\n';

  // Generate segment references
  for (let i = 0; i < segmentCount; i++) {
    playlist += `#EXTINF:${segmentDuration}.000,\\n`;
    playlist += `/segment/${contentId}/${qualityId}/${i}.ts\\n`;
  }

  if (!isLive) {
    playlist += '#EXT-X-ENDLIST\\n';
  }

  res.set({
    'Content-Type': 'application/vnd.apple.mpegurl',
    'Cache-Control': isLive ? 'no-cache' : 'max-age=3600',
    'X-CDN-Cache': 'HIT'
  });

  res.send(playlist);
});

/**
 * Segment delivery with byte-range support
 * Emulates CDN segment serving with partial content support
 */
app.get('/segment/:contentId/:qualityId/:segmentId.ts', (req, res) => {
  const { contentId, qualityId, segmentId } = req.params;
  const range = req.headers.range;

  // Simulate segment (in production, this would serve actual video files)
  const segmentSize = 1024 * 1024; // 1MB segments
  const mockSegment = Buffer.alloc(segmentSize);

  // Fill with pattern to simulate video data
  for (let i = 0; i < segmentSize; i++) {
    mockSegment[i] = (i + parseInt(segmentId)) % 256;
  }

  if (range) {
    // Handle byte-range requests for seeking
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : segmentSize - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${segmentSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp2t',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-CDN-Cache': 'HIT'
    });

    res.end(mockSegment.slice(start, end + 1));
  } else {
    // Full segment delivery
    res.writeHead(200, {
      'Content-Length': segmentSize,
      'Content-Type': 'video/mp2t',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-CDN-Cache': 'HIT',
      'X-Edge-Location': selectOptimalEdge(req.ip)
    });

    res.end(mockSegment);
  }

  // Track segment delivery
  trackAnalytics('segment_delivered', {
    contentId,
    qualityId,
    segmentId,
    byteRange: range || 'full',
    timestamp: Date.now()
  });
});

/**
 * Analytics endpoint - collects QoE metrics
 * Similar to Netflix's real-time analytics pipeline
 */
app.post('/analytics/events', (req, res) => {
  const { events } = req.body;
  const sessionId = req.headers['x-session-id'];

  events.forEach(event => {
    const enrichedEvent = {
      ...event,
      sessionId,
      serverTime: Date.now(),
      edge: selectOptimalEdge(req.ip)
    };

    analytics.push(enrichedEvent);

    // Update bandwidth estimate
    if (event.type === 'bandwidth_sample') {
      updateBandwidthEstimate(sessionId, event.bandwidth);
    }
  });

  // Calculate QoE score (Netflix-style)
  const qoeScore = calculateQoE(sessionId);

  res.json({
    received: events.length,
    qoeScore,
    recommendations: getStreamingRecommendations(sessionId)
  });
});

/**
 * Token validation endpoint
 * Simulates DRM license server token validation
 */
app.post('/auth/validate', (req, res) => {
  const { token, contentId, deviceId } = req.body;

  // Simulate token validation (in production, this would check against auth service)
  const isValid = token && token.length > 20;

  if (isValid) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour

    res.json({
      valid: true,
      sessionToken,
      expiresAt,
      allowedQualities: [0, 1, 2, 3, 4, 5], // Premium gets all qualities
      cdnToken: generateCDNToken(contentId, deviceId)
    });
  } else {
    res.status(403).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

/**
 * Bandwidth estimation endpoint
 * Returns optimal quality based on network conditions
 */
app.get('/bandwidth/estimate', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const currentBandwidth = bandwidthEstimates.get(sessionId) || 5000000;

  // Recommend quality based on bandwidth (0.7x safety factor)
  const recommendedQuality = qualityLadder
    .reverse()
    .find(q => q.bitrate <= currentBandwidth * 0.7) || qualityLadder[0];

  res.json({
    estimatedBandwidth: currentBandwidth,
    recommendedQuality: recommendedQuality.id,
    availableQualities: qualityLadder.map(q => ({
      id: q.id,
      bitrate: q.bitrate,
      resolution: q.resolution,
      viable: q.bitrate <= currentBandwidth * 0.9
    }))
  });
});

/**
 * Health check endpoint with CDN status
 */
app.get('/health', (req, res) => {
  const status = {
    service: 'healthy',
    timestamp: Date.now(),
    edges: Object.entries(edgeLocations).map(([location, data]) => ({
      location,
      latency: data.latency,
      capacity: data.capacity,
      status: data.capacity > 0.2 ? 'healthy' : 'degraded'
    })),
    activeSessions: sessions.size,
    analyticsEvents: analytics.length
  };

  res.json(status);
});

// Helper Functions

function selectOptimalEdge(clientIP) {
  // Simulate edge selection based on client location
  // In production, this would use GeoIP lookup
  const edges = Object.keys(edgeLocations);
  const randomEdge = edges[Math.floor(Math.random() * edges.length)];
  return randomEdge;
}

function filterQualitiesForDevice(deviceType, bandwidth) {
  let maxQuality = 7;

  switch (deviceType) {
    case 'mobile':
      maxQuality = 5; // Max 1080p30 for mobile
      break;
    case 'tablet':
      maxQuality = 6; // Max 1080p60 for tablets
      break;
    case 'smarttv':
      maxQuality = 7; // Full 4K for Smart TVs
      break;
  }

  return qualityLadder
    .filter(q => q.id <= maxQuality && q.bitrate <= bandwidth * 1.5);
}

function updateBandwidthEstimate(sessionId, bandwidth) {
  const current = bandwidthEstimates.get(sessionId) || bandwidth;
  // Exponential moving average
  const updated = current * 0.7 + bandwidth * 0.3;
  bandwidthEstimates.set(sessionId, updated);
}

function calculateQoE(sessionId) {
  // Simplified QoE calculation (0-5 scale)
  const session = sessions.get(sessionId);
  if (!session) return 3.0;

  const sessionAnalytics = analytics.filter(e => e.sessionId === sessionId);

  let score = 5.0;

  // Penalize rebuffering events
  const rebuffers = sessionAnalytics.filter(e => e.type === 'rebuffer').length;
  score -= rebuffers * 0.5;

  // Penalize quality switches
  const qualitySwitches = sessionAnalytics.filter(e => e.type === 'quality_switch').length;
  score -= qualitySwitches * 0.1;

  // Bonus for high quality
  const avgQuality = session.qualities.reduce((a, b) => a + b, 0) / session.qualities.length;
  score += (avgQuality / 7) * 0.5;

  return Math.max(0, Math.min(5, score));
}

function getStreamingRecommendations(sessionId) {
  const bandwidth = bandwidthEstimates.get(sessionId) || 5000000;
  const recommendations = [];

  if (bandwidth < 1000000) {
    recommendations.push('Consider lowering video quality for smoother playback');
  }

  if (bandwidth > 10000000) {
    recommendations.push('Network supports 4K streaming');
  }

  return recommendations;
}

function generateCDNToken(contentId, deviceId) {
  // Generate signed CDN token for content access
  const payload = {
    contentId,
    deviceId,
    exp: Date.now() + (3600 * 1000)
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎬 Dakota's Streaming Backend running on port ${PORT}`);
    console.log(`📡 Simulating CDN edge locations: ${Object.keys(edgeLocations).join(', ')}`);
    console.log(`📊 Analytics collection enabled`);
    console.log(`🔒 Token authentication active`);
    console.log(`\\nEndpoints:`);
    console.log(`  GET  /manifest/:contentId/master.m3u8 - Master playlist`);
    console.log(`  GET  /segment/:contentId/:quality/:id.ts - Video segments`);
    console.log(`  POST /analytics/events - Analytics collection`);
    console.log(`  POST /auth/validate - Token validation`);
    console.log(`  GET  /bandwidth/estimate - Bandwidth estimation`);
    console.log(`  GET  /health - Service health check`);
  });
}

// Export app for testing
module.exports = app;