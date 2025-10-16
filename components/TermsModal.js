import React, { useState, useEffect, useRef } from 'react';

const TermsModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState([false, false, false, false, false, false, false, false, false]);
  const modalRef = useRef(null);

  // Listen for footer terms click
  useEffect(() => {
    const handleOpenTermsModal = () => {
      console.log('Terms modal event received'); // Debug log
      setShowModal(true);
    };
    
    window.addEventListener('openTermsModal', handleOpenTermsModal);
    document.addEventListener('openTermsModal', handleOpenTermsModal);
    
    return () => {
      window.removeEventListener('openTermsModal', handleOpenTermsModal);
      document.removeEventListener('openTermsModal', handleOpenTermsModal);
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
      <div className="bg-[#18181b] rounded-xl shadow-2xl max-w-4xl w-full mx-4 p-6 relative animate-fadeInUp max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close terms modal"
          onClick={() => setShowModal(false)}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">Terms and Conditions</h2>
        <p className="text-gray-300 text-sm mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-3">
          {/* Section 1: Acceptance of Terms */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [!e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8]])}
            >
              <span>1. Acceptance of Terms</span>
              <span>{expanded[0] ? '−' : '+'}</span>
            </button>
            {expanded[0] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>By accessing and using the ADONS Studio website ("Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
                <p>If you do not agree to abide by the above, please do not use this service.</p>
              </div>
            )}
          </div>

          {/* Section 2: Services */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], !e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8]])}
            >
              <span>2. Services Offered</span>
              <span>{expanded[1] ? '−' : '+'}</span>
            </button>
            {expanded[1] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>ADONS Studio provides professional digital media services including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Visual Effects (VFX) for films, TV shows, and commercials</li>
                  <li>3D Animation and modeling</li>
                  <li>Post-production services including color grading and sound design</li>
                  <li>Virtual production and LED wall services</li>
                  <li>Motion graphics and particle effects</li>
                  <li>Digital environments and compositing</li>
                </ul>
                <p>All services are subject to separate project agreements and are provided on a project-by-project basis.</p>
              </div>
            )}
          </div>

          {/* Section 3: Intellectual Property */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], !e[2], e[3], e[4], e[5], e[6], e[7], e[8]])}
            >
              <span>3. Intellectual Property</span>
              <span>{expanded[2] ? '−' : '+'}</span>
            </button>
            {expanded[2] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>All content on this website, including but not limited to text, graphics, logos, images, audio clips, video content, and software, is the property of ADONS Studio or its content suppliers and is protected by copyright laws.</p>
                <p>The compilation of all content on this site is the exclusive property of ADONS Studio and is protected by copyright laws.</p>
                <p>You may not reproduce, distribute, modify, or create derivative works of our content without express written permission.</p>
                <p>Project-specific intellectual property rights will be governed by individual project agreements.</p>
              </div>
            )}
          </div>

          {/* Section 4: User Conduct */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], !e[3], e[4], e[5], e[6], e[7], e[8]])}
            >
              <span>4. User Conduct</span>
              <span>{expanded[3] ? '−' : '+'}</span>
            </button>
            {expanded[3] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any harmful, threatening, or offensive content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Use automated systems to access our content without permission</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 5: Privacy & Data */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], e[3], !e[4], e[5], e[6], e[7], e[8]])}
            >
              <span>5. Privacy & Data Collection</span>
              <span>{expanded[4] ? '−' : '+'}</span>
            </button>
            {expanded[4] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>We collect and use information in accordance with our Privacy Policy. By using our Service, you consent to the collection and use of information as outlined in our Privacy Policy.</p>
                <p>We use Google Tag Manager for analytics to improve user experience. This data collection is anonymous and used solely for website optimization.</p>
                <p>You may opt out of analytics tracking through our consent banner.</p>
              </div>
            )}
          </div>

          {/* Section 6: Disclaimers */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], e[3], e[4], !e[5], e[6], e[7], e[8]])}
            >
              <span>6. Disclaimers & Limitations</span>
              <span>{expanded[5] ? '−' : '+'}</span>
            </button>
            {expanded[5] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
                <p>ADONS Studio does not warrant that the Service will be uninterrupted, error-free, or completely secure.</p>
                <p>We reserve the right to modify, suspend, or discontinue the Service at any time without notice.</p>
                <p>Portfolio items shown are examples of our work and may not represent current availability or exact deliverables for your project.</p>
              </div>
            )}
          </div>

          {/* Section 7: Project Terms */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], e[3], e[4], e[5], !e[6], e[7], e[8]])}
            >
              <span>7. Project Agreements</span>
              <span>{expanded[6] ? '−' : '+'}</span>
            </button>
            {expanded[6] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>Professional services are governed by separate project agreements that will include:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Detailed scope of work and deliverables</li>
                  <li>Project timeline and milestones</li>
                  <li>Payment terms and conditions</li>
                  <li>Intellectual property ownership</li>
                  <li>Revision policies and additional work terms</li>
                  <li>Confidentiality and non-disclosure provisions</li>
                </ul>
                <p>These terms serve as a general framework; specific project terms will take precedence for contracted work.</p>
              </div>
            )}
          </div>

          {/* Section 8: Contact & Governing Law */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], e[3], e[4], e[5], e[6], !e[7], e[8]])}
            >
              <span>8. Governing Law</span>
              <span>{expanded[7] ? '−' : '+'}</span>
            </button>
            {expanded[7] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>These Terms and Conditions are governed by and construed in accordance with applicable laws.</p>
                <p>Any disputes arising from these terms or use of our Service will be resolved through appropriate legal channels.</p>
                <p>If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.</p>
              </div>
            )}
          </div>

          {/* Section 9: Changes & Contact */}
          <div className="bg-zinc-800 rounded-lg">
            <button 
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold focus:outline-none" 
              onClick={() => setExpanded(e => [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], !e[8]])}
            >
              <span>9. Changes & Contact Information</span>
              <span>{expanded[8] ? '−' : '+'}</span>
            </button>
            {expanded[8] && (
              <div className="px-4 pb-3 text-gray-300 text-sm space-y-2">
                <p>ADONS Studio reserves the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated "Last modified" date.</p>
                <p>Continued use of the Service after changes constitutes acceptance of the modified terms.</p>
                <div className="mt-3 p-3 bg-zinc-700 rounded">
                  <p className="font-semibold text-yellow-300 mb-2">Contact Information:</p>
                  <p>Email: <a href="mailto:adonsstudio3@gmail.com" className="underline text-yellow-300">adonsstudio3@gmail.com</a></p>
                  <p>Website: ADONS Studio</p>
                  <p>For project inquiries, legal questions, or terms clarification, please reach out using the contact information above.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;