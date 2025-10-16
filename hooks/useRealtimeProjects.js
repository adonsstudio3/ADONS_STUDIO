/**
 * 🔄 Realtime Projects Hook
 * 
 * Subscribes to Supabase realtime updates for projects table
 * Automatically updates UI when projects are created, updated, or deleted
 */

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

export const useRealtimeProjects = (initialProjects = []) => {
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const setupRealtime = async () => {
      try {
        console.log('🔄 Setting up realtime subscription for projects...');

        // Initial fetch
        const { data, error: fetchError } = await supabaseClient
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (mounted) {
          console.log('✅ Initial projects loaded:', data?.length || 0);
          setProjects(data || []);
          setLoading(false);
        }

        // Subscribe to realtime changes
        subscription = supabaseClient
          .channel('projects-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'projects'
            },
            (payload) => {
              console.log('🔔 Realtime event received:', payload.eventType, payload);

              if (!mounted) return;

              switch (payload.eventType) {
                case 'INSERT':
                  console.log('➕ New project added:', payload.new);
                  setProjects(prev => {
                    // Check if already exists (prevent duplicates)
                    if (prev.some(p => p.id === payload.new.id)) {
                      return prev;
                    }
                    return [payload.new, ...prev];
                  });
                  break;

                case 'UPDATE':
                  console.log('✏️ Project updated:', payload.new);
                  setProjects(prev =>
                    prev.map(p => p.id === payload.new.id ? payload.new : p)
                  );
                  break;

                case 'DELETE':
                  console.log('🗑️ Project deleted:', payload.old);
                  setProjects(prev =>
                    prev.filter(p => p.id !== payload.old.id)
                  );
                  break;

                default:
                  console.log('Unknown event type:', payload.eventType);
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime subscription active');
            }
          });

      } catch (err) {
        console.error('❌ Realtime setup error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    setupRealtime();

    // Cleanup
    return () => {
      mounted = false;
      if (subscription) {
        console.log('🔌 Unsubscribing from projects realtime...');
        supabaseClient.removeChannel(subscription);
      }
    };
  }, []);

  return { projects, loading, error };
};
