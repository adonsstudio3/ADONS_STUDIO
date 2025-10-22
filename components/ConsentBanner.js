
import React, { useState, useEffect, useRef } from 'react';
import { useConsent } from './ConsentProvider';
import analytics, { init as analyticsInit } from '../lib/analytics';

const ConsentBanner = () => {
  const {
    showConsentBanner,
    acceptAllConsent,
    acceptNecessaryOnly,
    declineAllConsent,
    setShowConsentBanner
  } = useConsent();
  // Optionally get GTM ID from env
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
  
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState([false, false, false]);
  const modalRef = useRef(null);


  useEffect(() => {
    let timeoutId;
    if (showConsentBanner) {
      setShouldRender(true);
      // Small delay to allow for smooth animation
      timeoutId = setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showConsentBanner]);

  // Focus trap for modal
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  // Listen for external requests to show the consent banner (e.g., footer button)
  useEffect(() => {
    const handleShowBanner = () => {
      setShowConsentBanner(true);
    };
    window.addEventListener('showConsentBanner', handleShowBanner);
    document.addEventListener('showConsentBanner', handleShowBanner);
    return () => {
      window.removeEventListener('showConsentBanner', handleShowBanner);
      document.removeEventListener('showConsentBanner', handleShowBanner);
    };
  }, [setShowConsentBanner]);

  // When exit animation completes, unmount the banner
  const handleTransitionEnd = () => {
    if (!isVisible && !showConsentBanner) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;


  return (
    <>
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          transform transition-transform duration-500 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="bg-black/70 backdrop-blur-md border-t border-white/10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  🍪 We respect your privacy
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                  We use cookies to enhance your experience and analyze site usage with Google Analytics.
                  No marketing or advertising tracking. You can manage your preferences or accept analytics.{' '}
                  <button
                    className="inline underline text-yellow-300 hover:text-yellow-200 focus:outline-none bg-transparent border-0"
                    style={{ background: 'none', padding: 0, margin: 0, fontSize: 'inherit', fontWeight: 'inherit', textDecoration: 'underline', cursor: 'pointer', verticalAlign: 'baseline', lineHeight: 'inherit' }}
                    onClick={() => setShowModal(true)}
                    aria-label="Learn more about our privacy policy"
                  >
                    Learn more about our policy
                  </button>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <button
                  onClick={declineAllConsent}
                  className="
                    px-4 py-2 text-sm font-medium text-white
                    border border-red-400/40 rounded-lg
                    hover:border-red-400/60 hover:bg-red-500/10
                    transition-all duration-200
                  "
                >
                  Decline All
                </button>
                <button
                  onClick={acceptNecessaryOnly}
                  className="
                    px-4 py-2 text-sm font-medium text-white
                    border border-white/20 rounded-lg
                    hover:border-white/40 hover:bg-white/5
                    transition-all duration-200
                  "
                >
                  Necessary Only
                </button>
                <button
                  onClick={() => {
                    acceptAllConsent();
                    if (GTM_ID) analyticsInit(GTM_ID);
                  }}
                  className="
                    px-6 py-2 text-sm font-semibold text-black
                    bg-white rounded-lg
                    hover:bg-gray-100
                    transition-all duration-200
                    shadow-lg hover:shadow-xl
                  "
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm" 
          role="dialog" 
          aria-modal="true" 
          ref={modalRef}
          onClick={(e) => {
            // Close modal when clicking outside the modal content
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-[#18181b] rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 relative animate-fadeInUp">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              aria-label="Close policy modal"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">Privacy & Cookie Policy</h2>
            <div className="space-y-3">
              {/* Expandable Card 1 */}
              <div className="bg-zinc-800 rounded-lg">
                <button className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" onClick={()=>setExpanded(e=>[!e[0],e[1],e[2]])}>
                  <span>What data do we collect?</span>
                  <span>{expanded[0] ? '−' : '+'}</span>
                </button>
                {expanded[0] && (
                  <div className="px-4 pb-3 text-gray-300 text-sm">
                    We collect only anonymous analytics data (pageviews, button clicks, device/browser info) via Google Tag Manager. No personal identifiers are stored.
                  </div>
                )}
              </div>
              {/* Expandable Card 2 */}
              <div className="bg-zinc-800 rounded-lg">
                <button className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" onClick={()=>setExpanded(e=>[e[0],!e[1],e[2]])}>
                  <span>How do we use your data?</span>
                  <span>{expanded[1] ? '−' : '+'}</span>
                </button>
                {expanded[1] && (
                  <div className="px-4 pb-3 text-gray-300 text-sm">
                    Data is used to improve site experience, analyze usage patterns, and enhance our services. We do not sell or share your data with third parties.
                  </div>
                )}
              </div>
              {/* Expandable Card 3 */}
              <div className="bg-zinc-800 rounded-lg">
                <button className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" onClick={()=>setExpanded(e=>[e[0],e[1],!e[2]])}>
                  <span>Contact & More Info</span>
                  <span>{expanded[2] ? '−' : '+'}</span>
                </button>
                {expanded[2] && (
                  <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                    <div>
                      For questions, contact us at <a href="mailto:adonsstudio3@gmail.com" className="underline text-yellow-300">adonsstudio3@gmail.com</a>.
                    </div>
                    <div className="text-xs text-gray-400 mt-2 p-2 bg-zinc-700 rounded">
                      💡 Your consent preferences can be updated anytime by accessing the Privacy Policy from the website footer and using the "Change Cookie Preferences" option.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsentBanner;