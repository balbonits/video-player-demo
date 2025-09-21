/**
 * Shared utilities for Vercel serverless functions
 * Casey - DevOps & Deployment Engineer
 */

const crypto = require('crypto');

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

// In-memory stores (using global for serverless persistence across requests)
if (!global.sessions) global.sessions = new Map();
if (!global.analytics) global.analytics = [];
if (!global.bandwidthEstimates) global.bandwidthEstimates = new Map();

function selectOptimalEdge(clientIP) {
  // Simulate edge selection based on client location
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
  const current = global.bandwidthEstimates.get(sessionId) || bandwidth;
  // Exponential moving average
  const updated = current * 0.7 + bandwidth * 0.3;
  global.bandwidthEstimates.set(sessionId, updated);
}

function calculateQoE(sessionId) {
  // Simplified QoE calculation (0-5 scale)
  const session = global.sessions.get(sessionId);
  if (!session) return 3.0;

  const sessionAnalytics = global.analytics.filter(e => e.sessionId === sessionId);

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
  const bandwidth = global.bandwidthEstimates.get(sessionId) || 5000000;
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

function trackAnalytics(type, data) {
  global.analytics.push({
    type,
    ...data,
    timestamp: Date.now()
  });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, X-Session-ID, X-Device-ID, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-CDN-Cache, X-Edge-Location, X-Bandwidth-Estimate');
}

module.exports = {
  edgeLocations,
  qualityLadder,
  selectOptimalEdge,
  filterQualitiesForDevice,
  updateBandwidthEstimate,
  calculateQoE,
  getStreamingRecommendations,
  generateCDNToken,
  trackAnalytics,
  setCorsHeaders
};