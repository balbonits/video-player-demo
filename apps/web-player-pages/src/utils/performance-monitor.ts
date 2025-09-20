/**
 * Performance Monitoring Utilities
 * Enterprise-grade performance tracking for video streaming applications
 */

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint

  // Video-specific metrics
  timeToFirstFrame?: number;
  rebufferRatio?: number;
  qualitySwitches?: number;
  errorRate?: number;

  // Smart TV metrics
  memoryUsage?: number;
  cpuUsage?: number;
  inputLatency?: number;
}

interface PerformanceThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

// Performance thresholds optimized for Smart TV constraints
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 }
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private alerting: boolean = false;

  constructor() {
    this.initializeObservers();
    this.setupErrorTracking();
  }

  /**
   * Initialize performance observers for Core Web Vitals
   */
  private initializeObservers(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          this.metrics.LCP = lastEntry.startTime;
          this.checkThresholds('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.FID = entry.processingStart - entry.startTime;
            this.checkThresholds('FID', this.metrics.FID);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.CLS = clsValue;
          this.checkThresholds('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // Navigation timing for TTFB
      this.measureTTFB();
    }
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  private measureTTFB(): void {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
        this.checkThresholds('TTFB', this.metrics.TTFB);
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  /**
   * Track video-specific performance metrics
   */
  public trackVideoMetrics(videoElement: HTMLVideoElement): () => void {
    const startTime = performance.now();
    let firstFrameTime: number | null = null;
    let rebufferCount = 0;
    let qualitySwitchCount = 0;

    // Time to first frame
    const handleLoadedData = () => {
      if (!firstFrameTime) {
        firstFrameTime = performance.now() - startTime;
        this.metrics.timeToFirstFrame = firstFrameTime;
        this.reportMetric('timeToFirstFrame', firstFrameTime);
      }
    };

    // Rebuffering tracking
    const handleWaiting = () => {
      rebufferCount++;
      this.metrics.rebufferRatio = rebufferCount / (videoElement.currentTime || 1);
      this.reportMetric('rebufferEvent', rebufferCount);
    };

    // Quality switch tracking (for HLS.js integration)
    if ('hlsjs' in window) {
      // This would be integrated with HLS.js events
      this.setupHLSMetrics();
    }

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('waiting', handleWaiting);

    // Cleanup function
    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('waiting', handleWaiting);
    };
  }

  /**
   * Setup HLS.js specific metrics tracking
   */
  private setupHLSMetrics(): void {
    // This would integrate with HLS.js events when available
    // hls.on(Hls.Events.LEVEL_SWITCHED, () => qualitySwitchCount++);
    // hls.on(Hls.Events.ERROR, (event, data) => this.trackError(data));
  }

  /**
   * Track Smart TV specific metrics
   */
  public trackSmartTVMetrics(): void {
    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB

        // Alert if memory usage exceeds 100MB (Smart TV constraint)
        if (this.metrics.memoryUsage > 100) {
          this.triggerAlert('High memory usage detected', {
            memoryUsage: this.metrics.memoryUsage,
            threshold: 100
          });
        }
      }, 5000);
    }

    // Input latency tracking
    this.trackInputLatency();
  }

  /**
   * Track input latency for Smart TV navigation
   */
  private trackInputLatency(): void {
    let inputStartTime: number;

    document.addEventListener('keydown', () => {
      inputStartTime = performance.now();
    });

    document.addEventListener('keyup', () => {
      if (inputStartTime) {
        const latency = performance.now() - inputStartTime;
        this.metrics.inputLatency = latency;

        // Alert if input latency exceeds 150ms (Smart TV UX threshold)
        if (latency > 150) {
          this.triggerAlert('High input latency detected', {
            latency,
            threshold: 150
          });
        }
      }
    });
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  private checkThresholds(metric: keyof PerformanceThresholds, value: number): void {
    const thresholds = PERFORMANCE_THRESHOLDS[metric];
    if (!thresholds) return;

    if (value > thresholds.poor) {
      this.triggerAlert(`Poor ${metric} performance detected`, {
        metric,
        value,
        threshold: thresholds.poor,
        status: 'poor'
      });
    } else if (value > thresholds.good) {
      this.reportMetric(metric, value, 'needs-improvement');
    } else {
      this.reportMetric(metric, value, 'good');
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled-promise',
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  /**
   * Track application errors
   */
  private trackError(error: any): void {
    const errorData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...error
    };

    // Send to analytics endpoint
    this.sendToAnalytics('error', errorData);

    // Trigger alert for critical errors
    if (error.type === 'javascript' || error.severity === 'critical') {
      this.triggerAlert('Critical error detected', errorData);
    }
  }

  /**
   * Trigger performance alerts
   */
  private triggerAlert(message: string, data: any): void {
    if (!this.alerting) return;

    console.warn(`[Performance Alert] ${message}`, data);

    // In production, this would send to monitoring service
    this.sendToAnalytics('alert', {
      message,
      data,
      timestamp: new Date().toISOString(),
      severity: 'warning'
    });
  }

  /**
   * Report metrics to analytics
   */
  private reportMetric(name: string, value: number, rating?: string): void {
    const metricData = {
      name,
      value,
      rating,
      timestamp: new Date().toISOString(),
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType()
    };

    this.sendToAnalytics('metric', metricData);
  }

  /**
   * Send data to analytics endpoint
   */
  private sendToAnalytics(type: string, data: any): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics - ${type}]`, data);
      return;
    }

    // In production, send to analytics service
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({ type, data });
      navigator.sendBeacon('/api/analytics', payload);
    } else {
      // Fallback for older browsers
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
        keepalive: true
      }).catch(error => console.warn('Analytics failed:', error));
    }
  }

  /**
   * Detect device type for Smart TV optimization
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('smart-tv') || userAgent.includes('smarttv')) {
      return 'smart-tv';
    } else if (userAgent.includes('roku')) {
      return 'roku';
    } else if (userAgent.includes('tizen')) {
      return 'tizen';
    } else if (userAgent.includes('mobile')) {
      return 'mobile';
    } else if (userAgent.includes('tablet')) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Get connection type for adaptive optimization
   */
  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Enable alerting system
   */
  public enableAlerting(): void {
    this.alerting = true;
  }

  /**
   * Disable alerting system
   */
  public disableAlerting(): void {
    this.alerting = false;
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      deviceInfo: {
        userAgent: navigator.userAgent,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        screen: {
          width: screen.width,
          height: screen.height,
          pixelRatio: window.devicePixelRatio
        }
      },
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        memory: 'memory' in performance ? (performance as any).memory : null
      }
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Cleanup observers and event listeners
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetrics, PerformanceThresholds };