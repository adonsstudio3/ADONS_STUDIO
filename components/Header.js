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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
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
      // Close mobile menu when logo is clicked
      setIsMobileMenuOpen(false)
      
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
        {/* Mobile Hamburger Menu Checkbox (hidden but controls the animation) */}
        <input 
          className="mobile-menu-checkbox" 
          type="checkbox" 
          checked={isMobileMenuOpen}
          onChange={(e) => setIsMobileMenuOpen(e.target.checked)}
          aria-label="Toggle mobile menu"
          id="mobile-menu-toggle"
        />
        
        {/* Mobile Hamburger Lines */}
        <label className="hamburger-lines" htmlFor="mobile-menu-toggle">
          <span className="line line1"></span>
          <span className="line line2"></span>
          <span className="line line3"></span>
        </label>

        {/* Center: Brand (always visible) */}
        <div className="navbar-brand">
          <button
            className={`brand-link ${isMobileMenuOpen ? 'menu-open' : ''}`}
            onClick={handleLogoClick}
            aria-label="Go to home"
          >
            ADONS
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-menu desktop-menu">
          <Link href="/services" className={`navbar-item ${isLinkActive('/services') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/services') ? 'true' : undefined}>Services</Link>
          <Link href="/projects" className={`navbar-item ${isLinkActive('/projects') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/projects') ? 'true' : undefined}>Projects</Link>
          <Link href="/team" className={`navbar-item ${isLinkActive('/team') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/team') ? 'true' : undefined}>Team</Link>
          <Link href="/contact" className={`navbar-item ${isLinkActive('/contact') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/contact') ? 'true' : undefined}>Contact</Link>
        </div>

        {/* Full-Page Mobile Menu Overlay */}
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-items">
            <Link 
              href="/services" 
              className={`mobile-menu-item ${isLinkActive('/services') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Services
            </Link>
            <Link 
              href="/projects" 
              className={`mobile-menu-item ${isLinkActive('/projects') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Projects
            </Link>
            <Link 
              href="/team" 
              className={`mobile-menu-item ${isLinkActive('/team') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Team
            </Link>
            <Link 
              href="/contact" 
              className={`mobile-menu-item ${isLinkActive('/contact') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
