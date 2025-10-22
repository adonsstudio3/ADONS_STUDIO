/**
 * 🔄 Realtime Showreels Hook (ADMIN)
 *
 * Subscribes to Supabase realtime updates for showreels table
 * Automatically updates admin UI when showreels are created, updated, or deleted
 *
 * Uses authenticated supabaseClient for admin operations
 * Updates: INSTANT (< 1 second via WebSocket)
 */

import { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';

// Global subscription cache to prevent re-subscribing on navigation
const showreelsSubscriptionRef = { subscription: null, initialized: false };

export const useRealtimeShowreels = (initialShowreels = []) => {
  const [showreels, setShowreels] = useState(initialShowreels);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Only run on client-side where WebSocket is available
    if (typeof window === 'undefined') {
      return () => {
        isMountedRef.current = false;
      };
    }

    const setupRealtime = async () => {
      try {
        // If subscription already exists, just sync state and return
        if (showreelsSubscriptionRef.initialized) {
          console.log('📚 Reusing existing showreels subscription');
          // Just fetch current data
          const { data, error: fetchError } = await supabaseClient
            .from('showreels')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          if (isMountedRef.current) {
            setShowreels(data || []);
            setLoading(false);
          }
          return;
        }

        console.log('🎬 Setting up admin showreels subscription...');

        // Initial fetch
        const { data, error: fetchError } = await supabaseClient
          .from('showreels')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!isMountedRef.current) return;

        setShowreels(data || []);
        setLoading(false);

        console.log('✅ Fetched admin showreels:', data?.length || 0);

        // Create realtime subscription with unique channel ID
        const channelId = `admin-showreels-${Date.now()}`;
        showreelsSubscriptionRef.subscription = supabaseClient
          .channel(channelId)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'showreels'
            },
            (payload) => {
              console.log('⚡ Showreel realtime event:', payload.eventType);

              if (!isMountedRef.current) return;

              switch (payload.eventType) {
                case 'INSERT':
                  setShowreels(prev => {
                    // Check if already exists (prevent duplicates)
                    if (prev.some(s => s.id === payload.new.id)) {
                      return prev;
                    }
                    return [payload.new, ...prev];
                  });
                  break;

                case 'UPDATE':
                  setShowreels(prev =>
                    prev.map(s => s.id === payload.new.id ? payload.new : s)
                  );
                  break;

                case 'DELETE':
                  setShowreels(prev =>
                    prev.filter(s => s.id !== payload.old.id)
                  );
                  break;

                default:
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Admin showreels subscription active');
            }
          });

        showreelsSubscriptionRef.initialized = true;

      } catch (err) {
        console.error('❌ Showreels realtime setup error:', err);
        if (isMountedRef.current) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    // Start immediately
    setupRealtime();

    // Cleanup - DON'T unsubscribe to prevent re-subscription on navigation
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { showreels, loading, error };
};
