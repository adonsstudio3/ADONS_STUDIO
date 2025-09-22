import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollToPlugin)

export default function useSmoothScroll(){
  useEffect(()=>{
    if (typeof document === 'undefined') return

    // Delegated click handler: looks for anchors with the .nav-link class.
    // Supports href values like "#section" or "/#section" and only
    // intercepts clicks that target the same pathname (prevents cross-page
    // navigation interference).
    const onDocClick = (e) => {
      try {
        const el = e.target && e.target.closest ? e.target.closest('.nav-link') : null
        if (!el) return
        const href = el.getAttribute('href') || ''
        if (!href) return

        // Use URL parsing to extract hash and pathname robustly. If parsing
        // fails, fallback to simple startsWith check.
        let urlHash = ''
        let urlPath = window.location.pathname
        try {
          const parsed = new URL(href, window.location.href)
          urlHash = parsed.hash || ''
          urlPath = parsed.pathname || urlPath
        } catch (err) {
          if (href.startsWith('#')) urlHash = href
        }

        if (!urlHash) return // nothing to scroll to

        // Only handle same-page hashes. Let other links (different pathname)
        // follow normal navigation.
        if (urlPath !== window.location.pathname) return

        // Resolve the target element
        const target = document.querySelector(urlHash)
        if (!target) return

        e.preventDefault()
        const header = document.querySelector('header')
        const headerHeight = header ? header.offsetHeight : 0
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20
        gsap.to(window, { duration:1.1, scrollTo: { y: top, autoKill:false }, ease:'power2.inOut' })
      } catch (err) {
        // swallow errors to avoid breaking page behavior
      }
    }

    document.addEventListener('click', onDocClick, { passive: false })
    return ()=> document.removeEventListener('click', onDocClick)
  }, [])
}
