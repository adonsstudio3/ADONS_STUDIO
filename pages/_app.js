import '../styles/globals.css'
import '../styles/mobile-cards.css'
import { useEffect } from 'react'
import Head from 'next/head'
import ScrollToTop from '../components/ScrollToTop'
import ScrollbarGutter from '../components/ScrollbarGutter'
import { ConsentProvider } from '../components/ConsentProvider'
import ConsentBanner from '../components/ConsentBanner'
import { trackPageView } from '../lib/gtm'
import { useRouter } from 'next/router'

// Import memory leak detector for development
if (process.env.NODE_ENV === 'development') {
  import('../utils/memoryLeakDetector.js').catch((err) => {
    console.warn('[Adons] Memory leak detector failed to load:', err && (err.message || err), '\nThis does not affect production. Ensure ../utils/memoryLeakDetector.js exists and is error-free if you want leak detection in development.');
  });
}

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = (url) => {
      trackPageView(url, document.title);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // Client-only libs can be initialized here if needed

    // Prevent third-party browser extension scripts from surfacing
    // as unhandled runtime errors in the app UI. We specifically
    // ignore errors coming from chrome-extension:// origins (extensions
    // that inject React or call createRoot can produce Minified React
    // error #299 in the page context).
    const isExtensionSource = (src) => {
      try {
        return typeof src === 'string' && src.startsWith('chrome-extension://');
      } catch (e) {
        return false;
      }
    };

    const onWindowError = (event) => {
      // event has .filename for dispatched ErrorEvent
      const filename = event && event.filename;
      if (isExtensionSource(filename)) {
        // stop propagation and prevent the error from being treated as uncaught
        try {
          event.preventDefault && event.preventDefault();
        } catch (e) {}
        try {
          event.stopImmediatePropagation && event.stopImmediatePropagation();
        } catch (e) {}
        // keep a console notice for debugging
        console.warn('Ignored error from browser extension:', filename, event.message || event.error);
      }
      // otherwise allow normal handling
    };

    const onUnhandledRejection = (event) => {
      const reason = event && event.reason;
      const reasonStr = typeof reason === 'string' ? reason : (reason && (reason.stack || reason.message)) || '';
      if (isExtensionSource(reasonStr) || reasonStr.includes('chrome-extension://')) {
        try {
          event.preventDefault && event.preventDefault();
        } catch (e) {}
        try {
          event.stopImmediatePropagation && event.stopImmediatePropagation();
        } catch (e) {}
        console.warn('Ignored unhandledrejection from browser extension:', reasonStr);
      }
    };

    window.addEventListener('error', onWindowError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', onWindowError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection, true);
    };
  }, [])

  return (
    <ConsentProvider>
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Adons Studio</title>
        </Head>
        {/* Fixed background element placed behind the app content. */}
        <div id="site-bg" aria-hidden="true" />
        <ScrollToTop />
        <ScrollbarGutter />
        <Component {...pageProps} />
        <ConsentBanner />
      </>
    </ConsentProvider>
  )
}
