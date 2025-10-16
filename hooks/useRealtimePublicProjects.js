/**
 * 🔄 Realtime Public Projects Hook
 * 
 * Subscribes to Supabase realtime updates for active/published projects
 * Automatically updates frontend when projects are created, updated, or deleted
 */

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

export const useRealtimePublicProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const setupRealtime = async () => {
      try {
        console.log('🔄 Setting up realtime subscription for public projects...');

        // Initial fetch - only active projects
        const { data, error: fetchError } = await supabaseClient
          .from('projects')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (mounted) {
          console.log('✅ Initial public projects loaded:', data?.length || 0);
          setProjects(data || []);
          setLoading(false);
        }

        // Subscribe to realtime changes
        subscription = supabaseClient
          .channel('public-projects-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'projects',
              filter: 'is_active=eq.true' // Only listen to active projects
            },
            (payload) => {
              console.log('🔔 Public project realtime event:', payload.eventType);

              if (!mounted) return;

              switch (payload.eventType) {
                case 'INSERT':
                  // Only add if it's active
                  if (payload.new.is_active) {
                    console.log('➕ New active project added');
                    setProjects(prev => {
                      if (prev.some(p => p.id === payload.new.id)) {
                        return prev;
                      }
                      return [payload.new, ...prev];
                    });
                  }
                  break;

                case 'UPDATE':
                  console.log('✏️ Project updated');
                  setProjects(prev => {
                    // If project was deactivated, remove it
                    if (!payload.new.is_active) {
                      return prev.filter(p => p.id !== payload.new.id);
                    }
                    // Update existing or add if newly activated
                    const exists = prev.some(p => p.id === payload.new.id);
                    if (exists) {
                      return prev.map(p => p.id === payload.new.id ? payload.new : p);
                    } else {
                      return [payload.new, ...prev];
                    }
                  });
                  break;

                case 'DELETE':
                  console.log('🗑️ Project deleted');
                  setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                  break;
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 Public projects subscription status:', status);
          });

      } catch (err) {
        console.error('❌ Public realtime setup error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (subscription) {
        console.log('🔌 Unsubscribing from public projects realtime...');
        supabaseClient.removeChannel(subscription);
      }
    };
  }, []);

  return { projects, loading, error };
};
