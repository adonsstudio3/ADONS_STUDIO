'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseClient } from '@/lib/supabase';
import styles from './AdminLoginAnimated.module.css';
import '../../styles/admin.css';

// Throttle function (from original code)
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function AdminLoginAnimated() {
  const router = useRouter();
  const { signInAsAdmin, isAuthenticated, isAdmin, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Refs for character animation
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const faceRef = useRef(null);
  const handsRef = useRef([]);
  const tongueRef = useRef(null);
  const handLeftRef = useRef(null);
  const handRightRef = useRef(null);

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

  // Character animation effects
  useEffect(() => {
    const emailInput = emailInputRef.current;
    const passwordInput = passwordInputRef.current;
    const face = faceRef.current;
    const tongue = tongueRef.current;
    const handLeft = handLeftRef.current;
    const handRight = handRightRef.current;

    if (!emailInput || !passwordInput || !face || !tongue || !handLeft || !handRight) return;

    // Populate handsRef array
    handsRef.current = [handLeft, handRight];
    const hands = handsRef.current;

    // Email input animation (head rotation)
    const handleEmailFocus = (event) => {
      let length = Math.min(emailInput.value.length - 16, 19);
      hands.forEach(hand => {
        if (hand) {
          hand.classList.remove(styles.hide);
          hand.classList.remove(styles.peek);
        }
      });
      
      face.style.setProperty('--rotate-head', `${-length}deg`);
    };

    const handleEmailBlur = () => {
      face.style.setProperty('--rotate-head', '0deg');
    };

    const handleEmailInput = throttle((event) => {
      let length = Math.min(event.target.value.length - 16, 19);
      face.style.setProperty('--rotate-head', `${-length}deg`);
    }, 100);

    // Password input animation (hide hands)
    const handlePasswordFocus = () => {
      hands.forEach(hand => {
        if (hand) {
          hand.classList.add(styles.hide);
        }
      });
      if (tongue) {
        tongue.classList.remove(styles.breath);
      }
    };

    const handlePasswordBlur = () => {
      hands.forEach(hand => {
        if (hand) {
          hand.classList.remove(styles.hide, styles.peek);
        }
      });
      if (tongue) {
        tongue.classList.add(styles.breath);
      }
    };

    // Add event listeners
    emailInput.addEventListener('focus', handleEmailFocus);
    emailInput.addEventListener('blur', handleEmailBlur);
    emailInput.addEventListener('input', handleEmailInput);
    passwordInput.addEventListener('focus', handlePasswordFocus);
    passwordInput.addEventListener('blur', handlePasswordBlur);

    // Cleanup
    return () => {
      emailInput.removeEventListener('focus', handleEmailFocus);
      emailInput.removeEventListener('blur', handleEmailBlur);
      emailInput.removeEventListener('input', handleEmailInput);
      passwordInput.removeEventListener('focus', handlePasswordFocus);
      passwordInput.removeEventListener('blur', handlePasswordBlur);
    };
  }, []);

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
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Magic link error:', error);
        setError(error.message || 'Failed to send magic link');
      } else {
        setMagicLinkSent(true);
        setError('');
      }
    } catch (authError) {
      console.error('Magic link error:', authError);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPassword = () => {
    const hands = handsRef.current;

    if (showPassword) {
      // Currently showing password, now hide it - hands near eyes (peek position)
      setShowPassword(false);
      hands.forEach(hand => {
        if (hand) {
          hand.classList.remove(styles.hide);
          hand.classList.add(styles.peek);
        }
      });
    } else {
      // Currently hiding password, now show it - dog covers eyes completely (hide position)
      setShowPassword(true);
      hands.forEach(hand => {
        if (hand) {
          hand.classList.remove(styles.peek);
          hand.classList.add(styles.hide);
        }
      });
    }
  };

  const handleForgotPassword = () => {
    // Navigate directly to the reset password form
    router.push('/reset-password');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} admin-root`}>
      <div className={styles.center}>
        {/* Character ears */}
        <div className={`${styles.ear} ${styles.earLeft}`}></div>
        <div className={`${styles.ear} ${styles.earRight}`}></div>
        
        {/* Character face */}
        <div className={styles.face} ref={faceRef}>
          <div className={styles.eyes}>
            <div className={`${styles.eye} ${styles.eyeLeft}`}>
              <div className={styles.glow}></div>
            </div>
            <div className={`${styles.eye} ${styles.eyeRight}`}>
              <div className={styles.glow}></div>
            </div>
          </div>
          
          <div className={styles.nose}>
            <svg width="38.161" height="22.03">
              <path d="M2.017 10.987Q-.563 7.513.157 4.754C.877 1.994 2.976.135 6.164.093 16.4-.04 22.293-.022 32.048.093c3.501.042 5.48 2.081 6.02 4.661q.54 2.579-2.051 6.233-8.612 10.979-16.664 11.043-8.053.063-17.336-11.043z" fill="#243946"/>
            </svg>
            <div className={styles.glow}></div>
          </div>

          <div className={styles.mouth}>
            <svg className={styles.smile} viewBox="-2 -2 84 23" width="84" height="23">
              <path d="M0 0c3.76 9.279 9.69 18.98 26.712 19.238 17.022.258 10.72.258 28 0S75.959 9.182 79.987.161" fill="none" strokeWidth="3" strokeLinecap="square" strokeMiterlimit="3"/>
            </svg>
            <div className={styles.mouthHole}></div>
            <div className={`${styles.tongue} ${styles.breath}`} ref={tongueRef}>
              <div className={styles.tongueTop}></div>
              <div className={styles.line}></div>
              <div className={styles.median}></div>
            </div>
          </div>
        </div>

        {/* Character hands */}
        <div className={styles.hands}>
          <div className={`${styles.hand} ${styles.handLeft}`} ref={handLeftRef}>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
          </div>

          <div className={`${styles.hand} ${styles.handRight}`} ref={handRightRef}>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
            <div className={styles.finger}>
              <div className={styles.bone}></div>
              <div className={styles.nail}></div>
            </div>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleAdminLogin} className={styles.login}>
          <label className={styles.inputLabel}>
            <i className="fa-solid fa-envelope"></i>
            <input
              ref={emailInputRef}
              className={styles.username}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Admin Email"
              required
            />
          </label>

          <label className={styles.inputLabel}>
            <i className="fa-solid fa-lock"></i>
            <input
              ref={passwordInputRef}
              className={styles.password}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className={styles.passwordButton}
              onClick={handleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </label>

          <div className={styles.forgotPassword}>
            <a
              className={styles.forgotPasswordLink}
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.loginButton}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Separator */}
        <div className={styles.separator}>
          <span className={styles.separatorText}>OR</span>
        </div>

        {/* Magic link button */}
        <div className={styles.magicLinkContainer}>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isLoading || magicLinkSent}
            className={styles.magicLinkButton}
          >
            Send Magic Link
          </button>
        </div>
      </div>

      {/* Error/Success messages - Outside animated container */}
      {error && (
        <div className={styles.errorMessage}>
          <i className="fa-solid fa-circle-exclamation" style={{marginRight: '8px'}}></i>
          {error}
        </div>
      )}

      {magicLinkSent && (
        <div className={styles.successMessage}>
          <i className="fa-solid fa-circle-check" style={{marginRight: '8px'}}></i>
          Magic link sent! Check your email.
        </div>
      )}
    </div>
  );
}