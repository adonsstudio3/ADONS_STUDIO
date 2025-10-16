import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch activity logs
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-logs-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (action) query = query.eq('action', action);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    // Get total count
    const { count } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch activity logs');
    }

    // Get unique actions for filtering
    const { data: actions } = await supabase
      .from('activity_logs')
      .select('action')
      .then(result => {
        if (result.error) return { data: [] };
        const uniqueActions = [...new Set(result.data.map(log => log.action))];
        return { data: uniqueActions };
      });

    return createResponse({
      logs: data,
      total: count || 0,
      offset,
      limit,
      availableActions: actions || []
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch activity logs');
  }
}

// DELETE - Clear old activity logs (admin only)
export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-logs-delete-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('older_than_days')) || 90;

    if (days < 7) {
      return NextResponse.json({ 
        error: 'Cannot delete logs newer than 7 days' 
      }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Count logs to be deleted
    const { count } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffDate.toISOString());

    // Delete old logs
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      return handleError(error, 'Failed to delete activity logs');
    }

    // Log this cleanup action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'logs_cleanup',
        details: { 
          deleted_count: count,
          older_than_days: days,
          cutoff_date: cutoffDate.toISOString()
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: `Successfully deleted ${count} activity logs older than ${days} days`,
      deletedCount: count
    });

  } catch (error) {
    return handleError(error, 'Failed to delete activity logs');
  }
}