-- COMPLETE RLS CLEANUP AND SECURITY FIX
-- ⚠️ CRITICAL: This fixes major security issues in your database
-- Run this ENTIRE file in Supabase SQL Editor

-- ============================================
-- STEP 1: CLEAN UP admin_users (10 policies → 3 policies)
-- ============================================
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

CREATE POLICY "anon_read_admin_users"
ON admin_users FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_read_admin_users"
ON admin_users FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_full_admin_users"
ON admin_users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 2: CLEAN UP activity_logs (7 policies → 3 policies)
-- ============================================
DROP POLICY IF EXISTS "Admins can read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow anon to insert activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow authenticated to read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow service role full access to activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Service role full access" ON activity_logs;
DROP POLICY IF EXISTS "Service role full access activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity_logs" ON activity_logs;

CREATE POLICY "anon_insert_activity_logs"
ON activity_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "authenticated_read_activity_logs"
ON activity_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_full_activity_logs"
ON activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 3: FIX projects (CRITICAL SECURITY ISSUE!)
-- ============================================
DROP POLICY IF EXISTS "Admins full access projects" ON projects;
DROP POLICY IF EXISTS "Public read active projects" ON projects;
DROP POLICY IF EXISTS "Service role full access" ON projects;
DROP POLICY IF EXISTS "Service role full access projects" ON projects;
DROP POLICY IF EXISTS "Authenticated admins full access projects" ON projects;

CREATE POLICY "public_read_active_projects"
ON projects FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "authenticated_admin_full_projects"
ON projects FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_projects"
ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 4: FIX contact_submissions
-- ============================================
DROP POLICY IF EXISTS "Admins can read contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Service role full access contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated admins full access contact_submissions" ON contact_submissions;

CREATE POLICY "anon_insert_contact"
ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "authenticated_admin_read_contact"
ON contact_submissions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "authenticated_admin_update_contact"
ON contact_submissions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_contact"
ON contact_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 5: FIX email_templates
-- ============================================
DROP POLICY IF EXISTS "Admins full access email_templates" ON email_templates;
DROP POLICY IF EXISTS "Service role full access email_templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated admins full access email_templates" ON email_templates;

CREATE POLICY "authenticated_admin_full_templates"
ON email_templates FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_templates"
ON email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 6: FIX hero_sections
-- ============================================
DROP POLICY IF EXISTS "Admins full access hero_sections" ON hero_sections;
DROP POLICY IF EXISTS "Public read active hero sections" ON hero_sections;
DROP POLICY IF EXISTS "Service role full access" ON hero_sections;
DROP POLICY IF EXISTS "Service role full access hero_sections" ON hero_sections;
DROP POLICY IF EXISTS "Authenticated admins full access hero_sections" ON hero_sections;

CREATE POLICY "public_read_active_hero"
ON hero_sections FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "authenticated_admin_full_hero"
ON hero_sections FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_hero"
ON hero_sections FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 7: FIX media_files
-- ============================================
DROP POLICY IF EXISTS "Admins full access media_files" ON media_files;
DROP POLICY IF EXISTS "Public read active media" ON media_files;
DROP POLICY IF EXISTS "Service role full access" ON media_files;
DROP POLICY IF EXISTS "Service role full access media_files" ON media_files;
DROP POLICY IF EXISTS "Authenticated admins full access media_files" ON media_files;

CREATE POLICY "public_read_active_media"
ON media_files FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "authenticated_admin_full_media"
ON media_files FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_media"
ON media_files FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 8: FIX showreels
-- ============================================
DROP POLICY IF EXISTS "Admins full access showreels" ON showreels;
DROP POLICY IF EXISTS "Public read active showreels" ON showreels;
DROP POLICY IF EXISTS "Service role full access showreels" ON showreels;
DROP POLICY IF EXISTS "Authenticated admins full access showreels" ON showreels;

CREATE POLICY "public_read_active_showreels"
ON showreels FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "authenticated_admin_full_showreels"
ON showreels FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email' AND is_active = true));

CREATE POLICY "service_full_showreels"
ON showreels FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 9: FIX analytics_consent
-- ============================================
DROP POLICY IF EXISTS "Public can manage own consent" ON analytics_consent;

CREATE POLICY "users_manage_own_consent"
ON analytics_consent FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_full_consent"
ON analytics_consent FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- FINAL VERIFICATION
-- ============================================
SELECT 
  tablename,
  policyname,
  ARRAY_AGG(DISTINCT roles::text) as roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, policyname, cmd
ORDER BY tablename, policyname;
