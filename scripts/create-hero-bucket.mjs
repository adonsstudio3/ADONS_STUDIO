import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function createHeroMediaBucket() {
  console.log('Creating hero-media bucket with 50MB limit...');
  
  const { data, error } = await supabase.storage.createBucket('hero-media', {
    public: true,
    fileSizeLimit: 52428800, // 50MB instead of 100MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ hero-media bucket already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } else {
    console.log('✅ hero-media bucket created successfully');
  }
}

createHeroMediaBucket();