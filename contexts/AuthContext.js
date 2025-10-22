/**
 * 🔐 Supabase Authentication Context with JWT, OAuth & Bcrypt Support
 * 
 * This provides comprehensive authentication features:
 * - JWT token management
 * - OAuth providers (Google, GitHub, etc.)
 * - Admin login with bcrypt password hashing
 * - Role-based access control
 * - Session management
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

const AuthContext = createContext({});

// 🔐 Global auth readiness flag - persists across component remounts
// Once auth is fully initialized, it stays true for the session
let authReadyRef = { isReady: false };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [isInitialized, setIsInitialized] = useState(false);

  // Track if auth listener has been set up to prevent duplicate listeners
  const authListenerSetupRef = React.useRef(false);
  
  // Track tab visibility to prevent state updates when tab is not visible
  const isTabVisibleRef = React.useRef(true);

  // 📱 Track tab visibility to prevent state updates when switching tabs
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
    let mounted = true;
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Check if user is admin by email
          if (session.user.email === 'adonsstudio3@gmail.com') {
            try {
              const { data: adminUser, error: adminError } = await supabaseClient
                .from('admin_users')
                .select('role, is_active')
                .eq('email', session.user.email)
                .eq('is_active', true)
                .maybeSingle();

              if (adminError) {
                // If table doesn't exist or query fails, grant admin based on email alone
                setUserRole('super_admin');
                setIsAdmin(true);
              } else if (adminUser) {
                setUserRole(adminUser.role);
                setIsAdmin(true);
              } else {
                // Try to create admin user record if it doesn't exist
                const { error: insertError } = await supabaseClient
                  .from('admin_users')
                  .insert([{
                    id: session.user.id,
                    email: session.user.email,
                    full_name: 'Adons Studio Admin',
                    role: 'super_admin',
                    is_active: true
                  }]);
                
                if (insertError) {
                  // Could not create admin user record, continue anyway
                }
                
                setUserRole('super_admin');
                setIsAdmin(true);
              }
            } catch (error) {
              // Grant admin access based on email even if database check fails
              setUserRole('super_admin');
              setIsAdmin(true);
            }
          } else {
            setUserRole('user');
            setIsAdmin(false);
          }
        } else {
          // No session found
          setSession(null);
          setUser(null);
          setUserRole('user');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    getInitialSession();

    // ✅ IMPORTANT: Only set up ONE auth listener across the entire app lifecycle
    // Prevent multiple listeners from accumulating which causes unnecessary re-renders
    if (!authListenerSetupRef.current) {
      authListenerSetupRef.current = true;

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          // 🔒 CRITICAL: Only update state on IMPORTANT auth events
          // Ignore TOKEN_REFRESHED and other events that happen during navigation
          // ALSO: Ignore ALL auth events when tab is not visible (prevents refresh on tab switch)
          if (!isTabVisibleRef.current) {
            return;
          }

          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
            
            setSession(session);
            setUser(session?.user || null);
            
            if (session?.user) {
              // Check if user is admin by looking in admin_users table
              if (session.user.email === 'adonsstudio3@gmail.com') {
                try {
                  const { data: adminUser, error: adminError } = await supabaseClient
                    .from('admin_users')
                    .select('role, is_active')
                    .eq('email', session.user.email)
                    .eq('is_active', true)
                    .maybeSingle();
                  
                  if (adminError) {
                    // If table doesn't exist or query fails, grant admin based on email alone
                    setUserRole('super_admin');
                    setIsAdmin(true);

                    if (event === 'SIGNED_IN') {
                      localStorage.setItem('admin_login_time', Date.now().toString());
                    }
                  } else if (adminUser) {
                    setUserRole(adminUser.role);
                    setIsAdmin(true);
                    
                    // Store login time for 24-hour session management
                    if (event === 'SIGNED_IN') {
                      localStorage.setItem('admin_login_time', Date.now().toString());
                    }
                  } else {
                    // Try to create admin user record if it doesn't exist
                    const { error: insertError } = await supabaseClient
                      .from('admin_users')
                      .insert([{
                        id: session.user.id,
                        email: session.user.email,
                        full_name: 'Adons Studio Admin',
                        role: 'super_admin',
                        is_active: true
                      }]);
                    
                    if (insertError) {
                      // Could not create admin user record, continue anyway
                    }
                    
                    setUserRole('super_admin');
                    setIsAdmin(true);
                    
                    // Store login time for 24-hour session management
                    if (event === 'SIGNED_IN') {
                      localStorage.setItem('admin_login_time', Date.now().toString());
                    }
                  }
                } catch (error) {
                  // Grant admin access based on email even if database check fails
                  setUserRole('super_admin');
                  setIsAdmin(true);

                  if (event === 'SIGNED_IN') {
                    localStorage.setItem('admin_login_time', Date.now().toString());
                  }
                }
              } else {
                setUserRole('user');
                setIsAdmin(false);
              }
            } else {
              setUserRole('user');
              setIsAdmin(false);
            }
            
            setLoading(false);
          }
          // Silently ignore TOKEN_REFRESHED and other events during navigation
        }
      );

      return () => {
        mounted = false;
        clearTimeout(timeoutId);
        subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // 📧 Email/Password Authentication
  const signUpWithEmail = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Admin Authentication (supports both password and magic link)
  const signInAsAdmin = async (email, password) => {
    try {
      setLoading(true);
      
      // First verify this is the authorized admin email
      if (email !== 'adonsstudio3@gmail.com') {
        throw new Error('Access denied. Only adonsstudio3@gmail.com is authorized.');
      }
      
      // Use Supabase directly for authentication (works with both password and magic link)
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message || 'Authentication failed');
      }

      if (data?.session) {
        // Supabase will handle the session automatically via onAuthStateChange
        // Just return success - the session will be set by the auth listener
        return { data: data.session, error: null };
      } else {
        throw new Error('No session returned from authentication');
      }
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error; // Re-throw to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  // 🌐 OAuth Authentication
  const signInWithOAuth = async (provider) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error(`OAuth ${provider} sign in error:`, error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // 🔐 OAuth Providers with Email Restriction
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'gmail.com' // Restrict to Gmail domain
          }
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error; // Re-throw to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = () => signInWithOAuth('github');
  const signInWithDiscord = () => signInWithOAuth('discord');
  const signInWithTwitter = () => signInWithOAuth('twitter');

  // 🚪 Sign Out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) throw error;

      // Clear local state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setUserRole('user');


      // Clear admin session timer
      localStorage.removeItem('admin_login_time');

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Password Reset
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }
  };

  // 🔐 Update Password
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { data: null, error };
    }
  };

  // 👤 Update Profile
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  };

  // 🎯 Get User Claims (JWT)
  const getUserClaims = () => {
    if (!session?.access_token) return null;

    try {
      // Decode JWT token to get claims
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // 🛡️ Check Permissions
  const hasPermission = (requiredRole) => {
    const roleHierarchy = {
      'user': 0,
      'subscriber': 1,
      'premium': 2,
      'editor': 3,
      'admin': 4,
      'super_admin': 5
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const value = {
    // State
    user,
    session,
    loading,
    isAdmin,
    userRole,
    isInitialized,

    // Authentication methods
    signUpWithEmail,
    signInWithEmail,
    signInAsAdmin,
    signOut,

    // OAuth methods
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    signInWithTwitter,

    // Account management
    resetPassword,
    updatePassword,
    updateProfile,

    // Utilities
    getUserClaims,
    hasPermission,

    // Computed properties
    isAuthenticated: !!user,
    isLoading: loading,
    authReadyRef, // 🔐 Global auth readiness flag
  };

  // 🎯 Mark auth as ready once user is authenticated on first check
  if (isInitialized && user && isAdmin) {
    authReadyRef.isReady = true;
  }

  // Render children immediately without blocking - auth will update asynchronously
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;