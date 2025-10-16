'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseClient } from '@/lib/supabase';
import styles from './AdminLoginGlassmorphic.module.css';

export default function AdminLoginGlassmorphic() {
  const router = useRouter();
  const { signInAsAdmin, isAuthenticated, isAdmin, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Check for error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Access denied. Only adonsstudio3@gmail.com is authorized.');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInAsAdmin(formData.email, formData.password);
      router.push('/admin/dashboard');
    } catch (authError) {
      console.error('Admin login error:', authError);
      setError(authError.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setIsLoading(true);
    setError('');
    setMagicLinkSent(false);

    // Only allow magic link for the authorized admin email
    if (formData.email !== 'adonsstudio3@gmail.com') {
      setError('Invalid credentials');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true, // Allow user creation for magic link to work
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Magic link error:', error);
        setError(error.message || 'Failed to send magic link');
      } else {
        setMagicLinkSent(true);
        setError(''); // Clear any previous errors
      }
    } catch (authError) {
      console.error('Magic link error:', authError);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundOverlay}></div>
      
      <div className={styles.content}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>ADONS</span>
              <span className={styles.logoSubtext}>STUDIO</span>
            </div>
            <h1 className={styles.title}>Admin Portal</h1>
            <p className={styles.subtitle}>Secure access to your creative workspace</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorContent}>
                <h3>Authentication Error</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {magicLinkSent && (
            <div className={styles.successAlert}>
              <div className={styles.successIcon}>✨</div>
              <div className={styles.successContent}>
                <h3>Magic Link Sent!</h3>
                <p>Check your email for a secure login link.</p>
              </div>
            </div>
          )}

          <div className={styles.loginSection}>
            {/* Email/Password Login Form */}
            <form onSubmit={handleAdminLogin} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.loginButton}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Admin Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            {/* Magic Link Button */}
            <button
              onClick={handleMagicLink}
              disabled={isLoading || magicLinkSent}
              className={styles.magicLinkButton}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Sending...</span>
                </>
              ) : magicLinkSent ? (
                <>
                  <span>✅</span>
                  <span>Link Sent!</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Send Magic Link</span>
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className={styles.forgotPassword}>
              <a href="/admin/reset-password">Forgot your password?</a>
            </div>

          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              🛡️ Secured with enterprise-grade authentication
            </p>
            <p className={styles.footerSubtext}>
              Access restricted to authorized administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}