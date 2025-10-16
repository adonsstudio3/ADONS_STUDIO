import Link from 'next/link'
import { useRouter } from 'next/router'
import { generateBreadcrumbStructuredData } from '../lib/seo'
import { useEffect } from 'react'

const Breadcrumbs = ({ customBreadcrumbs = null }) => {
  const router = useRouter()
  
  // Generate breadcrumbs from route or use custom ones
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs
    
    const pathSegments = router.asPath.split('/').filter(segment => segment !== '')
    const breadcrumbs = [
      { name: 'Home', url: '/' }
    ]
    
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable name
      let name = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (name === 'Projects') name = 'Projects'
      if (name === 'Services') name = 'Services'
      if (name === 'Team') name = 'Team'
      if (name === 'Contact') name = 'Contact'
      
      breadcrumbs.push({
        name,
        url: currentPath
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  // Add structured data for breadcrumbs
  useEffect(() => {
    if (breadcrumbs.length > 1) {
      const structuredData = generateBreadcrumbStructuredData(breadcrumbs)
      
      // Remove existing breadcrumb structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumbs]')
      if (existingScript) {
        existingScript.remove()
      }
      
      // Add new structured data
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-breadcrumbs', 'true')
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
      
      return () => {
        const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-breadcrumbs]')
        if (scriptToRemove) {
          scriptToRemove.remove()
        }
      }
    }
  }, [breadcrumbs])
  
  if (breadcrumbs.length <= 1) return null
  
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.url} className="breadcrumb-item">
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link href={crumb.url} className="breadcrumb-link">
                  {crumb.name}
                </Link>
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              </>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {crumb.name}
              </span>
            )}
          </li>
        ))}
      </ol>
      
      <style jsx>{`
        .breadcrumbs {
          margin: 1rem 0;
          padding: 0.5rem 0;
        }
        
        .breadcrumb-list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 0.875rem;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
        }
        
        .breadcrumb-link {
          color: #9CA3AF;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .breadcrumb-link:hover {
          color: #FFD700;
          text-decoration: underline;
        }
        
        .breadcrumb-separator {
          margin: 0 0.5rem;
          color: #6B7280;
        }
        
        .breadcrumb-current {
          color: #FFD700;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .breadcrumbs {
            margin: 0.5rem 0;
            font-size: 0.8rem;
          }
          
          .breadcrumb-separator {
            margin: 0 0.25rem;
          }
        }
      `}</style>
    </nav>
  )
}

export default Breadcrumbs