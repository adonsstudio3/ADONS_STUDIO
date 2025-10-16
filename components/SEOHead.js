import Head from 'next/head'
import { generatePageMeta, generateStructuredData } from '../lib/seo'
import LocalSEO from './LocalSEO'
import AdvancedJSONLD from './AdvancedJSONLD'

const SEOHead = ({ page = {}, children, includeLocalSEO = true, includeAdvancedSchema = true }) => {
  const meta = generatePageMeta(page)
  const structuredData = generateStructuredData(page)

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      <meta name="author" content="ADONS Studio" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={meta.canonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={meta.openGraph.type} />
      <meta property="og:title" content={meta.openGraph.title} />
      <meta property="og:description" content={meta.openGraph.description} />
      <meta property="og:url" content={meta.openGraph.url} />
      <meta property="og:site_name" content={meta.openGraph.siteName} />
      <meta property="og:locale" content={meta.openGraph.locale} />
      {meta.openGraph.images?.map((image, index) => (
        <meta key={index} property="og:image" content={image.url} />
      ))}
      {meta.openGraph.images?.[0] && (
        <>
          <meta property="og:image:width" content={meta.openGraph.images[0].width} />
          <meta property="og:image:height" content={meta.openGraph.images[0].height} />
          <meta property="og:image:alt" content={meta.openGraph.images[0].alt} />
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={meta.twitter.card} />
      <meta name="twitter:site" content={meta.twitter.site} />
      <meta name="twitter:creator" content={meta.twitter.creator} />
      <meta name="twitter:title" content={meta.twitter.title} />
      <meta name="twitter:description" content={meta.twitter.description} />
      {meta.twitter.images?.[0] && (
        <meta name="twitter:image" content={meta.twitter.images[0]} />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#FFD700" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="ADONS Studio" />
      
      {/* Language and Geographic Targeting */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      
      {/* Structured Data JSON-LD */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      {/* Additional children (page-specific meta tags) */}
      {children}
      
      {/* Advanced Local SEO */}
      {includeLocalSEO && <LocalSEO />}
      
      {/* Advanced JSON-LD Structured Data */}
      {includeAdvancedSchema && <AdvancedJSONLD page={page.type || 'home'} />}
    </Head>
  )
}

export default SEOHead