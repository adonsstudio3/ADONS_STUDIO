import { useEffect } from 'react'
import { useRouter } from 'next/router'

const SEOAnalytics = () => {
  const router = useRouter()

  useEffect(() => {
    // Track page views for SEO analytics
    const handleRouteChange = (url) => {
      // Send page view data to GTM/GA4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
          page_path: url,
        })
      }

      // Track internal search if search params are present
      const urlParams = new URLSearchParams(window.location.search)
      const searchQuery = urlParams.get('q') || urlParams.get('search')
      
      if (searchQuery && window.gtag) {
        window.gtag('event', 'search', {
          search_term: searchQuery,
          page_location: window.location.href
        })
      }

      // Track outbound links
      const trackOutboundLinks = () => {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
          if (!link.href.includes(window.location.hostname)) {
            link.addEventListener('click', (e) => {
              if (window.gtag) {
                window.gtag('event', 'click', {
                  event_category: 'outbound',
                  event_label: e.target.href,
                  transport_type: 'beacon'
                })
              }
            })
          }
        })
      }

      // Delay to ensure DOM is loaded
      setTimeout(trackOutboundLinks, 1000)
    }

    // Track initial page load
    handleRouteChange(router.asPath)

    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  useEffect(() => {
    // Track scroll depth for SEO engagement metrics
    let maxScroll = 0
    let ticking = false

    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent

        // Track scroll milestones
        const milestones = [25, 50, 75, 90]
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && maxScroll < milestone + 5) {
            if (window.gtag) {
              window.gtag('event', 'scroll', {
                event_category: 'engagement',
                event_label: `${milestone}%`,
                value: milestone
              })
            }
          }
        })
      }

      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(trackScrollDepth)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Enhanced Core Web Vitals tracking with detailed metrics
    const trackWebVitals = () => {
      if ('web-vital' in window) {
        return
      }

      // Mark as loaded to prevent duplicate tracking
      window['web-vital'] = true

      if ('PerformanceObserver' in window) {
        // Track Largest Contentful Paint (LCP) with thresholds
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          if (window.gtag && lastEntry.startTime) {
            const lcpTime = Math.round(lastEntry.startTime)
            const lcpGrade = lcpTime <= 2500 ? 'good' : lcpTime <= 4000 ? 'needs-improvement' : 'poor'
            
            window.gtag('event', 'web_vital', {
              event_category: 'performance',
              event_label: 'LCP',
              value: lcpTime,
              custom_parameter_1: window.location.pathname,
              custom_parameter_2: lcpGrade,
              custom_parameter_3: lastEntry.element?.tagName || 'unknown'
            })

            // Track SEO-critical LCP issues
            if (lcpTime > 4000) {
              window.gtag('event', 'seo_issue', {
                event_category: 'performance',
                event_label: 'poor_lcp',
                value: lcpTime,
                page_path: window.location.pathname
              })
            }
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // Enhanced First Input Delay (FID) tracking
        new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0]
          
          if (window.gtag && firstInput.processingStart && firstInput.startTime) {
            const fidTime = Math.round(firstInput.processingStart - firstInput.startTime)
            const fidGrade = fidTime <= 100 ? 'good' : fidTime <= 300 ? 'needs-improvement' : 'poor'
            
            window.gtag('event', 'web_vital', {
              event_category: 'performance',
              event_label: 'FID',
              value: fidTime,
              custom_parameter_1: window.location.pathname,
              custom_parameter_2: fidGrade,
              custom_parameter_3: firstInput.name || 'unknown'
            })
          }
        }).observe({ entryTypes: ['first-input'] })

        // Enhanced Cumulative Layout Shift (CLS) tracking
        let clsValue = 0
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          
          if (window.gtag) {
            const clsScore = Math.round(clsValue * 1000)
            const clsGrade = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
            
            window.gtag('event', 'web_vital', {
              event_category: 'performance',
              event_label: 'CLS',
              value: clsScore,
              custom_parameter_1: window.location.pathname,
              custom_parameter_2: clsGrade
            })

            // Track SEO-critical CLS issues
            if (clsValue > 0.25) {
              window.gtag('event', 'seo_issue', {
                event_category: 'performance',
                event_label: 'poor_cls',
                value: clsScore,
                page_path: window.location.pathname
              })
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })

        // Track First Contentful Paint (FCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const fcpEntry = entries[entries.length - 1]
          
          if (window.gtag && fcpEntry.startTime) {
            const fcpTime = Math.round(fcpEntry.startTime)
            const fcpGrade = fcpTime <= 1800 ? 'good' : fcpTime <= 3000 ? 'needs-improvement' : 'poor'
            
            window.gtag('event', 'web_vital', {
              event_category: 'performance',
              event_label: 'FCP',
              value: fcpTime,
              custom_parameter_1: window.location.pathname,
              custom_parameter_2: fcpGrade
            })
          }
        }).observe({ entryTypes: ['paint'] })

        // Track Time to First Byte (TTFB) from Navigation API
        if (window.performance && window.performance.getEntriesByType) {
          const navigationEntries = window.performance.getEntriesByType('navigation')
          if (navigationEntries.length > 0) {
            const ttfb = Math.round(navigationEntries[0].responseStart)
            const ttfbGrade = ttfb <= 600 ? 'good' : ttfb <= 1500 ? 'needs-improvement' : 'poor'
            
            if (window.gtag) {
              window.gtag('event', 'web_vital', {
                event_category: 'performance',
                event_label: 'TTFB',
                value: ttfb,
                custom_parameter_1: window.location.pathname,
                custom_parameter_2: ttfbGrade
              })
            }
          }
        }
      }

      // Track additional SEO metrics
      const trackSEOMetrics = () => {
        // Track page load complete time
        const loadTime = Math.round(window.performance.timing.loadEventEnd - window.performance.timing.navigationStart)
        if (window.gtag && loadTime > 0) {
          window.gtag('event', 'page_timing', {
            event_category: 'performance',
            event_label: 'load_complete',
            value: loadTime,
            page_path: window.location.pathname
          })
        }

        // Track DOM content loaded time
        const domContentLoadedTime = Math.round(window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart)
        if (window.gtag && domContentLoadedTime > 0) {
          window.gtag('event', 'page_timing', {
            event_category: 'performance',
            event_label: 'dom_content_loaded',
            value: domContentLoadedTime,
            page_path: window.location.pathname
          })
        }

        // Track resource loading metrics
        const resources = window.performance.getEntriesByType('resource')
        let totalResourceSize = 0
        let slowResources = 0

        resources.forEach(resource => {
          if (resource.transferSize) {
            totalResourceSize += resource.transferSize
          }
          if (resource.duration > 1000) { // Resources taking more than 1 second
            slowResources++
          }
        })

        if (window.gtag) {
          window.gtag('event', 'resource_metrics', {
            event_category: 'performance',
            event_label: 'total_size',
            value: Math.round(totalResourceSize / 1024), // KB
            page_path: window.location.pathname
          })

          if (slowResources > 0) {
            window.gtag('event', 'seo_issue', {
              event_category: 'performance',
              event_label: 'slow_resources',
              value: slowResources,
              page_path: window.location.pathname
            })
          }
        }
      }

      // Run SEO metrics after page load
      if (document.readyState === 'complete') {
        trackSEOMetrics()
      } else {
        window.addEventListener('load', trackSEOMetrics)
      }
    }

    // Track after page load
    if (document.readyState === 'complete') {
      trackWebVitals()
    } else {
      window.addEventListener('load', trackWebVitals)
    }

    return () => {
      window.removeEventListener('load', trackWebVitals)
    }
  }, [])

  return null // This component doesn't render anything
}

export default SEOAnalytics