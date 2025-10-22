import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// GET - Fetch email templates
export async function GET(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-email-templates-get-${clientIP}`, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const isActive = url.searchParams.get('active');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (name) query = query.eq('name', name);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');

    // Get total count
    const { count } = await supabase
      .from('email_templates')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch email templates');
    }

    return createResponse({
      templates: data,
      total: count || 0,
      offset,
      limit
    });

  } catch (error) {
    return handleError(error, 'Failed to fetch email templates');
  }
}

// POST - Create new email template
export async function POST(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-email-templates-post-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const {
      name,
      subject,
      html_content,
      text_content,
      variables = [],
      is_active = true
    } = body;

    // Validation
    if (!name || !subject || !html_content) {
      return NextResponse.json({ 
        error: 'Name, subject, and HTML content are required' 
      }, { status: 400 });
    }

    // Check if template name already exists
    const { data: existingTemplate } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        name: name.trim(),
        subject: subject.trim(),
        html_content: html_content.trim(),
        text_content: text_content?.trim() || null,
        variables: Array.isArray(variables) ? variables : [],
        is_active
      }])
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to create email template');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'email_template_created',
        details: { 
          template_id: data.id,
          name: data.name
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Email template created successfully',
      template: data
    }, 201);

  } catch (error) {
    return handleError(error, 'Failed to create email template');
  }
}

// PUT - Update existing email template
export async function PUT(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-email-templates-put-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

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

    const { data, error } = await supabase
      .from('email_templates')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'Failed to update email template');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'email_template_updated',
        details: { 
          template_id: id,
          updated_fields: Object.keys(cleanedData),
          name: data.name
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Email template updated successfully',
      template: data
    });

  } catch (error) {
    return handleError(error, 'Failed to update email template');
  }
}

// DELETE - Delete email template
export async function DELETE(request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-email-templates-delete-${clientIP}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get template details before deletion
    const { data: template } = await supabase
      .from('email_templates')
      .select('name, subject')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'Failed to delete email template');
    }

    // Log the action
    await supabase
      .from('activity_logs')
      .insert([{
        action: 'email_template_deleted',
        details: { 
          template_id: id,
          deleted_template: template
        },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      }]);

    return createResponse({
      message: 'Email template deleted successfully'
    });

  } catch (error) {
    return handleError(error, 'Failed to delete email template');
  }
}