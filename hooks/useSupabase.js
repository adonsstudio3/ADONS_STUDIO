/**
 * 🎨 Frontend Supabase Hook for RLS-Enabled Operations
 * 
 * This hook provides a convenient way to interact with Supabase from React components
 * while respecting Row Level Security (RLS) policies.
 * 
 * Usage:
 * const { data, loading, error, refetch } = useSupabaseQuery('projects');
 */

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

/**
 * React hook for Supabase queries with RLS support
 * 
 * @param {string} table - Table name to query
 * @param {Object} options - Query options
 * @param {string} options.select - Columns to select (default: '*')
 * @param {Object} options.filter - Filter conditions
 * @param {Object} options.order - Order configuration
 * @param {number} options.limit - Number of records to fetch
 * @returns {Object} Query state and methods
 */
export const useSupabaseQuery = (table, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    select = '*',
    filter = {},
    order = { column: 'created_at', ascending: false },
    limit = null
  } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from(table)
        .select(select);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (typeof value === 'object' && value.operator) {
          // Advanced filter: { operator: 'ilike', value: '%search%' }
          query = query[value.operator](key, value.value);
        } else {
          // Simple filter: { category: 'vfx' }
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (order.column) {
        query = query.order(order.column, { ascending: order.ascending });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result);
    } catch (err) {
      setError(err.message);
      console.error(`Supabase query error for table ${table}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, JSON.stringify(options)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook for realtime Supabase subscriptions with RLS
 * 
 * @param {string} table - Table name to subscribe to
 * @param {Function} onUpdate - Callback for data updates
 * @param {Object} filter - Filter conditions for subscription
 */
export const useSupabaseSubscription = (table, onUpdate, filter = {}) => {
  useEffect(() => {
    let subscription;

    const setupSubscription = async () => {
      try {
        subscription = supabaseClient
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              ...filter
            },
            (payload) => {
              console.log(`${table} change detected:`, payload);
              if (onUpdate) {
                onUpdate(payload);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error(`Subscription error for table ${table}:`, error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabaseClient.removeChannel(subscription);
      }
    };
  }, [table, onUpdate]);
};

/**
 * Example React component using RLS-enabled Supabase queries
 */
export const ProjectsList = () => {
  // Fetch projects with RLS policies applied
  const { data: projects, loading, error, refetch } = useSupabaseQuery('projects', {
    select: 'id, title, description, category, thumbnail_url, is_featured',
    filter: { is_featured: true },
    order: { column: 'created_at', ascending: false },
    limit: 10
  });

  // Subscribe to realtime changes
  useSupabaseSubscription('projects', (payload) => {
    console.log('Project updated:', payload);
    refetch(); // Refresh data when changes occur
  });

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="projects-list">
      <h2>Featured Projects</h2>
      {projects?.map(project => (
        <div key={project.id} className="project-card">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <span className="category">{project.category}</span>
        </div>
      ))}
    </div>
  );
};

export default useSupabaseQuery;