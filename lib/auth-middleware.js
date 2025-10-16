import { supabaseAdmin } from '@/lib/supabase';

// ✅ SUPABASE AUTH - No custom JWT needed!
// Supabase handles all JWT token creation, validation, and security

export async function verifySupabaseAuth(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    // Let Supabase validate the JWT token (works in Edge/runtime)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return { valid: false, error: error?.message || 'Invalid token' };
    }

    // Check if user has admin privileges
    const isAdmin = await checkAdminRole(user);
    if (!isAdmin) {
      return { valid: false, error: 'Admin access required' };
    }

    return { 
      valid: true, 
      user,
      isAdmin: true
    };

  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function checkAdminRole(user) {
  try {
    console.log('🔍 Checking admin role for user:', user.email);
    
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin is null - service role key missing!');
      return false;
    }
    
    // Check if user exists in admin_users table
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, role, is_active')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    console.log('📊 Admin check result:', { data, error, userEmail: user.email });

    if (error) {
      console.error('❌ Admin role check error:', error);
      return false;
    }

    const isAdmin = data && ['super_admin', 'admin'].includes(data.role);
    console.log('✅ Is admin?', isAdmin, 'Role:', data?.role);
    
    return isAdmin;
  } catch (error) {
    console.error('Admin role check error:', error);
    return false;
  }
}

export function withSupabaseAuth(handler) {
  return async (request, context) => {
    const authResult = await verifySupabaseAuth(request);
    
    if (!authResult.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          message: authResult.error
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add user info to request context for the handler
    request.supabaseUser = authResult.user;
    request.isAdmin = authResult.isAdmin;
    
    // Call the original handler with authenticated context
    return handler(request, context);
  };
}

// Legacy support - redirect to Supabase auth
export const withAuth = withSupabaseAuth;
export const requireAdmin = withSupabaseAuth;