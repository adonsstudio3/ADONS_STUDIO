import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('🚀 Setting up Supabase storage buckets...\n');

const buckets = [
  {
    name: 'hero-media',
    config: {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
    },
    description: 'Hero section backgrounds (images and videos)'
  },
  {
    name: 'project-media',
    config: {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    },
    description: 'Project thumbnails and media'
  },
  {
    name: 'showreel-media',
    config: {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    description: 'Showreel thumbnails'
  },
  {
    name: 'general-uploads',
    config: {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    },
    description: 'General file uploads'
  },
  {
    name: 'avatars',
    config: {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    description: 'User avatar images'
  }
];

async function createStorageBuckets() {
  console.log('📁 Creating storage buckets...\n');

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}`);
      console.log(`  Description: ${bucket.description}`);
      console.log(`  Public: ${bucket.config.public}`);
      console.log(`  Size limit: ${(bucket.config.fileSizeLimit / 1048576).toFixed(0)}MB`);

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.config);

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  Bucket ${bucket.name} already exists`);
        } else {
          console.error(`  ❌ Error creating ${bucket.name}:`, error.message);
          continue;
        }
      } else {
        console.log(`  ✅ Bucket ${bucket.name} created successfully`);
      }

      // List files to verify bucket exists
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 1 });

      if (listError) {
        console.log(`  ⚠️  Could not verify bucket ${bucket.name}:`, listError.message);
      } else {
        console.log(`  ✅ Bucket ${bucket.name} is accessible`);
      }

      console.log('');
    } catch (err) {
      console.error(`  ❌ Unexpected error with ${bucket.name}:`, err.message);
      console.log('');
    }
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying database tables...\n');

  const tables = [
    'admin_users',
    'media_files', 
    'hero_sections',
    'projects',
    'showreels',
    'contact_submissions',
    'activity_logs',
    'email_templates'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`  ❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ Table ${table}: OK`);
      }
    } catch (err) {
      console.log(`  ❌ Table ${table}: ${err.message}`);
    }
  }
  console.log('');
}

async function testDashboardStats() {
  console.log('📊 Testing dashboard statistics...\n');

  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) {
      console.log('  ❌ Dashboard stats function:', error.message);
    } else {
      console.log('  ✅ Dashboard stats:', data);
    }
  } catch (err) {
    console.log('  ❌ Dashboard stats error:', err.message);
  }
  console.log('');
}

async function main() {
  try {
    console.log(`🔗 Connecting to: ${SUPABASE_URL}`);
    console.log(`🔑 Service key: ${SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}\n`);

    await createStorageBuckets();
    await verifyDatabase();
    await testDashboardStats();

    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run the SQL scripts in your Supabase SQL editor');
    console.log('2. Test your admin panel upload/delete functionality');
    console.log('3. Configure email service for contact form notifications');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();