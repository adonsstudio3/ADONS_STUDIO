/**
 * 🔄 Public Hero Sections Hook (PUBLIC)
 *
 * Polls Supabase for hero sections updates every 60 seconds
 * Automatically updates frontend when hero sections change
 *
 * Uses supabasePublicClient - a COMPLETELY ISOLATED instance that doesn't share auth state
 *
 * Features:
 * - In-memory cache to prevent loading flashes on remount
 * - Independent of admin authentication state
 * - Polls every 60 seconds for updates
 */

import { useState, useEffect } from 'react';
import { supabasePublicClient } from '@/lib/supabase';

// In-memory cache to prevent loading states when component remounts
// This ensures the frontend NEVER shows loading when admin is loading
let heroSectionsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 30 * 1000; // 30 seconds - reduced for faster updates

export const usePublicHeroSections = () => {
  // Initialize with cached data if available (NO loading state!)
  const [heroSections, setHeroSections] = useState(heroSectionsCache || []);
  const [loading, setLoading] = useState(!heroSectionsCache); // Only show loading if no cache
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    let mounted = true;
    let pollInterval = null;

    const fetchHeroSections = async (isInitial = false) => {
      try {
        // Check if cache is still valid (don't show loading for background updates)
        const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : Infinity;
        const cacheValid = cacheAge < CACHE_TTL;

        // If we have valid cache and this is a background update, don't show loading
        if (cacheValid && !isInitial) {
          setLoading(false);
        }

        // Fetch using the PUBLIC client (separate from admin auth)
        const { data, error: fetchError } = await supabasePublicClient
          .from('hero_sections')
          .select('*')
          .eq('is_active', true) // Only active hero sections
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Failed to fetch public hero sections:', fetchError);
          if (mounted) {
            setError(fetchError.message);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          // Update cache
          heroSectionsCache = data || [];
          cacheTimestamp = Date.now();

          setHeroSections(data || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Public hero sections fetch error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    // Initial fetch (only show loading if no cache)
    if (!heroSectionsCache) {
      setLoading(true);
      fetchHeroSections(true);
    } else {
      // Use cache immediately, then refresh in background
      setLoading(false);
      fetchHeroSections(false);
    }

    // Poll every 60 seconds for updates (hero sections change rarely)
    pollInterval = setInterval(() => {
      if (mounted) {
        fetchHeroSections(false);
      }
    }, 30000); // Poll every 30 seconds for faster updates

    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  return { heroSections, loading, error };
};
