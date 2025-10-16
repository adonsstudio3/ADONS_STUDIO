-- Enable Realtime for Projects Table
-- Run this in your Supabase SQL Editor

-- 1. Enable realtime for the projects table
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- 2. Grant necessary permissions for anonymous users to subscribe (read-only)
GRANT SELECT ON projects TO anon;
GRANT SELECT ON projects TO authenticated;

-- Note: This only allows reading realtime updates, not modifying data
-- Admin operations still require authentication via API routes
