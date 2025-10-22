/**
 * Hybrid Rate Limiting System
 *
 * Combines Redis (persistent, distributed) with In-Memory (fast, local)
 * for optimal performance and reliability.
 *
 * Strategy:
 * 1. Use in-memory cache for fast repeated checks (1-5 second cache)
 * 2. Use Redis as source of truth and for distributed coordination
 * 3. Fall back gracefully if Redis is unavailable
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ============================================================================
// IN-MEMORY CACHE (Fast Layer)
// ============================================================================

class InMemoryCache {
  constructor(ttlMs = 5000) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }

  // Periodic cleanup of expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instances for different use cases
const requestCache = new InMemoryCache(5000); // 5 second cache for rate limit checks
const redisHealthCache = new InMemoryCache(30000); // 30 second cache for Redis health

// Ensure timers run only once even in serverless environments
const globalTimers = globalThis.__HYBRID_RATE_LIMIT_TIMERS__ || {};

if (!globalTimers.cacheCleanup) {
  globalTimers.cacheCleanup = setInterval(() => {
    requestCache.cleanup();
    redisHealthCache.cleanup();
  }, 60000);
  globalTimers.cacheCleanup.unref?.();
}

// ============================================================================
// REDIS CONFIGURATION (Persistent Layer)
// ============================================================================

let redis = null;
let redisAvailable = true;

// Initialize Redis if configured
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Redis rate limiting enabled (Upstash)');
    }
  } catch (error) {
    console.error('❌ Redis initialization failed:', error.message);
    redisAvailable = false;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Redis not configured - using in-memory rate limiting only');
  }
  redisAvailable = false;
}

// Rate limiting configurations
const rateLimiters = redis ? {
  admin: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, '15 m'),
    analytics: true,
    prefix: 'ratelimit:admin',
  }),
  public: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'),
    analytics: true,
    prefix: 'ratelimit:public',
  }),
  auth: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  upload: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '60 m'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),
} : null;

// ============================================================================
// IN-MEMORY FALLBACK RATE LIMITER
// ============================================================================

class InMemoryRateLimiter {
  constructor() {
    this.requests = new Map();
  }

  check(identifier, limit, windowMs) {
    const now = Date.now();
    const key = identifier;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key);
    const windowStart = now - windowMs;

    // Filter out old requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= limit) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + windowMs;
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Add current request
    validRequests.push(now);

    return {
      success: true,
      limit,
      remaining: limit - validRequests.length,
      reset: now + windowMs,
    };
  }

  // Periodic cleanup
  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

if (!globalTimers.inMemoryCleanup) {
  globalTimers.inMemoryCleanup = setInterval(() => {
    inMemoryLimiter.cleanup();
  }, 5 * 60 * 1000);
  globalTimers.inMemoryCleanup.unref?.();
}

globalThis.__HYBRID_RATE_LIMIT_TIMERS__ = globalTimers;

// ============================================================================
// RATE LIMIT CONFIGURATIONS (By Tier)
// ============================================================================

const rateLimitConfig = {
  admin: { limit: 50, window: 15 * 60 * 1000 }, // 50 per 15 min
  public: { limit: 100, window: 15 * 60 * 1000 }, // 100 per 15 min
  auth: { limit: 5, window: 15 * 60 * 1000 }, // 5 per 15 min
  upload: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour
};

// ============================================================================
// HYBRID RATE LIMITING LOGIC
// ============================================================================

/**
 * Get client identifier with improved uniqueness
 */
function getClientIdentifier(request) {
  // 1. Try authenticated user ID
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const parts = token.split('.');

      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const userId = payload.sub || payload.userId || payload.user_id;

        if (userId) {
          return `user:${userId}`;
        }
      }
    } catch (error) {
      // Fall through to IP-based
    }
  }

  // 2. Use IP + User-Agent hash for better uniqueness
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') || 'unknown';

  const userAgent = request.headers.get('user-agent') || '';
  const uaHash = simpleHash(userAgent).substring(0, 8);

  return `ip:${ip}:ua:${uaHash}`;
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check Redis health (cached for 30 seconds)
 */
async function isRedisHealthy() {
  const cached = redisHealthCache.get('redis-health');
  if (cached !== null) return cached;

  if (!redis) {
    redisHealthCache.set('redis-health', false);
    return false;
  }

  try {
    // Quick health check (with timeout)
    const healthPromise = redis.ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000)
    );

    await Promise.race([healthPromise, timeoutPromise]);
    redisHealthCache.set('redis-health', true);
    return true;
  } catch (error) {
    redisHealthCache.set('redis-health', false);
    return false;
  }
}

/**
 * Hybrid Rate Limiting - Main Function
 *
 * Strategy:
 * 1. Check in-memory cache first (5 second TTL) - FAST
 * 2. If cache miss, check Redis - ACCURATE
 * 3. If Redis fails, use in-memory fallback - RESILIENT
 * 4. Cache result for next 5 seconds - PERFORMANT
 */
export async function applyRateLimit(request, type = 'public') {
  const identifier = getClientIdentifier(request);
  const cacheKey = `${type}:${identifier}`;

  // ========================================================================
  // STEP 1: Check in-memory cache (fastest)
  // ========================================================================
  const cached = requestCache.get(cacheKey);
  if (cached) {
    // Return cached result (skip Redis for performance)
    return {
      allowed: cached.allowed,
      headers: cached.headers,
      retryAfter: cached.retryAfter,
      source: 'cache', // For debugging
    };
  }

  // ========================================================================
  // STEP 2: Try Redis (if available and healthy)
  // ========================================================================
  if (redisAvailable && rateLimiters) {
    try {
      const limiter = rateLimiters[type] || rateLimiters.public;
      const { success, limit, reset, remaining } = await limiter.limit(identifier);

      const result = {
        allowed: success,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
          'X-RateLimit-Type': type,
          'X-RateLimit-Source': 'redis',
        },
        retryAfter: success ? null : Math.round((reset - Date.now()) / 1000),
      };

      // Cache the result for 5 seconds
      requestCache.set(cacheKey, result);

      return result;

    } catch (error) {
      // Redis failed - mark as unhealthy and fall through to in-memory
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Redis rate limit check failed:', error.message);
      }
      redisAvailable = false;
      redisHealthCache.set('redis-health', false);
    }
  }

  // ========================================================================
  // STEP 3: In-memory fallback (if Redis unavailable)
  // ========================================================================
  const config = rateLimitConfig[type] || rateLimitConfig.public;
  const inMemoryResult = inMemoryLimiter.check(identifier, config.limit, config.window);

  const result = {
    allowed: inMemoryResult.success,
    headers: {
      'X-RateLimit-Limit': inMemoryResult.limit.toString(),
      'X-RateLimit-Remaining': inMemoryResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(inMemoryResult.reset).toISOString(),
      'X-RateLimit-Type': type,
      'X-RateLimit-Source': 'in-memory',
    },
    retryAfter: inMemoryResult.success ? null :
                Math.round((inMemoryResult.reset - Date.now()) / 1000),
  };

  // Cache the in-memory result too (for consistency)
  requestCache.set(cacheKey, result);

  return result;
}

/**
 * Get rate limiting statistics (for monitoring)
 */
export function getRateLimitStats() {
  return {
    redisAvailable,
    redisConfigured: !!redis,
    cacheSize: requestCache.cache.size,
    inMemoryTracking: inMemoryLimiter.requests.size,
    environment: process.env.NODE_ENV,
  };
}

/**
 * Force refresh Redis health check
 */
export async function checkRedisHealth() {
  redisHealthCache.clear();
  return await isRedisHealthy();
}

/**
 * Clear all caches (for testing)
 */
export function clearCaches() {
  requestCache.clear();
  redisHealthCache.clear();
  inMemoryLimiter.requests.clear();
}

export { rateLimiters, inMemoryLimiter };
