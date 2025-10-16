/**
 * 🔐 Admin Authentication API Route with Bcrypt Support
 * 
 * POST /api/auth/admin-login
 * 
 * This endpoint handles admin authentication using bcrypt hashed passwords
 * stored in the admin_users table.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, handleError, createResponse, validateRequest } from '@/lib/api-security';
import { z } from 'zod';

// Validation schema for admin login
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request) {
  try {
    // Apply rate limiting for admin login attempts
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-login-${clientIP}`, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = validateRequest(adminLoginSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Call the Supabase function to authenticate admin
    const { data, error } = await supabaseAdmin.rpc('authenticate_admin', {
      user_email: email,
      user_password: password
    });

    if (error) {
      console.error('Admin authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed', isValid: false },
        { status: 401 }
      );
    }

    // Check if authentication was successful
    const authResult = data[0]; // RPC returns an array
    
    if (!authResult || !authResult.is_valid) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials', 
          isValid: false,
          message: 'Email or password is incorrect'
        },
        { status: 401 }
      );
    }

    // Log successful admin login (for security monitoring)
    console.log(`Admin login successful: ${authResult.email} (${authResult.role})`);

    // Return successful authentication response
    return createResponse({
      isValid: true,
      user: {
        id: authResult.user_id,
        email: authResult.email,
        fullName: authResult.full_name,
        role: authResult.role
      },
      message: 'Admin authentication successful'
    });

  } catch (error) {
    console.error('Admin login API error:', error);
    return handleError(error, 'Admin login failed');
  }
}

// GET method to check admin status (if logged in)
export async function GET(request) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-status-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', isAdmin: false },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid token', isAdmin: false },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'User is not an admin', isAdmin: false },
        { status: 403 }
      );
    }

    return createResponse({
      isAdmin: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.full_name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin status check error:', error);
    return handleError(error, 'Failed to check admin status');
  }
}