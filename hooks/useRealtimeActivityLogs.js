/**
 * 🔄 Realtime Activity Logs Hook
 * 
 * Subscribes to Supabase realtime updates for activity_logs table
 * Automatically updates when new activities are logged
 * 
 * Security: Uses RLS policies - only fetches logs user can access
 */

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

export const useRealtimeActivityLogs = (limit = 10) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let sub = null;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        console.log('🔄 Setting up realtime subscription for activity logs...');

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

        if (isMounted) {
          setLogs(initialData || []);
          setLoading(false);
        }

        // Subscribe to realtime changes
        console.log('📡 Subscribing to activity_logs realtime...');
        sub = supabaseClient
          .channel('activity-logs-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'activity_logs'
            },
            (payload) => {
              console.log('🔔 Activity log realtime event:', payload.eventType, payload);

              if (isMounted) {
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
            console.log('📡 Activity logs subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime subscription active for activity logs');
            }
          });

        setSubscription(sub);
      } catch (err) {
        console.error('❌ Activity logs realtime setup error:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to setup realtime activity logs');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (sub) {
        console.log('🔌 Unsubscribing from activity logs realtime...');
        supabaseClient.removeChannel(sub);
      }
    };
  }, [limit]);

  return { logs, loading, error, subscription };
};
