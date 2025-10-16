// Example usage of GTM tracking in your React components
import { 
  trackButtonClick, 
  trackFormSubmission, 
  trackVideoInteraction,
  trackProjectView,
  trackContactAttempt,
  trackNewsletterSignup,
  trackDownload,
  trackScrollDepth
} from '../lib/gtm';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Example: Button Click Tracking
const ContactButton = () => {
  const handleClick = () => {
    trackButtonClick('Contact CTA', 'Hero Section');
    // Your existing click handler
  };
  
  return (
    <button onClick={handleClick}>
      Contact Us
    </button>
  );
};

// Example: Form Submission Tracking
// Minimal helper to submit a contact form to the public API endpoint
const submitContactForm = async ({ name, email, message, company }) => {
  // Input validation
  const trimmed = {
    name: (name || '').trim(),
    email: (email || '').trim(),
    message: (message || '').trim(),
    company: (company || '').trim(),
  };
  const max = { name: 100, email: 255, message: 5000, company: 200 };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed.name || !trimmed.email || !trimmed.message) {
    throw { type: 'validation', message: 'Missing required fields', fields: { name: !trimmed.name, email: !trimmed.email, message: !trimmed.message } };
  }
  if (trimmed.name.length > max.name) throw { type: 'validation', message: 'Name too long' };
  if (trimmed.email.length > max.email) throw { type: 'validation', message: 'Email too long' };
  if (!emailRegex.test(trimmed.email)) throw { type: 'validation', message: 'Invalid email format' };
  if (trimmed.message.length > max.message) throw { type: 'validation', message: 'Message too long' };
  if (trimmed.company.length > max.company) throw { type: 'validation', message: 'Company name too long' };

  let res;
  try {
    res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trimmed)
    });
  } catch (err) {
    throw { type: 'network', message: 'Network error or timeout', error: err };
  }

  let body;
  const contentType = res.headers.get('Content-Type') || '';
  if (!res.ok) {
    try {
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }
    } catch (e) {
      body = '[unreadable response]';
    }
    throw {
      type: 'api',
      status: res.status,
      statusText: res.statusText,
      body
    };
  }

  try {
    if (contentType.includes('application/json')) {
      return await res.json();
    } else {
      // Unexpected content type
      console.warn('Expected JSON response but got:', contentType);
      return {};
    }
  } catch (e) {
    console.warn('Failed to parse contact API response:', e);
    return { parseError: true };
  }
};

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await submitContactForm({ name, email, message, company });

      // Track successful submission
      trackFormSubmission('contact_form', {
        form_location: 'contact_page',
        form_fields: ['name', 'email', 'message']
      });
      trackContactAttempt('contact_form', true);

      setFeedback({ type: 'success', text: 'Thanks — your message has been sent.' });
      setName(''); setEmail(''); setCompany(''); setMessage('');
    } catch (err) {
      console.error('Contact submission failed:', err);
      trackContactAttempt('contact_form', false);
      setFeedback({ type: 'error', text: 'Submission failed — please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company (optional)"
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message"
        required
        rows={5}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send message'}</button>
        {feedback && (
          <span style={{ color: feedback.type === 'error' ? 'crimson' : 'green' }}>{feedback.text}</span>
        )}
      </div>
    </form>
  );
};

// Example: Video Interaction Tracking
const VideoPlayer = ({ videoTitle }) => {
  const handlePlay = () => {
    trackVideoInteraction('play', videoTitle);
  };
  
  const handlePause = () => {
    trackVideoInteraction('pause', videoTitle);
  };
  
  const handleEnd = () => {
    trackVideoInteraction('complete', videoTitle);
  };
  
  // Return a simple video player wired to tracking handlers
  return (
    <div className="video-player" style={{ maxWidth: 640 }}>
      <video
        controls
        aria-label={videoTitle || 'Video player'}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnd}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Provide a fallback source - replace with your video URL when using this example */}
        <source src="/videos/example.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {videoTitle && <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>{videoTitle}</div>}
    </div>
  );
};

// Example: Project View Tracking
const ProjectCard = ({ project }) => {
  const router = useRouter();
  const handleViewProject = () => {
    trackProjectView(project.name, project.category);
    if (project && (project.slug || project.id)) {
      const target = `/projects/${project.slug || project.id}`;
      router.push(target);
    }
  };

  return (
    <div className="project-card" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{project?.name || 'Untitled Project'}</h3>
      <p style={{ margin: '6px 0', color: '#666' }}>{project?.category || 'Uncategorized'}</p>
      <button onClick={handleViewProject} aria-label={`View ${project?.name || 'project'}`}>
        View Project
      </button>
    </div>
  );
};

// Example: Newsletter Signup Tracking
// Minimal helper to subscribe to the newsletter. Replace with your real API integration.
const subscribeToNewsletter = async (email) => {
  const trimmed = (email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed) throw new Error('Email is required');
  if (!emailRegex.test(trimmed)) throw new Error('Invalid email address');
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmed })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Newsletter subscription failed: ${res.status} ${text}`);
  }

  return await res.json().catch(() => ({}));
};

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await subscribeToNewsletter(email);
      trackNewsletterSignup(email, 'footer_form');
      setMessage({ type: 'success', text: 'Subscribed successfully. Thank you!' });
      setEmail('');
    } catch (err) {
      console.error('Newsletter signup failed:', err);
      setMessage({ type: 'error', text: 'Subscription failed. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
      {message && (
        <span style={{ marginLeft: 8, color: message.type === 'error' ? 'crimson' : 'green' }}>{message.text}</span>
      )}
    </form>
  );
};

// Example: File Download Tracking
const DownloadLink = ({ fileName, fileUrl }) => {
  const handleDownload = () => {
    const fileExtension = fileName.split('.').pop();
    trackDownload(fileName, fileExtension);
  };
  
  return (
    <a href={fileUrl} onClick={handleDownload} download>
      Download {fileName}
    </a>
  );
};

// Example: Scroll Depth Tracking
const ScrollTracker = () => {
  useEffect(() => {
    let ticking = false;
    const trackedPercentages = new Set();
    
    const trackScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Track at 25%, 50%, 75%, and 90%
      const milestones = [25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedPercentages.has(milestone)) {
          trackScrollDepth(milestone);
          trackedPercentages.add(milestone);
        }
      });
      
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(trackScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return null; // This is a tracking component
};

export {
  ContactButton,
  ContactForm,
  VideoPlayer,
  ProjectCard,
  NewsletterForm,
  DownloadLink,
  ScrollTracker
};