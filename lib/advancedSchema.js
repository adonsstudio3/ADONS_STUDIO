import { siteConfig } from '../lib/seo'

// Advanced Schema Markup Generator for VFX Services
export const generateServiceSchema = (serviceName, serviceDescription, serviceCategory = 'CreativeWork') => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": serviceDescription,
    "provider": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url,
      "logo": `${siteConfig.url}/Logo/brand-logo.png`,
      "sameAs": Object.values(siteConfig.social).map(handle => 
        handle.includes('http') ? handle : `https://instagram.com/${handle.replace('@', '')}`
      )
    },
    "serviceType": serviceCategory,
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": siteConfig.url,
      "serviceSmsNumber": siteConfig.business.phone,
      "servicePhone": siteConfig.business.phone
    },
    "category": "Creative Services",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "INR",
        "price": "Contact for Quote"
      }
    }
  }
}

// Video/Film Production Schema
export const generateVideoProductionSchema = (projectTitle, projectDescription, projectType = 'VideoObject') => {
  return {
    "@context": "https://schema.org",
    "@type": projectType,
    "name": projectTitle,
    "description": projectDescription,
    "creator": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "productionCompany": {
      "@type": "Organization", 
      "name": siteConfig.business.name,
      "description": "Professional VFX and Animation Studio",
      "foundingDate": siteConfig.business.foundingDate,
      "location": {
        "@type": "Country",
        "name": "India"
      }
    },
    "genre": ["Visual Effects", "Animation", "Post-Production"],
    "inLanguage": "en",
    "keywords": siteConfig.business.keywords.slice(0, 10).join(', ')
  }
}

// Portfolio/Project Schema
export const generatePortfolioSchema = (projects = []) => {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    "name": "ADONS Studio Portfolio",
    "description": "Professional VFX, Animation and Post-Production Portfolio showcasing industry-standard projects delivered with dedication and on-time commitment",
    "creator": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "genre": ["Visual Effects", "3D Animation", "Motion Graphics", "Post-Production"],
    "workExample": projects.map(project => ({
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description,
      "genre": project.category,
      "keywords": project.tags?.join(', '),
      "creator": {
        "@type": "Organization",
        "name": siteConfig.business.name
      }
    }))
  }
}

// Team Member Schema
export const generatePersonSchema = (person) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": person.name,
    "jobTitle": person.role,
    "description": person.bio,
    "worksFor": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "knowsAbout": person.skills || ["Visual Effects", "Animation", "Post-Production"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": person.occupation || "VFX Artist",
      "occupationLocation": {
        "@type": "Country",
        "name": "India"
      }
    }
  }
}

// Advanced Article Schema for Blog/News
export const generateArticleSchema = (article) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image ? `${siteConfig.url}${article.image}` : `${siteConfig.url}/Images/og/og-image-default.jpg`,
    "author": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/Logo/brand-logo.png`,
        "width": 400,
        "height": 400
      }
    },
    "datePublished": article.publishDate,
    "dateModified": article.modifiedDate || article.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${article.url}`
    },
    "articleSection": article.category || "VFX Industry",
    "keywords": article.keywords || siteConfig.business.keywords.slice(0, 5).join(', ')
  }
}

// Course/Tutorial Schema
export const generateCourseSchema = (course) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "courseCode": course.code,
    "educationalLevel": course.level || "Intermediate",
    "about": course.topics || ["Visual Effects", "Animation", "Post-Production"],
    "teaches": course.skills || ["VFX Techniques", "Animation Principles", "Post-Production Workflow"],
    "timeRequired": course.duration,
    "coursePrerequisites": course.prerequisites || "Basic computer skills",
    "aggregateRating": course.rating ? {
      "@type": "AggregateRating",
      "ratingValue": course.rating.value,
      "reviewCount": course.rating.count
    } : undefined
  }
}

// Event Schema for workshops/webinars
export const generateEventSchema = (event) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": event.online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    "organizer": {
      "@type": "Organization",
      "name": siteConfig.business.name,
      "url": siteConfig.url
    },
    "location": event.online ? {
      "@type": "VirtualLocation",
      "url": event.location
    } : {
      "@type": "Place",
      "name": event.location,
      "address": event.address
    },
    "offers": {
      "@type": "Offer",
      "price": event.price || "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${siteConfig.url}${event.registrationUrl}`
    }
  }
}

// Software/Tool Schema
export const generateSoftwareSchema = (software) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": software.name,
    "description": software.description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": software.os || ["Windows", "macOS", "Linux"],
    "softwareVersion": software.version,
    "offers": {
      "@type": "Offer",
      "price": software.price || "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": software.rating ? {
      "@type": "AggregateRating",
      "ratingValue": software.rating.value,
      "reviewCount": software.rating.count
    } : undefined
  }
}

// Review Schema
export const generateReviewSchema = (review) => {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewBody": review.text,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "itemReviewed": {
      "@type": "Organization",
      "name": siteConfig.business.name
    },
    "datePublished": review.date
  }
}

export {
  generateServiceSchema,
  generateVideoProductionSchema,
  generatePortfolioSchema,
  generatePersonSchema,
  generateArticleSchema,
  generateCourseSchema,
  generateEventSchema,
  generateSoftwareSchema,
  generateReviewSchema
}