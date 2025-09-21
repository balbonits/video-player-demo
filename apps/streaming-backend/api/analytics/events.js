/**
 * Analytics Events Endpoint - Vercel Serverless Function
 * /api/analytics/events
 */

const {
  selectOptimalEdge,
  updateBandwidthEstimate,
  calculateQoE,
  getStreamingRecommendations,
  setCorsHeaders
} = require('../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { events } = req.body;
  const sessionId = req.headers['x-session-id'];

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid events data' });
  }

  events.forEach(event => {
    const enrichedEvent = {
      ...event,
      sessionId,
      serverTime: Date.now(),
      edge: selectOptimalEdge(req.headers['x-forwarded-for'])
    };

    global.analytics.push(enrichedEvent);

    // Update bandwidth estimate
    if (event.type === 'bandwidth_sample') {
      updateBandwidthEstimate(sessionId, event.bandwidth);
    }
  });

  // Calculate QoE score (Netflix-style)
  const qoeScore = calculateQoE(sessionId);

  res.status(200).json({
    received: events.length,
    qoeScore,
    recommendations: getStreamingRecommendations(sessionId)
  });
}