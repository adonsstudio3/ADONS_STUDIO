/**
 * Simple Next.js Middleware with In-Memory Rate Limiting
 * Production-ready without external dependencies
 */

import { NextResponse } from 'next/server';

// In-memory rate limiting store
const rateLimitStore = new Map();

// Rate limit configurations
const rateLimits = {
  admin: { requests: 20, windowMs: 15 * 60 * 1000 }, // 20 requests per 15 minutes
  auth: { requests: 5, windowMs: 15 * 60 * 1000 },   // 5 requests per 15 minutes
  public: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  upload: { requests: 10, windowMs: 60 * 60 * 1000 }   // 10 requests per hour
};

function getClientIdentifier(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function checkRateLimit(identifier, type = 'public') {
  const now = Date.now();
  const config = rateLimits[type] || rateLimits.public;
  const windowStart = now - config.windowMs;
  
  const key = `${identifier}:${type}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // Remove expired requests
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= config.requests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] - windowStart) / 1000)
    };
  }
  
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  return { allowed: true };
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') // Static files like .css, .js, .ico
  ) {
    return NextResponse.next();
  }

  // Determine rate limit type based on route
  let rateLimitType = 'public';
  if (pathname.startsWith('/api/admin')) {
    rateLimitType = 'admin';
  } else if (pathname.includes('/auth') || pathname.includes('/login')) {
    rateLimitType = 'auth';
  } else if (pathname.includes('/upload')) {
    rateLimitType = 'upload';
  }

  // Apply rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(identifier, rateLimitType);

  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter,
        type: rateLimitType
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter.toString()
        }
      }
    );
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};