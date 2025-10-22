/**
 * Minimal Next.js Middleware - No Redirects
 */

import { NextResponse } from 'next/server';
import { verifySupabaseAuth } from '@/lib/auth-middleware';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only run middleware for admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Exclude password reset endpoints from authentication requirement
    const publicAdminEndpoints = [
      '/api/admin/request-password-reset',
      '/api/admin/verify-reset-code',
      '/api/admin/confirm-reset-password',
      '/api/admin/reset-password'
    ];

    const isPublicEndpoint = publicAdminEndpoints.some(endpoint => pathname.startsWith(endpoint));

    if (!isPublicEndpoint) {
      try {
        const authResult = await verifySupabaseAuth(request);
        if (!authResult.valid) {
          return NextResponse.json({ error: 'Authentication required', message: authResult.error }, { status: 401 });
        }

        // Attach minimal user info to headers for downstream handlers if needed
        const res = NextResponse.next();
        if (authResult.user?.id) {
          res.headers.set('x-supabase-user-id', authResult.user.id);
          res.headers.set('x-user-id', authResult.user.id); // For compatibility
        }
        if (authResult.user?.email) {
          res.headers.set('x-user-email', authResult.user.email);
        }
        if (authResult.user?.role) res.headers.set('x-supabase-user-role', authResult.user.role);
        return res;
      } catch (err) {
        console.error('Middleware auth error:', err);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    }
  }

  // For non-admin routes, pass through and add a minimal security header
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: ['/api/admin/:path*']
};