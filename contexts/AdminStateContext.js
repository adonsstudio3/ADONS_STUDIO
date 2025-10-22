'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';

/**
 * 🔒 Stable Admin State Context
 * 
 * This context NEVER re-renders on auth changes or navigation.
 * It only holds utility functions and configuration.
 * Admin state (isAdmin, user) should come from AuthContext only.
 */

const AdminStateContext = createContext();

export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  if (!context) {
    throw new Error('useAdminState must be used within an AdminStateProvider');
  }
  return context;
};

export const AdminStateProvider = ({ children }) => {
  // Use refs instead of state to prevent re-renders
  const dataRefreshHandlers = useRef(new Set());
  const subscriptionCacheRef = useRef(new Map());

  // Stable callbacks that never change
  const registerRefreshHandler = useCallback((handler) => {
    dataRefreshHandlers.current.add(handler);
    return () => {
      dataRefreshHandlers.current.delete(handler);
    };
  }, []);

  const triggerDataRefresh = useCallback((dataType) => {
    dataRefreshHandlers.current.forEach(handler => {
      if (!dataType || handler.dataType === dataType) {
        handler.callback();
      }
    });
  }, []);

  // Cache subscription to prevent re-subscription on navigation
  const getCachedSubscription = useCallback((key, setupFn) => {
    if (!subscriptionCacheRef.current.has(key)) {
      subscriptionCacheRef.current.set(key, setupFn());
    }
    return subscriptionCacheRef.current.get(key);
  }, []);

  const value = {
    registerRefreshHandler,
    triggerDataRefresh,
    getCachedSubscription,
    subscriptionCache: subscriptionCacheRef.current,
  };

  return (
    <AdminStateContext.Provider value={value}>
      {children}
    </AdminStateContext.Provider>
  );
};
