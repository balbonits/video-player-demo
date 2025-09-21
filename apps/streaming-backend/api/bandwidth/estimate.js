/**
 * Bandwidth Estimation Endpoint - Vercel Serverless Function
 * /api/bandwidth/estimate
 */

const { qualityLadder, setCorsHeaders } = require('../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.headers['x-session-id'];
  const currentBandwidth = global.bandwidthEstimates.get(sessionId) || 5000000;

  // Recommend quality based on bandwidth (0.7x safety factor)
  const recommendedQuality = qualityLadder
    .slice()
    .reverse()
    .find(q => q.bitrate <= currentBandwidth * 0.7) || qualityLadder[0];

  res.status(200).json({
    estimatedBandwidth: currentBandwidth,
    recommendedQuality: recommendedQuality.id,
    availableQualities: qualityLadder.map(q => ({
      id: q.id,
      bitrate: q.bitrate,
      resolution: q.resolution,
      viable: q.bitrate <= currentBandwidth * 0.9
    }))
  });
}