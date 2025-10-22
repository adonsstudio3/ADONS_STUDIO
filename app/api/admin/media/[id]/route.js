import { NextResponse } from 'next/server';
import { rateLimit, handleError, createResponse } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!rateLimit(`media-put-${clientIP}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    console.log('📝 Media PUT request:', { id, body });

    const { filename, alt_text, category, file_type } = body;

    // Update media file record
    const { data, error } = await supabase
      .from('media_files')
      .update({
        filename: filename?.trim(),
        alt_text: alt_text?.trim() || null,
        category: category?.trim() || 'general',
        file_type: file_type?.trim() || 'image',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Media update error:', error);
      return handleError(error, 'Failed to update media file');
    }

    console.log('✅ Media updated successfully:', data);

    // Log activity (non-blocking)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'media_updated',
          details: { 
            media_id: id,
            filename: data.filename
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      console.warn('⚠️ Failed to log activity (non-critical):', logError.message);
    }

    return createResponse({
      message: 'Media file updated successfully',
      data
    });

  } catch (error) {
    console.error('💥 Media update error:', error);
    return handleError(error, 'Failed to update media file');
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!rateLimit(`media-delete-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    console.log('🗑️ Media DELETE request:', { id });

    // Get media details before deletion (for cleanup and logging)
    const { data: mediaFile, error: fetchError } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Media fetch error:', fetchError);
      return handleError(fetchError, 'Media file not found');
    }

    console.log('📋 Found media to delete:', mediaFile);

    // Delete the file from Supabase Storage
    if (mediaFile.file_url) {
      try {
        // Extract bucket and path from URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        const urlParts = mediaFile.file_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const filePath = pathParts.join('/');
          
          console.log('🗑️ Deleting from storage:', { bucket, filePath });
          
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

          if (storageError) {
            console.warn('⚠️ Storage deletion failed (non-critical):', storageError);
          } else {
            console.log('✅ File deleted from storage');
          }
        }
      } catch (storageErr) {
        console.warn('⚠️ Could not delete file from storage:', storageErr);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Database deletion error:', deleteError);
      return handleError(deleteError, 'Failed to delete media file');
    }

    console.log('✅ Media deleted from database');

    // Log activity (non-blocking)
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'media_deleted',
          details: { 
            media_id: id,
            filename: mediaFile.filename,
            file_url: mediaFile.file_url
          },
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || ''
        }]);
    } catch (logError) {
      console.warn('⚠️ Failed to log activity (non-critical):', logError.message);
    }

    return createResponse({
      message: 'Media file deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('💥 Media delete error:', error);
    return handleError(error, 'Failed to delete media file');
  }
}