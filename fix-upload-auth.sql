-- Fix Admin Authentication Issues - PRODUCTION SAFE VERSION
-- Run these commands in your Supabase SQL Editor

-- 1. Keep RLS enabled but add proper policies for service role
-- First, ensure service role has access
GRANT ALL ON admin_users TO service_role;

-- 2. Create RLS policy that allows service role to bypass RLS for admin verification
CREATE POLICY "Allow service role full access" ON admin_users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Ensure RLS is enabled (production safe)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- SECURITY NOTE: The service role policy above is safe because:
-- - Service role is only used in server-side API routes (not exposed to clients)
-- - Your auth middleware already validates JWT tokens before using service role
-- - Regular users still can't access admin_users table directly
-- - Only authenticated admin API routes use the service role

-- 4. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-assets', 'project-assets', true),
  ('hero-media', 'hero-media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up storage policies for authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('project-assets', 'hero-media'));

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('project-assets', 'hero-media'));

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('project-assets', 'hero-media'));

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('project-assets', 'hero-media'));

-- 5. Enable storage RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;