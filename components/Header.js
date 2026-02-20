import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { createPortal } from 'react-dom'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Track mount state so we can use createPortal safely (SSR-safe)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Non-homepage routes: always show glassmorphic navbar
    if (router?.pathname && router.pathname !== '/') {
      setScrolled(true)
      return
    }

    // Homepage only: use IntersectionObserver for reliable hero section detection
    if (router?.pathname === '/') {
      const hero = document.querySelector('#hero')
      if (!hero) return

      const observer = new IntersectionObserver(
        ([entry]) => { setScrolled(!entry.isIntersecting) },
        { root: null, threshold: 0.5 }
      )
      observer.observe(hero)
      return () => observer.disconnect()
    }
  }, [router?.pathname])

  // Close mobile menu when clicking outside the navbar or overlay
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.floating-navbar') &&
        !e.target.closest('#mobile-menu-portal')
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false) }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isMobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false) }, [router?.asPath])

  const isLinkActive = (href) => {
    if (!href || !router) return false
    try {
      const [base, hash] = href.split('#')
      if (hash) {
        return (router.asPath && router.asPath.includes('#' + hash)) || router.pathname === (base || '/')
      }
      return router.pathname === href
    } catch { return false }
  }

  const handleLogoClick = (e) => {
    try {
      setIsMobileMenuOpen(false)
      if (router && router.pathname === '/') {
        const target = document.querySelector('#hero')
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (router) {
        router.push('/')
      }
      // Always blur — on touch, e.detail is 0 so the old guard was skipping this
      const el = e?.currentTarget ?? e?.target
      if (typeof el?.blur === 'function') setTimeout(() => el.blur(), 10)
    } catch { /* noop */ }
  }

  const handleNavClick = (e) => {
    try {
      const el = e?.currentTarget ?? e?.target
      if (typeof el?.blur === 'function') setTimeout(() => el.blur(), 10)
    } catch { /* noop */ }
  }

  const handleMobileNavClick = (e) => {
    handleNavClick(e)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = (e) => {
    e.stopPropagation()
    setIsMobileMenuOpen(prev => !prev)
  }

  // The mobile menu overlay is rendered via a Portal directly into document.body.
  // This is CRITICAL: the <header> has a CSS transform animation (navbarEnter),
  // and in CSS any position:fixed child of a transformed element is positioned
  // relative to that element — not the viewport. By portalling out of the header
  // the overlay correctly covers the full screen.
  const mobileMenuOverlay = (
    <div
      id="mobile-menu-portal"
      className={`mobile-menu-overlay${isMobileMenuOpen ? ' is-open' : ''}`}
      aria-hidden={!isMobileMenuOpen}
    >
      {/* Close button — top-right corner of the overlay */}

      <div className="mobile-menu-items">
        <Link href="/projects" className={`mobile-menu-item${isLinkActive('/projects') ? ' active' : ''}`} onClick={handleMobileNavClick}>Projects</Link>
        <Link href="/contact" className={`mobile-menu-item${isLinkActive('/contact') ? ' active' : ''}`} onClick={handleMobileNavClick}>Contact</Link>
        <Link href="/about" className={`mobile-menu-item${isLinkActive('/about') ? ' active' : ''}`} onClick={handleMobileNavClick}>About</Link>
      </div>
    </div>
  )

  return (
    <>
      <header className={`floating-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-container">

          {/* Hamburger button (mobile only) */}
          <button
            className={`hamburger-lines${isMobileMenuOpen ? ' is-open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-portal"
            type="button"
          >
            <span className="line line1" />
            <span className="line line2" />
            <span className="line line3" />
          </button>

          {/* Brand (always centered on mobile) */}
          <div className="navbar-brand">
            <button
              className="brand-link"
              onClick={handleLogoClick}
              aria-label="Go to home"
              type="button"
            >
              ADONS
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop-menu">
            <Link href="/projects" className={`navbar-item${isLinkActive('/projects') ? ' active' : ''}`} onClick={handleNavClick}>Projects</Link>
            <Link href="/contact" className={`navbar-item${isLinkActive('/contact') ? ' active' : ''}`} onClick={handleNavClick}>Contact</Link>
            <Link href="/about" className={`navbar-item${isLinkActive('/about') ? ' active' : ''}`} onClick={handleNavClick}>About</Link>
          </div>

        </div>
      </header>

      {/* Portal: renders the mobile menu directly into <body> so it's
          not affected by the header's CSS transform stacking context */}
      {mounted && createPortal(mobileMenuOverlay, document.body)}
    </>
  )
}
