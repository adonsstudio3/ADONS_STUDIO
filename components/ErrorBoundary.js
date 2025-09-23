import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
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
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          
          <h2 style={{ 
            color: '#FFD700', 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Oops! Something went wrong
          </h2>
          
          <p style={{ 
            color: '#cccccc', 
            marginBottom: '2rem',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            We encountered an unexpected error while loading this section. 
            This has been logged and we'll work to fix it.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                background: '#FFD700',
                color: '#000',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
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
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                color: '#FFD700',
                border: '2px solid #FFD700',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#FFD700';
                e.target.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#FFD700';
              }}
            >
              Reload Page
            </button>
          </div>

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left',
              background: '#2a2a2a',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #444',
              maxWidth: '100%',
              overflow: 'auto'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: '#FFD700',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                Error Details (Development Only)
              </summary>
              
              <div style={{ color: '#ff6b6b', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              </div>
              
              {this.state.errorInfo && (
                <div style={{ 
                  color: '#888', 
                  fontFamily: 'monospace', 
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;