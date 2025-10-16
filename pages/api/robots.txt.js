import { generateAdvancedRobotsTxt } from '../../lib/sitemap'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const robotsTxt = generateAdvancedRobotsTxt()
    
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200')
    res.status(200).send(robotsTxt)
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    res.status(500).json({ message: 'Error generating robots.txt' })
  }
}