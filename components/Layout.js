import useSmoothScroll from './useSmoothScroll'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Footer from './Footer'
import PrivacyModal from './PrivacyModal'
import TermsModal from './TermsModal'
import SEOAnalytics from './SEOAnalytics'
import analytics, { consentGiven, init as analyticsInit } from '../lib/analytics'

export default function Layout({ children }){
  useSmoothScroll()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''
  const initialLoadRef = useRef(false)
  const [previousPathname, setPreviousPathname] = useState('')

  const loadingTitleRef = useRef(null)
  const preloaderRef = useRef(null)
  const [showVideoPreloader, setShowVideoPreloader] = useState(true)
  const preloaderMaxTimer = useRef(null)
  const preloaderMinTimer = useRef(null)
  const preloaderStartedRef = useRef(false)

  // Force scroll to top on any pathname change (except initial load)
  useEffect(() => {
    if (!router || !router.pathname) return
    
    // Skip on initial load
    if (!previousPathname) {
      setPreviousPathname(router.pathname)
      return
    }
    
    // If pathname changed, scroll to top immediately
    if (router.pathname !== previousPathname) {
      console.log('Layout: Pathname changed from', previousPathname, 'to', router.pathname, '- scrolling to top')
      
      let timeouts = []
      
      // Try multiple methods to ensure scroll reset
      window.scrollTo(0, 0)
      window.scroll({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // Also try with setTimeout to override any other scroll behavior
      timeouts.push(setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 0))
      
      timeouts.push(setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 100))
      
      setPreviousPathname(router.pathname)
      
      // Cleanup function to clear timeouts if component unmounts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [router?.pathname, previousPathname])

  // Also add router events as backup
  useEffect(() => {
    if (!router || !router.events) return
    
    let routeTimeout
    
    const handleRouteChange = (url) => {
      console.log('Router event: navigating to', url)
      routeTimeout = setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 0)
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      if (routeTimeout) clearTimeout(routeTimeout)
    }
  }, [router])

  // Google Analytics (gtag) injection and SPA pageview tracking
  useEffect(() => {
    if (!GTM_ID) return
    if (typeof window === 'undefined') return

    // Initialize analytics only if consent was previously granted
    if (consentGiven()) {
      try {
        analyticsInit(GTM_ID)
      } catch (e) {
        console.warn('analytics init failed', e)
      }
    }

    const handleRouteChangeGA = (url) => {
      try { analytics.pageview(url) } catch (e) { console.warn('analytics.pageview failed', e) }
    }

    // watch route changes
    router.events.on('routeChangeComplete', handleRouteChangeGA)

    // initial pageview (only if analytics initialized)
    try {
      if (consentGiven()) analytics.pageview(window.location.pathname)
    } catch (e) {}

    return () => {
      try { router.events.off('routeChangeComplete', handleRouteChangeGA) } catch(e) {}
    }
  }, [GTM_ID, router.events])

  useEffect(()=>{
    if (typeof window === 'undefined') return
    
    // Don't remove the initial loading screen here - let the preloader handle it
    
    // Detect whether this mount is a true full-page navigation (not a client-side route change)
    let navType = 'navigate'
    try {
      const entries = performance.getEntriesByType && performance.getEntriesByType('navigation')
      if (entries && entries[0] && entries[0].type) navType = entries[0].type
      else if (performance.navigation && typeof performance.navigation.type === 'number') {
        // legacy API: 0 === TYPE_NAVIGATE
        navType = performance.navigation.type === 0 ? 'navigate' : 'other'
      }
    } catch (e) {
      // ignore and assume navigate
    }

  const isFullPageLoad = navType === 'navigate' || navType === 'reload'

  // debug logging to trace loading state and navigation type during development
  try { 
    console.debug('[Layout] pathname=', router && router.pathname, 'navType=', navType, 'isFullPageLoad=', isFullPageLoad, 'loading=', loading) 
  } catch(e){}

    // Only show the loading overlay when the current route is the homepage ('/')
    // For now, show preloader on every homepage visit to ensure it works
    if (!router || router.pathname !== '/') {
      setLoading(false)
      // Hide initial loading screen for non-home pages
      try {
        var el = document.getElementById('initial-loading-screen')
        if (el) el.style.display = 'none'
        document.body.classList.add('content-ready')
      } catch(e){}
      return
    }    
    
    // Show preloader for all homepage visits (remove full page load check temporarily)
    console.log('Homepage detected - showing preloader'); // Debug log
    setLoading(true)
    
    // If we're not using the video preloader, keep previous fixed duration
    if (!showVideoPreloader) {
      const t = setTimeout(()=> setLoading(false), 1800)
      return ()=> clearTimeout(t)
    }
    // Otherwise, the video-handling effect will clear loading once the video starts or times out.
    return undefined
  }, [router && router.pathname])

  // Ensure that client-side navigations away from the homepage clear any
  // lingering loading state. This guards against the preloader remaining
  // active if a user navigates quickly after the initial load.
  useEffect(()=>{
    if (!router || !router.events) return
    const onRouteChangeStart = (url)=>{
      try {
        // if navigating away from home, ensure loading overlay is hidden
        if (!url || url === '/') return
        if (loading) {
          try { console.debug('[Layout] routeChangeStart -> clearing loading for', url) } catch(e){}
          setLoading(false)
          setShowVideoPreloader(false)
        }
      } catch(e){}
    }
    router.events.on('routeChangeStart', onRouteChangeStart)
    return ()=> router.events.off('routeChangeStart', onRouteChangeStart)
  }, [router, loading])

  // When loading overlay is active and video preloader is enabled, keep the overlay
  // until the video has started playing (and played a minimal duration) or a max timeout elapses.
  useEffect(()=>{
    if (!loading || !showVideoPreloader) return
    const v = preloaderRef.current
    preloaderStartedRef.current = false

    const clearAll = () => {
      if (preloaderMaxTimer.current) { clearTimeout(preloaderMaxTimer.current); preloaderMaxTimer.current = null }
      if (preloaderMinTimer.current) { clearTimeout(preloaderMinTimer.current); preloaderMinTimer.current = null }
      try {
        // if video exists, pause to avoid background playback after overlay
        if (v && !v.paused) { v.pause() }
      } catch (e) {}
      setLoading(false)
      
      // Hide initial loading screen and show main content
      try {
        var el = document.getElementById('initial-loading-screen')
        if (el) el.style.display = 'none'
        // Now make the main content visible
        document.body.classList.add('content-ready')
      } catch(e){}
    }

    const onCanPlay = () => {
      // Hide initial loading screen when video is ready to play
      try {
        var el = document.getElementById('initial-loading-screen')
        if (el) el.style.display = 'none'
      } catch(e){}
      
      try {
        if (v) { v.muted = true; v.volume = 0 }
        v.play().catch(()=>{})
      } catch(e){}
    }
    const onPlaying = () => {
      // mark that playback has started — we'll wait for `ended` to clear overlay
      preloaderStartedRef.current = true
    }
    const onEnded = () => { clearAll() }
    const onError = () => { clearAll() }

    // max timeout: don't block longer than 3.5s
    preloaderMaxTimer.current = setTimeout(()=> { clearAll() }, 3500)

    if (v) {
      v.addEventListener('canplay', onCanPlay)
      v.addEventListener('playing', onPlaying)
      v.addEventListener('ended', onEnded)
      v.addEventListener('error', onError)
      // try to start immediately (some browsers require user gesture; muted autoplay usually works)
      try { v.play().catch(()=>{}) } catch(e){}
    } else {
      // if video element not present for some reason, fallback after a short delay
      preloaderMaxTimer.current = setTimeout(()=> { clearAll() }, 1200)
    }

    return () => {
      if (v) {
        v.removeEventListener('canplay', onCanPlay)
        v.removeEventListener('playing', onPlaying)
        v.removeEventListener('ended', onEnded)
        v.removeEventListener('error', onError)
      }
  if (preloaderMaxTimer.current) { clearTimeout(preloaderMaxTimer.current); preloaderMaxTimer.current = null }
    }
  }, [loading, showVideoPreloader])

  // Note: text animation removed per user preference. The letters are rendered
  // statically via CSS (no `.animate` toggle).

  return (
    <>
      {loading && (
        <div id="loading-screen" className="fixed inset-0 flex items-center justify-center z-50 loading-screen">
          <div className="loading-content text-center">
            {/* Show a preloader video if available (place your file at /Logo/preloader.mp4 inside public/). */}
            {showVideoPreloader ? (
              <video
                ref={preloaderRef}
                src="/Logo/preloader.mp4"
                playsInline
                muted
                autoPlay
                preload="auto"
                className="max-w-full max-h-[60vh] mx-auto"
                onLoadedMetadata={() => {
                  console.log('Preloader video metadata loaded'); // Debug log
                  const v = preloaderRef.current
                  if (!v) return
                  try {
                    v.muted = true
                    v.volume = 0
                    if (v.mozSetMuted) { try { v.mozSetMuted(true) } catch(e){} }
                    if (v.audioTracks && v.audioTracks.length) {
                      for (let i = 0; i < v.audioTracks.length; i++) {
                        try { v.audioTracks[i].enabled = false } catch(e){}
                      }
                    }
                  } catch(e){}
                }}
                onError={() => {
                  console.log('Preloader video error, falling back'); // Debug log
                  setShowVideoPreloader(false)
                }}
              />
            ) : (
              <>
                <div ref={loadingTitleRef} className="studio-logo text-3xl font-extrabold loading-title" aria-hidden>
                  <span className="logo-letter" data-letter="A">A</span>
                  <span className="logo-letter" data-letter="D">D</span>
                  <span className="logo-letter" data-letter="O">O</span>
                  <span className="logo-letter" data-letter="N">N</span>
                  <span className="logo-letter" data-letter="S">S</span>
                </div>
                <div className="loading-bar mt-6 w-64 h-2 bg-white/10 rounded overflow-hidden">
                  <div className="loading-progress h-full bg-gradient-to-r from-[#ffd700] to-[#ffcf33]" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="site-root" style={{ visibility: loading ? 'hidden' : 'visible' }}>
        <main className="site-content">
          {children}
        </main>
  {/* ConsentBanner is now the only consent UI. AnalyticsConsent removed. */}
        <Footer />
        <PrivacyModal />
        <TermsModal />
        <SEOAnalytics />
      </div>
    </>
  )
}
