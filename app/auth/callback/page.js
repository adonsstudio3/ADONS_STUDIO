/**
 * 🔗 Auth Callback Handler
 * 
 * This page handles authentication callbacks from:
 * - OAuth providers (Google, GitHub, etc.)
 * - Magic link authentication
 * - Other Supabase auth methods
 * 
 * Key Implementation:
 * 1. Gets session from Supabase (magic link automatically creates session)
 * 2. Verifies user is authorized
 * 3. Waits for AuthContext to sync via onAuthStateChange
 * 4. Redirects to dashboard
 * 
 * The critical fix: We wait 800ms for auth state to propagate before redirect
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authStateTimeout;
    let redirectTimeout;

    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Starting magic link callback handler...');
        
        // Get the current session (magic link automatically creates session)
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('❌ Auth callback error:', error);
          if (mounted) {
            setStatus('error');
            setMessage(`Authentication failed: ${error.message}`);
            
            redirectTimeout = setTimeout(() => {
              if (mounted) router.push('/admin/login?error=oauth_failed');
            }, 3000);
          }
          return;
        }

        if (!data.session) {
          console.warn('⚠️ No session found after magic link click');
          if (mounted) {
            setStatus('error');
            setMessage('No session found. Please try logging in again.');
            
            redirectTimeout = setTimeout(() => {
              if (mounted) router.push('/admin/login');
            }, 3000);
          }
          return;
        }

        const user = data.session.user;
        const userEmail = user.email;
        console.log('✅ Session found for:', userEmail);
        
        // Check if the email is authorized for admin access
        if (userEmail !== 'adonsstudio3@gmail.com') {
          console.warn('❌ Unauthorized email:', userEmail);
          if (mounted) {
            setStatus('error');
            setMessage(`Access denied. This admin panel is restricted to authorized personnel only.`);
            
            // Sign out unauthorized user
            await supabaseClient.auth.signOut();
            
            redirectTimeout = setTimeout(() => {
              if (mounted) router.push('/admin/login?error=unauthorized_email');
            }, 3000);
          }
          return;
        }

        // Authorized admin email - log and update
        console.log('🟢 Authorized admin email verified');
        
        try {
          // Log successful authentication
          await supabaseClient
            .from('activity_logs')
            .insert([{
              action: 'admin_auth_success',
              details: { 
                user_id: user.id,
                email: user.email,
                auth_method: 'magic_link'
              },
              ip_address: '',
              user_agent: navigator.userAgent || ''
            }]);

          // Update last login
          await supabaseClient
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', userEmail);
          
          console.log('✅ Activity logged and last_login updated');
        } catch (logError) {
          console.warn('⚠️ Logging error (non-blocking):', logError);
          // Don't block login for logging errors
        }

        // Wait for AuthContext to receive the session via onAuthStateChange
        // This is critical - we need the context to know about admin status
        if (mounted) {
          setStatus('success');
          setMessage('Authentication successful! Syncing session...');
          
          // Set a timeout to wait for auth state changes to propagate
          authStateTimeout = setTimeout(() => {
            if (mounted && !redirecting) {
              console.log('🚀 Auth state synced, redirecting to admin dashboard...');
              setRedirecting(true);
              setMessage('Authentication successful! Redirecting to admin panel...');
              
              // Refresh router to sync all contexts
              try { 
                router.refresh(); 
              } catch (e) { 
                console.warn('⚠️ Router refresh failed:', e); 
              }
              
              // Wait a bit for refresh, then redirect
              redirectTimeout = setTimeout(() => {
                if (mounted) {
                  console.log('🎯 Pushing to dashboard');
                  router.push('/admin/dashboard');
                }
              }, 500);
            }
          }, 800); // Wait 800ms for auth state to propagate through all listeners
        }
      } catch (error) {
        console.error('❌ Auth callback processing error:', error);
        if (mounted) {
          setStatus('error');
          setMessage('An unexpected error occurred. Please try again.');
          
          redirectTimeout = setTimeout(() => {
            if (mounted) router.push('/admin/login?error=callback_error');
          }, 3000);
        }
      }
    };

    handleAuthCallback();

    // Cleanup
    return () => {
      mounted = false;
      if (authStateTimeout) clearTimeout(authStateTimeout);
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'processing' && '🔄 Processing...'}
            {status === 'success' && '✅ Success!'}
            {status === 'error' && '❌ Error'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          
          {status === 'processing' && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-4">
              <div className="text-green-600 text-2xl">✨</div>
              <p className="text-sm text-gray-500 mt-2">
                You will be redirected automatically...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4">
              <div className="text-red-600 text-2xl">⚠️</div>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to login page...
              </p>
              <button
                onClick={() => router.push('/admin/login')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}