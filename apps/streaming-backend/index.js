/**
 * Vercel Entrypoint for Video Streaming Backend
 * This file exists to satisfy Vercel's entrypoint requirements
 * All functionality is handled by serverless functions in the /api directory
 */

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).json({
    service: 'Video Streaming Backend',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: 'vercel-serverless',
    endpoints: {
      health: '/api/health',
      manifest: '/api/manifest/{contentId}/master.m3u8',
      segments: '/api/segment/{contentId}/{qualityId}/{segmentId}.ts',
      analytics: '/api/analytics/events',
      auth: '/api/auth/validate',
      bandwidth: '/api/bandwidth/estimate'
    },
    documentation: 'https://github.com/balbonits/video-player-demo'
  });
});

module.exports = app;