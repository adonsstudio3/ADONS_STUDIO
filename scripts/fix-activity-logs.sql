-- Fix activity_logs table and RLS policies
-- Run this in Supabase SQL Editor

-- First, let's see what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activity_logs';

-- If table doesn't exist or needs fixing, create/alter it
DO $$ 
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_logs') THEN
    -- Create new table
    CREATE TABLE activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action TEXT NOT NULL,
      details JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Create indexes (will skip if they exist)
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon to insert activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow authenticated to read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow service role full access to activity_logs" ON activity_logs;

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anon users to insert activity logs (for API logging)
CREATE POLICY "Allow anon to insert activity_logs"
ON activity_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to read activity logs
CREATE POLICY "Allow authenticated to read activity_logs"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow service role to manage activity logs
CREATE POLICY "Allow service role full access to activity_logs"
ON activity_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON activity_logs TO anon;
GRANT SELECT ON activity_logs TO authenticated;
GRANT ALL ON activity_logs TO service_role;

-- Verify the policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'activity_logs';
