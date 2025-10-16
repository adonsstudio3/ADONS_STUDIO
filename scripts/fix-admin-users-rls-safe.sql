-- Fix admin_users RLS policies to stop 500 errors (SAFE VERSION - No RLS disabling)
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (can be done while RLS is enabled)
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role full access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow anon to read admin_users" ON admin_users;

-- Ensure RLS is enabled (no harm if already enabled)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anon users to read admin_users (for API checks)
-- This is what fixes the 500 errors!
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

-- Grant permissions to all roles
GRANT SELECT ON admin_users TO anon;
GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;

-- Verify the policies are working
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'admin_users';
