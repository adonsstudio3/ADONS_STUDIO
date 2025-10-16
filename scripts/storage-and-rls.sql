-- ============================================================================
-- SUPABASE STORAGE BUCKETS & RLS POLICIES SETUP
-- ============================================================================
-- Run this after the main schema to set up storage and security
-- ============================================================================

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE showreels ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_consent ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ POLICIES (For frontend display)
-- ============================================================================

-- Hero sections - public read for active sections
CREATE POLICY "Public read active hero sections" ON hero_sections FOR SELECT USING (is_active = true);

-- Projects - public read for active and published projects
CREATE POLICY "Public read active projects" ON projects FOR SELECT USING (is_active = true AND status = 'published');

-- Showreels - public read for active showreels
CREATE POLICY "Public read active showreels" ON showreels FOR SELECT USING (is_active = true);

-- Media files - public read for active files
CREATE POLICY "Public read active media" ON media_files FOR SELECT USING (is_active = true);

-- ============================================================================
-- ADMIN FULL ACCESS POLICIES
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role always has access
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- Check if authenticated user is admin
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true 
    AND role IN ('super_admin', 'admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users table
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can read admin_users" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Super admins can modify admin_users" ON admin_users FOR ALL USING (
  auth.role() = 'service_role' OR 
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true)
);

-- Media files
CREATE POLICY "Service role full access media_files" ON media_files FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins full access media_files" ON media_files FOR ALL USING (is_admin());

-- Hero sections
CREATE POLICY "Service role full access hero_sections" ON hero_sections FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins full access hero_sections" ON hero_sections FOR ALL USING (is_admin());

-- Projects
CREATE POLICY "Service role full access projects" ON projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins full access projects" ON projects FOR ALL USING (is_admin());

-- Showreels
CREATE POLICY "Service role full access showreels" ON showreels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins full access showreels" ON showreels FOR ALL USING (is_admin());

-- Contact submissions
CREATE POLICY "Service role full access contact_submissions" ON contact_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can insert contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact_submissions" ON contact_submissions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update contact_submissions" ON contact_submissions FOR UPDATE USING (is_admin());

-- Activity logs
CREATE POLICY "Service role full access activity_logs" ON activity_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can read activity_logs" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- Email templates
CREATE POLICY "Service role full access email_templates" ON email_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins full access email_templates" ON email_templates FOR ALL USING (is_admin());

-- Analytics consent
CREATE POLICY "Public can manage own consent" ON analytics_consent FOR ALL USING (true);

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKETS REFERENCE
-- ============================================================================
-- NOTE: Storage buckets need to be created via Supabase dashboard or API
-- The following are the buckets that should be created:
--
-- 1. hero-media
--    - Public: true
--    - File size limit: 100MB  
--    - Allowed MIME types: image/*, video/*
--
-- 2. project-media
--    - Public: true
--    - File size limit: 50MB
--    - Allowed MIME types: image/*, video/*
--
-- 3. showreel-media
--    - Public: true
--    - File size limit: 50MB
--    - Allowed MIME types: image/*
--
-- 4. general-uploads
--    - Public: false
--    - File size limit: 10MB
--    - Allowed MIME types: image/*, application/pdf
--
-- 5. avatars
--    - Public: true
--    - File size limit: 2MB
--    - Allowed MIME types: image/*

-- ============================================================================
-- STORAGE POLICIES (Managed via Supabase Dashboard)
-- ============================================================================
-- NOTE: Storage policies are managed through the Supabase Dashboard
-- Go to Storage → Policies to set up bucket-specific access rules
-- 
-- Recommended Storage Policies:
-- 1. hero-media: Public read, Admin write/delete
-- 2. project-media: Public read, Admin write/delete  
-- 3. showreel-media: Public read, Admin write/delete
-- 4. general-uploads: Admin only access
-- 5. avatars: Public read, Admin write/delete

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_projects', (SELECT COUNT(*) FROM projects WHERE is_active = true),
    'total_hero_sections', (SELECT COUNT(*) FROM hero_sections WHERE is_active = true),
    'total_showreels', (SELECT COUNT(*) FROM showreels WHERE is_active = true),
    'total_media_files', (SELECT COUNT(*) FROM media_files WHERE is_active = true),
    'pending_contacts', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'),
    'total_contacts', (SELECT COUNT(*) FROM contact_submissions)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_resource_title VARCHAR DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id, action, resource_type, resource_id, resource_title,
    old_values, new_values, details
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_resource_title,
    p_old_values, p_new_values, p_details
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EMAIL NOTIFICATION FUNCTIONS  
-- ============================================================================

-- Function to handle new contact submissions
CREATE OR REPLACE FUNCTION handle_new_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by a Supabase Edge Function
  -- For now, just mark that email needs to be sent
  NEW.email_sent = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new contact submissions
DROP TRIGGER IF EXISTS trigger_new_contact_submission ON contact_submissions;
CREATE TRIGGER trigger_new_contact_submission
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION handle_new_contact_submission();

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'Storage buckets and RLS policies configured successfully!' as status,
       'Remember to create the storage buckets in Supabase dashboard' as reminder;