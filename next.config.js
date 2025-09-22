/**
 * Minimal Next.js config to enable modern image formats and default optimizer.
 * When deployed to Vercel or a production Next server, next/image will proxy
 * and resize images via the built-in optimizer. During local development we
 * keep using pre-generated static assets for reliability.
 */
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure production image optimizer emits modern formats when possible
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 960, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Helpful when workspace has nested package locks
  outputFileTracingRoot: path.resolve(__dirname),
  async redirects() {
    return [
      { source: '/portfolio', destination: '/projects', permanent: true },
      { source: '/showreel', destination: '/projects', permanent: true },
    ]
  },
}

module.exports = nextConfig
