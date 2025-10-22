import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(){
  // Sanitize GTM_ID to prevent XSS: only allow GTM- followed by alphanumerics/hyphens (7-20 chars)
  const rawGtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const GTM_ID = rawGtmId && /^GTM-[A-Z0-9\-]{6,20}$/i.test(rawGtmId) ? rawGtmId : '';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Essential Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.fontshare.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Google Tag Manager - Initialize dataLayer first (only if GTM_ID is valid) */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                // Initialize consent with default denied state (GDPR compliant)
                window.dataLayer.push({
                  event: 'consent_default',
                  consent: {
                    ad_storage: 'denied',
                    analytics_storage: 'denied',
                    functionality_storage: 'denied',
                    personalization_storage: 'denied',
                    security_storage: 'granted'
                  }
                });
                // GTM Script
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
        {/* Load Satoshi via Fontshare per ITF EULA (serves fonts from their servers) */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@500,600,700&display=swap" />
        {/* Initial loading overlay: Black screen until preloader video shows */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Keep everything hidden and black until preloader is ready */
          body { 
            visibility: visible; 
            opacity: 1; 
            background: #000 !important;
          }
          
          /* Hide main content until preloader finishes, but allow preloader to show */
          #__next > *:not([id*="loading"]) { 
            visibility: hidden !important; 
            opacity: 0 !important; 
          }
          body.content-ready #__next > * { 
            visibility: visible !important; 
            opacity: 1 !important; 
            transition: opacity 0.3s ease; 
          }
          
          /* Specifically hide site background until content is ready */
          body:not(.content-ready) #site-bg {
            display: none !important;
          }
          
          #initial-loading-screen { 
            display: block; 
            position: fixed; 
            inset: 0; 
            z-index: 99999; 
            background: #000; 
          }
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              // Hide the initial overlay immediately on non-home pages to avoid
              // covering page content unnecessarily.
              if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/') {
                var el = document.getElementById('initial-loading-screen');
                if (el) el.style.display = 'none';
              }
            }catch(e){}
          })();
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  {/* Preload local Playfair SemiBold WOFF2 (optimized) */}
  <link rel="preload" href="/fonts/PlayfairDisplay-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  {/* Remove nebula preload to prevent background flash before preloader */}
        {/* Inline guard to suppress errors from browser extensions that inject scripts */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var isExt = function(s){ return typeof s === 'string' && s.indexOf('chrome-extension://') === 0 };
              window.addEventListener('error', function(e){
                var src = e && e.filename || (e && e.target && e.target.src) || '';
                if(isExt(src)){
                  try{ e.preventDefault && e.preventDefault(); }catch(_){}
                  try{ e.stopImmediatePropagation && e.stopImmediatePropagation(); }catch(_){}
                  console.warn('Suppressed extension error from', src);
                }
              }, true);
              window.addEventListener('unhandledrejection', function(ev){
                var r = ev && ev.reason;
                var s = '' + (r && (r.stack || r.message) || r || '');
                if(s.indexOf('chrome-extension://') !== -1){
                  try{ ev.preventDefault && ev.preventDefault(); }catch(_){}
                  try{ ev.stopImmediatePropagation && ev.stopImmediatePropagation(); }catch(_){}
                  console.warn('Suppressed extension unhandled rejection', s);
                }
              }, true);
            } catch(e) { /* fail silently */ }
          })();
        `}} />
      </Head>
      <body>
        {/* Google Tag Manager (noscript, only if GTM_ID is valid) */}
        {GTM_ID && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        
        {/* Completely black initial overlay - no text */}
        <div id="initial-loading-screen" aria-hidden="true"></div>
        <Main />
        <NextScript />
        {/* Ensure the initial loading overlay is removed on load (home page keeps it visible by default).
            This hides it after the page loads or after a short timeout as a safety fallback. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              function hide(){
                var el = document.getElementById('initial-loading-screen');
                if(el) el.style.display = 'none';
              }
              if (document.readyState === 'complete') hide();
              else window.addEventListener('load', hide);
              // Safety fallback: remove overlay after 1500ms in case 'load' doesn't fire
              setTimeout(hide, 1500);
            }catch(e){}
          })();
        `}} />
      </body>
    </Html>
  )
}
