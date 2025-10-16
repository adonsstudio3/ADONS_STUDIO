import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    console.log('🔍 Checking storage buckets...');
    
    // List all storage buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to list storage buckets',
        details: bucketsError 
      });
    }
    
    console.log('📦 Available buckets:', buckets?.map(b => b.name) || []);
    
    // Check if hero-media bucket exists
    const heroMediaBucket = buckets?.find(b => b.name === 'hero-media');
    
    // Test upload to hero-media bucket (if it exists)
    let uploadTest = null;
    if (heroMediaBucket) {
      try {
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('hero-media')
          .upload(`test/test-${Date.now()}.txt`, testFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          uploadTest = { success: false, error: uploadError.message };
        } else {
          uploadTest = { success: true, path: uploadData.path };
          // Clean up test file
          await supabaseAdmin.storage.from('hero-media').remove([uploadData.path]);
        }
      } catch (e) {
        uploadTest = { success: false, error: e.message };
      }
    }
    
    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
      heroMediaExists: !!heroMediaBucket,
      uploadTest,
      requiredBuckets: ['hero-media', 'project-media', 'showreel-media', 'general-uploads']
    });
    
  } catch (error) {
    console.error('💥 Storage check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}