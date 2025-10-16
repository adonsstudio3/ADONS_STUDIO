// Google Tag Manager (GTM) utility functions
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KWVBM75J'; // Your actual GTM ID

// Initialize GTM
export const initGTM = () => {
  if (typeof window === 'undefined') return;
  
  // GTM script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
};

// Push events to dataLayer
export const gtmEvent = (eventName, parameters = {}) => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...parameters
  });
};

// Consent management
export const updateConsent = (consentSettings) => {
  if (typeof window === 'undefined') return;

  // Define allowed consent keys
  const allowedKeys = [
    'ad_storage',
    'analytics_storage',
    'functionality_storage',
    'personalization_storage',
    'security_storage'
  ];

  // Validate consentSettings is an object
  let validConsent = {};
  if (consentSettings && typeof consentSettings === 'object' && !Array.isArray(consentSettings)) {
    for (const [key, value] of Object.entries(consentSettings)) {
      const normalizedKey = String(key).toLowerCase();
      if (
        allowedKeys.includes(normalizedKey) &&
        (value === 'granted' || value === 'denied')
      ) {
        validConsent[normalizedKey] = value;
      }
    }
  }

  window.dataLayer = window.dataLayer || [];
  if (Object.keys(validConsent).length > 0) {
    window.dataLayer.push({
      event: 'consent_update',
      consent: validConsent
    });
  } else {
    // Optionally log a warning for invalid consent update
    if (window.console && typeof window.console.warn === 'function') {
      window.console.warn('updateConsent: No valid consent settings provided.', consentSettings);
    }
    window.dataLayer.push({
      event: 'consent_update',
      consent: {}
    });
  }
};

// Common event functions
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof pagePath !== 'string' || !pagePath.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackPageView: Invalid pagePath', pagePath);
    }
    return;
  }
  gtmEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
};

export const trackUserInteraction = (action, category, label = '', value = 0) => {
  if (typeof action !== 'string' || !action.trim() || typeof category !== 'string' || !category.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackUserInteraction: Invalid action or category', { action, category });
    }
    return;
  }
  if (typeof value !== 'number' || isNaN(value)) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackUserInteraction: Invalid value', value);
    }
    return;
  }
  gtmEvent('user_interaction', {
    action,
    category,
    label,
    value
  });
};

export const trackFormSubmission = (formName, formData = {}) => {
  if (typeof formName !== 'string' || !formName.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackFormSubmission: Invalid formName', formName);
    }
    return;
  }
  gtmEvent('form_submit', {
    form_name: formName,
    ...formData
  });
};

export const trackButtonClick = (buttonName, location) => {
  if (typeof buttonName !== 'string' || !buttonName.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackButtonClick: Invalid buttonName', buttonName);
    }
    return;
  }
  gtmEvent('button_click', {
    button_name: buttonName,
    click_location: location
  });
};

export const trackVideoInteraction = (action, videoTitle, currentTime = 0) => {
  if (typeof action !== 'string' || !action.trim() || typeof videoTitle !== 'string' || !videoTitle.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackVideoInteraction: Invalid action or videoTitle', { action, videoTitle });
    }
    return;
  }
  if (typeof currentTime !== 'number' || isNaN(currentTime) || currentTime < 0) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackVideoInteraction: Invalid currentTime', currentTime);
    }
    return;
  }
  gtmEvent('video_interaction', {
    video_action: action,
    video_title: videoTitle,
    video_current_time: currentTime
  });
};

export const trackProjectView = (projectName, projectCategory) => {
  if (typeof projectName !== 'string' || !projectName.trim() || typeof projectCategory !== 'string' || !projectCategory.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackProjectView: Invalid projectName or projectCategory', { projectName, projectCategory });
    }
    return;
  }
  gtmEvent('project_view', {
    project_name: projectName,
    project_category: projectCategory
  });
};

export const trackContactAttempt = (method, success = false) => {
  if (typeof method !== 'string' || !method.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackContactAttempt: Invalid contact method', method);
    }
    return;
  }
  gtmEvent('contact_attempt', {
    contact_method: method,
    success: !!success
  });
};

export const trackNewsletterSignup = (email, source) => {
  if (typeof source !== 'string' || !source.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackNewsletterSignup: Invalid signup source', source);
    }
    return;
  }
  gtmEvent('newsletter_signup', {
    email_provided: !!email,
    signup_source: source
  });
};

export const trackScrollDepth = (percentage) => {
  if (typeof percentage !== 'number' || isNaN(percentage) || percentage < 0 || percentage > 100) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackScrollDepth: Invalid scroll percentage', percentage);
    }
    return;
  }
  gtmEvent('scroll_depth', {
    scroll_percentage: percentage
  });
};

export const trackDownload = (fileName, fileType) => {
  if (typeof fileName !== 'string' || !fileName.trim() || typeof fileType !== 'string' || !fileType.trim()) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.warn === 'function') {
      window.console.warn('trackDownload: Invalid fileName or fileType', { fileName, fileType });
    }
    return;
  }
  gtmEvent('file_download', {
    file_name: fileName,
    file_type: fileType
  });
};

// Initialize consent with default denied state (GDPR compliant)
export const initConsent = () => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
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
};