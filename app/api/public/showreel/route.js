import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

export async function GET() {
  try {
    // Select only the columns we need to keep the payload tiny
    const { data, error } = await supabase
      .from('showreels')
      .select('id,title,video_url,thumbnail_url,is_featured,created_at')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Public showreel fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch showreel' }, { status: 500 });
    }

    return NextResponse.json({ showreel: data || null });
  } catch (err) {
    console.error('Unexpected error in public/showreel:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
