/**
 * Master Playlist Endpoint - Vercel Serverless Function
 * /api/manifest/[contentId]/master.m3u8
 */

const crypto = require('crypto');
const {
  selectOptimalEdge,
  filterQualitiesForDevice,
  setCorsHeaders
} = require('../../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contentId } = req.query;
  const deviceType = req.headers['x-device-type'] || 'desktop';
  const bandwidth = parseInt(req.headers['x-bandwidth-estimate']) || 5000000;
  const sessionId = req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');

  // Select appropriate edge location
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const edge = selectOptimalEdge(clientIP);

  // Filter quality ladder based on device
  const availableQualities = filterQualitiesForDevice(deviceType, bandwidth);

  // Generate master playlist
  let manifest = '#EXTM3U\n';
  manifest += '#EXT-X-VERSION:6\n';
  manifest += `#EXT-X-SESSION-DATA:DATA-ID="edge.location",VALUE="${edge}"\n`;
  manifest += '\n';

  // Audio tracks
  manifest += '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",DEFAULT=YES,';
  manifest += 'AUTOSELECT=YES,LANGUAGE="en",URI="audio/en/index.m3u8"\n';
  manifest += '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Spanish",DEFAULT=NO,';
  manifest += 'AUTOSELECT=YES,LANGUAGE="es",URI="audio/es/index.m3u8"\n\n';

  // Video variants
  availableQualities.forEach(quality => {
    manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bitrate},`;
    manifest += `RESOLUTION=${quality.resolution},`;
    manifest += `FRAME-RATE=${quality.fps},`;
    manifest += `CODECS="${quality.codec},mp4a.40.2",`;
    manifest += 'AUDIO="audio"\n';
    manifest += `video/${quality.id}/index.m3u8\n\n`;
  });

  // Store session info
  global.sessions.set(sessionId, {
    contentId,
    deviceType,
    startTime: Date.now(),
    edge,
    qualities: availableQualities.map(q => q.id)
  });

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-CDN-Cache', 'MISS');
  res.setHeader('X-Edge-Location', edge);
  res.setHeader('X-Session-ID', sessionId);

  res.status(200).send(manifest);
}