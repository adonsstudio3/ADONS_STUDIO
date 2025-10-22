'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import '../../styles/admin.css';

// 🔐 Global authentication marker - persists across component remounts
let isAuthenticatedGlobal = false;

export default function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut, authReadyRef } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const hasCheckedRef = useRef(false);
  const lastAuthStateRef = useRef({ user: null, isAdmin: false, loading: true });
  const isTabVisibleRef = useRef(true);

  // � Track tab visibility to prevent redirects when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Safety timeout: if auth doesn't complete within 10 seconds, clear loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isChecking) {
        console.warn('⚠️ Auth check timeout - clearing loading state');
        setIsChecking(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [isChecking]);

  useEffect(() => {
    const checkAuth = async () => {
      // 🔒 CRITICAL: If already authenticated and tab is not the problem, skip re-checking
      // This prevents redirects when returning to tab
      if (isAuthenticatedGlobal && user && isAdmin) {
        if (isChecking) {
          setIsChecking(false);
        }
        return;
      }

      // Wait for auth to load on initial mount only
      if (loading && !hasCheckedRef.current) {
        return;
      }

      // Check if user is authenticated and is admin
      if (!user || !isAdmin) {
        if (!loading) {
          router.replace('/admin/login');
        }
        return;
      }

      // Check session expiry (24 hours)
      const loginTime = localStorage.getItem('admin_login_time');
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (currentTime - loginTimestamp > twentyFourHours) {
          localStorage.removeItem('admin_login_time');
          await signOut();
          router.replace('/admin/login');
          return;
        }
      }

      // Authentication successful - mark as checked and authenticated
      hasCheckedRef.current = true;
      isAuthenticatedGlobal = true;
      setIsChecking(false);
    };

    checkAuth();
    // Run when loading or authentication state changes
  }, [loading]);

  // Set up automatic logout after 24 hours - only once on mount
  useEffect(() => {
    if (isAuthenticatedGlobal && hasCheckedRef.current) {
      const loginTime = localStorage.getItem('admin_login_time');
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeRemaining = twentyFourHours - (currentTime - loginTimestamp);

        if (timeRemaining > 0) {
          // Set timeout for automatic logout
          const logoutTimer = setTimeout(async () => {
            localStorage.removeItem('admin_login_time');
            await signOut();
            router.replace('/admin/login');
          }, timeRemaining);

          return () => clearTimeout(logoutTimer);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading screen only during initial authentication check
  // Don't show loading if we've already authenticated successfully (authReadyRef.isReady)
  // This prevents loading spinner when tab regains focus
  if ((loading || isChecking) && !isAuthenticatedGlobal && !authReadyRef?.isReady) {
    return (
      <div className="admin-root" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#fff'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white drop-shadow-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!user || !isAdmin) {
    console.log('🔴 NOT RENDERING: No user or not admin');
    return null;
  }

  // Render the protected content
  console.log('✅ RENDERING PROTECTED CONTENT');
  return <>{children}</>;
}