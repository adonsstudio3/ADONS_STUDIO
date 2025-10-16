import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch contact submissions with advanced filtering
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-contact-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    
    if (search) {
      // Search in name, email, company, and message
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,message.ilike.%${search}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('contact_submissions')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch contact submissions');
    }

    // Get status counts for dashboard
    const { data: statusCounts } = await supabase
      .from('contact_submissions')
      .select('status')
      .then(result => {
        if (result.error) return { data: [] };
        const counts = result.data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
        return { data: counts };
      });

    return createResponse({
      submissions: data,
      total: count || 0,
      offset,
      limit,
      statusCounts: statusCounts || {}
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch contact submissions');
  }
}

// PUT - Update contact submission status and add notes
export async function PUT(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-contact-put-${clientIP}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (status && !['new', 'read', 'replied', 'resolved', 'spam'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    
    // Add timestamp for status change
    if (status) {
      updateData.last_updated = new Date().toISOString();
      if (status === 'read' || status === 'replied' || status === 'resolved') {
        updateData.responded_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update contact submission');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'contact_submission_updated',
        details: { 
          submission_id: id, 
          updated_fields: Object.keys(updateData),
          new_status: status 
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Contact submission updated successfully',
      submission: data
    });

  } catch (error) {
    return handleError(error, 'Failed to update contact submission');
  }
}

// DELETE - Delete contact submission (admin only)
export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-contact-delete-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Get submission details before deletion for logging
    const { data: submission } = await supabase
      .from('contact_submissions')
      .select('name, email, created_at')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete contact submission');
    }

    // Log the deletion
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'contact_submission_deleted',
        details: { 
          submission_id: id,
          deleted_submission: submission
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    return handleError(error, 'Failed to delete contact submission');
  }
}