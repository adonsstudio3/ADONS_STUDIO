# SQL Scripts Execution Order

Execute these scripts in the Supabase SQL Editor in the following order:

## 1. Complete Schema (`complete-schema.sql`)
- Creates all database tables and functions
- Adds the `is_admin()` helper function for RLS policies
- Sets up indexes, constraints, and triggers
- **Status**: ✅ Ready to execute

## 2. Storage and RLS Policies (`storage-and-rls.sql`)
- Sets up Row Level Security policies for all tables
- Adds helper functions for contact form handling
- **Status**: ✅ Fixed syntax errors, ready to execute
- **Note**: Storage bucket policies should be configured via Supabase Dashboard

## 3. Default Email Templates (`default-email-templates.sql`)
- Adds email templates for contact form notifications
- **Status**: ✅ Ready to execute
- **Dependency**: Requires `email_templates` table from step 1

## Storage Buckets
The following buckets were already created via the setup script:
- `hero-media` ✅
- `project-media` ✅
- `showreel-media` ✅
- `general-uploads` ✅
- `avatars` ✅

## After SQL Execution
1. Create admin user in Supabase Auth Dashboard:
   - Email: `adonsstudio3@gmail.com`
   - Password: (your choice)
   - Confirm email: Yes

2. Add admin record to `admin_users` table:
   ```sql
   INSERT INTO admin_users (id, email, full_name, role, is_active)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'adonsstudio3@gmail.com'),
     'adonsstudio3@gmail.com',
     'Adons Studio Admin',
     'super_admin',
     true
   );
   ```

3. Test admin panel login at `/admin`