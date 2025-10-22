/**
 * 🔄 Realtime Hero Sections Hook (ADMIN)
 *
 * Subscribes to Supabase realtime updates for hero_sections table
 * Automatically updates admin UI when hero sections are created, updated, or deleted
 *
 * Uses authenticated supabaseClient for admin operations
 * Updates: INSTANT (< 1 second via WebSocket)
 */

import { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';

// Global subscription cache to prevent re-subscribing on navigation
const heroSectionsSubscriptionRef = { subscription: null, initialized: false };

export const useRealtimeHeroSections = (initialHeroSections = []) => {
  const [heroSections, setHeroSections] = useState(initialHeroSections);
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
        if (heroSectionsSubscriptionRef.initialized) {
          console.log('📚 Reusing existing hero sections subscription');
          // Just fetch current data
          const { data, error: fetchError } = await supabaseClient
            .from('hero_sections')
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          if (isMountedRef.current) {
            setHeroSections(data || []);
            setLoading(false);
          }
          return;
        }

        console.log('🎬 Setting up admin hero sections subscription...');

        // Initial fetch
        const { data, error: fetchError } = await supabaseClient
          .from('hero_sections')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!isMountedRef.current) return;

        setHeroSections(data || []);
        setLoading(false);

        console.log('✅ Fetched admin hero sections:', data?.length || 0);

        // Subscribe to realtime changes with unique channel ID
        const channelId = `admin-hero-sections-${Date.now()}`;
        heroSectionsSubscriptionRef.subscription = supabaseClient
          .channel(channelId)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'hero_sections'
            },
            (payload) => {
              console.log('⚡ Hero section realtime event:', payload.eventType);

              if (!isMountedRef.current) return;

              switch (payload.eventType) {
                case 'INSERT':
                  setHeroSections(prev => {
                    // Check if already exists (prevent duplicates)
                    if (prev.some(h => h.id === payload.new.id)) {
                      return prev;
                    }
                    return [payload.new, ...prev];
                  });
                  break;

                case 'UPDATE':
                  setHeroSections(prev =>
                    prev.map(h => h.id === payload.new.id ? payload.new : h)
                  );
                  break;

                case 'DELETE':
                  setHeroSections(prev =>
                    prev.filter(h => h.id !== payload.old.id)
                  );
                  break;

                default:
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Admin hero sections subscription active');
            }
          });

        heroSectionsSubscriptionRef.initialized = true;

      } catch (err) {
        console.error('❌ Hero sections realtime setup error:', err);
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

  return { heroSections, loading, error };
};
