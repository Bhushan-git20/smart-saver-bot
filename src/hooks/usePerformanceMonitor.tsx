import { useEffect, useRef } from 'react';
import { MonitoringService } from '@/services/monitoring.service';

interface PerformanceMetrics {
  componentName: string;
  threshold?: number; // ms
}

/**
 * Hook to monitor component render performance
 */
export const usePerformanceMonitor = ({ componentName, threshold = 100 }: PerformanceMetrics) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;

    // Track slow renders
    if (renderTime > threshold && renderCount.current > 1) {
      MonitoringService.trackPerformance(
        `${componentName}-render`,
        renderTime,
        { renderCount: renderCount.current, threshold }
      );
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook to prefetch data for better UX
 */
export const usePrefetch = () => {
  const prefetchData = async <T,>(
    queryKey: unknown[],
    fetcher: () => Promise<T>,
    queryClient: any
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: fetcher,
      staleTime: 30000,
    });
  };

  return { prefetchData };
};
