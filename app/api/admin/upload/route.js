import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, handleError } from '@/lib/api-security';

const supabase = supabaseAdmin;

// POST - Upload file to Supabase Storage
export async function POST(request) {
  try {
    console.log('🚀 Upload API endpoint hit');
    
    // Debug environment variables
    console.log('🔍 Environment check in upload API:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAdminExists: !!supabase
    });

    // Debug authentication headers
    console.log('🔐 Request headers:', {
      authorization: request.headers.get('authorization') ? 'Bearer token present' : 'No auth header',
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent')
    });

    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`admin-upload-${clientIP}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    console.log('📋 Parsing FormData...');
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'project-assets'; // Default bucket
    const folder = formData.get('folder') || 'thumbnails'; // Default folder

    console.log('📁 FormData parsed:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      bucket,
      folder
    });

    if (!file) {
      console.error('❌ No file provided in FormData');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

    console.log('📤 Uploading file to:', bucket, fileName);

    // Convert File to ArrayBuffer for Supabase
    console.log('🔄 Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    console.log('✅ Buffer created, size:', buffer.length);

    // Upload to Supabase Storage
    console.log('⬆️ Starting Supabase storage upload...');
    console.log('🔧 Upload parameters:', {
      bucket,
      fileName,
      bufferSize: buffer.length,
      contentType: file.type
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    console.log('📊 Storage upload result:', { 
      data, 
      error,
      bucket,
      path: data?.path 
    });

    if (error) {
      console.error('❌ Storage upload error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        details: error
      });
      
      // More specific error messages
      if (error.statusCode === 409) {
        return NextResponse.json({ 
          error: 'File already exists. Please rename your file or try again.' 
        }, { status: 409 });
      }
      
      if (error.statusCode === 413) {
        return NextResponse.json({ 
          error: 'File too large for storage bucket.' 
        }, { status: 413 });
      }
      
      return handleError(error, `Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;
    
    if (!publicUrl) {
      return NextResponse.json({ 
        error: 'Failed to get public URL' 
      }, { status: 500 });
    }

    console.log('✅ File uploaded successfully:', publicUrl);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return handleError(error, 'File upload failed');
  }
}

// DELETE - Remove file from storage
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const bucket = searchParams.get('bucket') || 'project-assets';

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      return handleError(error, 'Failed to delete file');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return handleError(error, 'File deletion failed');
  }
}