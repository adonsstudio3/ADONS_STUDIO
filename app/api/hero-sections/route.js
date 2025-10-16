import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

// Cache the hero sections data for 30 seconds
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(request) {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Serving hero sections from cache');
      const response = NextResponse.json(cachedData);
      // Allow browser caching for 30 seconds
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return response;
    }
    
    console.log('🔄 Fetching fresh hero sections from database');
    
    // Use client (not admin) for public data - respects RLS policies
    const { data, error } = await supabaseClient
      .from('hero_sections')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Hero sections fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch hero sections' }, 
        { status: 500 }
      );
    }

    const responseData = { 
      hero_sections: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
      cached: false
    };
    
    // Update cache
    cachedData = responseData;
    cacheTimestamp = now;
    
    const finalResponse = NextResponse.json(responseData);
    // Allow browser caching for 30 seconds
    finalResponse.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    
    return finalResponse;

  } catch (error) {
    console.error('Hero sections API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}