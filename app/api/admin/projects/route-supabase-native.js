/**
 * SUPABASE-NATIVE API REFACTOR
 * Direct integration with Supabase - No custom backend needed
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validator, apiResponse, middleware } from '@/lib/api-security';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Server-side operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET: Retrieve projects directly from Supabase
export async function GET(request) {
  try {
    // Authenticate request
    const authResult = await middleware.validateAuthToken(request);
    if (!authResult.valid) {
      return NextResponse.json(apiResponse.error(authResult.error, 401), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      page: Math.max(1, parseInt(searchParams.get('page')) || 1),
      limit: Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 10)),
      category: searchParams.get('category'),
      featured: searchParams.get('featured'),
      search: searchParams.get('search')?.trim(),
      active_only: searchParams.get('active_only') === 'true'
    };

    // Build Supabase query
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' });

    // Apply filters
    if (queryParams.category && queryParams.category !== 'all') {
      query = query.eq('category', queryParams.category);
    }

    if (queryParams.featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (queryParams.active_only) {
      query = query.eq('is_active', true);
    }

    if (queryParams.search) {
      query = query.or(`title.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`);
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.limit;
    const to = from + queryParams.limit - 1;
    
    query = query
      .range(from, to)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    // Execute query
    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        apiResponse.error('Failed to fetch projects', 500),
        { status: 500 }
      );
    }

    // Format response
    const response = {
      projects: projects || [],
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / queryParams.limit)
      },
      filters: {
        category: queryParams.category,
        featured: queryParams.featured,
        search: queryParams.search,
        active_only: queryParams.active_only
      }
    };

    return NextResponse.json(apiResponse.success(response, 'Projects retrieved successfully'));

  } catch (error) {
    const errorResponse = middleware.handleError(error, 'GET /api/admin/projects (Supabase)');
    return NextResponse.json(errorResponse, { status: errorResponse.status || 500 });
  }
}

// POST: Create new project directly in Supabase
export async function POST(request) {
  try {
    // Authenticate request
    const authResult = await middleware.validateAuthToken(request);
    if (!authResult.valid) {
      return NextResponse.json(apiResponse.error(authResult.error, 401), { status: 401 });
    }

    const body = await request.json();

    // Validate input data
    const validationResult = validator.validateProject(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiResponse.validationError(validationResult.error.errors),
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check featured project limits if needed
    if (validatedData.is_featured) {
      const { count: featuredCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);

      if (featuredCount >= 6) {
        return NextResponse.json(
          apiResponse.error('Maximum featured projects limit reached (6)', 400),
          { status: 400 }
        );
      }
    }

    // Insert into Supabase
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([{
        ...validatedData,
        created_by: authResult.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        apiResponse.error('Failed to create project', 500),
        { status: 500 }
      );
    }

    // Log activity
    await middleware.logActivity(authResult.userId, 'project_created', {
      projectId: newProject.id,
      title: validatedData.title,
      category: validatedData.category
    });

    return NextResponse.json(
      apiResponse.success(newProject, 'Project created successfully'),
      { status: 201 }
    );

  } catch (error) {
    const errorResponse = middleware.handleError(error, 'POST /api/admin/projects (Supabase)');
    return NextResponse.json(errorResponse, { status: errorResponse.status || 500 });
  }
}