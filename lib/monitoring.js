/**
 * Monitoring and Logging System
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export class ActivityLogger {
  static async log(userId, action, details = {}) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: details.resourceType,
          resource_id: details.resourceId,
          details: details.metadata || {},
          ip_address: details.ipAddress,
          user_agent: details.userAgent,
        });

      if (error) {
        console.error('Activity logging error:', error);
      }
    } catch (err) {
      console.error('Activity logger exception:', err);
    }
  }
}

export class PerformanceMonitor {
  static startTimer(label) {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        this.logPerformance(label, duration);
        return duration;
      }
    };
  }

  static logPerformance(operation, duration, metadata = {}) {
    if (duration > 1000) {
      console.warn('Slow operation detected:', operation, 'took', duration + 'ms', metadata);
    }
  }
}

export class ErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      environment: process.env.NODE_ENV,
    };

    console.error('Error handled:', errorInfo);
    return this.formatErrorResponse(error, context);
  }

  static formatErrorResponse(error, context) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment && error.message.includes('internal')) {
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: error.stack, context })
    };
  }
}

export const logger = ActivityLogger;
export const monitor = PerformanceMonitor;
export const errorHandler = ErrorHandler;
