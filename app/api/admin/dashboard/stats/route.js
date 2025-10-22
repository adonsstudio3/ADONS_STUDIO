import { NextResponse } from 'next/server';
import { handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { supabaseAdmin } from '@/lib/supabase';

// Use admin client for server-side operations (bypasses RLS)
const supabase = supabaseAdmin;

// Check if Supabase admin client is available
if (!supabase) {
  // Missing config, will fail in GET
}

export async function GET(request) {
  try {
    // Check if Supabase admin client is available
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase configuration error - admin client not available',
        details: 'Check SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 });
    }

    // Apply rate limiting first
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Get stats from all tables with error handling
    const [
      projectsResult,
      heroSectionsResult,
      showreelsResult,
      mediaFilesResult,
      contactResult,
      analyticsResult
    ] = await Promise.all([
      supabase.from('projects').select('id, created_at', { count: 'exact' }).then(r => r),
      supabase.from('hero_sections').select('id, created_at', { count: 'exact' }).then(r => r),
      supabase.from('showreels').select('id, created_at', { count: 'exact' }).then(r => r),
      supabase.from('media_files').select('id, created_at', { count: 'exact' }).then(r => r),
      supabase.from('contact_submissions').select('id, created_at', { count: 'exact' }).then(r => r),
      supabase.from('analytics_consent').select('id, consent_date', { count: 'exact' }).then(r => r)
    ]);

    // Check for errors
    if (projectsResult.error) throw projectsResult.error;
    if (heroSectionsResult.error) throw heroSectionsResult.error;
    if (showreelsResult.error) throw showreelsResult.error;
    if (mediaFilesResult.error) throw mediaFilesResult.error;
    if (contactResult.error) throw contactResult.error;
    if (analyticsResult.error) throw analyticsResult.error;

    // Calculate recent activity (items created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProjects = projectsResult.data?.filter(item => 
      new Date(item.created_at) > sevenDaysAgo
    ).length || 0;

    const recentContact = contactResult.data?.filter(item => 
      new Date(item.submitted_at) > sevenDaysAgo
    ).length || 0;

    // Compile stats
    const stats = {
      projects: {
        total: projectsResult.count || 0,
        recent: recentProjects,
        label: 'Projects',
        icon: 'FilmIcon'
      },
      hero_sections: {
        total: heroSectionsResult.count || 0,
        recent: heroSectionsResult.data?.filter(item => 
          new Date(item.created_at) > sevenDaysAgo
        ).length || 0,
        label: 'Hero Sections',
        icon: 'PlayCircleIcon'
      },
      showreels: {
        total: showreelsResult.count || 0,
        recent: showreelsResult.data?.filter(item => 
          new Date(item.created_at) > sevenDaysAgo
        ).length || 0,
        label: 'Showreels',
        icon: 'FolderIcon'
      },
      media_files: {
        total: mediaFilesResult.count || 0,
        recent: mediaFilesResult.data?.filter(item => 
          new Date(item.created_at) > sevenDaysAgo
        ).length || 0,
        label: 'Media Files',
        icon: 'PhotoIcon'
      },
      contact_submissions: {
        total: contactResult.count || 0,
        recent: recentContact,
        label: 'Contact Submissions',
        icon: 'EyeIcon'
      },
      analytics_consent: {
        total: analyticsResult.count || 0,
        recent: analyticsResult.data?.filter(item => 
          new Date(item.consent_date) > sevenDaysAgo
        ).length || 0,
        label: 'Analytics Consent',
        icon: 'KeyIcon'
      }
    };

    // Fetch real activity logs instead of generating fake ones (with error handling)
    let activityResult;
    try {
      activityResult = await supabase
        .from('activity_logs')
        .select('id, action, resource_type, resource_id, details, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    } catch (err) {
      activityResult = { error: err, data: null };
    }

    let recentActivity = [];
    
    if (activityResult.error) {
      // Fallback to generating basic activity from recent items
      const recentProjectItems = projectsResult.data
        ?.filter(item => new Date(item.created_at) > sevenDaysAgo)
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          entity_type: 'projects',
          action: 'create',
          title: 'New project added',
          created_at: item.created_at,
          icon: 'FilmIcon'
        })) || [];

      const recentContactItems = contactResult.data
        ?.filter(item => new Date(item.created_at) > sevenDaysAgo)
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          entity_type: 'contact_submissions',
          action: 'create',
          title: 'New contact submission',
          created_at: item.created_at,
          icon: 'EyeIcon'
        })) || [];

      recentActivity = [...recentProjectItems, ...recentContactItems];
      recentActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Format real activity logs - use entity_type (not resource_type) since that's what frontend logs
      recentActivity = activityResult.data.map(activity => ({
        id: activity.id,
        entity_type: activity.entity_type,
        action: activity.action,
        title: formatActivityTitle(activity.action, activity.entity_type, activity.details),
        created_at: activity.created_at,
        icon: getActivityIcon(activity.action),
        details: activity.details
      }));
    }

    return createResponse({
      stats,
      recent_activity: recentActivity.slice(0, 10), // Top 10 recent activities
      success: true
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load dashboard statistics',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}

// Helper functions for activity formatting
function formatActivityTitle(action, entityType, details) {
  const entityLabels = {
    'showreels': 'showreel',
    'showreel': 'showreel',
    'hero_sections': 'hero section',
    'hero_section': 'hero section',
    'projects': 'project',
    'project': 'project',
    'media_files': 'media file',
    'media_file': 'media file',
    'contact_submissions': 'contact',
    'contact': 'contact'
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