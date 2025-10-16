-- Fix admin_users table issues
-- Run this in Supabase SQL Editor

-- Check if admin_users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_users'
);

-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role full access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow anon to read admin_users" ON admin_users;

-- Disable RLS temporarily to ensure we can access the table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anon users to read admin_users (for API checks)
CREATE POLICY "Allow anon to read admin_users"
ON admin_users FOR SELECT
TO anon
USING (true);

-- Create policy to allow authenticated users to read admin_users
CREATE POLICY "Allow authenticated users to read admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow service role to manage admin_users
CREATE POLICY "Allow service role full access to admin_users"
ON admin_users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert your admin user if not exists
INSERT INTO admin_users (email, full_name, role, is_active)
VALUES ('adonsstudio3@gmail.com', 'Admin User', 'super_admin', true)
ON CONFLICT (email) DO UPDATE 
SET is_active = true, role = 'super_admin';

-- Grant permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;
