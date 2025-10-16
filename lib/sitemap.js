import { siteConfig } from '../lib/seo'

// Enhanced static pages configuration with detailed SEO parameters
const staticPages = [
  {
    url: '',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString(),
    images: [
      {
        url: '/Images/hero/home-hero.jpg',
        title: 'ADONS Studio - Professional VFX & Animation Services',
        caption: 'Award-winning VFX studio homepage'
      }
    ]
  },
  {
    url: '/services',
    changefreq: 'monthly', 
    priority: 0.95,
    lastmod: new Date().toISOString(),
    images: [
      {
        url: '/Images/hero/services-hero.jpg',
        title: 'VFX and Animation Services - ADONS Studio',
        caption: 'Comprehensive VFX, animation and post-production services'
      }
    ]
  },
  {
    url: '/services/vfx',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/services/animation',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/services/post-production',
    changefreq: 'monthly',
    priority: 0.85,
    lastmod: new Date().toISOString()
  },
  {
    url: '/services/motion-graphics',
    changefreq: 'monthly',
    priority: 0.85,
    lastmod: new Date().toISOString()
  },
  {
    url: '/projects',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
    images: [
      {
        url: '/Images/hero/projects-hero.jpg',
        title: 'ADONS Studio Portfolio - VFX & Animation Projects',
        caption: 'Showcase of professional VFX and animation work'
      }
    ]
  },
  {
    url: '/team',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
    images: [
      {
        url: '/Images/hero/team-hero.jpg',
        title: 'Meet the ADONS Studio Team',
        caption: 'Creative professionals behind award-winning VFX work'
      }
    ]
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.85,
    lastmod: new Date().toISOString(),
    images: [
      {
        url: '/Images/hero/contact-hero.jpg',
        title: 'Contact ADONS Studio for VFX Services',
        caption: 'Get in touch for professional VFX and animation services'
      }
    ]
  },
  // Additional service pages for better SEO coverage
  {
    url: '/industries/film-production',
    changefreq: 'monthly',
    priority: 0.75,
    lastmod: new Date().toISOString()
  },
  {
    url: '/industries/advertising',
    changefreq: 'monthly',
    priority: 0.75,
    lastmod: new Date().toISOString()
  },
  {
    url: '/industries/corporate-videos',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  }
]

export default function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${staticPages
  .map(
    (page) => `
  <url>
    <loc>${siteConfig.url}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.images ? page.images.map(image => `
    <image:image>
      <image:loc>${siteConfig.url}${image.url}</image:loc>
      <image:title>${image.title}</image:title>
      <image:caption>${image.caption}</image:caption>
    </image:image>`).join('') : ''}
  </url>`
  )
  .join('')}
</urlset>`

  return sitemap
}

// Generate enhanced robots.txt with detailed crawling instructions
export function generateAdvancedRobotsTxt() {
  return `# Robots.txt for ADONS Studio - Professional VFX & Animation Services
# Website: ${siteConfig.url}
# Contact: ${siteConfig.business.email}

# Allow all search engines
User-agent: *
Allow: /

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot  
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block access to sensitive areas
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/
Disallow: /.env
Disallow: /node_modules/
Disallow: /scripts/
Disallow: /tools/

# Allow specific file types important for SEO
Allow: *.css
Allow: *.js
Allow: *.png
Allow: *.jpg
Allow: *.jpeg
Allow: *.gif
Allow: *.webp
Allow: *.avif
Allow: *.svg
Allow: *.pdf
Allow: *.mp4
Allow: *.webm

# Sitemap locations
Sitemap: ${siteConfig.url}/sitemap.xml
Sitemap: ${siteConfig.url}/sitemap-images.xml
Sitemap: ${siteConfig.url}/sitemap-services.xml

# Crawl delay for better server performance
Crawl-delay: 1

# Cache directive
Cache-delay: 86400

# Contact information for webmaster
# Email: ${siteConfig.business.email}
# Last updated: ${new Date().toISOString().split('T')[0]}`
}

// Generate robots.txt content
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Block specific paths if needed
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Sitemap location
Sitemap: ${siteConfig.url}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`
}