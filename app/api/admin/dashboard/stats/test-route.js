import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple dashboard stats API for testing
export async function GET(request) {
  try {
    console.log('🧪 Testing dashboard stats API...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available');
      return NextResponse.json({ 
        error: 'Supabase configuration error',
        success: false
      }, { status: 500 });
    }

    console.log('✅ Supabase admin client available');

    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        success: false
      }, { status: 500 });
    }

    console.log('✅ Database connection test passed');

    // Return minimal stats for now
    return NextResponse.json({
      stats: {
        total_projects: 0,
        total_media_files: 0,
        total_contacts: 0,
        total_hero_sections: 0,
        total_showreels: 0,
        total_analytics_consent: 0
      },
      recent_activity: [],
      success: true,
      test_mode: true,
      message: 'Basic stats API working - full stats disabled for testing'
    });

  } catch (error) {
    console.error('❌ Stats API test error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: 'API test failed',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}