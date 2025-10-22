'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/ProjectsDesign.module.css';
import OptimizedImage from './OptimizedImage';
import analytics, { consentGiven } from '../lib/analytics';
import { useRealtimePublicProjects } from '../hooks/useRealtimePublicProjects';
import { usePublicShowreels } from '../hooks/usePublicShowreels';

// Internal error boundary hook for catching and handling errors within the component
const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  const handleError = (error, errorInfo) => {
    console.error('ProjectsDesign Error:', error, errorInfo);
    setError({ error, errorInfo });
  };

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection in ProjectsDesign:', event.reason);
      handleError(new Error('Unhandled Promise Rejection'), { componentStack: 'Promise rejection' });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return { error, resetError, handleError };
};

// Helper to emit analytics events only when the user has given consent.
// This prevents sending events unexpectedly and centralizes try/catch logic.
const safeAnalyticsEvent = (name, props) => {
  try {
    if (typeof consentGiven === 'function' && !consentGiven()) return;
    if (analytics && typeof analytics.event === 'function') analytics.event(name, props);
  } catch (e) {
    // Non-fatal: don't let analytics failures break UI
    console.warn('Analytics event failed:', e);
  }
};

const ProjectsDesign = () => {
  const { error, resetError, handleError } = useErrorHandler();
  
  // Typing animation state
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [descVisible, setDescVisible] = useState(false);
  const [showShowreel, setShowShowreel] = useState(false);
  const subtitleFull = "Bringing Imagination To Life";

  // Use realtime projects hook - no more manual API fetching!
  const { projects, loading: projectsLoading, error: projectsError } = useRealtimePublicProjects();

  // Use public showreels hook - polls every 60 seconds, updates automatically!
  const { featuredShowreel, loading: showreelLoading } = usePublicShowreels();

  console.log('🔄 Projects from realtime:', projects.length);
  console.log('🎥 Featured showreel from polling:', featuredShowreel?.title || 'None');

  // If there's an internal error, show error UI
  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#1a1a1a',
        color: '#ffffff',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{ color: '#FFD700', marginBottom: '1rem' }}>
          Projects Section Temporarily Unavailable
        </h2>
        <p style={{ color: '#cccccc', marginBottom: '2rem' }}>
          We're experiencing technical difficulties. Please try again.
        </p>
        <button
          onClick={resetError}
          style={{
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Realtime handles project fetching automatically - no manual fetch needed!
  // Projects are updated in real-time via useRealtimePublicProjects hook
  // Showreels are updated every 60s via usePublicShowreels hook

  // Handle project card click - opens project URL in new tab
  const handleProjectClick = useCallback((project, event) => {
    console.log('Card clicked:', {
      title: project.title,
      hasUrl: !!project.project_url,
      url: project.project_url
    });

    if (!project.project_url) {
      console.warn('Project has no URL:', project.title);
      return;
    }

    try {
      console.log('Opening URL:', project.project_url);
      window.open(project.project_url, '_blank', 'noopener,noreferrer');

      // Remove focus from the card to prevent stuck hover state
      if (event && event.currentTarget) {
        event.currentTarget.blur();
      }

      safeAnalyticsEvent('project_click', {
        project_id: project.id,
        project_title: project.title,
        project_url: project.project_url,
        category: project.category,
        platform: project.platform
      });
    } catch (error) {
      console.error('Failed to open project URL:', error);
    }
  }, []);

  // Display only real projects from database - no demo fallback
  const displayProjects = projects || [];

  // No modal state: expanded project modals removed per client request

  const playShowreel = useCallback(() => {
    setShowShowreel(true);
    safeAnalyticsEvent('showreel_play', { method: 'hero_button' });
  }, []);

  const closeShowreel = useCallback(() => {
    setShowShowreel(false);
    safeAnalyticsEvent('showreel_close', { method: 'overlay' });
  }, []);

  // Close the showreel when clicking the backdrop (only when clicking the overlay itself)
  const handleShowreelOverlayClick = useCallback((e) => {
    // Only close when clicking directly on the overlay container, not its children
    if (e.target === e.currentTarget) {
      setShowShowreel(false);
      safeAnalyticsEvent('showreel_close', { method: 'backdrop' });
    }
  }, []);

  // Close showreel on Escape key for accessibility
  useEffect(() => {
    if (!showShowreel) return;
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') setShowShowreel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showShowreel]);

  // openModal/closeModal removed — cards do not expand into modals

  // Typing animation effect with safety checks
  useEffect(() => {
    let subtitleTimer, descTimer, subtitleDelay;
    let j = 0;
    let isMounted = true; // Safety flag to prevent state updates after unmount
    
    console.log('Starting typing animation useEffect'); // Debug log
    
    try {
      setTypedSubtitle('');
      setDescVisible(false);

      // Type subtitle with safety check
      const typeSubtitle = () => {
        if (!isMounted) return; // Prevent updates if component unmounted
        
        try {
          if (j <= subtitleFull.length) {
            const currentText = subtitleFull.slice(0, j);
            setTypedSubtitle(currentText);
            console.log('Typing animation progress:', currentText); // Debug log
            j++;
            subtitleTimer = setTimeout(typeSubtitle, 40);
          } else {
            // After subtitle, fade in desc
            descTimer = setTimeout(() => {
              if (isMounted) setDescVisible(true);
            }, 250);
          }
        } catch (error) {
          console.error('Error in typing animation:', error);
        }
      };
      
      // Start subtitle animation after a short delay
      subtitleDelay = setTimeout(typeSubtitle, 300);
    } catch (error) {
      console.error('Error setting up typing animation:', error);
    }
    
    return () => {
      isMounted = false; // Mark as unmounted
      clearTimeout(subtitleTimer);
      clearTimeout(descTimer);
      clearTimeout(subtitleDelay);
    };
  }, []); // Remove dependencies to prevent re-runs

  // Body overflow handling only for showreel (modal removed)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow || '';
    if (showShowreel) document.body.style.overflow = 'hidden';

    return () => {
      try {
        document.body.style.overflow = originalOverflow;
      } catch (error) {
        console.warn('Failed to restore body overflow:', error);
        document.body.style.removeProperty('overflow');
      }
    };
  }, [showShowreel]);

  return (
    <div className={styles.vfxContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroVideoContainer}>
          <OptimizedImage 
            name="hero/project" 
            alt="Showreel Preview" 
            className={styles.heroBackground}
            style={{ display: 'block' }}
            width={1920}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <h2 className="heroTitle">Portfolio & Showreel</h2>
          <p className="heroSubtitle" style={{ color: '#FFD700', fontSize: '1.25rem', fontWeight: '400', textAlign: 'center', marginBottom: '1.2rem', minHeight: '1.875rem' }}>
            {typedSubtitle}
          </p>
          <p className={styles.heroDescription + ' ' + (descVisible ? styles.showDesc : '')}>
            {/* Removed hero description as requested */}
          </p>
          <button className={styles.playButton} onClick={playShowreel} aria-label="Play Main Showreel">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#FFD700"/>
              <polygon points="25,20 25,40 40,30" fill="#000"/>
            </svg>
            <span>Play Showreel</span>
          </button>

          {showShowreel && (
            <div className={styles.showreelOverlay} onClick={handleShowreelOverlayClick}>
              <button
                onClick={closeShowreel}
                className={styles.showreelCloseBtn}
                aria-label="Close showreel"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div style={{ maxWidth: '98vw', maxHeight: '90vh', background: 'transparent', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {
                  // Choose the top active showreel (featured first, then latest)
                }
                <iframe
                  width="1000"
                  height="562"
                  src={(() => {
                    try {
                      const active = featuredShowreel;
                      if (!active || !active.video_url) return 'about:blank';
                      const m = active.video_url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
                      const id = m ? m[1] : null;
                      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : 'about:blank';
                    } catch (e) {
                      console.error('Error building showreel embed URL', e);
                      return 'about:blank';
                    }
                  })()}
                  title="Adons Studio Showreel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.showreelIframe}
                  onError={(e) => {
                    console.error('Showreel iframe failed to load');
                    handleError(new Error('Showreel load failed'), { componentStack: 'showreel iframe' });
                  }}
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter Navigation removed */}

      {/* Projects Grid with clickable cards */}
      <section className={styles.projectsSection}>
        {projectsLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading projects...</p>
          </div>
        )}
        
        {projectsError && (
          <div className={styles.errorContainer}>
            <p>Error loading projects: {projectsError}</p>
            <p>Showing demo projects instead.</p>
          </div>
        )}

        <div className={styles.projectsGrid}>
          {displayProjects.map((project) => (
            <article
              key={project.id}
              className={`${styles.projectCard} ${project.project_url ? styles.clickableCard : ''}`}
              onClick={project.project_url ? (e) => handleProjectClick(project, e) : undefined}
              onKeyDown={project.project_url ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(project, e);
                }
              } : undefined}
              tabIndex={project.project_url ? 0 : -1}
              role={project.project_url ? "button" : "article"}
              aria-label={project.project_url ? `View project: ${project.title}` : project.title}
              title={project.project_url ? `Click to view ${project.title}` : project.title}
            >
              <img
                src={project.thumbnail_url || project.thumbnail_image_url || project.thumbnail || '/Images/placeholder-project.svg'}
                alt={project.title}
                className={styles.projectThumbnail}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully:', {
                    title: project.title,
                    src: e.target.src
                  });
                }}
                onError={e => {
                  console.error('❌ Image failed to load:', {
                    title: project.title,
                    attemptedSrc: e.target.src,
                    thumbnail_url: project.thumbnail_url
                  });
                  // Only hide if not already hidden
                  if (e.target.style.display !== 'none') {
                    e.target.alt = 'Image unavailable';
                    e.target.src = '/Images/placeholder-project.svg';
                  }
                }}
              />
              <div className={styles.projectOverlay}>
                <div style={{ width: '100%' }}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  {project.description && <p className={styles.projectSubtitle}>{project.description}</p>}
                  {project.client_name && (
                    <p className={styles.projectClient}>Client: {project.client_name}</p>
                  )}
                  {project.project_url && (
                    <div className={styles.projectCTA}>
                      <span className={styles.ctaText}>Click to view →</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Tags placed at the top-right of the card (positioned relative to .projectCard) */}
              {project.tags && project.tags.length > 0 && (
                <div className={styles.projectTags} role="list" aria-label="Project tags">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={styles.projectTag}
                      role="button"
                      tabIndex={0}
                      aria-label={`Project tag: ${tag}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        safeAnalyticsEvent('tag_click', { tag, project: project.id });
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation(); // Prevent card click
                          safeAnalyticsEvent('tag_click', { tag, project: project.id });
                        }
                      }}
                    >
                      <span aria-hidden="true">{tag}</span>
                      <span style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                        Project tag: {tag}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {/* Featured badge */}
              {project.is_featured && (
                <div className={styles.featuredBadge} aria-label="Featured project">
                  ⭐ Featured
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default ProjectsDesign;
