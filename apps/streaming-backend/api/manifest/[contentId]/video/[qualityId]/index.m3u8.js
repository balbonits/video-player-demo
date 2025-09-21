/**
 * Variant Playlist Endpoint - Vercel Serverless Function
 * /api/manifest/[contentId]/video/[qualityId]/index.m3u8
 */

const { setCorsHeaders } = require('../../../../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contentId, qualityId } = req.query;
  const isLive = req.query.live === 'true';
  const segmentDuration = 6;
  const segmentCount = isLive ? 10 : 100; // Sliding window for live

  let playlist = '#EXTM3U\n';
  playlist += '#EXT-X-VERSION:6\n';
  playlist += `#EXT-X-TARGETDURATION:${segmentDuration}\n`;
  playlist += '#EXT-X-MEDIA-SEQUENCE:0\n';
  playlist += '#EXT-X-PLAYLIST-TYPE:VOD\n';
  playlist += '\n';

  // Generate segment references
  for (let i = 0; i < segmentCount; i++) {
    playlist += `#EXTINF:${segmentDuration}.000,\n`;
    playlist += `/api/segment/${contentId}/${qualityId}/${i}.ts\n`;
  }

  if (!isLive) {
    playlist += '#EXT-X-ENDLIST\n';
  }

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', isLive ? 'no-cache' : 'max-age=3600');
  res.setHeader('X-CDN-Cache', 'HIT');

  res.status(200).send(playlist);
}