import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch dashboard analytics and statistics
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-analytics-get-${clientIP}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get contact submissions statistics
    const { data: contactStats } = await supabase
      .from('contact_submissions')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString());

    // Get projects statistics
    const { data: projectStats } = await supabase
      .from('projects')
      .select('is_published, category, created_at')
      .gte('created_at', startDate.toISOString());

    // Get media files statistics
    const { data: mediaStats } = await supabase
      .from('media_files')
      .select('category, file_size, created_at')
      .gte('created_at', startDate.toISOString());

    // Get activity logs for recent activity
    const { data: recentActivity } = await supabase
      .from('activity_logs')
      .select('action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    // Process contact submissions by status
    const contactByStatus = contactStats?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process contact submissions by date
    const contactByDate = contactStats?.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process projects by category
    const projectsByCategory = projectStats?.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process projects by publication status
    const projectsByStatus = projectStats?.reduce((acc, item) => {
      const status = item.is_published ? 'published' : 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Calculate total storage used
    const totalStorageUsed = mediaStats?.reduce((acc, item) => {
      return acc + (item.file_size || 0);
    }, 0) || 0;

    // Media files by category
    const mediaByCategory = mediaStats?.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get total counts (all time)
    const [
      totalContacts,
      totalProjects,
      totalMedia,
      totalHeroSections
    ] = await Promise.all([
      supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }),
      supabase.from('hero_sections').select('id', { count: 'exact', head: true })
    ]);

    const analytics = {
      period: parseInt(period),
      totalCounts: {
        contacts: totalContacts.count || 0,
        projects: totalProjects.count || 0,
        mediaFiles: totalMedia.count || 0,
        heroSections: totalHeroSections.count || 0
      },
      contactSubmissions: {
        byStatus: contactByStatus,
        byDate: contactByDate,
        total: contactStats?.length || 0
      },
      projects: {
        byCategory: projectsByCategory,
        byStatus: projectsByStatus,
        total: projectStats?.length || 0
      },
      media: {
        byCategory: mediaByCategory,
        totalStorageUsed,
        totalFiles: mediaStats?.length || 0
      },
      recentActivity: recentActivity || []
    };

    return createResponse(analytics);

  } catch (error) {
    return handleError(error, 'Failed to fetch analytics');
  }
}

// POST - Record analytics consent
export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-analytics-post-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { consent_given, user_agent, referrer } = body;

    const { data, error } = await supabase
      .from('analytics_consent')
      .insert([{
        consent_given: consent_given || false,
        ip_address: clientIP,
        user_agent: user_agent || request.headers.get('user-agent') || '',
        referrer: referrer || request.headers.get('referer') || ''
      }])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to record analytics consent');
    }

    return createResponse({
      message: 'Analytics consent recorded',
      consent: data
    }, 201);

  } catch (error) {
    return handleError(error, 'Failed to record analytics consent');
  }
}