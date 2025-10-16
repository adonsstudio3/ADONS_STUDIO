"use client";

import { useState, useEffect, useRef } from 'react'
import analytics, { consentGiven, setConsent, init as analyticsInit } from '../lib/analytics'
import styles from '../styles/AnalyticsConsent.module.css'
import Link from 'next/link'

export default function AnalyticsConsent({ gtmId }){
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // lock body scroll while modal is open
  useEffect(() => {
    if (showModal) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
    return undefined
  }, [showModal])

  // close modal on Escape
  useEffect(()=>{
    if (!showModal) return
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Esc') setShowModal(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  // Listen for global event to open the privacy modal (used by Footer link)
  useEffect(()=>{
    const onOpen = () => setShowModal(true)
    window.addEventListener('openPrivacyModal', onOpen)
    // also listen on document for broader compatibility
    document.addEventListener('openPrivacyModal', onOpen)
    return () => {
      window.removeEventListener('openPrivacyModal', onOpen)
      document.removeEventListener('openPrivacyModal', onOpen)
    }
  }, [])

  const modalRef = useRef(null)
  const lastFocusedRef = useRef(null)

  // focus trap and focus management
  useEffect(()=>{
    if (!showModal) return
    lastFocusedRef.current = document.activeElement
    // move focus into modal
    setTimeout(()=>{
      try {
        const node = modalRef.current
        if (!node) return
        const focusable = node.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
        if (focusable && focusable.length) focusable[0].focus()
      } catch(e){}
    }, 0)

    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const node = modalRef.current
      if (!node) return
      const focusable = Array.from(node.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length -1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return ()=>{
      window.removeEventListener('keydown', onKey)
      try { if (lastFocusedRef.current) lastFocusedRef.current.focus() } catch(e){}
    }
  }, [showModal])

  useEffect(()=>{
    try {
      if (!consentGiven()) setVisible(true)
    } catch(e) { setVisible(true) }
  }, [])

  const accept = () => {
    try {
      setConsent(true)
      // ensure GTM initialized immediately
      if (gtmId) analyticsInit(gtmId)
    } catch(e) {}
    setVisible(false)
  }

  const deny = () => {
    try { setConsent(false) } catch(e){}
    setVisible(false)
  }

  return (
    <>
      {visible && (
        <div role="dialog" aria-live="polite" aria-label="Analytics consent" className={styles.consentContainer}>
          <div className={styles.consentMessage}>We use Google Tag Manager to collect anonymous analytics to improve the site. Do you consent to analytics?</div>
          <div className={styles.consentActions}>
            <button onClick={()=>setShowModal(true)} className={styles.learnMore}>Learn more</button>
            <button onClick={deny} className={`${styles.btn} ${styles.btnDeny}`}>Deny</button>
            <button onClick={accept} className={`${styles.btn} ${styles.btnAccept}`}>Accept</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className={`${styles.modalOverlay} ${styles.fadeIn}`} role="dialog" aria-modal="true" aria-label="Privacy information" onClick={(e)=>{ if (e.target === e.currentTarget) setShowModal(false) }}>
          <div ref={modalRef} className={`${styles.modalCard} ${styles.scaleIn}`}>
            <div className={styles.modalHeader}>
              <h3 style={{margin:0,color:'#FFD700'}}>Privacy & Analytics</h3>
              <button className={styles.modalClose} aria-label="Close privacy" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <h4 style={{color:'#fff', marginTop: 0}}>Overview</h4>
              <div>
                {/* Use the shared PrivacyContent component to avoid duplication */}
                <div style={{ color: '#ccc' }}>
                  <p>Adons Studio uses Google Tag Manager (GTM) to manage analytics tags on this site. We only collect anonymous, aggregated analytics data to help improve the site experience.</p>
                  <h4 style={{color:'#fff'}}>What we collect</h4>
                  <ul>
                    <li>Pageviews (path and timestamp)</li>
                    <li>Event interactions (button clicks, showreel plays, tag clicks) — no personal identifiers</li>
                    <li>Device and browser metadata as reported by analytics services</li>
                  </ul>
                  <h4 style={{color:'#fff'}}>Contact</h4>
                  <p>You can contact us at <a href="mailto:adonsstudio3@gmail.com" style={{color:'#FFD700'}}>adonsstudio3@gmail.com</a> with any questions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
