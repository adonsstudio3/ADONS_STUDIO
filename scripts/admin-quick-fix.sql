-- ============================================================================
-- ADMIN SETUP - QUICK FIX SCRIPT
-- ============================================================================
-- Run this script to fix the admin login issues
-- ============================================================================

-- 1. First create the admin user in Supabase Auth (do this manually in dashboard)
-- Go to Authentication → Users → Add user
-- Email: adonsstudio3@gmail.com
-- Password: YourChosenPassword123!
-- Email Confirm: Yes

-- 2. Then run this SQL to link the user to admin_users table
-- (Replace the user ID with the actual ID from auth.users)
INSERT INTO admin_users (id, email, full_name, role, is_active, created_at)
SELECT 
  id,
  'adonsstudio3@gmail.com',
  'Adons Studio Admin',
  'super_admin',
  true,
  NOW()
FROM auth.users 
WHERE email = 'adonsstudio3@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- 3. Verify the setup
SELECT 
  au.email,
  au.role,
  au.is_active,
  u.email_confirmed_at
FROM admin_users au
JOIN auth.users u ON au.id = u.id
WHERE au.email = 'adonsstudio3@gmail.com';

-- If everything is correct, you should see one row with the admin user