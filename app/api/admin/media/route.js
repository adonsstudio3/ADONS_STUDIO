import { NextResponse } from 'next/server';
import { handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { supabaseAdmin } from '@/lib/supabase';

// Use admin client for server-side operations (bypasses RLS)
const supabase = supabaseAdmin;

export async function GET(request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'admin');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);

    let query = supabase
      .from('media_files')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'Failed to fetch media');
    }

    return createResponse({ media: data });
  } catch (error) {
    return handleError(error, 'Failed to fetch media');
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
    // Diagnostic: log incoming content-type to help debug multipart issues
    const incomingContentType = request.headers.get('content-type') || '(none)';
    console.log('📥 /api/admin/media POST incoming Content-Type:', incomingContentType);

    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error('Failed to parse formData:', err);
      return NextResponse.json({ error: 'Invalid form data. Ensure request is multipart/form-data' }, { status: 400 });
    }

    const file = formData.get('file');
  const category = (formData.get('category') || 'general').toString();
  const alt_text = (formData.get('alt_text') || '').toString();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    // Diagnostic: log file info
    try {
      console.log('📤 Received file:', { name: file.name, type: file.type, size: file.size, category });
    } catch (e) {
      console.warn('Could not read file metadata', e);
    }

    if (!allowedTypes.includes((file.type || '').toString())) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (Number(file.size) > maxSize) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Determine target bucket based on category
    const bucketMap = {
      'hero': 'hero-media',
      'hero-backgrounds': 'hero-media',
      'projects': 'project-media',
      'showreel': 'showreel-media',
      'general': 'general-uploads',
      'assets': 'general-uploads'
    };

    const bucketName = bucketMap[category] || 'general-uploads';

    // Generate unique filename and storage path
    const timestamp = Date.now();
    const extension = (file.name || 'upload').toString().split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `${category}/${filename}`;

    // Upload to Supabase Storage (use mapped bucket)
    let uploadData, uploadError;
    try {
      const result = await supabase.storage.from(bucketName).upload(filePath, file);
      uploadData = result.data;
      uploadError = result.error;
    } catch (err) {
      console.error('Supabase storage upload exception:', err);
      return handleError(err, `Failed to upload file to bucket ${bucketName}`);
    }

    if (uploadError) {
      console.error('Supabase upload error:', uploadError, { bucketName, filePath });
      return handleError(uploadError, 'Failed to upload file');
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl || null;

    // Save metadata to database
    const { data: mediaData, error: dbError } = await supabase
      .from('media_files')
      .insert([{
        filename: filename,
        original_filename: file.name,
        file_url: publicUrl,
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        file_size: file.size,
        mime_type: file.type,
        category,
        alt_text,
        storage_path: filePath,
        storage_bucket: bucketName,
        is_active: true
      }])
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(bucketName).remove([filePath]);
      return handleError(dbError, 'Failed to save media metadata');
    }

    // Normalize response for frontend (frontend expects `url`)
    const responsePayload = {
      id: mediaData.id,
      url: mediaData.file_url,
      original_filename: mediaData.original_filename,
      file_type: mediaData.file_type,
      file_size: mediaData.file_size,
      category: mediaData.category,
      alt_text: mediaData.alt_text,
      storage_path: mediaData.storage_path,
      created_at: mediaData.created_at
    };

    return createResponse(responsePayload, 201);
  } catch (error) {
    // Log full error details for debugging
    console.error('MEDIA UPLOAD ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error
    });
    // Return full error details in response (for debugging only)
    return NextResponse.json({
      error: 'Failed to upload media',
      details: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Get media info before deletion
    const { data: mediaData, error: fetchError } = await supabase
      .from('media_files')
      .select('id, storage_path, storage_bucket, category')
      .eq('id', id)
      .single();

    if (fetchError) {
      return handleError(fetchError, 'Failed to fetch media');
    }

    // Use the stored bucket name from the database
    const bucketName = mediaData.storage_bucket || 'general-uploads';

    // Delete from storage
    if (mediaData.storage_path) {
      await supabase.storage
        .from(bucketName)
        .remove([mediaData.storage_path]);
    }

    // Delete from database (media_files)
    const { error: deleteError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return handleError(deleteError, 'Failed to delete media');
    }

    // Log the action (non-blocking - don't fail if logging fails)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'delete',
          entity_type: 'media_files',
          entity_id: id,
          details: { 
            file_name: mediaData?.file_name,
            bucket: bucketName
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      // Failed to log activity (non-critical)
    }

    return createResponse({ message: 'Media deleted successfully' });
  } catch (error) {
    return handleError(error, 'Failed to delete media');
  }
}