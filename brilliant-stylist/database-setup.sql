-- Brilliant Stylist Database Setup
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Styling Challenges Table
CREATE TABLE styling_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  category TEXT, -- e.g., 'casual', 'formal', 'party', 'work'
  theme TEXT, -- e.g., 'summer', 'winter', 'vintage', 'modern'
  budget_limit INTEGER,
  time_limit_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on styling_challenges
ALTER TABLE styling_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for styling_challenges (public read, admin write)
CREATE POLICY "Anyone can view active challenges" ON styling_challenges
  FOR SELECT USING (is_active = true);

-- User Game Progress Table
CREATE TABLE user_game_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES styling_challenges(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'failed'
  score INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on user_game_progress
ALTER TABLE user_game_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_game_progress
CREATE POLICY "Users can view their own progress" ON user_game_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_game_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_game_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Outfits Table (for saving user-created outfits)
CREATE TABLE user_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES styling_challenges(id) ON DELETE SET NULL,
  name TEXT,
  description TEXT,
  outfit_data JSONB, -- Store outfit items, colors, etc.
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_outfits
ALTER TABLE user_outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_outfits
CREATE POLICY "Users can view public outfits" ON user_outfits
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own outfits" ON user_outfits
  FOR ALL USING (auth.uid() = user_id);

-- Insert some sample challenges
INSERT INTO styling_challenges (title, description, difficulty_level, category, theme, budget_limit, time_limit_minutes) VALUES
('Summer Beach Day', 'Create a stylish beach outfit that''s both comfortable and fashionable', 1, 'casual', 'summer', 150, 10),
('Business Meeting', 'Design a professional outfit for an important business meeting', 3, 'formal', 'professional', 300, 15),
('Date Night', 'Create a romantic outfit for a special date night', 2, 'party', 'romantic', 200, 12),
('Weekend Brunch', 'Style a chic outfit for a weekend brunch with friends', 1, 'casual', 'weekend', 120, 8),
('Winter Party', 'Design a warm yet stylish outfit for a winter party', 4, 'party', 'winter', 250, 15);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 