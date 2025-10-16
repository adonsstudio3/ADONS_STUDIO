'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        // Not authenticated or not admin, redirect to login
        router.replace('/admin/login');
      } else {
        // Check session expiry (24 hours)
        checkSessionExpiry();
        setIsChecking(false);
      }
    }
  }, [user, isAdmin, loading, router]);

  const checkSessionExpiry = async () => {
    const loginTime = localStorage.getItem('admin_login_time');
    if (loginTime) {
      const loginTimestamp = parseInt(loginTime);
      const currentTime = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (currentTime - loginTimestamp > twentyFourHours) {
        // Session expired, logout
        console.log('Admin session expired after 24 hours, logging out...');
        localStorage.removeItem('admin_login_time');
        await signOut();
        router.replace('/admin/login');
        return;
      }
    }
  };

  // Set up automatic logout after 24 hours
  useEffect(() => {
    if (user && isAdmin && !loading) {
      const loginTime = localStorage.getItem('admin_login_time');
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeRemaining = twentyFourHours - (currentTime - loginTimestamp);

        if (timeRemaining > 0) {
          // Set timeout for automatic logout
          const logoutTimer = setTimeout(async () => {
            console.log('24-hour session timeout reached, logging out...');
            localStorage.removeItem('admin_login_time');
            await signOut();
            router.replace('/admin/login');
          }, timeRemaining);

          return () => clearTimeout(logoutTimer);
        }
      }
    }
  }, [user, isAdmin, loading, router, signOut]);

  if (loading || isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000',
        color: '#fff'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}