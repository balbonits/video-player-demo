/**
 * Segment Delivery Endpoint - Vercel Serverless Function
 * /api/segment/[contentId]/[qualityId]/[segmentId].ts
 */

const { selectOptimalEdge, trackAnalytics, setCorsHeaders } = require('../../../../_utils');

module.exports = function handler(req, res) {
  // Handle CORS preflight
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contentId, qualityId, segmentId } = req.query;
  const range = req.headers.range;
  const segmentIdNumber = segmentId.replace('.ts', '');

  // Simulate segment (in production, this would serve actual video files)
  const segmentSize = 1024 * 1024; // 1MB segments
  const mockSegment = Buffer.alloc(segmentSize);

  // Fill with pattern to simulate video data
  for (let i = 0; i < segmentSize; i++) {
    mockSegment[i] = (i + parseInt(segmentIdNumber)) % 256;
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
      'X-Edge-Location': selectOptimalEdge(req.headers['x-forwarded-for'])
    });

    res.end(mockSegment);
  }

  // Track segment delivery
  trackAnalytics('segment_delivered', {
    contentId,
    qualityId,
    segmentId: segmentIdNumber,
    byteRange: range || 'full',
    timestamp: Date.now()
  });
}