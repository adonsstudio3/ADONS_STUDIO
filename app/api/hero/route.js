import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch active hero sections for public display
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`hero-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    let query = supabase
      .from('hero_sections')
      .select(`
        id,
        page,
        title,
        subtitle,
        description,
        background_image_url,
        background_video_url,
        cta_text,
        cta_url,
        order_index
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    // Filter by page if specified
    if (page) {
      query = query.eq('page', page);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch hero sections');
    }

    // If requesting a specific page, return just that page's hero sections
    if (page) {
      return createResponse({
        heroSections: data,
        page
      });
    }

    // Group by page for general request
    const groupedHero = data.reduce((acc, hero) => {
      if (!acc[hero.page]) {
        acc[hero.page] = [];
      }
      acc[hero.page].push(hero);
      return acc;
    }, {});

    return createResponse({
      heroSections: groupedHero,
      pages: Object.keys(groupedHero)
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch hero sections');
  }
}