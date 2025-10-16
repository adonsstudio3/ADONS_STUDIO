import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Extract YouTube video ID and generate thumbnail URL
function getYouTubeThumbnail(videoUrl) {
  if (!videoUrl) return null;
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match && match[1]) {
      // Use maxresdefault for best quality, fallback to hqdefault if not available
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  
  return null;
}

// One-time fix: Set YouTube thumbnails for projects
export async function POST(request) {
  try {
    const { data: projects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, title, video_url, thumbnail_url')
      .is('thumbnail_url', null);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log(`Found ${projects.length} projects without thumbnails`);

    const updates = [];
    for (const project of projects) {
      const thumbnailUrl = getYouTubeThumbnail(project.video_url);
      
      if (thumbnailUrl) {
        const { data, error } = await supabaseAdmin
          .from('projects')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', project.id)
          .select();

        if (error) {
          console.error(`Failed to update project ${project.id}:`, error);
        } else {
          console.log(`Updated thumbnail for: ${project.title}`);
          updates.push({ 
            id: project.id, 
            title: project.title, 
            thumbnail: thumbnailUrl 
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} project thumbnails`,
      updated: updates
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
