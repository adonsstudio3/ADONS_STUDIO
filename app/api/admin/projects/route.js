import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch all projects (including unpublished) for admin
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-projects-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status'); // published, draft, archived
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) query = query.eq('category', category);
    if (status === 'published') query = query.eq('is_published', true);
    if (status === 'draft') query = query.eq('is_published', false);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,client_name.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch projects');
    }

    // Map database field names to frontend expected names
    const mappedData = data?.map(project => ({
      ...project,
      thumbnail_image_url: project.thumbnail_url, // Map for frontend compatibility
    })) || [];

    return createResponse({
      projects: mappedData,
      total: count || 0,
      offset,
      limit
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch projects');
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-projects-post-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    console.log('📝 Project POST request body:', body);
    
    const {
      title,
      description,
      short_description,
      thumbnail_image_url,
      category,
      tags = [],
      is_featured = false,
      is_active = false,
      client_name,
      project_url,
      completion_date,
      order_index
    } = body;

    // Validation
    if (!title || !description) {
      console.error('❌ Project validation failed: Missing title or description');
      return NextResponse.json({ 
        error: 'Title and description are required' 
      }, { status: 400 });
    }
    
    console.log('✅ Project validation passed');

    // Get the next order_index if not provided
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined) {
      const { data: maxOrder } = await supabase
        .from('projects')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();
      
      finalOrderIndex = (maxOrder?.order_index || 0) + 1;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: title.trim(),
        description: description.trim(),
        short_description: short_description?.trim() || null,
        thumbnail_url: thumbnail_image_url || null,
        category: category?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        is_featured,
        is_active,
        client_name: client_name?.trim() || null,
        project_url: project_url?.trim() || null,
        completion_date: completion_date || null,
        order_index: finalOrderIndex
      }])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create project');
    }

    // Log the action (non-blocking - don't fail if logging fails)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'project_created',
          details: { 
            project_id: data.id,
            title: data.title,
            category: data.category
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      console.warn('⚠️ Failed to log activity (non-critical):', logError.message);
    }

    return createResponse({
      message: 'Project created successfully',
      data: {
        ...data,
        thumbnail_image_url: data.thumbnail_url // Map for frontend compatibility
      }
    }, 201);

  } catch (error) {
    console.error('💥 Project creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return handleError(error, 'Failed to create project');
  }
}

// PUT - Update existing project
export async function PUT(request) {
  try {
    console.log('🔄 PUT /api/admin/projects - Update project request received');
    
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-projects-put-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    console.log('📝 PUT request body:', body);
    
    const { id, ...updateData } = body;

    if (!id) {
      console.error('❌ No project ID provided');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    console.log('🔍 Updating project ID:', id);
    console.log('📦 Update data:', updateData);

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
    
    console.log('🧹 Cleaned data to update:', cleanedData);

    const { data, error } = await supabase
      .from('projects')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      return handleError(error, 'Failed to update project');
    }

    console.log('✅ Project updated successfully:', data);

    // Log the action (non-blocking - don't fail if logging fails)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'project_updated',
          details: { 
            project_id: id,
            updated_fields: Object.keys(cleanedData),
            title: data.title
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      console.warn('⚠️ Failed to log activity (non-critical):', logError.message);
    }

    return createResponse({
      message: 'Project updated successfully',
      data: {
        ...data,
        thumbnail_image_url: data.thumbnail_url // Map for frontend compatibility
      }
    });

  } catch (error) {
    console.error('💥 PUT /api/admin/projects error:', error);
    return handleError(error, 'Failed to update project');
  }
}

// DELETE - Delete project
export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-projects-delete-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project details before deletion
    const { data: project } = await supabase
      .from('projects')
      .select('title, category, thumbnail_url')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete project');
    }

    // TODO: Clean up associated media files from storage
    // You might want to delete thumbnails and gallery images here

    // Log the action (non-blocking - don't fail if logging fails)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'project_deleted',
          details: { 
            project_id: id,
            deleted_project: project
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      console.warn('⚠️ Failed to log activity (non-critical):', logError.message);
    }

    return createResponse({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    return handleError(error, 'Failed to delete project');
  }
}