import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch hero sections for admin
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-hero-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    const isActive = url.searchParams.get('active');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('hero_sections')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (page) query = query.eq('page', page);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');

    // Get total count
    const { count } = await supabase
      .from('hero_sections')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch hero sections');
    }

    return createResponse({
      heroSections: data,
      total: count || 0,
      offset,
      limit
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch hero sections');
  }
}

// POST - Create new hero section
export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-hero-post-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const {
      page,
      title,
      subtitle,
      description,
      background_image_url,
      background_video_url,
      cta_text,
      cta_url,
      is_active = false,
      order_index
    } = body;

    // Validation
    if (!page || !title) {
      return NextResponse.json({ 
        error: 'Page and title are required' 
      }, { status: 400 });
    }

    // Get the next order_index if not provided
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined) {
      const { data: maxOrder } = await supabase
        .from('hero_sections')
        .select('order_index')
        .eq('page', page)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();
      
      finalOrderIndex = (maxOrder?.order_index || 0) + 1;
    }

    const { data, error } = await supabase
      .from('hero_sections')
      .insert([{
        page: page.trim(),
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        description: description?.trim() || null,
        background_image_url: background_image_url || null,
        background_video_url: background_video_url || null,
        cta_text: cta_text?.trim() || null,
        cta_url: cta_url?.trim() || null,
        is_active,
        order_index: finalOrderIndex
      }])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create hero section');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'hero_section_created',
        details: { 
          hero_id: data.id,
          page: data.page,
          title: data.title
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Hero section created successfully',
      heroSection: data
    }, 201);

  } catch (error) {
    return handleError(error, 'Failed to create hero section');
  }
}

// PUT - Update existing hero section
export async function PUT(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-hero-put-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero section ID is required' }, { status: 400 });
    }

    // Clean up the update data
    const cleanedData = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'string') {
          cleanedData[key] = value.trim();
        } else {
          cleanedData[key] = value;
        }
      }
    });

    cleanedData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('hero_sections')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update hero section');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'hero_section_updated',
        details: { 
          hero_id: id,
          updated_fields: Object.keys(cleanedData),
          title: data.title
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Hero section updated successfully',
      heroSection: data
    });

  } catch (error) {
    return handleError(error, 'Failed to update hero section');
  }
}

// DELETE - Delete hero section
export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-hero-delete-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hero section ID is required' }, { status: 400 });
    }

    // Get hero section details before deletion
    const { data: heroSection } = await supabase
      .from('hero_sections')
      .select('page, title, background_image_url, background_video_url')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('hero_sections')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete hero section');
    }

    // TODO: Clean up associated media files from storage

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'hero_section_deleted',
        details: { 
          hero_id: id,
          deleted_hero: heroSection
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Hero section deleted successfully'
    });

  } catch (error) {
    return handleError(error, 'Failed to delete hero section');
  }
}