-- ENABLE REALTIME FOR ALL TABLES
-- Run this in Supabase SQL Editor AFTER running COMPLETE-RLS-FIX.sql

-- ============================================
-- STEP 1: Enable Realtime Publication
-- ============================================

-- Note: These commands will show warnings if tables aren't in publication yet
-- That's OK! Just means it's the first time running this.

-- Try to remove tables from publication (ignore errors if not present)
DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE hero_sections;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE showreels;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE media_files;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE contact_submissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE activity_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE admin_users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add tables to publication (fresh start)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE hero_sections;
ALTER PUBLICATION supabase_realtime ADD TABLE showreels;
ALTER PUBLICATION supabase_realtime ADD TABLE media_files;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;

-- ============================================
-- STEP 2: Grant SELECT Permissions for Realtime
-- ============================================

-- Projects - public can subscribe to active projects
GRANT SELECT ON projects TO anon;
GRANT SELECT ON projects TO authenticated;

-- Hero sections - public can subscribe
GRANT SELECT ON hero_sections TO anon;
GRANT SELECT ON hero_sections TO authenticated;

-- Showreels - public can subscribe
GRANT SELECT ON showreels TO anon;
GRANT SELECT ON showreels TO authenticated;

-- Media files - public can subscribe
GRANT SELECT ON media_files TO anon;
GRANT SELECT ON media_files TO authenticated;

-- Contact submissions - only authenticated can subscribe
GRANT SELECT ON contact_submissions TO authenticated;

-- Activity logs - only authenticated can subscribe
GRANT SELECT ON activity_logs TO authenticated;

-- Admin users - both anon and authenticated (for API checks)
GRANT SELECT ON admin_users TO anon;
GRANT SELECT ON admin_users TO authenticated;

-- ============================================
-- STEP 3: Verify Realtime Configuration
-- ============================================

-- Check which tables are in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Check granted permissions
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN (
    'projects',
    'hero_sections', 
    'showreels',
    'media_files',
    'contact_submissions',
    'activity_logs',
    'admin_users'
  )
ORDER BY table_name, grantee;
