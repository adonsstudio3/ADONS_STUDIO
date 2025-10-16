/**
 * Rate Limiting Configuration
 * Deployed for ADONS Studio Production
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configure Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiting configurations by endpoint type
const rateLimiters = {
  // Admin API endpoints - stricter limits
  admin: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, '15 m'), // 50 requests per 15 minutes
    analytics: true,
  }),

  // Public API endpoints - more lenient
  public: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 minutes
    analytics: true,
  }),

  // Authentication endpoints - very strict
  auth: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 login attempts per 15 minutes
    analytics: true,
  }),

  // File upload endpoints - moderate limits
  upload: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '60 m'), // 10 uploads per hour
    analytics: true,
  }),
};

/**
 * Apply rate limiting to request
 */
export async function applyRateLimit(request, type = 'public') {
  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[type] || rateLimiters.public;

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
      'X-RateLimit-Type': type,
    };

    return {
      allowed: success,
      headers,
      retryAfter: success ? null : Math.round((reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true, headers: {}, retryAfter: null };
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request) {
  // Priority order: authenticated user ID > IP address > forwarded IP
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `user:${payload.userId}`;
    } catch (error) {
      // Invalid token, fall back to IP
    }
  }

  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

export { rateLimiters };