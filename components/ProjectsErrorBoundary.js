import React from 'react';

class ProjectsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProjectsErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            color: '#FFD700', 
            fontSize: '2rem', 
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Projects Temporarily Unavailable
          </h2>
          
          <p style={{ 
            color: '#cccccc', 
            marginBottom: '2rem',
            fontSize: '1.125rem',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            We're experiencing technical difficulties loading our projects showcase. 
            Please refresh the page or try again later.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#FFD700',
              color: '#000',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#FFF';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#FFD700';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProjectsErrorBoundary;