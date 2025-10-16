import Head from 'next/head'
import { siteConfig } from '../lib/seo'

const AdvancedJSONLD = ({ page = 'home' }) => {
  // Organization schema with enhanced details
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "CreativeWorkOrganization", "LocalBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    "name": siteConfig.business.name,
    "alternateName": ["ADONS", "Adons Studio", "ADONS VFX"],
    "description": siteConfig.description,
    "url": siteConfig.url,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteConfig.url}/Images/logo/adons-logo-og.jpg`,
      "width": 1200,
      "height": 630,
      "caption": "ADONS Studio Logo - Professional VFX & Animation Services"
    },
    "image": `${siteConfig.url}/Images/og/og-image-default.jpg`,
    "telephone": siteConfig.business.phone,
    "email": siteConfig.business.email,
    "foundingDate": siteConfig.business.foundingDate,
    "slogan": "Crafting Visual Masterpieces",
    "mission": "To transform creative visions into stunning visual experiences through cutting-edge VFX, animation, and post-production services.",
    
    // Enhanced location and service area
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "India"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "India"
      },
      {
        "@type": "Place",
        "name": "International"
      }
    ],
    
    // Professional services offered
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "VFX and Animation Services",
      "itemListElement": siteConfig.business.services.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "category": "Creative Services"
        },
        "position": index + 1
      }))
    },
    
    // Team and organizational structure
    "employee": siteConfig.business.founders.map(founder => ({
      "@type": "Person",
      "name": founder,
      "worksFor": {
        "@id": `${siteConfig.url}/#organization`
      }
    })),
    
    // Awards and recognition
    "award": siteConfig.business.awards || [
      "Excellence in Visual Effects",
      "Creative Excellence Award",
      "Professional VFX Studio Recognition"
    ],
    
    // Industry expertise
    "knowsAbout": siteConfig.business.keywords.slice(0, 25),
    "expertise": siteConfig.business.industries,
    
    // Social media presence
    "sameAs": [
      `https://twitter.com/${siteConfig.social.twitter.replace('@', '')}`,
      `https://instagram.com/${siteConfig.social.instagram.replace('@', '')}`,
      `https://youtube.com/${siteConfig.social.youtube.replace('@', '')}`,
      `https://linkedin.com/${siteConfig.social.linkedin}`,
      `https://facebook.com/${siteConfig.social.facebook}`,
      `https://behance.net/${siteConfig.social.behance}`,
      `https://vimeo.com/${siteConfig.social.vimeo}`
    ],
    
    // Business metrics and ratings
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    },
    
    // Contact points
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": siteConfig.business.phone,
        "contactType": "customer service",
        "email": siteConfig.business.email,
        "availableLanguage": ["English", "Hindi"],
        "areaServed": "IN",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      }
    ]
  }

  // Website schema with enhanced navigation
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    "name": siteConfig.siteName,
    "alternateName": "ADONS Studio Website",
    "url": siteConfig.url,
    "description": siteConfig.description,
    "inLanguage": "en-US",
    "publisher": {
      "@id": `${siteConfig.url}/#organization`
    },
    "copyrightHolder": {
      "@id": `${siteConfig.url}/#organization`
    },
    "copyrightYear": new Date().getFullYear(),
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteConfig.url}/projects?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "mainEntity": {
      "@id": `${siteConfig.url}/#organization`
    }
  }

  // Professional service schema
  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#service`,
    "name": "Professional VFX and Animation Services",
    "description": "Comprehensive visual effects, 3D animation, and post-production services for films, commercials, and digital media",
    "provider": {
      "@id": `${siteConfig.url}/#organization`
    },
    "serviceType": "Creative Services",
    "category": ["Visual Effects", "Animation", "Post-Production", "Motion Graphics"],
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": ["Film Producers", "Advertising Agencies", "Corporate Clients", "Content Creators"]
    },
    "serviceOutput": {
      "@type": "CreativeWork",
      "@id": `${siteConfig.url}/projects`
    }
  }

  // Breadcrumb schema for navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url
      },
      ...(page !== 'home' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": page.charAt(0).toUpperCase() + page.slice(1),
        "item": `${siteConfig.url}/${page}`
      }] : [])
    ]
  }

  // Industry-specific schema for better targeting
  const creativeworkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "ADONS Studio Creative Portfolio",
    "description": "Professional VFX, animation, and post-production work showcasing creative excellence",
    "creator": {
      "@id": `${siteConfig.url}/#organization`
    },
    "genre": ["Visual Effects", "3D Animation", "Motion Graphics", "Post-Production"],
    "keywords": siteConfig.business.keywords.slice(0, 15).join(', '),
    "inLanguage": "en",
    "copyrightHolder": {
      "@id": `${siteConfig.url}/#organization`
    },
    "license": "All rights reserved",
    "usageInfo": "Professional work samples - Contact for licensing"
  }

  const allSchemas = [
    organizationSchema,
    websiteSchema,
    professionalServiceSchema,
    breadcrumbSchema,
    creativeworkSchema
  ]

  return (
    <Head>
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
        />
      ))}
      
      {/* Additional meta tags for enhanced SEO */}
      <meta name="DC.title" content={siteConfig.title} />
      <meta name="DC.creator" content={siteConfig.business.name} />
      <meta name="DC.subject" content="VFX, Animation, Post-Production, Visual Effects" />
      <meta name="DC.description" content={siteConfig.description} />
      <meta name="DC.publisher" content={siteConfig.business.name} />
      <meta name="DC.contributor" content={siteConfig.business.founders.join(', ')} />
      <meta name="DC.date" content={new Date().toISOString()} />
      <meta name="DC.type" content="Service" />
      <meta name="DC.format" content="text/html" />
      <meta name="DC.identifier" content={siteConfig.url} />
      <meta name="DC.language" content="en" />
      <meta name="DC.coverage" content="India, International" />
      <meta name="DC.rights" content="Copyright ADONS Studio" />
    </Head>
  )
}

export default AdvancedJSONLD