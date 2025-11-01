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

    // Non-homepage routes: always show glassmorphic navbar
    if (router?.pathname && router.pathname !== '/') {
      setScrolled(true)
      setIsOverHero(false)
      return
    }

    // Homepage only: use IntersectionObserver for reliable hero section detection
    if (router?.pathname === '/') {
      const hero = document.querySelector('#hero')
      
      if (!hero) return
      
      // Monitor the hero section - when 50% scrolled away, activate glassmorphic
      const observer = new IntersectionObserver(
        ([entry]) => {
          // If hero is NOT intersecting (scrolled away), navbar is GLASSMORPHIC
          // If hero IS intersecting (visible), navbar is TRANSPARENT
          setScrolled(!entry.isIntersecting)
        },
        {
          root: null,
          threshold: 0.5, // Trigger when 50% of hero is visible/hidden
          rootMargin: '0px 0px 0px 0px'
        }
      )
      
      observer.observe(hero)
      return () => observer.disconnect()
    }
  }, [router?.pathname])

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
          <Link href="/projects" className={`navbar-item ${isLinkActive('/projects') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/projects') ? 'true' : undefined}>Projects</Link>
          <Link href="/contact" className={`navbar-item ${isLinkActive('/contact') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/contact') ? 'true' : undefined}>Contact</Link>
          <Link href="/about" className={`navbar-item ${isLinkActive('/about') ? 'active' : ''}`} onClick={handleMobileNavClick} aria-current={isLinkActive('/about') ? 'true' : undefined}>About</Link>
        </div>

        {/* Full-Page Mobile Menu Overlay */}
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-items">
            <Link 
              href="/projects" 
              className={`mobile-menu-item ${isLinkActive('/projects') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Projects
            </Link>
            <Link 
              href="/contact" 
              className={`mobile-menu-item ${isLinkActive('/contact') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              Contact
            </Link>
            <Link 
              href="/about" 
              className={`mobile-menu-item ${isLinkActive('/about') ? 'active' : ''}`} 
              onClick={handleMobileNavClick}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
