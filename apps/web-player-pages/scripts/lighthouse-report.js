/**
 * Custom Lighthouse Performance Reporting for Video Players
 *
 * This script demonstrates investigative performance analysis techniques
 * specifically for video streaming applications.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

// Custom video streaming audits
const videoStreamingAudits = {
  'video-initial-load': {
    title: 'Video Initial Load Time',
    description: 'Measures time from page load to first video frame',
    failureTitle: 'Video took too long to start',
    requiredArtifacts: ['traces', 'devtoolsLogs']
  },
  'buffer-health': {
    title: 'Video Buffer Health',
    description: 'Analyzes buffer behavior and rebuffering events',
    failureTitle: 'Video experienced buffering issues',
    requiredArtifacts: ['traces', 'devtoolsLogs']
  },
  'adaptive-bitrate': {
    title: 'Adaptive Bitrate Switching',
    description: 'Monitors quality changes and adaptation logic',
    failureTitle: 'Poor adaptive streaming behavior',
    requiredArtifacts: ['traces', 'devtoolsLogs']
  },
  'memory-usage': {
    title: 'Video Memory Consumption',
    description: 'Tracks memory usage during video playback',
    failureTitle: 'Excessive memory consumption detected',
    requiredArtifacts: ['traces', 'devtoolsLogs']
  }
};

// Performance configurations for different scenarios
const performanceProfiles = {
  smartTV: {
    name: 'Smart TV Profile',
    config: {
      throttling: {
        cpuSlowdownMultiplier: 6,
        requestLatency: 200,
        downloadThroughput: 5 * 1024 * 1024 / 8 // 5 Mbps
      },
      emulation: {
        memoryLimit: 100 * 1024 * 1024, // 100MB limit
        cpuThrottling: 6
      }
    }
  },
  mobile: {
    name: 'Mobile 3G Profile',
    config: {
      throttling: {
        cpuSlowdownMultiplier: 4,
        requestLatency: 300,
        downloadThroughput: 1.5 * 1024 * 1024 / 8 // 1.5 Mbps
      }
    }
  },
  desktop: {
    name: 'Desktop Broadband',
    config: {
      throttling: {
        cpuSlowdownMultiplier: 1,
        requestLatency: 40,
        downloadThroughput: 10 * 1024 * 1024 / 8 // 10 Mbps
      }
    }
  }
};

async function launchChromeAndRunLighthouse(url, opts = {}, config = null) {
  const chrome = await chromeLauncher.launch({ chromeFlags: opts.chromeFlags });
  opts.port = chrome.port;

  const runnerResult = await lighthouse(url, opts, config);

  // Extract video-specific metrics
  const videoMetrics = extractVideoMetrics(runnerResult);

  await chrome.kill();

  return {
    report: runnerResult.report,
    lhr: runnerResult.lhr,
    videoMetrics
  };
}

function extractVideoMetrics(runnerResult) {
  const { lhr } = runnerResult;
  const metrics = {
    performance: {},
    videoSpecific: {},
    network: {},
    memory: {}
  };

  // Core Web Vitals
  if (lhr.audits) {
    metrics.performance = {
      FCP: lhr.audits['first-contentful-paint']?.numericValue,
      LCP: lhr.audits['largest-contentful-paint']?.numericValue,
      TBT: lhr.audits['total-blocking-time']?.numericValue,
      CLS: lhr.audits['cumulative-layout-shift']?.numericValue,
      TTI: lhr.audits['interactive']?.numericValue,
      SpeedIndex: lhr.audits['speed-index']?.numericValue
    };

    // Network metrics
    metrics.network = {
      totalBytes: lhr.audits['total-byte-weight']?.numericValue,
      requests: lhr.audits['network-requests']?.details?.items?.length || 0,
      serverResponseTime: lhr.audits['server-response-time']?.numericValue
    };

    // Memory and DOM metrics
    metrics.memory = {
      domSize: lhr.audits['dom-size']?.numericValue,
      jsHeapUsage: lhr.audits['js-heap-usage']?.numericValue,
      totalTaskTime: lhr.audits['mainthread-work-breakdown']?.numericValue
    };
  }

  // Extract video-specific data from traces
  if (lhr.artifacts?.traces) {
    const trace = lhr.artifacts.traces.defaultPass;
    metrics.videoSpecific = analyzeVideoTrace(trace);
  }

  return metrics;
}

function analyzeVideoTrace(trace) {
  const videoMetrics = {
    videoLoadTime: null,
    bufferEvents: 0,
    qualitySwitches: 0,
    droppedFrames: 0,
    rebufferingTime: 0
  };

  // Analyze trace events for video-specific metrics
  const videoEvents = trace.traceEvents.filter(event =>
    event.name?.includes('Video') ||
    event.name?.includes('Media') ||
    event.cat?.includes('media')
  );

  // Count buffer and quality events
  videoEvents.forEach(event => {
    if (event.name?.includes('Buffer')) {
      videoMetrics.bufferEvents++;
    }
    if (event.name?.includes('Quality') || event.name?.includes('Resolution')) {
      videoMetrics.qualitySwitches++;
    }
  });

  return videoMetrics;
}

async function generateDetailedReport(url, profile) {
  console.log(`\n🔍 Analyzing ${url} with ${profile.name}...`);

  const opts = {
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    logLevel: 'error',
    output: 'json',
    throttling: profile.config.throttling,
    emulatedUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Smart-TV'
  };

  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      throttling: profile.config.throttling,
      screenEmulation: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      }
    }
  };

  try {
    const results = await launchChromeAndRunLighthouse(url, opts, config);

    // Generate report filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, '..', 'lighthouse-reports', `${profile.name}-${timestamp}.json`);

    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    // Save detailed report
    await fs.writeFile(reportPath, JSON.stringify({
      url,
      profile: profile.name,
      timestamp,
      metrics: results.videoMetrics,
      lighthouse: results.lhr
    }, null, 2));

    // Print summary
    console.log(`\n📊 Performance Summary for ${profile.name}:`);
    console.log('─'.repeat(50));

    const { performance, network, memory, videoSpecific } = results.videoMetrics;

    console.log('Core Web Vitals:');
    console.log(`  FCP: ${formatTime(performance.FCP)} ${getEmoji(performance.FCP, 2000, 4000)}`);
    console.log(`  LCP: ${formatTime(performance.LCP)} ${getEmoji(performance.LCP, 2500, 4000)}`);
    console.log(`  TBT: ${formatTime(performance.TBT)} ${getEmoji(performance.TBT, 300, 600)}`);
    console.log(`  CLS: ${performance.CLS?.toFixed(3)} ${getEmoji(performance.CLS, 0.1, 0.25)}`);

    console.log('\nNetwork Performance:');
    console.log(`  Total Size: ${formatBytes(network.totalBytes)} ${getEmoji(network.totalBytes, 2000000, 5000000)}`);
    console.log(`  Requests: ${network.requests}`);
    console.log(`  Server Response: ${formatTime(network.serverResponseTime)}`);

    console.log('\nMemory & Resources:');
    console.log(`  DOM Size: ${memory.domSize} nodes ${getEmoji(memory.domSize, 800, 1500)}`);
    console.log(`  Main Thread Work: ${formatTime(memory.totalTaskTime)}`);

    if (videoSpecific.bufferEvents > 0 || videoSpecific.qualitySwitches > 0) {
      console.log('\nVideo Streaming Metrics:');
      console.log(`  Buffer Events: ${videoSpecific.bufferEvents}`);
      console.log(`  Quality Switches: ${videoSpecific.qualitySwitches}`);
    }

    console.log('\n✅ Report saved to:', reportPath);

    return results;
  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    return null;
  }
}

// Helper functions
function formatTime(ms) {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatBytes(bytes) {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function getEmoji(value, goodThreshold, badThreshold) {
  if (!value) return '❓';
  if (value <= goodThreshold) return '✅';
  if (value <= badThreshold) return '⚠️';
  return '❌';
}

// Main execution
async function runPerformanceAnalysis() {
  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/hls',
    'http://localhost:3000/mobile',
    'http://localhost:3000/roku'
  ];

  console.log('🚀 Video Player Performance Analysis');
  console.log('=' .repeat(50));
  console.log('Testing video streaming performance across different profiles');
  console.log('to identify optimization opportunities for Smart TV deployment.\n');

  for (const url of urls) {
    for (const [key, profile] of Object.entries(performanceProfiles)) {
      await generateDetailedReport(url, profile);

      // Add delay between tests to avoid resource conflicts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🎯 Analysis Complete!');
  console.log('Review lighthouse-reports/ directory for detailed results.');
}

// Export for programmatic use
module.exports = {
  launchChromeAndRunLighthouse,
  extractVideoMetrics,
  analyzeVideoTrace,
  generateDetailedReport,
  performanceProfiles,
  runPerformanceAnalysis
};

// Run if called directly
if (require.main === module) {
  runPerformanceAnalysis().catch(console.error);
}