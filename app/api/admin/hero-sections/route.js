import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest, handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { supabaseAdmin } from '@/lib/supabase';

// Use admin client for server-side operations (bypasses RLS)
const supabase = supabaseAdmin;

const heroSectionSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  subtitle: z.string().max(300).trim().optional(),
  description: z.string().optional(),
  background_type: z.enum(['image', 'video', 'gradient']),
  background_value: z.string().min(1), // Allow any string, not just URLs
  overlay_opacity: z.number().min(0).max(1).optional(),
  text_color: z.string().optional(),
  text_alignment: z.enum(['left', 'center', 'right']).optional(),
  cta_primary_text: z.string().max(50).optional(),
  cta_primary_link: z.string().optional(),
  cta_secondary_text: z.string().max(50).optional(),
  cta_secondary_link: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  order_index: z.number().int().min(0).max(100).optional()
});

export async function GET(request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      return handleError(error, 'Failed to fetch hero sections');
    }

    return createResponse({ hero_sections: data });
  } catch (error) {
    return handleError(error, 'Failed to fetch hero sections');
  }
}

export async function POST(request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();
    console.log('📝 Hero section POST request body:', body);
    console.log('📝 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const validation = validateRequest(heroSectionSchema, body);

    if (!validation.success) {
      console.error('❌ Hero section validation failed:', validation.error);
      console.log('❌ Schema expected fields:', Object.keys(heroSectionSchema.shape));
      console.log('❌ Received fields:', Object.keys(body));
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }
    
    console.log('✅ Hero section validation passed:', validation.data);

    const { data, error } = await supabase
      .from('hero_sections')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create hero section');
    }

    return createResponse(data, 201);
  } catch (error) {
    console.error('💥 Hero section creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return handleError(error, 'Failed to create hero section');
  }
}

export async function PUT(request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero section ID is required' }, { status: 400 });
    }

    const validation = validateRequest(heroSectionSchema.partial(), updateData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('hero_sections')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update hero section');
    }

    return createResponse(data);
  } catch (error) {
    return handleError(error, 'Failed to update hero section');
  }
}

export async function DELETE(request) {
  try {
    // Apply Redis-based rate limiting
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hero section ID is required' }, { status: 400 });
    }

    // Get hero section details before deletion
    const { data: heroSection } = await supabase
      .from('hero_sections')
      .select('title')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('hero_sections')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete hero section');
    }

    // Log the action (non-blocking - don't fail if logging fails)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'delete',
          entity_type: 'hero_sections',
          entity_id: id,
          details: { 
            title: heroSection?.title
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      // Failed to log activity (non-critical)
    }

    return createResponse({ message: 'Hero section deleted successfully' });
  } catch (error) {
    return handleError(error, 'Failed to delete hero section');
  }
}