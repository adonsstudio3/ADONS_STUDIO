import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = supabaseAdmin;

// Test endpoint for upload without authentication
export async function POST(request) {
  try {
    console.log('🧪 Test upload endpoint hit');
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Test 1: Check if we can connect to Supabase
    console.log('🔍 Testing Supabase connection...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('📦 Available buckets:', buckets?.map(b => b.name));
    
    if (bucketsError) {
      console.error('❌ Buckets list error:', bucketsError);
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: bucketsError.message 
      }, { status: 500 });
    }

    // Test 2: Try uploading to project-assets bucket
    const fileName = `test/${Date.now()}-test.${file.name.split('.').pop()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('📤 Testing upload to project-assets bucket...');
    const { data, error } = await supabase.storage
      .from('project-assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: error.message 
      }, { status: 500 });
    }

    // Test 3: Get public URL
    const { data: urlData } = supabase.storage
      .from('project-assets')
      .getPublicUrl(fileName);

    console.log('✅ Upload successful:', urlData?.publicUrl);

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      data: {
        url: urlData?.publicUrl,
        fileName: fileName,
        buckets: buckets?.map(b => b.name)
      }
    });

  } catch (error) {
    console.error('🚨 Test upload error:', error);
    return NextResponse.json({ 
      error: 'Test upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}