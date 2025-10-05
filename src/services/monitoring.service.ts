/**
 * Monitoring Service Layer
 * Centralized error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export class MonitoringService {
  private static isInitialized = false;

  /**
   * Initialize Sentry monitoring
   */
  static init(dsn?: string) {
    if (this.isInitialized || !dsn) return;

    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });

    this.isInitialized = true;
  }

  /**
   * Log error with context
   */
  static captureError(error: Error, context?: ErrorContext) {
    console.error('Error:', error, context);

    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.component) {
        scope.setTag('component', context.component);
      }
      if (context?.action) {
        scope.setTag('action', context.action);
      }
      if (context?.metadata) {
        scope.setContext('metadata', context.metadata);
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Log performance metric
   */
  static trackPerformance(name: string, duration: number, metadata?: Record<string, unknown>) {
    console.log(`Performance: ${name} took ${duration}ms`, metadata);

    if (!this.isInitialized) return;

    // Track as custom event instead of metrics
    Sentry.addBreadcrumb({
      category: 'performance',
      message: name,
      level: 'info',
      data: {
        duration,
        ...metadata,
      },
    });
  }

  /**
   * Track API call
   */
  static async trackApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      this.trackPerformance(`api.${name}`, duration, context?.metadata);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.trackPerformance(`api.${name}.error`, duration, context?.metadata);
      this.captureError(error as Error, { ...context, action: name });
      
      throw error;
    }
  }

  /**
   * Set user context
   */
  static setUser(userId: string, email?: string) {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: userId,
      email,
    });
  }

  /**
   * Clear user context
   */
  static clearUser() {
    if (!this.isInitialized) return;

    Sentry.setUser(null);
  }
}
