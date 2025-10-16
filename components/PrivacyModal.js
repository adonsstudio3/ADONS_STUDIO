import React, { useState, useEffect, useRef } from 'react';

const PrivacyModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState([false, false, false]);
  const modalRef = useRef(null);

  // Listen for footer privacy policy click
  useEffect(() => {
    const handleOpenPrivacyModal = () => {
      console.log('Privacy modal event received'); // Debug log
      setShowModal(true);
    };
    
    window.addEventListener('openPrivacyModal', handleOpenPrivacyModal);
    document.addEventListener('openPrivacyModal', handleOpenPrivacyModal);
    
    return () => {
      window.removeEventListener('openPrivacyModal', handleOpenPrivacyModal);
      document.removeEventListener('openPrivacyModal', handleOpenPrivacyModal);
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm pt-20" 
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
      <div className="bg-[#18181b] rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 relative animate-fadeInUp max-h-[80vh] overflow-y-auto">
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
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [!e[0], e[1], e[2]])}
            >
              <span>What information do we collect?</span>
              <span>{expanded[0] ? '−' : '+'}</span>
            </button>
            {expanded[0] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p><strong>Analytics Data:</strong> We collect anonymous usage data through Google Tag Manager including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Page views and navigation patterns</li>
                  <li>Device type, browser, and screen resolution</li>
                  <li>Geographic location (country/city level)</li>
                  <li>Interaction with portfolio projects and showreel</li>
                  <li>Time spent on different sections of our website</li>
                </ul>
                <p><strong>Contact Forms:</strong> When you contact us for project inquiries, we collect the information you provide (name, email, project details).</p>
                <p><strong>No Personal Tracking:</strong> We do not collect personal identifiers, IP addresses, or create individual user profiles.</p>
              </div>
            )}
          </div>
          
          {/* Expandable Card 2 */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], !e[1], e[2]])}
            >
              <span>How do we use your information?</span>
              <span>{expanded[1] ? '−' : '+'}</span>
            </button>
            {expanded[1] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p><strong>Website Optimization:</strong> Analytics data helps us understand which services and portfolio pieces resonate most with visitors.</p>
                <p><strong>Content Improvement:</strong> We analyze viewing patterns to improve our VFX showreel, portfolio presentation, and service descriptions.</p>
                <p><strong>Technical Enhancement:</strong> Usage data helps us optimize loading times and user experience across devices.</p>
                <p><strong>Business Insights:</strong> Aggregate data helps us understand demand for different services (VFX, 3D animation, post-production).</p>
                <p><strong>No Marketing:</strong> We do not use this data for advertising, remarketing, or sharing with third parties beyond Google Analytics.</p>
                <p><strong>Project Communications:</strong> Contact form data is used solely to respond to your project inquiries.</p>
              </div>
            )}
          </div>
          
          {/* Expandable Card 3 */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], !e[2]])}
            >
              <span>Your Rights & Contact</span>
              <span>{expanded[2] ? '−' : '+'}</span>
            </button>
            {expanded[2] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-3">
                <div>
                  <p><strong>Your Control:</strong> You can withdraw consent for analytics tracking at any time using the consent banner when it appears on the website.</p>
                  <p><strong>Data Retention:</strong> Analytics data is automatically deleted according to Google Analytics retention settings (26 months maximum).</p>
                  <p><strong>No Cookies:</strong> We use Google Tag Manager's cookieless tracking methods where possible.</p>
                </div>
                
                {/* Change Consent Button for Footer */}
                <div className="bg-zinc-700 rounded p-3 border border-zinc-600">
                  <p className="text-white font-semibold mb-2">Manage Your Consent:</p>
                  <button
                    onClick={() => {
                      // Clear main consent storage used by ConsentProvider and legacy keys
                      localStorage.removeItem('adons-consent-preferences');
                      localStorage.removeItem('adons-analytics-consent');
                      localStorage.removeItem('adons-consent-timestamp');
                      setShowModal(false);
                      // Dispatch event to show consent banner (ConsentProvider will react)
                      window.dispatchEvent(new Event('showConsentBanner'));
                    }}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    Change Cookie Preferences
                  </button>
                </div>

                <div>
                  <p><strong>Contact Us:</strong> For privacy questions or data requests, contact us at <a href="mailto:adonsstudio3@gmail.com" className="underline text-yellow-300">adonsstudio3@gmail.com</a></p>
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date().toLocaleDateString()} • This policy applies to adonsstudio.com
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;