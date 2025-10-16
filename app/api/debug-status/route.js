import { supabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic connectivity
    const { data: session, error: sessionError } = await supabaseClient.auth.getSession();
    
    // Test database connectivity  
    const { data: testData, error: dbError } = await supabaseClient
      .from('admin_users')
      .select('count')
      .limit(1);

    return Response.json({
      success: true,
      session: session ? 'Active' : 'None',
      sessionError: sessionError?.message || null,
      database: dbError ? 'Error' : 'Connected',
      dbError: dbError?.message || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}