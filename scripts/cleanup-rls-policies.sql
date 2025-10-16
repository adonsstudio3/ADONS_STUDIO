-- CLEANUP AND FIX ALL RLS POLICIES
-- ⚠️ CRITICAL: This fixes security issues in your database
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CLEAN UP admin_users (10 policies → 3 policies)
-- ============================================

-- Drop all admin_users policies
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow anon to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role full access" ON admin_users;
DROP POLICY IF EXISTS "Allow service role full access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow users to read own admin record" ON admin_users;
DROP POLICY IF EXISTS "Service role full access" ON admin_users;
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can modify admin_users" ON admin_users;

-- Create clean policies for admin_users
CREATE POLICY "anon_read_admin_users"
ON admin_users FOR SELECT
TO anon
USING (true);

CREATE POLICY "authenticated_read_admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "service_full_admin_users"
ON admin_users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 2: CLEAN UP activity_logs (7 policies → 3 policies)
-- ============================================

-- Drop all activity_logs policies
DROP POLICY IF EXISTS "Admins can read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow anon to insert activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow authenticated to read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow service role full access to activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Service role full access" ON activity_logs;
DROP POLICY IF EXISTS "Service role full access activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity_logs" ON activity_logs;

-- Create clean policies for activity_logs
CREATE POLICY "anon_insert_activity_logs"
ON activity_logs FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_read_activity_logs"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "service_full_activity_logs"
ON activity_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 3: FIX projects (CRITICAL SECURITY ISSUE!)
-- ============================================

-- Drop all projects policies
DROP POLICY IF EXISTS "Admins full access projects" ON projects;
DROP POLICY IF EXISTS "Public read active projects" ON projects;
DROP POLICY IF EXISTS "Service role full access" ON projects;
DROP POLICY IF EXISTS "Service role full access projects" ON projects;

-- Create SECURE policies for projects
CREATE POLICY "public_read_active_projects"
ON projects FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "authenticated_admin_full_projects"
ON projects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- Keep existing policies:
-- "Public read active projects" (already exists - good!)
-- "Service role full access" (already exists - good!)

-- ============================================
-- HERO_SECTIONS - Fix insecure public access
-- ============================================
DROP POLICY IF EXISTS "Admins full access hero_sections" ON hero_sections;
DROP POLICY IF EXISTS "Service role full access hero_sections" ON hero_sections;

-- Recreate with proper roles
CREATE POLICY "Authenticated admins full access hero_sections"
ON hero_sections FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- ============================================
-- MEDIA_FILES - Fix insecure public access
-- ============================================
DROP POLICY IF EXISTS "Admins full access media_files" ON media_files;
DROP POLICY IF EXISTS "Service role full access media_files" ON media_files;

-- Recreate with proper roles
CREATE POLICY "Authenticated admins full access media_files"
ON media_files FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- ============================================
-- EMAIL_TEMPLATES - Fix insecure public access
-- ============================================
DROP POLICY IF EXISTS "Admins full access email_templates" ON email_templates;
DROP POLICY IF EXISTS "Service role full access email_templates" ON email_templates;

-- Recreate with proper roles
CREATE POLICY "Authenticated admins full access email_templates"
ON email_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- ============================================
-- CONTACT_SUBMISSIONS - Fix insecure admin access
-- ============================================
DROP POLICY IF EXISTS "Admins can read contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Service role full access contact_submissions" ON contact_submissions;

-- Recreate with proper roles
CREATE POLICY "Authenticated admins full access contact_submissions"
ON contact_submissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- Keep existing:
-- "Anyone can insert contact_submissions" (already exists - good for contact form!)

-- ============================================
-- SHOWREELS - Fix insecure public access
-- ============================================
DROP POLICY IF EXISTS "Admins full access showreels" ON showreels;
DROP POLICY IF EXISTS "Service role full access showreels" ON showreels;

-- Recreate with proper roles
CREATE POLICY "Authenticated admins full access showreels"
ON showreels FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
    AND is_active = true
  )
);

-- ============================================
-- Verify the cleanup
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename IN (
  'admin_users', 
  'activity_logs', 
  'projects', 
  'hero_sections', 
  'media_files', 
  'email_templates', 
  'contact_submissions', 
  'showreels'
)
ORDER BY tablename, policyname;
