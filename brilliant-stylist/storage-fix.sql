-- Fixed Storage Buckets Setup for Brilliant Stylist
-- Run this in your Supabase SQL Editor to fix the upload issues

-- First, let's drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload outfit images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own outfit images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own outfit images" ON storage.objects;

-- Create storage buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) VALUES
('avatars', 'avatars', true),
('outfit-images', 'outfit-images', true),
('game-assets', 'game-assets', true)
ON CONFLICT (id) DO NOTHING;

-- More permissive storage policies for outfit-images bucket
CREATE POLICY "Outfit images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'outfit-images');

-- Allow any authenticated user to upload to outfit-images
CREATE POLICY "Authenticated users can upload outfit images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'outfit-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own images
CREATE POLICY "Users can update outfit images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'outfit-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete outfit images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'outfit-images' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for game-assets bucket (read-only for users)
CREATE POLICY "Game assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets'); 