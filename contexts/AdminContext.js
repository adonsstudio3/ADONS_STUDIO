"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { supabaseClient } from '@/lib/supabase';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, session, isAuthenticated, isAdmin, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authListenerSetupRef = React.useRef(false);
  // Do not capture the token at mount-time. We'll fetch the freshest session/token
  // immediately before each request to avoid sending expired tokens.

  // Sync loading state with AuthContext
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  // 🔒 Listen for auth state changes and handle magic link redirects
  // IMPORTANT: Only set up listener ONCE to prevent redundant subscriptions
  // Track tab visibility to prevent redirects when tab is not visible
  const isTabVisibleRef = React.useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (authListenerSetupRef.current) return; // Already set up
    authListenerSetupRef.current = true;

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        // 🔒 CRITICAL: Don't redirect if tab is not visible (prevents unwanted navigation on tab focus)
        if (!isTabVisibleRef.current) {
          return;
        }

        if (event === 'SIGNED_IN') {
          // Only redirect if user is NOT already on an admin page
          // Let AdminProtectedRoute handle the routing
          if (!window.location.pathname.startsWith('/admin/')) {
            router.push('/admin/dashboard');
          }
        }

        if (event === 'SIGNED_OUT') {
          // Use replace instead of push to prevent back navigation
          router.replace('/admin/login');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // ✅ EMPTY dependency array - run only once on mount

  // Login is handled by AuthContext - AdminContext only provides admin utilities

  const logout = async () => {
    try {
      // Clear local storage immediately
      localStorage.removeItem('admin_login_time');

      // Clear session storage for password change (if exists)
      sessionStorage.removeItem('password_change_step');
      sessionStorage.removeItem('password_change_data');
      sessionStorage.removeItem('password_change_otp_expires');

      // Sign out from Supabase FIRST (security critical)
      await signOut();

      // Use Next.js router for smooth redirect (no full page reload)
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // On error, still redirect but user might still be logged in
      // The login page will check auth and redirect back if still authenticated
      router.replace('/admin/login');
    }
  };

  // Force refresh function to update all data
  const forceRefresh = () => {
    try {
      router.refresh();
      // Trigger a custom event for components to refresh their data
      window.dispatchEvent(new CustomEvent('admin-data-refresh'));
    } catch (error) {
      console.warn('Force refresh failed:', error);
    }
  };

  const apiCall = async (url, options = {}) => {
    try {
      // Build headers but do NOT rely on a token captured earlier. Get latest session.
      const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      };

      // Get freshest token from supabase client just before request
      try {
        const { data, error: sessionError } = await supabaseClient.auth.getSession();

        // If session retrieval failed, throw error to trigger re-login
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Session expired. Please login again.');
        }

        const freshToken = data?.session?.access_token || null;

        if (!headers['Authorization'] && freshToken) {
          headers['Authorization'] = `Bearer ${freshToken}`;
        } else if (!freshToken) {
          console.warn('No auth token available - session may have expired');
          throw new Error('No valid session found. Please login again.');
        }
      } catch (err) {
        console.error('Session token error:', err?.message || err);
        // If it's a session error, redirect to login
        if (err?.message?.includes('session') || err?.message?.includes('Session')) {
          window.location.href = '/admin/login';
        }
        throw err;
      }

      let response = await fetch(url, {
        ...options,
        headers
      });

      // If token expired and server returned 401, try once to refresh/read session and retry.
      if (response.status === 401) {
        console.warn('Received 401, attempting session refresh and retry');
        try {
          const { data: refreshed } = await supabaseClient.auth.getSession();
          const freshToken2 = refreshed?.session?.access_token || null;
          if (freshToken2) {
            headers['Authorization'] = `Bearer ${freshToken2}`;
            response = await fetch(url, {
              ...options,
              headers
            });
          }
        } catch (retryErr) {
          console.warn('Retry after 401 failed to get fresh token:', retryErr?.message || retryErr);
        }
      }

      if (!response.ok) {
        let errorMessage = `API call failed with status ${response.status}`;
        let errorDetails = null;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details;
        } catch (e) {
          // Could not parse error response
        }

        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        throw new Error(fullError);
      }

      const data = await response.json();

      // NOTE: Removed auto-refresh after mutations!
      // Realtime subscriptions now handle live updates automatically
      // This prevents unnecessary page reloads and loading states when switching browser tabs
      // If you need to manually refresh, call forceRefresh() explicitly

      return data;

    } catch (error) {
      console.error('API Call Failed:', error);
      throw error;
    }
  };

  // Activity logging function
  const logActivity = async (action, entityType, entityId = null, details = null) => {
    if (!isAuthenticated || !user) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      // Get fresh token for logging too
      let authHeader = {};
      try {
        const { data } = await supabaseClient.auth.getSession();
        const freshToken = data?.session?.access_token || null;
        if (freshToken) authHeader = { Authorization: `Bearer ${freshToken}` };
      } catch (err) {
        // If we can't read a fresh token, continue without it (logging is best-effort)
      }

      // Try to log to Supabase backend
      await fetch(`${API_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          admin_id: user?.id
        }),
      });
    } catch (error) {
      // Silently fail activity logging to not disrupt main functionality
      console.warn('Activity logging failed:', error?.message || error);
    }
  };

  const value = {
    user: user, // Single source of truth for user data from AuthContext
    session: session, // Current session object (includes access_token)
    loading: authLoading,
    isAuthenticated: isAuthenticated && isAdmin,
    login: null, // Disable AdminContext login, use AuthContext instead
    logout,
    apiCall,
    logActivity,
    forceRefresh, // Manual refresh trigger
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
