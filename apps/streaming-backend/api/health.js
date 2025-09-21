/**
 * Health Check Endpoint - Vercel Serverless Function
 * /api/health
 */

const { edgeLocations, setCorsHeaders } = require('./_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = {
    service: 'healthy',
    timestamp: Date.now(),
    edges: Object.entries(edgeLocations).map(([location, data]) => ({
      location,
      latency: data.latency,
      capacity: data.capacity,
      status: data.capacity > 0.2 ? 'healthy' : 'degraded'
    })),
    activeSessions: global.sessions ? global.sessions.size : 0,
    analyticsEvents: global.analytics ? global.analytics.length : 0,
    deployment: 'vercel',
    environment: process.env.VERCEL_ENV || 'development'
  };

  res.status(200).json(status);
}