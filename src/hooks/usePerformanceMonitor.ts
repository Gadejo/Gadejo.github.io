import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  loadTime: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  logThreshold?: number; // Log warnings if render time exceeds this (ms)
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor({
  componentName,
  logThreshold = 50, // More realistic threshold for complex components
  onMetrics
}: UsePerformanceMonitorOptions) {
  const renderStartTime = useRef<number>(0);
  const componentCount = useRef<number>(0);
  const mountTime = useRef<number>(Date.now());

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance measurement and log results
  const endMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    componentCount.current += 1;

    const metrics: PerformanceMetrics = {
      renderTime,
      componentCount: componentCount.current,
      loadTime: Date.now() - mountTime.current
    };

    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
    }

    // Performance logging disabled to reduce console noise
    // Log warning if render time exceeds threshold
    // if (renderTime > logThreshold) {
    //   console.warn(
    //     `Performance Warning: ${componentName} render took ${renderTime.toFixed(2)}ms (threshold: ${logThreshold}ms)`,
    //     metrics
    //   );
    // } else {
    //   console.debug(
    //     `Performance: ${componentName} rendered in ${renderTime.toFixed(2)}ms`,
    //     metrics
    //   );
    // }

    onMetrics?.(metrics);
  }, [componentName, logThreshold, onMetrics]);

  // Monitor component lifecycle
  useEffect(() => {
    startMeasurement();
    return endMeasurement;
  });

  // Measure initial mount time
  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    console.debug(`${componentName} mounted in ${mountDuration}ms`);
  }, [componentName]);

  return {
    startMeasurement,
    endMeasurement,
    getMetrics: () => ({
      renderTime: performance.now() - renderStartTime.current,
      componentCount: componentCount.current,
      loadTime: Date.now() - mountTime.current,
      memoryUsage: 'memory' in performance ? (performance as any).memory.usedJSHeapSize : undefined
    })
  };
}

// Global performance tracking
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackMetric(componentName: string, metrics: PerformanceMetrics) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    
    const componentMetrics = this.metrics.get(componentName)!;
    componentMetrics.push({
      ...metrics,
      renderTime: Number(metrics.renderTime.toFixed(2))
    });

    // Keep only the last 100 measurements to prevent memory leaks
    if (componentMetrics.length > 100) {
      componentMetrics.shift();
    }
  }

  getMetrics(componentName?: string): Map<string, PerformanceMetrics[]> | PerformanceMetrics[] {
    if (componentName) {
      return this.metrics.get(componentName) || [];
    }
    return this.metrics;
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.get(componentName);
    if (!componentMetrics || componentMetrics.length === 0) return 0;

    const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / componentMetrics.length;
  }

  getSlowestComponents(limit: number = 5): Array<{ name: string; avgRenderTime: number }> {
    const componentStats: Array<{ name: string; avgRenderTime: number }> = [];

    this.metrics.forEach((_metricsArray, name) => {
      const avgRenderTime = this.getAverageRenderTime(name);
      componentStats.push({ name, avgRenderTime });
    });

    return componentStats
      .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      .slice(0, limit);
  }

  clear() {
    this.metrics.clear();
  }
}

export const performanceTracker = PerformanceTracker.getInstance();