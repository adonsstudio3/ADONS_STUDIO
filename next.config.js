/**
 * Comprehensive Next.js config with SEO optimizations, modern image formats,
 * and performance enhancements for ADONS Studio website.
 */
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // SEO-friendly image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 960, 1280, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Helpful when workspace has nested package locks
  outputFileTracingRoot: path.resolve(__dirname),
  
  // SEO-friendly redirects
  async redirects() {
    return [
      { source: '/portfolio', destination: '/projects', permanent: true },
      { source: '/showreel', destination: '/projects', permanent: true },
    ]
  },
  
  // SEO-friendly headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://tagmanager.google.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://www.google-analytics.com https://analytics.google.com https://*.upstash.io https://api.resend.com wss://*.supabase.co wss://*.supabase.in",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.googletagmanager.com",
              "media-src 'self' blob: https: data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://api.resend.com",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/Images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml'
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=43200'
          }
        ]
      },
      {
        source: '/api/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain'
          }
        ]
      }
    ]
  },
  
  // Rewrite sitemap and robots.txt to API routes for dynamic generation
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml'
      },
      {
        source: '/robots.txt',
        destination: '/api/robots.txt'
      }
    ]
  }
}

module.exports = nextConfig
