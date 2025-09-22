import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Header(){
  const [scrolled, setScrolled] = useState(false)
  const [isOverHero, setIsOverHero] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    if (typeof window === 'undefined') return

    // If we're on any route other than the homepage, apply the scrolled
    // translucent navbar immediately so non-home pages show the same UI.
    if (router && router.pathname && router.pathname !== '/') {
      setScrolled(true)
      setIsOverHero(false)
      // still attach a small scroll listener so the header can toggle if needed
      const onScrollRoute = ()=> setScrolled(window.scrollY > 80)
      window.addEventListener('scroll', onScrollRoute)
      return ()=> window.removeEventListener('scroll', onScrollRoute)
    }

    // On the homepage, prefer observing the hero section for precise control
    const hero = document.querySelector('#hero')
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isCurrentlyOverHero = entry.isIntersecting
          setIsOverHero(isCurrentlyOverHero)
          setScrolled(!isCurrentlyOverHero)
        })
      }, { root: null, threshold: 0, rootMargin: '-10px 0px 0px 0px' })
      observer.observe(hero)
      return () => observer.disconnect()
    }

    // Fallback: simple scroll threshold on homepage if there's no hero
    const onScroll = ()=> {
      const shouldScroll = window.scrollY > 80
      setScrolled(shouldScroll)
      setIsOverHero(!shouldScroll)
    }
    window.addEventListener('scroll', onScroll)
    return ()=> window.removeEventListener('scroll', onScroll)
  }, [router && router.pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.floating-navbar')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // route-aware active checker which understands hash links (e.g. '/#about')
  const isLinkActive = (href) => {
    if (!href || !router) return false
    try {
      const [base, hash] = href.split('#')
      if (hash) {
        // active if the asPath contains the same hash, or if we're on the base pathname
        return (router.asPath && router.asPath.includes('#' + hash)) || router.pathname === (base || '/')
      }
      return router.pathname === href
    } catch (err) {
      return false
    }
  }

  const handleLogoClick = (e) => {
    try {
      const el = e && e.currentTarget ? e.currentTarget : (e && e.target ? e.target : null)
      // If we're already on the homepage, smooth-scroll to the hero section.
      if (router && router.pathname === '/') {
        const target = document.querySelector('#hero')
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (router) {
        // navigate to the homepage and jump to the hero (use hash so browser scrolls)
        router.push('/#hero')
      } else {
        const target = document.querySelector('#hero')
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      // blur when activated by mouse so the yellow underline/highlight doesn't persist
      if (e && e.detail && el && typeof el.blur === 'function') {
        setTimeout(() => el.blur(), 10)
      }
    } catch (err) { /* noop */ }
  }

  // blur links/buttons when clicked by mouse so :focus styles (yellow/underline) don't persist
  // keep focus when activated via keyboard (e.detail === 0)
  const handleNavClick = (e) => {
    try {
      const el = e && e.currentTarget ? e.currentTarget : (e && e.target ? e.target : null)
      if (e && e.detail && el && typeof el.blur === 'function') {
        setTimeout(() => el.blur(), 10)
      }
    } catch (err) { /* noop */ }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileNavClick = (e) => {
    handleNavClick(e)
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={`floating-navbar ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="navbar-container">
        <div className="navbar-brand">
          <button
            onClick={handleLogoClick}
            aria-label="Go to home"
            className="brand-link"
          >
            ADONS
          </button>
        </div>

  <div id="navbar-menu" className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link href="/services" className={`navbar-item ${isLinkActive('/services') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/services') ? 'true' : undefined}>Services</Link>
          <Link href="/projects" className={`navbar-item ${isLinkActive('/projects') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/projects') ? 'true' : undefined}>Projects</Link>
          <Link href="/team" className={`navbar-item ${isLinkActive('/team') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/team') ? 'true' : undefined}>Team</Link>
          <Link href="/contact" className={`navbar-item ${isLinkActive('/contact') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/contact') ? 'true' : undefined}>Contact</Link>
        </div>

        <button 
          className="navbar-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="navbar-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}
