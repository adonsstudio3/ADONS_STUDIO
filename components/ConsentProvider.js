"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateConsent, gtmEvent } from '../lib/gtm';

const ConsentContext = createContext();

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
};

export const ConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState({
    analytics: false,
    functional: true, // Usually granted by default for essential functionality
    necessary: true   // Always true for necessary cookies
  });
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  useEffect(() => {
    // Check if consent has been given before
    try {
      const savedConsent = localStorage.getItem('adons-consent-preferences');
      if (savedConsent) {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
        setConsentGiven(true);
        updateGTMConsent(parsed);
      } else {
        // Show banner if no consent has been given
        setShowConsentBanner(true);
      }
    } catch (err) {
      console.error('ConsentProvider: Failed to load or parse consent from localStorage:', err);
      setShowConsentBanner(true);
    }
  }, []);

  const updateGTMConsent = (consentSettings) => {
    // Validate and sanitize consentSettings
    if (!consentSettings || typeof consentSettings !== 'object') {
      console.warn('updateGTMConsent: Invalid consentSettings, expected object but got:', consentSettings);
      return;
    }
    const toBool = (val) => typeof val === 'boolean' ? val : false;
    const analytics = toBool(consentSettings.analytics);
    const functional = toBool(consentSettings.functional);

    updateConsent({
      ad_storage: 'denied', // No marketing/advertising
      analytics_storage: analytics ? 'granted' : 'denied',
      functionality_storage: functional ? 'granted' : 'denied',
      personalization_storage: 'denied', // No personalization
      security_storage: 'granted' // Always granted for security
    });
  };

  const acceptAllConsent = () => {
    const newConsent = {
      analytics: true,
      functional: true,
      necessary: true
    };

    setConsent(newConsent);
    setConsentGiven(true);
    setShowConsentBanner(false);
    localStorage.setItem('adons-consent-preferences', JSON.stringify(newConsent));
    updateGTMConsent(newConsent);

    gtmEvent('consent_given', {
      consent_type: 'accept_all',
      analytics: true
    });
  };

  const acceptNecessaryOnly = () => {
    const newConsent = {
      analytics: false,
      functional: true,
      necessary: true
    };

    setConsent(newConsent);
    setConsentGiven(true);
    setShowConsentBanner(false);
    localStorage.setItem('adons-consent-preferences', JSON.stringify(newConsent));
    updateGTMConsent(newConsent);

    gtmEvent('consent_given', {
      consent_type: 'necessary_only',
      analytics: false
    });
  };

  const declineAllConsent = () => {
    const newConsent = {
      analytics: false,
      functional: false,
      necessary: true // Only necessary cookies allowed
    };

    setConsent(newConsent);
    setConsentGiven(true);
    setShowConsentBanner(false);
    localStorage.setItem('adons-consent-preferences', JSON.stringify(newConsent));
    updateGTMConsent(newConsent);

    gtmEvent('consent_given', {
      consent_type: 'decline_all',
      analytics: false,
      functional: false
    });
  };

  const updateConsentPreferences = (newConsent) => {
    setConsent(newConsent);
    setConsentGiven(true);
    localStorage.setItem('adons-consent-preferences', JSON.stringify(newConsent));
    updateGTMConsent(newConsent);
    gtmEvent('consent_updated', {
      analytics: newConsent.analytics,
      functional: newConsent.functional
    });
  };

  const resetConsent = () => {
    localStorage.removeItem('adons-consent-preferences');
    setConsentGiven(false);
    setShowConsentBanner(true);
    setConsent({
      analytics: false,
      functional: true,
      necessary: true
    });
  };

  return (
    <ConsentContext.Provider value={{
      consent,
      consentGiven,
      showConsentBanner,
      setShowConsentBanner,
      acceptAllConsent,
      acceptNecessaryOnly,
      declineAllConsent,
      updateConsentPreferences,
      resetConsent
    }}>
      {children}
    </ConsentContext.Provider>
  );
};