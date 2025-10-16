import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch all published projects for public display
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`projects-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        short_description,
        thumbnail_url,
        category,
        tags,
        is_featured,
        order_index,
        created_at,
        client_name,
        project_url,
        completion_date
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) query = query.eq('category', category);
    if (featured) query = query.eq('is_featured', true);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch projects');
    }

    // Ensure thumbnail URLs are full public URLs
    const projectsWithFullUrls = data.map(project => {
      let thumbnailUrl = project.thumbnail_url;
      
      console.log('🖼️ Processing project thumbnail:', {
        projectId: project.id,
        title: project.title,
        originalUrl: thumbnailUrl
      });
      
      // If thumbnail_url exists but doesn't start with http/https, construct the full Supabase URL
      if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // If it's a storage path like "thumbnails/filename.jpg"
        if (thumbnailUrl.includes('/') && !thumbnailUrl.startsWith('/storage')) {
          thumbnailUrl = `${supabaseUrl}/storage/v1/object/public/project-assets/${thumbnailUrl}`;
          console.log('✅ Constructed full URL:', thumbnailUrl);
        }
      } else if (thumbnailUrl) {
        console.log('✅ Using existing full URL:', thumbnailUrl);
      } else {
        console.log('⚠️ No thumbnail URL found');
      }
      
      return {
        ...project,
        thumbnail_url: thumbnailUrl
      };
    });

    // Get unique categories for filtering
    const { data: categories } = await supabase
      .from('projects')
      .select('category')
      .eq('is_active', true)
      .then(result => {
        if (result.error) return { data: [] };
        const uniqueCategories = [...new Set(result.data.map(p => p.category))].filter(Boolean);
        return { data: uniqueCategories };
      });

    return createResponse({
      projects: projectsWithFullUrls,
      total: projectsWithFullUrls.length,
      offset,
      limit,
      categories: categories || []
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch projects');
  }
}