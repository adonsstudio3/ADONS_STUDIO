/**
 * Security Configuration
 */

// Content Security Policy
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    'https://www.youtube.com',
    'https://player.vimeo.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://*.googleapis.com',
    'https://*.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co',
    'https://img.youtube.com',
    'https://i.vimeocdn.com'
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://api.github.com'
  ],
  'font-src': [
    "'self'",
    'https://*.googleapis.com',
    'https://*.gstatic.com'
  ]
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// File upload security
export const fileUploadSecurity = {
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: ['application/pdf', 'text/plain']
  },
  maxFileSizes: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 5 * 1024 * 1024 // 5MB
  }
};

export default cspConfig;
