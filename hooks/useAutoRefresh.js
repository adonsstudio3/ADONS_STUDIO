import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-refreshing data in admin components
 * Listens for admin data refresh events and triggers refetch
 */
export const useAutoRefresh = (refreshCallback, dependencies = []) => {
  const callbackRef = useRef(refreshCallback);
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = refreshCallback;
  }, [refreshCallback]);

  const handleRefresh = useCallback(() => {
    if (callbackRef.current) {
      console.log('🔄 Auto-refreshing component data...');
      callbackRef.current();
    }
  }, []);

  useEffect(() => {
    // Listen for admin data refresh events
    window.addEventListener('admin-data-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('admin-data-refresh', handleRefresh);
    };
  }, [handleRefresh]);

  return handleRefresh;
};

/**
 * Hook for triggering refresh after page navigation
 */
export const useNavigationRefresh = (callback) => {
  useEffect(() => {
    // Small delay to let navigation complete
    const timer = setTimeout(() => {
      callback();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run on mount (after navigation)
};