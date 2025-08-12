/**
 * Performance Service - Global performance monitoring and optimization
 * Provides centralized performance tracking, metrics collection, and optimization
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'render' | 'network' | 'memory' | 'user-interaction';
}

interface PerformanceThresholds {
  renderTime: number;
  networkTime: number;
  memoryUsage: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds;
  private observers: Set<PerformanceObserver> = new Set();

  private constructor() {
    this.thresholds = {
      renderTime: 16.67, // 60fps
      networkTime: 1000, // 1 second
      memoryUsage: 50 * 1024 * 1024, // 50MB
      fcp: 2500,
      lcp: 4000,
      fid: 100,
      cls: 0.1
    };

    this.initializeWebVitals();
    this.startResourceMonitoring();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Initialize Core Web Vitals monitoring
  private initializeWebVitals() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('first-contentful-paint', entry.startTime, 'render');
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.add(fcpObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('largest-contentful-paint', lastEntry.startTime, 'render');
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.add(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // First input delay entry has processingStart
          if (fidEntry.processingStart) {
            const fid = fidEntry.processingStart - entry.startTime;
            this.recordMetric('first-input-delay', fid, 'user-interaction');
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.add(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cumulative-layout-shift', clsValue, 'render');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.add(clsObserver);

    } catch (error) {
      console.warn('Error initializing performance observers:', error);
    }
  }

  // Monitor resource loading
  private startResourceMonitoring() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as any; // Resource entries have responseEnd
          if (resourceEntry.responseEnd) {
            const loadTime = resourceEntry.responseEnd - entry.startTime;
            this.recordMetric(`resource-${entry.name}`, loadTime, 'network');
            
            // Log slow resources
            if (loadTime > this.thresholds.networkTime) {
              console.warn(`Slow resource loading: ${entry.name} took ${loadTime.toFixed(2)}ms`);
            }
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.add(resourceObserver);
    } catch (error) {
      console.warn('Error initializing resource observer:', error);
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, category: PerformanceMetric['category']) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check thresholds and log warnings
    this.checkThresholds(metric);
  }

  // Check if metric exceeds thresholds
  private checkThresholds(metric: PerformanceMetric) {
    let threshold: number | undefined;
    
    switch (metric.name) {
      case 'first-contentful-paint':
        threshold = this.thresholds.fcp;
        break;
      case 'largest-contentful-paint':
        threshold = this.thresholds.lcp;
        break;
      case 'first-input-delay':
        threshold = this.thresholds.fid;
        break;
      case 'cumulative-layout-shift':
        threshold = this.thresholds.cls;
        break;
      default:
        if (metric.category === 'render') {
          threshold = this.thresholds.renderTime;
        } else if (metric.category === 'network') {
          threshold = this.thresholds.networkTime;
        }
    }

    if (threshold && metric.value > threshold) {
      console.warn(
        `Performance threshold exceeded: ${metric.name} = ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }

  // Get performance metrics
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(metric => metric.category === category);
    }
    return [...this.metrics];
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const filteredMetrics = this.metrics.filter(metric => metric.name === name);
    if (filteredMetrics.length === 0) return 0;
    
    const sum = filteredMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / filteredMetrics.length;
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      categories: {
        render: this.getMetrics('render').length,
        network: this.getMetrics('network').length,
        memory: this.getMetrics('memory').length,
        userInteraction: this.getMetrics('user-interaction').length
      },
      averages: {
        fcp: this.getAverageMetric('first-contentful-paint'),
        lcp: this.getAverageMetric('largest-contentful-paint'),
        fid: this.getAverageMetric('first-input-delay'),
        cls: this.getAverageMetric('cumulative-layout-shift')
      },
      memory: this.getCurrentMemoryUsage(),
      thresholdViolations: this.getThresholdViolations()
    };

    return summary;
  }

  // Get current memory usage
  getCurrentMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Get threshold violations
  private getThresholdViolations(): Array<{ metric: string; count: number }> {
    const violations: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      let exceeded = false;
      
      switch (metric.name) {
        case 'first-contentful-paint':
          exceeded = metric.value > this.thresholds.fcp;
          break;
        case 'largest-contentful-paint':
          exceeded = metric.value > this.thresholds.lcp;
          break;
        case 'first-input-delay':
          exceeded = metric.value > this.thresholds.fid;
          break;
        case 'cumulative-layout-shift':
          exceeded = metric.value > this.thresholds.cls;
          break;
      }
      
      if (exceeded) {
        violations[metric.name] = (violations[metric.name] || 0) + 1;
      }
    });

    return Object.entries(violations).map(([metric, count]) => ({ metric, count }));
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime, 'render');
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}-error`, endTime - startTime, 'render');
      throw error;
    }
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime, 'network');
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}-error`, endTime - startTime, 'network');
      throw error;
    }
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting performance observer:', error);
      }
    });
    this.observers.clear();
    this.metrics = [];
  }
}

export const performanceService = PerformanceService.getInstance();
export { PerformanceService };
export type { PerformanceMetric, PerformanceThresholds };