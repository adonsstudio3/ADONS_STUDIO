import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables. Please ensure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

(async () => {
  try {
    console.log('Using Supabase URL:', SUPABASE_URL);
    console.log('Service role key: ' + (SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'));

    const expectedBuckets = ['project-media', 'hero-media', 'showreel-media', 'general-uploads'];

    console.log('\nListing storage buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error listing buckets:', error.message || error);
      process.exit(3);
    }

    const bucketNames = (buckets || []).map(b => b.name);
    console.log('Buckets found:', bucketNames.join(', ') || '(none)');

    console.log('\nExpected buckets check:');
    for (const b of expectedBuckets) {
      console.log(` - ${b}: ${bucketNames.includes(b) ? '✅ exists' : '❌ missing'}`);
    }

    // Try to get public URL of a sample object (non-fatal)
    for (const b of expectedBuckets) {
      if (!bucketNames.includes(b)) continue;
      try {
        const { data: bucketInfo } = await supabase.storage.getBucket(b);
        console.log(`\nBucket: ${b}`);
        console.log('  public:', bucketInfo?.public ?? 'unknown');
        console.log('  created_at:', bucketInfo?.created_at ?? 'unknown');
      } catch (e) {
        // ignore
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exit(4);
  }
})();
