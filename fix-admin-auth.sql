-- SQL commands to fix admin authentication issues
-- These commands should be run in the Supabase SQL Editor

-- Disable RLS on admin_users table to allow service role access
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;  
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;

-- Verify the table structure and data
SELECT * FROM admin_users;

-- Check if service role can access the table
SELECT current_user, session_user;

-- Re-enable RLS but with proper policies for service role
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Add policy that allows service role to access admin_users
CREATE POLICY "service_role_admin_users_policy" ON admin_users
    FOR ALL USING (true);

-- Grant necessary permissions to service role
GRANT ALL ON admin_users TO service_role;