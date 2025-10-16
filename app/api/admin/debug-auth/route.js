import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Check what headers are being sent
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent');
    const origin = request.headers.get('origin');
    
    // Check if middleware set any headers
    const userId = request.headers.get('x-supabase-user-id');
    const userRole = request.headers.get('x-supabase-user-role');
    
    return NextResponse.json({
      success: true,
      debug: {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader ? authHeader.slice(0, 20) + '...' : 'None',
        middlewareUserId: userId || 'Not set',
        middlewareUserRole: userRole || 'Not set',
        userAgent: userAgent?.slice(0, 50) + '...' || 'Not set',
        origin: origin || 'Not set',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}