import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, validateRequest, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

// Use admin client for server-side operations (bypasses RLS)
const supabase = supabaseAdmin;

const showreelSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  video_url: z.string().url().refine(url => 
    url.includes('youtube.com') || url.includes('youtu.be'), 
    { message: "Must be a valid YouTube URL" }
  ),
  category: z.enum(['corporate', 'creative', 'vfx', 'animation']).optional().default('creative'),
  is_featured: z.boolean().optional().default(false),
  duration: z.number().int().min(1).max(3600).optional()
});

export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`showreels-get-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured') === 'true';

    let query = supabase
      .from('showreels')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch showreels');
    }

    return createResponse({ showreels: data });
  } catch (error) {
    return handleError(error, 'Failed to fetch showreels');
  }
}

export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`showreels-post-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    console.log('📝 Showreel POST request body:', body);
    
    const validation = validateRequest(showreelSchema, body);

    if (!validation.success) {
      console.error('❌ Showreel validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }
    
    console.log('✅ Showreel validation passed:', validation.data);

    // Prepare insert data and ensure required DB fields are satisfied.
    const insertData = { ...validation.data };

    // The DB enforces NOT NULL on `title` — generate a sensible default
    // from the YouTube video ID when the client doesn't provide a title.
    const videoUrl = insertData.video_url || '';
    const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = match ? match[1] : null;
    if (!insertData.title) {
      insertData.title = videoId ? `Showreel - ${videoId}` : 'Untitled Showreel';
    }

    // Auto-generate thumbnail URL from YouTube video ID if missing.
    // Use maxresdefault where available, fall back to hqdefault.
    if (videoId && !insertData.thumbnail_url) {
      insertData.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // We intentionally do not upload YouTube thumbnails to storage.
    // The frontend will play the video directly from the YouTube URL when requested.

    const { data, error } = await supabase
      .from('showreels')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create showreel');
    }

    return createResponse(data, 201);
  } catch (error) {
    console.error('💥 Showreel creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return handleError(error, 'Failed to create showreel');
  }
}

export async function PUT(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`showreels-put-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Showreel ID is required' }, { status: 400 });
    }

    const validation = validateRequest(showreelSchema.partial(), updateData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('showreels')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update showreel');
    }

    return createResponse(data);
  } catch (error) {
    return handleError(error, 'Failed to update showreel');
  }
}

export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`showreels-delete-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Showreel ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('showreels')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete showreel');
    }

    return createResponse({ message: 'Showreel deleted successfully' });
  } catch (error) {
    return handleError(error, 'Failed to delete showreel');
  }
}