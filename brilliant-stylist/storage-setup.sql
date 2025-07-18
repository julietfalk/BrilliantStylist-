-- Storage Buckets Setup for Brilliant Stylist
-- Run this in your Supabase SQL Editor after the main database setup

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('avatars', 'avatars', true),
('outfit-images', 'outfit-images', true),
('game-assets', 'game-assets', true);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for outfit-images bucket
CREATE POLICY "Outfit images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'outfit-images');

CREATE POLICY "Users can upload outfit images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'outfit-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own outfit images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'outfit-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own outfit images" ON storage.objects
  FOR DELETE USING (bucket_id = 'outfit-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for game-assets bucket (read-only for users)
CREATE POLICY "Game assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets');

-- Only allow admin uploads to game-assets (you can manage this through Supabase dashboard)
CREATE POLICY "Only admins can upload game assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-assets' AND auth.role() = 'service_role'); 