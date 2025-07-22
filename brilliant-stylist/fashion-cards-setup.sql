-- Fashion Cards Table Setup for Brilliant Stylist
-- Run this in your Supabase SQL Editor

CREATE TABLE fashion_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  designer TEXT,
  brand TEXT,
  style_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fashion_cards ENABLE ROW LEVEL SECURITY;

-- Public can read cards
CREATE POLICY "Public can read fashion cards" ON fashion_cards
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage fashion cards" ON fashion_cards
  FOR ALL USING (auth.role() = 'service_role'); 