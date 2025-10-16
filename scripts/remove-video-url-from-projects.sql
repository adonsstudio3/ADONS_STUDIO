-- Migration: Remove video_url from projects table
-- Date: 2025-10-14
-- Reason: Replaced with project_url which is more flexible

-- Drop the video_url column from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS video_url;

-- Note: video_url is still used in the showreels table for the hero showreel video
-- This only removes it from the projects table where it's no longer needed
