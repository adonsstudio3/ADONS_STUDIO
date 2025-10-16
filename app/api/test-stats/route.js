import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Test stats API called');
  
  try {
    // Simple test response
    return NextResponse.json({
      success: true,
      message: 'API is working',
      stats: {
        total_projects: 5,
        total_media_files: 15,
        total_contacts: 3,
        total_hero_sections: 2,
        total_showreels: 1,
        total_analytics_consent: 10
      },
      recent_activity: [
        { action: 'Test activity', timestamp: new Date().toISOString() }
      ]
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test API failed', details: error.message },
      { status: 500 }
    );
  }
}