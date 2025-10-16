/**
 * Supabase Integration Health Check and Optimization Tool
 * Validates and optimizes the connection to Supabase backend
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

class SupabaseHealthChecker {
  constructor() {
    this.client = null;
    this.serviceClient = null;
    this.healthStatus = {
      connection: false,
      authentication: false,
      tables: false,
      storage: false,
      realtime: false,
      performance: 'unknown'
    };
  }

  // Initialize Supabase clients
  async initialize() {
    try {
      // Regular client (with anon key)
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Service client (with service role key for admin operations)
      this.serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      console.log('✅ Supabase clients initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase clients:', error.message);
      return false;
    }
  }

  // Test basic connection
  async testConnection() {
    try {
      const startTime = Date.now();
      
      // Simple query to test connection
      const { data, error } = await this.client
        .from('projects')  // Assuming projects table exists
        .select('count', { count: 'exact', head: true });
      
      const responseTime = Date.now() - startTime;
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (acceptable for this test)
        throw error;
      }
      
      this.healthStatus.connection = true;
      this.healthStatus.performance = responseTime < 500 ? 'excellent' : 
                                    responseTime < 1000 ? 'good' : 
                                    responseTime < 2000 ? 'fair' : 'poor';
      
      console.log(`✅ Connection test passed (${responseTime}ms)`);
      return { success: true, responseTime };
    } catch (error) {
      this.healthStatus.connection = false;
      console.error('❌ Connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test authentication
  async testAuthentication() {
    try {
      // Test anonymous authentication
      const { data: anonData, error: anonError } = await this.client.auth.getSession();
      
      // Test service role authentication by trying to access user management
      const { data: usersData, error: usersError } = await this.serviceClient.auth.admin.listUsers();
      
      if (usersError && !usersError.message.includes('not found')) {
        throw usersError;
      }
      
      this.healthStatus.authentication = true;
      console.log('✅ Authentication test passed');
      return { success: true };
    } catch (error) {
      this.healthStatus.authentication = false;
      console.error('❌ Authentication test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test required tables
  async testTables() {
    const requiredTables = [
      'projects',
      'hero_sections', 
      'showreels',
      'media_files',
      'admin_users',
      'admin_activity'
    ];

    const tableResults = {};
    let allTablesExist = true;

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await this.serviceClient
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }

        tableResults[tableName] = { exists: true, accessible: true };
        console.log(`✅ Table '${tableName}' exists and is accessible`);
      } catch (error) {
        tableResults[tableName] = { 
          exists: false, 
          accessible: false, 
          error: error.message 
        };
        allTablesExist = false;
        console.error(`❌ Table '${tableName}' issue:`, error.message);
      }
    }

    this.healthStatus.tables = allTablesExist;
    return { success: allTablesExist, tables: tableResults };
  }

  // Test storage buckets
  async testStorage() {
    const requiredBuckets = ['projects', 'media', 'thumbnails'];
    const bucketResults = {};
    let allBucketsReady = true;

    for (const bucketName of requiredBuckets) {
      try {
        // List files in bucket (should work even if empty)
        const { data, error } = await this.serviceClient.storage
          .from(bucketName)
          .list('', { limit: 1 });

        if (error) {
          throw error;
        }

        bucketResults[bucketName] = { exists: true, accessible: true };
        console.log(`✅ Storage bucket '${bucketName}' is accessible`);
      } catch (error) {
        bucketResults[bucketName] = { 
          exists: false, 
          accessible: false, 
          error: error.message 
        };
        allBucketsReady = false;
        console.error(`❌ Storage bucket '${bucketName}' issue:`, error.message);
      }
    }

    this.healthStatus.storage = allBucketsReady;
    return { success: allBucketsReady, buckets: bucketResults };
  }

  // Test realtime subscriptions
  async testRealtime() {
    try {
      // Test realtime connection
      const channel = this.client.channel('health_check')
        .on('*', { event: '*', schema: 'public' }, (payload) => {
          console.log('Realtime event received:', payload);
        })
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      // Wait a moment for connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Cleanup
      await this.client.removeChannel(channel);
      
      this.healthStatus.realtime = true;
      console.log('✅ Realtime connection test passed');
      return { success: true };
    } catch (error) {
      this.healthStatus.realtime = false;
      console.error('❌ Realtime test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Create missing tables
  async createMissingTables() {
    const tableCreationSQL = {
      projects: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          category VARCHAR(50),
          thumbnail_url TEXT,
          project_url TEXT NOT NULL,
          platform VARCHAR(20),
          tags TEXT[],
          is_featured BOOLEAN DEFAULT FALSE,
          client_name VARCHAR(100),
          completion_date TIMESTAMP,
          created_by UUID,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
      hero_sections: `
        CREATE TABLE IF NOT EXISTS hero_sections (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          subtitle VARCHAR(200),
          background_type VARCHAR(10) CHECK (background_type IN ('image', 'video')),
          background_value TEXT NOT NULL,
          cta_text VARCHAR(50),
          cta_link TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
      showreels: `
        CREATE TABLE IF NOT EXISTS showreels (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          youtube_url TEXT NOT NULL,
          thumbnail_url TEXT,
          category VARCHAR(50),
          is_featured BOOLEAN DEFAULT FALSE,
          duration INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
      media_files: `
        CREATE TABLE IF NOT EXISTS media_files (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_type VARCHAR(20),
          file_size BIGINT,
          mime_type VARCHAR(100),
          category VARCHAR(50),
          alt_text TEXT,
          description TEXT,
          title VARCHAR(200),
          uploaded_by UUID,
          upload_ip INET,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
      admin_users: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(100),
          role VARCHAR(20) DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
      admin_activity: `
        CREATE TABLE IF NOT EXISTS admin_activity (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES admin_users(id),
          action VARCHAR(100) NOT NULL,
          details JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    };

    const creationResults = {};

    for (const [tableName, sql] of Object.entries(tableCreationSQL)) {
      try {
        const { data, error } = await this.serviceClient.rpc('exec_sql', { sql });
        
        if (error) {
          throw error;
        }

        creationResults[tableName] = { created: true };
        console.log(`✅ Table '${tableName}' created successfully`);
      } catch (error) {
        creationResults[tableName] = { created: false, error: error.message };
        console.error(`❌ Failed to create table '${tableName}':`, error.message);
      }
    }

    return creationResults;
  }

  // Create missing storage buckets
  async createMissingBuckets() {
    const buckets = [
      { name: 'projects', public: true },
      { name: 'media', public: true },
      { name: 'thumbnails', public: true }
    ];

    const creationResults = {};

    for (const bucket of buckets) {
      try {
        const { data, error } = await this.serviceClient.storage
          .createBucket(bucket.name, { public: bucket.public });

        if (error && !error.message.includes('already exists')) {
          throw error;
        }

        creationResults[bucket.name] = { created: true };
        console.log(`✅ Storage bucket '${bucket.name}' ready`);
      } catch (error) {
        creationResults[bucket.name] = { created: false, error: error.message };
        console.error(`❌ Failed to create bucket '${bucket.name}':`, error.message);
      }
    }

    return creationResults;
  }

  // Comprehensive health check
  async runFullHealthCheck() {
    console.log('🔍 Starting Comprehensive Supabase Health Check');
    console.log('================================================\n');

    const results = {
      timestamp: new Date().toISOString(),
      overall: false,
      details: {}
    };

    // Initialize
    const initResult = await this.initialize();
    results.details.initialization = { success: initResult };

    if (!initResult) {
      results.overall = false;
      return results;
    }

    // Run all tests
    const tests = [
      { name: 'connection', method: this.testConnection },
      { name: 'authentication', method: this.testAuthentication },
      { name: 'tables', method: this.testTables },
      { name: 'storage', method: this.testStorage },
      { name: 'realtime', method: this.testRealtime }
    ];

    for (const test of tests) {
      console.log(`\nTesting ${test.name}...`);
      try {
        const result = await test.method.call(this);
        results.details[test.name] = result;
      } catch (error) {
        results.details[test.name] = { success: false, error: error.message };
      }
    }

    // Calculate overall health
    const successfulTests = Object.values(results.details).filter(r => r.success).length;
    const totalTests = Object.keys(results.details).length;
    results.overall = successfulTests === totalTests;

    console.log('\n🏁 Health Check Complete');
    console.log('========================');
    console.log(`Overall Health: ${results.overall ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    console.log(`Successful Tests: ${successfulTests}/${totalTests}`);

    return results;
  }
}

// Export for use in other files
export default SupabaseHealthChecker;

// Run health check if called directly
if (typeof window === 'undefined' && require.main === module) {
  const checker = new SupabaseHealthChecker();
  checker.runFullHealthCheck().then(results => {
    console.log('\n📊 Final Results:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.overall ? 0 : 1);
  }).catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}