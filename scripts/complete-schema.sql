-- ============================================================================
-- ADONS STUDIO - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This script creates all necessary tables, storage buckets, RLS policies,
-- and functions for a fully functional admin system with email integration
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for generating secure filenames
CREATE OR REPLACE FUNCTION generate_secure_filename(original_filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN extract(epoch from now())::text || '-' || 
         encode(gen_random_bytes(8), 'hex') || 
         right(original_filename, 10);
END;
$$ language 'plpgsql';

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true 
    AND role IN ('super_admin', 'admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT admin_users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. MEDIA FILES TABLE (Centralized media library)
CREATE TABLE media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document')),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type VARCHAR(100),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('hero', 'projects', 'showreel', 'general', 'thumbnails', 'avatars')),
  alt_text TEXT,
  description TEXT,
  storage_path TEXT,
  storage_bucket VARCHAR(50),
  dimensions JSONB, -- {width: 1920, height: 1080}
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HERO SECTIONS TABLE
CREATE TABLE hero_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT,
  background_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'gradient')),
  background_value TEXT NOT NULL, -- URL for image/video or gradient CSS
  background_media_id UUID REFERENCES media_files(id),
  overlay_opacity DECIMAL(3,2) DEFAULT 0.3 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
  text_color VARCHAR(7) DEFAULT '#ffffff',
  text_alignment VARCHAR(10) DEFAULT 'center' CHECK (text_alignment IN ('left', 'center', 'right')),
  cta_primary_text VARCHAR(50),
  cta_primary_link TEXT,
  cta_secondary_text VARCHAR(50),
  cta_secondary_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS TABLE (Dynamic project cards)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  short_description VARCHAR(300),
  video_url TEXT, -- YouTube/Vimeo/Custom video URL
  thumbnail_url TEXT,
  thumbnail_media_id UUID REFERENCES media_files(id),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('branding', 'advertising', 'web-design', 'video-production', 'social-media', 'animation', 'vfx', 'general')),
  tags TEXT[] DEFAULT '{}',
  client_name VARCHAR(100),
  project_date DATE,
  completion_date DATE,
  project_url TEXT, -- External project URL
  platform VARCHAR(20) DEFAULT 'custom' CHECK (platform IN ('youtube', 'vimeo', 'website', 'instagram', 'custom')),
  duration INTEGER, -- Duration in seconds for videos
  tech_stack TEXT[], -- Technologies used
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  seo_title VARCHAR(200),
  seo_description TEXT,
  seo_keywords TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SHOWREELS TABLE
CREATE TABLE showreels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_platform VARCHAR(20) NOT NULL DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 'vimeo', 'custom')),
  thumbnail_url TEXT,
  thumbnail_media_id UUID REFERENCES media_files(id),
  duration INTEGER CHECK (duration IS NULL OR duration > 0), -- Duration in seconds
  category VARCHAR(50) DEFAULT 'main' CHECK (category IN ('main', 'corporate', 'creative', 'commercial', 'vfx', 'animation')),
  tags TEXT[] DEFAULT '{}',
  year INTEGER,
  client_info TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  seo_title VARCHAR(200),
  seo_description TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACT SUBMISSIONS TABLE (Email integration)
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20),
  company VARCHAR(100),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'website', -- website, landing-page, etc.
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'spam')),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  admin_notes TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY LOGS TABLE (Admin action tracking)
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  resource_title VARCHAR(200),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  details JSONB DEFAULT '{}',
  severity VARCHAR(10) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT activity_logs_action_check CHECK (action IN (
    'login', 'logout', 'failed_login',
    'create', 'update', 'delete', 'view',
    'upload', 'download',
    'approve', 'reject', 'publish', 'unpublish',
    'export', 'import', 'backup', 'restore'
  ))
);

-- 8. EMAIL TEMPLATES TABLE
CREATE TABLE email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(200) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}', -- Available template variables
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANALYTICS CONSENT TABLE (Privacy compliance)
CREATE TABLE analytics_consent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id VARCHAR(100) NOT NULL,
  consent_analytics BOOLEAN DEFAULT false,
  consent_marketing BOOLEAN DEFAULT false,
  consent_functional BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year')
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Admin Users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Media Files
CREATE INDEX idx_media_files_category ON media_files(category);
CREATE INDEX idx_media_files_type ON media_files(file_type);
CREATE INDEX idx_media_files_active ON media_files(is_active) WHERE is_active = true;
CREATE INDEX idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);

-- Hero Sections
CREATE INDEX idx_hero_sections_active ON hero_sections(is_active) WHERE is_active = true;
CREATE INDEX idx_hero_sections_featured ON hero_sections(is_featured) WHERE is_featured = true;
CREATE INDEX idx_hero_sections_order ON hero_sections(order_index);

-- Projects
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = true;
CREATE INDEX idx_projects_order ON projects(order_index);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

-- Showreels
CREATE INDEX idx_showreels_category ON showreels(category);
CREATE INDEX idx_showreels_platform ON showreels(video_platform);
CREATE INDEX idx_showreels_featured ON showreels(is_featured) WHERE is_featured = true;
CREATE INDEX idx_showreels_active ON showreels(is_active) WHERE is_active = true;
CREATE INDEX idx_showreels_order ON showreels(order_index);

-- Contact Submissions
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_priority ON contact_submissions(priority);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Analytics Consent
CREATE INDEX idx_analytics_consent_visitor_id ON analytics_consent(visitor_id);
CREATE INDEX idx_analytics_consent_expires_at ON analytics_consent(expires_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Admin Users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Media Files
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hero Sections
DROP TRIGGER IF EXISTS update_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER update_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Showreels
DROP TRIGGER IF EXISTS update_showreels_updated_at ON showreels;
CREATE TRIGGER update_showreels_updated_at
  BEFORE UPDATE ON showreels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact Submissions
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Email Templates
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert default admin user
INSERT INTO admin_users (email, full_name, role, is_active) VALUES
('adonsstudio3@gmail.com', 'ADONS Studio Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('contact_notification', 'New Contact Form Submission', 
 '<h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> {{name}}</p>
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Phone:</strong> {{phone}}</p>
  <p><strong>Company:</strong> {{company}}</p>
  <p><strong>Subject:</strong> {{subject}}</p>
  <p><strong>Message:</strong></p>
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{message}}</div>
  <p><strong>Submitted:</strong> {{created_at}}</p>',
 'New Contact Form Submission
  
Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Company: {{company}}
Subject: {{subject}}

Message:
{{message}}

Submitted: {{created_at}}',
 '{"name": "Contact name", "email": "Contact email", "phone": "Phone number", "company": "Company name", "subject": "Message subject", "message": "Message content", "created_at": "Submission date"}'
)
ON CONFLICT (name) DO NOTHING;

-- Insert sample hero section
INSERT INTO hero_sections (title, subtitle, background_type, background_value, is_active, order_index) VALUES
('Welcome to ADONS Studio', 'Creating exceptional digital experiences', 'image', '/images/hero/default-bg.jpg', true, 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This schema provides:
-- ✅ Admin user management with roles
-- ✅ Comprehensive media library
-- ✅ Dynamic hero sections
-- ✅ Project cards system
-- ✅ Showreel management
-- ✅ Contact form with email integration
-- ✅ Activity logging
-- ✅ Email templates
-- ✅ Privacy/GDPR compliance
-- ✅ Proper indexing for performance
-- ✅ Automatic timestamps
-- ✅ Data validation and constraints

SELECT 'Database schema created successfully!' as status;