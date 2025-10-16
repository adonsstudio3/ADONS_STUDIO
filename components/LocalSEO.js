import Head from 'next/head'
import { siteConfig } from '../lib/seo'

const LocalSEO = ({ 
  businessName = siteConfig.business.name,
  address = null,
  phone = siteConfig.business.phone,
  email = siteConfig.business.email,
  serviceAreas = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'India', 'Bhubaneswar', 'BBSR', 'Kolkata'],
  openingHours = null
}) => {
  
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": businessName,
    "image": `${siteConfig.url}/Images/logo/adons-logo-og.jpg`,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "telephone": phone,
    "email": email,
    "foundingDate": siteConfig.business.foundingDate,
    
    // Service areas
    "areaServed": serviceAreas.map(area => ({
      "@type": "Place",
      "name": area
    })),
    
    // Business categories
    "serviceType": siteConfig.business.services,
    "knowsAbout": siteConfig.business.keywords.slice(0, 20),
    
    // Professional credentials
    "hasCredential": siteConfig.business.certifications?.map(cert => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": cert
    })),
    
    // Awards and recognition
    "award": siteConfig.business.awards,
    
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
    
    // Operating hours (if provided)
    ...(openingHours && {
      "openingHoursSpecification": openingHours.map(hours => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": hours.days,
        "opens": hours.opens,
        "closes": hours.closes
      }))
    }),
    
    // Address (if provided)
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address.street,
        "addressLocality": address.city,
        "addressRegion": address.state,
        "postalCode": address.zip,
        "addressCountry": address.country || "IN"
      }
    }),
    
    // Reviews and ratings placeholder (to be updated with real data)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    
    // Price range
    "priceRange": "$$-$$$",
    
    // Payment methods
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "Online Payment"],
    
    // Languages spoken
    "availableLanguage": [
      {
        "@type": "Language",
        "name": "English"
      },
      {
        "@type": "Language", 
        "name": "Hindi"
      }
    ]
  }

  // FAQ Schema for common queries
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What VFX services does ADONS Studio provide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ADONS Studio provides comprehensive VFX services including visual effects, 3D animation, motion graphics, compositing, rotoscoping, color grading, and post-production services for films, commercials, and digital media."
        }
      },
      {
        "@type": "Question",
        "name": "Does ADONS Studio work with international clients?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, ADONS Studio serves clients worldwide while being based in India. We provide professional VFX and animation services to international film productions, advertising agencies, and digital media companies."
        }
      },
      {
        "@type": "Question",
        "name": "What makes ADONS Studio different from other VFX companies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ADONS Studio combines award-winning creative talent with cutting-edge technology to deliver exceptional visual effects. Our team specializes in high-quality VFX, timely delivery, and personalized service for each project."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a typical VFX project take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Project timelines vary based on complexity and scope. Simple motion graphics may take 1-2 weeks, while comprehensive VFX for films can take several months. We provide detailed timelines during consultation."
        }
      },
      {
        "@type": "Question",
        "name": "What industries does ADONS Studio serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve film & entertainment, advertising & marketing, corporate communications, digital media, broadcasting, gaming, educational content, and documentary production industries."
        }
      }
    ]
  }

  // How-to Schema for VFX process
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How ADONS Studio Creates Professional VFX",
    "description": "Step-by-step process of how our VFX studio creates stunning visual effects for films and commercials",
    "totalTime": "PT4W", // 4 weeks average
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "Contact for quote"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Concept & Pre-Production",
        "text": "Initial consultation, concept development, storyboarding, and project planning with detailed timelines and budget estimation."
      },
      {
        "@type": "HowToStep", 
        "name": "Production & Asset Creation",
        "text": "3D modeling, texturing, rigging, animation, and live-action integration using industry-standard software and techniques."
      },
      {
        "@type": "HowToStep",
        "name": "Post-Production & Compositing", 
        "text": "Compositing, color grading, audio mixing, final rendering, and quality assurance before delivery."
      },
      {
        "@type": "HowToStep",
        "name": "Review & Delivery",
        "text": "Client review sessions, revisions if needed, final approval, and delivery in required formats with project assets."
      }
    ]
  }

  return (
    <Head>
      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* How-To Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      {/* Local SEO Meta Tags */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="28.6139;77.2090" /> {/* Delhi coordinates */}
      <meta name="ICBM" content="28.6139, 77.2090" />
      
      {/* Business-specific meta tags */}
      <meta name="classification" content="VFX Studio, Animation Company, Post-Production Services" />
      <meta name="category" content="Creative Services, Digital Media, Film Production" />
      <meta name="coverage" content="India, International" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="Professional" />
      
      {/* Enhanced mobile meta tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Search engine specific tags */}
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow" />
      <meta name="slurp" content="index, follow" />
      
      {/* Content freshness */}
      <meta name="revisit-after" content="7 days" />
      <meta name="expires" content="never" />
    </Head>
  )
}

export default LocalSEO