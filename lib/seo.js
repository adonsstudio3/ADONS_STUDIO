// Advanced SEO configuration and utilities for ADONS Studio
export const siteConfig = {
  title: 'ADONS Studio',
  description: 'Professional VFX, Animation & Post-Production Studio | High-Quality Visual Effects, 3D Animation, Motion Graphics & Film Production Services in India. Dedicated team delivering on-time, industry-standard results.',
  url: 'https://adonsstudio.com',
  siteName: 'ADONS Studio',
  locale: 'en_US',
  type: 'website',
  
  // Real social media presence
  social: {
    twitter: 'https://x.com/AdonsStudio3237',
    instagram: 'https://www.instagram.com/__adons__/',
    youtube: 'https://www.youtube.com/@adonsstudioofficial',
    linkedin: 'https://www.linkedin.com/in/adons-studio-720071359/',
    facebook: 'https://www.facebook.com/people/Adons-S/pfbid0w8mabHfqzQdxfWyZvNZz1Ydbk3Vhgv5gGMKXJuqsP4bkeuwWnSD5xT1wbYdtxxGyl/',
    twitterHandle: '@AdonsStudio3237'
  },
  
  // Real business information
  business: {
    name: 'ADONS Studio',
    type: 'CreativeWork',
    email: 'adonsstudio3@gmail.com',
    phone: '+91-9337963354',
    foundingDate: '2024',
    founders: ['Sampanna Mishra', 'Siddhant Khedkar', 'Swapneel Choudhury', 'Adarsh Mohanty', 'Suman Sourav'],
    location: {
      streetAddress: 'HIG-13/A, BDA Colony, Pokhariput',
      addressLocality: 'Bhubaneswar',
      addressRegion: 'Odisha',
      postalCode: '751020',
      country: 'India',
      region: 'IN',
      addressCountry: 'IN'
    },
    description: 'Professional VFX and animation studio dedicated to delivering high-quality visual effects and creative solutions with on-time delivery and industry-standard excellence.',
    services: [
      'Visual Effects (VFX)',
      '3D Animation & Modeling',
      'Post-Production Services',
      'Video Production & Editing',
      'Motion Graphics Design',
      'Color Grading & Correction',
      'Audio Production & Mixing',
      'Corporate Video Production',
      'Commercial Advertisement Production',
      'Film & Cinema Production',
      'Digital Media Creation',
      'Compositing & Rotoscoping',
      'Concept Art & Storyboarding',
      'Live Action Integration'
    ],
    industries: [
      'Film & Entertainment',
      'Advertising & Marketing', 
      'Corporate Communications',
      'Digital Media',
      'Broadcasting',
      'Gaming Industry',
      'Educational Content',
      'Documentary Production'
    ],
    keywords: [
      // Primary keywords (high competition)
      'VFX studio India',
      'animation studio India',
      'post-production services',
      'visual effects company',
      'video production house',
      'motion graphics studio',
      
      // Long-tail keywords (lower competition, higher intent)
      'professional VFX services India',
      'commercial animation production',
      'film post-production company',
      'corporate video production services',
      'motion graphics design agency',
      '3D animation studio India',
      'visual effects for films',
      'advertising video production',
      'digital media creation services',
      'VFX compositing services',
      
      // Location-based keywords
      'VFX studio Mumbai',
      'animation company Delhi',
      'post-production house India',
      'video production services India',
      
      // Service-specific keywords
      'color grading services',
      'audio post-production',
      'concept art services',
      'storyboarding services',
      'rotoscoping services',
      'live action VFX'
    ],
    
    // Competitor analysis keywords
    competitorKeywords: [
      'professional VFX studio India',
      'leading animation company',
      'top-quality video production',
      'dedicated VFX services',
      'industry-standard animation'
    ]
  }
}

// Generate page-specific meta tags
export const generatePageMeta = (page) => {
  const baseTitle = siteConfig.title
  const baseMeta = {
    title: baseTitle,
    description: siteConfig.description,
    canonical: siteConfig.url,
    openGraph: {
      title: baseTitle,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.siteName,
      locale: siteConfig.locale,
      type: siteConfig.type,
      images: [
        {
          url: `${siteConfig.url}/Images/og/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${siteConfig.title} - Professional VFX & Animation Studio`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.social.twitter,
      creator: siteConfig.social.twitter,
      title: baseTitle,
      description: siteConfig.description,
      images: [`${siteConfig.url}/Images/og/og-default.png`]
    }
  }

  switch (page.type) {
    case 'home':
      return {
        ...baseMeta,
        title: `${baseTitle} - Professional VFX & Animation Studio | Dedicated Visual Effects Team in India`,
        description: 'Professional VFX & Animation studio in India delivering industry-standard visual effects, 3D animation, post-production & motion graphics for films, commercials & digital media. Hardworking team committed to on-time delivery and exceptional quality.',
        keywords: [
          // Primary focus keywords
          'VFX studio India',
          'animation studio India', 
          'visual effects company',
          'post-production services',
          
          // Service-specific keywords
          '3D animation services',
          'motion graphics design',
          'film post-production',
          'commercial video production',
          'digital media creation',
          
          // Quality indicators
          'professional VFX services',
          'dedicated animation studio',
          'industry-standard VFX India',
          'hardworking creative team',
          'on-time delivery VFX',
          
          // Location targeting
          'VFX services Bhubaneswar',
          'animation company India',
          'India video production'
        ].join(', '),
        openGraph: {
          ...baseMeta.openGraph,
          title: `${baseTitle} - Professional VFX & Animation Studio India`,
          description: 'Professional visual effects, 3D animation & post-production services. Hardworking team dedicated to transforming your creative vision into stunning visual experiences with on-time delivery.',
          images: [
            {
              url: `${siteConfig.url}/Images/og/og-home.png`,
              width: 1200,
              height: 630,
              alt: 'ADONS Studio - Professional VFX & Animation Studio India delivering industry-standard visual effects and 3D animation'
            }
          ]
        },
        twitter: {
          ...baseMeta.twitter,
          title: `${baseTitle} - Professional VFX & Animation Studio`,
          description: 'Professional visual effects, 3D animation & post-production services in India. Dedicated team delivering industry-standard quality with on-time commitment.',
        }
      }

    case 'services':
      return {
        ...baseMeta,
        title: `Services - ${baseTitle} | Complete Professional Production Solutions`,
        description: 'Comprehensive VFX, animation & post-production services: Visual effects, 3D animation, motion graphics, color grading, audio mixing, concept art. End-to-end production solutions for films, commercials & digital media.',
        canonical: `${siteConfig.url}/services`,
        keywords: [
          // Service categories
          'professional VFX services India',
          '3D animation services',
          'post-production company',
          'motion graphics services',
          'visual effects production',
          
          // Specific services
          'color grading services',
          'audio post-production India',
          'video editing services',
          'compositing services',
          'rotoscoping services',
          'concept art services',
          'storyboarding services',
          
          // Industry applications
          'film VFX services',
          'commercial video production',
          'corporate video services',
          'advertising production house',
          'digital media services',
          
          // Quality indicators
          'professional video production India',
          'high-quality VFX services',
          'dedicated animation team',
          'experienced VFX professionals',
          'on-time delivery commitment',
          'industry-standard production',
          
          // Process keywords
          'pre-production services',
          'production management',
          'post-production workflow',
          'end-to-end video production'
        ].join(', '),
        openGraph: {
          ...baseMeta.openGraph,
          title: `Services - ${baseTitle}`,
          description: 'Professional VFX, animation, and post-production services for films, commercials, and digital media.',
          url: `${siteConfig.url}/services`,
          images: [
            {
              url: `${siteConfig.url}/Images/og/og-services.png`,
              width: 1200,
              height: 630,
              alt: 'ADONS Studio Services - VFX, Animation & Post-Production'
            }
          ]
        }
      }

    case 'projects':
      return {
        ...baseMeta,
        title: `Projects - ${baseTitle} | Portfolio & Showreel`,
        description: 'Explore our portfolio of professional VFX, animation, and post-production projects. See our latest work in films, commercials, and digital media showcasing industry-standard quality and dedicated craftsmanship.',
        canonical: `${siteConfig.url}/projects`,
        keywords: [
          'VFX portfolio',
          'animation portfolio',
          'showreel',
          'VFX projects',
          'animation projects',
          'film projects',
          'commercial projects',
          'visual effects portfolio',
          'motion graphics portfolio',
          'professional VFX work',
          'industry-standard projects'
        ].join(', '),
        openGraph: {
          ...baseMeta.openGraph,
          title: `Projects - ${baseTitle}`,
          description: 'Professional VFX and animation projects from ADONS Studio. View our portfolio showcasing industry-standard quality and creative dedication.',
          url: `${siteConfig.url}/projects`,
          images: [
            {
              url: `${siteConfig.url}/Images/og/og-projects.png`,
              width: 1200,
              height: 630,
              alt: 'ADONS Studio Projects - VFX & Animation Portfolio'
            }
          ]
        }
      }

    case 'team':
      return {
        ...baseMeta,
        title: `Team - ${baseTitle} | Meet Our Creative Professionals`,
        description: 'Meet the talented team behind ADONS Studio. Our creative professionals bring years of experience in VFX, animation, and post-production.',
        canonical: `${siteConfig.url}/team`,
        keywords: [
          'VFX team',
          'animation team',
          'creative professionals',
          'VFX artists',
          'animators',
          'post-production team',
          'film professionals',
          'creative studio team'
        ].join(', '),
        openGraph: {
          ...baseMeta.openGraph,
          title: `Team - ${baseTitle}`,
          description: 'Meet the creative minds behind ADONS Studio - experienced VFX artists, animators, and post-production professionals.',
          url: `${siteConfig.url}/team`,
          images: [
            {
              url: `${siteConfig.url}/Images/og/og-team.png`,
              width: 1200,
              height: 630,
              alt: 'ADONS Studio Team - Creative Professionals'
            }
          ]
        }
      }

    case 'contact':
      return {
        ...baseMeta,
        title: `Contact - ${baseTitle} | Get In Touch for Your Next Project`,
        description: 'Contact ADONS Studio for your VFX, animation, and post-production needs. Let us bring your creative vision to life with professional results.',
        canonical: `${siteConfig.url}/contact`,
        keywords: [
          'contact VFX studio',
          'hire VFX studio',
          'VFX services quote',
          'animation services quote',
          'post-production services',
          'film production contact',
          'commercial production contact'
        ].join(', '),
        openGraph: {
          ...baseMeta.openGraph,
          title: `Contact - ${baseTitle}`,
          description: 'Get in touch with ADONS Studio for professional VFX, animation, and post-production services.',
          url: `${siteConfig.url}/contact`,
          images: [
            {
              url: `${siteConfig.url}/Images/og/og-contact.png`,
              width: 1200,
              height: 630,
              alt: 'Contact ADONS Studio - Professional VFX & Animation Services'
            }
          ]
        }
      }

    default:
      return baseMeta
  }
}

// Generate JSON-LD structured data
export const generateStructuredData = (page) => {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.business.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/Logo/brand-logo.png`,
    "description": siteConfig.description,
    "foundingDate": siteConfig.business.foundingDate,
    "email": siteConfig.business.email,
    "telephone": siteConfig.business.phone,
    "sameAs": [
      siteConfig.social.twitter,
      siteConfig.social.instagram,
      siteConfig.social.youtube,
      siteConfig.social.linkedin,
      siteConfig.social.facebook
    ],
    "founder": siteConfig.business.founders.map(name => ({
      "@type": "Person",
      "name": name
    })),
    "knowsAbout": siteConfig.business.services,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteConfig.business.location.streetAddress,
      "addressLocality": siteConfig.business.location.addressLocality,
      "addressRegion": siteConfig.business.location.addressRegion,
      "postalCode": siteConfig.business.location.postalCode,
      "addressCountry": siteConfig.business.location.addressCountry
    }
  }

  const baseWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.siteName,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "publisher": baseOrganization,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/projects?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  switch (page.type) {
    case 'home':
      return [
        baseOrganization,
        baseWebSite,
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${siteConfig.url}/#webpage`,
          "url": siteConfig.url,
          "name": `${siteConfig.title} - Professional VFX & Animation Studio`,
          "description": siteConfig.description,
          "isPartOf": {
            "@id": `${siteConfig.url}/#website`
          },
          "about": baseOrganization,
          "mainEntity": baseOrganization
        }
      ]

    case 'services':
      return [
        baseOrganization,
        {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "VFX and Animation Services",
          "description": "Professional VFX, animation, and post-production services for films, commercials, and digital media.",
          "provider": baseOrganization,
          "serviceType": "Creative Services",
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "VFX and Animation Services",
            "itemListElement": siteConfig.business.services.map((service, index) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": service
              }
            }))
          }
        }
      ]

    case 'projects':
      return [
        baseOrganization,
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "ADONS Studio Projects Portfolio",
          "description": "Portfolio of VFX, animation, and post-production projects by ADONS Studio",
          "url": `${siteConfig.url}/projects`,
          "mainEntity": {
            "@type": "ItemList",
            "name": "VFX and Animation Projects",
            "description": "Collection of professional VFX and animation projects"
          }
        }
      ]

    case 'team':
      return [
        baseOrganization,
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About ADONS Studio Team",
          "description": "Meet the creative professionals behind ADONS Studio",
          "url": `${siteConfig.url}/team`,
          "mainEntity": baseOrganization
        }
      ]

    case 'contact':
      return [
        baseOrganization,
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact ADONS Studio",
          "description": "Get in touch with ADONS Studio for VFX, animation, and post-production services",
          "url": `${siteConfig.url}/contact`,
          "mainEntity": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": siteConfig.business.email,
            "availableLanguage": ["English"]
          }
        }
      ]

    default:
      return [baseOrganization]
  }
}

// SEO utility functions
export const truncateDescription = (text, maxLength = 160) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3).trim() + '...'
}

export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  }
}