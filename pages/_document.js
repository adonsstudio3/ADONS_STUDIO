import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(){
  return (
    <Html lang="en">
      <Head>
        {/* Load Satoshi via Fontshare per ITF EULA (serves fonts from their servers) */}
        {/* Load Satoshi via Fontshare (non-blocking preload pattern) */}
        <link rel="preload" href="https://api.fontshare.com/v2/css?f[]=satoshi@500,600,700&display=swap" as="style" onLoad="this.rel='stylesheet'" />
        <noscript>
          <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@500,600,700&display=swap" />
        </noscript>
        {/* Viewport meta for responsive mobile layout */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
