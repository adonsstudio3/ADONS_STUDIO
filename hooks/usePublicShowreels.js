/**
 * 🔄 Public Showreels Hook (PUBLIC)
 *
 * Polls Supabase for showreels updates every 60 seconds
 * Automatically updates frontend when showreels change
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
let showreelsCache = null;
let featuredShowreelCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePublicShowreels = () => {
  // Initialize with cached data if available (NO loading state!)
  const [showreels, setShowreels] = useState(showreelsCache || []);
  const [featuredShowreel, setFeaturedShowreel] = useState(featuredShowreelCache || null);
  const [loading, setLoading] = useState(!showreelsCache); // Only show loading if no cache
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    let mounted = true;
    let pollInterval = null;

    const fetchShowreels = async (isInitial = false) => {
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
          .from('showreels')
          .select('*')
          .eq('is_active', true) // Only active showreels
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Failed to fetch public showreels:', fetchError);
          if (mounted) {
            setError(fetchError.message);
            setLoading(false);
          }
          return;
        }

        console.log('🎥 Fetched public showreels:', data?.length || 0);

        if (mounted) {
          // Update cache
          showreelsCache = data || [];
          const featured = data?.find(s => s.is_featured && s.is_active) || data?.[0] || null;
          featuredShowreelCache = featured;
          cacheTimestamp = Date.now();

          setShowreels(data || []);
          setFeaturedShowreel(featured);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Public showreels fetch error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    // Initial fetch (only show loading if no cache)
    if (!showreelsCache) {
      setLoading(true);
      fetchShowreels(true);
    } else {
      // Use cache immediately, then refresh in background
      setLoading(false);
      fetchShowreels(false);
    }

    // Poll every 60 seconds for updates (showreels change rarely)
    pollInterval = setInterval(() => {
      if (mounted) {
        fetchShowreels(false);
      }
    }, 60000);

    return () => {
      console.log('🧹 Cleaning up public showreels polling');
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  return { showreels, featuredShowreel, loading, error };
};
