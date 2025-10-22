import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { handleError } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';

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
    const { action, entity_type, entity_id, details, admin_id } = body;

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Validate required fields
    if (!action || !entity_type) {
      return NextResponse.json({ 
        message: 'Missing required fields: action, entity_type' 
      }, { status: 400 });
    }

    console.log('📋 Logging activity:', { action, entity_type, entity_id, details });

    // Insert activity record into database
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert([{
        action,
        resource_type: entity_type,
        resource_id: entity_id,
        resource_title: details?.title || null,
        details: details || {},
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Activity logging database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to save activity log',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Activity logged successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      id: data.id
    });

  } catch (error) {
    console.error('Activity logging API error:', error);
    return NextResponse.json(
      { message: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`activity-get-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50);

    console.log('📋 Fetching recent activities, limit:', limit);

    // Fetch recent activity logs
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Activity fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch activities',
        details: error.message
      }, { status: 500 });
    }

    // Format activities for display
    const formattedActivities = data.map(activity => ({
      id: activity.id,
      action: activity.action,
      entity_type: activity.resource_type,
      entity_id: activity.resource_id,
      details: activity.details || {},
      timestamp: activity.created_at,
      admin_id: activity.admin_id,
      // Generate display text based on action and entity
      title: formatActivityTitle(activity.action, activity.resource_type, activity.details),
      icon: getActivityIcon(activity.action)
    }));

    console.log('✅ Found activities:', formattedActivities.length);

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      count: formattedActivities.length
    });

  } catch (error) {
    console.error('Activity fetch API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatActivityTitle(action, entityType, details) {
  const entityLabels = {
    'showreels': 'showreel',
    'hero_sections': 'hero section',
    'projects': 'project',
    'media_files': 'media file'
  };
  
  const entity = entityLabels[entityType] || entityType;
  const actionLabels = {
    'create': 'created',
    'update': 'updated',
    'delete': 'deleted',
    'upload': 'uploaded'
  };
  
  const actionText = actionLabels[action] || action;
  return `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${entity}`;
}

function getActivityIcon(action) {
  const iconMap = {
    'create': 'PlusIcon',
    'update': 'PencilIcon',
    'delete': 'TrashIcon',
    'upload': 'ArrowUpTrayIcon',
    'login': 'KeyIcon',
    'view': 'EyeIcon'
  };
  
  return iconMap[action] || 'EyeIcon';
}