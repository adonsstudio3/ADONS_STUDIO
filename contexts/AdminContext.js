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
  // Do not capture the token at mount-time. We'll fetch the freshest session/token
  // immediately before each request to avoid sending expired tokens.

  // Sync loading state with AuthContext
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  // Listen for auth state changes and handle magic link redirects
  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔔 Auth event:', event, 'Session:', !!currentSession);
        
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in successfully');
          // Small delay to ensure state is updated
          setTimeout(() => {
            try {
              router.push('/admin/dashboard');
              router.refresh();
            } catch (error) {
              console.warn('Navigation error on SIGNED_IN:', error);
            }
          }, 500);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, redirecting to login...');
          // Delay to ensure state is cleared and prevent navigation conflicts
          // Use requestAnimationFrame to wait for next render cycle
          requestAnimationFrame(() => {
            setTimeout(() => {
              try {
                router.push('/admin/login');
                // Don't refresh after logout - can cause issues
              } catch (error) {
                console.warn('Navigation error on SIGNED_OUT:', error);
              }
            }, 100);
          });
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
        }
      }
    );

    return () => {
      console.log('🔌 Cleaning up auth listener');
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  // Login is handled by AuthContext - AdminContext only provides admin utilities

  const logout = async () => {
    try {
      console.log('🚪 Logout initiated...');
      await signOut();
      // ✅ Don't redirect here - let onAuthStateChange listener handle it
      // The listener will receive SIGNED_OUT event and redirect
      console.log('✅ Logout successful, waiting for onAuthStateChange to redirect...');
      return { error: null };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // If signOut fails critically, still try to redirect
      // But use a longer timeout to avoid conflicts with listener
      setTimeout(() => {
        try {
          router.push('/admin/login');
        } catch (navError) {
          console.error('Failed to navigate on logout error:', navError);
        }
      }, 1000);
      return { error };
    }
  };

  // Force refresh function to update all data
  const forceRefresh = () => {
    try {
      console.log('🔄 Forcing app-wide refresh...');
      router.refresh();
      // Trigger a custom event for components to refresh their data
      window.dispatchEvent(new CustomEvent('admin-data-refresh'));
    } catch (error) {
      console.warn('Force refresh failed:', error);
    }
  };

  const apiCall = async (url, options = {}) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    console.log(`[${requestId}] API Call Started:`, { url, method: options.method || 'GET' });
    
    try {
      // Build headers but do NOT rely on a token captured earlier. Get latest session.
      const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      };

      // Get freshest token from supabase client just before request
      try {
        const { data } = await supabaseClient.auth.getSession();
        const freshToken = data?.session?.access_token || null;
        console.log(`[${requestId}] Session check:`, { 
          hasSession: !!data?.session, 
          hasToken: !!freshToken,
          userEmail: data?.session?.user?.email 
        });
        
        if (!headers['Authorization'] && freshToken) {
          headers['Authorization'] = `Bearer ${freshToken}`;
          console.log(`[${requestId}] Added auth header for ${options.body instanceof FormData ? 'FormData' : 'JSON'} request`);
        } else if (!freshToken) {
          console.warn(`[${requestId}] No auth token available!`);
        } else if (headers['Authorization']) {
          console.log(`[${requestId}] Auth header already present`);
        }
      } catch (err) {
        console.warn(`[${requestId}] Could not read fresh session token:`, err?.message || err);
      }

      console.log(`[${requestId}] Final headers being sent:`, {
        hasAuth: !!headers['Authorization'],
        authPrefix: headers['Authorization']?.substring(0, 20) + '...',
        contentType: headers['Content-Type'],
        isFormData: options.body instanceof FormData
      });

      let response = await fetch(url, {
        ...options,
        headers
      });

      // If token expired and server returned 401, try once to refresh/read session and retry.
      if (response.status === 401) {
        console.warn(`[${requestId}] Received 401, attempting one re-check of session and retry`);
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
          console.warn(`[${requestId}] Retry after 401 failed to get fresh token:`, retryErr?.message || retryErr);
        }
      }

      if (!response.ok) {
        let errorMessage = `API call failed with status ${response.status}`;
        let errorDetails = null;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details;
          console.log(`[${requestId}] Error response:`, errorData);
        } catch (e) {
          console.log(`[${requestId}] Could not parse error response as JSON`);
        }
        
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        throw new Error(fullError);
      }

      const data = await response.json();
      console.log(`[${requestId}] API Call Successful:`, data);
      
      // NOTE: Removed auto-refresh after mutations!
      // Realtime subscriptions now handle live updates automatically
      // This prevents unnecessary page reloads and loading states when switching browser tabs
      // If you need to manually refresh, call forceRefresh() explicitly
      
      return data;

    } catch (error) {
      console.error(`[${requestId}] API Call Failed:`, error);
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
    admin: user, // Use AuthContext user data
    user: user, // Alias for consistency
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
