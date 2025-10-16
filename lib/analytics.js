// Lightweight analytics helper that injects Google Tag Manager (GTM) and respects user consent
// Consent is stored in localStorage under the key: 'adons_analytics_consent'
// Values: 'granted' or 'denied'

const CONSENT_KEY = 'adons_analytics_consent'
let _gtmId = ''
let _initialized = false

function _consentGiven() {
  try {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(CONSENT_KEY) === 'granted'
  } catch (e) {
    return false
  }
}

export function setConsent(granted = true) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied')
    if (granted && _gtmId && !_initialized) init(_gtmId)
    // Send consent to server for audit (non-PII). We'll include an anonymous id persisted in localStorage.
    try {
      const anonKey = 'adons_anon_id'
      let anon = localStorage.getItem(anonKey)
      if (!anon) {
        anon = (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('anon-' + Math.random().toString(36).slice(2,10))
        localStorage.setItem(anonKey, anon)
      }
      // Fire-and-forget POST to API route
      fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId: anon, consent: granted, source: 'consent-banner' })
      }).catch(()=>{})
    } catch(e) {}
  } catch (e) {
    // ignore
  }
}

export function consentGiven() {
  return _consentGiven()
}

function _injectGTM(gtmId) {
  // Standard GTM script
  const existing = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)
  if (!existing) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
    document.head.appendChild(s)
  }

  // Inject noscript iframe into body (best-effort; GTM recommends immediately after <body>)
  try {
    const noscriptId = `gtm-noscript-${gtmId}`
    if (!document.getElementById(noscriptId)) {
      const nos = document.createElement('div')
      nos.id = noscriptId
      nos.style.position = 'absolute'
      nos.style.left = '-9999px'
      nos.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      document.body.appendChild(nos)
    }
  } catch (e) {
    // ignore
  }
}

export function init(gtmId) {
  _gtmId = gtmId || _gtmId
  if (!_gtmId) return
  if (!_consentGiven()) return
  if (typeof window === 'undefined') return
  if (_initialized) return

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || []

  // Push initial event for GTM to bootstrap
  window.dataLayer.push({ 'event': 'adons_gtm_init', 'gtm.start': new Date().getTime() })

  _injectGTM(_gtmId)
  _initialized = true
}

export function pageview(path) {
  try {
    if (!_initialized) return
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'page_view', page_path: path })
  } catch (e) {
    console.warn('analytics.pageview error', e)
  }
}

export function event(name, params = {}) {
  try {
    if (!_initialized) return
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    const payload = Object.assign({}, params, { event: name })
    window.dataLayer.push(payload)
  } catch (e) {
    console.warn('analytics.event error', e)
  }
}

export default {
  init,
  setConsent,
  consentGiven,
  pageview,
  event,
}
