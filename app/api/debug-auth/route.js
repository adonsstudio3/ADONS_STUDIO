import { supabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection
    const { data: session, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      return Response.json({ 
        error: 'Session error', 
        details: sessionError.message,
        success: false 
      }, { status: 500 });
    }

    // Test basic database connection
    const { data, error: dbError } = await supabaseClient
      .from('admin_users')
      .select('count')
      .limit(1);

    if (dbError) {
      return Response.json({ 
        error: 'Database connection error', 
        details: dbError.message,
        session: session ? 'Active' : 'None',
        success: false 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      session: session ? 'Active' : 'None',
      database: 'Connected',
      user: session?.user?.email || 'No user',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      error: 'Unexpected error', 
      details: error.message,
      success: false 
    }, { status: 500 });
  }
}