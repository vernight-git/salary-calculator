/**
 * Monitoring and Error Tracking Configuration
 *
 * This file provides integration points for monitoring services like Sentry, DataDog, etc.
 * To enable, uncomment the relevant sections and add your configuration.
 */

export interface MonitoringConfig {
  dsn?: string;
  environment: 'development' | 'production' | 'staging';
  enabled: boolean;
  sampleRate?: number;
  tracesSampleRate?: number;
}

/**
 * Error tracking service integration
 * Uncomment and configure to enable error tracking in production
 */
export class ErrorTracking {
  private static instance: ErrorTracking;
  private config: MonitoringConfig;

  private constructor(config: MonitoringConfig) {
    this.config = config;
  }

  static initialize(config: MonitoringConfig): ErrorTracking {
    if (!ErrorTracking.instance) {
      ErrorTracking.instance = new ErrorTracking(config);

      // Example: Initialize Sentry
      // if (config.enabled && config.dsn) {
      //   Sentry.init({
      //     dsn: config.dsn,
      //     environment: config.environment,
      //     sampleRate: config.sampleRate || 1.0,
      //     tracesSampleRate: config.tracesSampleRate || 0.1,
      //   });
      // }
    }
    return ErrorTracking.instance;
  }

  /**
   * Capture an exception for error tracking
   * @param error - Error object to track
   * @param context - Additional context about the error
   */
  static captureException(error: Error, context?: Record<string, unknown>): void {
    if (!ErrorTracking.instance?.config.enabled) {
      console.error('Error:', error, context);
      return;
    }

    // Example: Send to Sentry
    // Sentry.captureException(error, {
    //   extra: context,
    // });

    // For now, just log to console
    console.error('Error captured:', error, context);
  }

  /**
   * Capture a message for logging
   * @param message - Message to log
   * @param level - Severity level
   * @param context - Additional context
   */
  static captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, unknown>
  ): void {
    if (!ErrorTracking.instance?.config.enabled) {
      console.log(`[${level}]`, message, context);
      return;
    }

    // Example: Send to Sentry
    // Sentry.captureMessage(message, {
    //   level: level as Sentry.SeverityLevel,
    //   extra: context,
    // });

    console.log(`[${level}]`, message, context);
  }

  /**
   * Set user context for error tracking
   * @param _user - User information (unused in base implementation)
   */
  static setUser(_user: { id?: string; email?: string; username?: string }): void {
    if (!ErrorTracking.instance?.config.enabled) {
      return;
    }

    // Example: Set Sentry user
    // Sentry.setUser(user);
  }

  /**
   * Add breadcrumb for debugging
   * @param message - Breadcrumb message
   * @param _category - Category of the breadcrumb
   * @param _level - Severity level
   */
  static addBreadcrumb(
    message: string,
    _category: string = 'action',
    _level: 'debug' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    if (!ErrorTracking.instance?.config.enabled) {
      return;
    }

    // Example: Add Sentry breadcrumb
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   level: level as Sentry.SeverityLevel,
    //   timestamp: Date.now() / 1000,
    // });

    console.log('Breadcrumb:', message);
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitoring {
  /**
   * Track a custom metric
   * @param metricName - Name of the metric
   * @param value - Metric value
   * @param tags - Additional tags for the metric
   */
  static trackMetric(metricName: string, value: number, tags?: Record<string, string>): void {
    // Example: Send to DataDog or similar
    // datadog.trackMetric(metricName, value, tags);

    console.log('Metric:', metricName, value, tags);
  }

  /**
   * Track page load time
   */
  static trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      PerformanceMonitoring.trackMetric('page.load.time', pageLoadTime, {
        page: window.location.pathname
      });
    });
  }

  /**
   * Track a custom timing
   * @param name - Name of the timing
   * @param duration - Duration in milliseconds
   */
  static trackTiming(name: string, duration: number): void {
    PerformanceMonitoring.trackMetric(`timing.${name}`, duration);
  }
}

/**
 * Analytics tracking
 */
export class Analytics {
  private static enabled = false;

  static initialize(): void {
    // Example: Initialize Google Analytics, Plausible, etc.
    // gtag('config', 'GA_MEASUREMENT_ID');
    Analytics.enabled = true;
  }

  /**
   * Track a page view
   * @param path - Page path
   */
  static trackPageView(path: string): void {
    if (!Analytics.enabled) return;

    // Example: Send to analytics service
    // gtag('event', 'page_view', { page_path: path });

    console.log('Page view:', path);
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event
   * @param properties - Event properties
   */
  static trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (!Analytics.enabled) return;

    // Example: Send to analytics service
    // gtag('event', eventName, properties);

    console.log('Event:', eventName, properties);
  }

  /**
   * Track calculation performed
   * @param taxClass - Tax class used
   * @param grossSalary - Gross salary amount
   */
  static trackCalculation(taxClass: string, grossSalary: number): void {
    Analytics.trackEvent('salary_calculation', {
      tax_class: taxClass,
      gross_salary_range: Math.floor(grossSalary / 1000) * 1000 // Anonymized
    });
  }
}

/**
 * Health check endpoint data
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    config: boolean;
    api: boolean;
  };
}

/**
 * Get application health status
 * Useful for monitoring and alerting systems
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const checks = {
    config: false,
    api: true // Static app, no API
  };

  // Check if config can be loaded
  try {
    const response = await fetch('/data/config.json', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    checks.config = response.ok;
  } catch {
    checks.config = false;
  }

  const allHealthy = Object.values(checks).every(Boolean);

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '0.0.1',
    checks
  };
}

// Initialize monitoring in production
if (import.meta.env.PROD) {
  ErrorTracking.initialize({
    environment: 'production',
    enabled: false, // Set to true and add DSN to enable
    sampleRate: 1.0,
    tracesSampleRate: 0.1
  });

  PerformanceMonitoring.trackPageLoad();
  Analytics.initialize();
} else {
  ErrorTracking.initialize({
    environment: 'development',
    enabled: true // Enable logging in development
  });
}
