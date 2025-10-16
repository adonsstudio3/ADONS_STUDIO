import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Debug endpoint to see raw project data
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      projects: data,
      // Show first project in detail
      firstProject: data[0] ? {
        id: data[0].id,
        title: data[0].title,
        thumbnail_url: data[0].thumbnail_url,
        project_url: data[0].project_url,
        is_active: data[0].is_active,
        hasThumb: !!data[0].thumbnail_url,
        hasProjectUrl: !!data[0].project_url,
        thumbStartsWith: data[0].thumbnail_url?.substring(0, 50)
      } : null
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
