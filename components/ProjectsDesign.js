'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/ProjectsDesign.module.css';

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

const ProjectsDesign = () => {
  const { error, resetError, handleError } = useErrorHandler();
  
  // Typing animation state
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [descVisible, setDescVisible] = useState(false);
  const [showShowreel, setShowShowreel] = useState(false);
  const subtitleFull = "Bringing Imagination To Life";

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

  const [projects] = useState([
    {
      id: 1,
      title: "Quantum Realms",
      category: "VFX",
      client: "Marvel Studios",
      year: "2024",
      description: "Epic dimensional portal sequences featuring complex particle systems and reality-bending visual effects.",
      software: "Houdini, After Effects, Nuke",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
      featured: true
    },
    {
      id: 2,
      title: "Future City",
      category: "3D Animation",
      client: "Tesla",
      year: "2024",
      description: "Photorealistic architectural visualization of autonomous vehicle infrastructure in futuristic cityscapes.",
      software: "Cinema 4D, Octane, After Effects",
      thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Elemental Fury",
      category: "VFX",
      client: "Warner Bros",
      year: "2024",
      description: "Large-scale destruction sequences with realistic fire, water, and debris simulations.",
      software: "Houdini, Maya, Nuke",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Luxury Redefined",
      category: "Commercials",
      client: "Mercedes-Benz",
      year: "2024",
      description: "High-end automotive commercial with sophisticated lighting and product visualization.",
      software: "Cinema 4D, Redshift, After Effects",
      thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop"
    },
    {
      id: 5,
      title: "Digital Dreams",
      category: "Motion Graphics",
      client: "Adobe",
      year: "2024",
      description: "Abstract motion graphics piece exploring the intersection of creativity and technology.",
      software: "After Effects, Cinema 4D, Illustrator",
      thumbnail: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Ocean Deep",
      category: "Compositing",
      client: "National Geographic",
      year: "2024",
      description: "Underwater documentary sequences with seamless creature integration and environmental compositing.",
      software: "Nuke, After Effects, Mocha",
      thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
    },
    {
      id: 7,
      title: "Neon Nights",
      category: "Motion Graphics",
      client: "Spotify",
      year: "2023",
      description: "Vibrant music visualization with dynamic typography and pulsing geometric forms.",
      software: "After Effects, Cinema 4D, X-Particles",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
    },
    {
      id: 8,
      title: "Space Odyssey",
      category: "VFX",
      client: "Netflix",
      year: "2023",
      description: "Spectacular space battle sequences with detailed spacecraft and nebula environments.",
      software: "Houdini, Maya, Nuke, After Effects",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop"
    },
    {
      id: 9,
      title: "Product Showcase",
      category: "3D Animation",
      client: "Apple",
      year: "2023",
      description: "Clean, minimal product animation highlighting innovative design and functionality.",
      software: "Cinema 4D, Octane, After Effects",
      thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
    },
    {
      id: 10,
      title: "Urban Legends",
      category: "Compositing",
      client: "HBO",
      year: "2023",
      description: "Complex urban environment compositing with crowd simulation and atmospheric effects.",
      software: "Nuke, Houdini, After Effects",
      thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop"
    }
  ]);

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filters = ['All', 'VFX', 'Motion Graphics', '3D Animation', 'Compositing', 'Commercials'];

  const handleFilterClick = useCallback((filter) => {
    setActiveFilter(filter);
    
    if (filter === 'All') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === filter));
    }
  }, [projects]);

  const openModal = useCallback((projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        console.warn('Project not found:', projectId);
        return;
      }

      setSelectedProject(project);
      setCurrentProjectIndex(filteredProjects.findIndex(p => p.id === projectId));
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error opening modal:', error);
      handleError(error, { componentStack: 'openModal function' });
    }
  }, [projects, filteredProjects, handleError]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedProject(null);
  }, []);

  const navigateModal = useCallback((direction) => {
    try {
      const newIndex = currentProjectIndex + direction;
      
      if (newIndex >= 0 && newIndex < filteredProjects.length) {
        const project = filteredProjects[newIndex];
        if (project) {
          setSelectedProject(project);
          setCurrentProjectIndex(newIndex);
        }
      }
    } catch (error) {
      console.error('Error navigating modal:', error);
      handleError(error, { componentStack: 'navigateModal function' });
    }
  }, [currentProjectIndex, filteredProjects, handleError]);

  const playShowreel = useCallback(() => {
    setShowShowreel(true);
  }, []);

  const closeShowreel = useCallback(() => {
    setShowShowreel(false);
  }, []);

  // Keyboard navigation with safety checks
  useEffect(() => {
    if (!isModalVisible) return;

    const handleKeyPress = (e) => {
      // Additional safety check
      if (!isModalVisible) return;

      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          e.preventDefault(); // Prevent default browser behavior
          navigateModal(-1);
          break;
        case 'ArrowRight':
          e.preventDefault(); // Prevent default browser behavior
          navigateModal(1);
          break;
        default:
          break; // Explicit default case
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalVisible, closeModal, navigateModal]);

  // Parallax effect for hero background with safety checks
  useEffect(() => {
    let ticking = false;
    let isMounted = true;

    const updateScrollEffects = () => {
      if (!isMounted) return; // Safety check
      
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      
      const hero = document.querySelector(`.${styles.heroBackground}`);
      if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking && isMounted) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      isMounted = false; // Mark as unmounted
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  // Centralized body overflow handling with improved safety
  useEffect(() => {
    if (isModalVisible || showShowreel) {
      // Store the original value more safely
      const originalOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original value safely
        try {
          document.body.style.overflow = originalOverflow;
        } catch (error) {
          console.warn('Failed to restore body overflow:', error);
          // Fallback: remove the property entirely
          document.body.style.removeProperty('overflow');
        }
      };
    }
    
    // Ensure overflow is cleared when neither modal is open
    if (!isModalVisible && !showShowreel) {
      try {
        document.body.style.removeProperty('overflow');
      } catch (error) {
        console.warn('Failed to clear body overflow:', error);
      }
    }
    
    return () => {}; // No-op cleanup when no action needed
  }, [isModalVisible, showShowreel]);

  return (
    <div className={styles.vfxContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroVideoContainer}>
          <img 
            src="/Images/hero/Team.jpg" 
            alt="Showreel Preview" 
            className={styles.heroBackground}
            onError={(e) => {
              console.warn('Hero image failed to load');
              e.target.style.display = 'none';
            }}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <h2 className="heroTitle">Portfolio & Showreel</h2>
          <p className="heroSubtitle" style={{ color: '#FFD700', fontSize: '1.25rem', fontWeight: '400', textAlign: 'center', marginBottom: '1.2rem' }}>
            {typedSubtitle || "Bringing Imagination To Life"}
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
            <div className={styles.showreelOverlay}>
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
                <iframe
                  width="1000"
                  height="562"
                  src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1"
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

      {/* Filter Navigation */}
      <section className={styles.filterSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className={styles.filterNav} role="navigation" aria-label="Project categories">
            {filters.map(filter => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Projects Grid */}
      <section className={styles.projectsSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={styles.projectsGrid}>
            {filteredProjects.length === 0 ? (
              <div className={styles.noProjects}>
                No projects found for this filter.
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={styles.projectCard}
                  onClick={() => openModal(project.id)}
                >
                  {/* Image removed as per request */}
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectInfo}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <span className={styles.projectCategory}>{project.category}</span>
                      <p className={styles.projectDescription}>{project.description}</p>
                      <div className={styles.projectMeta}>
                        <span><strong>Client:</strong> {project.client}</span>
                        <span><strong>Year:</strong> {project.year}</span>
                      </div>
                      <button 
                        className={styles.viewProjectBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(project.id);
                        }}
                      >
                        View Project
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && (
        <div 
          className={`${styles.modal} ${isModalVisible ? styles.visible : styles.hidden}`}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modalTitle"
        >
          <div className={styles.modalOverlay} onClick={closeModal}></div>
          <div className={styles.modalContent}>
            <button 
              className={styles.modalClose} 
              onClick={closeModal} 
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className={styles.modalBody}>
              <div className={styles.modalMedia}>
                {/* Modal image removed as per request */}
                <div className={styles.modalPlayOverlay}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="rgba(255, 215, 0, 0.9)"/>
                    <polygon points="32,25 32,55 55,40" fill="#000"/>
                  </svg>
                </div>
              </div>
              
              <div className={styles.modalInfo}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalProjectTitle}>{selectedProject.title}</h2>
                  <span className={styles.modalCategoryBadge}>{selectedProject.category}</span>
                </div>
                
                <div className={styles.modalDetails}>
                  <div className={styles.modalMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Client:</span>
                      <span className={styles.metaValue}>{selectedProject.client}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Year:</span>
                      <span className={styles.metaValue}>{selectedProject.year}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Software:</span>
                      <span className={styles.metaValue}>{selectedProject.software}</span>
                    </div>
                  </div>
                  
                  <p className={styles.modalDescription}>{selectedProject.description}</p>
                </div>
              </div>
            </div>
            
            <nav className={styles.modalNavigation}>
              <button 
                className={styles.modalNavBtn}
                onClick={() => navigateModal(-1)} 
                disabled={currentProjectIndex === 0}
                aria-label="Previous project"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <button 
                className={styles.modalNavBtn}
                onClick={() => navigateModal(1)} 
                disabled={currentProjectIndex === filteredProjects.length - 1}
                aria-label="Next project"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDesign;
