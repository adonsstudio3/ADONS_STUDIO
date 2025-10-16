import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// One-time fix: Set project_url to video_url for existing projects
export async function POST(request) {
  try {
    // Get all projects without project_url
    const { data: projects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, title, video_url, project_url')
      .is('project_url', null);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log(`Found ${projects.length} projects without project_url`);

    // Update each project to use video_url as project_url
    const updates = [];
    for (const project of projects) {
      if (project.video_url) {
        const { data, error } = await supabaseAdmin
          .from('projects')
          .update({ project_url: project.video_url })
          .eq('id', project.id)
          .select();

        if (error) {
          console.error(`Failed to update project ${project.id}:`, error);
        } else {
          console.log(`Updated project: ${project.title}`);
          updates.push({ id: project.id, title: project.title, url: project.video_url });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} projects`,
      updated: updates
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
