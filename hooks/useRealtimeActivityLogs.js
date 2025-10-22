/**
 * 🔄 Realtime Activity Logs Hook
 * 
 * Subscribes to Supabase realtime updates for activity_logs table
 * Automatically updates when new activities are logged
 * 
 * Security: Uses RLS policies - only fetches logs user can access
 */

import { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';

// 🔄 Global subscription cache - persists across component mounts
const activityLogsSubscriptionRef = {
  subscription: null,
  initialized: false,
  isMountedRef: { current: false }
};

export const useRealtimeActivityLogs = (limit = 10) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Only run on client-side where WebSocket is available
    if (typeof window === 'undefined') return;

    isMountedRef.current = true;

    const setupRealtime = async () => {
      try {
        // If subscription already initialized, reuse it (just fetch data)
        if (activityLogsSubscriptionRef.initialized) {
          console.log('📚 Reusing existing activity logs subscription');
          
          // Fetch current data
          const { data: initialData, error: fetchError } = await supabaseClient
            .from('activity_logs')
            .select(`
              id,
              user_id,
              action,
              resource_type,
              resource_id,
              resource_title,
              details,
              severity,
              created_at,
              ip_address,
              user_agent
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (fetchError) throw fetchError;
          if (isMountedRef.current) {
            setLogs(initialData || []);
            setLoading(false);
          }
          return;
        }

        setLoading(true);

        // Initial fetch - respect RLS policies
        const { data: initialData, error: fetchError } = await supabaseClient
          .from('activity_logs')
          .select(`
            id,
            user_id,
            action,
            resource_type,
            resource_id,
            resource_title,
            details,
            severity,
            created_at,
            ip_address,
            user_agent
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          console.error('❌ Failed to fetch initial activity logs:', fetchError);
          throw fetchError;
        }

        if (isMountedRef.current) {
          setLogs(initialData || []);
          setLoading(false);
        }

        // Subscribe to realtime changes (only first time)
        const sub = supabaseClient
          .channel('activity-logs-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'activity_logs'
            },
            (payload) => {
              // Update logs in ALL mounted instances via component state
              if (isMountedRef.current) {
                if (payload.eventType === 'INSERT') {
                  // Add new log to the top
                  setLogs(prevLogs => {
                    const newLog = payload.new;
                    const updated = [newLog, ...prevLogs].slice(0, limit);
                    return updated;
                  });
                } else if (payload.eventType === 'UPDATE') {
                  // Update existing log
                  setLogs(prevLogs =>
                    prevLogs.map(log =>
                      log.id === payload.new.id ? payload.new : log
                    )
                  );
                } else if (payload.eventType === 'DELETE') {
                  // Remove deleted log
                  setLogs(prevLogs =>
                    prevLogs.filter(log => log.id !== payload.old.id)
                  );
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Activity logs subscription active');
            }
          });

        // Cache the subscription globally
        activityLogsSubscriptionRef.subscription = sub;
        activityLogsSubscriptionRef.initialized = true;
      } catch (err) {
        console.error('❌ Activity logs realtime setup error:', err);
        if (isMountedRef.current) {
          setError(err?.message || 'Failed to setup realtime activity logs');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      isMountedRef.current = false;
      // 🎯 DON'T unsubscribe - keep subscription alive for other components
    };
  }, [limit]);

  return { logs, loading, error };
};
