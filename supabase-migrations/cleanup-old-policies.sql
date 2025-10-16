-- ========================================
-- CLEANUP OLD RLS POLICIES
-- ========================================
-- This script removes the insecure INSERT/UPDATE/DELETE policies
-- that were created from the old migration file.
-- 
-- WHY: Those policies had WITH CHECK (true) and USING (true)
-- which allows ANY user (even anonymous) to insert/update/delete codes.
-- 
-- The service_role key bypasses RLS anyway, so these policies
-- only created a security vulnerability.
-- ========================================

-- Drop the old insecure policies
DROP POLICY IF EXISTS "Service role can insert verification codes" ON password_verification_codes;
DROP POLICY IF EXISTS "Service role can update verification codes" ON password_verification_codes;
DROP POLICY IF EXISTS "Service role can delete verification codes" ON password_verification_codes;

-- Verify only the secure SELECT policy remains
-- Run this query to confirm:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'password_verification_codes';
-- 
-- Expected result: Only 1 policy should exist:
-- "Users can view their own verification codes" | SELECT

-- ========================================
-- RESULT AFTER RUNNING THIS SCRIPT:
-- ========================================
-- ✅ SELECT policy: "Users can view their own verification codes" (KEEP - secure)
-- ❌ INSERT policy: REMOVED (was insecure, service_role doesn't need it)
-- ❌ UPDATE policy: REMOVED (was insecure, service_role doesn't need it)  
-- ❌ DELETE policy: REMOVED (was insecure, service_role doesn't need it)
-- 
-- Your API routes using SUPABASE_SERVICE_ROLE_KEY will continue to work
-- because service_role bypasses ALL RLS policies.
-- ========================================
