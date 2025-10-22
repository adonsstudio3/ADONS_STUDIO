import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { handleError } from '@/lib/api-security';
import { applyRateLimit } from '@/lib/hybrid-rate-limiting';
import { validateFileMagicNumber, getFileTypeName } from '@/lib/file-validation';

const supabase = supabaseAdmin;

// POST - Upload file to Supabase Storage
export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚀 Upload API endpoint hit');
    }

    // Apply rate limiting (Redis-based)
    const rateLimitResult = await applyRateLimit(request, 'upload');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many upload requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'project-assets';
    const folder = formData.get('folder') || 'thumbnails';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (MIME check)
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

    // Convert File to ArrayBuffer for magic number validation
    const arrayBuffer = await file.arrayBuffer();

    // 🔒 SECURITY: Validate file using magic number (file signature)
    // This prevents malicious files disguised as images
    const validationResult = validateFileMagicNumber(arrayBuffer, file.type);
    if (!validationResult.valid) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('🚫 File validation failed:', validationResult);
      }
      return NextResponse.json({ 
        error: validationResult.reason,
        detectedType: validationResult.detectedType ? getFileTypeName(validationResult.detectedType) : 'Unknown'
      }, { status: 400 });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ File signature validated:', validationResult.detectedType);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

    // Convert to buffer for upload (reuse arrayBuffer from validation)
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Storage upload error:', error.message);
      }
      
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ File uploaded successfully');
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        validatedType: validationResult.detectedType
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Upload error:', error);
    }
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
