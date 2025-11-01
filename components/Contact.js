import React, { useState } from 'react';
import { useRouter } from 'next/router'
import styles from './ContactForm.module.css';
import CountryDropdown from './CountryDropdown';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Country codes list (flag emoji, name, dial code). This is a compact but broad
// list; feel free to extend or replace with a curated dataset if you prefer.
const COUNTRY_CODES = [
  { code: 'US', flag: '🇺🇸', name: 'United States', dial: '+1' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dial: '+1' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', dial: '+61' },
  { code: 'IN', flag: '🇮🇳', name: 'India', dial: '+91' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', dial: '+49' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '+33' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', dial: '+34' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', dial: '+39' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', dial: '+31' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil', dial: '+55' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa', dial: '+27' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', dial: '+81' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea', dial: '+82' },
  { code: 'CN', flag: '🇨🇳', name: 'China', dial: '+86' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden', dial: '+46' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway', dial: '+47' },
  { code: 'DK', flag: '🇩🇰', name: 'Denmark', dial: '+45' },
  { code: 'FI', flag: '🇫🇮', name: 'Finland', dial: '+358' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium', dial: '+32' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland', dial: '+41' },
  { code: 'AT', flag: '🇦🇹', name: 'Austria', dial: '+43' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland', dial: '+353' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand', dial: '+64' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', dial: '+65' },
  { code: 'HK', flag: '🇭🇰', name: 'Hong Kong', dial: '+852' },
  { code: 'TW', flag: '🇹🇼', name: 'Taiwan', dial: '+886' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia', dial: '+7' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', dial: '+52' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina', dial: '+54' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile', dial: '+56' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia', dial: '+57' },
  { code: 'PE', flag: '🇵🇪', name: 'Peru', dial: '+51' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', dial: '+966' },
  { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', dial: '+971' },
  { code: 'TR', flag: '🇹🇷', name: 'Turkey', dial: '+90' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel', dial: '+972' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt', dial: '+20' },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria', dial: '+234' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya', dial: '+254' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana', dial: '+233' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan', dial: '+92' },
  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh', dial: '+880' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam', dial: '+84' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', dial: '+66' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia', dial: '+60' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia', dial: '+62' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines', dial: '+63' },
  { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic', dial: '+420' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland', dial: '+48' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece', dial: '+30' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', dial: '+351' },
  { code: 'HU', flag: '🇭🇺', name: 'Hungary', dial: '+36' },
  { code: 'RO', flag: '🇷🇴', name: 'Romania', dial: '+40' },
  { code: 'BG', flag: '🇧🇬', name: 'Bulgaria', dial: '+359' },
  { code: 'UA', flag: '🇺🇦', name: 'Ukraine', dial: '+380' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland', dial: '+353' }
  // Add more entries as needed
];

export default function Contact() {
  const router = useRouter()
  const formTitleRef = useScrollReveal({ duration: 0.8, delay: 0 })
  const formSubtitleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const formRef = useScrollReveal({ duration: 0.8, delay: 0.4 })
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1', // dial code (e.g. +1)
    countryAlpha: 'us', // alpha2 for flag selection (prefer lowercase)
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For phone input, allow only digits (strip non-numeric characters)
    if (name === 'phone') {
      const digits = value.replace(/\D+/g, '');
      setFormData(prev => ({ ...prev, phone: digits }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.dial,
      countryAlpha: (country.alpha2 || country.code || '').toLowerCase()
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Unknown';
      
      // Combine phone with country code
      const phoneNumber = formData.phone ? `${formData.countryCode}${formData.phone}` : '';

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          phone: phoneNumber,
          subject: formData.subject || 'Contact Form Submission',
          message: formData.message,
          source: 'contact_form'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success!
      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+1',
        countryAlpha: 'us',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 5000);

    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <section id="contact" className={`${styles.contactFormContainer} ${router && router.pathname === '/contact' ? styles.contactPageOffset : ''}`} style={{ position: 'relative', zIndex: 20, background: '#fff' }}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          {router && router.pathname === '/contact' ? null : (
            <>
              <h2 ref={formTitleRef} className={`${styles.formTitle} ${styles.formTitleGold}`}><strong>Have a project in mind ?</strong></h2>
              <p ref={formSubtitleRef} className={styles.formSubtitle}>We are ready to talk.</p>
            </>
          )}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm} noValidate>
          {/* First and Last name side-by-side */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>FIRST NAME</label>
              <input className={styles.input} type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>LAST NAME</label>
              <input className={styles.input} type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
            </div>
          </div>

          {/* Stack the rest vertically: Email, Phone, Subject, Message */}
          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ width: '100%' }}>
              <label className={styles.label}>EMAIL *</label>
              <input className={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required />
              {errors.email && <div className={styles.error}>{errors.email}</div>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ width: '100%' }}>
              <label className={styles.label}>PHONE</label>
              <div className={styles.phoneRow}>
                <CountryDropdown value={formData.countryAlpha} onChange={handleCountryChange} className={styles.countrySelectWrap} />
                <span className={styles.phoneSeparator} aria-hidden> </span>
                <input
                  className={styles.input}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ width: '100%' }}>
              <label className={styles.label}>SUBJECT</label>
              <input className={styles.input} type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Project / enquiry" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ width: '100%' }}>
              <label className={styles.label}>MESSAGE *</label>
              <textarea className={styles.textarea} name="message" value={formData.message} onChange={handleChange} rows={6} placeholder="Tell us about your project..." required />
              {errors.message && <div className={styles.error}>{errors.message}</div>}
            </div>
          </div>

          {/* Status Message */}
          {submitStatus.message && (
            <div className={styles.row}>
              <div className={submitStatus.type === 'success' ? styles.successMessage : styles.errorMessage}>
                {submitStatus.message}
              </div>
            </div>
          )}

          <div className={styles.row}>
            <div style={{ width: '100%' }}>
              <button 
                type="submit" 
                className={styles.btn} 
                style={{ width: '100%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
