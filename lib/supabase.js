/**
 * 🛡️ Supabase Client Configuration with Row Level Security (RLS)
 * 
 * This file provides Supabase clients for different use cases:
 * - Server-side client with service role (bypasses RLS for admin operations)
 * - Client-side client with anon key (respects RLS policies)
 * - Auth-aware client for authenticated operations
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables in development only
if (process.env.NODE_ENV !== 'production') {

}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'SET' : 'MISSING'
  });
  throw new Error('Missing required Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
}

// Warn if service key is missing (needed for admin operations)
if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing - admin operations will not work');
}

/**
 * 🔑 Server-side Supabase client with SERVICE ROLE
 * 
 * ⚠️ BYPASSES RLS - Use only for:
 * - Admin operations
 * - Server-side API routes
 * - Operations that need to bypass RLS policies
 * 
 * This client has full database access regardless of RLS policies.
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    })
  : null; // Return null if service key is missing

/**
 * 🌐 Client-side Supabase client with ANON KEY (ADMIN USE)
 *
 * ✅ RESPECTS RLS - Use for:
 * - Admin authenticated operations
 * - Admin panel components
 *
 * This client uses SEPARATE localStorage namespace to prevent
 * conflicts with public client.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'adons-admin-auth', // CUSTOM key to isolate from public
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'adons-studio-admin',
    },
  },
});

/**
 * 🚫 No-Op Storage Implementation
 *
 * Custom storage that does NOTHING - prevents any localStorage access
 * This ensures ZERO interference with admin auth state
 */
const noOpStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * 🔓 Public-only Supabase client (NO AUTH)
 *
 * COMPLETELY ISOLATED instance for public pages.
 * - NO authentication state
 * - NO session persistence
 * - NO connection sharing with admin client
 * - NO localStorage access (custom no-op storage)
 * - Separate realtime channels
 *
 * This ensures admin loading states NEVER affect public pages.
 * Works even when admin is logged in on the same browser.
 */
export const supabasePublicClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: noOpStorage, // Custom no-op storage - ZERO localStorage access
    storageKey: 'adons-public-noop', // Different key (though storage is no-op anyway)
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Use separate realtime connection pool
    params: {
      eventsPerSecond: 2, // Lower rate for public (less frequent updates)
    },
  },
  global: {
    headers: {
      'x-application-name': 'adons-studio-public',
      'x-client-type': 'public-readonly', // Mark as public client
    },
  },
});

/**
 * 👤 Get authenticated Supabase client
 * 
 * Returns a client configured with the current user's session.
 * Use this when you need to perform authenticated operations that respect RLS.
 * 
 * @param {string} accessToken - User's access token
 * @returns {Object} Authenticated Supabase client
 */
export const getAuthenticatedClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-application-name': 'adons-studio-auth',
      },
    },
  });
};

/**
 * 🔒 Get client for RLS-enabled operations
 * 
 * This function returns the appropriate client based on context:
 * - Server-side: Uses service role for admin operations
 * - Client-side: Uses anon key with RLS policies
 * 
 * @param {boolean} isServerSide - Whether this is a server-side operation
 * @param {string} accessToken - Optional user access token for authenticated operations
 * @returns {Object} Appropriate Supabase client
 */
export const getSupabaseClient = (isServerSide = false, accessToken = null) => {
  if (isServerSide && supabaseServiceKey) {
    // Server-side admin operations (bypasses RLS)
    return supabaseAdmin;
  }
  
  if (accessToken) {
    // Authenticated client (respects RLS for user)
    return getAuthenticatedClient(accessToken);
  }
  
  // Default client (respects RLS)
  return supabaseClient;
};

/**
 * 🛠️ Database Table Definitions
 * 
 * These are the tables that should have RLS policies enabled:
 */
export const RLS_ENABLED_TABLES = [
  'projects',
  'hero_sections', 
  'media_files',
  'showreels',
  'analytics_consent',
  'admin_users', // If you have admin authentication
];

/**
 * 📋 RLS Policy Templates
 * 
 * Common RLS policies you should create in Supabase:
 */
export const RLS_POLICIES = {
  // Public read access (for frontend display)
  PUBLIC_READ: {
    name: 'Public read access',
    sql: 'CREATE POLICY "Public read access" ON {table} FOR SELECT USING (true);'
  },
  
  // Admin full access (for authenticated admin users)
  ADMIN_FULL_ACCESS: {
    name: 'Admin full access',
    sql: `CREATE POLICY "Admin full access" ON {table} FOR ALL 
          USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');`
  },
  
  // Authenticated users can insert
  AUTHENTICATED_INSERT: {
    name: 'Authenticated insert',
    sql: 'CREATE POLICY "Authenticated insert" ON {table} FOR INSERT TO authenticated WITH CHECK (true);'
  }
};

export default supabaseClient;