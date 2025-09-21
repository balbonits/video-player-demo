/**
 * Auth Validation Endpoint - Vercel Serverless Function
 * /api/auth/validate
 */

const crypto = require('crypto');
const { generateCDNToken, setCorsHeaders } = require('../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, contentId, deviceId } = req.body;

  if (!token || !contentId || !deviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulate token validation (in production, this would check against auth service)
  const isValid = token && token.length > 20;

  if (isValid) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour

    res.status(200).json({
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
}