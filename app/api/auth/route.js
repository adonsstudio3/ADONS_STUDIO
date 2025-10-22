import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';

// ✅ SUPABASE AUTH - No custom JWT needed!
// Supabase handles JWT creation, validation, and security automatically

// POST - Admin login with Supabase Auth
export async function POST(request) {
  try {
    // Apply hybrid rate limiting (Redis + in-memory fallback)
    const rateLimitResult = await applyRateLimit(request, 'auth');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // ✅ Restrict access to specific admin email only
    if (email !== 'adonsstudio3@gmail.com') {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // ✅ Authenticate with Supabase (handles JWT automatically)
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Log failed login attempt
      await supabaseAdmin
        .from('activity_logs')
        .insert([{
          action: 'login_failed',
          details: { 
            email,
            error: error.message,
            ip_address: clientIP
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);

      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    const { user, session } = data;

    if (!user || !session) {
      return NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 401 });
    }

    // ✅ Check if user is the authorized admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, is_active, last_login')
      .eq('email', 'adonsstudio3@gmail.com')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      // Sign out the user since they're not the authorized admin
      await supabaseAdmin.auth.signOut();
      
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Log successful login
    await supabaseAdmin
      .from('activity_logs')
      .insert([{
        action: 'admin_login_success',
        details: { 
          user_id: user.id,
          email: user.email,
          ip_address: clientIP
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    // ✅ Return Supabase session (includes JWT automatically)
    return createResponse({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: adminUser.role
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return handleError(error, 'Login failed');
  }
}

// GET - Verify Supabase Token
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'No token provided' 
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // ✅ Let Supabase verify the JWT token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check admin status
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: adminUser?.role || 'user',
        isAdmin: adminUser?.role === 'admin'
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return handleError(error, 'Token verification failed');
  }
}

// DELETE - Logout
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Get user info before logout for logging
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      // ✅ Sign out from Supabase
      const { error } = await supabaseAdmin.auth.signOut(token);
      
      if (!error && user) {
        // Log logout
        await supabaseAdmin
          .from('activity_logs')
          .insert([{
            action: 'admin_logout',
            details: { 
              user_id: user.id,
              email: user.email
            },
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || ''
          }]);
      }
    }

    return createResponse({
      message: 'Logout successful'
    });

  } catch (error) {
    return handleError(error, 'Logout failed');
  }
}