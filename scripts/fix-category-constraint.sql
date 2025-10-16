-- Fix media_files category constraint to include 'hero-backgrounds'
ALTER TABLE media_files
  DROP CONSTRAINT IF EXISTS media_files_category_check,
  ADD CONSTRAINT media_files_category_check
    CHECK (category IN ('hero', 'projects', 'showreel', 'general', 'thumbnails', 'avatars', 'hero-backgrounds'));

-- Also ensure all buckets have proper public access
-- Note: Run this in your Supabase SQL Editor